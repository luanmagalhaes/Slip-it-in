"use client";

import { useCallback, useEffect, useState } from "react";
import { api, type CrewEntry } from "@/lib/api/client";

export function useCrewScoreboard(crewId: string | null) {
  const [entries, setEntries] = useState<CrewEntry[]>([]);
  const [loading, setLoading] = useState(Boolean(crewId));
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!crewId) {
      setEntries([]);
      setLoading(false);

      return;
    }

    try {
      const data = await api.crew(crewId);

      setEntries(data.entries);
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "erro ao carregar o placar");
    } finally {
      setLoading(false);
    }
  }, [crewId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refresh();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [refresh]);

  const reset = useCallback(async () => {
    if (!crewId) {
      return;
    }

    await api.resetCrew(crewId);
    await refresh();
  }, [crewId, refresh]);

  return { entries, loading, error, refresh, reset };
}
