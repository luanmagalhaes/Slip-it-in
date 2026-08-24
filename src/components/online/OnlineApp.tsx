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
import { inviteCodeFromUrl, rememberCrewId, rememberedCrewId } from "@/lib/session/storage";
import { RoomPhase } from "@/types/room";

type View = "LANDING" | "CREATE" | "JOIN" | "HOW_TO_PLAY" | "SCOREBOARD";

export function OnlineApp() {
  const { session, save, clear } = useSession();
  const [view, setView] = useState<View>(() => (inviteCodeFromUrl() ? "JOIN" : "LANDING"));
  const [prefilledCode] = useState(inviteCodeFromUrl);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [insertingCardId, setInsertingCardId] = useState<string | null>(null);
  const now = useNow();

  const { room, players, claims, events, me, myVotedClaimIds, loading, error, refreshAll } =
    useRoom({
      code: session?.code ?? null,
      token: session?.accessToken ?? null,
    });

  const crewId = room?.crew_id ?? session?.crewId ?? null;
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
        setActionError(cause instanceof Error ? cause.message : "erro inesperado");
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
      const joined = await api.joinRoom(input.code, input.name);

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

  const leave = () => {
    clear();
    setView("LANDING");
  };

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
        onScoreboard={() => setView("SCOREBOARD")}
        onLeave={leave}
      />
    );
  }

  if (!me) {
    return <div className="gradient-stage min-h-dvh" />;
  }

  return (
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
  );
}
