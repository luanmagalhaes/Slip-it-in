import { describe, expect, it } from "vitest";
import { completeCard } from "@/lib/game/completeCard";
import { MatchEventType, MatchPhase } from "@/types/match";
import { buildMatch } from "./factories";

describe("cumprir e descartar carta", () => {
  it("move a carta da mao para o cofrinho", () => {
    const match = buildMatch();
    const player = match.players[0];
    const card = player.hand[2];
    const next = completeCard(match, player.id, card.id);

    expect(next.players[0].hand).toHaveLength(4);
    expect(next.players[0].hand.some((handCard) => handCard.id === card.id)).toBe(false);
    expect(next.players[0].completedCards).toEqual([card]);
    expect(next.slotPile).toEqual([card]);
  });

  it("registra o evento de carta cumprida", () => {
    const match = buildMatch();
    const player = match.players[1];
    const next = completeCard(match, player.id, player.hand[0].id);

    expect(next.events).toHaveLength(1);
    expect(next.events[0]).toMatchObject({
      type: MatchEventType.CardCompleted,
      playerId: player.id,
      cardId: player.hand[0].id,
      sequence: 1,
    });
  });

  it("ignora carta que nao esta na mao do jogador", () => {
    const match = buildMatch();
    const foreignCard = match.players[1].hand[0];
    const next = completeCard(match, match.players[0].id, foreignCard.id);

    expect(next).toBe(match);
  });

  it("ignora jogador inexistente", () => {
    const match = buildMatch();

    expect(completeCard(match, "fantasma", match.players[0].hand[0].id)).toBe(match);
  });

  it("nao muta a partida anterior", () => {
    const match = buildMatch();
    const player = match.players[0];
    completeCard(match, player.id, player.hand[0].id);

    expect(match.players[0].hand).toHaveLength(5);
    expect(match.slotPile).toHaveLength(0);
  });
});

describe("vitoria", () => {
  it("declara vencedor quando a mao zera", () => {
    let match = buildMatch();
    const playerId = match.players[0].id;

    for (const card of [...match.players[0].hand]) {
      match = completeCard(match, playerId, card.id);
    }

    expect(match.winnerId).toBe(playerId);
    expect(match.phase).toBe(MatchPhase.Finished);
    expect(match.slotPile).toHaveLength(5);
  });

  it("registra o evento de vitoria por ultimo", () => {
    let match = buildMatch();
    const playerId = match.players[0].id;

    for (const card of [...match.players[0].hand]) {
      match = completeCard(match, playerId, card.id);
    }

    expect(match.events.at(-1)).toMatchObject({
      type: MatchEventType.MatchWon,
      playerId,
    });
  });

  it("nao declara vencedor com cartas na mao", () => {
    const match = buildMatch();
    const next = completeCard(match, match.players[0].id, match.players[0].hand[0].id);

    expect(next.winnerId).toBeNull();
    expect(next.phase).toBe(MatchPhase.Playing);
  });
});
