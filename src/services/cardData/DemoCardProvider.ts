import { CardDataProvider } from './CardDataProvider';
import { Card, Commander } from '../../types/card';
import { DEMO_CARDS } from '../../data/demoCards';

export class DemoCardProvider implements CardDataProvider {
  private cards: Card[];

  constructor() {
    this.cards = DEMO_CARDS;
  }

  async searchCards(query: string): Promise<Card[]> {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    return this.cards.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.typeLine.toLowerCase().includes(q) ||
      c.oracleText.toLowerCase().includes(q)
    );
  }

  async getCardByName(name: string): Promise<Card | null> {
    const q = name.toLowerCase().trim();
    const found = this.cards.find(c => c.name.toLowerCase() === q);
    if (found) return found;

    // Partial fallback
    return this.cards.find(c => c.name.toLowerCase().includes(q)) || null;
  }

  async getCardById(id: string): Promise<Card | null> {
    return this.cards.find(c => c.id === id) || null;
  }

  async searchCommanders(query: string): Promise<Commander[]> {
    const q = query.toLowerCase().trim();
    const commanders = this.cards.filter(c => 
      c.typeLine.toLowerCase().includes('legendary') && 
      (c.typeLine.toLowerCase().includes('creature') || c.oracleText.toLowerCase().includes('can be your commander')) &&
      (!q || c.name.toLowerCase().includes(q))
    );

    return commanders.map(c => ({
      card: c,
      colorIdentity: c.colorIdentity,
      suggestedStrategies: this.inferSuggestedStrategies(c),
      estimatedPowerLevel: 4,
      compatibleArchetypes: ['Aggro', 'Synergy', 'Combo']
    }));
  }

  async getCardsByColorIdentity(colorIdentity: string[], limit = 100): Promise<Card[]> {
    const isSubset = (cardColors: string[]) => {
      return cardColors.every(col => colorIdentity.includes(col));
    };

    const eligible = this.cards.filter(c => isSubset(c.colorIdentity));
    return eligible.slice(0, limit);
  }

  private inferSuggestedStrategies(card: Card): string[] {
    if (card.name.includes('Krenko')) return ['Goblin Swarm', 'Sacrifice & Burn', 'Fast Aggro', 'Infinite Token Combos'];
    if (card.name.includes('Atraxa')) return ['Superfriends', '+1/+1 Counters', 'Infect / Poison', 'Proliferate Value'];
    if (card.name.includes('Lathril')) return ['Elfball', 'Token Swarm', 'Drain & Gain', 'Aggro'];
    if (card.name.includes('Kinnan')) return ['Mana Dorks & Rocks', 'Big Creature Cheat', 'Infinite Mana Combo'];
    return ['Tribal Sinergy', 'Value Engine', 'Combos & Synergies'];
  }
}
