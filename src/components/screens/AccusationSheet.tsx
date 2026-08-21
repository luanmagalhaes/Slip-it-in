"use client";

import { useState } from "react";
import { useAppState } from "@/components/layout/AppStateProvider";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { copy } from "@/data/copy";
import type { Player } from "@/types/player";
import { Screen as ScreenName } from "@/types/navigation";

interface AccusationSheetProps {
  players: readonly Player[];
  onClose: () => void;
}

export function AccusationSheet({ players, onClose }: AccusationSheetProps) {
  const { goTo, matchController, setLastAccusationCorrect } = useAppState();
  const [accuserId, setAccuserId] = useState<string | null>(null);
  const [accusedId, setAccusedId] = useState<string | null>(null);

  const resolve = (wasCorrect: boolean) => {
    matchController.send({ type: "RESOLVE_ACCUSATION", wasCorrect });
    setLastAccusationCorrect(wasCorrect);
    onClose();
    goTo(ScreenName.AccusationResult);
  };

  const pickAccused = (playerId: string) => {
    if (!accuserId) {
      return;
    }

    setAccusedId(playerId);
    matchController.send({ type: "START_ACCUSATION", accuserId, accusedId: playerId });
  };

  const title = accuserId ? copy.accusation.accusedTitle : copy.accusation.title;
  const options = accuserId ? players.filter((player) => player.id !== accuserId) : players;

  return (
    <Sheet title={title} subtitle={copy.accusation.hint} onClose={onClose}>
      {accusedId ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm leading-relaxed text-violet-200">{copy.accusation.question}</p>
          <Button variant="mint" size="lg" fullWidth onClick={() => resolve(true)}>
            {copy.accusation.correct}
          </Button>
          <Button variant="danger" size="lg" fullWidth onClick={() => resolve(false)}>
            {copy.accusation.wrong}
          </Button>
          <Button
            variant="ghost"
            fullWidth
            onClick={() => {
              matchController.send({ type: "CANCEL_ACCUSATION" });
              setAccusedId(null);
              setAccuserId(null);
            }}
          >
            {copy.accusation.cancel}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {options.map((player) => (
            <button
              key={player.id}
              type="button"
              onClick={() => (accuserId ? pickAccused(player.id) : setAccuserId(player.id))}
              className="tap-shrink rounded-2xl bg-violet-800/70 px-3 py-4 text-sm font-semibold text-cream ring-1 ring-violet-400/25 active:scale-[0.97]"
            >
              {player.name}
            </button>
          ))}
        </div>
      )}
    </Sheet>
  );
}
