import { describe, expect, it } from "vitest";
import { baseDeck } from "@/data/deck";
import { filterDeckByAdultSetting } from "@/lib/game/filterDeckByAdultSetting";
import { ContentLevel } from "@/types/card";
import { buildMatch } from "./factories";

const off = { adultContentEnabled: false, hardContentEnabled: false };
const spicyOnly = { adultContentEnabled: true, hardContentEnabled: false };
const everything = { adultContentEnabled: true, hardContentEnabled: true };

describe("conteudo 18+", () => {
  it("remove todas as cartas 18+ quando desligado", () => {
    const filtered = filterDeckByAdultSetting(baseDeck, off);

    expect(filtered).toHaveLength(300);
    expect(filtered.some((card) => card.isAdult)).toBe(false);
  });

  it("libera apenas o nivel picante quando o hard esta desligado", () => {
    const filtered = filterDeckByAdultSetting(baseDeck, spicyOnly);

    expect(filtered).toHaveLength(350);
    expect(filtered.filter((card) => card.contentLevel === ContentLevel.Spicy)).toHaveLength(50);
    expect(filtered.some((card) => card.contentLevel === ContentLevel.Hard)).toBe(false);
  });

  it("mantem o baralho completo quando os dois niveis estao ligados", () => {
    expect(filterDeckByAdultSetting(baseDeck, everything)).toHaveLength(400);
  });

  it("ignora o hard quando o 18+ esta desligado", () => {
    const filtered = filterDeckByAdultSetting(baseDeck, {
      adultContentEnabled: false,
      hardContentEnabled: true,
    });

    expect(filtered).toHaveLength(300);
    expect(filtered.some((card) => card.isAdult)).toBe(false);
  });

  it("nao distribui nenhuma carta 18+ com o modo adulto desligado", () => {
    const match = buildMatch(off);
    const allCards = [...match.players.flatMap((player) => player.hand), ...match.drawPile];

    expect(allCards).toHaveLength(300);
    expect(allCards.some((card) => card.isAdult)).toBe(false);
  });

  it("nao distribui carta muito picante quando so o 18+ esta ligado", () => {
    const match = buildMatch(spicyOnly);
    const allCards = [...match.players.flatMap((player) => player.hand), ...match.drawPile];

    expect(allCards).toHaveLength(350);
    expect(allCards.some((card) => card.contentLevel === ContentLevel.Hard)).toBe(false);
  });

  it("permite os dois niveis 18+ quando ambos estao ligados", () => {
    const match = buildMatch(everything);
    const allCards = [...match.players.flatMap((player) => player.hand), ...match.drawPile];

    expect(allCards).toHaveLength(400);
    expect(allCards.filter((card) => card.isAdult)).toHaveLength(100);
  });

  it("nao vaza carta 18+ para a mao apos penalidade com modo desligado", () => {
    const match = buildMatch(off, ["Ana", "Bruno"]);

    expect(match.drawPile.some((card) => card.isAdult)).toBe(false);
  });
});
