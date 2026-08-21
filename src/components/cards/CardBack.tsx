import type { CSSProperties } from "react";
import { BlockPattern } from "@/components/ui/BlockPattern";
import { Wordmark } from "@/components/ui/Wordmark";

interface CardBackProps {
  className?: string;
  style?: CSSProperties;
}

export function CardBack({ className = "", style }: CardBackProps) {
  return (
    <div
      style={style}
      className={`gpu relative isolate flex items-center justify-center overflow-hidden rounded-2xl bg-violet-700 shadow-[0_10px_24px_-12px_var(--color-shadow-deep)] ring-1 ring-violet-300/20 ${className}`}
    >
      <BlockPattern className="absolute inset-0 h-full w-full text-violet-300" opacity={0.2} />
      <Wordmark size="md" className="relative z-10 opacity-95" />
    </div>
  );
}
