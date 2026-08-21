import { type Match, type MatchEvent, type MatchEventType } from "@/types/match";

interface AppendEventInput {
  type: MatchEventType;
  playerId: string;
  targetPlayerId?: string | null;
  cardId?: string | null;
  pointsLost?: number;
}

export function appendEvent(match: Match, input: AppendEventInput): Match {
  const sequence = match.eventSequence + 1;
  const event: MatchEvent = {
    sequence,
    type: input.type,
    playerId: input.playerId,
    targetPlayerId: input.targetPlayerId ?? null,
    cardId: input.cardId ?? null,
    pointsLost: input.pointsLost ?? 0,
  };

  return { ...match, events: [...match.events, event], eventSequence: sequence };
}
