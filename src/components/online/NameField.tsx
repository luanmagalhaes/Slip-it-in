"use client";

interface NameFieldProps {
  label: string;
  value: string;
  placeholder: string;
  maxLength?: number;
  uppercase?: boolean;
  onChange: (value: string) => void;
}

export function NameField({
  label,
  value,
  placeholder,
  maxLength = 24,
  uppercase = false,
  onChange,
}: NameFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-violet-300">
        {label}
      </span>
      <input
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        autoComplete="off"
        onChange={(event) =>
          onChange(uppercase ? event.target.value.toUpperCase() : event.target.value)
        }
        className={`edge-inset w-full rounded-2xl bg-violet-950/70 px-4 py-4 text-lg text-cream outline-none ring-2 ring-inset ring-violet-400/25 placeholder:text-violet-300/40 focus:ring-cyan-soft/60 ${uppercase ? "font-display tracking-[0.3em]" : ""}`}
      />
    </label>
  );
}
