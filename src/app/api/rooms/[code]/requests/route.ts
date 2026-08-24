import { handle, playerToken } from "@/app/api/_shared";
import { pendingRequests, resolveJoinRequest } from "@/lib/game/online/service";

export async function GET(request: Request, context: { params: Promise<{ code: string }> }) {
  return handle(async () => {
    const { code } = await context.params;

    return pendingRequests({ code, token: playerToken(request) });
  });
}

export async function POST(request: Request, context: { params: Promise<{ code: string }> }) {
  return handle(async () => {
    const { code } = await context.params;
    const body = await request.json();

    return resolveJoinRequest({
      code,
      token: playerToken(request),
      requestId: String(body.requestId ?? ""),
      approve: Boolean(body.approve),
    });
  });
}
