import type { MatchSettings } from "@/types/match";
import type { PlayerDraft } from "@/types/player";

export interface MatchDraft {
  settings: MatchSettings;
  players: PlayerDraft[];
}

export const maxPlayers = 12;
export const minPlayers = 2;
export const handSizeBounds = { min: 3, max: 8 } as const;
export const penaltyBounds = { min: 1, max: 3 } as const;
