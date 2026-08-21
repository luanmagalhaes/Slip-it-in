"use client";

import { BlockPattern } from "@/components/ui/BlockPattern";
import { Wordmark } from "@/components/ui/Wordmark";
import { categoryLabels, copy } from "@/data/copy";
import type { Card } from "@/types/card";

type GameCardSize = "sm" | "md" | "lg";

const sizeClasses: Record<GameCardSize, string> = {
  sm: "rounded-xl p-3 text-[0.7rem] leading-snug",
  md: "rounded-2xl p-4 text-sm leading-snug",
  lg: "rounded-[1.4rem] p-5 text-lg leading-snug",
};

interface GameCardProps {
  card: Card;
  size?: GameCardSize;
  showCategory?: boolean;
  className?: string;
  onClick?: () => void;
}

export function GameCard({
  card,
  size = "md",
  showCategory = false,
  className = "",
  onClick,
}: GameCardProps) {
  const Element = onClick ? "button" : "div";

  return (
    <Element
      {...(onClick ? { type: "button" as const, onClick } : {})}
      className={`gpu relative isolate flex w-full flex-col overflow-hidden text-left shadow-[0_10px_24px_-12px_var(--color-shadow-deep)] ring-1 ring-violet-300/20 ${card.isAdult ? "gradient-card-adult" : "gradient-card"} ${sizeClasses[size]} ${onClick ? "tap-shrink active:scale-[0.985]" : ""} ${className}`}
    >
      <BlockPattern
        className="pointer-events-none absolute bottom-0 right-0 h-2/3 w-3/5 text-violet-300"
        opacity={0.18}
      />

      {showCategory ? (
        <span className="relative z-10 mb-2 inline-flex w-fit items-center gap-1 rounded-full bg-violet-950/40 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wider text-violet-200">
          {categoryLabels[card.category]}
        </span>
      ) : null}

      <p className="relative z-10 flex-1 font-medium text-cream">{card.text}</p>

      <div className="relative z-10 mt-3 flex items-end justify-between gap-2">
        {card.isAdult ? (
          <span className="rounded-md bg-ink/70 px-1.5 py-0.5 text-[0.6rem] font-bold tracking-wide text-pink-soft">
            {copy.common.adultBadge}
          </span>
        ) : (
          <span />
        )}
        <Wordmark size="sm" className="opacity-80" />
      </div>
    </Element>
  );
}
