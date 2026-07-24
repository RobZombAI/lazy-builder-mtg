import { FunctionalCategory, TypeCategory } from './card';

export interface SynergyNode {
  id: string;
  name: string;
  normalizedName: string;
  imageUrl: string;
  cmc: number;
  typeCategory: TypeCategory;
  functionalCategory: FunctionalCategory;
}

export type SynergyStrength = 'combo' | 'high' | 'medium';

export interface SynergyLink {
  sourceId: string;
  targetId: string;
  description: string;
  strength: SynergyStrength;
  type: 'tribal' | 'sac_burn' | 'token_engine' | 'mana_engine' | 'tutor_target' | 'draw_engine' | 'general';
}

export interface ComboChainStep {
  stepNumber: number;
  cardName: string;
  action: string;
}

export interface ComboChain {
  id: string;
  title: string;
  cardsInvolved: string[];
  type: 'infinite' | 'synergy_loop' | 'wincon_engine';
  steps: ComboChainStep[];
  result: string;
}

export interface DeckSynergyReport {
  nodes: SynergyNode[];
  links: SynergyLink[];
  comboChains: ComboChain[];
  synergyClusters: {
    name: string;
    description: string;
    cardNames: string[];
  }[];
}
