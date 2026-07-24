export const FALLBACK_CARD_IMAGE = 'https://cards.scryfall.io/back.png';

/**
 * Returns a guaranteed valid card image URL or a dynamic Scryfall API image proxy
 */
export function getCardImageUrl(url?: string, cardName?: string): string {
  if (url && typeof url === 'string' && url.trim() !== '' && url !== FALLBACK_CARD_IMAGE) {
    return url;
  }
  if (cardName && typeof cardName === 'string' && cardName.trim() !== '') {
    // Official Scryfall Live Named Card Artwork Endpoint
    return `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(cardName.trim())}&format=image`;
  }
  return FALLBACK_CARD_IMAGE;
}

/**
 * Event handler for <img> onError:
 * 1. Tries Scryfall named card API endpoint if cardName is available on dataset
 * 2. Fallbacks to MTG Card Back image
 */
export function handleCardImageError(
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  cardName?: string
): void {
  const target = e.currentTarget;
  const currentSrc = target.src;

  // Step 1: Try Scryfall Named Image API if not already tried
  if (cardName && !currentSrc.includes('api.scryfall.com/cards/named')) {
    target.src = `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(cardName.trim())}&format=image`;
    return;
  }

  // Step 2: Fallback to card back
  if (target.src !== FALLBACK_CARD_IMAGE) {
    target.src = FALLBACK_CARD_IMAGE;
  }
}
