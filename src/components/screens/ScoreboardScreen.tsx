"use client";

import { useState } from "react";
import { useAppState } from "@/components/layout/AppStateProvider";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Sheet } from "@/components/ui/Sheet";
import { copy } from "@/data/copy";
import { rankedEntries } from "@/lib/scoreboard/scoreboardOperations";
import { Screen as ScreenName } from "@/types/navigation";

type PendingAction = "RESET" | "CLEAR" | null;

const medals = ["🥇", "🥈", "🥉"];

export function ScoreboardScreen() {
  const { goTo, scoreboardController } = useAppState();
  const [pending, setPending] = useState<PendingAction>(null);
  const entries = rankedEntries(scoreboardController.scoreboard);

  const confirm = () => {
    if (pending === "RESET") {
      scoreboardController.resetAllPoints();
    }

    if (pending === "CLEAR") {
      scoreboardController.removeAllPlayers();
    }

    setPending(null);
  };

  return (
    <>
      <Screen
        footer={
          <div className="flex gap-2">
            <Button variant="secondary" fullWidth onClick={() => setPending("RESET")}>
              {copy.scoreboard.resetPoints}
            </Button>
            <Button variant="ghost" fullWidth onClick={() => setPending("CLEAR")}>
              {copy.scoreboard.clearPlayers}
            </Button>
          </div>
        }
      >
        <ScreenHeader title={copy.scoreboard.title} onBack={() => goTo(ScreenName.Home)} />

        {entries.length === 0 ? (
          <p className="mt-10 text-center text-sm text-violet-400">{copy.scoreboard.empty}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {entries.map((entry, index) => (
              <li
                key={entry.playerId}
                className="animate-card-rise rounded-2xl bg-violet-900/60 p-4 ring-1 ring-violet-400/15"
                style={{ animationDelay: `${index * 35}ms` }}
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 shrink-0 text-center font-display text-lg leading-none text-violet-300">
                    {medals[index] ?? index + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-semibold text-cream">
                    {entry.name}
                  </span>
                  <span className="font-display text-2xl leading-none text-mint">
                    {entry.points}
                  </span>
                  <span className="text-xs text-violet-400">{copy.scoreboard.points}</span>
                </div>
                <div className="mt-2 flex gap-4 pl-10 text-xs text-violet-400">
                  <span>{`${entry.matchesPlayed} ${copy.scoreboard.matches}`}</span>
                  <span>{`${entry.matchesWon} ${copy.scoreboard.wins}`}</span>
                  <span>{`${entry.cardsCompleted} ${copy.scoreboard.cards}`}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Screen>

      {pending ? (
        <Sheet
          title={pending === "RESET" ? copy.scoreboard.resetPoints : copy.scoreboard.clearPlayers}
          subtitle={pending === "RESET" ? copy.scoreboard.confirmReset : copy.scoreboard.confirmClear}
          onClose={() => setPending(null)}
        >
          <div className="flex flex-col gap-3">
            <Button variant="danger" size="lg" fullWidth onClick={confirm}>
              {copy.scoreboard.confirm}
            </Button>
            <Button variant="ghost" fullWidth onClick={() => setPending(null)}>
              {copy.scoreboard.cancel}
            </Button>
          </div>
        </Sheet>
      ) : null}
    </>
  );
}
