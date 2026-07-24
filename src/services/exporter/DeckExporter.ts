import { Deck } from '../../types/deck';

export class DeckExporter {
  /**
   * Export as Moxfield / Archidekt standard decklist string for clipboard
   */
  static toClipboardFormat(deck: Deck): string {
    let output = `// COMMANDER\n1 ${deck.commander.card.name}\n\n// DECKLIST\n`;
    deck.cards.forEach(dc => {
      output += `${dc.quantity} ${dc.card.name}\n`;
    });
    return output;
  }

  /**
   * Export grouped by Card Type (Creature, Instant, Sorcery, etc.)
   */
  static toTypeGroupedFormat(deck: Deck): string {
    let output = `// COMMANDER\n1 ${deck.commander.card.name}\n\n`;

    const groups: Record<string, string[]> = {};

    deck.cards.forEach(dc => {
      const cat = dc.categoryByCardType;
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(`${dc.quantity} ${dc.card.name}`);
    });

    Object.keys(groups).forEach(type => {
      output += `// ${type.toUpperCase()} (${groups[type].length})\n`;
      groups[type].forEach(line => {
        output += `${line}\n`;
      });
      output += '\n';
    });

    return output;
  }

  /**
   * Export as structured JSON format
   */
  static toJsonFormat(deck: Deck): string {
    const exportData = {
      commander: deck.commander.card.name,
      powerLevel: deck.estimatedPowerLevel,
      stats: deck.stats,
      strategyOverview: deck.strategyAnalysis.overview,
      cards: deck.cards.map(dc => ({
        name: dc.card.name,
        quantity: dc.quantity,
        cmc: dc.card.cmc,
        type: dc.card.typeLine,
        category: dc.categoryByFunction,
        reasoning: dc.reasoning
      }))
    };
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Export as CSV format
   */
  static toCsvFormat(deck: Deck): string {
    let csv = 'Quantity,Card Name,Mana Cost,CMC,Type,Category,Reasoning\n';
    csv += `1,"${deck.commander.card.name}","${deck.commander.card.manaCost}",${deck.commander.card.cmc},"${deck.commander.card.typeLine}","Commander","Commander of the deck"\n`;
    
    deck.cards.forEach(dc => {
      const cleanReasoning = dc.reasoning.replace(/"/g, '""');
      csv += `${dc.quantity},"${dc.card.name}","${dc.card.manaCost}",${dc.card.cmc},"${dc.card.typeLine}","${dc.categoryByFunction}","${cleanReasoning}"\n`;
    });

    return csv;
  }
}
