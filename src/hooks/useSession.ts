"use client";

import { useCallback, useEffect, useState } from "react";

const storageKey = "slip-it-in.session";

export interface Session {
  code: string;
  playerId: string;
  accessToken: string;
  name: string;
}

function read(): Session | null {
  try {
    const raw = window.localStorage.getItem(storageKey);

    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSession(read());
    setReady(true);
  }, []);

  const save = useCallback((next: Session) => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      return;
    } finally {
      setSession(next);
    }
  }, []);

  const clear = useCallback(() => {
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      return;
    } finally {
      setSession(null);
    }
  }, []);

  return { session, ready, save, clear };
}
