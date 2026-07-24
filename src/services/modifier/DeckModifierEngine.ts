import { Deck, DeckCard } from '../../types/deck';
import { CardDataProvider } from '../cardData/CardDataProvider';
import { CommanderValidator } from '../validator/CommanderValidator';

export class DeckModifierEngine {
  constructor(private cardProvider: CardDataProvider) {}

  /**
   * Toggles the lock status of a card in the deck
   */
  static toggleLockCard(deck: Deck, cardNormalizedName: string): Deck {
    const updatedCards = deck.cards.map(dc => {
      if (dc.card.normalizedName === cardNormalizedName.toLowerCase()) {
        return { ...dc, isLocked: !dc.isLocked };
      }
      return dc;
    });

    return {
      ...deck,
      cards: updatedCards
    };
  }

  /**
   * Removes a card and replaces it with a basic land or alternative card
   */
  async removeCard(deck: Deck, cardNormalizedName: string): Promise<Deck> {
    const target = deck.cards.find(dc => dc.card.normalizedName === cardNormalizedName.toLowerCase());
    if (!target || target.isLocked) return deck;

    // Filter out target card
    let updatedCards = deck.cards.filter(dc => dc.card.normalizedName !== cardNormalizedName.toLowerCase());

    // Replace with basic land to preserve 99 count
    const mainColor = deck.commander.colorIdentity[0] || 'R';
    const basicName = mainColor === 'R' ? 'Mountain' : mainColor === 'G' ? 'Forest' : mainColor === 'U' ? 'Island' : mainColor === 'B' ? 'Swamp' : 'Plains';
    
    const basicCard = await this.cardProvider.getCardByName(basicName);
    if (basicCard) {
      const existingLand = updatedCards.find(dc => dc.card.normalizedName === basicName.toLowerCase());
      if (existingLand) {
        existingLand.quantity += 1;
      } else {
        updatedCards.push({
          card: basicCard,
          quantity: 1,
          categoryByCardType: 'Land',
          categoryByFunction: 'Lands',
          reasoning: 'Sostituzione per mantenere il totale di 100 carte.',
          isLocked: false
        });
      }
    }

    const validation = CommanderValidator.validateDeck(deck.commander, updatedCards);

    return {
      ...deck,
      cards: updatedCards,
      isValid: validation.isValid,
      validationErrors: validation.errors
    };
  }

  /**
   * Swaps a specific card with a candidate replacement card
   */
  async swapCard(deck: Deck, oldCardName: string, newCardName: string): Promise<Deck> {
    const oldCard = deck.cards.find(dc => dc.card.normalizedName === oldCardName.toLowerCase());
    if (!oldCard || oldCard.isLocked) return deck;

    const newCardObj = await this.cardProvider.getCardByName(newCardName);
    if (!newCardObj) return deck;

    const updatedCards = deck.cards.map(dc => {
      if (dc.card.normalizedName === oldCardName.toLowerCase()) {
        return {
          card: newCardObj,
          quantity: 1,
          categoryByCardType: dc.categoryByCardType,
          categoryByFunction: dc.categoryByFunction,
          reasoning: `Sostituita manualmente a posto di ${oldCard.card.name}.`,
          isLocked: false
        };
      }
      return dc;
    });

    const validation = CommanderValidator.validateDeck(deck.commander, updatedCards);

    return {
      ...deck,
      cards: updatedCards,
      isValid: validation.isValid,
      validationErrors: validation.errors
    };
  }
}
