"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { copy } from "@/data/copy";
import { rankedEntries } from "@/lib/scoreboard/scoreboardOperations";
import type { Scoreboard } from "@/types/scoreboard";

interface ScoreboardScreenProps {
  scoreboard: Scoreboard;
  onBack: () => void;
  onResetPoints: () => void;
  onClearPlayers: () => void;
}

type Confirming = "NONE" | "RESET" | "CLEAR";

export function ScoreboardScreen({
  scoreboard,
  onBack,
  onResetPoints,
  onClearPlayers,
}: ScoreboardScreenProps) {
  const [confirming, setConfirming] = useState<Confirming>("NONE");
  const ranking = rankedEntries(scoreboard);

  return (
    <Screen
      footer={
        confirming === "NONE" ? (
          <div className="flex gap-2.5">
            <Button
              variant="secondary"
              fullWidth
              disabled={ranking.length === 0}
              onClick={() => setConfirming("RESET")}
            >
              {copy.scoreboard.resetPoints}
            </Button>
            <Button
              variant="danger"
              fullWidth
              disabled={ranking.length === 0}
              onClick={() => setConfirming("CLEAR")}
            >
              {copy.scoreboard.clearPlayers}
            </Button>
          </div>
        ) : (
          <div>
            <p className="mb-3 text-center text-sm text-cream">
              {confirming === "RESET"
                ? copy.scoreboard.confirmReset
                : copy.scoreboard.confirmClear}
            </p>
            <div className="flex gap-2.5">
              <Button variant="ghost" fullWidth onClick={() => setConfirming("NONE")}>
                {copy.scoreboard.cancel}
              </Button>
              <Button
                variant="danger"
                fullWidth
                onClick={() => {
                  if (confirming === "RESET") {
                    onResetPoints();
                  } else {
                    onClearPlayers();
                  }

                  setConfirming("NONE");
                }}
              >
                {copy.scoreboard.confirm}
              </Button>
            </div>
          </div>
        )
      }
    >
      <ScreenHeader
        title={copy.scoreboard.title}
        subtitle="Acumulado das partidas jogadas neste aparelho."
        onBack={onBack}
      />

      {ranking.length === 0 ? (
        <p className="rounded-2xl bg-violet-900/55 p-6 text-center text-violet-300 ring-1 ring-violet-400/15">
          {copy.scoreboard.empty}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {ranking.map((entry, index) => (
            <li
              key={entry.playerId}
              className="animate-card-rise flex items-center gap-3 rounded-2xl bg-violet-900/55 p-4 ring-1 ring-violet-400/15"
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <span
                className={`font-display flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg leading-none ${
                  index === 0 ? "gradient-mint text-ink" : "bg-violet-950 text-violet-300"
                }`}
              >
                {index + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="font-game block truncate text-cream">{entry.name}</span>
                <span className="text-xs text-violet-300">
                  {entry.matchesWon} {entry.matchesWon === 1 ? "vitória" : "vitórias"} ·{" "}
                  {entry.matchesPlayed} {entry.matchesPlayed === 1 ? "partida" : "partidas"} ·{" "}
                  {entry.cardsCompleted} encaixadas
                </span>
              </span>
              <span className="font-display text-2xl leading-none text-cyan-soft">
                {entry.points}
              </span>
            </li>
          ))}
        </ul>
      )}

      <dl className="mt-7 rounded-2xl bg-violet-950/50 p-4">
        <dt className="font-game mb-3 text-sm text-violet-200">{copy.settings.scoring}</dt>
        {[
          [copy.settings.cardCompleted, scoreboard.rules.cardCompleted],
          [copy.settings.accusationCorrect, scoreboard.rules.accusationCorrect],
          [copy.settings.accusationWrong, scoreboard.rules.accusationWrong],
          [copy.settings.caught, scoreboard.rules.caught],
          [copy.settings.matchWon, scoreboard.rules.matchWon],
        ].map(([label, value]) => (
          <div key={String(label)} className="flex justify-between py-1 text-sm">
            <dd className="text-violet-300">{label}</dd>
            <dd className={Number(value) < 0 ? "text-pink-soft" : "text-mint"}>
              {Number(value) > 0 ? `+${value}` : value}
            </dd>
          </div>
        ))}
      </dl>
    </Screen>
  );
}
