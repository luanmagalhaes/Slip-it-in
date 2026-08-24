"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useClipboard } from "@/hooks/useClipboard";
import { useHaptics } from "@/hooks/useHaptics";
import { brand } from "@/data/copy";

interface RoomCodeCardProps {
  code: string;
}

export function RoomCodeCard({ code }: RoomCodeCardProps) {
  const { copy, copied } = useClipboard();
  const [linkCopied, setLinkCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const vibrate = useHaptics();

  const inviteUrl = () => `${window.location.origin}/?join=${code}`;

  const copyCode = async () => {
    setLinkCopied(false);
    const done = await copy(code);

    setFailed(!done);

    if (done) {
      vibrate("tap");
    }
  };

  const shareInvite = async () => {
    const url = inviteUrl();

    if (navigator.share) {
      try {
        await navigator.share({
          title: brand.name,
          text: `Bora jogar ${brand.name}. O código da sala é ${code}.`,
          url,
        });

        return;
      } catch {
        return;
      }
    }

    const done = await copy(url);

    setLinkCopied(done);
    setFailed(!done);

    if (done) {
      vibrate("tap");
    }
  };

  const label = failed
    ? "Copie o código na mão"
    : linkCopied
      ? "Link copiado!"
      : copied
        ? "Código copiado!"
        : "Toque no código para copiar";

  return (
    <div className="mb-4">
      <button
        type="button"
        onClick={copyCode}
        aria-label={`Copiar o código da sala ${code}`}
        className="tap-shrink edge-raised gradient-mint w-full rounded-[1.75rem] px-6 py-5 text-center text-ink active:scale-[0.99]"
      >
        <span className="block text-xs font-bold uppercase tracking-[0.2em] opacity-70">
          Código da sala
        </span>
        <span className="font-display mt-1 block text-5xl tracking-[0.22em]">{code}</span>
        <span
          className={`font-game mt-2 block text-xs ${
            copied && !linkCopied ? "opacity-100" : "opacity-65"
          }`}
        >
          {label}
        </span>
      </button>

      <div className="mt-2.5">
        <Button variant="secondary" fullWidth onClick={shareInvite}>
          Compartilhar convite
        </Button>
      </div>
    </div>
  );
}
