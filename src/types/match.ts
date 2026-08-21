import type { Card } from "@/types/card";
import type { Player } from "@/types/player";

export const MatchPhase = {
  Setup: "SETUP",
  Dealing: "DEALING",
  Playing: "PLAYING",
  Finished: "FINISHED",
} as const;

export type MatchPhase = (typeof MatchPhase)[keyof typeof MatchPhase];

export const MatchEventType = {
  CardCompleted: "CARD_COMPLETED",
  AccusationCorrect: "ACCUSATION_CORRECT",
  AccusationWrong: "ACCUSATION_WRONG",
  MatchWon: "MATCH_WON",
} as const;

export type MatchEventType = (typeof MatchEventType)[keyof typeof MatchEventType];

export interface MatchEvent {
  sequence: number;
  type: MatchEventType;
  playerId: string;
  targetPlayerId: string | null;
  cardId: string | null;
  pointsLost: number;
}

export interface MatchSettings {
  adultContentEnabled: boolean;
  hardContentEnabled: boolean;
  initialHandSize: number;
  penaltyCardCount: number;
  emptyPilePointsLost: number;
}

export interface PendingAccusation {
  accuserId: string;
  accusedId: string;
}

export interface Penalty {
  playerId: string;
  drawnCards: Card[];
  pointsLost: number;
}

export interface Match {
  id: string;
  phase: MatchPhase;
  players: Player[];
  drawPile: Card[];
  slotPile: Card[];
  settings: MatchSettings;
  pendingAccusation: PendingAccusation | null;
  lastPenalty: Penalty | null;
  winnerId: string | null;
  events: MatchEvent[];
  eventSequence: number;
}
