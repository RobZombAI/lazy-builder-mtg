import { CardDataProvider } from './CardDataProvider';
import { Card, Color, Commander, FunctionalCategory, TypeCategory } from '../../types/card';
import { DemoCardProvider } from './DemoCardProvider';

interface ScryfallCardObject {
  id: string;
  name: string;
  mana_cost?: string;
  cmc?: number;
  colors?: string[];
  color_identity?: string[];
  type_line?: string;
  oracle_text?: string;
  legalities?: Record<string, string>;
  set?: string;
  set_name?: string;
  rarity?: string;
  prices?: { usd?: string };
  keywords?: string[];
  image_uris?: { normal?: string; large?: string; png?: string };
  card_faces?: Array<{ image_uris?: { normal?: string; large?: string }; oracle_text?: string }>;
  produced_mana?: string[];
}

export class ScryfallProvider implements CardDataProvider {
  private cache: Map<string, Card> = new Map();
  private demoProvider = new DemoCardProvider();
  private baseUrl = 'https://api.scryfall.com';

  async searchCards(query: string): Promise<Card[]> {
    if (!query.trim()) return [];
    try {
      const url = `${this.baseUrl}/cards/search?q=${encodeURIComponent(query)}&f=json`;
      const res = await fetch(url);
      if (!res.ok) {
        // Fallback to demo
        return this.demoProvider.searchCards(query);
      }
      const data = await res.json();
      if (!data.data || !Array.isArray(data.data)) return [];

      const cards = data.data.map((sc: ScryfallCardObject) => this.mapScryfallToCard(sc));
      cards.forEach((c: Card) => this.cache.set(c.id, c));
      return cards;
    } catch (err) {
      console.warn('Scryfall API error, falling back to local demo provider:', err);
      return this.demoProvider.searchCards(query);
    }
  }

  async getCardByName(name: string): Promise<Card | null> {
    const cached = Array.from(this.cache.values()).find(c => c.name.toLowerCase() === name.toLowerCase());
    if (cached) return cached;

    try {
      const url = `${this.baseUrl}/cards/named?exact=${encodeURIComponent(name)}`;
      const res = await fetch(url);
      if (!res.ok) {
        return this.demoProvider.getCardByName(name);
      }
      const sc: ScryfallCardObject = await res.json();
      const card = this.mapScryfallToCard(sc);
      this.cache.set(card.id, card);
      return card;
    } catch (err) {
      return this.demoProvider.getCardByName(name);
    }
  }

  async getCardById(id: string): Promise<Card | null> {
    if (this.cache.has(id)) return this.cache.get(id)!;

    try {
      const url = `${this.baseUrl}/cards/${id}`;
      const res = await fetch(url);
      if (!res.ok) return this.demoProvider.getCardById(id);
      const sc: ScryfallCardObject = await res.json();
      const card = this.mapScryfallToCard(sc);
      this.cache.set(card.id, card);
      return card;
    } catch (err) {
      return this.demoProvider.getCardById(id);
    }
  }

  async searchCommanders(query: string): Promise<Commander[]> {
    try {
      const searchQuery = `is:commander legal:commander ${query ? `name:${query}` : ''}`.trim();
      const url = `${this.baseUrl}/cards/search?q=${encodeURIComponent(searchQuery)}`;
      const res = await fetch(url);
      if (!res.ok) return this.demoProvider.searchCommanders(query);
      const data = await res.json();
      if (!data.data) return this.demoProvider.searchCommanders(query);

      const commanders: Commander[] = data.data.map((sc: ScryfallCardObject) => {
        const card = this.mapScryfallToCard(sc);
        return {
          card,
          colorIdentity: card.colorIdentity,
          suggestedStrategies: this.inferStrategies(card),
          estimatedPowerLevel: 4,
          compatibleArchetypes: ['Aggro', 'Synergy', 'Combo', 'Control']
        };
      });
      return commanders;
    } catch (err) {
      return this.demoProvider.searchCommanders(query);
    }
  }

  async getCardsByColorIdentity(colorIdentity: string[], limit = 100): Promise<Card[]> {
    try {
      const ciString = colorIdentity.length > 0 ? colorIdentity.join('') : 'c';
      const searchQuery = `id<=${ciString} legal:commander -type:basic`;
      const url = `${this.baseUrl}/cards/search?q=${encodeURIComponent(searchQuery)}&order=edhrec`;
      const res = await fetch(url);
      if (!res.ok) return this.demoProvider.getCardsByColorIdentity(colorIdentity, limit);
      const data = await res.json();
      if (!data.data) return this.demoProvider.getCardsByColorIdentity(colorIdentity, limit);

      const cards = data.data.slice(0, limit).map((sc: ScryfallCardObject) => this.mapScryfallToCard(sc));
      cards.forEach((c: Card) => this.cache.set(c.id, c));
      return cards;
    } catch (err) {
      return this.demoProvider.getCardsByColorIdentity(colorIdentity, limit);
    }
  }

