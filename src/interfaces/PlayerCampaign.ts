export type CharacterStatus = 'Vivo' | 'Desaparecido' | 'Morto' | 'Desconhecido';
export type ClueStatus = 'Confirmada' | 'Em Investigação' | 'Falsa Pista';
export type ClueCategory = 'Documento' | 'Objeto' | 'Foto' | 'Relatório' | 'Testemunho' | 'Evidência Paranormal' | 'Outros';

export interface PlayerCharacter {
  id: string;
  nome: string;
  fotoUrl?: string;
  cargo: string;
  idade?: number | string;
  descricao: string;
  relacaoCampanha: string;
  status: CharacterStatus;
  informacoesDescobertas: string[];
  revelado: boolean;
}

export interface Clue {
  id: string;
  nome: string;
  imagemUrl?: string;
  categoria: ClueCategory;
  localEncontrado: string;
  dataEncontrada: string;
  descricao: string;
  quemEncontrou: string;
  status: ClueStatus;
  revelado: boolean;
}

export interface PersonalNote {
  id: string;
  titulo: string;
  conteudo: string;
  fixada: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

export interface JournalEntry {
  id: string;
  categoriaId: string;
  titulo: string;
  subtitulo?: string;
  conteudo: string;
  revelado: boolean;
  atualizadoEm: string;
}

export interface JournalCategory {
  id: string;
  nome: string;
  ordem: number;
}

export interface PlayerCampaignData {
  id: string;
  nome: string;
  bannerUrl?: string;
  descricao: string;
  mestreNome: string;
  quantidadeJogadores: number;
  ultimaAtualizacao: string;
}