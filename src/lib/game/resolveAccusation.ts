import { appendEvent } from "@/lib/game/appendEvent";
import { calculatePenalty } from "@/lib/game/calculatePenalty";
import { MatchEventType, type Match } from "@/types/match";

export function resolveAccusation(match: Match, wasCorrect: boolean): Match {
  const accusation = match.pendingAccusation;

  if (!accusation) {
    return match;
  }

  const penalizedId = wasCorrect ? accusation.accusedId : accusation.accuserId;
  const penalty = calculatePenalty({
    drawPile: match.drawPile,
    penaltyCardCount: match.settings.penaltyCardCount,
    emptyPilePointsLost: match.settings.emptyPilePointsLost,
  });

  const players = match.players.map((player) =>
    player.id === penalizedId
      ? { ...player, hand: [...player.hand, ...penalty.drawnCards] }
      : player,
  );

  return appendEvent(
    {
      ...match,
      players,
      drawPile: penalty.remainingDrawPile,
      pendingAccusation: null,
      lastPenalty: {
        playerId: penalizedId,
        drawnCards: penalty.drawnCards,
        pointsLost: penalty.pointsLost,
      },
    },
    {
      type: wasCorrect ? MatchEventType.AccusationCorrect : MatchEventType.AccusationWrong,
      playerId: accusation.accuserId,
      targetPlayerId: accusation.accusedId,
      pointsLost: penalty.pointsLost,
    },
  );
}
