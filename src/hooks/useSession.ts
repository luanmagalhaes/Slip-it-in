"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  clearSession,
  serverSessionSnapshot,
  sessionSnapshot,
  subscribeToSession,
  writeSession,
  type Session,
} from "@/lib/session/storage";

export type { Session };

export function useSession() {
  const session = useSyncExternalStore(
    subscribeToSession,
    sessionSnapshot,
    serverSessionSnapshot,
  );

  const save = useCallback((next: Session) => writeSession(next), []);
  const clear = useCallback(() => clearSession(), []);

  return { session, save, clear };
}
