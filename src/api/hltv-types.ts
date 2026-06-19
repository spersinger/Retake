export interface Team {
  name: string;
  id: number;
  rank?: number;
}

export interface Player {
  name: string;
  id: number;
}

export interface HalfResult {
  team1Rounds: number | null;
  team2Rounds: number | null;
}

export interface MapResult {
  team1TotalRounds: number;
  team2TotalRounds: number;
  halfResults: HalfResult[];
}

export interface GameMap {
  name: string;
  result: MapResult;
  statsId?: number;
}

export interface MatchFormat {
  type: "bo1" | "bo3" | "bo5";
  location: "Online" | "LAN";
}

export interface Event {
  name: string;
  id: number;
}

export interface Stream {
  name: string;
  link: string;
  viewers: number;
}

export interface HighlightedPlayers {
  team1: Player;
  team2: Player;
}

export type VetoType = "removed" | "picked" | "leftover";

export interface Veto {
  team?: Team;
  map: string;
  type: VetoType;
}

export type MatchStatus = "Live" | "Finished" | "Upcoming";

export interface Match {
  id: number;
  significance: string;
  team1: Team;
  team2: Team;
  /** Unix timestamp in milliseconds */
  date: number;
  format: MatchFormat;
  event: Event;
  maps: GameMap[];
  players: {
    team1: Player[];
    team2: Player[];
  };
  streams: Stream[];
  status: MatchStatus;
  hasScorebot: boolean;
  highlightedPlayers: HighlightedPlayers;
  headToHead: unknown[];
  vetoes: Veto[];
  highlights: unknown[];
  demos: unknown[];
  odds: unknown[];
}