  private mapScryfallToCard(sc: ScryfallCardObject): Card {
    const imageUrl = sc.image_uris?.normal || 
                     sc.image_uris?.large || 
                     sc.card_faces?.[0]?.image_uris?.normal || 
                     sc.card_faces?.[0]?.image_uris?.large || 
                     'https://cards.scryfall.io/back.png';
    const oracleText = sc.oracle_text || sc.card_faces?.[0]?.oracle_text || '';
    const typeLine = sc.type_line || '';
    const isLand = typeLine.toLowerCase().includes('land');

    // Parse types & supertypes
    const parts = typeLine.split('—');
    const mainTypeParts = parts[0] ? parts[0].trim().split(' ') : [];
    const subtypes = parts[1] ? parts[1].trim().split(' ') : [];

    const supertypeKeywords = ['Legendary', 'Basic', 'Snow', 'World'];
    const supertypes = mainTypeParts.filter(p => supertypeKeywords.includes(p));
    const types = mainTypeParts.filter(p => !supertypeKeywords.includes(p));

    const colorIdentity = (sc.color_identity || []) as Color[];
    const colors = (sc.colors || []) as Color[];

    const priceUsd = sc.prices?.usd ? parseFloat(sc.prices.usd) : undefined;

    return {
      id: sc.id,
      name: sc.name,
      normalizedName: sc.name.toLowerCase(),
      imageUrl,
      manaCost: sc.mana_cost || '',
      cmc: sc.cmc || 0,
      colors,
      colorIdentity,
      typeLine,
      supertypes,
      types,
      subtypes,
      oracleText,
      legalities: { commander: (sc.legalities?.commander as any) || 'legal' },
      set: sc.set || '',
      setName: sc.set_name,
      rarity: (sc.rarity as any) || 'common',
      priceUsd,
      keywords: sc.keywords || [],
      strategicTags: this.inferTags(oracleText, typeLine),
      isLand,
      producesMana: (sc.produced_mana || []) as Color[]
    };
  }

  private inferTags(text: string, type: string): FunctionalCategory[] {
    const tags: FunctionalCategory[] = [];
    const lower = text.toLowerCase();
    const tLower = type.toLowerCase();

    if (tLower.includes('land')) tags.push('Lands');
    if (lower.includes('add ') || lower.includes('search your library for a land')) tags.push('Ramp');
    if (lower.includes('draw ') || lower.includes('draws ')) tags.push('Draw');
    if (lower.includes('search your library') && !lower.includes('for a land')) tags.push('Tutor');
    if (lower.includes('destroy target') || lower.includes('exile target') || lower.includes('deals ') && lower.includes(' target')) tags.push('Removal');
    if (lower.includes('hexproof') || lower.includes('indestructible') || lower.includes('protection')) tags.push('Protection');
    if (tLower.includes('instant') && lower.includes('counter target')) tags.push('Counterspell');
    if (lower.includes('destroy all') || lower.includes('exile all')) tags.push('BoardWipe');
    if (lower.includes('create') && lower.includes('token')) tags.push('TokenGenerator');
    if (lower.includes('sacrifice a') || lower.includes('sacrifice another')) tags.push('SacrificeOutlet');

    if (tags.length === 0) tags.push('Synergy');
    return tags;
  }

  private inferStrategies(card: Card): string[] {
    const text = card.oracleText.toLowerCase();
    const strategies: string[] = [];
    if (text.includes('token') || card.subtypes.includes('Goblin') || card.subtypes.includes('Elf')) {
      strategies.push('Token Swarm', 'Aggro & Burn');
    }
    if (text.includes('sacrifice') || text.includes('dies')) {
      strategies.push('Aristocrats & Sacrifice', 'Value Engine');
    }
    if (text.includes('proliferate') || text.includes('counter')) {
      strategies.push('+1/+1 Counters', 'Proliferate & Control');
    }
    if (text.includes('mana') || text.includes('tap')) {
      strategies.push('Big Mana & Ramp', 'Combo');
    }
    if (strategies.length === 0) {
      strategies.push('Synergy & Value', 'Commander Midrange');
    }
    return strategies;
  }
}
