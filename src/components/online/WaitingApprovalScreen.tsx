"use client";

import { Button } from "@/components/ui/Button";
import { Wordmark } from "@/components/ui/Wordmark";

interface WaitingApprovalScreenProps {
  code: string;
  name: string;
  rejected: boolean;
  onCancel: () => void;
}

export function WaitingApprovalScreen({
  code,
  name,
  rejected,
  onCancel,
}: WaitingApprovalScreenProps) {
  return (
    <div className="gradient-stage flex min-h-dvh flex-col items-center justify-center gap-7 px-8 pb-[calc(var(--safe-bottom)+2rem)] text-center">
      <Wordmark size="md" />

      {rejected ? (
        <>
          <h1 className="font-display text-3xl leading-tight text-cream">
            O host não deixou você entrar
          </h1>
          <p className="max-w-[17rem] text-sm leading-relaxed text-violet-200">
            Fale com quem criou a sala e tente de novo.
          </p>
        </>
      ) : (
        <>
          <div className="animate-glow-drift gradient-mint flex h-20 w-20 items-center justify-center rounded-[1.75rem] text-ink">
            <span className="font-display text-3xl leading-none">{name.slice(0, 2)}</span>
          </div>
          <h1 className="font-display text-3xl leading-tight text-cream">
            Esperando o host aceitar
          </h1>
          <p className="max-w-[18rem] text-sm leading-relaxed text-violet-200">
            {`A partida da sala ${code} já começou. Pedimos para o host te encaixar na mesa — assim que ele aceitar, suas cartas aparecem aqui.`}
          </p>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((dot) => (
              <span
                key={dot}
                className="animate-glow-drift h-2.5 w-2.5 rounded-full bg-cyan-soft"
                style={{ animationDelay: `${dot * 260}ms` }}
              />
            ))}
          </div>
        </>
      )}

      <div className="w-full max-w-[17rem]">
        <Button variant="secondary" fullWidth onClick={onCancel}>
          {rejected ? "Voltar" : "Desistir"}
        </Button>
      </div>
    </div>
  );
}
