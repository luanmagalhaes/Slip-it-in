export function hasExpired(deadline: string | null, now: Date): boolean {
  if (!deadline) {
    return true;
  }

  return new Date(deadline).getTime() <= now.getTime();
}

export function isArmed(armedUntil: string | null, now: Date): boolean {
  return armedUntil !== null && !hasExpired(armedUntil, now);
}

export function isAccusationBlocked(blockedUntil: string | null, now: Date): boolean {
  return blockedUntil !== null && !hasExpired(blockedUntil, now);
}

export function secondsRemaining(deadline: string | null, now: Date): number {
  if (!deadline) {
    return 0;
  }

  const millis = new Date(deadline).getTime() - now.getTime();

  return Math.max(0, Math.ceil(millis / 1000));
}
