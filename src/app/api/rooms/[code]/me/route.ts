import { handle, playerToken } from "@/app/api/_shared";
import { getMyState } from "@/lib/game/online/service";

export async function GET(request: Request, context: { params: Promise<{ code: string }> }) {
  return handle(async () => {
    const { code } = await context.params;

    return getMyState({ code, token: playerToken(request) });
  });
}
