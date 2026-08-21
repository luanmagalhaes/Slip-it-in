import { describe, expect, it } from "vitest";
import type { Match } from "@/types/match";
import { accusePlayer } from "@/lib/game/accusePlayer";
import { completeCard } from "@/lib/game/completeCard";
import { resolveAccusation } from "@/lib/game/resolveAccusation";
import { calculateMatchPoints } from "@/lib/scoreboard/calculateMatchPoints";
import {
  applyMatchToScoreboard,
  clearPlayers,
  playerIdFromName,
  rankedEntries,
  removePlayer,
  resetPoints,
  upsertPlayer,
} from "@/lib/scoreboard/scoreboardOperations";
import { defaultScoringRules } from "@/lib/scoreboard/scoringRules";
import { emptyScoreboard } from "@/lib/scoreboard/scoreboardStorage";
import { buildMatch } from "./factories";

describe("pontuacao da partida", () => {
  it("pontua carta cumprida", () => {
    const match = buildMatch();
    const next = completeCard(match, "p1", match.players[0].hand[0].id);
    const points = calculateMatchPoints(next, defaultScoringRules);

    expect(points.find((entry) => entry.playerId === "p1")).toMatchObject({
      points: defaultScoringRules.cardCompleted,
      cardsCompleted: 1,
    });
  });

  it("pontua acusacao correta e penaliza quem foi pego", () => {
    const match = resolveAccusation(accusePlayer(buildMatch(), "p1", "p2"), true);
    const points = calculateMatchPoints(match, defaultScoringRules);

    expect(points.find((entry) => entry.playerId === "p1")?.points).toBe(
      defaultScoringRules.accusationCorrect,
    );
    expect(points.find((entry) => entry.playerId === "p2")?.points).toBe(
      defaultScoringRules.caught,
    );
  });

  it("penaliza acusacao errada", () => {
    const match = resolveAccusation(accusePlayer(buildMatch(), "p1", "p2"), false);
    const points = calculateMatchPoints(match, defaultScoringRules);

    expect(points.find((entry) => entry.playerId === "p1")?.points).toBe(
      defaultScoringRules.accusationWrong,
    );
    expect(points.find((entry) => entry.playerId === "p2")?.points).toBe(0);
  });

  it("soma o bonus de vitoria", () => {
    let match = buildMatch();

    for (const card of [...match.players[0].hand]) {
      match = completeCard(match, "p1", card.id);
    }

    const points = calculateMatchPoints(match, defaultScoringRules);

    expect(points.find((entry) => entry.playerId === "p1")?.points).toBe(
      defaultScoringRules.cardCompleted * 5 + defaultScoringRules.matchWon,
    );
  });

  it("desconta ponto quando a penalidade caiu em monte vazio", () => {
    const emptyPile: Match = { ...buildMatch(), drawPile: [] };
    const match = resolveAccusation(accusePlayer(emptyPile, "p1", "p2"), true);
    const points = calculateMatchPoints(match, defaultScoringRules);

    expect(points.find((entry) => entry.playerId === "p2")?.points).toBe(
      defaultScoringRules.caught - defaultScoringRules.emptyPilePenalty,
    );
  });

  it("acumula varias penalidades de monte vazio", () => {
    let match: Match = { ...buildMatch(), drawPile: [] };
    match = resolveAccusation(accusePlayer(match, "p1", "p2"), true);
    match = resolveAccusation(accusePlayer(match, "p1", "p2"), true);
    const points = calculateMatchPoints(match, defaultScoringRules);

    expect(points.find((entry) => entry.playerId === "p2")?.points).toBe(
      (defaultScoringRules.caught - defaultScoringRules.emptyPilePenalty) * 2,
    );
  });
});

describe("placar persistente", () => {
  it("gera o mesmo id para o mesmo nome com acento e caixa diferentes", () => {
    expect(playerIdFromName("João")).toBe(playerIdFromName("joao"));
    expect(playerIdFromName("  Ana  Maria ")).toBe("ana-maria");
  });

  it("nao duplica jogador ja cadastrado", () => {
    const once = upsertPlayer(emptyScoreboard, "Luan");
    const twice = upsertPlayer(once, "luan");

    expect(twice.entries).toHaveLength(1);
    expect(twice.entries[0].name).toBe("luan");
  });

  it("ignora nome vazio", () => {
    expect(upsertPlayer(emptyScoreboard, "   ").entries).toHaveLength(0);
  });

  it("remove jogador", () => {
    const board = upsertPlayer(upsertPlayer(emptyScoreboard, "Ana"), "Bruno");

    expect(removePlayer(board, "ana").entries.map((entry) => entry.playerId)).toEqual(["bruno"]);
  });

  it("acumula resultado de partida por jogador", () => {
    let match = buildMatch();

    for (const card of [...match.players[0].hand]) {
      match = completeCard(match, "p1", card.id);
    }

    const board = applyMatchToScoreboard(emptyScoreboard, match);
    const ana = board.entries.find((entry) => entry.playerId === "ana");

    expect(ana).toMatchObject({
      matchesPlayed: 1,
      cardsCompleted: 5,
      points: defaultScoringRules.cardCompleted * 5 + defaultScoringRules.matchWon,
    });
  });

  it("credita a vitoria ao jogador certo do placar", () => {
    let match = buildMatch();

    for (const card of [...match.players[1].hand]) {
      match = completeCard(match, "p2", card.id);
    }

    const board = applyMatchToScoreboard(emptyScoreboard, match);

    expect(board.entries.find((entry) => entry.playerId === "bruno")?.matchesWon).toBe(1);
    expect(board.entries.find((entry) => entry.playerId === "ana")?.matchesWon).toBe(0);
    expect(board.entries.find((entry) => entry.playerId === "ana")?.matchesPlayed).toBe(1);
  });

  it("soma duas partidas do mesmo jogador", () => {
    let match = buildMatch();

    for (const card of [...match.players[0].hand]) {
      match = completeCard(match, "p1", card.id);
    }

    const board = applyMatchToScoreboard(applyMatchToScoreboard(emptyScoreboard, match), match);

    expect(board.entries.find((entry) => entry.playerId === "ana")?.matchesPlayed).toBe(2);
  });

  it("reseta os pontos mantendo os jogadores", () => {
    let match = buildMatch();
    match = completeCard(match, "p1", match.players[0].hand[0].id);
    const board = resetPoints(applyMatchToScoreboard(emptyScoreboard, match));

    expect(board.entries).toHaveLength(3);
    expect(board.entries.every((entry) => entry.points === 0)).toBe(true);
    expect(board.entries.every((entry) => entry.matchesPlayed === 0)).toBe(true);
  });

  it("limpa todos os jogadores", () => {
    const board = clearPlayers(upsertPlayer(emptyScoreboard, "Ana"));

    expect(board.entries).toHaveLength(0);
  });

  it("ordena o ranking por pontos", () => {
    const board = {
      ...emptyScoreboard,
      entries: [
        { ...blankEntry("ana"), points: 3 },
        { ...blankEntry("bruno"), points: 9 },
        { ...blankEntry("caio"), points: 5 },
      ],
    };

    expect(rankedEntries(board).map((entry) => entry.playerId)).toEqual(["bruno", "caio", "ana"]);
  });
});

function blankEntry(playerId: string) {
  return {
    playerId,
    name: playerId,
    points: 0,
    matchesPlayed: 0,
    matchesWon: 0,
    cardsCompleted: 0,
    correctAccusations: 0,
    timesCaught: 0,
  };
}
