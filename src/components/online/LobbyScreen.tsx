"use client";

import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import type { PlayerRow, RoomRow } from "@/types/room";

interface LobbyScreenProps {
  room: RoomRow;
  players: PlayerRow[];
  isHost: boolean;
  busy: boolean;
  error: string | null;
  onStart: () => void;
  onLeave: () => void;
}

export function LobbyScreen({
  room,
  players,
  isHost,
  busy,
  error,
  onStart,
  onLeave,
}: LobbyScreenProps) {
  const enough = players.length >= 3;

  return (
    <Screen
      footer={
        isHost ? (
          <Button
            variant="mint"
            size="lg"
            fullWidth
            disabled={busy || !enough}
            onClick={onStart}
          >
            {enough ? "Começar partida" : `Faltam ${3 - players.length} jogador(es)`}
          </Button>
        ) : (
          <p className="text-center text-sm text-violet-300">
            Esperando o host começar a partida...
          </p>
        )
      }
    >
      <ScreenHeader title="Sala aberta" subtitle="Mande o código pra galera." onBack={onLeave} />

      <div className="edge-raised gradient-mint mb-7 rounded-[1.75rem] px-6 py-5 text-center text-ink">
        <span className="block text-xs font-bold uppercase tracking-[0.2em] opacity-70">
          Código da sala
        </span>
        <span className="font-display mt-1 block text-5xl tracking-[0.22em]">{room.code}</span>
      </div>

      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-game text-lg text-cream">Na mesa</h2>
        <span className="text-sm text-violet-300">{players.length} de 12</span>
      </div>

      <ul className="flex flex-col gap-2">
        {players.map((player, index) => (
          <li
            key={player.id}
            className="animate-card-rise flex items-center gap-3 rounded-2xl bg-violet-900/55 p-3.5 ring-1 ring-violet-400/15"
            style={{ animationDelay: `${index * 45}ms` }}
          >
            <span className="gradient-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-display text-base text-cream">
              {player.seat}
            </span>
            <span className="font-game min-w-0 flex-1 truncate text-cream">{player.name}</span>
            {player.is_host ? (
              <span className="rounded-full bg-cyan-soft/20 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-cyan-soft">
                host
              </span>
            ) : null}
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-wrap gap-2">
        {room.adult_content_enabled ? (
          <Badge tone="pink">18+ ligado</Badge>
        ) : (
          <Badge tone="mint">Sem 18+</Badge>
        )}
        {room.hard_content_enabled ? <Badge tone="pink">Explícitas ligadas</Badge> : null}
      </div>

      {error ? (
        <p className="mt-5 rounded-2xl bg-pink-hot/15 p-4 text-sm text-pink-soft ring-1 ring-pink-hot/30">
          {error}
        </p>
      ) : null}
    </Screen>
  );
}

function Badge({ tone, children }: { tone: "pink" | "mint"; children: string }) {
  const classes =
    tone === "pink"
      ? "bg-pink-hot/20 text-pink-soft ring-pink-hot/30"
      : "bg-mint/15 text-mint ring-mint/30";

  return (
    <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ${classes}`}>
      {children}
    </span>
  );
}
