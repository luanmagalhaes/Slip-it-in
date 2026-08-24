import { handle } from "@/app/api/_shared";
import { matchSummary } from "@/lib/game/online/service";

export async function GET(request: Request, context: { params: Promise<{ code: string }> }) {
  return handle(async () => {
    const { code } = await context.params;

    return matchSummary({ code });
  });
}
