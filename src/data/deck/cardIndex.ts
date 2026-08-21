import { baseDeck } from "@/data/deck";
import type { Card } from "@/types/card";

const index = new Map<string, Card>(baseDeck.map((card) => [card.id, card]));

export function cardById(id: string): Card | undefined {
  return index.get(id);
}

export function cardsByIds(ids: readonly string[]): Card[] {
  return ids.map((id) => index.get(id)).filter((card): card is Card => Boolean(card));
}
