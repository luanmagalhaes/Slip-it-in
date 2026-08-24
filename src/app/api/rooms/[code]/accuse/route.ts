import { handle, playerToken, requiredId } from "@/app/api/_shared";
import { accusePlayer } from "@/lib/game/online/service";

export async function POST(request: Request, context: { params: Promise<{ code: string }> }) {
  return handle(async () => {
    const { code } = await context.params;
    const body = await request.json();

    return accusePlayer({
      code,
      token: playerToken(request),
      accusedId: requiredId(body.accusedId, "jogador"),
    });
  });
}
