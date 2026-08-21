import { describe, expect, it } from "vitest";
import { baseDeck } from "@/data/deck";
import { dealCards } from "@/lib/game/dealCards";
import { shuffleDeck } from "@/lib/game/shuffleDeck";
import { createSeededRng } from "@/utils/rng";
import { buildMatch, draftsOf } from "./factories";

describe("distribuicao", () => {
  it("da 5 cartas para cada jogador", () => {
    const match = buildMatch({}, ["Ana", "Bruno", "Caio", "Duda"]);

    expect(match.players).toHaveLength(4);
    expect(match.players.every((player) => player.hand.length === 5)).toBe(true);
  });

  it("mantem o restante do baralho no monte", () => {
    const match = buildMatch({ adultContentEnabled: false }, ["Ana", "Bruno"]);

    expect(match.drawPile).toHaveLength(300 - 10);
  });

  it("nao repete carta entre maos e monte", () => {
    const match = buildMatch({ adultContentEnabled: true }, ["Ana", "Bruno", "Caio"]);
    const ids = [...match.players.flatMap((player) => player.hand), ...match.drawPile].map(
      (card) => card.id,
    );

    expect(new Set(ids).size).toBe(ids.length);
  });

  it("suporta 12 jogadores", () => {
    const names = Array.from({ length: 12 }, (_, index) => `J${index + 1}`);
    const match = buildMatch({ adultContentEnabled: false }, names);

    expect(match.players).toHaveLength(12);
    expect(match.drawPile).toHaveLength(300 - 60);
  });

  it("recusa distribuir quando o baralho e insuficiente", () => {
    expect(() =>
      dealCards({ deck: baseDeck.slice(0, 4), drafts: draftsOf("Ana", "Bruno"), handSize: 5 }),
    ).toThrow(/insuficiente/);
  });

  it("embaralha de forma deterministica com a mesma semente", () => {
    const first = shuffleDeck(baseDeck, createSeededRng(7)).map((card) => card.id);
    const second = shuffleDeck(baseDeck, createSeededRng(7)).map((card) => card.id);
    const third = shuffleDeck(baseDeck, createSeededRng(8)).map((card) => card.id);

    expect(first).toEqual(second);
    expect(first).not.toEqual(third);
  });

  it("embaralha sem perder nem duplicar carta", () => {
    const shuffled = shuffleDeck(baseDeck, createSeededRng(99));

    expect(shuffled).toHaveLength(400);
    expect(new Set(shuffled.map((card) => card.id)).size).toBe(400);
  });

  it("nao modifica o baralho original ao embaralhar", () => {
    const before = baseDeck.map((card) => card.id);
    shuffleDeck(baseDeck, createSeededRng(5));

    expect(baseDeck.map((card) => card.id)).toEqual(before);
  });
});
