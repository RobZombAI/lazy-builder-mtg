import React, { useState } from 'react';
import { GitFork, Sparkles, ChevronRight, ChevronDown, Flame, Zap, Shield, Trophy } from 'lucide-react';
import { Deck } from '../types/deck';
import { FunctionalCategory } from '../types/card';
import { getCardImageUrl, handleCardImageError } from '../utils/cardImage';

interface SynergyTreeGraphProps {
  deck: Deck;
}

export const SynergyTreeGraph: React.FC<SynergyTreeGraphProps> = ({ deck }) => {
  const commander = deck.commander;

  const branches: { id: string; name: string; icon: any; color: string; categories: FunctionalCategory[] }[] = [
    {
      id: 'tokens',
      name: 'Motore Pedine & Swarm',
      icon: Sparkles,
      color: 'border-orange-500 text-orange-400 bg-orange-500/10',
      categories: ['TokenGenerator', 'Synergy']
    },
    {
      id: 'sac_burn',
      name: 'Sacrificio & Danni Diretti',
      icon: Flame,
      color: 'border-rose-500 text-rose-400 bg-rose-500/10',
      categories: ['SacrificeOutlet', 'Payoff', 'WinCondition']
    },
    {
      id: 'ramp',
      name: 'Accelerazione & Mana Base',
      icon: Zap,
      color: 'border-emerald-500 text-emerald-400 bg-emerald-500/10',
      categories: ['Ramp', 'Tutor']
    },
    {
      id: 'control',
      name: 'Interazioni & Protezioni',
      icon: Shield,
      color: 'border-blue-500 text-blue-400 bg-blue-500/10',
      categories: ['Removal', 'Protection', 'Counterspell', 'BoardWipe']
    }
  ];

  const [expandedBranches, setExpandedBranches] = useState<Record<string, boolean>>({
    tokens: true,
    sac_burn: true,
    ramp: true,
    control: true
  });

  const toggleBranch = (id: string) => {
    setExpandedBranches(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="bg-mtg-surface border border-mtg-border rounded-3xl p-4 sm:p-6 shadow-2xl space-y-6 relative overflow-hidden">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-mtg-border">
        <div>
          <span className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-400 border border-purple-500/30 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider mb-2 inline-block">
            TREND #4: Interactive Tree Hierarchy Graph
          </span>
          <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
            <GitFork className="w-5 h-5 text-purple-400" /> Grafico ad Albero delle Ramificazioni Strategiche
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Gerarchia tattica dal Comandante (Radice) ai Pilasti Tattici (Rami) fino alle Carte (Foglie).
          </p>
        </div>
      </div>

      {/* Tree Visualization Container */}
      <div className="space-y-6">
        
        {/* ROOT NODE: Commander */}
        <div className="flex justify-center">
          <div className="bg-[#0F1117] border-2 border-orange-500/80 rounded-2xl p-3 sm:p-4 shadow-2xl flex items-center space-x-3 sm:space-x-4 max-w-md w-full relative">
            <img
              src={getCardImageUrl(commander.card.imageUrl, commander.card.name)}
              onError={(e) => handleCardImageError(e, commander.card.name)}
              alt={commander.card.name}
              className="w-12 h-16 sm:w-14 sm:h-20 object-cover rounded-xl border border-orange-500 shadow-md shrink-0"
            />
            <div>
              <span className="text-[9px] sm:text-[10px] font-black uppercase text-orange-400 tracking-wider">Radice del Mazzo (Root)</span>
              <h4 className="font-black text-sm sm:text-lg text-white">{commander.card.name}</h4>
              <p className="text-[11px] sm:text-xs text-slate-400">{commander.card.typeLine}</p>
            </div>
          </div>
        </div>

        {/* Root Connector Line */}
        <div className="flex justify-center">
          <div className="w-0.5 h-6 bg-gradient-to-b from-orange-500 to-mtg-border" />
        </div>

        {/* LEVEL 1: Strategic Branches */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {branches.map((branch) => {
            const Icon = branch.icon;
            const isExpanded = expandedBranches[branch.id];

            const branchCards = deck.cards.filter(dc => 
              !dc.card.isLand && branch.categories.includes(dc.categoryByFunction)
            );

            return (
              <div key={branch.id} className="bg-[#0F1117] border border-mtg-border rounded-2xl p-4 shadow-xl space-y-3">
                
                {/* Branch Header Node */}
                <div
                  onClick={() => toggleBranch(branch.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${branch.color}`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5 shrink-0" />
                    <div>
                      <h4 className="font-extrabold text-xs sm:text-sm text-white">{branch.name}</h4>
                      <span className="text-[10px] opacity-80">{branchCards.length} carte in questa ramificazione</span>
                    </div>
                  </div>
                  {isExpanded ? <ChevronDown className="w-5 h-5 text-white shrink-0" /> : <ChevronRight className="w-5 h-5 text-white shrink-0" />}
                </div>

                {/* LEVEL 2: Card Leaves */}
                {isExpanded && (
                  <div className="pl-3 sm:pl-4 border-l-2 border-slate-700/50 space-y-2 pt-1 animate-in fade-in duration-200">
                    {branchCards.map((dc) => (
                      <div
                        key={dc.card.id}
                        className="bg-mtg-surface border border-mtg-border hover:border-orange-500/50 p-2 rounded-xl flex items-center justify-between transition-all group"
                      >
                        <div className="flex items-center space-x-2.5">
                          <img
                            src={getCardImageUrl(dc.card.imageUrl, dc.card.name)}
                            onError={(e) => handleCardImageError(e, dc.card.name)}
                            alt={dc.card.name}
                            className="w-7 h-10 object-cover rounded shadow shrink-0"
                            loading="lazy"
                          />
                          <div>
                            <span className="font-bold text-xs text-white group-hover:text-orange-400 transition-colors block">
                              {dc.card.name}
                            </span>
                            <span className="text-[10px] text-slate-400 italic leading-tight block line-clamp-1">
                              {dc.reasoning}
                            </span>
                          </div>
                        </div>

                        <span className="text-[10px] font-mono font-bold text-slate-300 bg-[#0F1117] px-2 py-0.5 rounded border border-mtg-border shrink-0 ml-2">
                          {dc.card.manaCost || '0'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
};
