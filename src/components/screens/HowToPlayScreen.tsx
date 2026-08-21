"use client";

import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { copy } from "@/data/copy";

interface HowToPlayScreenProps {
  onBack: () => void;
}

export function HowToPlayScreen({ onBack }: HowToPlayScreenProps) {
  return (
    <Screen
      footer={
        <Button variant="mint" size="lg" fullWidth onClick={onBack}>
          {copy.howToPlay.back}
        </Button>
      }
    >
      <ScreenHeader
        title={copy.howToPlay.title}
        subtitle={copy.howToPlay.subtitle}
        onBack={onBack}
      />

      <ol className="flex flex-col gap-3">
        {copy.howToPlay.steps.map((step, index) => (
          <li
            key={step.title}
            className="animate-card-rise flex gap-3 rounded-2xl bg-violet-900/55 p-4 ring-1 ring-violet-400/15"
            style={{ animationDelay: `${index * 55}ms` }}
          >
            <span className="gradient-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-display text-lg leading-none text-cream">
              {index + 1}
            </span>
            <div>
              <p className="font-semibold text-cream">{step.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-violet-300">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <p className="mt-5 rounded-2xl border border-cyan-soft/25 bg-cyan-soft/10 p-4 text-sm leading-relaxed text-cyan-soft">
        {copy.howToPlay.warning}
      </p>
    </Screen>
  );
}
