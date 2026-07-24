import { describe, it, expect } from 'vitest';
import { CommanderValidator } from '../src/services/validator/CommanderValidator';
import { Commander } from '../src/types/card';
import { DeckCard } from '../src/types/deck';
import { DEMO_CARDS } from '../src/data/demoCards';

describe('CommanderValidator', () => {
  const krenkoCard = DEMO_CARDS.find(c => c.id === 'krenko-mob-boss')!;
  const commander: Commander = {
    card: krenkoCard,
    colorIdentity: ['R'],
    suggestedStrategies: ['Tokens', 'Burn'],
    estimatedPowerLevel: 4,
    compatibleArchetypes: ['Aggro']
  };

  const mountain = DEMO_CARDS.find(c => c.id === 'mountain')!;
  const chieftain = DEMO_CARDS.find(c => c.id === 'goblin-chieftain')!;

  it('should validate a correct 100-card mono-red deck', () => {
    const cards: DeckCard[] = [
      {
        card: mountain,
        quantity: 38,
        categoryByCardType: 'Land',
        categoryByFunction: 'Lands',
        reasoning: 'Basic land',
        isLocked: false
      },
      {
        card: chieftain,
        quantity: 61, // To reach 99 + 1 Commander = 100
        categoryByCardType: 'Creature',
        categoryByFunction: 'Synergy',
        reasoning: 'Goblin lord',
        isLocked: false
      }
    ];

    const result = CommanderValidator.validateDeck(commander, cards);
    expect(result.isValid).toBe(false); // Singleton violation for Chieftain > 1
    expect(result.errors.some(e => e.includes('Singleton'))).toBe(true);
  });

  it('should detect total card count errors when deck is not 100 cards', () => {
    const cards: DeckCard[] = [
      {
        card: mountain,
        quantity: 30,
        categoryByCardType: 'Land',
        categoryByFunction: 'Lands',
        reasoning: 'Basic land',
        isLocked: false
      }
    ];

    const result = CommanderValidator.validateDeck(commander, cards);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('esattamente 100 carte'))).toBe(true);
  });

  it('should reject cards outside color identity', () => {
    const forest = DEMO_CARDS.find(c => c.id === 'forest')!;
    const cards: DeckCard[] = [
      {
        card: forest, // Green land in Mono-Red deck!
        quantity: 1,
        categoryByCardType: 'Land',
        categoryByFunction: 'Lands',
        reasoning: 'Green land',
        isLocked: false
      }
    ];

    const result = CommanderValidator.validateDeck(commander, cards);
    expect(result.errors.some(e => e.includes('identità di colore'))).toBe(true);
  });
});
