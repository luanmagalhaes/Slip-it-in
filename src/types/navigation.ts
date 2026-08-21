export const Screen = {
  Home: "HOME",
  HowToPlay: "HOW_TO_PLAY",
  MatchSetup: "MATCH_SETUP",
  AdultContent: "ADULT_CONTENT",
  Players: "PLAYERS",
  Deal: "DEAL",
  PrivateHand: "PRIVATE_HAND",
  Table: "TABLE",
  AccusationResult: "ACCUSATION_RESULT",
  Victory: "VICTORY",
  Scoreboard: "SCOREBOARD",
  Settings: "SETTINGS",
} as const;

export type Screen = (typeof Screen)[keyof typeof Screen];
