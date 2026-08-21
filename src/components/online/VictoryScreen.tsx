"use client";

import { Confetti } from "@/components/ui/Confetti";
import { Button } from "@/components/ui/Button";
import { Wordmark } from "@/components/ui/Wordmark";
import { copy } from "@/data/copy";
import type { PlayerRow } from "@/types/room";

interface VictoryScreenProps {
  players: PlayerRow[];
  winnerId: string | null;
  myPlayerId: string;
  onExit: () => void;
}

export function VictoryScreen({ players, winnerId, myPlayerId, onExit }: VictoryScreenProps) {
  const winner = players.find((player) => player.id === winnerId);
  const iWon = winnerId === myPlayerId;
  const ranking = [...players].sort((a, b) => a.hand_count - b.hand_count || b.points - a.points);

  return (
    <div className="gradient-stage relative flex min-h-dvh flex-col justify-between overflow-hidden px-6 pb-[calc(var(--safe-bottom)+1.5rem)] pt-[calc(var(--safe-top)+3rem)]">
      <Confetti />

      <div className="relative z-10 text-center">
        <Wordmark size="md" />
        <h1 className="font-display mt-8 text-4xl leading-tight text-cream">
          {iWon ? copy.victory.title : `${winner?.name ?? "Alguém"} venceu`}
        </h1>
        <p className="mx-auto mt-3 max-w-[17rem] text-sm leading-relaxed text-violet-200">
          {iWon ? copy.victory.subtitle : "Zerou a mão antes de todo mundo."}
        </p>
      </div>

      <ul className="relative z-10 flex flex-col gap-2">
        {ranking.map((player, index) => (
          <li
            key={player.id}
            className={`flex items-center gap-3 rounded-2xl p-3.5 ring-1 ${
              player.id === winnerId
                ? "gradient-mint text-ink ring-mint/40"
                : "bg-violet-900/55 text-cream ring-violet-400/15"
            }`}
          >
            <span className="font-display w-6 text-lg leading-none opacity-70">{index + 1}</span>
            <span className="font-game min-w-0 flex-1 truncate">{player.name}</span>
            <span className="text-sm opacity-80">
              {player.completed_count} encaixadas · {player.points} pts
            </span>
          </li>
        ))}
      </ul>

      <div className="relative z-10 mt-6">
        <Button variant="secondary" size="lg" fullWidth onClick={onExit}>
          {copy.victory.saveAndExit}
        </Button>
      </div>
    </div>
  );
}
