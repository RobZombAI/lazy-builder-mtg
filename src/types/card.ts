export type Color = 'W' | 'U' | 'B' | 'R' | 'G';

export type CardRarity = 'common' | 'uncommon' | 'rare' | 'mythic';

export type FunctionalCategory = 
  | 'Commander'
  | 'Ramp'
  | 'Draw'
  | 'Tutor'
  | 'Removal'
  | 'Protection'
  | 'Counterspell'
  | 'BoardWipe'
  | 'TokenGenerator'
  | 'SacrificeOutlet'
  | 'Payoff'
  | 'Synergy'
  | 'ComboPiece'
  | 'WinCondition'
  | 'Lands';

export type TypeCategory = 
  | 'Commander'
  | 'Creature'
  | 'Instant'
  | 'Sorcery'
  | 'Artifact'
  | 'Enchantment'
  | 'Planeswalker'
  | 'Battle'
  | 'Land';

export interface CardLegalities {
  commander: 'legal' | 'banned' | 'restricted' | 'not_legal';
  [format: string]: string;
}

export interface Card {
  id: string;
  name: string;
  normalizedName: string;
  imageUrl: string;
  manaCost: string;
  cmc: number;
  colors: Color[];
  colorIdentity: Color[];
  typeLine: string;
  supertypes: string[];
  types: string[];
  subtypes: string[];
  oracleText: string;
  legalities: CardLegalities;
  set: string;
  setName?: string;
  rarity: CardRarity;
  priceUsd?: number;
  keywords?: string[];
  strategicTags?: FunctionalCategory[];
  isLand: boolean;
  producesMana?: Color[];
}

export interface Commander {
  card: Card;
  colorIdentity: Color[];
  suggestedStrategies: string[];
  estimatedPowerLevel: number;
  compatibleArchetypes: string[];
}
