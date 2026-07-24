import { DeckCard, Deck } from '../../types/deck';
import { Commander, Color } from '../../types/card';
import { ValidationResult } from '../../types/generator';
import { COMMANDER_BANLIST, MULTI_COPY_ALLOWED } from '../../data/commanderRules';

export class CommanderValidator {
  /**
   * Performs full deterministic validation of a Commander deck
   */
  static validateDeck(commander: Commander, cards: DeckCard[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    const commanderCI = new Set<Color>(commander.colorIdentity);

    // 1. Total Card Count Check (Must be exactly 100 including Commander)
    const totalDeckCards = cards.reduce((sum, item) => sum + item.quantity, 0);
    const grandTotal = totalDeckCards + 1; // Commander is +1

    if (grandTotal !== 100) {
      errors.push(`Il mazzo deve contenere esattamente 100 carte (incluso il Comandante). Attualmente sono ${grandTotal} carte.`);
    }

    // 2. Commander Legality Check
    const cmdType = commander.card.typeLine.toLowerCase();
    const cmdText = commander.card.oracleText.toLowerCase();
    const isLegendaryCreature = cmdType.includes('legendary') && cmdType.includes('creature');
    const isPlaneswalkerCommander = cmdText.includes('can be your commander');

    if (!isLegendaryCreature && !isPlaneswalkerCommander) {
      errors.push(`Il comandante "${commander.card.name}" non è una Creatura Leggendaria valida o non ha il testo "can be your commander".`);
    }

    if (COMMANDER_BANLIST.has(commander.card.normalizedName)) {
      errors.push(`Il comandante "${commander.card.name}" è presente nella Banlist ufficiale Commander!`);
    }

    // Track card quantities and color identity
    const seenNames = new Map<string, number>();

    let landCount = 0;
    let rampCount = 0;
    let drawCount = 0;
    let totalCmc = 0;
    let nonLandCount = 0;

    cards.forEach(dc => {
      const card = dc.card;
      const normName = card.normalizedName;

      // Duplicate check
      const currentQty = seenNames.get(normName) || 0;
      const newQty = currentQty + dc.quantity;
      seenNames.set(normName, newQty);

      if (!card.isLand) {
        nonLandCount += dc.quantity;
        totalCmc += (card.cmc * dc.quantity);
      } else {
        landCount += dc.quantity;
      }

      if (dc.categoryByFunction === 'Ramp') rampCount += dc.quantity;
      if (dc.categoryByFunction === 'Draw') drawCount += dc.quantity;

      // Duplicate singleton rule check
      const isBasicLand = card.supertypes?.includes('Basic') || card.typeLine.toLowerCase().includes('basic land');
      const isAllowedMulti = MULTI_COPY_ALLOWED.has(normName);

      if (newQty > 1 && !isBasicLand && !isAllowedMulti) {
        errors.push(`Regola Singleton violata: "${card.name}" è presente ${newQty} volte nel mazzo.`);
      }

      // Color Identity check
      const invalidColors = card.colorIdentity.filter(col => !commanderCI.has(col));
      if (invalidColors.length > 0) {
        errors.push(`Violazione dell'identità di colore: "${card.name}" contiene simboli (${invalidColors.join(', ')}) fuori dai colori del comandante (${Array.from(commanderCI).join(', ') || 'Colorless'}).`);
      }

      // Banned List check
      if (COMMANDER_BANLIST.has(normName)) {
        warnings.push(`La carta "${card.name}" è nella Banlist Commander o soggetta a restrizioni competitive.`);
      }
    });

    // 3. Heuristic Warnings & Recommendations
    if (landCount < 30) {
      warnings.push(`Numero di terre molto basso (${landCount}). Un mazzo Commander bilanciato ne richiede generalmente 34-38.`);
      suggestions.push('Aumenta le terre a 35-37 per evitare blocchi di mana nei primi turni.');
    } else if (landCount > 42) {
      warnings.push(`Numero di terre molto elevato (${landCount}). Potresti rischiare di pescare troppe terre senza sviluppare gioco.`);
    }

    if (rampCount < 5) {
      warnings.push(`Acceleratori di mana (Ramp) scarsi (${rampCount}). Considera di aggiungere carte come Sol Ring, Arcane Signet o dorks.`);
    }

    if (drawCount < 5) {
      warnings.push(`Fonti di pescaggio scarse (${drawCount}). Aumenta il pescaggio per evitare di esaurire le risorse in mano.`);
    }

    const avgCmc = nonLandCount > 0 ? Number((totalCmc / nonLandCount).toFixed(2)) : 0;
    if (avgCmc > 3.8 && landCount < 36) {
      warnings.push(`Costo medio di mana elevato (CMC ${avgCmc}) a fronte di sole ${landCount} terre.`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }
}
