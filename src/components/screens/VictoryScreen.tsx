"use client";

import { useAppState } from "@/components/layout/AppStateProvider";
import { Button } from "@/components/ui/Button";
import { Confetti } from "@/components/ui/Confetti";
import { Wordmark } from "@/components/ui/Wordmark";
import { copy } from "@/data/copy";
import { calculateMatchPoints } from "@/lib/scoreboard/calculateMatchPoints";
import { findById } from "@/utils/collections";
import { Screen as ScreenName } from "@/types/navigation";

export function VictoryScreen() {
  const { goTo, matchController, scoreboardController, draftController } = useAppState();
  const match = matchController.match;

  if (!match || !match.winnerId) {
    return null;
  }

  const winner = findById(match.players, match.winnerId);
  const points = calculateMatchPoints(match, scoreboardController.scoreboard.rules);

  const save = (playAgain: boolean) => {
    scoreboardController.commitMatch(match);
    matchController.send({ type: "END_MATCH" });

    if (playAgain) {
      goTo(ScreenName.Players);
      return;
    }

    draftController.resetDraft();
    goTo(ScreenName.Scoreboard);
  };

  return (
    <div className="gradient-stage relative flex min-h-dvh flex-col justify-between overflow-hidden px-6 pb-[calc(var(--safe-bottom)+1.5rem)] pt-[calc(var(--safe-top)+3rem)]">
      <Confetti />

      <div className="relative z-10 text-center">
        <Wordmark size="sm" className="opacity-50" />
        <p className="animate-card-rise mt-6 font-display text-5xl leading-none tracking-wide text-mint">
          {copy.victory.title}
        </p>
        <p className="mt-5 font-display text-3xl leading-none tracking-wide text-cream">
          {winner?.name}
        </p>
        <p className="mt-1 text-sm text-violet-300">{copy.victory.subtitle}</p>
      </div>

      <ul className="relative z-10 my-6 flex flex-col gap-2">
        {[...points]
          .sort((left, right) => right.points - left.points)
          .map((entry, index) => {
            const player = findById(match.players, entry.playerId);

            return (
              <li
                key={entry.playerId}
                className="animate-card-rise flex items-center justify-between rounded-2xl bg-violet-900/60 px-4 py-3 ring-1 ring-violet-400/15"
                style={{ animationDelay: `${index * 45}ms` }}
              >
                <span className="min-w-0 flex-1 truncate text-cream">{player?.name}</span>
                <span className="ml-3 text-xs text-violet-400">
                  {`${entry.cardsCompleted} ${copy.scoreboard.cards}`}
                </span>
                <span className="ml-4 font-display text-xl leading-none text-cyan-soft">
                  {`${entry.points > 0 ? "+" : ""}${entry.points}`}
                </span>
              </li>
            );
          })}
      </ul>

      <div className="relative z-10 flex flex-col gap-3">
        <Button variant="mint" size="lg" fullWidth onClick={() => save(true)}>
          {copy.victory.playAgain}
        </Button>
        <Button variant="secondary" size="lg" fullWidth onClick={() => save(false)}>
          {copy.victory.saveAndExit}
        </Button>
      </div>
    </div>
  );
}
