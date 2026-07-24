import { Card, Commander, FunctionalCategory, TypeCategory, Color } from '../../types/card';
import { Deck, DeckCard, DeckStats, StrategyAnalysis } from '../../types/deck';
import { DeckRequest, ValidationResult } from '../../types/generator';
import { CardDataProvider } from '../cardData/CardDataProvider';
import { PowerLevelEngine } from '../powerLevel/PowerLevelEngine';
import { CommanderValidator } from '../validator/CommanderValidator';
import { StrategyHeuristics } from './strategyHeuristics';

export class LazyDeckGenerator {
  constructor(private cardProvider: CardDataProvider) {}

  /**
   * Main entry point to generate a complete 100-card Commander deck
   */
  async generateDeck(request: DeckRequest): Promise<Deck> {
    const profile = PowerLevelEngine.getProfile(request.powerLevel);
    const parsedStrategy = StrategyHeuristics.parsePrompt(request.description, request.commander.card.name);

    // 1. Fetch Candidate Cards from Provider
    const candidates = await this.cardProvider.getCardsByColorIdentity(
      request.commander.colorIdentity,
      250
    );

    // Filter candidates strictly matching Color Identity
    const cmdColors = new Set(request.commander.colorIdentity);
    const validCandidates = candidates.filter(c => 
      c.id !== request.commander.card.id &&
      c.colorIdentity.every(col => cmdColors.has(col)) &&
      c.legalities.commander === 'legal'
    );

    // 2. Score Candidates
    const scoredCards = validCandidates.map(card => ({
      card,
      score: StrategyHeuristics.scoreCard(card, request, parsedStrategy)
    })).sort((a, b) => b.score - a.score);

    // 3. Build Quantitative Slots based on Power Level & Preferences
    const landCount = request.desiredLandCount || profile.categoryBudget.lands;
    const targetNonLandCount = 99 - landCount;

    const deckCardsMap = new Map<string, DeckCard>();

    // Mandatory Cards Injection
    for (const mandatoryName of request.mandatoryCards) {
      if (!mandatoryName.trim()) continue;
      const found = await this.cardProvider.getCardByName(mandatoryName);
      if (found && found.legalities.commander === 'legal' && found.colorIdentity.every(col => cmdColors.has(col))) {
        deckCardsMap.set(found.normalizedName, {
          card: found,
          quantity: 1,
          categoryByCardType: this.determineTypeCategory(found),
          categoryByFunction: found.strategicTags?.[0] || 'Synergy',
          reasoning: 'Carta obbligatoria richiesta dall\'utente.',
          isLocked: true
        });
      }
    }

    // Fill Non-Land Cards from Scored Candidates
    for (const { card } of scoredCards) {
      if (deckCardsMap.size >= targetNonLandCount) break;
      if (card.isLand) continue;
      if (deckCardsMap.has(card.normalizedName)) continue;

      const categoryByFunction = this.assignFunctionCategory(card, parsedStrategy, profile.level);
      const reasoning = this.buildReasoning(card, request.commander, categoryByFunction, parsedStrategy);

      deckCardsMap.set(card.normalizedName, {
        card,
        quantity: 1,
        categoryByCardType: this.determineTypeCategory(card),
        categoryByFunction,
        reasoning,
        isLocked: false
      });
    }

    // If candidate pool from API/Demo was smaller than targetNonLand, fill with basic lands or fallback
    let currentNonLands = Array.from(deckCardsMap.values());

    // 4. Generate Mana Base (Lands)
    const lands = await this.generateManaBase(request.commander, landCount, currentNonLands);
    
    let allDeckCards = [...currentNonLands, ...lands];

    // Ensure EXACT 99 deck cards + 1 Commander = 100 cards
    allDeckCards = this.adjustToExactCount(allDeckCards, landCount, request.commander);

    // 5. Validate Deck
    const validation = CommanderValidator.validateDeck(request.commander, allDeckCards);

    // 6. Calculate Metrics & Stats
    const stats = this.calculateStats(allDeckCards);

    // 7. Generate Strategy Analysis
    const strategyAnalysis = this.generateStrategyAnalysis(request, parsedStrategy, validation, stats);

    const cedhWarning = PowerLevelEngine.checkCedhWarning(request.commander, request.powerLevel);
    if (cedhWarning) {
      strategyAnalysis.warnings.unshift(cedhWarning);
    }

    return {
      id: `deck-${Date.now()}`,
      name: `Mazzo ${request.commander.card.name} (${profile.name})`,
      commander: request.commander,
      cards: allDeckCards,
      stats,
      estimatedPowerLevel: request.powerLevel,
      strategyAnalysis,
      isValid: validation.isValid,
      validationErrors: validation.errors,
      createdAt: new Date().toISOString()
    };
  }

