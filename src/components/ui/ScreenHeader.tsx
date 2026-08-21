import { Wordmark } from "@/components/ui/Wordmark";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  backLabel?: string;
}

export function ScreenHeader({ title, subtitle, onBack, backLabel = "Voltar" }: ScreenHeaderProps) {
  return (
    <header className="mb-6 shrink-0">
      <div className="mb-4 flex items-center justify-between">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="tap-shrink -ml-2 rounded-xl px-2 py-1 text-sm text-violet-300 active:scale-95"
          >
            {`← ${backLabel}`}
          </button>
        ) : (
          <span />
        )}
        <Wordmark size="sm" className="opacity-50" />
      </div>
      <h1 className="font-display text-3xl leading-none tracking-wide text-cream">{title}</h1>
      {subtitle ? <p className="mt-2 text-sm text-violet-300">{subtitle}</p> : null}
    </header>
  );
}
