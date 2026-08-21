"use client";

import { useState } from "react";
import { ContestSheet } from "@/components/online/ContestSheet";
import { HandPanel } from "@/components/online/HandPanel";
import { TablePanel } from "@/components/online/TablePanel";
import { SlotInsertOverlay } from "@/components/cards/SlotInsertOverlay";
import { Screen } from "@/components/ui/Screen";
import { Wordmark } from "@/components/ui/Wordmark";
import { cardById } from "@/data/deck/cardIndex";
import { ClaimStatus, type ClaimRow, type EventRow, type PlayerRow } from "@/types/room";
import type { MyStateResponse } from "@/lib/api/client";

type Tab = "HAND" | "TABLE";

interface GameScreenProps {
  code: string;
  me: MyStateResponse;
  players: PlayerRow[];
  claims: ClaimRow[];
  events: EventRow[];
  myVotedClaimIds: string[];
  now: Date;
  busy: boolean;
  error: string | null;
  insertingCardId: string | null;
  onArm: (cardId: string) => void;
  onClaim: () => void;
  onAccuse: (playerId: string) => void;
  onVote: (claimId: string, saidIt: boolean) => void;
  onInsertFinished: () => void;
}

export function GameScreen({
  code,
  me,
  players,
  claims,
  events,
  myVotedClaimIds,
  now,
  busy,
  error,
  insertingCardId,
  onArm,
  onClaim,
  onAccuse,
  onVote,
  onInsertFinished,
}: GameScreenProps) {
  const [tab, setTab] = useState<Tab>("HAND");
  const slotCount = players.reduce((total, player) => total + player.completed_count, 0);
  const pendingClaim = claims.find(
    (claim) =>
      claim.status === ClaimStatus.Pending &&
      claim.player_id !== me.playerId &&
      !myVotedClaimIds.includes(claim.id),
  );
  const insertingCard = insertingCardId ? cardById(insertingCardId) : undefined;

  return (
    <>
      <Screen className={pendingClaim ? "pb-64" : ""}>
        <header className="mb-5 flex items-center justify-between">
          <Wordmark size="sm" className="opacity-55" />
          <span className="font-display rounded-full bg-violet-950/60 px-3 py-1 text-sm tracking-[0.18em] text-violet-200">
            {code}
          </span>
        </header>

        <div className="mb-5 grid grid-cols-2 gap-1.5 rounded-2xl bg-violet-950/60 p-1.5">
          <TabButton active={tab === "HAND"} onClick={() => setTab("HAND")}>
            {`Minha mão (${me.handCardIds.length})`}
          </TabButton>
          <TabButton active={tab === "TABLE"} onClick={() => setTab("TABLE")}>
            Mesa
          </TabButton>
        </div>

        {error ? (
          <p className="animate-shake-alert mb-4 rounded-2xl bg-pink-hot/15 p-4 text-sm text-pink-soft ring-1 ring-pink-hot/30">
            {error}
          </p>
        ) : null}

        {tab === "HAND" ? (
          <HandPanel
            me={me}
            now={now}
            busy={busy}
            slotCount={slotCount}
            onArm={onArm}
            onClaim={onClaim}
          />
        ) : (
          <TablePanel
            players={players}
            events={events}
            me={me}
            now={now}
            slotCount={slotCount}
            busy={busy}
            onAccuse={onAccuse}
          />
        )}
      </Screen>

      {pendingClaim ? (
        <ContestSheet
          claim={pendingClaim}
          players={players}
          now={now}
          busy={busy}
          onVote={(saidIt) => onVote(pendingClaim.id, saidIt)}
        />
      ) : null}

      {insertingCard ? (
        <SlotInsertOverlay
          card={insertingCard}
          slotCountBefore={Math.max(0, slotCount - 1)}
          onFinished={onInsertFinished}
        />
      ) : null}
    </>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`font-game tap-shrink rounded-xl px-3 py-2.5 text-sm ${
        active ? "gradient-primary text-cream" : "text-violet-300"
      }`}
    >
      {children}
    </button>
  );
}
