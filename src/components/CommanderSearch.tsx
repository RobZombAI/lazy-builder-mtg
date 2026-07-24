import React, { useState, useEffect } from 'react';
import { Search, Crown, CheckCircle2, Shield, Layers, HelpCircle } from 'lucide-react';
import { useDeck } from '../context/DeckContext';
import { Commander } from '../types/card';

export const CommanderSearch: React.FC = () => {
  const { cardProvider, selectedCommander, setSelectedCommander } = useDeck();
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<Commander[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(false);

  useEffect(() => {
    // Initial fetch of default commanders
    const fetchInitial = async () => {
      const initial = await cardProvider.searchCommanders('Krenko');
      if (initial.length > 0 && !selectedCommander) {
        setResults(initial);
        // Default select Krenko
        setSelectedCommander(initial[0]);
      }
    };
    fetchInitial();
  }, [cardProvider]);

  const handleSearch = async (val: string) => {
    setQuery(val);
    if (!val.trim()) {
      const def = await cardProvider.searchCommanders('');
      setResults(def);
      return;
    }
    setLoading(true);
    try {
      const res = await cardProvider.searchCommanders(val);
      setResults(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const renderManaBadges = (colors: string[]) => {
    if (colors.length === 0) {
      return <span className="px-2 py-0.5 rounded text-[10px] bg-slate-700 text-slate-300 font-bold">C</span>;
    }
    const colorMap: Record<string, string> = {
      W: 'bg-amber-100 text-amber-900 border-amber-300',
      U: 'bg-blue-600 text-white border-blue-400',
      B: 'bg-purple-900 text-purple-100 border-purple-700',
      R: 'bg-red-600 text-white border-red-400',
      G: 'bg-emerald-600 text-white border-emerald-400'
    };
    return colors.map(c => (
      <span key={c} className={`px-2 py-0.5 rounded text-[10px] font-bold border shadow-sm ${colorMap[c] || 'bg-slate-700'}`}>
        {c}
      </span>
    ));
  };

  return (
    <div className="bg-mtg-surface border border-mtg-border rounded-2xl p-6 shadow-xl relative">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
          <Crown className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">1. Scegli il tuo Comandante</h2>
          <p className="text-xs text-slate-400">Cerca la creatura leggendaria attorno a cui costruire il mazzo.</p>
        </div>
      </div>

      {/* Input Search Box */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="w-5 h-5 absolute left-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder="Cerca un comandante (es. Krenko, Atraxa, Lathril...)"
            className="w-full bg-[#0F1117] border border-mtg-border focus:border-orange-500 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-all shadow-inner"
          />
        </div>

        {/* Dropdown Results */}
        {isFocused && results.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-[#1A1D26] border border-mtg-border rounded-xl shadow-2xl z-50 max-h-72 overflow-y-auto divide-y divide-mtg-border">
            {results.map((cmd) => (
              <div
                key={cmd.card.id}
                onMouseDown={() => {
                  setSelectedCommander(cmd);
                  setQuery(cmd.card.name);
                }}
                className="flex items-center justify-between p-3 hover:bg-[#222634] cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={cmd.card.imageUrl}
                    alt={cmd.card.name}
                    className="w-10 h-14 object-cover rounded shadow-md border border-slate-700"
                  />
                  <div>
                    <div className="font-bold text-sm text-white">{cmd.card.name}</div>
                    <div className="text-xs text-slate-400">{cmd.card.typeLine}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {renderManaBadges(cmd.colorIdentity)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Currently Selected Commander Display */}
      {selectedCommander && (
        <div className="mt-6 bg-[#0F1117]/60 border border-orange-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <img
            src={selectedCommander.card.imageUrl}
            alt={selectedCommander.card.name}
            className="w-28 sm:w-32 rounded-lg shadow-xl border border-orange-500/40 hover:scale-105 transition-transform"
          />
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <h3 className="text-xl font-black text-white">{selectedCommander.card.name}</h3>
              <div className="flex space-x-1">{renderManaBadges(selectedCommander.colorIdentity)}</div>
            </div>
            <p className="text-xs font-semibold text-orange-400 mb-2">{selectedCommander.card.typeLine}</p>
            <p className="text-xs text-slate-300 bg-mtg-surface p-3 rounded-lg border border-mtg-border whitespace-pre-line italic leading-relaxed">
              "{selectedCommander.card.oracleText}"
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-medium text-slate-400">
              <span className="px-2 py-1 bg-mtg-surface rounded border border-mtg-border">
                CMC: {selectedCommander.card.cmc}
              </span>
              <span className="px-2 py-1 bg-mtg-surface rounded border border-mtg-border">
                Identità: {selectedCommander.colorIdentity.join(', ') || 'Incolore'}
              </span>
              <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Commander Legale
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
