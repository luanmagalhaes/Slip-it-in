"use client";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  onLabel: string;
  offLabel: string;
}

export function Toggle({ checked, onChange, onLabel, offLabel }: ToggleProps) {
  return (
    <div className="flex w-full gap-2 rounded-2xl bg-violet-950/60 p-1.5 ring-1 ring-violet-400/20">
      <button
        type="button"
        onClick={() => onChange(false)}
        aria-pressed={!checked}
        className={`tap-shrink flex-1 rounded-xl px-3 py-3 text-sm font-semibold active:scale-[0.97] ${!checked ? "bg-violet-500 text-cream" : "text-violet-300"}`}
      >
        {offLabel}
      </button>
      <button
        type="button"
        onClick={() => onChange(true)}
        aria-pressed={checked}
        className={`tap-shrink flex-1 rounded-xl px-3 py-3 text-sm font-semibold active:scale-[0.97] ${checked ? "bg-pink-hot text-ink" : "text-violet-300"}`}
      >
        {onLabel}
      </button>
    </div>
  );
}
