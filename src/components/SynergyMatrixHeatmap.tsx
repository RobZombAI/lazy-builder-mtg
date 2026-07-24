import React, { useState } from 'react';
import { Grid, Flame, Sparkles, CheckCircle2, Shield } from 'lucide-react';
import { DeckSynergyReport } from '../types/synergy';

interface SynergyMatrixHeatmapProps {
  report: DeckSynergyReport;
}

export const SynergyMatrixHeatmap: React.FC<SynergyMatrixHeatmapProps> = ({ report }) => {
  const [selectedPair, setSelectedPair] = useState<{ cardA: string; cardB: string; desc: string; score: number } | null>(null);

  const { nodes, links } = report;

  // Filter top 10 key cards for matrix grid
  const keyNodes = nodes.slice(0, 10);

  // Build matrix lookup
  const getSynergyScore = (idA: string, idB: string) => {
    if (idA === idB) return { score: 100, desc: 'Stessa carta', type: 'self' };
    const link = links.find(l => (l.sourceId === idA && l.targetId === idB) || (l.sourceId === idB && l.targetId === idA));
    if (!link) return { score: 10, desc: 'Sinergia di base nella curva', type: 'base' };
    if (link.strength === 'combo') return { score: 98, desc: link.description, type: 'combo' };
    if (link.strength === 'high') return { score: 85, desc: link.description, type: 'high' };
    return { score: 65, desc: link.description, type: 'medium' };
  };

  const getHeatmapColor = (score: number) => {
    if (score === 100) return 'bg-slate-800 text-slate-500';
    if (score >= 90) return 'bg-gradient-to-r from-red-600 to-rose-500 text-white font-black shadow-md shadow-red-500/20';
    if (score >= 80) return 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-extrabold';
    if (score >= 60) return 'bg-blue-600/30 text-blue-300 font-semibold border border-blue-500/30';
    return 'bg-[#0F1117] text-slate-600 border border-mtg-border/50';
  };

  return (
    <div className="bg-mtg-surface border border-mtg-border rounded-3xl p-6 shadow-2xl space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-mtg-border">
        <div>
          <span className="px-3 py-1 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-400 border border-amber-500/30 rounded-full text-xs font-black uppercase tracking-wider mb-2 inline-block">
            TREND #2: Interactive Matrix & Heatmap Grid
          </span>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <Grid className="w-5 h-5 text-amber-400" /> Mappa Termica delle Sinergie a Matrice
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Clicca sulle celle della matrice per analizzare la forza dell'interazione tra qualsiasi coppia di carte.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-bold text-slate-300">
          <span className="px-2.5 py-1 rounded bg-red-500/20 text-red-400 border border-red-500/30">90-100: Combo</span>
          <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">80-89: Sinergia Alta</span>
        </div>
      </div>

      {/* Heatmap Matrix Grid */}
      <div className="overflow-x-auto pb-2">
        <table className="w-full text-center border-collapse">
          <thead>
            <tr>
              <th className="p-2 text-xs font-bold text-slate-400 text-left">Carte</th>
              {keyNodes.map((n, i) => (
                <th key={n.id} className="p-2 text-[10px] font-mono font-bold text-slate-300 truncate max-w-[70px]" title={n.name}>
                  {n.name.substring(0, 6)}..
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {keyNodes.map((rowNode) => (
              <tr key={rowNode.id} className="border-t border-mtg-border/50">
                <td className="p-2 text-xs font-bold text-slate-200 text-left truncate max-w-[140px]" title={rowNode.name}>
                  {rowNode.name}
                </td>
                {keyNodes.map((colNode) => {
                  const syn = getSynergyScore(rowNode.id, colNode.id);
                  const isSelected = selectedPair?.cardA === rowNode.name && selectedPair?.cardB === colNode.name;
                  return (
                    <td
                      key={colNode.id}
                      onClick={() => setSelectedPair({ cardA: rowNode.name, cardB: colNode.name, desc: syn.desc, score: syn.score })}
                      className={`p-2 text-xs cursor-pointer transition-all hover:scale-105 ${getHeatmapColor(syn.score)} ${isSelected ? 'ring-2 ring-white z-10' : ''}`}
                    >
                      {syn.score}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Selected Pair Detail Box */}
      {selectedPair && (
        <div className="bg-[#0F1117] border border-amber-500/40 rounded-2xl p-4 text-xs shadow-xl animate-in fade-in duration-150">
          <div className="flex items-center justify-between mb-2">
            <span className="font-extrabold text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Interazione: {selectedPair.cardA} ↔ {selectedPair.cardB}
            </span>
            <span className="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-black border border-amber-500/30">
              Punteggio Sinergia: {selectedPair.score}/100
            </span>
          </div>
          <p className="text-slate-300 italic bg-mtg-surface p-3 rounded-xl border border-mtg-border">
            "{selectedPair.desc}"
          </p>
        </div>
      )}

    </div>
  );
};
