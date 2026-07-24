import { Card, FunctionalCategory } from '../../types/card';
import { DeckRequest } from '../../types/generator';

export interface StrategyParseResult {
  primaryArchetype: string;
  keyThemes: string[];
  preferredCategories: FunctionalCategory[];
  isAggressive: boolean;
  isAristocrats: boolean;
  isComboOriented: boolean;
}

export class StrategyHeuristics {
  /**
   * Parses free-text prompt to extract MTG strategic intent
   */
  static parsePrompt(description: string, commanderName: string): StrategyParseResult {
    const text = (description + ' ' + commanderName).toLowerCase();

    const keyThemes: string[] = [];
    const preferredCategories: FunctionalCategory[] = [];

    let primaryArchetype = 'Synergy & Value';
    let isAggressive = false;
    let isAristocrats = false;
    let isComboOriented = false;

    if (text.includes('goblin') || text.includes('pedine') || text.includes('token') || text.includes('swarm') || text.includes('elf')) {
      keyThemes.push('Token Generation', 'Swarm Aggro');
      preferredCategories.push('TokenGenerator', 'Synergy', 'Payoff');
      primaryArchetype = 'Token Swarm';
      isAggressive = true;
    }

    if (text.includes('sacrific') || text.includes('danni diretti') || text.includes('burn') || text.includes('aristocrat') || text.includes('muore')) {
      keyThemes.push('Sacrifice Outlet', 'Direct Damage / Burn');
      preferredCategories.push('SacrificeOutlet', 'Payoff', 'WinCondition');
      isAristocrats = true;
      if (primaryArchetype === 'Synergy & Value') primaryArchetype = 'Aristocrats & Burn';
    }

    if (text.includes('combo') || text.includes('infinit') || text.includes('esplosiv') || text.includes('tutor')) {
      keyThemes.push('Infinite Combos', 'Tutors & Velocity');
      preferredCategories.push('ComboPiece', 'Tutor', 'Ramp');
      isComboOriented = true;
    }

    if (text.includes('control') || text.includes('counter') || text.includes('rimozion') || text.includes('board wipe')) {
      keyThemes.push('Control & Board Denial');
      preferredCategories.push('Removal', 'Counterspell', 'BoardWipe', 'Draw');
      primaryArchetype = 'Control';
    }

    return {
      primaryArchetype,
      keyThemes,
      preferredCategories,
      isAggressive,
      isAristocrats,
      isComboOriented
    };
  }

  /**
   * Scores a candidate card against a DeckRequest and Strategy profile
   */
  static scoreCard(card: Card, request: DeckRequest, parseResult: StrategyParseResult): number {
    let score = 50; // base score

    const normName = card.normalizedName;

    // Mandatory inclusion bonus
    if (request.mandatoryCards.some(m => m.toLowerCase() === normName)) {
      return 10000; // highest priority
    }

    // Excluded check
    if (request.excludedCards.some(e => e.toLowerCase() === normName)) {
      return -10000;
    }

    // Budget check
    if (request.maxBudgetUsd && card.priceUsd && card.priceUsd > request.maxBudgetUsd * 0.25) {
      score -= 30; // penalize super expensive cards if tight budget
    }

    // Power Level CMC penalty/bonus
    if (request.powerLevel >= 4) {
      if (card.cmc <= 2) score += 25;
      else if (card.cmc >= 5 && !card.isLand) score -= 20;
    } else if (request.powerLevel <= 2) {
      if (card.cmc >= 4 && card.cmc <= 6) score += 10;
    }

    // Strategic alignment
    const text = card.oracleText.toLowerCase();
    const type = card.typeLine.toLowerCase();

    // Match keywords/themes
    parseResult.keyThemes.forEach(theme => {
      if (theme.includes('Token') && (text.includes('token') || text.includes('create'))) score += 30;
      if (theme.includes('Sacrifice') && (text.includes('sacrifice') || text.includes('dies'))) score += 30;
      if (theme.includes('Burn') && (text.includes('damage to each opponent') || text.includes('damage to any target'))) score += 25;
      if (theme.includes('Combos') && card.strategicTags?.includes('ComboPiece')) score += 35;
    });

    // Match subtypes (e.g. Goblin for Krenko)
    const cmdSubtypes = request.commander.card.subtypes;
    if (cmdSubtypes.length > 0) {
      cmdSubtypes.forEach(st => {
        if (card.subtypes.includes(st)) score += 40; // Tribal synergy bonus
      });
    }

    return score;
  }
}
