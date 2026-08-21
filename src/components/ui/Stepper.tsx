"use client";

import { clamp } from "@/utils/collections";

interface StepperProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  hint?: string;
}

export function Stepper({ label, value, min, max, onChange, hint }: StepperProps) {
  const step = (delta: number) => onChange(clamp(value + delta, min, max));

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-violet-900/50 px-4 py-3 ring-1 ring-violet-400/15">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-cream">{label}</p>
        {hint ? <p className="mt-0.5 text-xs text-violet-300">{hint}</p> : null}
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <button
          type="button"
          onClick={() => step(-1)}
          disabled={value <= min}
          aria-label={`Diminuir ${label}`}
          className="tap-shrink h-10 w-10 rounded-xl bg-violet-700 text-xl font-bold text-cream active:scale-90 disabled:opacity-30"
        >
          −
        </button>
        <span className="w-8 text-center font-display text-2xl leading-none text-cream">
          {value}
        </span>
        <button
          type="button"
          onClick={() => step(1)}
          disabled={value >= max}
          aria-label={`Aumentar ${label}`}
          className="tap-shrink h-10 w-10 rounded-xl bg-violet-700 text-xl font-bold text-cream active:scale-90 disabled:opacity-30"
        >
          +
        </button>
      </div>
    </div>
  );
}
