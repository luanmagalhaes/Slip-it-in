"use client";

import { useAppState } from "@/components/layout/AppStateProvider";
import { AccusationResultScreen } from "@/components/screens/AccusationResultScreen";
import { AdultContentScreen } from "@/components/screens/AdultContentScreen";
import { DealScreen } from "@/components/screens/DealScreen";
import { HomeScreen } from "@/components/screens/HomeScreen";
import { HowToPlayScreen } from "@/components/screens/HowToPlayScreen";
import { MatchSetupScreen } from "@/components/screens/MatchSetupScreen";
import { PlayersScreen } from "@/components/screens/PlayersScreen";
import { PrivateHandScreen } from "@/components/screens/PrivateHandScreen";
import { ScoreboardScreen } from "@/components/screens/ScoreboardScreen";
import { SettingsScreen } from "@/components/screens/SettingsScreen";
import { TableScreen } from "@/components/screens/TableScreen";
import { VictoryScreen } from "@/components/screens/VictoryScreen";
import { Screen } from "@/types/navigation";

const screens: Record<Screen, () => React.JSX.Element | null> = {
  [Screen.Home]: HomeScreen,
  [Screen.HowToPlay]: HowToPlayScreen,
  [Screen.MatchSetup]: MatchSetupScreen,
  [Screen.AdultContent]: AdultContentScreen,
  [Screen.Players]: PlayersScreen,
  [Screen.Deal]: DealScreen,
  [Screen.PrivateHand]: PrivateHandScreen,
  [Screen.Table]: TableScreen,
  [Screen.AccusationResult]: AccusationResultScreen,
  [Screen.Victory]: VictoryScreen,
  [Screen.Scoreboard]: ScoreboardScreen,
  [Screen.Settings]: SettingsScreen,
};

export function ScreenRouter() {
  const { screen } = useAppState();
  const Active = screens[screen];

  return <Active />;
}
