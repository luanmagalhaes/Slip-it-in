"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api, type MyStateResponse } from "@/lib/api/client";
import { browserClient } from "@/lib/supabase/browser";
import type { ClaimRow, EventRow, PlayerRow, RoomRow } from "@/types/room";

interface UseRoomInput {
  code: string | null;
  token: string | null;
}

export interface RoomSnapshot {
  room: RoomRow | null;
  players: PlayerRow[];
  claims: ClaimRow[];
  events: EventRow[];
  me: MyStateResponse | null;
  loading: boolean;
  error: string | null;
}

const sweepIntervalMs = 5000;
const pollIntervalMs = 4000;

export function useRoom({ code, token }: UseRoomInput) {
  const [room, setRoom] = useState<RoomRow | null>(null);
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [claims, setClaims] = useState<ClaimRow[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [me, setMe] = useState<MyStateResponse | null>(null);
  const [myVotedClaimIds, setMyVotedClaimIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const roomIdRef = useRef<string | null>(null);
  const myPlayerIdRef = useRef<string | null>(null);

  const refreshMe = useCallback(async () => {
    if (!code || !token) {
      return;
    }

    try {
      const next = await api.me(code, token);

      myPlayerIdRef.current = next.playerId;
      setMe(next);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "erro ao carregar sua mao");
    }
  }, [code, token]);

  const refreshPublic = useCallback(async () => {
    if (!code) {
      return;
    }

    const client = browserClient();
    const { data: roomRow } = await client
      .from("rooms")
      .select("*")
      .eq("code", code.toUpperCase())
      .maybeSingle();

    if (!roomRow) {
      setError("sala nao encontrada");
      setLoading(false);
      return;
    }

    roomIdRef.current = roomRow.id as string;
    setRoom(roomRow as RoomRow);

    const [playerRows, claimRows, eventRows, voteRows] = await Promise.all([
      client.from("players").select("*").eq("room_id", roomRow.id).order("seat"),
      client
        .from("claims")
        .select("*")
        .eq("room_id", roomRow.id)
        .order("created_at", { ascending: false })
        .limit(30),
      client
        .from("match_events")
        .select("*")
        .eq("room_id", roomRow.id)
        .order("sequence", { ascending: false })
        .limit(40),
      client
        .from("contest_votes")
        .select("claim_id, voter_id, claims!inner(room_id)")
        .eq("claims.room_id", roomRow.id),
    ]);

    setPlayers((playerRows.data ?? []) as PlayerRow[]);
    setClaims((claimRows.data ?? []) as ClaimRow[]);
    setEvents((eventRows.data ?? []) as EventRow[]);
    setMyVotedClaimIds(
      (voteRows.data ?? [])
        .filter((vote) => vote.voter_id === myPlayerIdRef.current)
        .map((vote) => vote.claim_id as string),
    );
    setLoading(false);
  }, [code]);

  const refreshAll = useCallback(async () => {
    await Promise.all([refreshPublic(), refreshMe()]);
  }, [refreshMe, refreshPublic]);

  useEffect(() => {
    if (!code) {
      return;
    }

    const timer = window.setTimeout(() => {
      void refreshAll();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [code, refreshAll]);

  useEffect(() => {
    const roomId = room?.id;

    if (!code || !roomId) {
      return;
    }

    const client = browserClient();
    const scoped = { schema: "public", filter: `room_id=eq.${roomId}` } as const;
    const channel = client
      .channel(`room-${roomId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "rooms", filter: `id=eq.${roomId}` }, () => {
        void refreshAll();
      })
      .on("postgres_changes", { event: "*", table: "players", ...scoped }, () => {
        void refreshAll();
      })
      .on("postgres_changes", { event: "*", table: "claims", ...scoped }, () => {
        void refreshAll();
      })
      .on("postgres_changes", { event: "*", table: "match_events", ...scoped }, () => {
        void refreshAll();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "contest_votes" }, () => {
        void refreshAll();
      })
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  }, [code, room?.id, refreshAll]);

  useEffect(() => {
    if (!code) {
      return;
    }

    const tick = () => {
      if (document.visibilityState === "visible") {
        void refreshAll();
      }
    };

    const timer = window.setInterval(tick, pollIntervalMs);

    document.addEventListener("visibilitychange", tick);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [code, refreshAll]);

  const pendingDeadlines = claims
    .filter((claim) => claim.status === "PENDING")
    .map((claim) => claim.contest_ends_at)
    .join("|");

  useEffect(() => {
    if (!code || room?.phase !== "PLAYING" || !pendingDeadlines) {
      return;
    }

    const sweepIfStale = () => {
      const stale = pendingDeadlines
        .split("|")
        .some((deadline) => new Date(deadline).getTime() <= Date.now());

      if (stale) {
        void api.sweep(code).catch(() => undefined);
      }
    };

    const timer = window.setInterval(sweepIfStale, sweepIntervalMs);

    return () => window.clearInterval(timer);
  }, [code, room?.phase, pendingDeadlines]);

  return {
    room,
    players,
    claims,
    events,
    me,
    myVotedClaimIds,
    loading,
    error,
    refreshAll,
    refreshMe,
    setError,
  };
}
