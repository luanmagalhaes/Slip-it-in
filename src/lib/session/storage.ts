export interface Session {
  code: string;
  playerId: string;
  accessToken: string;
  name: string;
  crewId?: string | null;
}

const storageKey = "slip-it-in.session";
const crewKey = "slip-it-in.crew";
const recentKey = "slip-it-in.recent";
const maxRecent = 6;
const listeners = new Set<() => void>();

let cachedRaw: string | null = null;
let cachedSession: Session | null = null;
let inviteCode: string | null = null;
let bootstrapped = false;

function parse(raw: string | null): Session | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Session;

    return parsed.code && parsed.accessToken ? parsed : null;
  } catch {
    return null;
  }
}

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(storageKey);
  } catch {
    return null;
  }
}

function writeRaw(raw: string | null) {
  try {
    if (raw === null) {
      window.localStorage.removeItem(storageKey);
    } else {
      window.localStorage.setItem(storageKey, raw);
    }
  } catch {
    return;
  }
}

function bootstrapFromUrl() {
  if (bootstrapped || typeof window === "undefined") {
    return;
  }

  bootstrapped = true;

  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  const token = params.get("token");
  const invite = params.get("join");

  if (!code && !token && !invite) {
    return;
  }

  if (code && token && process.env.NODE_ENV !== "production") {
    writeRaw(
      JSON.stringify({
        code: code.toUpperCase(),
        playerId: "",
        accessToken: token,
        name: params.get("name") ?? "Jogador",
      }),
    );
  } else if (invite) {
    inviteCode = invite.toUpperCase();
  }

  window.history.replaceState({}, "", window.location.pathname);
}

export interface RecentSeat {
  code: string;
  name: string;
  accessToken: string;
  playerId: string;
  crewId: string | null;
  savedAt: number;
}

function readRecent(): RecentSeat[] {
  try {
    const raw = window.localStorage.getItem(recentKey);
    const parsed = raw ? (JSON.parse(raw) as RecentSeat[]) : [];

    return Array.isArray(parsed) ? parsed.filter((seat) => seat.code && seat.accessToken) : [];
  } catch {
    return [];
  }
}

function writeRecent(seats: RecentSeat[]) {
  try {
    window.localStorage.setItem(recentKey, JSON.stringify(seats.slice(0, maxRecent)));
  } catch {
    return;
  }
}

export function recentSeats(): RecentSeat[] {
  return readRecent().sort((a, b) => b.savedAt - a.savedAt);
}

export function rememberSeat(session: Session, savedAt: number) {
  const others = readRecent().filter(
    (seat) => !(seat.code === session.code && seat.name === session.name),
  );

  writeRecent([
    {
      code: session.code,
      name: session.name,
      accessToken: session.accessToken,
      playerId: session.playerId,
      crewId: session.crewId ?? null,
      savedAt,
    },
    ...others,
  ]);
}

export function seatFor(code: string, name: string): RecentSeat | null {
  const wanted = name.trim().toLowerCase();

  return (
    readRecent().find(
      (seat) => seat.code === code.toUpperCase() && seat.name.trim().toLowerCase() === wanted,
    ) ?? null
  );
}

export function forgetSeat(code: string) {
  writeRecent(readRecent().filter((seat) => seat.code !== code.toUpperCase()));
}

export function rememberedCrewId(): string | null {
  try {
    return window.localStorage.getItem(crewKey);
  } catch {
    return null;
  }
}

export function rememberCrewId(crewId: string | null) {
  if (!crewId) {
    return;
  }

  try {
    window.localStorage.setItem(crewKey, crewId);
  } catch {
    return;
  }
}

export function forgetCrewId() {
  try {
    window.localStorage.removeItem(crewKey);
  } catch {
    return;
  }
}

export function inviteCodeFromUrl(): string {
  bootstrapFromUrl();

  return inviteCode ?? "";
}

export function subscribeToSession(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener("storage", listener);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

export function sessionSnapshot(): Session | null {
  bootstrapFromUrl();

  const raw = readRaw();

  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedSession = parse(raw);
  }

  return cachedSession;
}

export function serverSessionSnapshot(): Session | null {
  return null;
}

export function writeSession(next: Session) {
  writeRaw(JSON.stringify(next));
  rememberSeat(next, Date.now());
  listeners.forEach((listener) => listener());
}

export function clearSession() {
  writeRaw(null);
  listeners.forEach((listener) => listener());
}
