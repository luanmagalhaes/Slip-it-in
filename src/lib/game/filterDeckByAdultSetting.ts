import { ContentLevel, type Card } from "@/types/card";

export interface ContentSettings {
  adultContentEnabled: boolean;
  hardContentEnabled: boolean;
}

export function allowedContentLevels({
  adultContentEnabled,
  hardContentEnabled,
}: ContentSettings): ContentLevel[] {
  if (!adultContentEnabled) {
    return [ContentLevel.Regular];
  }

  if (!hardContentEnabled) {
    return [ContentLevel.Regular, ContentLevel.Spicy];
  }

  return [ContentLevel.Regular, ContentLevel.Spicy, ContentLevel.Hard];
}

export function filterDeckByAdultSetting(
  cards: readonly Card[],
  settings: ContentSettings,
): Card[] {
  const allowed = new Set<ContentLevel>(allowedContentLevels(settings));

  return cards.filter((card) => allowed.has(card.contentLevel));
}
