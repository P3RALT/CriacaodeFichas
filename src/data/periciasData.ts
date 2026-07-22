export interface PericiaInfo {
  nome: string;
  atributo: 'fisico' | 'conhecimento' | 'presenca' | 'sabedoria';
}

export const LISTA_PERICIAS: PericiaInfo[] = [
  // FÍSICO
  { nome: 'Atletismo', atributo: 'fisico' },
  { nome: 'Prestidigitação', atributo: 'fisico' },
  { nome: 'Acrobacia', atributo: 'fisico' },
  { nome: 'Furtividade', atributo: 'fisico' },

  // CONHECIMENTO
  { nome: 'Investigação', atributo: 'conhecimento' },
  { nome: 'Ocultismo', atributo: 'conhecimento' },
  { nome: 'Tecnologia', atributo: 'conhecimento' },
  { nome: 'História', atributo: 'conhecimento' },
  { nome: 'Ciências', atributo: 'conhecimento' },
  { nome: 'Ofício', atributo: 'conhecimento' },

  // PRESENÇA
  { nome: 'Persuasão', atributo: 'presenca' },
  { nome: 'Intimidação', atributo: 'presenca' },
  { nome: 'Enganação', atributo: 'presenca' },
  { nome: 'Atualidades', atributo: 'presenca' },

  // SABEDORIA
  { nome: 'Intuição', atributo: 'sabedoria' },
  { nome: 'Sobrevivência', atributo: 'sabedoria' },
  { nome: 'Religião', atributo: 'sabedoria' },
  { nome: 'Medicina', atributo: 'sabedoria' },
];