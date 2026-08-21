import { handle } from "@/app/api/_shared";
import { sweepRoom } from "@/lib/game/online/service";

export async function POST(request: Request, context: { params: Promise<{ code: string }> }) {
  return handle(async () => {
    const { code } = await context.params;

    return sweepRoom({ code });
  });
}
