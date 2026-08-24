import { handle } from "@/app/api/_shared";
import { crewScoreboard } from "@/lib/game/online/service";

export async function GET(request: Request, context: { params: Promise<{ crewId: string }> }) {
  return handle(async () => {
    const { crewId } = await context.params;

    return crewScoreboard({ crewId });
  });
}
