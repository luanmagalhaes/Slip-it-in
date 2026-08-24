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
import { useNow } from "@/hooks/useNow";
import { useRoom } from "@/hooks/useRoom";
import { useScoreboardController } from "@/hooks/useScoreboardController";
import { useSession } from "@/hooks/useSession";
import { inviteCodeFromUrl } from "@/lib/session/storage";
import { RoomPhase } from "@/types/room";

type View = "LANDING" | "CREATE" | "JOIN" | "HOW_TO_PLAY" | "SCOREBOARD";

export function OnlineApp() {
  const { session, save, clear } = useSession();
  const [view, setView] = useState<View>(() => (inviteCodeFromUrl() ? "JOIN" : "LANDING"));
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [insertingCardId, setInsertingCardId] = useState<string | null>(null);
  const [prefilledCode] = useState(inviteCodeFromUrl);
  const now = useNow();
  const { scoreboard, resetAllPoints, removeAllPlayers, commitMatch } = useScoreboardController();
  const [committedCode, setCommittedCode] = useState<string | null>(null);

  const { room, players, claims, events, me, myVotedClaimIds, loading, error, refreshAll } = useRoom({
    code: session?.code ?? null,
    token: session?.accessToken ?? null,
  });

  useEffect(() => {
    if (!actionError) {
      return;
    }

    const timer = window.setTimeout(() => setActionError(null), 4000);

    return () => window.clearTimeout(timer);
  }, [actionError]);

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
  }) =>
    run(async () => {
      const created = await api.createRoom(input);

      save({
        code: created.code,
        playerId: created.playerId,
        accessToken: created.accessToken,
        name: input.hostName,
      });
      setView("LANDING");
    });

  const handleJoin = (input: { code: string; name: string }) =>
    run(async () => {
      const joined = await api.joinRoom(input.code, input.name);

      save({
        code: joined.code,
        playerId: joined.playerId,
        accessToken: joined.accessToken,
        name: input.name,
      });
      setView("LANDING");
    });

  const leave = () => {
    clear();
    setView("LANDING");
  };

  if (!session) {
    if (view === "CREATE") {
      return (
        <CreateRoomScreen
          busy={busy}
          error={actionError}
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

    if (view === "SCOREBOARD") {
      return (
        <ScoreboardScreen
          scoreboard={scoreboard}
          onBack={() => setView("LANDING")}
          onResetPoints={resetAllPoints}
          onClearPlayers={removeAllPlayers}
        />
      );
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
        <p className="font-game text-lg text-cream">
          {error ?? "Carregando a sala..."}
        </p>
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
        alreadySaved={committedCode === room.code}
        onSave={async () => {
          if (committedCode === room.code) {
            return;
          }

          const summary = await api.result(room.code);

          commitMatch({ code: summary.code, players: summary.players });
          setCommittedCode(room.code);
        }}
        onExit={leave}
        onScoreboard={() => {
          clear();
          setView("SCOREBOARD");
        }}
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
