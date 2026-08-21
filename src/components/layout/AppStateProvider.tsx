"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useDraftController } from "@/hooks/useDraftController";
import { useMatchController } from "@/hooks/useMatchController";
import { useScoreboardController } from "@/hooks/useScoreboardController";
import { Screen } from "@/types/navigation";

type DraftController = ReturnType<typeof useDraftController>;
type MatchController = ReturnType<typeof useMatchController>;
type ScoreboardController = ReturnType<typeof useScoreboardController>;

interface AppStateValue {
  screen: Screen;
  goTo: (screen: Screen) => void;
  activePlayerId: string | null;
  setActivePlayerId: (playerId: string | null) => void;
  lastAccusationCorrect: boolean | null;
  setLastAccusationCorrect: (value: boolean | null) => void;
  draftController: DraftController;
  matchController: MatchController;
  scoreboardController: ScoreboardController;
}

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<Screen>(Screen.Home);
  const [activePlayerId, setActivePlayerId] = useState<string | null>(null);
  const [lastAccusationCorrect, setLastAccusationCorrect] = useState<boolean | null>(null);

  const draftController = useDraftController();
  const matchController = useMatchController();
  const scoreboardController = useScoreboardController();

  const goTo = useCallback((next: Screen) => {
    setScreen(next);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0 });
    }
  }, []);

  const value = useMemo(
    () => ({
      screen,
      goTo,
      activePlayerId,
      setActivePlayerId,
      lastAccusationCorrect,
      setLastAccusationCorrect,
      draftController,
      matchController,
      scoreboardController,
    }),
    [
      screen,
      goTo,
      activePlayerId,
      lastAccusationCorrect,
      draftController,
      matchController,
      scoreboardController,
    ],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppStateValue {
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error("useAppState precisa estar dentro de AppStateProvider");
  }

  return context;
}
