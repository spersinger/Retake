import axios from "axios";

const BASE_URL = "https://api.pandascore.co/";

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
  return `${params.page ?? 1}-${params.perPage ?? 25}-${params.team_ids ?? ""}`;
}

export const getGames = async ({
  page = 1,
  perPage = 50, // Pandascore defaults to 50 for this endpoint
  team_ids,
}: GetGamesParams = {}) => {
  // Generate a distinct cache key matching the running matches parameters
  const key = gameCacheKey({ page, perPage, team_ids });
  const cached = cache.get(key);

  if (cached && Date.now() < cached.expiry) {
    return cached.data;
  }

  try {
    // 1. Build query parameters supported by /matches/running
    const params: Record<string, any> = {
      page,
      per_page: perPage,
    };

    // 2. Filter by opponent IDs if provided
    if (team_ids) {
      // Pandascore filtering expects comma-separated strings for array types: "1,2,3"
      params["filter[opponent_id]"] = Array.isArray(team_ids)
        ? team_ids.join(",")
        : team_ids;

      // Ensure we target teams specifically rather than player matches
      params["filter[winner_type]"] = "Team";
    }

    // 3. Make the API request to the /matches/running endpoint
    const response = await axios.get(`${BASE_URL}/matches/running`, {
      headers: {
        Authorization: `Bearer ${process.env.EXPO_PUBLIC_PANDASCORE_TOKEN}`,
        Accept: "application/json",
      },
      params: params,
    });

    // 4. Cache and return the live match data
    cache.set(key, { data: response.data, expiry: Date.now() + TTL });

    return response.data;
  } catch (error) {
    console.error("Error fetching live matches:", error);
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
