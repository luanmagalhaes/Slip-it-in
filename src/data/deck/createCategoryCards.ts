import { ContentLevel, type Card, type CardCategory, type CardDifficulty } from "@/types/card";
import { formatCardId } from "@/utils/id";

interface CategoryCardsInput {
  startId: number;
  category: CardCategory;
  difficulty: CardDifficulty;
  isAdult: boolean;
  contentLevel?: ContentLevel;
  texts: readonly string[];
}

export function createCategoryCards({
  startId,
  category,
  difficulty,
  isAdult,
  contentLevel = ContentLevel.Regular,
  texts,
}: CategoryCardsInput): Card[] {
  return texts.map((text, index) => ({
    id: formatCardId(startId + index),
    text,
    category,
    difficulty,
    isAdult,
    contentLevel,
    tags: [],
  }));
}
