import React, { useState } from 'react';
import { X, Copy, Download, Check } from 'lucide-react';
import { Deck } from '../types/deck';
import { DeckExporter } from '../services/exporter/DeckExporter';

interface ExportModalProps {
  deck: Deck;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ deck, onClose }) => {
  const [activeTab, setActiveTab] = useState<'clipboard' | 'grouped' | 'json' | 'csv'>('clipboard');
  const [copied, setCopied] = useState<boolean>(false);

  const getExportText = (): string => {
    switch (activeTab) {
      case 'clipboard':
        return DeckExporter.toClipboardFormat(deck);
      case 'grouped':
        return DeckExporter.toTypeGroupedFormat(deck);
      case 'json':
        return DeckExporter.toJsonFormat(deck);
      case 'csv':
        return DeckExporter.toCsvFormat(deck);
      default:
        return '';
    }
  };

  const textContent = getExportText();

  const handleCopy = () => {
    navigator.clipboard.writeText(textContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = activeTab === 'json' ? 'json' : activeTab === 'csv' ? 'csv' : 'txt';
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${deck.commander.card.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_deck.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0F1117]/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#1A1D26] border border-mtg-border rounded-3xl max-w-2xl w-full p-6 shadow-2xl flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-mtg-border mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            Esporta Mazzo ({deck.commander.card.name})
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-mtg-surface transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format Selector Tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { id: 'clipboard', label: 'Copia Standard (Moxfield/Archidekt)' },
            { id: 'grouped', label: 'Raggruppato per Tipo (TXT)' },
            { id: 'json', label: 'Formato JSON' },
            { id: 'csv', label: 'Formato CSV' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                activeTab === t.id
                  ? 'bg-orange-500/20 text-orange-400 border-orange-500/40'
                  : 'bg-[#0F1117] text-slate-400 border-mtg-border hover:text-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Text Area Preview */}
        <div className="flex-1 bg-[#0F1117] border border-mtg-border rounded-xl p-4 overflow-y-auto font-mono text-xs text-slate-300 mb-4 whitespace-pre leading-relaxed shadow-inner">
          {textContent}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            onClick={handleCopy}
            className="px-4 py-2.5 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/40 text-xs font-bold transition-all flex items-center gap-2"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copiato negli appunti!' : 'Copia negli appunti'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-lg"
          >
            <Download className="w-4 h-4" />
            <span>Scarica File</span>
          </button>
        </div>

      </div>
    </div>
  );
};
