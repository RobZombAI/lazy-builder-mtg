import { Card, Commander, FunctionalCategory, TypeCategory } from './card';

export interface DeckCard {
  card: Card;
  quantity: number;
  categoryByCardType: TypeCategory;
  categoryByFunction: FunctionalCategory;
  reasoning: string;
  isLocked: boolean;
}

export interface DeckStats {
  totalCards: number;
  avgCmc: number;
  manaCurve: Record<number, number>; // 0, 1, 2, 3, 4, 5, 6 (6+)
  colorDistribution: Record<string, number>;
  landCount: number;
  coloredSourcesCount: Record<string, number>;
  rampCount: number;
  drawCount: number;
  interactionCount: number;
  estimatedPriceUsd: number;
}

export interface ReplaceableSuggestion {
  originalCard: string;
  suggestedCard: string;
  reasoning: string;
  category: 'budget' | 'power' | 'thematic';
  priceDifferenceUsd?: number;
}

export interface StrategyAnalysis {
  overview: string;
  earlyGame: string;
  midGame: string;
  lateGame: string;
  winConditions: string[];
  synergiesAndCombos: string[];
  strengths: string[];
  weaknesses: string[];
  warnings: string[];
  replaceableSuggestions: ReplaceableSuggestion[];
}

export interface Deck {
  id: string;
  name: string;
  commander: Commander;
  cards: DeckCard[];
  stats: DeckStats;
  estimatedPowerLevel: number;
  strategyAnalysis: StrategyAnalysis;
  isValid: boolean;
  validationErrors: string[];
  createdAt: string;
}
