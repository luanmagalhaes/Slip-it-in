import { describe, expect, it } from "vitest";
import { majorityThreshold, resolveContest } from "@/lib/game/online/contest";
import {
  hasExpired,
  isAccusationBlocked,
  isArmed,
  secondsRemaining,
} from "@/lib/game/online/timing";
import { ClaimStatus } from "@/types/room";

const now = new Date("2026-08-21T20:00:00.000Z");
const future = new Date("2026-08-21T20:01:30.000Z").toISOString();
const past = new Date("2026-08-21T19:58:00.000Z").toISOString();

describe("janela de carta armada", () => {
  it("considera armada enquanto a janela nao fecha", () => {
    expect(isArmed(future, now)).toBe(true);
  });

  it("considera desarmada depois da janela", () => {
    expect(isArmed(past, now)).toBe(false);
  });

  it("considera desarmada quando nunca foi armada", () => {
    expect(isArmed(null, now)).toBe(false);
  });

  it("trata prazo nulo como expirado", () => {
    expect(hasExpired(null, now)).toBe(true);
  });

  it("conta os segundos restantes arredondando para cima", () => {
    expect(secondsRemaining(future, now)).toBe(90);
    expect(secondsRemaining(past, now)).toBe(0);
    expect(secondsRemaining(null, now)).toBe(0);
  });

  it("bloqueia acusacao apenas dentro do cooldown", () => {
    expect(isAccusationBlocked(future, now)).toBe(true);
    expect(isAccusationBlocked(past, now)).toBe(false);
    expect(isAccusationBlocked(null, now)).toBe(false);
  });
});

describe("maioria da mesa", () => {
  it.each([
    [1, 1],
    [2, 2],
    [3, 2],
    [4, 3],
    [11, 6],
  ])("com %i eleitores exige %i votos", (eligible, needed) => {
    expect(majorityThreshold(eligible)).toBe(needed);
  });
});

describe("contestacao", () => {
  it("fica pendente enquanto ninguem votou e a janela esta aberta", () => {
    expect(
      resolveContest({ votes: [], eligibleVoterCount: 4, contestEndsAt: future, now }),
    ).toBe(ClaimStatus.Pending);
  });

  it("derruba a carta quando a maioria diz que nao falou", () => {
    expect(
      resolveContest({
        votes: [
          { voterId: "a", saidIt: false },
          { voterId: "b", saidIt: false },
        ],
        eligibleVoterCount: 2,
        contestEndsAt: future,
        now,
      }),
    ).toBe(ClaimStatus.Reverted);
  });

  it("confirma a carta quando a maioria diz que falou", () => {
    expect(
      resolveContest({
        votes: [
          { voterId: "a", saidIt: true },
          { voterId: "b", saidIt: true },
        ],
        eligibleVoterCount: 3,
        contestEndsAt: future,
        now,
      }),
    ).toBe(ClaimStatus.Confirmed);
  });

  it("nao decide com um voto so quando a maioria exige dois", () => {
    expect(
      resolveContest({
        votes: [{ voterId: "a", saidIt: false }],
        eligibleVoterCount: 3,
        contestEndsAt: future,
        now,
      }),
    ).toBe(ClaimStatus.Pending);
  });

  it("confirma por silencio quando a janela fecha sem votos", () => {
    expect(
      resolveContest({ votes: [], eligibleVoterCount: 5, contestEndsAt: past, now }),
    ).toBe(ClaimStatus.Confirmed);
  });

  it("decide por maioria simples dos presentes quando a janela fecha", () => {
    expect(
      resolveContest({
        votes: [
          { voterId: "a", saidIt: false },
          { voterId: "b", saidIt: true },
          { voterId: "c", saidIt: false },
        ],
        eligibleVoterCount: 8,
        contestEndsAt: past,
        now,
      }),
    ).toBe(ClaimStatus.Reverted);
  });

  it("confirma em empate na janela fechada", () => {
    expect(
      resolveContest({
        votes: [
          { voterId: "a", saidIt: false },
          { voterId: "b", saidIt: true },
        ],
        eligibleVoterCount: 6,
        contestEndsAt: past,
        now,
      }),
    ).toBe(ClaimStatus.Confirmed);
  });

  it("confirma quando nao existe ninguem para votar", () => {
    expect(
      resolveContest({ votes: [], eligibleVoterCount: 0, contestEndsAt: future, now }),
    ).toBe(ClaimStatus.Confirmed);
  });
});
