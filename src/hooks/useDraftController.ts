"use client";

import { useCallback, useMemo, useState } from "react";
import { defaultScoringRules } from "@/lib/scoreboard/scoringRules";
import { maxPlayers, type MatchDraft } from "@/types/draft";
import type { MatchSettings } from "@/types/match";
import { normalizeDisplayName, slugifyName } from "@/utils/slug";

const initialDraft: MatchDraft = {
  settings: {
    adultContentEnabled: false,
    hardContentEnabled: false,
    initialHandSize: 5,
    penaltyCardCount: 1,
    emptyPilePointsLost: defaultScoringRules.emptyPilePenalty,
  },
  players: [],
};

export type AddPlayerResult = "ADDED" | "DUPLICATE" | "FULL" | "EMPTY";

export function useDraftController() {
  const [draft, setDraft] = useState<MatchDraft>(initialDraft);

  const patchSettings = useCallback((patch: Partial<MatchSettings>) => {
    setDraft((current) => ({ ...current, settings: { ...current.settings, ...patch } }));
  }, []);

  const addPlayer = useCallback(
    (rawName: string): AddPlayerResult => {
      const name = normalizeDisplayName(rawName);
      const id = slugifyName(name);

      if (!id) {
        return "EMPTY";
      }

      if (draft.players.length >= maxPlayers) {
        return "FULL";
      }

      if (draft.players.some((player) => player.id === id)) {
        return "DUPLICATE";
      }

      setDraft((current) => ({ ...current, players: [...current.players, { id, name }] }));

      return "ADDED";
    },
    [draft.players],
  );

  const removePlayer = useCallback((id: string) => {
    setDraft((current) => ({
      ...current,
      players: current.players.filter((player) => player.id !== id),
    }));
  }, []);

  const resetDraft = useCallback(() => setDraft(initialDraft), []);

  return useMemo(
    () => ({ draft, patchSettings, addPlayer, removePlayer, resetDraft }),
    [draft, patchSettings, addPlayer, removePlayer, resetDraft],
  );
}
