import { PowerLevelProfile } from '../../types/generator';
import { Commander } from '../../types/card';

export class PowerLevelEngine {
  private static PROFILES: Record<number, PowerLevelProfile> = {
    1: {
      level: 1,
      name: 'Casual Introduttivo',
      description: 'Mazzo semplice, fortemente tematico, curva alta, zero tutor veloci o combo efficienti. Partite lunghe e rilassanti.',
      targetAvgCmc: 4.0,
      recommendedTutors: 0,
      recommendedFastRamp: 6,
      recommendedInteractionCount: 6,
      allowCompactCombos: false,
      categoryBudget: {
        lands: 39,
        ramp: 8,
        draw: 8,
        tutors: 0,
        removal: 6,
        protection: 2,
        counterspells: 2,
        boardWipes: 3,
        synergyPayoffs: 25,
        winconsAndCombos: 6
      }
    },
    2: {
      level: 2,
      name: 'Casual Sinergico',
      description: 'Strategia coerente e divertente, buone sinergie, interazioni moderate. Pochi tutor o difficili da attivare.',
      targetAvgCmc: 3.5,
      recommendedTutors: 1,
      recommendedFastRamp: 8,
      recommendedInteractionCount: 8,
      allowCompactCombos: false,
      categoryBudget: {
        lands: 37,
        ramp: 10,
        draw: 10,
        tutors: 1,
        removal: 8,
        protection: 4,
        counterspells: 3,
        boardWipes: 3,
        synergyPayoffs: 18,
        winconsAndCombos: 5
      }
    },
    3: {
      level: 3,
      name: 'Ottimizzato',
      description: 'Piano di gioco solido, elevata consistenza, adeguato ramp e pescaggio, rimozioni veloci e wincon affidabili.',
      targetAvgCmc: 3.0,
      recommendedTutors: 2,
      recommendedFastRamp: 11,
      recommendedInteractionCount: 11,
      allowCompactCombos: true,
      categoryBudget: {
        lands: 36,
        ramp: 11,
        draw: 11,
        tutors: 2,
        removal: 9,
        protection: 5,
        counterspells: 4,
        boardWipes: 2,
        synergyPayoffs: 14,
        winconsAndCombos: 5
      }
    },
    4: {
      level: 4,
      name: 'Alta Potenza',
      description: 'Carte ad altissima efficienza, curva bassa, tutor veloci, accelerazioni esplosive, protezioni a basso mana e combo solide.',
      targetAvgCmc: 2.4,
      recommendedTutors: 4,
      recommendedFastRamp: 13,
      recommendedInteractionCount: 14,
      allowCompactCombos: true,
      categoryBudget: {
        lands: 34,
        ramp: 13,
        draw: 12,
        tutors: 4,
        removal: 11,
        protection: 6,
        counterspells: 6,
        boardWipes: 1,
        synergyPayoffs: 8,
        winconsAndCombos: 4
      }
    },
    5: {
      level: 5,
      name: 'Massima Competitività (cEDH)',
      description: 'Massima consistenza, risposte instant a costo 0-1 mana, accelerazione immediata, tutor ottimali e chiusure ultra-rapide.',
      targetAvgCmc: 1.9,
      recommendedTutors: 6,
      recommendedFastRamp: 15,
      recommendedInteractionCount: 16,
      allowCompactCombos: true,
      categoryBudget: {
        lands: 32,
        ramp: 15,
        draw: 13,
        tutors: 6,
        removal: 12,
        protection: 7,
        counterspells: 7,
        boardWipes: 0,
        synergyPayoffs: 4,
        winconsAndCombos: 3
      },
      cedhWarningNeeded: true
    }
  };

  /**
   * Get target profile parameters for level 1-5
   */
  static getProfile(level: number): PowerLevelProfile {
    const validLevel = Math.max(1, Math.min(5, Math.round(level)));
    return this.PROFILES[validLevel];
  }

  /**
   * Check if a commander requires a cEDH warning when built at level 5
   */
  static checkCedhWarning(commander: Commander, level: number): string | null {
    if (level !== 5) return null;

    // List of known S-tier cEDH commanders
    const topCedhCommanders = [
      'kinnan, bonder prodigy',
      'najeela, the blade-blossom',
      'thrasios, triton hero',
      'tymna the weaver',
      'yidris, maelstrom wielder',
      'rograkh, son of rohgahh',
      'silas renn, seeker adept',
      'korvold, fae-cursed king',
      'tivit, seller of secrets',
      'winota, joiner of forces',
      'kenrith, the returned king',
      'urza, lord high artificer'
    ];

    const isTopCedh = topCedhCommanders.includes(commander.card.normalizedName);

    if (!isTopCedh) {
      return `Nota di Competitività: "${commander.card.name}" viene costruito ad alta potenza (Livello 5), ma potrebbe non competere ai vertici dei tavoli cEDH più estremi rispetto a comandanti meta S-tier.`;
    }

    return null;
  }
}
