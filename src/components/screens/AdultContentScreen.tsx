"use client";

import { useAppState } from "@/components/layout/AppStateProvider";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Toggle } from "@/components/ui/Toggle";
import { copy } from "@/data/copy";
import { Screen as ScreenName } from "@/types/navigation";

export function AdultContentScreen() {
  const { goTo, draftController } = useAppState();
  const { draft, patchSettings } = draftController;
  const enabled = draft.settings.adultContentEnabled;

  return (
    <Screen
      footer={
        <Button variant="mint" size="lg" fullWidth onClick={() => goTo(ScreenName.Players)}>
          {copy.adultContent.next}
        </Button>
      }
    >
      <ScreenHeader
        title={copy.adultContent.title}
        subtitle={copy.adultContent.question}
        onBack={() => goTo(ScreenName.MatchSetup)}
      />

      <Toggle
        checked={enabled}
        onChange={(adultContentEnabled) => patchSettings({ adultContentEnabled })}
        onLabel={copy.adultContent.onLabel}
        offLabel={copy.adultContent.offLabel}
      />

      <div
        className={`animate-card-rise mt-5 rounded-2xl p-4 ring-1 ${enabled ? "bg-pink-hot/12 ring-pink-hot/35" : "bg-violet-900/55 ring-violet-400/15"}`}
      >
        <p className={`text-sm leading-relaxed ${enabled ? "text-pink-soft" : "text-violet-200"}`}>
          {enabled ? copy.adultContent.onHint : copy.adultContent.offHint}
        </p>
      </div>

      <p className="mt-4 text-xs text-violet-400">{copy.adultContent.disclaimer}</p>
    </Screen>
  );
}
