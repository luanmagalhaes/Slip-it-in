"use client";

import { useState } from "react";
import { BlockPattern } from "@/components/ui/BlockPattern";
import { Button } from "@/components/ui/Button";
import { Wordmark } from "@/components/ui/Wordmark";
import { brand, copy } from "@/data/copy";

interface LandingScreenProps {
  onCreate: () => void;
  onJoin: () => void;
  onHowToPlay: () => void;
}

export function LandingScreen({ onCreate, onJoin, onHowToPlay }: LandingScreenProps) {
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
        <Button variant="ghost" fullWidth onClick={onHowToPlay}>
          {copy.home.howToPlay}
        </Button>
        <p className="mt-3 text-center text-xs text-violet-300/60">{copy.home.footNote}</p>
      </div>
    </div>
  );
}
