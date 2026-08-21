"use client";

import { GameCard } from "@/components/cards/GameCard";
import { Button } from "@/components/ui/Button";
import { cardById } from "@/data/deck/cardIndex";
import { copy } from "@/data/copy";
import { secondsRemaining } from "@/lib/game/online/timing";
import type { ClaimRow, PlayerRow } from "@/types/room";

interface ContestSheetProps {
  claim: ClaimRow;
  players: PlayerRow[];
  now: Date;
  busy: boolean;
  onVote: (saidIt: boolean) => void;
}

export function ContestSheet({ claim, players, now, busy, onVote }: ContestSheetProps) {
  const card = cardById(claim.card_id);
  const author = players.find((player) => player.id === claim.player_id)?.name ?? "alguém";
  const remaining = secondsRemaining(claim.contest_ends_at, now);

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[calc(var(--safe-bottom)+1rem)]">
      <div className="animate-card-rise edge-raised rounded-[1.75rem] bg-violet-800 p-5 ring-2 ring-inset ring-cyan-soft/30">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-game text-lg text-cream">{author} reivindicou</span>
          <span className="font-display text-2xl leading-none text-cyan-soft">{remaining}s</span>
        </div>

        {card ? <GameCard card={card} size="md" /> : null}

        <p className="mt-4 text-sm leading-snug text-violet-200">{copy.contest.question}</p>

        <div className="mt-3 flex gap-2.5">
          <Button variant="mint" size="md" fullWidth disabled={busy} onClick={() => onVote(true)}>
            {copy.contest.agree}
          </Button>
          <Button variant="danger" size="md" fullWidth disabled={busy} onClick={() => onVote(false)}>
            {copy.contest.disagree}
          </Button>
        </div>
      </div>
    </div>
  );
}
