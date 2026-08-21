"use client";

import { CardSlot } from "@/components/cards/CardSlot";
import { Button } from "@/components/ui/Button";
import { cardById } from "@/data/deck/cardIndex";
import { copy } from "@/data/copy";
import { secondsRemaining } from "@/lib/game/online/timing";
import { EventType, type EventRow, type PlayerRow } from "@/types/room";
import type { MyStateResponse } from "@/lib/api/client";

interface TablePanelProps {
  players: PlayerRow[];
  events: EventRow[];
  me: MyStateResponse;
  now: Date;
  slotCount: number;
  busy: boolean;
  onAccuse: (playerId: string) => void;
}

const eventText: Record<string, (actor: string, target: string, card: string) => string> = {
  [EventType.PlayerJoined]: (actor) => `${actor} entrou na sala`,
  [EventType.MatchStarted]: () => "A partida começou",
  [EventType.CardClaimed]: (actor, _target, card) => `${actor} encaixou: "${card}"`,
  [EventType.ClaimConfirmed]: (actor) => `A mesa confirmou a carta de ${actor}`,
  [EventType.ClaimReverted]: (actor) => `A mesa derrubou a carta de ${actor}`,
  [EventType.AccusationCorrect]: (actor, target) => `${actor} pegou ${target} armado`,
  [EventType.AccusationWrong]: (actor, target) => `${actor} acusou ${target} e errou`,
  [EventType.MatchWon]: (actor) => `${actor} zerou a mão e venceu`,
};

export function TablePanel({
  players,
  events,
  me,
  now,
  slotCount,
  busy,
  onAccuse,
}: TablePanelProps) {
  const cooldown = secondsRemaining(me.accusationBlockedUntil, now);
  const nameOf = (id: string | null) => players.find((p) => p.id === id)?.name ?? "alguém";

  return (
    <div className="flex flex-col gap-5">
      <CardSlot count={slotCount} label={copy.privateHand.slotCounter} />

      <div>
        <h2 className="font-game mb-3 text-xl text-cream">{copy.table.title}</h2>
        <ul className="flex flex-col gap-2">
          {players.map((player) => (
            <li
              key={player.id}
              className="flex items-center gap-3 rounded-2xl bg-violet-900/55 p-3 ring-1 ring-violet-400/15"
            >
              <span className="gradient-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-display text-base text-cream">
                {player.hand_count}
              </span>
              <span className="min-w-0 flex-1">
                <span className="font-game block truncate text-cream">
                  {player.name}
                  {player.id === me.playerId ? " (você)" : ""}
                </span>
                <span className="text-xs text-violet-300">
                  {player.hand_count} {copy.table.handLabel} · {player.points} pts
                </span>
              </span>
              {player.id === me.playerId ? null : (
                <Button
                  variant="danger"
                  size="md"
                  disabled={busy || cooldown > 0}
                  onClick={() => onAccuse(player.id)}
                >
                  {cooldown > 0 ? `${cooldown}s` : copy.table.accuse}
                </Button>
              )}
            </li>
          ))}
        </ul>
        {cooldown > 0 ? (
          <p className="mt-2 text-center text-xs text-pink-soft">
            Você errou uma acusação. Espere {cooldown}s.
          </p>
        ) : null}
      </div>

      <div>
        <h3 className="font-game mb-2 text-base text-violet-200">{copy.table.feed}</h3>
        {events.length === 0 ? (
          <p className="rounded-2xl bg-violet-900/40 p-4 text-sm text-violet-300">
            {copy.table.slotEmpty}
          </p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {events.slice(0, 12).map((event) => {
              const render = eventText[event.type];
              const card = event.card_id ? cardById(event.card_id)?.text ?? "" : "";

              return (
                <li
                  key={event.id}
                  className="rounded-xl bg-violet-950/50 px-3.5 py-2.5 text-sm leading-snug text-violet-200"
                >
                  {render
                    ? render(nameOf(event.actor_id), nameOf(event.target_id), card)
                    : event.type}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
