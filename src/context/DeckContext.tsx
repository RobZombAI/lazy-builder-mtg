import React, { createContext, useContext, useState, useEffect } from 'react';
import { Commander, Card } from '../types/card';
import { Deck, DeckCard } from '../types/deck';
import { DeckRequest } from '../types/generator';
import { CardDataProvider } from '../services/cardData/CardDataProvider';
import { ScryfallProvider } from '../services/cardData/ScryfallProvider';
import { DemoCardProvider } from '../services/cardData/DemoCardProvider';
import { LocalDatabaseProvider } from '../services/cardData/LocalDatabaseProvider';
import { LazyDeckGenerator } from '../services/generator/LazyDeckGenerator';
import { DeckModifierEngine } from '../services/modifier/DeckModifierEngine';

export type DataProviderMode = 'local' | 'demo' | 'scryfall';

interface DeckContextType {
  providerMode: DataProviderMode;
  setProviderMode: (mode: DataProviderMode) => void;
  cardProvider: CardDataProvider;
  selectedCommander: Commander | null;
  setSelectedCommander: (cmd: Commander | null) => void;
  powerLevel: number;
  setPowerLevel: (lvl: number) => void;
  promptDescription: string;
  setPromptDescription: (desc: string) => void;
  maxBudgetUsd: number | undefined;
  setMaxBudgetUsd: (val: number | undefined) => void;
  allowInfiniteCombos: boolean;
  setAllowInfiniteCombos: (val: boolean) => void;
  mandatoryCardsText: string;
  setMandatoryCardsText: (val: string) => void;
  excludedCardsText: string;
  setExcludedCardsText: (val: string) => void;
  desiredLandCount: number | undefined;
  setDesiredLandCount: (val: number | undefined) => void;

  // Deck generation state
  isGenerating: boolean;
  generationStep: string;
  generatedDeck: Deck | null;
  generateDeck: () => Promise<void>;

  // Card modifications
  toggleLockCard: (normalizedName: string) => void;
  removeCard: (normalizedName: string) => Promise<void>;
  swapCard: (oldName: string, newName: string) => Promise<void>;
  regenerateUnlockedCards: () => Promise<void>;
}

const DeckContext = createContext<DeckContextType | undefined>(undefined);

