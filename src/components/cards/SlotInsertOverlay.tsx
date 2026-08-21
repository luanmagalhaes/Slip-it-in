"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { CardSlot } from "@/components/cards/CardSlot";
import { GameCard } from "@/components/cards/GameCard";
import { copy } from "@/data/copy";
import { useHaptics } from "@/hooks/useHaptics";
import type { Card } from "@/types/card";

const travelPixels = 210;
const fallbackDurationMs = 1200;
const landedHoldMs = 420;

interface SlotInsertOverlayProps {
  card: Card;
  slotCountBefore: number;
  onFinished: () => void;
}

export function SlotInsertOverlay({ card, slotCountBefore, onFinished }: SlotInsertOverlayProps) {
  const [landed, setLanded] = useState(false);
  const finishedRef = useRef(false);
  const onFinishedRef = useRef(onFinished);
  const vibrate = useHaptics();

  onFinishedRef.current = onFinished;

  const finish = useCallback(() => {
    if (finishedRef.current) {
      return;
    }

    finishedRef.current = true;
    onFinishedRef.current();
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(finish, fallbackDurationMs);

    return () => window.clearTimeout(timer);
  }, [finish]);

  const handleLanded = () => {
    setLanded(true);
    vibrate("success");
    window.setTimeout(finish, landedHoldMs);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-violet-950/92 px-6 backdrop-blur-sm">
      <div
        className="animate-slot-insert w-full max-w-[19rem]"
        style={{ "--slot-travel": `${travelPixels}px` } as CSSProperties}
        onAnimationEnd={handleLanded}
      >
        <GameCard card={card} size="md" />
      </div>

      <div className="w-full max-w-[19rem]">
        <CardSlot
          count={landed ? slotCountBefore + 1 : slotCountBefore}
          flashing={landed}
          counterPopping={landed}
          label={copy.privateHand.slotCounter}
        />
      </div>
    </div>
  );
}
