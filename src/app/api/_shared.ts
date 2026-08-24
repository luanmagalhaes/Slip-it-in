import { NextResponse } from "next/server";
import { ServiceError } from "@/lib/game/online/service";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function playerToken(request: Request): string {
  const token = request.headers.get("x-player-token");

  if (!token) {
    throw new ServiceError("sessão expirada, entre na sala de novo", 401);
  }

  return token;
}

export function requiredId(value: unknown, label: string): string {
  const text = typeof value === "string" ? value.trim() : "";

  if (!uuidPattern.test(text)) {
    throw new ServiceError(`${label} inválido`, 422);
  }

  return text;
}

export async function handle<T>(action: () => Promise<T>) {
  try {
    return NextResponse.json(await action());
  } catch (error) {
    if (error instanceof ServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error("erro nao tratado na rota", error);

    return NextResponse.json({ error: "algo deu errado, tente de novo" }, { status: 500 });
  }
}
