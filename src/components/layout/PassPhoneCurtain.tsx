"use client";

import { CardBack } from "@/components/cards/CardBack";
import { Button } from "@/components/ui/Button";
import { copy } from "@/data/copy";

interface PassPhoneCurtainProps {
  playerName: string;
  onReveal: () => void;
}

export function PassPhoneCurtain({ playerName, onReveal }: PassPhoneCurtainProps) {
  return (
    <div className="gradient-stage fixed inset-0 z-30 flex flex-col items-center justify-center gap-7 px-7 text-center">
      <div className="animate-glow-drift">
        <CardBack className="h-40 w-28" />
      </div>

      <div>
        <p className="text-sm uppercase tracking-widest text-violet-300">{copy.curtain.prefix}</p>
        <p className="mt-2 font-display text-4xl leading-none tracking-wide text-cream">
          {playerName}
        </p>
      </div>

      <p className="max-w-xs text-sm text-violet-300">{copy.curtain.instruction}</p>

      <Button variant="mint" size="lg" fullWidth onClick={onReveal} className="max-w-xs">
        {copy.curtain.reveal}
      </Button>

      <p className="text-xs text-violet-400/80">{copy.curtain.hideWarning}</p>
    </div>
  );
}
