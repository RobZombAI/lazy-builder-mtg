import React, { useState } from 'react';
import { Sparkles, ShieldCheck, Zap, Database, Cpu, Download } from 'lucide-react';
import { useDeck } from '../context/DeckContext';
import { DbSyncModal } from './DbSyncModal';

export const Header: React.FC = () => {
  const { providerMode, setProviderMode } = useDeck();
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-[#0F1117]/80 border-b border-mtg-border py-4 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-400 p-0.5 shadow-lg shadow-orange-500/20">
            <div className="w-full h-full bg-[#1A1D26] rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-orange-400 animate-pulse" />
            </div>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight font-sans text-white flex items-center gap-2">
              LazyMagic. Deck Generator
              <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 font-semibold tracking-wide uppercase">
                EDH Dual-Engine
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Crea mazzi MTG completi da 100 carte: usa l'Online Scryfall Live o il DB locale 100% offline.
            </p>
          </div>
        </div>

        {/* Status Indicators & Mode Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Provider Switcher */}
          <div className="flex bg-[#0F1117] p-1 rounded-xl border border-mtg-border text-xs font-semibold">
            <button
              onClick={() => setProviderMode('local')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
                providerMode === 'local'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Usa il Database Completo offline salvato in locale"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>DB Locale (Offline)</span>
            </button>

            <button
              onClick={() => setProviderMode('scryfall')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
                providerMode === 'scryfall'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Usa l'API Online Live di Scryfall per essere sempre aggiornato all'ultima espansione"
            >
              <Zap className="w-3.5 h-3.5 text-blue-400" />
              <span>Online (Scryfall Live)</span>
            </button>

            <button
              onClick={() => setProviderMode('demo')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
                providerMode === 'demo'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Usa la fixture di prova integrata"
            >
              <Cpu className="w-3.5 h-3.5 text-amber-400" />
              <span>Demo</span>
            </button>
          </div>

          {/* Sync DB Button */}
          <button
            onClick={() => setIsDbModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-mtg-surface border border-emerald-500/40 hover:border-emerald-400 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-all shadow"
            title="Scarica e aggiorna il Database locale quando hai connessione"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Aggiorna DB Locale</span>
          </button>
        </div>

      </div>

      {/* Sync DB Modal */}
      <DbSyncModal isOpen={isDbModalOpen} onClose={() => setIsDbModalOpen(false)} />
    </header>
  );
};
