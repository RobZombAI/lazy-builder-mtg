import React, { useState } from 'react';
import { MessageSquareText, Sliders, ChevronDown, ChevronUp, Sparkles, DollarSign, Ban, CheckCircle, ShieldAlert } from 'lucide-react';
import { useDeck } from '../context/DeckContext';

export const DeckRequestForm: React.FC = () => {
  const {
    selectedCommander,
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
    generateDeck
  } = useDeck();

  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  return (
    <div className="bg-mtg-surface border border-mtg-border rounded-2xl p-6 shadow-xl">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
          <MessageSquareText className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">3. Come vuoi che funzioni il mazzo?</h2>
          <p className="text-xs text-slate-400">Descrivi liberamente la strategia, le meccaniche preferite o il tuo stile di gioco.</p>
        </div>
      </div>

      {/* Freeform Prompt Textarea */}
      <div className="mb-4">
        <textarea
          rows={4}
          value={promptDescription}
          onChange={(e) => setPromptDescription(e.target.value)}
          placeholder="Esempio: Voglio creare il maggior numero possibile di pedine Goblin e sfruttarle tramite sacrifici, danni diretti, produzione di mana e altre sinergie. Il mazzo deve essere veloce, esplosivo e molto ottimizzato."
          className="w-full bg-[#0F1117] border border-mtg-border focus:border-orange-500 rounded-xl p-4 text-sm text-white placeholder-slate-500 outline-none transition-all shadow-inner leading-relaxed"
        />
      </div>

      {/* Toggle Advanced Preferences Button */}
      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center space-x-2 text-xs font-bold text-orange-400 hover:text-orange-300 transition-colors mb-4 focus:outline-none"
      >
        <Sliders className="w-4 h-4" />
        <span>{showAdvanced ? 'Nascondi Vincoli Avanzati' : 'Mostra Vincoli Facoltativi (Budget, Carte Obbligatorie/Escluse...)'}</span>
        {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {/* Advanced Collapsible Controls */}
      {showAdvanced && (
        <div className="bg-[#0F1117]/80 border border-mtg-border rounded-xl p-4 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Budget Limit */}
          <div>
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1 mb-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Budget Massimo Indicativo ($)
            </label>
            <input
              type="number"
              placeholder="Es. 100 (lascia vuoto per nessun limite)"
              value={maxBudgetUsd || ''}
              onChange={(e) => setMaxBudgetUsd(e.target.value ? parseFloat(e.target.value) : undefined)}
              className="w-full bg-[#1A1D26] border border-mtg-border focus:border-orange-500 rounded-lg p-2.5 text-xs text-white outline-none"
            />
          </div>

          {/* Desired Land Count */}
          <div>
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1 mb-1">
              Numero Desiderato di Terre (30-40)
            </label>
            <input
              type="number"
              placeholder="Es. 36 (calcolato in automatico altrimenti)"
              value={desiredLandCount || ''}
              onChange={(e) => setDesiredLandCount(e.target.value ? parseInt(e.target.value, 10) : undefined)}
              className="w-full bg-[#1A1D26] border border-mtg-border focus:border-orange-500 rounded-lg p-2.5 text-xs text-white outline-none"
            />
          </div>

          {/* Mandatory Cards */}
          <div>
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1 mb-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Carte Obbligatorie (una per riga)
            </label>
            <textarea
              rows={3}
              value={mandatoryCardsText}
              onChange={(e) => setMandatoryCardsText(e.target.value)}
              placeholder="Es. Skullclamp&#10;Sol Ring"
              className="w-full bg-[#1A1D26] border border-mtg-border focus:border-orange-500 rounded-lg p-2.5 text-xs text-white outline-none"
            />
          </div>

          {/* Excluded Cards */}
          <div>
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1 mb-1">
              <Ban className="w-3.5 h-3.5 text-red-400" /> Carte Escluse (una per riga)
            </label>
            <textarea
              rows={3}
              value={excludedCardsText}
              onChange={(e) => setExcludedCardsText(e.target.value)}
              placeholder="Es. Mana Crypt&#10;Dockside Extortionist"
              className="w-full bg-[#1A1D26] border border-mtg-border focus:border-orange-500 rounded-lg p-2.5 text-xs text-white outline-none"
            />
          </div>

          {/* Allow Infinite Combos Toggle */}
          <div className="sm:col-span-2 flex items-center space-x-3 pt-2">
            <input
              type="checkbox"
              id="infiniteCombosToggle"
              checked={allowInfiniteCombos}
              onChange={(e) => setAllowInfiniteCombos(e.target.checked)}
              className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
            />
            <label htmlFor="infiniteCombosToggle" className="text-xs font-semibold text-slate-200 cursor-pointer">
              Consenti l'inclusione di combo infinite o chiusure istantanee
            </label>
          </div>

        </div>
      )}

      {/* Main Submit Generator Button */}
      <button
        type="button"
        disabled={!selectedCommander || isGenerating}
        onClick={generateDeck}
        className={`w-full py-4 px-6 rounded-xl font-extrabold text-base flex items-center justify-center space-x-3 shadow-xl transition-all ${
          !selectedCommander || isGenerating
            ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            : 'bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 hover:from-orange-500 hover:to-amber-400 text-white shadow-orange-500/25 border border-orange-400/30 scale-[1.01] hover:scale-[1.02]'
        }`}
      >
        <Sparkles className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} />
        <span>{isGenerating ? 'Generazione Mazzo in corso...' : 'GENERA IL MIO MAZZO (100 CARTE)'}</span>
      </button>

      {!selectedCommander && (
        <p className="text-center text-xs text-amber-400/80 mt-2 font-medium">
          Seleziona prima un Comandante per poter generare il mazzo.
        </p>
      )}
    </div>
  );
};
