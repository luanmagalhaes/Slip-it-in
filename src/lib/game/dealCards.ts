import type { Card } from "@/types/card";
import type { Player, PlayerDraft } from "@/types/player";

interface DealCardsInput {
  deck: readonly Card[];
  drafts: readonly PlayerDraft[];
  handSize: number;
}

export interface DealCardsResult {
  players: Player[];
  drawPile: Card[];
}

export function dealCards({ deck, drafts, handSize }: DealCardsInput): DealCardsResult {
  const required = drafts.length * handSize;

  if (required > deck.length) {
    throw new Error(`Baralho insuficiente: ${deck.length} cartas para ${required} necessárias`);
  }

  const players = drafts.map((draft, playerIndex) => ({
    id: draft.id,
    name: draft.name,
    hand: deck.slice(playerIndex * handSize, playerIndex * handSize + handSize),
    completedCards: [],
  }));

  return { players, drawPile: deck.slice(required) };
}
