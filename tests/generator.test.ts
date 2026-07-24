import { describe, it, expect } from 'vitest';
import { LazyDeckGenerator } from '../src/services/generator/LazyDeckGenerator';
import { DemoCardProvider } from '../src/services/cardData/DemoCardProvider';
import { DEMO_CARDS } from '../src/data/demoCards';
import { Commander } from '../src/types/card';

describe('LazyDeckGenerator', () => {
  const demoProvider = new DemoCardProvider();
  const generator = new LazyDeckGenerator(demoProvider);

  it('should generate a 100-card deck for Krenko, Mob Boss at power level 5', async () => {
    const krenko = DEMO_CARDS.find(c => c.id === 'krenko-mob-boss')!;
    const commander: Commander = {
      card: krenko,
      colorIdentity: ['R'],
      suggestedStrategies: ['Goblin', 'Burn'],
      estimatedPowerLevel: 5,
      compatibleArchetypes: ['Aggro']
    };

    const deck = await generator.generateDeck({
      commander,
      powerLevel: 5,
      description: 'Voglio creare il maggior numero possibile di pedine Goblin e sfruttarle tramite sacrifici, danni diretti, produzione di mana e altre sinergie. Il mazzo deve essere veloce, esplosivo e molto ottimizzato.',
      allowInfiniteCombos: true,
      mandatoryCards: [],
      excludedCards: []
    });

    expect(deck.stats.totalCards).toBe(100);
    expect(deck.cards.length).toBeGreaterThan(0);
    expect(deck.estimatedPowerLevel).toBe(5);
    expect(deck.strategyAnalysis.overview).toContain('Krenko, Mob Boss');
  });
});
