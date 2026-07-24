import { Commander, FunctionalCategory } from './card';

export interface DeckRequest {
  commander: Commander;
  powerLevel: number; // 1 to 5
  description: string;
  maxBudgetUsd?: number;
  allowInfiniteCombos: boolean;
  mandatoryCards: string[];
  excludedCards: string[];
  primaryStrategy?: string;
  secondaryStrategy?: string;
  desiredLandCount?: number;
  playStyle?: 'aggro' | 'combo' | 'control' | 'midrange' | 'tribal' | 'value';
}

export interface CategoryBudget {
  lands: number;
  ramp: number;
  draw: number;
  tutors: number;
  removal: number;
  protection: number;
  counterspells: number;
  boardWipes: number;
  synergyPayoffs: number;
  winconsAndCombos: number;
}

export interface PowerLevelProfile {
  level: number;
  name: string;
  description: string;
  targetAvgCmc: number;
  recommendedTutors: number;
  recommendedFastRamp: number;
  recommendedInteractionCount: number;
  allowCompactCombos: boolean;
  categoryBudget: CategoryBudget;
  cedhWarningNeeded?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}
