"use client";

import { useCallback, useEffect, useState } from "react";
import { CreateRoomScreen } from "@/components/online/CreateRoomScreen";
import { GameScreen } from "@/components/online/GameScreen";
import { JoinRoomScreen } from "@/components/online/JoinRoomScreen";
import { LandingScreen } from "@/components/online/LandingScreen";
import { LobbyScreen } from "@/components/online/LobbyScreen";
import { ScoreboardScreen } from "@/components/online/ScoreboardScreen";
import { VictoryScreen } from "@/components/online/VictoryScreen";
import { HowToPlayScreen } from "@/components/screens/HowToPlayScreen";
import { api } from "@/lib/api/client";
import { useCrewScoreboard } from "@/hooks/useCrewScoreboard";
import { useNow } from "@/hooks/useNow";
import { useRoom } from "@/hooks/useRoom";
import { useSession } from "@/hooks/useSession";
import { usePendingRequests } from "@/hooks/usePendingRequests";
import { JoinRequestSheet } from "@/components/online/JoinRequestSheet";
import { WaitingApprovalScreen } from "@/components/online/WaitingApprovalScreen";
import {
  clearPendingJoin,
  forgetSeat,
  inviteCodeFromUrl,
  readPendingJoin,
  recentSeats,
  rememberCrewId,
  rememberedCrewId,
  seatFor,
  writePendingJoin,
  type PendingJoin,
} from "@/lib/session/storage";
import { RoomPhase } from "@/types/room";

type View = "LANDING" | "CREATE" | "JOIN" | "HOW_TO_PLAY" | "SCOREBOARD";