  private assignFunctionCategory(card: Card, parsed: any, powerLevel: number): FunctionalCategory {
    if (card.strategicTags && card.strategicTags.length > 0) {
      return card.strategicTags[0];
    }
    const text = card.oracleText.toLowerCase();
    if (text.includes('add ') || text.includes('search your library for a land')) return 'Ramp';
    if (text.includes('draw ')) return 'Draw';
    if (text.includes('destroy target') || text.includes('exile target')) return 'Removal';
    if (text.includes('token') || text.includes('create')) return 'TokenGenerator';
    if (text.includes('sacrifice')) return 'SacrificeOutlet';
    return 'Synergy';
  }

  private determineTypeCategory(card: Card): TypeCategory {
    const t = card.typeLine.toLowerCase();
    if (t.includes('creature')) return 'Creature';
    if (t.includes('instant')) return 'Instant';
    if (t.includes('sorcery')) return 'Sorcery';
    if (t.includes('artifact')) return 'Artifact';
    if (t.includes('enchantment')) return 'Enchantment';
    if (t.includes('planeswalker')) return 'Planeswalker';
    if (t.includes('battle')) return 'Battle';
    return 'Land';
  }

  private buildReasoning(card: Card, commander: Commander, category: FunctionalCategory, parsed: any): string {
    if (card.subtypes.some(s => commander.card.subtypes.includes(s))) {
      return `Massima sinergia tribale ${card.subtypes.find(s => commander.card.subtypes.includes(s))} con ${commander.card.name}.`;
    }
    if (category === 'Ramp') return `Accelera la mana curve per calare ${commander.card.name} prima del tempo.`;
    if (category === 'Draw') return `Mantiene la mano piena di risorse durante l'incursione.`;
    if (category === 'Removal') return `Risposta efficiente per neutralizzare le minacce avversarie.`;
    if (category === 'SacrificeOutlet') return `Sfrutta il motore di sacrificio per generare valore e danni diretti.`;
    if (category === 'TokenGenerator') return `Crea presenza sul campo di battaglia e aumenta la densità di pedine.`;
    if (category === 'Payoff') return `Moltiplica i danni ed esegue il piano di chiusura della partita.`;
    return `Fornisce consistenza e valore complessivo al piano di gioco.`;
  }

