import type { Card } from "@/types/card";

export function filterDeckByAdultSetting(
  cards: readonly Card[],
  adultContentEnabled: boolean,
): Card[] {
  if (adultContentEnabled) {
    return [...cards];
  }

  return cards.filter((card) => !card.isAdult);
}
