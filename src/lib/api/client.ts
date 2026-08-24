export class ApiError extends Error {}

async function request<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "x-player-token": token } : {}),
      ...init.headers,
    },
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError((payload as { error?: string }).error ?? "erro inesperado");
  }

  return payload as T;
}

export interface JoinResponse {
  playerId: string;
  accessToken: string;
  code: string;
  crewId: string | null;
}

export interface CrewEntry {
  name: string;
  points: number;
  matchesPlayed: number;
  matchesWon: number;
  cardsCompleted: number;
  correctAccusations: number;
  timesCaught: number;
  wrongAccusations: number;
}

export interface MyStateResponse {
  playerId: string;
  name: string;
  isHost: boolean;
  handCardIds: string[];
  armedCardId: string | null;
  armedUntil: string | null;
  accusationBlockedUntil: string | null;
}

export const api = {
  createRoom: (body: {
    hostName: string;
    adultContentEnabled: boolean;
    hardContentEnabled: boolean;
    crewId?: string | null;
  }) => request<JoinResponse>("/api/rooms", { method: "POST", body: JSON.stringify(body) }),

  crew: (crewId: string) =>
    request<{ crewId: string; entries: CrewEntry[] }>(`/api/crews/${crewId}`, { method: "GET" }),

  resetCrew: (crewId: string) =>
    request<{ reset: boolean }>(`/api/crews/${crewId}/reset`, { method: "POST" }),

  rematch: (code: string, token: string) =>
    request<{ code: string; alreadyOpen: boolean }>(
      `/api/rooms/${code}/rematch`,
      { method: "POST" },
      token,
    ),

  joinRoom: (code: string, name: string) =>
    request<JoinResponse>(`/api/rooms/${code}/join`, {
      method: "POST",
      body: JSON.stringify({ name }),
    }),

  start: (code: string, token: string) =>
    request<{ started: boolean }>(`/api/rooms/${code}/start`, { method: "POST" }, token),

  me: (code: string, token: string) =>
    request<MyStateResponse>(`/api/rooms/${code}/me`, { method: "GET" }, token),

  arm: (code: string, token: string, cardId: string) =>
    request<{ armedCardId: string; armedUntil: string }>(
      `/api/rooms/${code}/arm`,
      { method: "POST", body: JSON.stringify({ cardId }) },
      token,
    ),

  claim: (code: string, token: string) =>
    request<{ claimId: string; cardId: string; contestEndsAt: string }>(
      `/api/rooms/${code}/claim`,
      { method: "POST" },
      token,
    ),

  accuse: (code: string, token: string, accusedId: string) =>
    request<{ wasCorrect: boolean; penalizedId: string; drawnCount: number; pointsLost: number }>(
      `/api/rooms/${code}/accuse`,
      { method: "POST", body: JSON.stringify({ accusedId }) },
      token,
    ),

  contest: (code: string, token: string, claimId: string, saidIt: boolean) =>
    request<{ resolved: Array<{ claimId: string; status: string }>; winnerId: string | null }>(
      `/api/rooms/${code}/contest`,
      { method: "POST", body: JSON.stringify({ claimId, saidIt }) },
      token,
    ),

  result: (code: string) =>
    request<{
      code: string;
      phase: string;
      winnerPlayerId: string | null;
      players: Array<{
        name: string;
        cardsCompleted: number;
        correctAccusations: number;
        wrongAccusations: number;
        timesCaught: number;
        isWinner: boolean;
      }>;
    }>(`/api/rooms/${code}/result`, { method: "GET" }),

  kick: (code: string, token: string, playerId: string) =>
    request<{ removed: string }>(
      `/api/rooms/${code}/kick`,
      { method: "POST", body: JSON.stringify({ playerId }) },
      token,
    ),

  sweep: (code: string) =>
    request<{ resolved: Array<{ claimId: string; status: string }>; winnerId: string | null }>(
      `/api/rooms/${code}/sweep`,
      { method: "POST" },
    ),
};
