"use client";

import { useState } from "react";
import { NameField } from "@/components/online/NameField";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { copy } from "@/data/copy";

interface CreateRoomScreenProps {
  busy: boolean;
  error: string | null;
  canKeepCrew: boolean;
  onBack: () => void;
  onSubmit: (input: {
    hostName: string;
    adultContentEnabled: boolean;
    hardContentEnabled: boolean;
    keepCrew: boolean;
  }) => void;
}

export function CreateRoomScreen({
  busy,
  error,
  canKeepCrew,
  onBack,
  onSubmit,
}: CreateRoomScreenProps) {
  const [name, setName] = useState("");
  const [adult, setAdult] = useState(false);
  const [hard, setHard] = useState(false);
  const [keepCrew, setKeepCrew] = useState(canKeepCrew);

  return (
    <Screen
      footer={
        <Button
          variant="mint"
          size="lg"
          fullWidth
          disabled={busy || name.trim().length === 0}
          onClick={() =>
            onSubmit({
              hostName: name.trim(),
              adultContentEnabled: adult,
              hardContentEnabled: adult && hard,
              keepCrew: canKeepCrew && keepCrew,
            })
          }
        >
          {busy ? "Criando..." : copy.home.createRoom}
        </Button>
      }
    >
      <ScreenHeader title="Criar sala" subtitle="Você vira o host da mesa." onBack={onBack} />

      <div className="flex flex-col gap-6">
        <NameField
          label="Seu nome"
          value={name}
          placeholder={copy.players.placeholder}
          onChange={setName}
        />

        <div className="flex flex-col gap-3">
          <ContentToggle
            title={copy.adultContent.title}
            hint={adult ? copy.adultContent.onHint : copy.adultContent.offHint}
            enabled={adult}
            onToggle={() => {
              setAdult((current) => !current);
              setHard(false);
            }}
          />
          <ContentToggle
            title={copy.adultContent.hardTitle}
            hint={adult ? copy.adultContent.hardHint : "Ligue o 18+ primeiro."}
            enabled={hard}
            disabled={!adult}
            onToggle={() => setHard((current) => !current)}
          />
        </div>

        {canKeepCrew ? (
          <ContentToggle
            title="Continuar o placar da mesa"
            hint={
              keepCrew
                ? "Os pontos somam no mesmo placar da última vez."
                : "Começa um placar novo, do zero."
            }
            enabled={keepCrew}
            onToggle={() => setKeepCrew((current) => !current)}
          />
        ) : null}

        {error ? (
          <p className="rounded-2xl bg-pink-hot/15 p-4 text-sm text-pink-soft ring-1 ring-pink-hot/30">
            {error}
          </p>
        ) : null}
      </div>
    </Screen>
  );
}

interface ContentToggleProps {
  title: string;
  hint: string;
  enabled: boolean;
  disabled?: boolean;
  onToggle: () => void;
}

function ContentToggle({ title, hint, enabled, disabled = false, onToggle }: ContentToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={`tap-shrink flex items-center gap-4 rounded-2xl bg-violet-900/55 p-4 text-left ring-1 ring-violet-400/15 active:scale-[0.99] disabled:opacity-45 ${enabled ? "ring-cyan-soft/45" : ""}`}
    >
      <span
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ${enabled ? "bg-mint-deep" : "bg-violet-950"}`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-cream transition-transform duration-200 ${enabled ? "translate-x-6" : "translate-x-1"}`}
        />
      </span>
      <span className="min-w-0">
        <span className="block font-game text-base text-cream">{title}</span>
        <span className="mt-0.5 block text-xs leading-snug text-violet-300">{hint}</span>
      </span>
    </button>
  );
}
