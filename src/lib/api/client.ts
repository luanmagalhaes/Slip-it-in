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
  }) => request<JoinResponse>("/api/rooms", { method: "POST", body: JSON.stringify(body) }),

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

  sweep: (code: string) =>
    request<{ resolved: Array<{ claimId: string; status: string }>; winnerId: string | null }>(
      `/api/rooms/${code}/sweep`,
      { method: "POST" },
    ),
};
