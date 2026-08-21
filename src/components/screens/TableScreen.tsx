"use client";

import { useState } from "react";
import { useAppState } from "@/components/layout/AppStateProvider";
import { CardSlot } from "@/components/cards/CardSlot";
import { GameCard } from "@/components/cards/GameCard";
import { AccusationSheet } from "@/components/screens/AccusationSheet";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { copy } from "@/data/copy";
import { Screen as ScreenName } from "@/types/navigation";

export function TableScreen() {
  const { goTo, matchController, setActivePlayerId } = useAppState();
  const [accusing, setAccusing] = useState(false);
  const match = matchController.match;

  if (!match) {
    return null;
  }

  const openHand = (playerId: string) => {
    setActivePlayerId(playerId);
    goTo(ScreenName.PrivateHand);
  };

  const endMatch = () => {
    matchController.send({ type: "END_MATCH" });
    goTo(ScreenName.Home);
  };

  const lastSlotCard = match.slotPile.at(-1);

  return (
    <>
      <Screen
        footer={
          <div className="flex flex-col gap-2">
            <Button variant="danger" size="lg" fullWidth onClick={() => setAccusing(true)}>
              {copy.table.accuse}
            </Button>
            <Button variant="ghost" fullWidth onClick={endMatch}>
              {copy.table.endMatch}
            </Button>
          </div>
        }
      >
        <ScreenHeader
          title={copy.table.title}
          subtitle={`${copy.table.drawPile}: ${match.drawPile.length}`}
        />

        <ul className="mb-6 grid grid-cols-2 gap-2">
          {match.players.map((player, index) => (
            <li key={player.id} className="animate-card-rise" style={{ animationDelay: `${index * 35}ms` }}>
              <button
                type="button"
                onClick={() => openHand(player.id)}
                className="tap-shrink flex w-full items-center justify-between gap-2 rounded-2xl bg-violet-900/60 px-4 py-3 text-left ring-1 ring-violet-400/15 active:scale-[0.97]"
              >
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-cream">{player.name}</span>
                  <span className="text-xs text-violet-400">{copy.table.handLabel}</span>
                </span>
                <span
                  className={`font-display text-2xl leading-none ${player.hand.length <= 1 ? "text-mint" : "text-cyan-soft"}`}
                >
                  {player.hand.length}
                </span>
              </button>
            </li>
          ))}
        </ul>

        <div className="mb-4">
          <CardSlot count={match.slotPile.length} label={copy.table.slot} />
        </div>

        {lastSlotCard ? (
          <div className="animate-card-flip-in">
            <p className="mb-2 text-xs uppercase tracking-widest text-violet-400">
              {copy.table.slot}
            </p>
            <GameCard card={lastSlotCard} size="sm" showCategory />
          </div>
        ) : (
          <p className="text-center text-sm text-violet-400">{copy.table.slotEmpty}</p>
        )}
      </Screen>

      {accusing ? (
        <AccusationSheet players={match.players} onClose={() => setAccusing(false)} />
      ) : null}
    </>
  );
}
