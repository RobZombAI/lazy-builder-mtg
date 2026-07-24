import React from 'react';
import { RefreshCw, ArrowRight, Flame, Trophy, CheckCircle2 } from 'lucide-react';
import { ComboChain } from '../types/synergy';

interface ComboFlowchartViewProps {
  chains: ComboChain[];
}

export const ComboFlowchartView: React.FC<ComboFlowchartViewProps> = ({ chains }) => {
  if (chains.length === 0) {
    return (
      <div className="bg-mtg-surface border border-mtg-border rounded-3xl p-8 text-center text-slate-400">
        <Flame className="w-8 h-8 text-slate-600 mx-auto mb-2" />
        <p className="text-xs font-semibold">Nessuna combo infinita o motore d'impatto critico registrato per questa configurazione.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {chains.map((chain) => (
        <div key={chain.id} className="bg-mtg-surface border border-mtg-border rounded-3xl p-6 shadow-2xl relative overflow-hidden">
          
          {/* Top Header Badge */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-mtg-border">
            <div>
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/30 mb-2 inline-block">
                {chain.type === 'infinite' ? 'Combo Loop Infinito' : 'Motore di Vittoria (Wincon Engine)'}
              </span>
              <h3 className="text-lg font-black text-white">{chain.title}</h3>
            </div>

            <div className="flex items-center space-x-2 text-xs font-bold text-slate-300">
              <Flame className="w-4 h-4 text-orange-400" />
              <span>Carte coinvolte: {chain.cardsInvolved.join(' + ')}</span>
            </div>
          </div>

          {/* Interactive Steps Diagram Flow */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 relative">
            {chain.steps.map((step, idx) => (
              <div key={idx} className="bg-[#0F1117] border border-mtg-border rounded-2xl p-5 shadow-xl flex flex-col justify-between relative group hover:border-orange-500/50 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 font-extrabold flex items-center justify-center text-xs">
                      {step.stepNumber}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">Passaggio {step.stepNumber}</span>
                  </div>
                  <h4 className="font-extrabold text-sm text-white mb-2 group-hover:text-orange-400 transition-colors">
                    {step.cardName}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed italic">
                    "{step.action}"
                  </p>
                </div>

                {idx < chain.steps.length - 1 && (
                  <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-20">
                    <div className="w-6 h-6 rounded-full bg-mtg-surface border border-mtg-border flex items-center justify-center shadow">
                      <ArrowRight className="w-3.5 h-3.5 text-orange-400" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Final Result Box */}
          <div className="bg-gradient-to-r from-emerald-500/10 via-amber-500/10 to-transparent border border-emerald-500/30 rounded-2xl p-4 flex items-center space-x-3">
            <Trophy className="w-6 h-6 text-amber-400 shrink-0" />
            <div>
              <span className="text-xs font-black text-emerald-400 uppercase tracking-wider block">Risultato Finale del Loop</span>
              <p className="text-xs font-bold text-slate-100">{chain.result}</p>
            </div>
          </div>

        </div>
      ))}
    </div>
  );
};
