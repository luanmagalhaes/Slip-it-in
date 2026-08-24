"use client";

import { useState } from "react";
import { BlockPattern } from "@/components/ui/BlockPattern";
import { Button } from "@/components/ui/Button";
import { Wordmark } from "@/components/ui/Wordmark";
import { brand, copy } from "@/data/copy";

import type { RecentSeat } from "@/lib/session/storage";

interface LandingScreenProps {
  seats: RecentSeat[];
  onResume: (code: string, name: string) => void;
  onForget: (code: string) => void;
  onCreate: () => void;
  onJoin: () => void;
  onHowToPlay: () => void;
  onScoreboard: () => void;
}

export function LandingScreen({
  seats,
  onResume,
  onForget,
  onCreate,
  onJoin,
  onHowToPlay,
  onScoreboard,
}: LandingScreenProps) {
  const lastSeat = seats[0];
  const [pressed, setPressed] = useState(false);

  return (
    <div className="gradient-stage relative flex min-h-dvh flex-col justify-between overflow-hidden px-6 pb-[calc(var(--safe-bottom)+2rem)] pt-[calc(var(--safe-top)+4.5rem)]">
      <BlockPattern
        className="pointer-events-none absolute -right-12 top-8 h-72 w-72 rotate-12 text-violet-400"
        opacity={0.12}
      />
      <BlockPattern
        className="pointer-events-none absolute -left-16 bottom-20 h-64 w-64 -rotate-6 text-cyan-soft"
        opacity={0.08}
      />

      <div className="relative z-10 text-center">
        <div className="animate-card-rise">
          <Wordmark size="xl" />
        </div>
        <p className="mx-auto mt-6 max-w-[17rem] text-base leading-relaxed text-violet-200">
          {brand.tagline}
        </p>
      </div>

      <div className="relative z-10 flex flex-col gap-3.5">
        {lastSeat ? (
          <div className="animate-card-rise mb-1 rounded-[1.5rem] bg-violet-900/70 p-3.5 ring-1 ring-cyan-soft/30">
            <p className="mb-2.5 px-1 text-xs text-violet-200">
              {`Você estava na sala ${lastSeat.code} como ${lastSeat.name}.`}
            </p>
            <div className="flex gap-2.5">
              <Button
                variant="primary"
                fullWidth
                onClick={() => onResume(lastSeat.code, lastSeat.name)}
              >
                Voltar pra sala
              </Button>
              <Button variant="ghost" onClick={() => onForget(lastSeat.code)}>
                Esquecer
              </Button>
            </div>
          </div>
        ) : null}

        <Button
          variant="mint"
          size="lg"
          fullWidth
          onClick={() => {
            setPressed(true);
            onCreate();
          }}
          disabled={pressed}
        >
          {copy.home.createRoom}
        </Button>
        <Button variant="secondary" size="lg" fullWidth onClick={onJoin}>
          {copy.home.joinRoom}
        </Button>
        <div className="mt-1 grid grid-cols-2 gap-3">
          <Button variant="ghost" fullWidth onClick={onHowToPlay}>
            {copy.home.howToPlay}
          </Button>
          <Button variant="ghost" fullWidth onClick={onScoreboard}>
            {copy.home.scoreboard}
          </Button>
        </div>
        <p className="mt-3 text-center text-xs text-violet-300/60">{copy.home.footNote}</p>
      </div>
    </div>
  );
}
