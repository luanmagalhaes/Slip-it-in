import type { ScoringRules } from "@/types/scoreboard";

export const defaultScoringRules: ScoringRules = {
  cardCompleted: 2,
  accusationCorrect: 3,
  accusationWrong: -2,
  caught: -1,
  matchWon: 5,
  emptyPilePenalty: 1,
};

export const scoringRuleBounds = { min: -10, max: 20 } as const;