export const DeckProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [providerMode, setProviderMode] = useState<DataProviderMode>('local');

  const [cardProvider, setCardProvider] = useState<CardDataProvider>(
    new LocalDatabaseProvider()
  );

  useEffect(() => {
    if (providerMode === 'local') {
      setCardProvider(new LocalDatabaseProvider());
    } else if (providerMode === 'demo') {
      setCardProvider(new DemoCardProvider());
    } else {
      setCardProvider(new ScryfallProvider());
    }
  }, [providerMode]);

  const [selectedCommander, setSelectedCommander] = useState<Commander | null>(null);
  const [powerLevel, setPowerLevel] = useState<number>(4);
  const [promptDescription, setPromptDescription] = useState<string>(
    'Voglio creare il maggior numero possibile di pedine e sfruttarle tramite sacrifici, danni diretti e accelerazione esplosiva.'
  );
  const [maxBudgetUsd, setMaxBudgetUsd] = useState<number | undefined>(undefined);
  const [allowInfiniteCombos, setAllowInfiniteCombos] = useState<boolean>(true);
  const [mandatoryCardsText, setMandatoryCardsText] = useState<string>('');
  const [excludedCardsText, setExcludedCardsText] = useState<string>('');
  const [desiredLandCount, setDesiredLandCount] = useState<number | undefined>(undefined);

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [generatedDeck, setGeneratedDeck] = useState<Deck | null>(null);

  const generateDeck = async () => {
    if (!selectedCommander) return;
    setIsGenerating(true);

    const steps = [
      `Analisi di ${selectedCommander.card.name}...`,
      `Interpretazione della strategia e archetipo...`,
      `Allocazione slot quantitativi per Livello Potenza ${powerLevel}/5...`,
      `Scoring ed estrazione delle migliori sinergie...`,
      `Generazione bilanciata della Mana Base...`,
      `Verifica deterministica legalità Commander (100 carte)...`,
      `Elaborazione finale dell'analisi strategica...`
    ];

    for (let i = 0; i < steps.length; i++) {
      setGenerationStep(steps[i]);
      await new Promise(res => setTimeout(res, 350));
    }

    const generator = new LazyDeckGenerator(cardProvider);

    const mandatoryCards = mandatoryCardsText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const excludedCards = excludedCardsText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const request: DeckRequest = {
      commander: selectedCommander,
      powerLevel,
      description: promptDescription,
      maxBudgetUsd,
      allowInfiniteCombos,
      mandatoryCards,
      excludedCards,
      desiredLandCount
    };

    const deck = await generator.generateDeck(request);
    setGeneratedDeck(deck);
    setIsGenerating(false);
  };

  const toggleLockCard = (normalizedName: string) => {
    if (!generatedDeck) return;
    const updated = DeckModifierEngine.toggleLockCard(generatedDeck, normalizedName);
    setGeneratedDeck(updated);
  };

  const removeCard = async (normalizedName: string) => {
    if (!generatedDeck) return;
    const modifier = new DeckModifierEngine(cardProvider);
    const updated = await modifier.removeCard(generatedDeck, normalizedName);
    setGeneratedDeck(updated);
  };

  const swapCard = async (oldName: string, newName: string) => {
    if (!generatedDeck) return;
    const modifier = new DeckModifierEngine(cardProvider);
    const updated = await modifier.swapCard(generatedDeck, oldName, newName);
    setGeneratedDeck(updated);
  };

  const regenerateUnlockedCards = async () => {
    if (!generatedDeck || !selectedCommander) return;
    // Save current locked cards
    const lockedCards = generatedDeck.cards.filter(c => c.isLocked);
    const lockedNames = lockedCards.map(c => c.card.name);

    // Merge locked cards into mandatoryCards for regeneration
    const currentMandatory = mandatoryCardsText.split('\n').map(s => s.trim()).filter(Boolean);
    const combinedMandatory = Array.from(new Set([...currentMandatory, ...lockedNames]));

    setIsGenerating(true);
    setGenerationStep('Rigenerazione carte non bloccate...');
    await new Promise(res => setTimeout(res, 500));

    const generator = new LazyDeckGenerator(cardProvider);
    const request: DeckRequest = {
      commander: selectedCommander,
      powerLevel,
      description: promptDescription,
      maxBudgetUsd,
      allowInfiniteCombos,
      mandatoryCards: combinedMandatory,
      excludedCards: excludedCardsText.split('\n').map(s => s.trim()).filter(Boolean),
      desiredLandCount
    };

    const newDeck = await generator.generateDeck(request);

    // Re-apply lock flags to retained locked cards
    newDeck.cards = newDeck.cards.map(dc => {
      if (lockedNames.includes(dc.card.name)) {
        return { ...dc, isLocked: true };
      }
      return dc;
    });

    setGeneratedDeck(newDeck);
    setIsGenerating(false);
  };

  return (
    <DeckContext.Provider value={{
      providerMode,
      setProviderMode,
      cardProvider,
      selectedCommander,
      setSelectedCommander,
      powerLevel,
      setPowerLevel,
      promptDescription,
      setPromptDescription,
      maxBudgetUsd,
      setMaxBudgetUsd,
      allowInfiniteCombos,
      setAllowInfiniteCombos,
      mandatoryCardsText,
      setMandatoryCardsText,
      excludedCardsText,
      setExcludedCardsText,
      desiredLandCount,
      setDesiredLandCount,
      isGenerating,
      generationStep,
      generatedDeck,
      generateDeck,
      toggleLockCard,
      removeCard,
      swapCard,
      regenerateUnlockedCards
    }}>
      {children}
    </DeckContext.Provider>
  );
};

export const useDeck = () => {
  const context = useContext(DeckContext);
  if (!context) throw new Error('useDeck must be used within a DeckProvider');
  return context;
};
