import { describe, it, expect } from 'vitest';
import { PowerLevelEngine } from '../src/services/powerLevel/PowerLevelEngine';
import { DEMO_CARDS } from '../src/data/demoCards';
import { Commander } from '../src/types/card';

describe('PowerLevelEngine', () => {
  it('should return correct profiles for levels 1 through 5', () => {
    const p1 = PowerLevelEngine.getProfile(1);
    const p5 = PowerLevelEngine.getProfile(5);

    expect(p1.targetAvgCmc).toBeGreaterThan(p5.targetAvgCmc);
    expect(p5.recommendedFastRamp).toBeGreaterThan(p1.recommendedFastRamp);
    expect(p5.recommendedTutors).toBeGreaterThan(p1.recommendedTutors);
  });

  it('should generate a cEDH warning for non-S-tier commanders at level 5', () => {
    const krenko = DEMO_CARDS.find(c => c.id === 'krenko-mob-boss')!;
    const commander: Commander = {
      card: krenko,
      colorIdentity: ['R'],
      suggestedStrategies: [],
      estimatedPowerLevel: 4,
      compatibleArchetypes: []
    };

    const warning = PowerLevelEngine.checkCedhWarning(commander, 5);
    expect(warning).not.toBeNull();
    expect(warning).toContain('Nota di Competitività');
  });
});
