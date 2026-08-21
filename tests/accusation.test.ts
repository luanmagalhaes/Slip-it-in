import { describe, expect, it } from "vitest";
import { accusePlayer, cancelAccusation } from "@/lib/game/accusePlayer";
import { calculatePenalty } from "@/lib/game/calculatePenalty";
import { resolveAccusation } from "@/lib/game/resolveAccusation";
import { MatchEventType, type Match } from "@/types/match";
import { buildMatch } from "./factories";

describe("acusacao", () => {
  it("registra a acusacao pendente", () => {
    const match = buildMatch();
    const next = accusePlayer(match, match.players[0].id, match.players[1].id);

    expect(next.pendingAccusation).toEqual({
      accuserId: match.players[0].id,
      accusedId: match.players[1].id,
    });
  });

  it("nao permite acusar a si mesmo", () => {
    const match = buildMatch();

    expect(accusePlayer(match, match.players[0].id, match.players[0].id)).toBe(match);
  });

  it("ignora jogador inexistente", () => {
    const match = buildMatch();

    expect(accusePlayer(match, match.players[0].id, "fantasma")).toBe(match);
    expect(accusePlayer(match, "fantasma", match.players[0].id)).toBe(match);
  });

  it("cancela a acusacao pendente", () => {
    const match = accusePlayer(buildMatch(), "p1", "p2");

    expect(cancelAccusation(match).pendingAccusation).toBeNull();
  });
});

describe("resolucao da acusacao", () => {
  it("penaliza o acusado quando a acusacao esta correta", () => {
    const match = accusePlayer(buildMatch(), "p1", "p2");
    const next = resolveAccusation(match, true);

    expect(next.players[1].hand).toHaveLength(6);
    expect(next.players[0].hand).toHaveLength(5);
    expect(next.lastPenalty?.playerId).toBe("p2");
    expect(next.pendingAccusation).toBeNull();
  });

  it("penaliza o acusador quando a acusacao esta errada", () => {
    const match = accusePlayer(buildMatch(), "p1", "p2");
    const next = resolveAccusation(match, false);

    expect(next.players[0].hand).toHaveLength(6);
    expect(next.players[1].hand).toHaveLength(5);
    expect(next.lastPenalty?.playerId).toBe("p1");
  });

  it("tira a carta da penalidade do monte", () => {
    const match = accusePlayer(buildMatch(), "p1", "p2");
    const expectedTop = match.drawPile[0];
    const next = resolveAccusation(match, true);

    expect(next.drawPile).toHaveLength(match.drawPile.length - 1);
    expect(next.players[1].hand.at(-1)).toEqual(expectedTop);
  });

  it("registra o evento correto para cada desfecho", () => {
    const base = accusePlayer(buildMatch(), "p1", "p2");

    expect(resolveAccusation(base, true).events.at(-1)).toMatchObject({
      type: MatchEventType.AccusationCorrect,
      playerId: "p1",
      targetPlayerId: "p2",
    });
    expect(resolveAccusation(base, false).events.at(-1)).toMatchObject({
      type: MatchEventType.AccusationWrong,
      playerId: "p1",
      targetPlayerId: "p2",
    });
  });

  it("nao faz nada sem acusacao pendente", () => {
    const match = buildMatch();

    expect(resolveAccusation(match, true)).toBe(match);
  });

  it("respeita penalidade de mais de uma carta", () => {
    const match = accusePlayer(buildMatch({ penaltyCardCount: 3 }), "p1", "p2");
    const next = resolveAccusation(match, true);

    expect(next.players[1].hand).toHaveLength(8);
    expect(next.drawPile).toHaveLength(match.drawPile.length - 3);
  });
});

describe("penalidade com monte vazio", () => {
  it("saca do monte quando ha cartas", () => {
    const outcome = calculatePenalty({
      drawPile: buildMatch().drawPile,
      penaltyCardCount: 1,
      emptyPilePointsLost: 1,
    });

    expect(outcome.drawnCards).toHaveLength(1);
    expect(outcome.pointsLost).toBe(0);
  });

  it("converte em perda de ponto quando o monte esta vazio", () => {
    const outcome = calculatePenalty({
      drawPile: [],
      penaltyCardCount: 2,
      emptyPilePointsLost: 1,
    });

    expect(outcome.drawnCards).toHaveLength(0);
    expect(outcome.pointsLost).toBe(2);
  });

  it("mistura carta e ponto quando o monte tem menos que o necessario", () => {
    const outcome = calculatePenalty({
      drawPile: buildMatch().drawPile.slice(0, 1),
      penaltyCardCount: 3,
      emptyPilePointsLost: 1,
    });

    expect(outcome.drawnCards).toHaveLength(1);
    expect(outcome.remainingDrawPile).toHaveLength(0);
    expect(outcome.pointsLost).toBe(2);
  });

  it("nao trava a partida quando o monte zera", () => {
    const emptyPile: Match = { ...buildMatch(), drawPile: [] };
    const match = accusePlayer(emptyPile, "p1", "p2");
    const next = resolveAccusation(match, true);

    expect(next.players[1].hand).toHaveLength(5);
    expect(next.lastPenalty?.pointsLost).toBe(1);
    expect(next.events.at(-1)?.pointsLost).toBe(1);
  });
});
