import { accusePlayer, cancelAccusation } from "@/lib/game/accusePlayer";
import { completeCard } from "@/lib/game/completeCard";
import { createMatch } from "@/lib/game/createMatch";
import { resolveAccusation } from "@/lib/game/resolveAccusation";
import type { Card } from "@/types/card";
import type { Match, MatchSettings } from "@/types/match";
import type { PlayerDraft } from "@/types/player";

export type MatchAction =
  | {
      type: "START_MATCH";
      deck: readonly Card[];
      drafts: readonly PlayerDraft[];
      settings: MatchSettings;
      seed: number;
    }
  | { type: "COMPLETE_CARD"; playerId: string; cardId: string }
  | { type: "START_ACCUSATION"; accuserId: string; accusedId: string }
  | { type: "CANCEL_ACCUSATION" }
  | { type: "RESOLVE_ACCUSATION"; wasCorrect: boolean }
  | { type: "END_MATCH" };

export function matchReducer(state: Match | null, action: MatchAction): Match | null {
  if (action.type === "START_MATCH") {
    return createMatch({
      deck: action.deck,
      drafts: action.drafts,
      settings: action.settings,
      seed: action.seed,
    });
  }

  if (action.type === "END_MATCH") {
    return null;
  }

  if (!state) {
    return state;
  }

  switch (action.type) {
    case "COMPLETE_CARD":
      return completeCard(state, action.playerId, action.cardId);
    case "START_ACCUSATION":
      return accusePlayer(state, action.accuserId, action.accusedId);
    case "CANCEL_ACCUSATION":
      return cancelAccusation(state);
    case "RESOLVE_ACCUSATION":
      return resolveAccusation(state, action.wasCorrect);
    default:
      return state;
  }
}
