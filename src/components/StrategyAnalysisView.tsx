import React from 'react';
import { BookOpen, Trophy, Swords, Zap, ShieldAlert, Sparkles, AlertTriangle, ArrowRightLeft } from 'lucide-react';
import { StrategyAnalysis } from '../types/deck';
import { useDeck } from '../context/DeckContext';

interface StrategyAnalysisViewProps {
  analysis: StrategyAnalysis;
}

export const StrategyAnalysisView: React.FC<StrategyAnalysisViewProps> = ({ analysis }) => {
  const { swapCard } = useDeck();

  return (
    <div className="space-y-6">
      
      {/* Overview & Game Plan */}
      <div className="bg-mtg-surface border border-mtg-border rounded-2xl p-6 shadow-xl">
        <h3 className="text-base font-bold text-white flex items-center gap-2 mb-3">
          <BookOpen className="w-5 h-5 text-orange-400" /> Piano di Gioco Generale
        </h3>
        <p className="text-sm text-slate-300 leading-relaxed font-sans bg-[#0F1117] p-4 rounded-xl border border-mtg-border">
          {analysis.overview}
        </p>
      </div>

      {/* Turn Stages (Early, Mid, Late) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-mtg-surface border border-mtg-border rounded-2xl p-5 shadow-xl border-t-4 border-t-emerald-500">
          <h4 className="text-sm font-black text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Zap className="w-4 h-4" /> Turni 1-3 (Inizio)
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">{analysis.earlyGame}</p>
        </div>

        <div className="bg-mtg-surface border border-mtg-border rounded-2xl p-5 shadow-xl border-t-4 border-t-amber-500">
          <h4 className="text-sm font-black text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Swords className="w-4 h-4" /> Turni 4-6 (Metà Game)
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">{analysis.midGame}</p>
        </div>

        <div className="bg-mtg-surface border border-mtg-border rounded-2xl p-5 shadow-xl border-t-4 border-t-purple-500">
          <h4 className="text-sm font-black text-purple-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Trophy className="w-4 h-4" /> Turno 7+ (Chiusura)
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">{analysis.lateGame}</p>
        </div>
      </div>

      {/* Win Conditions & Combos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Win Conditions */}
        <div className="bg-mtg-surface border border-mtg-border rounded-2xl p-6 shadow-xl">
          <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-amber-400" /> Condizioni di Vittoria Principali
          </h3>
          <ul className="space-y-3">
            {analysis.winConditions.map((wincon, idx) => (
              <li key={idx} className="flex items-start space-x-3 text-xs text-slate-200 bg-[#0F1117] p-3 rounded-xl border border-mtg-border">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-[10px] shrink-0">
                  {idx + 1}
                </span>
                <span>{wincon}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Synergies & Combos */}
        <div className="bg-mtg-surface border border-mtg-border rounded-2xl p-6 shadow-xl">
          <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-purple-400" /> Sinergie e Combo Chiave
          </h3>
          <ul className="space-y-3">
            {analysis.synergiesAndCombos.map((syn, idx) => (
              <li key={idx} className="flex items-start space-x-3 text-xs text-slate-200 bg-[#0F1117] p-3 rounded-xl border border-mtg-border">
                <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 font-bold flex items-center justify-center text-[10px] shrink-0">
                  ★
                </span>
                <span>{syn}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Warnings & Substitutions */}
      {analysis.warnings.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 shadow-xl">
          <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" /> Avvisi e Raccomandazioni
          </h3>
          <ul className="space-y-2 text-xs text-amber-200/90 list-disc list-inside">
            {analysis.warnings.map((warn, i) => (
              <li key={i}>{warn}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Replaceable Suggestions */}
      {analysis.replaceableSuggestions.length > 0 && (
        <div className="bg-mtg-surface border border-mtg-border rounded-2xl p-6 shadow-xl">
          <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
            <ArrowRightLeft className="w-5 h-5 text-blue-400" /> Sostituzioni e Alternative Consigliate
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysis.replaceableSuggestions.map((sug, idx) => (
              <div key={idx} className="bg-[#0F1117] border border-mtg-border rounded-xl p-4 flex flex-col justify-between">
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <span className="text-red-400 line-through">{sug.originalCard}</span>
                    <span className="text-slate-500">➔</span>
                    <span className="text-emerald-400">{sug.suggestedCard}</span>
                  </div>
                  <p className="text-xs text-slate-300 italic">{sug.reasoning}</p>
                </div>
                <button
                  type="button"
                  onClick={() => swapCard(sug.originalCard, sug.suggestedCard)}
                  className="w-full py-2 px-3 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" /> Applica Sostituzione Ora
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
