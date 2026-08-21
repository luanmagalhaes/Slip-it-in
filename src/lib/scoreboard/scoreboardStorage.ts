import { defaultScoringRules } from "@/lib/scoreboard/scoringRules";
import { readJson, writeJson } from "@/lib/storage/localStorage";
import type { Scoreboard } from "@/types/scoreboard";

const storageKey = "slip-it-in:scoreboard:v1";

export const emptyScoreboard: Scoreboard = { entries: [], rules: defaultScoringRules };

export function loadScoreboard(): Scoreboard {
  const stored = readJson<Scoreboard>(storageKey, emptyScoreboard);

  return {
    entries: Array.isArray(stored.entries) ? stored.entries : [],
    rules: { ...defaultScoringRules, ...stored.rules },
  };
}

export function saveScoreboard(scoreboard: Scoreboard): void {
  writeJson(storageKey, scoreboard);
}
