import React from 'react';
import { Gauge, Info } from 'lucide-react';
import { useDeck } from '../context/DeckContext';
import { PowerLevelEngine } from '../services/powerLevel/PowerLevelEngine';

export const PowerLevelSelector: React.FC = () => {
  const { powerLevel, setPowerLevel } = useDeck();
  const currentProfile = PowerLevelEngine.getProfile(powerLevel);

  const levelColors: Record<number, { bg: string; text: string; border: string }> = {
    1: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    2: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
    3: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
    4: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
    5: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' }
  };

  return (
    <div className="bg-mtg-surface border border-mtg-border rounded-2xl p-6 shadow-xl">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
          <Gauge className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">2. Scegli il Livello di Competitività (1-5)</h2>
          <p className="text-xs text-slate-400">Determina la velocità, il costo medio di mana e la presenza di tutor e combo.</p>
        </div>
      </div>

      {/* Buttons 1-5 */}
      <div className="grid grid-cols-5 gap-2 sm:gap-3 mb-4">
        {[1, 2, 3, 4, 5].map((lvl) => {
          const isSelected = powerLevel === lvl;
          const style = levelColors[lvl];
          return (
            <button
              key={lvl}
              type="button"
              onClick={() => setPowerLevel(lvl)}
              className={`py-3 sm:py-4 px-2 rounded-xl flex flex-col items-center justify-center font-extrabold border transition-all ${
                isSelected
                  ? `${style.bg} ${style.text} ${style.border} shadow-lg scale-[1.03] ring-2 ring-orange-500/50`
                  : 'bg-[#0F1117] text-slate-400 border-mtg-border hover:border-slate-600 hover:text-slate-200'
              }`}
            >
              <span className="text-xl sm:text-2xl">{lvl}</span>
              <span className="text-[10px] sm:text-xs font-semibold mt-1 truncate max-w-full">
                {lvl === 1 ? 'Casual' : lvl === 2 ? 'Sinergico' : lvl === 3 ? 'Ottimizzato' : lvl === 4 ? 'Alta Pot.' : 'cEDH'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Level Details Box */}
      <div className={`p-4 rounded-xl border ${levelColors[powerLevel].bg} ${levelColors[powerLevel].border} transition-all`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm font-black ${levelColors[powerLevel].text} flex items-center gap-1.5`}>
            <Info className="w-4 h-4" /> Livello {powerLevel} — {currentProfile.name}
          </span>
          <span className="text-xs font-medium text-slate-300">
            Target CMC: ~{currentProfile.targetAvgCmc}
          </span>
        </div>
        <p className="text-xs text-slate-300 mb-3 leading-relaxed">
          {currentProfile.description}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
          <div className="bg-[#0F1117]/60 p-2 rounded border border-slate-700/50">
            <span className="text-slate-400 block">Tutor suggeriti:</span>
            <span className="font-bold text-white">{currentProfile.recommendedTutors}</span>
          </div>
          <div className="bg-[#0F1117]/60 p-2 rounded border border-slate-700/50">
            <span className="text-slate-400 block">Fast Ramp:</span>
            <span className="font-bold text-white">{currentProfile.recommendedFastRamp}</span>
          </div>
          <div className="bg-[#0F1117]/60 p-2 rounded border border-slate-700/50">
            <span className="text-slate-400 block">Interazioni:</span>
            <span className="font-bold text-white">{currentProfile.recommendedInteractionCount}</span>
          </div>
          <div className="bg-[#0F1117]/60 p-2 rounded border border-slate-700/50">
            <span className="text-slate-400 block">Combo Compatte:</span>
            <span className={`font-bold ${currentProfile.allowCompactCombos ? 'text-emerald-400' : 'text-slate-500'}`}>
              {currentProfile.allowCompactCombos ? 'Consentite' : 'Rifiutate'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
