import { calculateMatchPoints } from "@/lib/scoreboard/calculateMatchPoints";
import type { Match } from "@/types/match";
import type { ScoreEntry, Scoreboard, ScoringRules } from "@/types/scoreboard";
import { normalizeDisplayName, slugifyName } from "@/utils/slug";

function createEntry(playerId: string, name: string): ScoreEntry {
  return {
    playerId,
    name,
    points: 0,
    matchesPlayed: 0,
    matchesWon: 0,
    cardsCompleted: 0,
    correctAccusations: 0,
    timesCaught: 0,
  };
}

export function playerIdFromName(name: string): string {
  return slugifyName(name);
}

export function upsertPlayer(scoreboard: Scoreboard, rawName: string): Scoreboard {
  const name = normalizeDisplayName(rawName);
  const playerId = playerIdFromName(name);

  if (!playerId) {
    return scoreboard;
  }

  const existing = scoreboard.entries.find((entry) => entry.playerId === playerId);

  if (existing) {
    return {
      ...scoreboard,
      entries: scoreboard.entries.map((entry) =>
        entry.playerId === playerId ? { ...entry, name } : entry,
      ),
    };
  }

  return { ...scoreboard, entries: [...scoreboard.entries, createEntry(playerId, name)] };
}

export function removePlayer(scoreboard: Scoreboard, playerId: string): Scoreboard {
  return {
    ...scoreboard,
    entries: scoreboard.entries.filter((entry) => entry.playerId !== playerId),
  };
}

export function resetPoints(scoreboard: Scoreboard): Scoreboard {
  return {
    ...scoreboard,
    entries: scoreboard.entries.map((entry) => createEntry(entry.playerId, entry.name)),
  };
}

export function clearPlayers(scoreboard: Scoreboard): Scoreboard {
  return { ...scoreboard, entries: [] };
}

export function updateRules(scoreboard: Scoreboard, rules: ScoringRules): Scoreboard {
  return { ...scoreboard, rules };
}

export function applyMatchToScoreboard(scoreboard: Scoreboard, match: Match): Scoreboard {
  const results = calculateMatchPoints(match, scoreboard.rules);
  const scoreboardIdByMatchId = new Map(
    match.players.map((player) => [player.id, playerIdFromName(player.name)]),
  );
  const winnerScoreboardId = match.winnerId
    ? scoreboardIdByMatchId.get(match.winnerId) ?? null
    : null;
  const withPlayers = match.players.reduce(
    (accumulator, player) => upsertPlayer(accumulator, player.name),
    scoreboard,
  );

  return {
    ...withPlayers,
    entries: withPlayers.entries.map((entry) => {
      const result = results.find(
        (candidate) => scoreboardIdByMatchId.get(candidate.playerId) === entry.playerId,
      );

      if (!result) {
        return entry;
      }

      return {
        ...entry,
        points: entry.points + result.points,
        matchesPlayed: entry.matchesPlayed + 1,
        matchesWon: entry.matchesWon + (winnerScoreboardId === entry.playerId ? 1 : 0),
        cardsCompleted: entry.cardsCompleted + result.cardsCompleted,
        correctAccusations: entry.correctAccusations + result.correctAccusations,
        timesCaught: entry.timesCaught + result.timesCaught,
      };
    }),
  };
}

export function rankedEntries(scoreboard: Scoreboard): ScoreEntry[] {
  return [...scoreboard.entries].sort(
    (left, right) => right.points - left.points || right.matchesWon - left.matchesWon,
  );
}
