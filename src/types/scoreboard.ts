export interface ScoringRules {
  cardCompleted: number;
  accusationCorrect: number;
  accusationWrong: number;
  caught: number;
  matchWon: number;
  emptyPilePenalty: number;
}

export interface ScoreEntry {
  playerId: string;
  name: string;
  points: number;
  matchesPlayed: number;
  matchesWon: number;
  cardsCompleted: number;
  correctAccusations: number;
  timesCaught: number;
}

export interface Scoreboard {
  entries: ScoreEntry[];
  rules: ScoringRules;
}
