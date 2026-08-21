import { createCategoryCards } from "@/data/deck/createCategoryCards";
import { CardCategory, CardDifficulty } from "@/types/card";

const texts = [
  "Eu tenho uma história que parece inventada, mas aconteceu exatamente assim.",
  "Eu conheci alguém uma vez em uma situação completamente improvável.",
  "Eu já tive que improvisar uma solução para um problema absurdo.",
  "Eu já perdi alguma coisa importante em um lugar muito óbvio.",
  "Eu já aceitei um convite sem saber exatamente no que estava me metendo.",
  "Eu já descobri uma informação importante por puro acaso.",
  "Eu já tive uma conversa que mudou completamente minha opinião sobre alguém.",
  "Eu já cheguei a um lugar sem saber por que tinha aceitado ir.",
  "Eu já conheci alguém que parecia muito diferente pela internet.",
  "Eu já tive que fingir tranquilidade quando estava completamente perdido.",
  "Eu já resolvi um problema por uma coincidência absurda.",
  "Eu já recebi uma notícia no pior momento possível.",
  "Eu já fiz amizade com alguém por causa de uma situação estranha.",
  "Eu já tomei uma decisão importante em menos de cinco minutos.",
  "Eu já me arrependi de não ter feito uma pergunta.",
  "Eu já descobri que uma pessoa que eu conhecia tinha uma vida completamente diferente da que eu imaginava.",
  "Eu já tive um plano perfeito dar errado por causa de um detalhe.",
  "Eu já aceitei uma situação só porque fiquei com vergonha de dizer não.",
  "Eu já tive que inventar uma solução quando ninguém sabia o que fazer.",
  "Eu já presenciei uma situação tão estranha que ninguém acreditaria.",
] as const;

export const plausibleCards = createCategoryCards({
  startId: 231,
  category: CardCategory.Plausible,
  difficulty: CardDifficulty.Medium,
  isAdult: false,
  texts,
});
