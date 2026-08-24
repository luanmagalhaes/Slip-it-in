import { emptyScoreboard, loadScoreboard, saveScoreboard } from "@/lib/scoreboard/scoreboardStorage";
import type { Scoreboard } from "@/types/scoreboard";

const listeners = new Set<() => void>();

let cached: Scoreboard | null = null;

export function subscribeToScoreboard(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener("storage", listener);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

export function scoreboardSnapshot(): Scoreboard {
  if (!cached) {
    cached = loadScoreboard();
  }

  return cached;
}

export function scoreboardServerSnapshot(): Scoreboard {
  return emptyScoreboard;
}

export function writeScoreboard(next: Scoreboard) {
  cached = next;
  saveScoreboard(next);
  listeners.forEach((listener) => listener());
}
