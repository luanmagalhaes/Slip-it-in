import { handle, playerToken } from "@/app/api/_shared";
import { rematch } from "@/lib/game/online/service";

export async function POST(request: Request, context: { params: Promise<{ code: string }> }) {
  return handle(async () => {
    const { code } = await context.params;

    return rematch({ code, token: playerToken(request) });
  });
}
