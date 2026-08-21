import type { Card } from "@/types/card";
import { systemRng, type RandomNumberGenerator } from "@/utils/rng";

export function shuffleDeck(cards: readonly Card[], rng: RandomNumberGenerator = systemRng): Card[] {
  const shuffled = [...cards];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(rng() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}
