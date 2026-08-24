"use client";

import { Button } from "@/components/ui/Button";
import type { JoinRequestSummary } from "@/lib/api/client";

interface JoinRequestSheetProps {
  request: JoinRequestSummary;
  busy: boolean;
  onResolve: (requestId: string, approve: boolean) => void;
}

export function JoinRequestSheet({ request, busy, onResolve }: JoinRequestSheetProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-4 pb-[calc(var(--safe-bottom)+1rem)]">
      <div className="animate-card-rise edge-raised rounded-[1.75rem] bg-violet-800 p-5 ring-2 ring-inset ring-mint/35">
        <div className="mb-3 flex items-center gap-3">
          <span className="gradient-mint flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-ink">
            <span className="font-display text-lg leading-none">
              {request.name.slice(0, 2).toUpperCase()}
            </span>
          </span>
          <span className="min-w-0">
            <span className="font-game block truncate text-lg text-cream">{request.name}</span>
            <span className="text-xs text-violet-300">quer entrar na partida</span>
          </span>
        </div>

        <p className="mb-4 text-sm leading-snug text-violet-200">
          Se você aceitar, ela recebe 5 cartas do monte e entra na rodada agora.
        </p>

        <div className="flex gap-2.5">
          <Button
            variant="mint"
            size="md"
            fullWidth
            disabled={busy}
            onClick={() => onResolve(request.id, true)}
          >
            Aceitar
          </Button>
          <Button
            variant="danger"
            size="md"
            fullWidth
            disabled={busy}
            onClick={() => onResolve(request.id, false)}
          >
            Recusar
          </Button>
        </div>
      </div>
    </div>
  );
}
