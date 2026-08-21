import { handle, playerToken } from "@/app/api/_shared";
import { armCard } from "@/lib/game/online/service";

export async function POST(request: Request, context: { params: Promise<{ code: string }> }) {
  return handle(async () => {
    const { code } = await context.params;
    const body = await request.json();

    return armCard({ code, token: playerToken(request), cardId: String(body.cardId ?? "") });
  });
}
