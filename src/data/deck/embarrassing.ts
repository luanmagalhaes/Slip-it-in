import { createCategoryCards } from "@/data/deck/createCategoryCards";
import { CardCategory, CardDifficulty } from "@/types/card";

const texts = [
  "Eu já mandei mensagem para a pessoa errada e fiquei olhando a tela em silêncio.",
  "Eu já acenei para alguém que não estava acenando para mim.",
  "Eu já fingi reconhecer alguém porque fiquei com vergonha de perguntar o nome.",
  "Eu já ri em uma situação em que definitivamente não deveria.",
  "Eu já tropecei tentando parecer que não tinha tropeçado.",
  "Eu já procurei uma coisa que estava na minha mão.",
  "Eu já respondi \"você também\" para alguém que me desejou bom apetite.",
  "Eu já entrei no carro errado por distração.",
  "Eu já esqueci o nome de alguém no meio da apresentação.",
  "Eu já ensaiei uma conversa inteira que nunca aconteceu.",
  "Eu já dei uma resposta séria para uma pergunta que era brincadeira.",
  "Eu já concordei com algo sem ter entendido absolutamente nada.",
  "Eu já fingi que sabia uma música e comecei a cantar errado.",
  "Eu já mandei uma mensagem e imediatamente quis destruir o celular.",
  "Eu já tentei parecer ocupado para evitar uma conversa.",
  "Eu já ri de uma piada que não entendi.",
  "Eu já fiquei procurando meus óculos enquanto eles estavam no meu rosto.",
  "Eu já disse \"até amanhã\" para alguém que eu sabia que não veria no dia seguinte.",
  "Eu já inventei uma desculpa e esqueci qual era depois.",
  "Eu já entrei em uma sala e esqueci completamente o motivo.",
  "Eu já julguei alguém e descobri depois que eu estava completamente errado.",
  "Eu já pratiquei uma resposta antes de atender uma ligação.",
  "Eu já fiquei com vergonha de perguntar o preço de alguma coisa.",
  "Eu já abri uma mensagem, esperei horas e depois esqueci de responder.",
  "Eu já fiz uma compra e imediatamente me arrependi.",
] as const;

export const embarrassingCards = createCategoryCards({
  startId: 206,
  category: CardCategory.Embarrassing,
  difficulty: CardDifficulty.Easy,
  isAdult: false,
  texts,
});
