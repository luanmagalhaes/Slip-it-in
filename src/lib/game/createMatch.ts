import { dealCards } from "@/lib/game/dealCards";
import { filterDeckByAdultSetting } from "@/lib/game/filterDeckByAdultSetting";
import { shuffleDeck } from "@/lib/game/shuffleDeck";
import type { Card } from "@/types/card";
import { MatchPhase, type Match, type MatchSettings } from "@/types/match";
import type { PlayerDraft } from "@/types/player";
import { createMatchId } from "@/utils/id";
import { systemRng, type RandomNumberGenerator } from "@/utils/rng";

interface CreateMatchInput {
  deck: readonly Card[];
  drafts: readonly PlayerDraft[];
  settings: MatchSettings;
  rng?: RandomNumberGenerator;
  seed?: number;
}

export function createMatch({
  deck,
  drafts,
  settings,
  rng = systemRng,
  seed = 0,
}: CreateMatchInput): Match {
  const eligible = filterDeckByAdultSetting(deck, {
    adultContentEnabled: settings.adultContentEnabled,
    hardContentEnabled: settings.hardContentEnabled,
  });
  const shuffled = shuffleDeck(eligible, rng);
  const { players, drawPile } = dealCards({
    deck: shuffled,
    drafts,
    handSize: settings.initialHandSize,
  });

  return {
    id: createMatchId(seed),
    phase: MatchPhase.Playing,
    players,
    drawPile,
    slotPile: [],
    settings,
    pendingAccusation: null,
    lastPenalty: null,
    winnerId: null,
    events: [],
    eventSequence: 0,
  };
}
