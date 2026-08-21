"use client";

import { useState } from "react";
import { useAppState } from "@/components/layout/AppStateProvider";
import { GameCard } from "@/components/cards/GameCard";
import { SlotInsertOverlay } from "@/components/cards/SlotInsertOverlay";
import { PassPhoneCurtain } from "@/components/layout/PassPhoneCurtain";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { copy } from "@/data/copy";
import { useHaptics } from "@/hooks/useHaptics";
import type { Card } from "@/types/card";
import { findById } from "@/utils/collections";
import { Screen as ScreenName } from "@/types/navigation";

export function PrivateHandScreen() {
  const { goTo, activePlayerId, setActivePlayerId, matchController } = useAppState();
  const [revealed, setRevealed] = useState(false);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [inserting, setInserting] = useState<Card | null>(null);
  const vibrate = useHaptics();

  const match = matchController.match;
  const player = match && activePlayerId ? findById(match.players, activePlayerId) : undefined;

  if (!match || !player) {
    return null;
  }

  const hide = () => {
    setRevealed(false);
    setExpandedCardId(null);
    setActivePlayerId(null);
    goTo(ScreenName.Table);
  };

  const commitInsertion = () => {
    if (!inserting) {
      return;
    }

    const cardId = inserting.id;
    setInserting(null);
    setExpandedCardId(null);
    matchController.send({ type: "COMPLETE_CARD", playerId: player.id, cardId });

    if (player.hand.length <= 1) {
      setRevealed(false);
      setActivePlayerId(null);
      goTo(ScreenName.Victory);
    }
  };

  if (!revealed) {
    return <PassPhoneCurtain playerName={player.name} onReveal={() => setRevealed(true)} />;
  }

  return (
    <>
      <Screen
        footer={
          <Button variant="secondary" size="lg" fullWidth onClick={hide}>
            {copy.privateHand.done}
          </Button>
        }
      >
        <header className="mb-5 shrink-0">
          <p className="text-xs uppercase tracking-widest text-violet-400">
            {copy.privateHand.title}
          </p>
          <h1 className="mt-1 font-display text-3xl leading-none tracking-wide text-cream">
            {player.name}
          </h1>
          <div className="mt-3 flex items-center gap-3 text-sm text-violet-300">
            <span className="rounded-full bg-violet-900/70 px-3 py-1">
              {`${player.hand.length} na mão`}
            </span>
            <span className="rounded-full bg-mint/15 px-3 py-1 text-mint">
              {`${player.completedCards.length} ${copy.privateHand.slotCounter}`}
            </span>
          </div>
          <p className="mt-3 text-xs text-violet-400">{copy.privateHand.tapHint}</p>
        </header>

        {player.hand.length === 0 ? (
          <p className="mt-10 text-center text-lg text-mint">{copy.privateHand.empty}</p>
        ) : (
          <ul className="flex flex-col gap-3 pb-2">
            {player.hand.map((card, index) => {
              const expanded = expandedCardId === card.id;

              return (
                <li
                  key={card.id}
                  className="animate-card-rise"
                  style={{ animationDelay: `${index * 45}ms` }}
                >
                  <GameCard
                    card={card}
                    size={expanded ? "lg" : "md"}
                    showCategory={expanded}
                    onClick={() => {
                      vibrate("tap");
                      setExpandedCardId(expanded ? null : card.id);
                    }}
                  />
                  {expanded ? (
                    <Button
                      variant="mint"
                      fullWidth
                      className="mt-2"
                      onClick={() => setInserting(card)}
                    >
                      {copy.privateHand.completeAction}
                    </Button>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </Screen>

      {inserting ? (
        <SlotInsertOverlay
          card={inserting}
          slotCountBefore={match.slotPile.length}
          onFinished={commitInsertion}
        />
      ) : null}
    </>
  );
}
