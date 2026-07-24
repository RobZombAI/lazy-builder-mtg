import React from 'react';
import { BarChart3, PieChart } from 'lucide-react';
import { DeckStats } from '../types/deck';

interface ManaCurveChartProps {
  stats: DeckStats;
}

export const ManaCurveChart: React.FC<ManaCurveChartProps> = ({ stats }) => {
  const curveEntries = Object.entries(stats.manaCurve); // 0, 1, 2, 3, 4, 5, 6
  const maxCount = Math.max(...Object.values(stats.manaCurve), 1);

  const colors = [
    { code: 'W', name: 'Bianco', bg: 'bg-amber-100 text-amber-900' },
    { code: 'U', name: 'Blu', bg: 'bg-blue-600 text-white' },
    { code: 'B', name: 'Nero', bg: 'bg-purple-900 text-purple-100' },
    { code: 'R', name: 'Rosso', bg: 'bg-red-600 text-white' },
    { code: 'G', name: 'Verde', bg: 'bg-emerald-600 text-white' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* Mana Curve Bar Chart */}
      <div className="bg-mtg-surface border border-mtg-border rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-orange-400" /> Curva di Mana (CMC)
          </h3>
          <span className="text-xs font-semibold text-slate-400 bg-[#0F1117] px-3 py-1 rounded-lg border border-mtg-border">
            Avg CMC: <strong className="text-orange-400">{stats.avgCmc}</strong>
          </span>
        </div>

        <div className="flex items-end justify-between gap-2 h-44 pt-6 px-2">
          {curveEntries.map(([cmc, count]) => {
            const heightPercent = Math.round((count / maxCount) * 100);
            return (
              <div key={cmc} className="flex-1 flex flex-col items-center h-full justify-end group">
                <span className="text-xs font-bold text-slate-300 mb-2 group-hover:text-orange-400 transition-colors">
                  {count}
                </span>
                <div className="w-full bg-[#0F1117] rounded-t-lg h-full flex items-end p-0.5">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full bg-gradient-to-t from-orange-600 to-amber-400 rounded-t-md transition-all duration-500 group-hover:from-orange-500 group-hover:to-yellow-300 shadow-md"
                  />
                </div>
                <span className="text-xs font-mono font-bold text-slate-400 mt-2">
                  {cmc === '6' ? '6+' : cmc}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Color Distribution & Metrics */}
      <div className="bg-mtg-surface border border-mtg-border rounded-2xl p-6 shadow-xl flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
            <PieChart className="w-5 h-5 text-amber-400" /> Ripartizione Colori e Risorse
          </h3>

          <div className="space-y-3 mb-6">
            {colors.map(col => {
              const count = stats.colorDistribution[col.code] || 0;
              if (count === 0 && !stats.coloredSourcesCount[col.code]) return null;
              return (
                <div key={col.code} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 font-bold text-slate-200">
                    <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-black ${col.bg}`}>
                      {col.code}
                    </span>
                    {col.name}
                  </span>
                  <div className="flex items-center space-x-4">
                    <span className="text-slate-400">Magie: <strong className="text-white">{count}</strong></span>
                    <span className="text-slate-400">Terre Colorate: <strong className="text-emerald-400">{stats.coloredSourcesCount[col.code] || 0}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tactical Balance Indicators */}
        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-mtg-border text-center text-xs">
          <div className="bg-[#0F1117] p-3 rounded-xl border border-mtg-border">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Terre</span>
            <span className="text-base font-black text-emerald-400">{stats.landCount}</span>
          </div>
          <div className="bg-[#0F1117] p-3 rounded-xl border border-mtg-border">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Ramp</span>
            <span className="text-base font-black text-amber-400">{stats.rampCount}</span>
          </div>
          <div className="bg-[#0F1117] p-3 rounded-xl border border-mtg-border">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Pescaggio</span>
            <span className="text-base font-black text-blue-400">{stats.drawCount}</span>
          </div>
        </div>
      </div>

    </div>
  );
};
