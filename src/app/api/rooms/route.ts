import { handle } from "@/app/api/_shared";
import { createRoom } from "@/lib/game/online/service";

export async function POST(request: Request) {
  return handle(async () => {
    const body = await request.json();

    return createRoom({
      hostName: String(body.hostName ?? ""),
      adultContentEnabled: Boolean(body.adultContentEnabled),
      hardContentEnabled: Boolean(body.hardContentEnabled),
      crewId: typeof body.crewId === "string" ? body.crewId : null,
    });
  });
}
