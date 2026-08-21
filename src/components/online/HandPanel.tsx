"use client";

import { GameCard } from "@/components/cards/GameCard";
import { Button } from "@/components/ui/Button";
import { cardsByIds } from "@/data/deck/cardIndex";
import { copy } from "@/data/copy";
import { secondsRemaining } from "@/lib/game/online/timing";
import type { MyStateResponse } from "@/lib/api/client";

interface HandPanelProps {
  me: MyStateResponse;
  now: Date;
  busy: boolean;
  slotCount: number;
  onArm: (cardId: string) => void;
  onClaim: () => void;
}

export function HandPanel({ me, now, busy, slotCount, onArm, onClaim }: HandPanelProps) {
  const cards = cardsByIds(me.handCardIds);
  const armedSeconds = secondsRemaining(me.armedUntil, now);
  const isArmed = Boolean(me.armedCardId) && armedSeconds > 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-game text-xl text-cream">{copy.privateHand.title}</h2>
        <span className="rounded-full bg-violet-950/60 px-3 py-1 text-xs text-violet-300">
          {copy.privateHand.slotCounter}: {slotCount}
        </span>
      </div>

      {isArmed ? (
        <div className="animate-card-rise edge-raised gradient-mint rounded-[1.5rem] p-4 text-ink">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider opacity-75">
              {copy.privateHand.armedLabel}
            </span>
            <span className="font-display text-2xl leading-none">{armedSeconds}s</span>
          </div>
          <p className="mt-2 text-sm font-medium leading-snug">
            Fale a frase na conversa. Se te acusarem agora, você foi pego.
          </p>
          <div className="mt-3">
            <Button variant="primary" size="md" fullWidth disabled={busy} onClick={onClaim}>
              {copy.privateHand.completeAction}
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-violet-300">{copy.privateHand.tapHint}</p>
      )}

      {cards.length === 0 ? (
        <p className="rounded-2xl bg-violet-900/55 p-5 text-center text-violet-300">
          {copy.privateHand.empty}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {cards.map((card, index) => {
            const active = me.armedCardId === card.id && isArmed;

            return (
              <li
                key={card.id}
                className="animate-card-rise"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div
                  className={`rounded-[1.4rem] transition-shadow ${active ? "ring-bubble" : ""}`}
                >
                  <GameCard
                    card={card}
                    size="lg"
                    showCategory
                    onClick={isArmed || busy ? undefined : () => onArm(card.id)}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
