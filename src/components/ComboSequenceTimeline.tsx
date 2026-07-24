import React, { useState } from 'react';
import { Flame, Play, RotateCcw, CheckCircle2, ArrowRight, Zap, Trophy } from 'lucide-react';
import { ComboChain } from '../types/synergy';

interface ComboSequenceTimelineProps {
  chains: ComboChain[];
}

export const ComboSequenceTimeline: React.FC<ComboSequenceTimelineProps> = ({ chains }) => {
  const [activeStepMap, setActiveStepMap] = useState<Record<string, number>>({});

  if (chains.length === 0) {
    return (
      <div className="bg-mtg-surface border border-mtg-border rounded-3xl p-8 text-center text-slate-400">
        <Flame className="w-8 h-8 text-slate-600 mx-auto mb-2" />
        <p className="text-xs font-semibold">Nessun loop combo registrato per questa combinazione.</p>
      </div>
    );
  }

  const advanceStep = (chainId: string, maxSteps: number) => {
    setActiveStepMap(prev => {
      const current = prev[chainId] || 1;
      const next = current >= maxSteps ? 1 : current + 1;
      return { ...prev, [chainId]: next };
    });
  };

  return (
    <div className="space-y-6">
      {chains.map((chain) => {
        const activeStep = activeStepMap[chain.id] || 1;

        return (
          <div key={chain.id} className="bg-mtg-surface border border-mtg-border rounded-3xl p-6 shadow-2xl space-y-6 relative overflow-hidden">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-mtg-border">
              <div>
                <span className="px-3 py-1 bg-gradient-to-r from-rose-500/20 to-orange-500/20 text-rose-400 border border-rose-500/30 rounded-full text-xs font-black uppercase tracking-wider mb-2 inline-block">
                  TREND #3: Interactive Sequence Timeline Trigger
                </span>
                <h3 className="text-xl font-black text-white">{chain.title}</h3>
              </div>

              {/* Step Advance Interactive Button */}
              <button
                onClick={() => advanceStep(chain.id, chain.steps.length)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-orange-500 hover:from-rose-500 hover:to-orange-400 text-white text-xs font-black shadow-lg shadow-rose-500/20 border border-rose-400/30 transition-all flex items-center space-x-2"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Simula Passaggio Sequenza ({activeStep}/{chain.steps.length})</span>
              </button>
            </div>

            {/* Timeline Progress Bar */}
            <div className="relative pt-4">
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-[#0F1117] border border-mtg-border">
                <div
                  style={{ width: `${(activeStep / chain.steps.length) * 100}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-rose-500 to-amber-400 transition-all duration-500"
                />
              </div>

              {/* Interactive Timeline Step Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {chain.steps.map((step) => {
                  const isActive = step.stepNumber === activeStep;
                  const isPassed = step.stepNumber < activeStep;

                  return (
                    <div
                      key={step.stepNumber}
                      className={`p-5 rounded-2xl border transition-all duration-300 ${
                        isActive
                          ? 'bg-rose-500/10 border-rose-500 shadow-xl scale-[1.02] ring-2 ring-rose-500/30'
                          : isPassed
                          ? 'bg-[#0F1117] border-emerald-500/40 opacity-90'
                          : 'bg-[#0F1117] border-mtg-border opacity-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className={`w-7 h-7 rounded-full font-black text-xs flex items-center justify-center ${
                          isActive
                            ? 'bg-rose-500 text-white shadow'
                            : isPassed
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {isPassed ? <CheckCircle2 className="w-4 h-4" /> : step.stepNumber}
                        </span>
                        <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Step {step.stepNumber}</span>
                      </div>

                      <h4 className="font-black text-sm text-white mb-2">{step.cardName}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed italic">"{step.action}"</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Outcome */}
            <div className="bg-gradient-to-r from-emerald-500/10 via-amber-500/10 to-transparent border border-emerald-500/30 rounded-2xl p-4 flex items-center space-x-3">
              <Trophy className="w-6 h-6 text-amber-400 shrink-0" />
              <div>
                <span className="text-xs font-black text-emerald-400 uppercase tracking-wider block">Esito Finale del Loop</span>
                <p className="text-xs font-bold text-slate-100">{chain.result}</p>
              </div>
            </div>

          </div>
        );
      })}
    </div>
  );
};
