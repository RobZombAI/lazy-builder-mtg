# DATA_MODEL.md — Modello dei Dati (Lazy Builder)

## 1. Panoramica
Il modello dati di Lazy Builder è fortemente tipizzato in TypeScript e strutturato per separare nettamente le rappresentazioni grezze delle carte MTG dalle strutture ad alto livello per il deckbuilding, l'analisi strategica e la validazione.

## 2. Entità Principali

### 2.1 `Card`
Rappresenta una singola carta di Magic: The Gathering, arricchita con informazioni sull'identità di colore, prezzi e tag funzionali.

```typescript
export type Color = 'W' | 'U' | 'B' | 'R' | 'G';

export interface CardLegalities {
  commander: 'legal' | 'banned' | 'restricted' | 'not_legal';
  [format: string]: string;
}

export interface Card {
  id: string;
  name: string;
  normalizedName: string;
  imageUrl: string;
  manaCost: string;
  cmc: number;
  colors: Color[];
  colorIdentity: Color[];
  typeLine: string;
  supertypes: string[];
  types: string[];
  subtypes: string[];
  oracleText: string;
  legalities: CardLegalities;
  set: string;
  setName?: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'mythic';
  priceUsd?: number;
  keywords?: string[];
  strategicTags?: FunctionalCategory[];
  isLand: boolean;
  producesMana?: Color[];
}
```

### 2.2 `Commander`
Rappresenta il comandante selezionato per il mazzo con le relative proprietà e metadati strategici.

```typescript
export interface Commander {
  card: Card;
  colorIdentity: Color[];
  suggestedStrategies: string[];
  estimatedPowerLevel: number;
  compatibleArchetypes: string[];
}
```

### 2.3 `DeckRequest`
Rappresenta le specifiche di input fornite dall'utente per la generazione del mazzo.

```typescript
export interface DeckRequest {
  commander: Commander;
  powerLevel: number; // 1 - 5
  description: string;
  maxBudgetUsd?: number;
  allowInfiniteCombos: boolean;
  mandatoryCards: string[];
  excludedCards: string[];
  primaryStrategy?: string;
  secondaryStrategy?: string;
  desiredLandCount?: number;
  playStyle?: 'aggro' | 'combo' | 'control' | 'midrange' | 'tribal' | 'value';
}
```

### 2.4 `FunctionalCategory`
Enum delle categorie funzionali usate per la suddivisione tattica del mazzo:
- `Commander`
- `Ramp`
- `Draw`
- `Tutor`
- `Removal`
- `Protection`
- `Counterspell`
- `BoardWipe`
- `TokenGenerator`
- `SacrificeOutlet`
- `Payoff`
- `Synergy`
- `ComboPiece`
- `WinCondition`
- `Lands`

### 2.5 `DeckCard`
Elemento che associa una carta al mazzo generato, specificandone la quantità, la categoria funzionale, la motivazione tattica e lo stato di blocco (locking).

```typescript
export interface DeckCard {
  card: Card;
  quantity: number;
  categoryByCardType: 'Commander' | 'Creature' | 'Instant' | 'Sorcery' | 'Artifact' | 'Enchantment' | 'Planeswalker' | 'Battle' | 'Land';
  categoryByFunction: FunctionalCategory;
  reasoning: string;
  isLocked: boolean;
}
```

### 2.6 `StrategyAnalysis`
Analisi dettagliata del piano di gioco generata dal sistema:
- `overview`: Spiegazione del piano generale.
- `earlyGame`: Guida ai turni 1-3.
- `midGame`: Sviluppo del vantaggio nei turni 4-6.
- `lateGame`: Piano di chiusura dai turni 7+.
- `winConditions`: Elenco chiaro delle condizioni di vittoria.
- `synergiesAndCombos`: Descrizione delle interazioni chiave.
- `strengths`: Punti di forza del mazzo.
- `weaknesses`: Vulnerabilità e contromisure.
- `warnings`: Eventuali avvisi su legalità, budget o coerenza.
- `replaceableSuggestions`: Suggerimenti di carte alternative.

### 2.7 `DeckStats`
Metriche e statistiche del mazzo:
- `totalCards`: Deve essere 100.
- `avgCmc`: Costo di mana medio senza terre.
- `manaCurve`: Distribuzione carte per CMC (0, 1, 2, 3, 4, 5, 6+).
- `colorDistribution`: Percentuale di simboli di mana colorati.
- `landCount`: Numero di terre.
- `coloredSourcesCount`: Fonti di ogni colore.
- `rampCount`: Numero di acceleratori.
- `drawCount`: Numero di carte pescaggio.
- `interactionCount`: Numero totale di rimozioni/counter.
- `estimatedPriceUsd`: Prezzo complessivo indicativo.

### 2.8 `Deck`
Oggetto finale completo del mazzo generato.

```typescript
export interface Deck {
  id: string;
  name: string;
  commander: Commander;
  cards: DeckCard[];
  stats: DeckStats;
  estimatedPowerLevel: number;
  strategyAnalysis: StrategyAnalysis;
  isValid: boolean;
  validationErrors: string[];
  createdAt: string;
}
```
