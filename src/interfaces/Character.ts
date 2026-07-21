// Define a estrutura dos 5 atributos -
export interface Attributes {
  fisico: number;
  conhecimento: number;
  sabedoria: number;
  presenca: number;
  vigor: number;
}

export interface Character {
  id?: string;          // ID Firestore
  uid: string;          // ID do usuário

// Informações Gerais
  nome: string;
  idade: number;
  origem: string;
  arquetipo: string;
  imagem?: string;

  // Atributos e Perícias
  atributos: Attributes;
  pericias: string[];

  // Roleplay & Lore
  historia: string;
  conflito: string;
  vinculo: string;

  // Status de Jogo (Pontos de Vida e Pontos de Esforço/Energia)
  vidaAtual: number;
  vidaMaxima: number;
  peAtual: number;
  peMaximo: number;
  
  createdAt?: any;     // Data 
}

