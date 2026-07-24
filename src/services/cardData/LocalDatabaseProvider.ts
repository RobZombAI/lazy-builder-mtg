import { CardDataProvider } from './CardDataProvider';
import { Card, Color, Commander } from '../../types/card';
import { DemoCardProvider } from './DemoCardProvider';
import { DbSyncService } from './DbSyncService';
import { getCardImageUrl } from '../../utils/cardImage';

export class LocalDatabaseProvider implements CardDataProvider {
  private cards: Card[] = [];
  private isInitialized = false;
  private demoProvider = new DemoCardProvider();

  /**
   * Initializes local database from IndexedDB custom sync or public JSON asset
   */
  private async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // 1. Try loading custom downloaded cards from IndexedDB if user clicked update
      const customCards = await DbSyncService.getCustomLocalCards();
      if (customCards && customCards.length > 0) {
        this.cards = customCards;
        this.isInitialized = true;
        console.log(`[LocalDatabaseProvider] Caricate ${this.cards.length} carte da IndexedDB locale.`);
        return;
      }

      // 2. Fallback to bundled mtg-db-full.json asset
      const res = await fetch('./data/mtg-db-full.json');
      if (res.ok) {
        this.cards = await res.json();
        console.log(`[LocalDatabaseProvider] Caricate ${this.cards.length} carte da mtg-db-full.json.`);
      } else {
        const fallbackRes = await fetch('/data/mtg-db-full.json');
        if (fallbackRes.ok) {
          this.cards = await fallbackRes.json();
        }
      }
    } catch (err) {
      console.warn('[LocalDatabaseProvider] Errore caricamento DB locale, uso DemoProvider:', err);
    } finally {
      this.isInitialized = true;
    }
  }

  async searchCards(query: string): Promise<Card[]> {
    await this.initialize();
    if (this.cards.length === 0) {
      return this.demoProvider.searchCards(query);
    }

    const cleanQuery = query.toLowerCase().trim();
    return this.cards
      .filter(c => c.normalizedName.includes(cleanQuery) || c.typeLine.toLowerCase().includes(cleanQuery))
      .slice(0, 30)
      .map(c => ({
        ...c,
        imageUrl: getCardImageUrl(c.imageUrl, c.name)
      }));
  }

  async getCardByName(name: string): Promise<Card | null> {
    await this.initialize();
    if (this.cards.length === 0) {
      return this.demoProvider.getCardByName(name);
    }

    const cleanName = name.toLowerCase().trim();
    const card = this.cards.find(c => c.normalizedName === cleanName || c.name.toLowerCase() === cleanName);
    if (!card) return null;

    return {
      ...card,
      imageUrl: getCardImageUrl(card.imageUrl, card.name)
    };
  }

  async getCardById(id: string): Promise<Card | null> {
    await this.initialize();
    if (this.cards.length === 0) {
      return this.demoProvider.getCardById(id);
    }

    const card = this.cards.find(c => c.id === id);
    if (!card) return null;

    return {
      ...card,
      imageUrl: getCardImageUrl(card.imageUrl, card.name)
    };
  }

  async searchCommanders(query: string): Promise<Commander[]> {
    await this.initialize();
    if (this.cards.length === 0) {
      return this.demoProvider.searchCommanders(query);
    }

    const cleanQuery = query.toLowerCase().trim();

    return this.cards
      .filter(c => {
        const isLegendaryCreature = c.typeLine.includes('Legendary') && c.typeLine.includes('Creature');
        const matchesQuery = !cleanQuery || c.normalizedName.includes(cleanQuery);
        return isLegendaryCreature && matchesQuery;
      })
      .slice(0, 30)
      .map(c => ({
        card: {
          ...c,
          imageUrl: getCardImageUrl(c.imageUrl, c.name)
        },
        colorIdentity: c.colorIdentity as Color[],
        suggestedStrategies: ['Synergy', 'Aggro', 'Tokens'],
        estimatedPowerLevel: 3,
        compatibleArchetypes: ['Tribal', 'Aristocrats', 'Goodstuff']
      }));
  }

  async getCardsByColorIdentity(colorIdentity: string[], limit: number = 200): Promise<Card[]> {
    await this.initialize();
    if (this.cards.length === 0) {
      return this.demoProvider.getCardsByColorIdentity(colorIdentity, limit);
    }

    return this.cards
      .filter(c => c.colorIdentity.every(col => colorIdentity.includes(col)))
      .slice(0, limit)
      .map(c => ({
        ...c,
        imageUrl: getCardImageUrl(c.imageUrl, c.name)
      }));
  }
}
