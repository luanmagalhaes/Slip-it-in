export function formatCardId(value: number): string {
  return String(value).padStart(3, "0");
}

export function createPlayerId(index: number, seed: number): string {
  return `p${index}-${seed.toString(36)}`;
}

export function createMatchId(seed: number): string {
  return `m-${seed.toString(36)}`;
}
