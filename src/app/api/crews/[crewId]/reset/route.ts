import { handle } from "@/app/api/_shared";
import { resetCrewScoreboard } from "@/lib/game/online/service";

export async function POST(request: Request, context: { params: Promise<{ crewId: string }> }) {
  return handle(async () => {
    const { crewId } = await context.params;

    return resetCrewScoreboard({ crewId });
  });
}