export function OnlineApp() {
  const { session, save, clear } = useSession();
  const [view, setView] = useState<View>(() => (inviteCodeFromUrl() ? "JOIN" : "LANDING"));
  const [prefilledCode] = useState(inviteCodeFromUrl);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [insertingCardId, setInsertingCardId] = useState<string | null>(null);
  const [pendingJoin, setPendingJoin] = useState<PendingJoin | null>(() =>
    typeof window === "undefined" ? null : readPendingJoin(),
  );
  const [rejected, setRejected] = useState(false);
  const now = useNow();

  const { room, players, claims, events, me, myVotedClaimIds, loading, error, refreshAll } =
    useRoom({
      code: session?.code ?? null,
      token: session?.accessToken ?? null,
    });

  const crewId = room?.crew_id ?? session?.crewId ?? null;
  const joinRequests = usePendingRequests({
    code: session?.code ?? null,
    token: session?.accessToken ?? null,
    isHost: Boolean(me?.isHost) && room?.phase === RoomPhase.Playing,
  });
  const crew = useCrewScoreboard(view === "SCOREBOARD" ? crewId : null);

  useEffect(() => {
    if (!actionError) {
      return;
    }

    const timer = window.setTimeout(() => setActionError(null), 4000);

    return () => window.clearTimeout(timer);
  }, [actionError]);

  useEffect(() => {
    rememberCrewId(room?.crew_id ?? null);
  }, [room?.crew_id]);

  const run = useCallback(
    async (action: () => Promise<unknown>) => {
      setBusy(true);
      setActionError(null);

      try {
        await action();
        await refreshAll();
      } catch (cause) {
        setActionError(cause instanceof Error ? cause.message : "algo deu errado, tente de novo");
      } finally {
        setBusy(false);
      }
    },
    [refreshAll],
  );

  const handleCreate = (input: {
    hostName: string;
    adultContentEnabled: boolean;
    hardContentEnabled: boolean;
    keepCrew: boolean;
  }) =>
    run(async () => {
      const created = await api.createRoom({
        hostName: input.hostName,
        adultContentEnabled: input.adultContentEnabled,
        hardContentEnabled: input.hardContentEnabled,
        crewId: input.keepCrew ? rememberedCrewId() : null,
      });

      if (created.pending) {
        return;
      }

      rememberCrewId(created.crewId);
      save({
        code: created.code,
        playerId: created.playerId,
        accessToken: created.accessToken,
        name: input.hostName,
        crewId: created.crewId,
      });
      setView("LANDING");
    });

  const handleJoin = (input: { code: string; name: string }) =>
    run(async () => {
      const known = seatFor(input.code, input.name);

      if (known) {
        rememberCrewId(known.crewId);
        save({
          code: known.code,
          playerId: known.playerId,
          accessToken: known.accessToken,
          name: known.name,
          crewId: known.crewId,
        });
        setView("LANDING");

        return;
      }

      const joined = await api.joinRoom(input.code, input.name);

      if (joined.pending) {
        const waiting = {
          code: joined.code,
          name: input.name,
          requestToken: joined.requestToken,
        };

        writePendingJoin(waiting);
        setPendingJoin(waiting);
        setRejected(false);

        return;
      }

      rememberCrewId(joined.crewId);
      save({
        code: joined.code,
        playerId: joined.playerId,
        accessToken: joined.accessToken,
        name: input.name,
        crewId: joined.crewId,
      });
      setView("LANDING");
    });

  const giveUpWaiting = () => {
    clearPendingJoin();
    setPendingJoin(null);
    setRejected(false);
    setView("LANDING");
  };

  const resume = (code: string, name: string) => {
    const seat = seatFor(code, name);

    if (!seat) {
      return;
    }

    rememberCrewId(seat.crewId);
    save({
      code: seat.code,
      playerId: seat.playerId,
      accessToken: seat.accessToken,
      name: seat.name,
      crewId: seat.crewId,
    });
    setView("LANDING");
  };

  const leave = () => {
    clear();
    setView("LANDING");
  };

  useEffect(() => {
    if (!pendingJoin) {
      return;
    }

    const check = async () => {
      try {
        const status = await api.joinStatus(pendingJoin.code, pendingJoin.requestToken);

        if (status.status === "APPROVED" && status.accessToken && status.playerId) {
          rememberCrewId(status.crewId);
          save({
            code: status.code,
            playerId: status.playerId,
            accessToken: status.accessToken,
            name: status.name,
            crewId: status.crewId,
          });
          clearPendingJoin();
          setPendingJoin(null);
        }

        if (status.status === "REJECTED") {
          setRejected(true);
        }
      } catch {
        return;
      }
    };

    const first = window.setTimeout(() => void check(), 400);
    const timer = window.setInterval(() => void check(), 3000);

    return () => {
      window.clearTimeout(first);
      window.clearInterval(timer);
    };
  }, [pendingJoin, save]);

  const scoreboard = (
    <ScoreboardScreen
      entries={crew.entries}
      loading={crew.loading}
      error={crew.error}
      hasCrew={Boolean(crewId)}
      onBack={() => setView("LANDING")}
      onReset={crew.reset}
    />
  );

  if (view === "SCOREBOARD") {
    return scoreboard;
  }

  if (pendingJoin && !session) {
    return (
      <WaitingApprovalScreen
        code={pendingJoin.code}
        name={pendingJoin.name}
        rejected={rejected}
        onCancel={giveUpWaiting}
      />
    );
  }

  if (!session) {
    if (view === "CREATE") {
      return (
        <CreateRoomScreen
          busy={busy}
          error={actionError}
          canKeepCrew={Boolean(rememberedCrewId())}
          onBack={() => setView("LANDING")}
          onSubmit={handleCreate}
        />
      );
    }

    if (view === "JOIN") {
      return (
        <JoinRoomScreen
          busy={busy}
          error={actionError}
          initialCode={prefilledCode}
          onBack={() => setView("LANDING")}
          onSubmit={handleJoin}
        />
      );
    }

    if (view === "HOW_TO_PLAY") {
      return <HowToPlayScreen onBack={() => setView("LANDING")} />;
    }

    return (
      <LandingScreen
        seats={recentSeats()}
        onResume={resume}
        onForget={forgetSeat}
        onCreate={() => setView("CREATE")}
        onJoin={() => setView("JOIN")}
        onHowToPlay={() => setView("HOW_TO_PLAY")}
        onScoreboard={() => setView("SCOREBOARD")}
      />
    );
  }

  if (loading || !room) {
    return (
      <div className="gradient-stage flex min-h-dvh flex-col items-center justify-center gap-4 px-8 text-center">
        <p className="font-game text-lg text-cream">{error ?? "Carregando a sala..."}</p>
        {error ? (
          <button
            type="button"
            onClick={leave}
            className="font-game rounded-2xl bg-violet-800 px-5 py-3 text-cream ring-1 ring-violet-400/30"
          >
            Sair da sala
          </button>
        ) : null}
      </div>
    );
  }

  if (room.phase === RoomPhase.Finished) {
    return (
      <VictoryScreen
        players={players}
        winnerId={room.winner_player_id}
        myPlayerId={me?.playerId ?? session.playerId}
        isHost={me?.isHost ?? false}
        busy={busy}
        error={actionError}
        onRematch={() =>
          run(async () => {
            const next = await api.rematch(session.code, session.accessToken);
            const joined = await api.joinRoom(next.code, session.name);

            if (joined.pending) {
              return;
            }

            save({
              code: joined.code,
              playerId: joined.playerId,
              accessToken: joined.accessToken,
              name: session.name,
              crewId: joined.crewId,
            });
          })
        }
        onScoreboard={() => setView("SCOREBOARD")}
        onExit={leave}
      />
    );
  }

  if (room.phase === RoomPhase.Lobby) {
    return (
      <LobbyScreen
        room={room}
        players={players}
        isHost={me?.isHost ?? false}
        busy={busy}
        error={actionError}
        onStart={() => run(() => api.start(session.code, session.accessToken))}
        onKick={(playerId) => run(() => api.kick(session.code, session.accessToken, playerId))}
        onScoreboard={() => setView("SCOREBOARD")}
        onLeave={leave}
      />
    );
  }

  if (!me) {
    return <div className="gradient-stage min-h-dvh" />;
  }

  const firstRequest = joinRequests.requests[0];

  return (
    <>
      {firstRequest ? (
        <JoinRequestSheet
          request={firstRequest}
          busy={busy}
          onResolve={(requestId, approve) =>
            run(async () => {
              await api.resolveRequest(session.code, session.accessToken, requestId, approve);
              await joinRequests.refresh();
            })
          }
        />
      ) : null}
      <GameScreen
        code={room.code}
        me={me}
        players={players}
        claims={claims}
        events={events}
        myVotedClaimIds={myVotedClaimIds}
        now={now}
        busy={busy}
        error={actionError}
        insertingCardId={insertingCardId}
        onArm={(cardId) => run(() => api.arm(session.code, session.accessToken, cardId))}
        onClaim={() =>
          run(async () => {
            const claimed = await api.claim(session.code, session.accessToken);

            setInsertingCardId(claimed.cardId);
          })
        }
        onAccuse={(playerId) => run(() => api.accuse(session.code, session.accessToken, playerId))}
        onVote={(claimId, saidIt) =>
          run(() => api.contest(session.code, session.accessToken, claimId, saidIt))
        }
        onInsertFinished={() => setInsertingCardId(null)}
      />
    </>
  );
}
