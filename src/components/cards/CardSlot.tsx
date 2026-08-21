"use client";

import { BlockPattern } from "@/components/ui/BlockPattern";
import { Wordmark } from "@/components/ui/Wordmark";

interface CardSlotProps {
  count: number;
  flashing?: boolean;
  counterPopping?: boolean;
  label: string;
  className?: string;
}

export function CardSlot({
  count,
  flashing = false,
  counterPopping = false,
  label,
  className = "",
}: CardSlotProps) {
  return (
    <div
      className={`gpu relative isolate w-full overflow-hidden rounded-[1.6rem] bg-violet-600 p-4 shadow-[0_16px_36px_-18px_var(--color-shadow-deep)] ring-2 ring-violet-300/25 ${className}`}
    >
      <BlockPattern className="absolute inset-0 h-full w-full text-violet-300" opacity={0.16} />

      <div className="relative z-10 mb-3 flex items-center justify-between gap-3">
        <Wordmark size="md" />
        <svg viewBox="0 0 40 28" aria-hidden className="h-7 w-9 text-cream">
          <path
            d="M4 4c14-5 26 1 30 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path d="M34 22l1-9-8 3z" fill="currentColor" />
        </svg>
      </div>

      <div className="relative z-10 mb-4 h-3 w-full rounded-full bg-ink shadow-[inset_0_2px_5px_rgba(0,0,0,0.85)]">
        <span
          className={`absolute inset-0 origin-center rounded-full bg-cyan-soft/70 opacity-35 ${flashing ? "animate-slot-flash" : ""}`}
        />
      </div>

      <div className="gradient-mint relative z-10 flex items-center justify-between rounded-2xl px-4 py-3 text-ink">
        <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
        <span
          className={`font-display text-3xl leading-none ${counterPopping ? "animate-slot-count-pop" : ""}`}
        >
          {count}
        </span>
      </div>
    </div>
  );
}
