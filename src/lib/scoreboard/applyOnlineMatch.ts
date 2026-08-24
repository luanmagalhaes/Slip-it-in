import { playerIdFromName } from "@/lib/scoreboard/scoreboardOperations";
import type { ScoreEntry, Scoreboard, ScoringRules } from "@/types/scoreboard";

export interface OnlinePlayerSummary {
  name: string;
  cardsCompleted: number;
  correctAccusations: number;
  wrongAccusations: number;
  timesCaught: number;
  isWinner: boolean;
}

export interface OnlineMatchSummary {
  code: string;
  players: OnlinePlayerSummary[];
}

export function pointsForPlayer(player: OnlinePlayerSummary, rules: ScoringRules): number {
  return (
    player.cardsCompleted * rules.cardCompleted +
    player.correctAccusations * rules.accusationCorrect +
    player.wrongAccusations * rules.accusationWrong +
    player.timesCaught * rules.caught +
    (player.isWinner ? rules.matchWon : 0)
  );
}

function emptyEntry(name: string): ScoreEntry {
  return {
    playerId: playerIdFromName(name),
    name,
    points: 0,
    matchesPlayed: 0,
    matchesWon: 0,
    cardsCompleted: 0,
    correctAccusations: 0,
    timesCaught: 0,
  };
}

export function applyOnlineMatch(
  scoreboard: Scoreboard,
  summary: OnlineMatchSummary,
): Scoreboard {
  const byId = new Map(scoreboard.entries.map((entry) => [entry.playerId, entry]));

  for (const player of summary.players) {
    const id = playerIdFromName(player.name);

    if (!id) {
      continue;
    }

    const current = byId.get(id) ?? emptyEntry(player.name);

    byId.set(id, {
      ...current,
      name: player.name,
      points: current.points + pointsForPlayer(player, scoreboard.rules),
      matchesPlayed: current.matchesPlayed + 1,
      matchesWon: current.matchesWon + (player.isWinner ? 1 : 0),
      cardsCompleted: current.cardsCompleted + player.cardsCompleted,
      correctAccusations: current.correctAccusations + player.correctAccusations,
      timesCaught: current.timesCaught + player.timesCaught,
    });
  }

  return { ...scoreboard, entries: [...byId.values()] };
}
