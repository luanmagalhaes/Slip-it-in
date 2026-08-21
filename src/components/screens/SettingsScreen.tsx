"use client";

import { useAppState } from "@/components/layout/AppStateProvider";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Stepper } from "@/components/ui/Stepper";
import { copy } from "@/data/copy";
import { scoringRuleBounds } from "@/lib/scoreboard/scoringRules";
import type { ScoringRules } from "@/types/scoreboard";
import { Screen as ScreenName } from "@/types/navigation";

const fields: Array<{ key: keyof ScoringRules; label: string }> = [
  { key: "cardCompleted", label: copy.settings.cardCompleted },
  { key: "accusationCorrect", label: copy.settings.accusationCorrect },
  { key: "accusationWrong", label: copy.settings.accusationWrong },
  { key: "caught", label: copy.settings.caught },
  { key: "matchWon", label: copy.settings.matchWon },
  { key: "emptyPilePenalty", label: copy.settings.emptyPilePenalty },
];

export function SettingsScreen() {
  const { goTo, scoreboardController } = useAppState();
  const rules = scoreboardController.scoreboard.rules;

  return (
    <Screen>
      <ScreenHeader
        title={copy.settings.title}
        subtitle={copy.settings.scoring}
        onBack={() => goTo(ScreenName.Home)}
      />

      <div className="flex flex-col gap-2">
        {fields.map((field) => (
          <Stepper
            key={field.key}
            label={field.label}
            value={rules[field.key]}
            min={field.key === "emptyPilePenalty" ? 0 : scoringRuleBounds.min}
            max={scoringRuleBounds.max}
            onChange={(value) => scoreboardController.setRules({ ...rules, [field.key]: value })}
          />
        ))}
      </div>

      <p className="mt-6 rounded-2xl bg-violet-900/50 p-4 text-xs leading-relaxed text-violet-300 ring-1 ring-violet-400/15">
        {`${copy.settings.motion}: ${copy.settings.motionHint}`}
      </p>
    </Screen>
  );
}
