export interface Attributes {
  fisico: number;
  conhecimento: number;
  sabedoria: number;
  presenca: number;
  vigor: number;
}

// Tipo do nível de perícia
export type ProficiencyLevel = 'treinado' | 'expert';

export interface Character {
  id?: string;
  uid: string;

  // Informações Gerais & Nível
  nome: string;
  nivel?: number;
  maestria?: number;
  idade?: number;
  origem: string;
  profissao: string;
  arquetipo?: string;
  imagem?: string;

  // Status de Jogo
  vidaAtual: number;
  vidaMaxima: number;
  peAtual: number;
  peMaximo: number;

  // Defesa & Combate
  armadura?: number;
  outrosDefesa?: number;
  defesaTotal?: number;

  // Atributos e Perícias
  atributos: Attributes;
  pericias?: Record<string, ProficiencyLevel>; // Mapeia nome da perícia para o nível
  conhecimentosText?: string;

  // Lore
  historia: string;

  createdAt?: any;
}