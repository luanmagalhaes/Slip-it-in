import { describe, expect, it } from "vitest";
import { applyOnlineMatch, pointsForPlayer } from "@/lib/scoreboard/applyOnlineMatch";
import { rankedEntries } from "@/lib/scoreboard/scoreboardOperations";
import { emptyScoreboard } from "@/lib/scoreboard/scoreboardStorage";
import { defaultScoringRules } from "@/lib/scoreboard/scoringRules";
import type { OnlinePlayerSummary } from "@/lib/scoreboard/applyOnlineMatch";

function player(overrides: Partial<OnlinePlayerSummary> = {}): OnlinePlayerSummary {
  return {
    name: "Ana",
    cardsCompleted: 0,
    correctAccusations: 0,
    wrongAccusations: 0,
    timesCaught: 0,
    isWinner: false,
    ...overrides,
  };
}

describe("pontos de uma partida", () => {
  it("soma carta encaixada, acusacao certa e vitoria", () => {
    const points = pointsForPlayer(
      player({ cardsCompleted: 5, correctAccusations: 2, isWinner: true }),
      defaultScoringRules,
    );

    expect(points).toBe(5 * 2 + 2 * 3 + 5);
  });

  it("desconta acusacao errada e ter sido pego", () => {
    expect(
      pointsForPlayer(player({ wrongAccusations: 2, timesCaught: 3 }), defaultScoringRules),
    ).toBe(2 * -2 + 3 * -1);
  });

  it("nao da ponto de vitoria para quem nao venceu", () => {
    expect(pointsForPlayer(player({ cardsCompleted: 1 }), defaultScoringRules)).toBe(2);
  });
});

describe("placar acumulado", () => {
  const summary = {
    code: "ABC123",
    players: [
      player({ name: "Ana", cardsCompleted: 5, isWinner: true }),
      player({ name: "Bruno", cardsCompleted: 2, wrongAccusations: 1 }),
    ],
  };

  it("cria entrada para cada jogador na primeira partida", () => {
    const next = applyOnlineMatch(emptyScoreboard, summary);

    expect(next.entries).toHaveLength(2);
    expect(next.entries.every((entry) => entry.matchesPlayed === 1)).toBe(true);
  });

  it("acumula entre partidas em vez de sobrescrever", () => {
    const once = applyOnlineMatch(emptyScoreboard, summary);
    const twice = applyOnlineMatch(once, summary);
    const ana = twice.entries.find((entry) => entry.name === "Ana");

    expect(twice.entries).toHaveLength(2);
    expect(ana?.matchesPlayed).toBe(2);
    expect(ana?.matchesWon).toBe(2);
    expect(ana?.cardsCompleted).toBe(10);
  });

  it("conta vitoria apenas para quem venceu", () => {
    const next = applyOnlineMatch(emptyScoreboard, summary);

    expect(next.entries.find((entry) => entry.name === "Ana")?.matchesWon).toBe(1);
    expect(next.entries.find((entry) => entry.name === "Bruno")?.matchesWon).toBe(0);
  });

  it("junta o mesmo jogador escrito com caixa diferente", () => {
    const next = applyOnlineMatch(
      applyOnlineMatch(emptyScoreboard, { code: "A", players: [player({ name: "Ana" })] }),
      { code: "B", players: [player({ name: "ANA" })] },
    );

    expect(next.entries).toHaveLength(1);
    expect(next.entries[0].matchesPlayed).toBe(2);
  });

  it("ignora nome vazio", () => {
    const next = applyOnlineMatch(emptyScoreboard, {
      code: "A",
      players: [player({ name: "   " })],
    });

    expect(next.entries).toHaveLength(0);
  });

  it("ordena o ranking com o maior pontuador na frente", () => {
    const next = applyOnlineMatch(emptyScoreboard, summary);
    const ranking = rankedEntries(next);

    expect(ranking[0].name).toBe("Ana");
  });

  it("preserva as regras de pontuacao", () => {
    expect(applyOnlineMatch(emptyScoreboard, summary).rules).toEqual(defaultScoringRules);
  });
});
