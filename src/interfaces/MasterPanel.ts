// src/interfaces/MasterPanel.ts

/** Entidade base de qualquer item da campanha (cena, NPC, etc.) */
export interface CampaignEntity {
  id: string;
  nome: string;
  tipo: 'cena' | 'npc';
  anotacoes?: string;
  localizacao?: string;
}

/** Cena – estende a base com campos específicos */
export interface Scene extends CampaignEntity {
  tipo: 'cena';
  numero: string;
  comandoId: string;
  trilhas?: string[];
  combates?: string[];
}

/** NPC – estende a base com campos específicos */
export interface NPC extends CampaignEntity {
  tipo: 'npc';
  ocupacao: string;
  atitude?: string;
  descricao?: string;
}

/** Dados completos da campanha (inclui listas de cenas e NPCs) */
export interface CampaignData {
  id: string;
  nome: string;
  criadorId: string;
  cenas: Scene[];
  npcs: NPC[];
  // outros campos futuros (ameaças, fichas, etc.)
}

/** Props do MasterPanel */
export interface MasterPanelProps {
  campaignName?: string;
  currentCampaign?: CampaignData;
}