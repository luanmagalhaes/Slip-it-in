import type { Card, CardCategory, CardDifficulty } from "@/types/card";
import { formatCardId } from "@/utils/id";

interface CategoryCardsInput {
  startId: number;
  category: CardCategory;
  difficulty: CardDifficulty;
  isAdult: boolean;
  texts: readonly string[];
}

export function createCategoryCards({
  startId,
  category,
  difficulty,
  isAdult,
  texts,
}: CategoryCardsInput): Card[] {
  return texts.map((text, index) => ({
    id: formatCardId(startId + index),
    text,
    category,
    difficulty,
    isAdult,
    tags: [],
  }));
}
