import React, { useState, useEffect } from 'react';
import { Database, Download, CheckCircle2, RefreshCw, AlertCircle, X, ShieldCheck } from 'lucide-react';
import { DbSyncService, DbSyncProgress } from '../services/cardData/DbSyncService';

interface DbSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DbSyncModal: React.FC<DbSyncModalProps> = ({ isOpen, onClose }) => {
  const [metadata, setMetadata] = useState<{ lastUpdatedDate?: string; totalCards?: number } | null>(null);
  const [progress, setProgress] = useState<DbSyncProgress>({
    status: 'idle',
    progressPercent: 0,
    message: ''
  });

  useEffect(() => {
    if (isOpen) {
      DbSyncService.getMetadata().then(setMetadata);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartSync = () => {
    DbSyncService.downloadAndSyncLocalDb((prog) => {
      setProgress(prog);
      if (prog.status === 'completed') {
        DbSyncService.getMetadata().then(setMetadata);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#1A1D26] border border-mtg-border rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-mtg-border">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Gestione Database Locale MTG</h3>
              <p className="text-xs text-slate-400">Scegli quando aggiornare le 31.000+ carte offline.</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-mtg-surface transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current DB Info */}
        <div className="bg-[#0F1117] border border-mtg-border rounded-2xl p-4 space-y-3">
          <span className="text-xs font-black uppercase text-emerald-400 tracking-wider block">Stato del Database Locale</span>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block">Ultimo Aggiornamento:</span>
              <span className="font-extrabold text-white">{metadata?.lastUpdatedDate || 'Database pre-installato v1.0'}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Carte Commander Legali:</span>
              <span className="font-extrabold text-emerald-300">{metadata?.totalCards ? metadata.totalCards.toLocaleString() : '31,705'} carte</span>
            </div>
          </div>
        </div>

        {/* Sync Progress UI */}
        {progress.status !== 'idle' && (
          <div className="space-y-3 bg-mtg-surface p-4 rounded-2xl border border-mtg-border">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-white flex items-center gap-2">
                {progress.status === 'downloading' || progress.status === 'parsing' || progress.status === 'saving' ? (
                  <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin" />
                ) : progress.status === 'completed' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                )}
                {progress.message}
              </span>
              <span className="text-emerald-400 font-mono">{progress.progressPercent}%</span>
            </div>

            <div className="w-full bg-[#0F1117] h-2.5 rounded-full overflow-hidden border border-mtg-border">
              <div
                style={{ width: `${progress.progressPercent}%` }}
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleStartSync}
            disabled={progress.status === 'downloading' || progress.status === 'parsing' || progress.status === 'saving'}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:opacity-50 text-white font-black text-xs shadow-lg shadow-emerald-500/20 border border-emerald-400/30 flex items-center justify-center space-x-2 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Scarica & Aggiorna DB Ora (Live Scryfall)</span>
          </button>

          <button
            onClick={onClose}
            className="py-3 px-4 rounded-xl bg-mtg-surface border border-mtg-border text-slate-300 hover:text-white font-bold text-xs"
          >
            Chiudi
          </button>
        </div>

      </div>
    </div>
  );
};
