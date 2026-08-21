import { absurdCards } from "@/data/deck/absurd";
import { cleverCards } from "@/data/deck/clever";
import { dailyLifeCards } from "@/data/deck/dailyLife";
import { embarrassingCards } from "@/data/deck/embarrassing";
import { plausibleCards } from "@/data/deck/plausible";
import { socialCards } from "@/data/deck/social";
import { spicyCards } from "@/data/deck/spicy";
import { suspiciousCards } from "@/data/deck/suspicious";
import type { Card } from "@/types/card";

export const baseDeck: readonly Card[] = [
  ...dailyLifeCards,
  ...absurdCards,
  ...cleverCards,
  ...suspiciousCards,
  ...socialCards,
  ...embarrassingCards,
  ...plausibleCards,
  ...spicyCards,
];

export {
  absurdCards,
  cleverCards,
  dailyLifeCards,
  embarrassingCards,
  plausibleCards,
  socialCards,
  spicyCards,
  suspiciousCards,
};
