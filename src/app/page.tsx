import { AppStateProvider } from "@/components/layout/AppStateProvider";
import { ScreenRouter } from "@/components/layout/ScreenRouter";

export default function Page() {
  return (
    <AppStateProvider>
      <ScreenRouter />
    </AppStateProvider>
  );
}
