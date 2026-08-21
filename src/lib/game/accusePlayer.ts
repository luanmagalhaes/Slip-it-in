import type { Match } from "@/types/match";
import { findById } from "@/utils/collections";

export function accusePlayer(match: Match, accuserId: string, accusedId: string): Match {
  if (accuserId === accusedId) {
    return match;
  }

  if (!findById(match.players, accuserId) || !findById(match.players, accusedId)) {
    return match;
  }

  return { ...match, pendingAccusation: { accuserId, accusedId } };
}

export function cancelAccusation(match: Match): Match {
  return { ...match, pendingAccusation: null };
}
