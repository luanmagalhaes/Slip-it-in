import { createCategoryCards } from "@/data/deck/createCategoryCards";
import { CardCategory, CardDifficulty } from "@/types/card";

const texts = [
  "Qual foi a última coisa que realmente te fez rir?",
  "Eu quero saber qual foi a pior desculpa que alguém já usou com você.",
  "Eu acho que todo grupo tem uma pessoa que sempre chega atrasada.",
  "Eu quero saber quem aqui sobreviveria melhor sozinho.",
  "Eu acho que a primeira impressão dessa pessoa estava completamente errada.",
  "Eu quero saber qual hábito estranho ninguém aqui admite.",
  "Eu acho que todo mundo deveria ter uma história que não conta no primeiro encontro.",
  "Eu quero saber qual foi a compra mais inútil que você já fez.",
  "Eu acho que dá para descobrir muita coisa perguntando qual música alguém odeia.",
  "Eu quero saber quem aqui seria pior em um reality show.",
  "Eu acho que toda amizade tem pelo menos uma discussão completamente idiota.",
  "Eu quero saber qual é a coisa mais aleatória que você sabe fazer.",
  "Eu acho que alguém aqui teria uma carreira secreta muito interessante.",
  "Eu quero saber qual foi a situação mais constrangedora que você conseguiu transformar em piada.",
  "Eu acho que toda pessoa tem uma opinião que defenderia até cansar.",
  "Eu quero saber qual seria o pior colega de apartamento desta mesa.",
  "Eu acho que ninguém aqui escolheria o mesmo superpoder.",
  "Eu quero saber qual foi a viagem mais inesperada que você já fez.",
  "Eu acho que alguém aqui seria excelente em convencer pessoas.",
  "Eu quero saber qual regra social você acha completamente sem sentido.",
  "Eu acho que todo mundo tem uma comida que não admite gostar.",
  "Eu quero saber qual foi a mentira mais inofensiva que você já contou.",
  "Eu acho que a melhor história de alguém geralmente começa com \"não acredito que fiz isso\".",
  "Eu quero saber quem aqui seria preso primeiro em uma comédia.",
  "Eu acho que toda roda de amigos tem um especialista em decisões ruins.",
  "Eu quero saber qual foi o pior conselho que você já recebeu.",
  "Eu acho que alguém aqui tem uma história que ninguém acreditaria.",
  "Eu quero saber qual profissão você jamais conseguiria exercer.",
  "Eu acho que conhecer alguém pela comida favorita é mais útil do que parece.",
  "Eu quero saber qual hábito você gostaria de abandonar.",
] as const;

export const socialCards = createCategoryCards({
  startId: 176,
  category: CardCategory.Social,
  difficulty: CardDifficulty.Medium,
  isAdult: false,
  texts,
});
