"use client";

import { useAppState } from "@/components/layout/AppStateProvider";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { copy } from "@/data/copy";
import { findById } from "@/utils/collections";
import { Screen as ScreenName } from "@/types/navigation";

export function AccusationResultScreen() {
  const { goTo, matchController, lastAccusationCorrect } = useAppState();
  const match = matchController.match;
  const penalty = match?.lastPenalty;

  if (!match || !penalty) {
    return null;
  }

  const penalized = findById(match.players, penalty.playerId);
  const correct = lastAccusationCorrect === true;
  const cardWord =
    penalty.drawnCards.length === 1
      ? copy.accusationResult.cardsSuffix
      : copy.accusationResult.cardsSuffixPlural;

  return (
    <Screen
      footer={
        <Button variant="mint" size="lg" fullWidth onClick={() => goTo(ScreenName.Table)}>
          {copy.accusationResult.next}
        </Button>
      }
      className="justify-center text-center"
    >
      <div className="animate-shake-alert">
        <p
          className={`font-display text-5xl leading-none tracking-wide ${correct ? "text-mint" : "text-pink-hot"}`}
        >
          {correct ? copy.accusationResult.correctTitle : copy.accusationResult.wrongTitle}
        </p>
      </div>

      <p className="mt-6 text-lg text-cream">
        <span className="font-semibold">{penalized?.name}</span>
        {` ${copy.accusationResult.drewCards} ${penalty.drawnCards.length} ${cardWord}`}
      </p>

      {penalty.pointsLost > 0 ? (
        <p className="mt-3 rounded-2xl bg-pink-hot/12 p-3 text-sm text-pink-soft ring-1 ring-pink-hot/30">
          {copy.accusationResult.lostPoint}
        </p>
      ) : null}
    </Screen>
  );
}
