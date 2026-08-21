import { ClaimStatus } from "@/types/room";
import { hasExpired } from "@/lib/game/online/timing";

export interface ContestVote {
  voterId: string;
  saidIt: boolean;
}

export interface ContestInput {
  votes: readonly ContestVote[];
  eligibleVoterCount: number;
  contestEndsAt: string;
  now: Date;
}

export type ContestResolution = typeof ClaimStatus.Pending | typeof ClaimStatus.Confirmed | typeof ClaimStatus.Reverted;

export function majorityThreshold(eligibleVoterCount: number): number {
  return Math.floor(eligibleVoterCount / 2) + 1;
}

export function resolveContest({
  votes,
  eligibleVoterCount,
  contestEndsAt,
  now,
}: ContestInput): ContestResolution {
  if (eligibleVoterCount <= 0) {
    return ClaimStatus.Confirmed;
  }

  const against = votes.filter((vote) => !vote.saidIt).length;
  const inFavour = votes.filter((vote) => vote.saidIt).length;
  const needed = majorityThreshold(eligibleVoterCount);

  if (against >= needed) {
    return ClaimStatus.Reverted;
  }

  if (inFavour >= needed) {
    return ClaimStatus.Confirmed;
  }

  if (hasExpired(contestEndsAt, now)) {
    return against > inFavour ? ClaimStatus.Reverted : ClaimStatus.Confirmed;
  }

  return ClaimStatus.Pending;
}
