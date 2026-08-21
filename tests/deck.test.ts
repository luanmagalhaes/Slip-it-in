import { describe, expect, it } from "vitest";
import { baseDeck } from "@/data/deck";
import { CardCategory } from "@/types/card";

const expectedCounts: Array<[CardCategory, number, string, string]> = [
  [CardCategory.DailyLife, 60, "001", "060"],
  [CardCategory.Absurd, 40, "061", "100"],
  [CardCategory.Clever, 40, "101", "140"],
  [CardCategory.Suspicious, 35, "141", "175"],
  [CardCategory.Social, 30, "176", "205"],
  [CardCategory.Embarrassing, 25, "206", "230"],
  [CardCategory.Plausible, 20, "231", "250"],
  [CardCategory.Spicy, 50, "251", "300"],
];

describe("baralho base", () => {
  it("tem exatamente 300 cartas", () => {
    expect(baseDeck).toHaveLength(300);
  });

  it("tem exatamente 50 cartas 18+", () => {
    expect(baseDeck.filter((card) => card.isAdult)).toHaveLength(50);
  });

  it("marca como 18+ apenas as cartas 251 a 300", () => {
    const adultIds = baseDeck.filter((card) => card.isAdult).map((card) => card.id);

    expect(adultIds[0]).toBe("251");
    expect(adultIds.at(-1)).toBe("300");
    expect(adultIds.every((id) => Number(id) >= 251 && Number(id) <= 300)).toBe(true);
  });

  it("usa ids de 001 a 300 sem repetir nem faltar", () => {
    const ids = baseDeck.map((card) => card.id).sort();
    const expected = Array.from({ length: 300 }, (_, index) =>
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
    expect(new Set(texts).size).toBe(300);
  });

  it("nao tem tags no baralho inicial", () => {
    expect(baseDeck.every((card) => card.tags.length === 0)).toBe(true);
  });
});
