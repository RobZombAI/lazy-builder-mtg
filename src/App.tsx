import React from 'react';
import { Header } from './components/Header';
import { CommanderSearch } from './components/CommanderSearch';
import { PowerLevelSelector } from './components/PowerLevelSelector';
import { DeckRequestForm } from './components/DeckRequestForm';
import { DeckView } from './components/DeckView';
import { GenerationProgress } from './components/GenerationProgress';
import { useDeck } from './context/DeckContext';

export const AppContent: React.FC = () => {
  const { isGenerating, generationStep, generatedDeck } = useDeck();

  return (
    <div className="min-h-screen bg-[#0F1117] text-slate-100 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* Header Navbar */}
      <Header />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 space-y-8">
        
        {/* Hero Message */}
        <div className="bg-gradient-to-r from-orange-600/10 via-amber-500/5 to-transparent border border-orange-500/20 rounded-3xl p-6 sm:p-8 text-center sm:text-left shadow-xl relative overflow-hidden">
          <div className="max-w-3xl">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
              Scegli il comandante. Indica la potenza. Descrivi come vuoi giocare.
            </h2>
            <p className="text-sm text-slate-300 font-medium leading-relaxed">
              Lazy Builder fa il lavoro più lungo e ti consegna un mazzo Commander da 100 carte completo, legale, bilanciato e pronto per il tavolo da gioco.
            </p>
          </div>
        </div>

        {/* Input Configuration Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <CommanderSearch />
          </div>
          <div className="lg:col-span-2 space-y-6">
            <PowerLevelSelector />
            <DeckRequestForm />
          </div>
        </div>

        {/* Generated Deck Dashboard */}
        {generatedDeck && (
          <div className="pt-6 border-t border-mtg-border">
            <DeckView />
          </div>
        )}

      </main>

      {/* Loading Progress Modal */}
      {isGenerating && <GenerationProgress currentStep={generationStep} />}

      {/* Footer */}
      <footer className="border-t border-mtg-border py-6 px-4 text-center text-xs text-slate-500">
        <p>
          Lazy Builder — Non affiliato con Wizards of the Coast LLC. I dati e le immagini delle carte provengono dall'API pubblica Scryfall.
        </p>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return <AppContent />;
};

export default App;
