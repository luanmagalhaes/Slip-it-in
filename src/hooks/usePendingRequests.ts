"use client";

import { useCallback, useEffect, useState } from "react";
import { api, type JoinRequestSummary } from "@/lib/api/client";

const pollMs = 4000;

export function usePendingRequests(input: {
  code: string | null;
  token: string | null;
  isHost: boolean;
}) {
  const [requests, setRequests] = useState<JoinRequestSummary[]>([]);

  const refresh = useCallback(async () => {
    if (!input.code || !input.token || !input.isHost) {
      setRequests([]);

      return;
    }

    try {
      const data = await api.pendingRequests(input.code, input.token);

      setRequests(data.requests);
    } catch {
      setRequests([]);
    }
  }, [input.code, input.token, input.isHost]);

  useEffect(() => {
    if (!input.isHost) {
      return;
    }

    const tick = () => {
      if (document.visibilityState === "visible") {
        void refresh();
      }
    };

    const first = window.setTimeout(tick, 0);
    const timer = window.setInterval(tick, pollMs);

    return () => {
      window.clearTimeout(first);
      window.clearInterval(timer);
    };
  }, [input.isHost, refresh]);

  return { requests, refresh };
}
