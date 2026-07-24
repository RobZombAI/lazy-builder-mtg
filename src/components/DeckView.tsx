import React, { useState } from 'react';
import { Layers, RefreshCw, Download, CheckCircle2, AlertOctagon, DollarSign, Gauge, ShieldCheck, Sparkles, Filter, Info, Network } from 'lucide-react';
import { useDeck } from '../context/DeckContext';
import { DeckCardItem } from './DeckCardItem';
import { ManaCurveChart } from './ManaCurveChart';
import { StrategyAnalysisView } from './StrategyAnalysisView';
import { InteractiveSynergyReport } from './InteractiveSynergyReport';
import { ExportModal } from './ExportModal';
import { FunctionalCategory, TypeCategory } from '../types/card';

export const DeckView: React.FC = () => {
  const { generatedDeck, regenerateUnlockedCards, isGenerating } = useDeck();
  const [activeTab, setActiveTab] = useState<'types' | 'functions' | 'synergies' | 'strategy' | 'stats'>('synergies');
  const [showExportModal, setShowExportModal] = useState<boolean>(false);

  if (!generatedDeck) return null;

  const commander = generatedDeck.commander;
  const lockedCount = generatedDeck.cards.filter(c => c.isLocked).length;

  // Group by Type
  const cardsByType: Record<TypeCategory, typeof generatedDeck.cards> = {
    Commander: [],
    Creature: [],
    Instant: [],
    Sorcery: [],
    Artifact: [],
    Enchantment: [],
    Planeswalker: [],
    Battle: [],
    Land: []
  };

  generatedDeck.cards.forEach(dc => {
    const cat = dc.categoryByCardType;
    if (!cardsByType[cat]) cardsByType[cat] = [];
    cardsByType[cat].push(dc);
  });

  // Group by Function
  const cardsByFunction: Partial<Record<FunctionalCategory, typeof generatedDeck.cards>> = {};
  generatedDeck.cards.forEach(dc => {
    const fn = dc.categoryByFunction;
    if (!cardsByFunction[fn]) cardsByFunction[fn] = [];
    cardsByFunction[fn]!.push(dc);
  });

  return (
    <div className="space-y-6">
      
      {/* Deck Header Card */}
      <div className="bg-mtg-surface border border-mtg-border rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        
        {/* Glowing background accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
          
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
            <img
              src={commander.card.imageUrl}
              alt={commander.card.name}
              className="w-24 sm:w-28 rounded-xl shadow-2xl border-2 border-orange-500/50 hover:scale-105 transition-transform"
            />
            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                <span className="px-3 py-1 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-full text-xs font-black uppercase tracking-wider">
                  Mazzo Completo Commander
                </span>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Legale (100 Carte Exact)
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-1">
                {commander.card.name}
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                {commander.card.typeLine} • Identità {commander.colorIdentity.join(', ') || 'Incolore'}
              </p>

              {/* Badges */}
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
                <span className="px-2.5 py-1 bg-[#0F1117] rounded-lg border border-mtg-border text-slate-300 flex items-center gap-1">
                  <Gauge className="w-3.5 h-3.5 text-amber-400" /> Potenza: {generatedDeck.estimatedPowerLevel}/5
                </span>
                <span className="px-2.5 py-1 bg-[#0F1117] rounded-lg border border-mtg-border text-slate-300">
                  CMC Medio: {generatedDeck.stats.avgCmc}
                </span>
                <span className="px-2.5 py-1 bg-[#0F1117] rounded-lg border border-mtg-border text-emerald-400 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5" /> ~${generatedDeck.stats.estimatedPriceUsd}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            
            {/* Regenerate Unlocked Cards Button */}
            <button
              type="button"
              disabled={isGenerating}
              onClick={regenerateUnlockedCards}
              className="px-4 py-3 rounded-xl bg-mtg-surface hover:bg-[#222634] text-slate-200 border border-mtg-border hover:border-orange-500/50 text-xs font-bold transition-all flex items-center space-x-2 shadow-lg"
              title="Rigenera tutte le carte lasciando fisse quelle bloccate"
            >
              <RefreshCw className={`w-4 h-4 text-orange-400 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>Rigenera Non Bloccate ({100 - lockedCount - 1})</span>
            </button>

            {/* Export Deck Button */}
            <button
              type="button"
              onClick={() => setShowExportModal(true)}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white text-xs font-black shadow-lg shadow-orange-500/20 border border-orange-400/30 transition-all flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Esporta Mazzo</span>
            </button>

          </div>

        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-mtg-border pb-3">
        {[
          { id: 'synergies', label: 'Grafico Sinergie & Combo', icon: Network },
          { id: 'types', label: 'Vista per Tipo', icon: Layers },
          { id: 'functions', label: 'Vista Funzionale', icon: Filter },
          { id: 'strategy', label: 'Analisi Strategica', icon: Sparkles },
          { id: 'stats', label: 'Mana Curve & Statistiche', icon: Info }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 border transition-all ${
                isActive
                  ? 'bg-orange-500/20 text-orange-400 border-orange-500/40 shadow-md'
                  : 'bg-mtg-surface text-slate-400 border-mtg-border hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content 0: Grafico Sinergie & Combo */}
      {activeTab === 'synergies' && (
        <InteractiveSynergyReport deck={generatedDeck} />
      )}

      {/* Tab Content 1: Vista per Tipo */}
      {activeTab === 'types' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Commander Card Standalone */}
          <div className="md:col-span-2 bg-mtg-surface border border-orange-500/40 rounded-2xl p-4 shadow-xl">
            <h3 className="text-xs font-black text-orange-400 uppercase tracking-wider mb-3">
              Comandante (1)
            </h3>
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#0F1117] border border-orange-500/30">
              <div className="flex items-center space-x-3">
                <img src={commander.card.imageUrl} alt={commander.card.name} className="w-10 h-14 object-cover rounded shadow" />
                <div>
                  <div className="font-extrabold text-sm text-white">{commander.card.name}</div>
                  <div className="text-xs text-slate-400">{commander.card.typeLine}</div>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-slate-300 bg-mtg-surface px-2 py-1 rounded border border-mtg-border">
                {commander.card.manaCost}
              </span>
            </div>
          </div>

          {/* Other Categories */}
          {Object.entries(cardsByType).map(([typeCategory, list]) => {
            if (typeCategory === 'Commander' || list.length === 0) return null;
            return (
              <div key={typeCategory} className="bg-mtg-surface border border-mtg-border rounded-2xl p-5 shadow-xl">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-mtg-border">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    {typeCategory}
                  </h3>
                  <span className="text-xs font-bold text-orange-400 bg-[#0F1117] px-2.5 py-0.5 rounded-full border border-mtg-border">
                    {list.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {list.map(dc => (
                    <DeckCardItem key={dc.card.id} deckCard={dc} />
                  ))}
                </div>
              </div>
            );
          })}

        </div>
      )}

      {/* Tab Content 2: Vista Funzionale */}
      {activeTab === 'functions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(cardsByFunction).map(([fnCategory, list]) => {
            if (!list || list.length === 0) return null;
            return (
              <div key={fnCategory} className="bg-mtg-surface border border-mtg-border rounded-2xl p-5 shadow-xl">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-mtg-border">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    Ruolo: <span className="text-orange-400">{fnCategory}</span>
                  </h3>
                  <span className="text-xs font-bold text-slate-300 bg-[#0F1117] px-2.5 py-0.5 rounded-full border border-mtg-border">
                    {list.reduce((sum, item) => sum + item.quantity, 0)} carte
                  </span>
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {list.map(dc => (
                    <DeckCardItem key={dc.card.id} deckCard={dc} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab Content 3: Analisi Strategica */}
      {activeTab === 'strategy' && (
        <StrategyAnalysisView analysis={generatedDeck.strategyAnalysis} />
      )}

      {/* Tab Content 4: Mana Curve & Stats */}
      {activeTab === 'stats' && (
        <ManaCurveChart stats={generatedDeck.stats} />
      )}

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal deck={generatedDeck} onClose={() => setShowExportModal(false)} />
      )}

    </div>
  );
};
