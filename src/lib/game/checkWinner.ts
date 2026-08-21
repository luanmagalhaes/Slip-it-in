import type { Player } from "@/types/player";

export function checkWinner(players: readonly Player[]): string | null {
  const winner = players.find((player) => player.hand.length === 0);

  return winner ? winner.id : null;
}
