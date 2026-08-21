"use client";

import type { ReactNode } from "react";

interface SheetProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
}

export function Sheet({ title, subtitle, onClose, children }: SheetProps) {
  return (
    <div className="fixed inset-0 z-40 flex items-end">
      <button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className="absolute inset-0 bg-ink/70 backdrop-blur-sm"
      />
      <div className="animate-card-rise relative z-10 max-h-[85dvh] w-full overflow-y-auto rounded-t-[1.75rem] bg-violet-900 px-5 pb-[calc(var(--safe-bottom)+1.25rem)] pt-5 ring-1 ring-violet-400/25">
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-violet-400/40" />
        <h2 className="font-display text-2xl leading-tight tracking-wide text-cream">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-violet-300">{subtitle}</p> : null}
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}
