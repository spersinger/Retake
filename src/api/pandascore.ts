import axios from "axios";

const BASE_URL = "https://api.pandascore.co";
const RETAKE_SERVER_BASE_URL =
  process.env.EXPO_PUBLIC_RETAKE_SERVER_URL || "http://localhost:3003";

interface GetTeamsParams {
  page?: number;
  perPage?: number;
  search?: string;
}

export interface GetGamesParams {
  page?: number;
  perPage?: number;
  team_ids?: number | number[]; // Pandascore accepts single IDs or arrays for filters
  day?: number;
}

export interface GetGameParams {
  match_id: number;
}

const cache = new Map<string, { data: unknown; expiry: number }>();
const TTL = 5 * 60 * 1000;

function cacheKey(params: GetTeamsParams): string {
  return `${params.page ?? 1}-${params.perPage ?? 25}-${params.search ?? ""}`;
}

export const getHLTVMatch = async ({ match_id }: GetGameParams) => {
  const key = `${match_id}-hltv`;
  const cached = cache.get(key);
  if (cached && Date.now() < cached.expiry) {
    return cached.data;
  }
  try {
    console.log(`Fetching match ${match_id}`);
    const response = await axios.get(
      `${RETAKE_SERVER_BASE_URL}/matches/pandascore/${match_id}`,
    );

    if (response.data) {
      cache.set(key, { data: response.data, expiry: Date.now() + TTL });
    }
    console.log(`Fetched match ${match_id} from HLTV API`);
    return response.data ?? null;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("HLTV fetch failed:", error.message);
    } else {
      console.error("HLTV fetch failed:", error);
    }
    return null;
  }
};

export const getMatch = async ({ match_id }: GetGameParams) => {
  const key = `${match_id}`;
  const cached = cache.get(key);
  if (cached && Date.now() < cached.expiry) {
    return cached.data;
  }
  try {
    console.log(`Fetching match ${match_id}`);
    const response = await axios.get(`${BASE_URL}/matches/${match_id}`, {
      headers: {
        Authorization: `Bearer ${process.env.EXPO_PUBLIC_PANDASCORE_TOKEN}`,
        Accept: "application/json",
      },
    });
    console.log(response);

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

export const getGames = async ({
  page = 1,
  perPage = 50,
  team_ids,
  day = 0,
}: GetGamesParams = {}) => {
  // Generate a distinct cache key
  const teamIdsStr = Array.isArray(team_ids)
    ? team_ids.join(",")
    : (team_ids ?? "");
  const key = `games-${page}-${perPage}-${teamIdsStr}-${day}`;

  const cached = cache.get(key);
  if (cached && Date.now() < cached.expiry) {
    return cached.data;
  }

  const now = new Date();
  let startOfToday,
    endOfToday = new Date();

  if (day !== 1) {
    startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + day,
      0,
      0,
      0,
      0,
    );

    // 3. Set to 23:59:59.999 in the user's LOCAL timezone
    endOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + day,
      23,
      59,
      59,
      999,
    );
  } else {
    // 2. Set to 00:00:00.000 in the user's LOCAL timezone
    startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + day,
      0,
      0,
      0,
      0,
    );

    // 3. Set to 23:59:59.999 in the user's LOCAL timezone
    endOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 7,
      23,
      59,
      59,
      999,
    );
  }

  try {
    // 1. Target the main /csgo/matches endpoint instead of /running
    const params: Record<string, any> = {
      page,
      per_page: perPage,
      // CRITICAL: Tells Pandascore to only give us live matches AND future matches
      //"range[begin_at]": `${startOfToday},${endOfToday}`,
      "range[begin_at]": `${startOfToday.toISOString()},${endOfToday.toISOString()}`,
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
    console.log(response);

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
