export interface SetScore {
  teamA: number;
  teamB: number;
}

export interface MatchEvent {
  timestamp: number;
  type: string | null;
  details: { text: string; team: string } | null;
}

export interface MatchStats {
  ace?: number;
  receptionEffectiveness?: number;
  attackPoint?: number;
  blockPoint?: number;
  selfErrors?: number;
  serviceEffectiveness?: number;
  attackEffectiveness?: number;
  defenseEffectiveness?: number;
  [key: string]: number | undefined;
}

export interface MatchData {
  scores: { teamA: number; teamB: number };
  setsWon: { teamA: number; teamB: number };
  setScores: SetScore[];
  currentServer: 'teamA' | 'teamB' | null;
  ballPossession: 'teamA' | 'teamB' | null;
  matchStarted: boolean;
  timeouts: { teamA: number; teamB: number };
  statistics: { teamA: MatchStats; teamB: MatchStats };
  currentSetStats: { teamA: MatchStats; teamB: MatchStats };
  winner: 'teamA' | 'teamB' | null;
}
