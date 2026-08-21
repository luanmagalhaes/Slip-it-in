"use client";

import type { CSSProperties } from "react";
import { useAppState } from "@/components/layout/AppStateProvider";
import { CardBack } from "@/components/cards/CardBack";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { copy } from "@/data/copy";
import { Screen as ScreenName } from "@/types/navigation";

export function DealScreen() {
  const { goTo, matchController } = useAppState();
  const match = matchController.match;

  if (!match) {
    return null;
  }

  return (
    <Screen
      footer={
        <Button variant="mint" size="lg" fullWidth onClick={() => goTo(ScreenName.Table)}>
          {copy.deal.next}
        </Button>
      }
    >
      <ScreenHeader title={copy.deal.title} subtitle={copy.deal.body} />

      <div className="relative mx-auto mb-8 flex h-44 w-full max-w-xs items-center justify-center">
        {match.players.slice(0, 7).map((player, index) => (
          <CardBack
            key={player.id}
            className="animate-card-rise absolute h-36 w-24"
            style={
              {
                animationDelay: `${index * 70}ms`,
                transform: `translateX(${(index - Math.min(match.players.length, 7) / 2) * 26}px) rotate(${(index - 3) * 5}deg)`,
              } as CSSProperties
            }
          />
        ))}
      </div>

      <ul className="flex flex-col gap-2">
        {match.players.map((player, index) => (
          <li
            key={player.id}
            className="animate-card-rise flex items-center justify-between rounded-2xl bg-violet-900/55 px-4 py-3 ring-1 ring-violet-400/15"
            style={{ animationDelay: `${index * 40}ms` }}
          >
            <span className="min-w-0 flex-1 truncate font-semibold text-cream">{player.name}</span>
            <span className="font-display text-xl leading-none text-cyan-soft">
              {player.hand.length}
            </span>
          </li>
        ))}
      </ul>
    </Screen>
  );
}
