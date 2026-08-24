"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { copy } from "@/data/copy";
import type { CrewEntry } from "@/lib/api/client";

interface ScoreboardScreenProps {
  entries: CrewEntry[];
  loading: boolean;
  error: string | null;
  hasCrew: boolean;
  onBack: () => void;
  onReset: () => Promise<void>;
}

export function ScoreboardScreen({
  entries,
  loading,
  error,
  hasCrew,
  onBack,
  onReset,
}: ScoreboardScreenProps) {
  const [confirming, setConfirming] = useState(false);
  const [resetting, setResetting] = useState(false);

  return (
    <Screen
      footer={
        entries.length === 0 ? null : confirming ? (
          <div>
            <p className="mb-3 text-center text-sm text-cream">{copy.scoreboard.confirmReset}</p>
            <div className="flex gap-2.5">
              <Button variant="ghost" fullWidth onClick={() => setConfirming(false)}>
                {copy.scoreboard.cancel}
              </Button>
              <Button
                variant="danger"
                fullWidth
                disabled={resetting}
                onClick={async () => {
                  setResetting(true);
                  await onReset();
                  setResetting(false);
                  setConfirming(false);
                }}
              >
                {copy.scoreboard.confirm}
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="secondary" fullWidth onClick={() => setConfirming(true)}>
            {copy.scoreboard.resetPoints}
          </Button>
        )
      }
    >
      <ScreenHeader
        title={copy.scoreboard.title}
        subtitle="Acumulado da sua mesa, somando todas as partidas."
        onBack={onBack}
      />

      {loading ? (
        <p className="rounded-2xl bg-violet-900/40 p-6 text-center text-violet-300">
          Carregando...
        </p>
      ) : error ? (
        <p className="rounded-2xl bg-pink-hot/15 p-5 text-center text-sm text-pink-soft ring-1 ring-pink-hot/30">
          {error}
        </p>
      ) : entries.length === 0 ? (
        <p className="rounded-2xl bg-violet-900/55 p-6 text-center leading-relaxed text-violet-300 ring-1 ring-violet-400/15">
          {hasCrew
            ? "Nenhuma partida terminada ainda. O placar aparece quando alguém zerar a mão."
            : "Jogue uma partida e o placar da mesa aparece aqui."}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {entries.map((entry, index) => (
            <li
              key={entry.name}
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
                  {entry.matchesWon} {entry.matchesWon === 1 ? "vitória" : "vitórias"} em{" "}
                  {entry.matchesPlayed} · {entry.cardsCompleted} encaixadas ·{" "}
                  {entry.correctAccusations} pegadas
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
          [copy.settings.cardCompleted, 2],
          [copy.settings.accusationCorrect, 3],
          [copy.settings.accusationWrong, -2],
          [copy.settings.caught, -1],
          [copy.settings.matchWon, 5],
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
