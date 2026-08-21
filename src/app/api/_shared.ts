import { NextResponse } from "next/server";
import { ServiceError } from "@/lib/game/online/service";

export function playerToken(request: Request): string {
  const token = request.headers.get("x-player-token");

  if (!token) {
    throw new ServiceError("token do jogador ausente", 401);
  }

  return token;
}

export async function handle<T>(action: () => Promise<T>) {
  try {
    return NextResponse.json(await action());
  } catch (error) {
    if (error instanceof ServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    const message = error instanceof Error ? error.message : "erro inesperado";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
