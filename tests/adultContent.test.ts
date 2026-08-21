import { describe, expect, it } from "vitest";
import { baseDeck } from "@/data/deck";
import { filterDeckByAdultSetting } from "@/lib/game/filterDeckByAdultSetting";
import { buildMatch } from "./factories";

describe("conteudo 18+", () => {
  it("remove todas as cartas 18+ quando desligado", () => {
    const filtered = filterDeckByAdultSetting(baseDeck, false);

    expect(filtered).toHaveLength(250);
    expect(filtered.some((card) => card.isAdult)).toBe(false);
  });

  it("mantem o baralho completo quando ligado", () => {
    expect(filterDeckByAdultSetting(baseDeck, true)).toHaveLength(300);
  });

  it("nao distribui nenhuma carta 18+ com o modo adulto desligado", () => {
    const match = buildMatch({ adultContentEnabled: false });
    const allCards = [...match.players.flatMap((player) => player.hand), ...match.drawPile];

    expect(allCards).toHaveLength(250);
    expect(allCards.some((card) => card.isAdult)).toBe(false);
  });

  it("permite cartas 18+ no baralho com o modo adulto ligado", () => {
    const match = buildMatch({ adultContentEnabled: true });
    const allCards = [...match.players.flatMap((player) => player.hand), ...match.drawPile];

    expect(allCards).toHaveLength(300);
    expect(allCards.filter((card) => card.isAdult)).toHaveLength(50);
  });

  it("nao vaza carta 18+ para a mao apos penalidade com modo desligado", () => {
    const match = buildMatch({ adultContentEnabled: false }, ["Ana", "Bruno"]);

    expect(match.drawPile.some((card) => card.isAdult)).toBe(false);
  });
});
