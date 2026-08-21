"use client";

import { useCallback, useMemo, useReducer } from "react";
import { baseDeck } from "@/data/deck";
import { matchReducer, type MatchAction } from "@/lib/game/matchReducer";
import type { MatchSettings } from "@/types/match";
import type { PlayerDraft } from "@/types/player";

export function useMatchController() {
  const [match, dispatch] = useReducer(matchReducer, null);

  const startMatch = useCallback(
    (drafts: readonly PlayerDraft[], settings: MatchSettings, seed: number) => {
      dispatch({ type: "START_MATCH", deck: baseDeck, drafts, settings, seed });
    },
    [],
  );

  const send = useCallback((action: MatchAction) => dispatch(action), []);

  return useMemo(() => ({ match, startMatch, send }), [match, startMatch, send]);
}
