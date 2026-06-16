export interface VideogameTitle {
  id: number;
  name: string;
  slug: string;
}

export interface VideogameVersion {
  current: boolean;
  name: string;
}

export interface LiveStream {
  embed_url: string | null;
  language: string;
  main: boolean;
  official: boolean;
  raw_url: string;
}

export interface Tournament {
  begin_at: string | null;
  country: string | null;
  detailed_stats: boolean;
  end_at: string | null;
  has_bracket: boolean;
  id: number;
  league_id: number;
  live_supported: boolean;
  modified_at: string;
  name: string;
  prizepool: string | null;
  region: "AF" | "ASIA" | "EEU" | "ME" | "NA" | "OCE" | "SA" | "WEU" | null;
  serie_id: number;
  slug: string;
  tier: "a" | "b" | "c" | "d" | "s" | "unranked" | null;
  type: "offline" | "online" | "online/offline" | null;
  winner_id: number;
  winner_type: "Player" | "Team" | null;
}

export interface Serie {
  begin_at: string | null;
  end_at: string | null;
  full_name: string;
  id: number;
  league_id: number;
  modified_at: string;
  name: string | null;
  season: string | null;
  slug: string;
  winner_id: number;
  winner_type: "Player" | "Team" | null;
  year: number | null;
}

export interface MatchPlayer {
  assists: number | null;
  deaths: number | null;
  first_name: string | null;
  headshots: number | null;
  image_url: string | null;
  kills: number | null;
  last_name: string | null;
  name: string;
  nationality: string | null;
  number_of_games: number;
  player_id: number;
  team_id: number;
  slug: string | null;
}

export interface OpponentWrapper {
  opponent: {
    id: number;
    name: string;
    image_url?: string | null;
    [key: string]: any;
  };
  type: "Player" | "Team";
}

export interface LiveConfig {
  opens_at: string | null;
  supported: boolean;
  url: string | null;
}

export interface League {
  id: number;
  image_url: string | null;
  modified_at: string;
  name: string;
  slug: string;
  url: string | null;
}

export interface RoundScore {
  score: number;
  team_id: number;
}

export interface GamePlayerStats {
  adr: number | null;
  assists: number | null;
  deaths: number | null;
  flash_assists: number | null;
  headshots: number | null;
  k_d_diff: number | null;
  kast: number | null;
  kills: number | null;
  player_id: number;
}

export interface Round {
  number: number;
  team_a_score?: number;
  team_b_score?: number;
  winner_team_id?: number | null;
}

export interface Game {
  begin_at: string | null;
  complete: boolean;
  detailed_stats: boolean;
  end_at: string | null;
  finished: boolean;
  forfeit: boolean;
  id: number;
  length: number | null;
  match_id: number;
  players: GamePlayerStats[] | null;
  position: number;
  rounds_score: RoundScore[];
  rounds?: Round[];
  status: "finished" | "not_played" | "not_started" | "running";
  winner: {
    id: number;
    type: "Player" | "Team";
  } | null;
}

export interface MatchResultItem {
  score: number;
  team_id: number;
}

// --- MAIN PARENT OBJECT TYPE ---
export interface CSMatchResponse {
  begin_at: string | null;
  detailed_stats: boolean;
  draw: boolean;
  end_at: string | null;
  forfeit: boolean;
  game_advantage: number | null;
  games: Game[];
  id: number;
  league: League;
  league_id: number;
  live: LiveConfig;
  match_type:
    | "all_games_played"
    | "best_of"
    | "custom"
    | "first_to"
    | "ow_best_of"
    | "red_bull_home_ground";
  modified_at: string;
  name: string;
  number_of_games: number;
  opponents: OpponentWrapper[];
  original_scheduled_at: string | null;
  players: MatchPlayer[];
  rescheduled: boolean | null;
  results: MatchResultItem[];
  scheduled_at: string | null;
  serie: Serie;
  serie_id: number;
  slug: string | null;
  status: "canceled" | "finished" | "not_started" | "postponed" | "running";
  streams_list: LiveStream[];
  tournament: Tournament;
  tournament_id: number;
  videogame_title: VideogameTitle | null;
  videogame_id: number;
  videogame_version: VideogameVersion | null;
  winner: {
    id: number;
    type: "Player" | "Team";
  } | null;
  winner_id: number | null;
  winner_type: "Player" | "Team" | null;
}
