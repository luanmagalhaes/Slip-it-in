"use client";

import { useState } from "react";
import { NameField } from "@/components/online/NameField";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { copy } from "@/data/copy";

interface JoinRoomScreenProps {
  busy: boolean;
  error: string | null;
  initialCode?: string;
  onBack: () => void;
  onSubmit: (input: { code: string; name: string }) => void;
}

export function JoinRoomScreen({
  busy,
  error,
  initialCode = "",
  onBack,
  onSubmit,
}: JoinRoomScreenProps) {
  const [code, setCode] = useState(initialCode);
  const [name, setName] = useState("");
  const ready = code.trim().length === 6 && name.trim().length > 0;

  return (
    <Screen
      footer={
        <Button
          variant="mint"
          size="lg"
          fullWidth
          disabled={busy || !ready}
          onClick={() => onSubmit({ code: code.trim().toUpperCase(), name: name.trim() })}
        >
          {busy ? "Entrando..." : "Entrar"}
        </Button>
      }
    >
      <ScreenHeader
        title="Entrar na sala"
        subtitle="Peça o código de 6 letras pra quem criou."
        onBack={onBack}
      />

      <div className="flex flex-col gap-6">
        <NameField
          label="Código da sala"
          value={code}
          placeholder="ABC123"
          maxLength={6}
          uppercase
          onChange={setCode}
        />
        <NameField
          label="Seu nome"
          value={name}
          placeholder={copy.players.placeholder}
          onChange={setName}
        />

        {error ? (
          <p className="rounded-2xl bg-pink-hot/15 p-4 text-sm text-pink-soft ring-1 ring-pink-hot/30">
            {error}
          </p>
        ) : null}
      </div>
    </Screen>
  );
}
