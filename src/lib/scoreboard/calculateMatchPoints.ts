import { MatchEventType, type Match, type MatchEvent } from "@/types/match";
import type { ScoringRules } from "@/types/scoreboard";

export interface PlayerPoints {
  playerId: string;
  points: number;
  cardsCompleted: number;
  correctAccusations: number;
  timesCaught: number;
}

function penalizedPlayerId(event: MatchEvent): string | null {
  if (event.type === MatchEventType.AccusationCorrect) {
    return event.targetPlayerId;
  }

  if (event.type === MatchEventType.AccusationWrong) {
    return event.playerId;
  }

  return null;
}

export function calculateMatchPoints(match: Match, rules: ScoringRules): PlayerPoints[] {
  const totals = new Map<string, PlayerPoints>(
    match.players.map((player) => [
      player.id,
      {
        playerId: player.id,
        points: 0,
        cardsCompleted: 0,
        correctAccusations: 0,
        timesCaught: 0,
      },
    ]),
  );

  const add = (playerId: string | null, mutate: (entry: PlayerPoints) => void) => {
    const entry = playerId ? totals.get(playerId) : undefined;

    if (entry) {
      mutate(entry);
    }
  };

  for (const event of match.events) {
    if (event.type === MatchEventType.CardCompleted) {
      add(event.playerId, (entry) => {
        entry.points += rules.cardCompleted;
        entry.cardsCompleted += 1;
      });
    }

    if (event.type === MatchEventType.AccusationCorrect) {
      add(event.playerId, (entry) => {
        entry.points += rules.accusationCorrect;
        entry.correctAccusations += 1;
      });
      add(event.targetPlayerId, (entry) => {
        entry.points += rules.caught;
        entry.timesCaught += 1;
      });
    }

    if (event.type === MatchEventType.AccusationWrong) {
      add(event.playerId, (entry) => {
        entry.points += rules.accusationWrong;
      });
    }

    if (event.type === MatchEventType.MatchWon) {
      add(event.playerId, (entry) => {
        entry.points += rules.matchWon;
      });
    }

    if (event.pointsLost > 0) {
      add(penalizedPlayerId(event), (entry) => {
        entry.points -= event.pointsLost;
      });
    }
  }

  return [...totals.values()];
}
