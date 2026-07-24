import { Card, Commander } from '../../types/card';

export interface CardDataProvider {
  searchCards(query: string): Promise<Card[]>;
  getCardByName(name: string): Promise<Card | null>;
  getCardById(id: string): Promise<Card | null>;
  searchCommanders(query: string): Promise<Commander[]>;
  getCardsByColorIdentity(colorIdentity: string[], limit?: number): Promise<Card[]>;
}
