import { Deck, DeckCard } from '../../types/deck';
import { SynergyNode, SynergyLink, ComboChain, DeckSynergyReport, SynergyStrength } from '../../types/synergy';

export class SynergyAnalyzer {
  /**
   * Analyzes a deck and builds a detailed synergy network report
   */
  static analyzeDeck(deck: Deck): DeckSynergyReport {
    const nodes: SynergyNode[] = [];
    const links: SynergyLink[] = [];

    // 1. Add Commander Node
    const cmdCard = deck.commander.card;
    nodes.push({
      id: cmdCard.id,
      name: cmdCard.name,
      normalizedName: cmdCard.normalizedName,
      imageUrl: cmdCard.imageUrl,
      cmc: cmdCard.cmc,
      typeCategory: 'Commander',
      functionalCategory: 'Commander'
    });

    // 2. Add Non-land Nodes
    const nonLandCards = deck.cards.filter(dc => !dc.card.isLand);

    nonLandCards.forEach(dc => {
      nodes.push({
        id: dc.card.id,
        name: dc.card.name,
        normalizedName: dc.card.normalizedName,
        imageUrl: dc.card.imageUrl,
        cmc: dc.card.cmc,
        typeCategory: dc.categoryByCardType,
        functionalCategory: dc.categoryByFunction
      });
    });

    // 3. Detect Synergies & Generate Links
    const cmdSubtypes = cmdCard.subtypes || [];

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const nodeA = nodes[i];
        const nodeB = nodes[j];

        const cardA = deck.cards.find(c => c.card.id === nodeA.id)?.card || (nodeA.id === cmdCard.id ? cmdCard : null);
        const cardB = deck.cards.find(c => c.card.id === nodeB.id)?.card || (nodeB.id === cmdCard.id ? cmdCard : null);

        if (!cardA || !cardB) continue;

        const syn = this.calculateCardSynergy(cardA, cardB, cmdSubtypes);
        if (syn) {
          links.push({
            sourceId: nodeA.id,
            targetId: nodeB.id,
            description: syn.description,
            strength: syn.strength,
            type: syn.type
          });
        }
      }
    }

    // 4. Extract Combo Chains
    const comboChains = this.extractComboChains(deck);

    // 5. Build Synergy Clusters
    const synergyClusters = [
      {
        name: 'Generatore & Sfruttamento Pedine',
        description: 'Carte che generano pedine in massa unite a motori di beneficio o sacrifici.',
        cardNames: nodes.filter(n => ['TokenGenerator', 'SacrificeOutlet', 'Commander'].includes(n.functionalCategory)).map(n => n.name)
      },
      {
        name: 'Danni Diretti & Wincon ETB',
        description: 'Effetti che infliggono danni diretti agli avversari all\'ingresso di creature o per ogni morte.',
        cardNames: nodes.filter(n => ['Payoff', 'WinCondition'].includes(n.functionalCategory)).map(n => n.name)
      },
      {
        name: 'Accelerazione & Motore di Mana',
        description: 'Artefatti e creatura che riducono i costi o raddoppiano la produzione di mana.',
        cardNames: nodes.filter(n => n.functionalCategory === 'Ramp').map(n => n.name)
      }
    ];

    return {
      nodes,
      links,
      comboChains,
      synergyClusters
    };
  }

  private static calculateCardSynergy(cardA: any, cardB: any, cmdSubtypes: string[]): { description: string; strength: SynergyStrength; type: any } | null {
    const textA = (cardA.oracleText || '').toLowerCase();
    const textB = (cardB.oracleText || '').toLowerCase();
    const nameA = cardA.normalizedName;
    const nameB = cardB.normalizedName;

    // Check specific known combo pairs
    if (
      (nameA.includes('krenko') && nameB.includes('skirk prospector')) ||
      (nameB.includes('krenko') && nameA.includes('skirk prospector'))
    ) {
      return {
        description: 'Krenko produce pedine Goblin che Skirk Prospector sacrifica subito per mana rosso infinito/esplosivo.',
        strength: 'combo',
        type: 'sac_burn'
      };
    }

    if (
      (nameA.includes('purphoros') || nameA.includes('impact tremors')) && (textB.includes('create') || textB.includes('token'))
    ) {
      return {
        description: `${cardA.name} infligge danni diretti a tutti gli avversari ogni volta che ${cardB.name} crea una pedina.`,
        strength: 'high',
        type: 'sac_burn'
      };
    }

    if (
      (nameB.includes('purphoros') || nameB.includes('impact tremors')) && (textA.includes('create') || textA.includes('token'))
    ) {
      return {
        description: `${cardB.name} infligge danni diretti a tutti gli avversari ogni volta che ${cardA.name} crea una pedina.`,
        strength: 'high',
        type: 'sac_burn'
      };
    }

    if (
      (nameA.includes('skullclamp') && (textB.includes('token') || cardB.subtypes?.includes('Goblin'))) ||
      (nameB.includes('skullclamp') && (textA.includes('token') || cardA.subtypes?.includes('Goblin')))
    ) {
      return {
        description: 'Skullclamp si equipaggia sulle pedine 1/1 per pescare 2 carte al costo di 1 mana.',
        strength: 'high',
        type: 'draw_engine'
      };
    }

    // Shared Subtype Tribal Synergy
    const commonSubtype = (cardA.subtypes || []).find((st: string) => (cardB.subtypes || []).includes(st));
    if (commonSubtype && cmdSubtypes.includes(commonSubtype)) {
      return {
        description: `Sinergia Tribale ${commonSubtype}: beneficio reciproco tra carte della stessa tribù.`,
        strength: 'medium',
        type: 'tribal'
      };
    }

    // Token + Sacrifice
    if ((textA.includes('token') || textA.includes('create')) && textB.includes('sacrifice')) {
      return {
        description: `${cardA.name} fornisce materiale da sacrificio per alimentare l'abilità di ${cardB.name}.`,
        strength: 'medium',
        type: 'token_engine'
      };
    }

    return null;
  }

  private static extractComboChains(deck: Deck): ComboChain[] {
    const chains: ComboChain[] = [];
    const cardNames = deck.cards.map(dc => dc.card.normalizedName);
    const cmdName = deck.commander.card.normalizedName;

    // Check Krenko + Skirk Prospector combo
    if (cmdName.includes('krenko') && cardNames.includes('skirk prospector')) {
      chains.push({
        id: 'combo-krenko-skirk',
        title: 'Motore di Mana & Pedine Esplosivo: Krenko + Skirk Prospector',
        cardsInvolved: ['Krenko, Mob Boss', 'Skirk Prospector', 'Goblin Warchief / Haste enabler'],
        type: 'infinite',
        steps: [
          { stepNumber: 1, cardName: 'Krenko, Mob Boss', action: 'Tappa Krenko per raddoppiare le pedine Goblin sul terreno.' },
          { stepNumber: 2, cardName: 'Skirk Prospector', action: 'Sacrifica N pedine Goblin per generare N mana rosso {R}.' },
          { stepNumber: 3, cardName: 'Staff of Domination / Umbral Mantle (o Haste Lord)', action: 'Usa il mana generato per stappare Krenko e ripetere il ciclo.' }
        ],
        result: 'Generazione infinita di pedine Goblin, mana rosso infinito e danni letali su tutti gli avversari.'
      });
    }

    // Check Purphoros / Impact Tremors Swarm wincon
    if (cardNames.includes('purphoros, god of the forge') || cardNames.includes('impact tremors')) {
      chains.push({
        id: 'wincon-etb-burn',
        title: 'Catena di Danni Diretti (ETB Burn Loop)',
        cardsInvolved: ['Krenko, Mob Boss / Token Generator', 'Purphoros, God of the Forge / Impact Tremors'],
        type: 'wincon_engine',
        steps: [
          { stepNumber: 1, cardName: 'Purphoros / Impact Tremors', action: 'Posiziona l\'incantesimo sul terreno nei primi turni.' },
          { stepNumber: 2, cardName: 'Krenko, Mob Boss', action: 'Attiva l\'abilità per far entrare N Goblin contemporaneamente.' },
          { stepNumber: 3, cardName: 'Payoff Damage', action: 'Ogni Goblin in entrata innesca 1-2 danni diretti a CIASCUN avversario.' }
        ],
        result: 'Azzeramento dei punti vita dell\'intero tavolo da gioco senza dover attaccare.'
      });
    }

    return chains;
  }
}
