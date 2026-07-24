import React, { useState } from 'react';
import { Sparkles, Grid, Play, GitFork, Layers } from 'lucide-react';
import { Deck } from '../types/deck';
import { SynergyAnalyzer } from '../services/analytics/SynergyAnalyzer';
import { SynergyErgonomicGraph } from './SynergyErgonomicGraph';
import { SynergyMatrixHeatmap } from './SynergyMatrixHeatmap';
import { ComboSequenceTimeline } from './ComboSequenceTimeline';
import { SynergyTreeGraph } from './SynergyTreeGraph';

interface InteractiveSynergyReportProps {
  deck: Deck;
}

export const InteractiveSynergyReport: React.FC<InteractiveSynergyReportProps> = ({ deck }) => {
  const [activeTrend, setActiveTrend] = useState<'ergonomic' | 'tree' | 'heatmap' | 'timeline'>('ergonomic');

  const report = SynergyAnalyzer.analyzeDeck(deck);

  return (
    <div className="space-y-6">
      
      {/* Top Trend Selector Navigation */}
      <div className="bg-mtg-surface border border-mtg-border rounded-2xl p-2 flex flex-wrap gap-2 shadow-xl">
        <button
          onClick={() => setActiveTrend('ergonomic')}
          className={`flex-1 min-w-[180px] py-3 px-4 rounded-xl font-black text-xs flex items-center justify-center space-x-2 border transition-all ${
            activeTrend === 'ergonomic'
              ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white border-orange-400/50 shadow-lg shadow-orange-500/20'
              : 'bg-[#0F1117] text-slate-400 border-mtg-border hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          <span>TREND 1: Ergonomico Rete</span>
        </button>

        <button
          onClick={() => setActiveTrend('tree')}
          className={`flex-1 min-w-[180px] py-3 px-4 rounded-xl font-black text-xs flex items-center justify-center space-x-2 border transition-all ${
            activeTrend === 'tree'
              ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white border-purple-400/50 shadow-lg shadow-purple-500/20'
              : 'bg-[#0F1117] text-slate-400 border-mtg-border hover:text-slate-200'
          }`}
        >
          <GitFork className="w-4 h-4 text-purple-300" />
          <span>TREND 4: Albero Tattico</span>
        </button>

        <button
          onClick={() => setActiveTrend('heatmap')}
          className={`flex-1 min-w-[180px] py-3 px-4 rounded-xl font-black text-xs flex items-center justify-center space-x-2 border transition-all ${
            activeTrend === 'heatmap'
              ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-white border-amber-400/50 shadow-lg shadow-amber-500/20'
              : 'bg-[#0F1117] text-slate-400 border-mtg-border hover:text-slate-200'
          }`}
        >
          <Grid className="w-4 h-4 text-yellow-300" />
          <span>TREND 2: Matrice Heatmap</span>
        </button>

        <button
          onClick={() => setActiveTrend('timeline')}
          className={`flex-1 min-w-[180px] py-3 px-4 rounded-xl font-black text-xs flex items-center justify-center space-x-2 border transition-all ${
            activeTrend === 'timeline'
              ? 'bg-gradient-to-r from-rose-600 to-orange-500 text-white border-rose-400/50 shadow-lg shadow-rose-500/20'
              : 'bg-[#0F1117] text-slate-400 border-mtg-border hover:text-slate-200'
          }`}
        >
          <Play className="w-4 h-4 text-rose-300" />
          <span>TREND 3: Timeline Sequenza</span>
        </button>
      </div>

      {/* Render Active Trend Visualization */}
      {activeTrend === 'ergonomic' && (
        <SynergyErgonomicGraph report={report} />
      )}

      {activeTrend === 'tree' && (
        <SynergyTreeGraph deck={deck} />
      )}

      {activeTrend === 'heatmap' && (
        <SynergyMatrixHeatmap report={report} />
      )}

      {activeTrend === 'timeline' && (
        <ComboSequenceTimeline chains={report.comboChains} />
      )}

    </div>
  );
};
