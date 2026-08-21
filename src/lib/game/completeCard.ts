import { appendEvent } from "@/lib/game/appendEvent";
import { checkWinner } from "@/lib/game/checkWinner";
import { MatchEventType, MatchPhase, type Match } from "@/types/match";
import { findById } from "@/utils/collections";

export function completeCard(match: Match, playerId: string, cardId: string): Match {
  const player = findById(match.players, playerId);
  const card = player ? findById(player.hand, cardId) : undefined;

  if (!player || !card) {
    return match;
  }

  const players = match.players.map((current) =>
    current.id === playerId
      ? {
          ...current,
          hand: current.hand.filter((handCard) => handCard.id !== cardId),
          completedCards: [...current.completedCards, card],
        }
      : current,
  );

  const withCard = appendEvent(
    { ...match, players, slotPile: [...match.slotPile, card] },
    { type: MatchEventType.CardCompleted, playerId, cardId },
  );

  const winnerId = checkWinner(players);

  if (!winnerId) {
    return withCard;
  }

  return appendEvent(
    { ...withCard, winnerId, phase: MatchPhase.Finished },
    { type: MatchEventType.MatchWon, playerId: winnerId },
  );
}
