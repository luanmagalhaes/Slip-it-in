import { describe, expect, it } from "vitest";
import { baseDeck } from "@/data/deck";
import { CardCategory, ContentLevel } from "@/types/card";

const totalCards = 400;

const expectedCounts: Array<[CardCategory, number, string, string]> = [
  [CardCategory.DailyLife, 60, "001", "060"],
  [CardCategory.Absurd, 40, "061", "100"],
  [CardCategory.Clever, 40, "101", "140"],
  [CardCategory.Suspicious, 35, "141", "175"],
  [CardCategory.Social, 30, "176", "205"],
  [CardCategory.Embarrassing, 25, "206", "230"],
  [CardCategory.Plausible, 20, "231", "250"],
  [CardCategory.Spicy, 50, "251", "300"],
  [CardCategory.SpicyHard, 50, "301", "350"],
  [CardCategory.PopCulture, 50, "351", "400"],
];

describe("baralho base", () => {
  it("tem exatamente 400 cartas", () => {
    expect(baseDeck).toHaveLength(totalCards);
  });

  it("tem exatamente 100 cartas 18+", () => {
    expect(baseDeck.filter((card) => card.isAdult)).toHaveLength(100);
  });

  it("marca como 18+ apenas as cartas 251 a 350", () => {
    const adultIds = baseDeck.filter((card) => card.isAdult).map((card) => card.id);

    expect(adultIds[0]).toBe("251");
    expect(adultIds.at(-1)).toBe("350");
    expect(adultIds.every((id) => Number(id) >= 251 && Number(id) <= 350)).toBe(true);
  });

  it("separa picante e muito picante em niveis distintos", () => {
    const spicy = baseDeck.filter((card) => card.contentLevel === ContentLevel.Spicy);
    const hard = baseDeck.filter((card) => card.contentLevel === ContentLevel.Hard);

    expect(spicy).toHaveLength(50);
    expect(hard).toHaveLength(50);
    expect(spicy[0].id).toBe("251");
    expect(hard[0].id).toBe("301");
    expect(spicy.every((card) => card.isAdult)).toBe(true);
    expect(hard.every((card) => card.isAdult)).toBe(true);
  });

  it("marca como nivel regular toda carta que nao e 18+", () => {
    const regular = baseDeck.filter((card) => card.contentLevel === ContentLevel.Regular);

    expect(regular).toHaveLength(300);
    expect(regular.some((card) => card.isAdult)).toBe(false);
  });

  it("usa ids de 001 a 400 sem repetir nem faltar", () => {
    const ids = baseDeck.map((card) => card.id).sort();
    const expected = Array.from({ length: totalCards }, (_, index) =>
      String(index + 1).padStart(3, "0"),
    ).sort();

    expect(ids).toEqual(expected);
  });

  it.each(expectedCounts)(
    "categoria %s tem %i cartas no intervalo %s-%s",
    (category, count, firstId, lastId) => {
      const cards = baseDeck.filter((card) => card.category === category);

      expect(cards).toHaveLength(count);
      expect(cards[0].id).toBe(firstId);
      expect(cards.at(-1)?.id).toBe(lastId);
    },
  );

  it("nao tem carta com texto vazio ou duplicado", () => {
    const texts = baseDeck.map((card) => card.text);

    expect(texts.every((text) => text.trim().length > 0)).toBe(true);
    expect(new Set(texts).size).toBe(totalCards);
  });

  it("nao tem tags no baralho inicial", () => {
    expect(baseDeck.every((card) => card.tags.length === 0)).toBe(true);
  });
});
