import { handle, playerToken } from "@/app/api/_shared";
import { kickPlayer } from "@/lib/game/online/service";

export async function POST(request: Request, context: { params: Promise<{ code: string }> }) {
  return handle(async () => {
    const { code } = await context.params;
    const body = await request.json();

    return kickPlayer({
      code,
      token: playerToken(request),
      playerId: String(body.playerId ?? ""),
    });
  });
}
