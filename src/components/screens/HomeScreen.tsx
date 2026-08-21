"use client";

import { BlockPattern } from "@/components/ui/BlockPattern";
import { Button } from "@/components/ui/Button";
import { Wordmark } from "@/components/ui/Wordmark";
import { brand, copy } from "@/data/copy";
import { useAppState } from "@/components/layout/AppStateProvider";
import { Screen as ScreenName } from "@/types/navigation";

export function HomeScreen() {
  const { goTo, draftController } = useAppState();

  const startNewMatch = () => {
    draftController.resetDraft();
    goTo(ScreenName.MatchSetup);
  };

  return (
    <div className="gradient-stage relative flex min-h-dvh flex-col justify-between overflow-hidden px-6 pb-[calc(var(--safe-bottom)+2rem)] pt-[calc(var(--safe-top)+4rem)]">
      <BlockPattern
        className="pointer-events-none absolute -right-10 top-10 h-72 w-72 rotate-12 text-violet-400"
        opacity={0.12}
      />
      <BlockPattern
        className="pointer-events-none absolute -left-16 bottom-24 h-64 w-64 -rotate-6 text-cyan-soft"
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

      <div className="relative z-10 flex flex-col gap-3">
        <Button variant="mint" size="lg" fullWidth onClick={startNewMatch}>
          {copy.home.play}
        </Button>
        <Button variant="secondary" size="lg" fullWidth onClick={() => goTo(ScreenName.HowToPlay)}>
          {copy.home.howToPlay}
        </Button>
        <div className="flex gap-3">
          <Button variant="ghost" fullWidth onClick={() => goTo(ScreenName.Scoreboard)}>
            {copy.home.scoreboard}
          </Button>
          <Button variant="ghost" fullWidth onClick={() => goTo(ScreenName.Settings)}>
            {copy.home.settings}
          </Button>
        </div>
      </div>
    </div>
  );
}
