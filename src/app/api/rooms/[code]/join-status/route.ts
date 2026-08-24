import { handle } from "@/app/api/_shared";
import { joinStatus, ServiceError } from "@/lib/game/online/service";

export async function GET(request: Request, context: { params: Promise<{ code: string }> }) {
  return handle(async () => {
    const { code } = await context.params;
    const requestToken = request.headers.get("x-request-token");

    if (!requestToken) {
      throw new ServiceError("pedido não identificado", 401);
    }

    return joinStatus({ code, requestToken });
  });
}
