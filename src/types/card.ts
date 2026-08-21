export const CardCategory = {
  DailyLife: "DAILY_LIFE",
  Absurd: "ABSURD",
  Clever: "CLEVER",
  Suspicious: "SUSPICIOUS",
  Social: "SOCIAL",
  Embarrassing: "EMBARRASSING",
  Plausible: "PLAUSIBLE",
  Spicy: "SPICY",
} as const;

export type CardCategory = (typeof CardCategory)[keyof typeof CardCategory];

export const CardDifficulty = {
  Easy: "EASY",
  Medium: "MEDIUM",
  Hard: "HARD",
} as const;

export type CardDifficulty = (typeof CardDifficulty)[keyof typeof CardDifficulty];

export interface Card {
  id: string;
  text: string;
  category: CardCategory;
  difficulty: CardDifficulty;
  isAdult: boolean;
  tags: string[];
}
