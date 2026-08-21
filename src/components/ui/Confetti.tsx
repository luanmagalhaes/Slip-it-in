import type { CSSProperties } from "react";

const pieces = [
  { left: 6, delay: 0, color: "var(--color-mint)", size: 10 },
  { left: 15, delay: 320, color: "var(--color-pink-hot)", size: 7 },
  { left: 27, delay: 120, color: "var(--color-cyan-soft)", size: 12 },
  { left: 38, delay: 540, color: "var(--color-violet-400)", size: 8 },
  { left: 48, delay: 200, color: "var(--color-mint-light)", size: 11 },
  { left: 59, delay: 700, color: "var(--color-pink-soft)", size: 9 },
  { left: 68, delay: 60, color: "var(--color-cyan-soft)", size: 13 },
  { left: 78, delay: 430, color: "var(--color-mint)", size: 8 },
  { left: 88, delay: 260, color: "var(--color-violet-300)", size: 10 },
  { left: 95, delay: 620, color: "var(--color-pink-hot)", size: 7 },
];

export function Confetti() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((piece) => (
        <span
          key={piece.left}
          className="animate-confetti absolute top-0 block rounded-sm"
          style={
            {
              left: `${piece.left}%`,
              width: `${piece.size}px`,
              height: `${piece.size * 1.6}px`,
              backgroundColor: piece.color,
              animationDelay: `${piece.delay}ms`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
