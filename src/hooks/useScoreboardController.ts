"use client";

import { useCallback, useSyncExternalStore } from "react";
import { applyOnlineMatch, type OnlineMatchSummary } from "@/lib/scoreboard/applyOnlineMatch";
import {
  clearPlayers,
  removePlayer,
  resetPoints,
  updateRules,
  upsertPlayer,
} from "@/lib/scoreboard/scoreboardOperations";
import {
  scoreboardServerSnapshot,
  scoreboardSnapshot,
  subscribeToScoreboard,
  writeScoreboard,
} from "@/lib/scoreboard/scoreboardStore";
import type { Scoreboard, ScoringRules } from "@/types/scoreboard";

export function useScoreboardController() {
  const scoreboard = useSyncExternalStore(
    subscribeToScoreboard,
    scoreboardSnapshot,
    scoreboardServerSnapshot,
  );

  const mutate = useCallback((change: (current: Scoreboard) => Scoreboard) => {
    writeScoreboard(change(scoreboardSnapshot()));
  }, []);

  return {
    scoreboard,
    addPlayer: useCallback(
      (name: string) => mutate((current) => upsertPlayer(current, name)),
      [mutate],
    ),
    deletePlayer: useCallback(
      (playerId: string) => mutate((current) => removePlayer(current, playerId)),
      [mutate],
    ),
    resetAllPoints: useCallback(() => mutate(resetPoints), [mutate]),
    removeAllPlayers: useCallback(() => mutate(clearPlayers), [mutate]),
    setRules: useCallback(
      (rules: ScoringRules) => mutate((current) => updateRules(current, rules)),
      [mutate],
    ),
    commitMatch: useCallback(
      (summary: OnlineMatchSummary) => mutate((current) => applyOnlineMatch(current, summary)),
      [mutate],
    ),
  };
}
