import type { Card } from "@/types/card";

export interface Player {
  id: string;
  name: string;
  hand: Card[];
  completedCards: Card[];
}

export interface PlayerDraft {
  id: string;
  name: string;
}
