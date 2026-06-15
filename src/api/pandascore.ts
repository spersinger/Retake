import axios from "axios";

const BASE_URL = "https://api.pandascore.co";

interface GetTeamsParams {
  page?: number;
  perPage?: number;
  search?: string;
}

export interface GetGamesParams {
  page?: number;
  perPage?: number;
  team_ids?: number | number[]; // Pandascore accepts single IDs or arrays for filters
}

const cache = new Map<string, { data: unknown; expiry: number }>();
const TTL = 5 * 60 * 1000;

function cacheKey(params: GetTeamsParams): string {
  return `${params.page ?? 1}-${params.perPage ?? 25}-${params.search ?? ""}`;
}
function gameCacheKey(params: GetGamesParams): string {
  const teamIdsStr = Array.isArray(params.team_ids)
    ? params.team_ids.join(",")
    : (params.team_ids ?? "");
  return `${params.page ?? 1}-${params.perPage ?? 25}-${teamIdsStr}`;
}

export const getGames = async ({
  page = 1,
  perPage = 50,
  team_ids,
}: GetGamesParams = {}) => {
  // Generate a distinct cache key
  const teamIdsStr = Array.isArray(team_ids)
    ? team_ids.join(",")
    : (team_ids ?? "");
  const key = `games-${page}-${perPage}-${teamIdsStr}`;

  const cached = cache.get(key);
  if (cached && Date.now() < cached.expiry) {
    return cached.data;
  }

  try {
    // 1. Target the main /csgo/matches endpoint instead of /running
    const params: Record<string, any> = {
      page,
      per_page: perPage,
      // CRITICAL: Tells Pandascore to only give us live matches AND future matches
      "filter[status]": "running,not_started",
      // Sort matches so that live ones or soonest ones appear first
      sort: "begin_at",
    };

    // 2. Filter by opponent IDs if provided
    if (team_ids) {
      params["filter[opponent_id]"] = Array.isArray(team_ids)
        ? team_ids.join(",")
        : team_ids.toString();

      params["filter[winner_type]"] = "Team";
    }

    // 3. Make the API request
    const response = await axios.get(`${BASE_URL}/csgo/matches`, {
      headers: {
        Authorization: `Bearer ${process.env.EXPO_PUBLIC_PANDASCORE_TOKEN}`,
        Accept: "application/json",
      },
      params: params,
      paramsSerializer: {
        indexes: null,
      },
    });

    cache.set(key, { data: response.data, expiry: Date.now() + TTL });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios Error Status:", error.response?.status);
      console.error("Axios Error Data:", error.response?.data);
    } else {
      console.error("Error fetching matches:", error);
    }
    return [];
  }
};

export const getTeams = async ({
  page = 1,
  perPage = 25,
  search,
}: GetTeamsParams = {}) => {
  const key = cacheKey({ page, perPage, search });
  const cached = cache.get(key);

  if (cached && Date.now() < cached.expiry) {
    return cached.data;
  }

  try {
    const params: Record<string, string | number> = {
      page,
      per_page: perPage,
      "filter[videogame_id]": 3,
      sort: "-modified_at",
    };

    if (search) {
      params["search[name]"] = search;
    }

    const response = await axios.get(`${BASE_URL}/teams`, {
      headers: {
        Authorization: `Bearer ${process.env.EXPO_PUBLIC_PANDASCORE_TOKEN}`,
      },
      params: params,
    });

    cache.set(key, { data: response.data, expiry: Date.now() + TTL });

    return response.data;
  } catch (error) {
    console.error("Error fetching teams:", error);
    return [];
  }
};
