import type { ReactNode } from "react";

interface ScreenProps {
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function Screen({ children, footer, className = "" }: ScreenProps) {
  return (
    <div className="gradient-stage relative flex min-h-dvh flex-col overflow-hidden">
      <div
        className={`relative z-10 flex flex-1 flex-col overflow-y-auto px-5 pb-4 pt-[calc(var(--safe-top)+1.5rem)] ${className}`}
      >
        {children}
      </div>
      {footer ? (
        <div className="relative z-20 shrink-0 border-t border-violet-400/15 bg-violet-950/70 px-5 pb-[calc(var(--safe-bottom)+1rem)] pt-4 backdrop-blur-sm">
          {footer}
        </div>
      ) : null}
    </div>
  );
}
