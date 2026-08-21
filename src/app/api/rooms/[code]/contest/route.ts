import { handle, playerToken } from "@/app/api/_shared";
import { voteContest } from "@/lib/game/online/service";

export async function POST(request: Request, context: { params: Promise<{ code: string }> }) {
  return handle(async () => {
    const { code } = await context.params;
    const body = await request.json();

    return voteContest({
      code,
      token: playerToken(request),
      claimId: String(body.claimId ?? ""),
      saidIt: Boolean(body.saidIt),
    });
  });
}