  private async generateManaBase(commander: Commander, requiredLandCount: number, nonLands: DeckCard[]): Promise<DeckCard[]> {
    const colors = commander.colorIdentity;
    const lands: DeckCard[] = [];

    // Always include Command Tower for non-monocolor or monocolor utility
    const commandTower = await this.cardProvider.getCardByName('Command Tower');
    if (commandTower) {
      lands.push({
        card: commandTower,
        quantity: 1,
        categoryByCardType: 'Land',
        categoryByFunction: 'Lands',
        reasoning: 'Terra multicolore fondamentale in Commander.',
        isLocked: false
      });
    }

    let remainingLandSlots = requiredLandCount - lands.length;

    // Distribute basic lands proportionally according to color identity
    if (colors.length === 0) {
      // Colorless (Wastes) - using Mountain/Plains default for fixture fallback
      const basic = await this.cardProvider.getCardByName('Wastes') || await this.cardProvider.getCardByName('Mountain');
      if (basic) {
        lands.push({
          card: basic,
          quantity: remainingLandSlots,
          categoryByCardType: 'Land',
          categoryByFunction: 'Lands',
          reasoning: 'Terra base per mazzo incolore.',
          isLocked: false
        });
      }
    } else {
      const basicLandNames: Record<Color, string> = {
        'R': 'Mountain',
        'G': 'Forest',
        'U': 'Island',
        'B': 'Swamp',
        'W': 'Plains'
      };

      const perColorSlots = Math.floor(remainingLandSlots / colors.length);
      let leftover = remainingLandSlots % colors.length;

      for (let i = 0; i < colors.length; i++) {
        const col = colors[i];
        const basicName = basicLandNames[col];
        const basicCard = await this.cardProvider.getCardByName(basicName);
        if (basicCard) {
          const qty = perColorSlots + (i === 0 ? leftover : 0);
          lands.push({
            card: basicCard,
            quantity: qty,
            categoryByCardType: 'Land',
            categoryByFunction: 'Lands',
            reasoning: `Terra base fondamentale per produrre mana {${col}}.`,
            isLocked: false
          });
        }
      }
    }

    return lands;
  }

  private adjustToExactCount(deckCards: DeckCard[], targetLands: number, commander: Commander): DeckCard[] {
    const currentTotal = deckCards.reduce((sum, item) => sum + item.quantity, 0);
    const diff = 99 - currentTotal;

    if (diff === 0) return deckCards;

    if (diff > 0) {
      // Add more basic lands to reach 99
      const mainColor = commander.colorIdentity[0] || 'R';
      const basicName = mainColor === 'R' ? 'Mountain' : mainColor === 'G' ? 'Forest' : mainColor === 'U' ? 'Island' : mainColor === 'B' ? 'Swamp' : 'Plains';
      
      const existingLandIndex = deckCards.findIndex(dc => dc.card.normalizedName === basicName.toLowerCase());
      if (existingLandIndex >= 0) {
        deckCards[existingLandIndex].quantity += diff;
      }
    } else if (diff < 0) {
      // Trim non-locked cards or basic lands to reach 99
      let removeCount = Math.abs(diff);
      for (let i = deckCards.length - 1; i >= 0; i--) {
        if (removeCount === 0) break;
        const item = deckCards[i];
        if (!item.isLocked && item.quantity > 1) {
          const toReduce = Math.min(item.quantity - 1, removeCount);
          item.quantity -= toReduce;
          removeCount -= toReduce;
        } else if (!item.isLocked && item.quantity === 1) {
          deckCards.splice(i, 1);
          removeCount -= 1;
        }
      }
    }

    return deckCards;
  }

