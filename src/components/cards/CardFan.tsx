import { GameCard } from "@/components/cards/GameCard";
import type { Card } from "@/types/card";

interface CardFanProps {
  cards: readonly Card[];
}

const transforms = [
  "rotate(-11deg) translate(-16%, 6%)",
  "rotate(-3deg) translate(-2%, 0%)",
  "rotate(8deg) translate(14%, 5%)",
];

export function CardFan({ cards }: CardFanProps) {
  return (
    <div aria-hidden className="relative mx-auto h-[8.5rem] w-full max-w-[19rem]">
      {cards.slice(0, transforms.length).map((card, index) => (
        <div
          key={card.id}
          className="gpu absolute inset-x-6 top-0 origin-bottom"
          style={{ transform: transforms[index], zIndex: index }}
        >
          <GameCard card={card} size="sm" />
        </div>
      ))}
    </div>
  );
}
