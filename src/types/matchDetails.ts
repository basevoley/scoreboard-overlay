export interface Player {
  number: number;
  name: string;
}

export interface SeasonStats {
  ranking: number;
  competitionPoints: number;
  matchesPlayed: number;
  totalMatchesWon: number;
  won3Points: number;
  won2Points: number;
  totalMatchesLost: number;
  lost1Point: number;
  lost0Points: number;
  totalPointsScored: number;
  totalPointsReceived: number;
}

export interface MatchDetails {
  teams: { teamA: string; teamB: string };
  teamLogos: { teamA: string; teamB: string };
  teamColors: { teamA: string; teamB: string };
  matchHeader: string;
  extendedInfo: string;
  stadium: string;
  competitionLogo: string;
  maxSets: number;
  stats: { teamA: SeasonStats; teamB: SeasonStats };
  players: { teamA: Player[]; teamB: Player[] };
}
