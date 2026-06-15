import axios from "axios";

const BASE_URL = "https://api.pandascore.co/";

interface GetTeamsParams {
  page?: number;
  perPage?: number;
  search?: string;
}

const cache = new Map<string, { data: unknown; expiry: number }>();
const TTL = 5 * 60 * 1000;

function cacheKey(params: GetTeamsParams): string {
  return `${params.page ?? 1}-${params.perPage ?? 25}-${params.search ?? ""}`;
}

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
