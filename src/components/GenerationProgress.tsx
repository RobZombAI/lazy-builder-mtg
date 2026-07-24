import React from 'react';
import { Loader2, Sparkles, ShieldCheck, Zap } from 'lucide-react';

interface GenerationProgressProps {
  currentStep: string;
}

export const GenerationProgress: React.FC<GenerationProgressProps> = ({ currentStep }) => {
  return (
    <div className="fixed inset-0 z-50 bg-[#0F1117]/90 backdrop-blur-md flex flex-col items-center justify-center p-4">
      <div className="bg-[#1A1D26] border border-orange-500/30 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl shadow-orange-500/10">
        
        {/* Animated Glow Icon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-tr from-orange-600 via-amber-500 to-yellow-400 p-0.5 shadow-xl shadow-orange-500/30">
          <div className="w-full h-full bg-[#1A1D26] rounded-[15px] flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-orange-400 animate-spin" />
          </div>
        </div>

        <h3 className="text-xl font-black text-white mb-2 tracking-tight">
          LAZY BUILDER AT WORK
        </h3>

        <p className="text-xs text-orange-400 font-semibold mb-6 uppercase tracking-widest">
          Creazione e Ottimizzazione Mazzo Commander
        </p>

        {/* Current Dynamic Step Log */}
        <div className="bg-[#0F1117] border border-mtg-border rounded-xl p-4 mb-6 shadow-inner">
          <div className="flex items-center justify-center space-x-2 text-sm font-semibold text-slate-200">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>{currentStep}</span>
          </div>
        </div>

        {/* Feature Badges */}
        <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 font-medium">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 100 Carte Exact
          </span>
          <span className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-blue-400" /> Audit Legalità
          </span>
        </div>

      </div>
    </div>
  );
};
