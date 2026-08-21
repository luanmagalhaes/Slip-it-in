"use client";

import { useState } from "react";
import { useAppState } from "@/components/layout/AppStateProvider";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { copy } from "@/data/copy";
import { rankedEntries } from "@/lib/scoreboard/scoreboardOperations";
import { maxPlayers, minPlayers } from "@/types/draft";
import { Screen as ScreenName } from "@/types/navigation";
import type { AddPlayerResult } from "@/hooks/useDraftController";

const warnings: Partial<Record<AddPlayerResult, string>> = {
  DUPLICATE: copy.players.duplicateWarning,
  FULL: copy.players.fullWarning,
};

export function PlayersScreen() {
  const { goTo, draftController, matchController, scoreboardController } = useAppState();
  const { draft, addPlayer, removePlayer } = draftController;
  const [name, setName] = useState("");
  const [warning, setWarning] = useState<string | null>(null);

  const submit = (value: string) => {
    const result = addPlayer(value);

    if (result === "ADDED") {
      setName("");
      setWarning(null);
      return;
    }

    setWarning(warnings[result] ?? null);
  };

  const saved = rankedEntries(scoreboardController.scoreboard).filter(
    (entry) => !draft.players.some((player) => player.id === entry.playerId),
  );

  const canStart = draft.players.length >= minPlayers;

  const startMatch = () => {
    matchController.startMatch(
      draft.players,
      { ...draft.settings, emptyPilePointsLost: scoreboardController.scoreboard.rules.emptyPilePenalty },
      draft.players.length * 1000 + draft.settings.initialHandSize,
    );
    goTo(ScreenName.Deal);
  };

  return (
    <Screen
      footer={
        <div className="flex flex-col gap-2">
          {!canStart ? (
            <p className="text-center text-xs text-violet-400">{copy.players.minWarning}</p>
          ) : null}
          <Button variant="mint" size="lg" fullWidth disabled={!canStart} onClick={startMatch}>
            {copy.players.start}
          </Button>
        </div>
      }
    >
      <ScreenHeader
        title={copy.players.title}
        subtitle={`${draft.players.length}/${maxPlayers} — ${copy.players.subtitle}`}
        onBack={() => goTo(ScreenName.AdultContent)}
      />

      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit(name);
        }}
        className="flex gap-2"
      >
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={copy.players.placeholder}
          maxLength={18}
          enterKeyHint="done"
          autoComplete="off"
          className="min-w-0 flex-1 rounded-2xl bg-violet-950/70 px-4 py-3 text-base text-cream outline-none ring-1 ring-violet-400/25 placeholder:text-violet-400/70 focus:ring-cyan-soft/60"
        />
        <Button type="submit" disabled={draft.players.length >= maxPlayers}>
          {copy.players.add}
        </Button>
      </form>

      {warning ? (
        <p className="animate-shake-alert mt-3 text-sm text-pink-soft">{warning}</p>
      ) : null}

      <ul className="mt-5 flex flex-col gap-2">
        {draft.players.map((player, index) => (
          <li
            key={player.id}
            className="animate-card-rise flex items-center gap-3 rounded-2xl bg-violet-900/55 px-4 py-3 ring-1 ring-violet-400/15"
            style={{ animationDelay: `${index * 35}ms` }}
          >
            <span className="gradient-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-display text-sm leading-none text-cream">
              {index + 1}
            </span>
            <span className="min-w-0 flex-1 truncate font-semibold text-cream">{player.name}</span>
            <button
              type="button"
              onClick={() => removePlayer(player.id)}
              aria-label={`${copy.players.remove} ${player.name}`}
              className="tap-shrink rounded-xl px-2 py-1 text-xs text-violet-300 active:scale-90"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      {saved.length > 0 ? (
        <section className="mt-7">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-violet-400">
            {copy.players.saved}
          </h2>
          <div className="flex flex-wrap gap-2">
            {saved.map((entry) => (
              <button
                key={entry.playerId}
                type="button"
                onClick={() => submit(entry.name)}
                className="tap-shrink rounded-full bg-violet-800/70 px-3 py-2 text-sm text-violet-100 ring-1 ring-violet-400/25 active:scale-95"
              >
                {`+ ${entry.name}`}
              </button>
            ))}
          </div>
        </section>
      ) : null}
    </Screen>
  );
}
