"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  applyMatchToScoreboard,
  clearPlayers,
  removePlayer,
  resetPoints,
  updateRules,
  upsertPlayer,
} from "@/lib/scoreboard/scoreboardOperations";
import { emptyScoreboard, loadScoreboard, saveScoreboard } from "@/lib/scoreboard/scoreboardStorage";
import type { Match } from "@/types/match";
import type { Scoreboard, ScoringRules } from "@/types/scoreboard";

export function useScoreboardController() {
  const [scoreboard, setScoreboard] = useState<Scoreboard>(emptyScoreboard);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setScoreboard(loadScoreboard());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      saveScoreboard(scoreboard);
    }
  }, [scoreboard, hydrated]);

  const addPlayer = useCallback((name: string) => {
    setScoreboard((current) => upsertPlayer(current, name));
  }, []);

  const deletePlayer = useCallback((playerId: string) => {
    setScoreboard((current) => removePlayer(current, playerId));
  }, []);

  const resetAllPoints = useCallback(() => {
    setScoreboard((current) => resetPoints(current));
  }, []);

  const removeAllPlayers = useCallback(() => {
    setScoreboard((current) => clearPlayers(current));
  }, []);

  const setRules = useCallback((rules: ScoringRules) => {
    setScoreboard((current) => updateRules(current, rules));
  }, []);

  const commitMatch = useCallback((match: Match) => {
    setScoreboard((current) => applyMatchToScoreboard(current, match));
  }, []);

  return useMemo(
    () => ({
      scoreboard,
      hydrated,
      addPlayer,
      deletePlayer,
      resetAllPoints,
      removeAllPlayers,
      setRules,
      commitMatch,
    }),
    [
      scoreboard,
      hydrated,
      addPlayer,
      deletePlayer,
      resetAllPoints,
      removeAllPlayers,
      setRules,
      commitMatch,
    ],
  );
}