  private calculateStats(cards: DeckCard[]): DeckStats {
    let totalCards = 1; // Commander
    let totalCmc = 0;
    let nonLandCount = 0;
    let landCount = 0;
    let rampCount = 0;
    let drawCount = 0;
    let interactionCount = 0;
    let totalPriceUsd = 0;

    const manaCurve: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    const colorDistribution: Record<string, number> = { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 };
    const coloredSourcesCount: Record<string, number> = { W: 0, U: 0, B: 0, R: 0, G: 0 };

    cards.forEach(dc => {
      totalCards += dc.quantity;
      if (dc.card.priceUsd) totalPriceUsd += dc.card.priceUsd * dc.quantity;

      if (dc.card.isLand) {
        landCount += dc.quantity;
        if (dc.card.producesMana) {
          dc.card.producesMana.forEach(col => {
            coloredSourcesCount[col] = (coloredSourcesCount[col] || 0) + dc.quantity;
          });
        }
      } else {
        nonLandCount += dc.quantity;
        totalCmc += (dc.card.cmc * dc.quantity);
        const cmcBin = Math.min(6, Math.floor(dc.card.cmc));
        manaCurve[cmcBin] = (manaCurve[cmcBin] || 0) + dc.quantity;

        dc.card.colors.forEach(col => {
          colorDistribution[col] = (colorDistribution[col] || 0) + dc.quantity;
        });
      }

      if (dc.categoryByFunction === 'Ramp') rampCount += dc.quantity;
      if (dc.categoryByFunction === 'Draw') drawCount += dc.quantity;
      if (['Removal', 'Counterspell', 'BoardWipe'].includes(dc.categoryByFunction)) {
        interactionCount += dc.quantity;
      }
    });

    const avgCmc = nonLandCount > 0 ? Number((totalCmc / nonLandCount).toFixed(2)) : 0;

    return {
      totalCards,
      avgCmc,
      manaCurve,
      colorDistribution,
      landCount,
      coloredSourcesCount,
      rampCount,
      drawCount,
      interactionCount,
      estimatedPriceUsd: Number(totalPriceUsd.toFixed(2))
    };
  }

  private generateStrategyAnalysis(
    request: DeckRequest,
    parsed: any,
    validation: ValidationResult,
    stats: DeckStats
  ): StrategyAnalysis {
    const cmdName = request.commander.card.name;

    return {
      overview: `Questo mazzo focalizzato su ${cmdName} al livello competitivo ${request.powerLevel}/5 è progettato per sviluppare una strategia esplosiva basata su ${parsed.primaryArchetype}. Il mazzo bilancia la velocizzazione delle risorse (Ramp: ${stats.rampCount}) con il pescaggio continuo (Draw: ${stats.drawCount}) per sopraffare gli avversari.`,
      earlyGame: `Nei turni 1-3 l'obiettivo primario è sviluppare il mana tramite acceleratori (Sol Ring, Arcane Signet) e posizionare i primi pezzi sinergici a basso costo.`,
      midGame: `Nei turni 4-6 l'obiettivo è lanciare ${cmdName}, attivare il motore di generazione risorse/pedine e iniziare a esercitare pressione costante sul tavolo tramite danni o sacrifici sinergici.`,
      lateGame: `Dal turno 7+ il mazzo punta a consolidare la vittoria tramite payoff di massa, sovraccarico di danni diretti o l'esecuzione delle condizioni di vittoria principali.`,
      winConditions: [
        `Inondazione del campo di battaglia tramite pedine ed effetti di pompaggio di massa.`,
        `Danni diretti tramite motori di sacrificio o carte payoff (es. Purphoros, Impact Tremors, Pashalik Mons).`,
        `Attacco aggressivo coordinato sfruttando carte con Haste.`
      ],
      synergiesAndCombos: [
        `Krenko, Mob Boss + Skirk Prospector + Goblin Warchief = produzione esponenziale di mana e pedine.`,
        `Skullclamp + Pedine Goblin 1/1 = Pescaggio accelerato al costo di 1 mana.`
      ],
      strengths: [
        `Velocità d'esecuzione e forte pressione nei primi turni.`,
        `Alta sinergia tribale e capacità di ripresa dopo le risposte avversarie.`,
        `Mana curve ottimizzata a basso costo (Avg CMC ${stats.avgCmc}).`
      ],
      weaknesses: [
        `Sensibile alle risposte globali tempestive (Board Wipes) se lanciate prima del consolidamento delle protezioni.`,
        `Dipendenza parziale dalla presenza del Comandante sul terreno.`
      ],
      warnings: validation.warnings,
      replaceableSuggestions: [
        {
          originalCard: 'Deflecting Swat',
          suggestedCard: 'Red Elemental Blast',
          reasoning: 'Alternativa di risposta altamente economica ed efficiente in rosso.',
          category: 'budget',
          priceDifferenceUsd: -40.0
        }
      ]
    };
  }
}
