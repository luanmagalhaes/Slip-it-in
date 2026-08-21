import { baseDeck } from "@/data/deck";
import { createMatch } from "@/lib/game/createMatch";
import type { Match, MatchSettings } from "@/types/match";
import type { PlayerDraft } from "@/types/player";
import { createSeededRng } from "@/utils/rng";

export const defaultSettings: MatchSettings = {
  adultContentEnabled: false,
  initialHandSize: 5,
  penaltyCardCount: 1,
  emptyPilePointsLost: 1,
};

export function draftsOf(...names: string[]): PlayerDraft[] {
  return names.map((name, index) => ({ id: `p${index + 1}`, name }));
}

export function buildMatch(overrides: Partial<MatchSettings> = {}, names = ["Ana", "Bruno", "Caio"]): Match {
  return createMatch({
    deck: baseDeck,
    drafts: draftsOf(...names),
    settings: { ...defaultSettings, ...overrides },
    rng: createSeededRng(42),
    seed: 42,
  });
}
