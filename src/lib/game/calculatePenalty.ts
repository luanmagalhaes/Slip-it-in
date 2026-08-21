import type { Card } from "@/types/card";

interface CalculatePenaltyInput {
  drawPile: readonly Card[];
  penaltyCardCount: number;
  emptyPilePointsLost: number;
}

export interface PenaltyOutcome {
  drawnCards: Card[];
  remainingDrawPile: Card[];
  pointsLost: number;
}

export function calculatePenalty({
  drawPile,
  penaltyCardCount,
  emptyPilePointsLost,
}: CalculatePenaltyInput): PenaltyOutcome {
  const available = Math.min(penaltyCardCount, drawPile.length);
  const missing = penaltyCardCount - available;

  return {
    drawnCards: drawPile.slice(0, available),
    remainingDrawPile: drawPile.slice(available),
    pointsLost: missing > 0 ? missing * emptyPilePointsLost : 0,
  };
}
