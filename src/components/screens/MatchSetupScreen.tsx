"use client";

import { useAppState } from "@/components/layout/AppStateProvider";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Stepper } from "@/components/ui/Stepper";
import { copy } from "@/data/copy";
import { handSizeBounds, penaltyBounds } from "@/types/draft";
import { Screen as ScreenName } from "@/types/navigation";

export function MatchSetupScreen() {
  const { goTo, draftController } = useAppState();
  const { draft, patchSettings } = draftController;

  return (
    <Screen
      footer={
        <Button variant="mint" size="lg" fullWidth onClick={() => goTo(ScreenName.AdultContent)}>
          {copy.matchSetup.next}
        </Button>
      }
    >
      <ScreenHeader title={copy.matchSetup.title} onBack={() => goTo(ScreenName.Home)} />

      <div className="flex flex-col gap-3">
        <Stepper
          label={copy.matchSetup.handSize}
          value={draft.settings.initialHandSize}
          min={handSizeBounds.min}
          max={handSizeBounds.max}
          onChange={(initialHandSize) => patchSettings({ initialHandSize })}
        />
        <Stepper
          label={copy.matchSetup.penalty}
          value={draft.settings.penaltyCardCount}
          min={penaltyBounds.min}
          max={penaltyBounds.max}
          onChange={(penaltyCardCount) => patchSettings({ penaltyCardCount })}
        />
      </div>
    </Screen>
  );
}
