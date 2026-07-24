import React, { useState } from 'react';
import { Lock, Unlock, Trash2, Info, ArrowRightLeft } from 'lucide-react';
import { DeckCard } from '../types/deck';
import { useDeck } from '../context/DeckContext';

interface DeckCardItemProps {
  deckCard: DeckCard;
}

export const DeckCardItem: React.FC<DeckCardItemProps> = ({ deckCard }) => {
  const { toggleLockCard, removeCard } = useDeck();
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const [showImagePreview, setShowImagePreview] = useState<boolean>(false);

  const card = deckCard.card;

  const categoryBadges: Record<string, string> = {
    Ramp: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    Draw: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    Tutor: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    Removal: 'bg-red-500/10 text-red-400 border-red-500/30',
    Protection: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    TokenGenerator: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    SacrificeOutlet: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    Payoff: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    WinCondition: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    Lands: 'bg-slate-700/30 text-slate-300 border-slate-600'
  };

  return (
    <div className={`group flex items-center justify-between p-2.5 rounded-xl border transition-all relative ${
      deckCard.isLocked 
        ? 'bg-amber-500/5 border-amber-500/40 shadow-sm' 
        : 'bg-[#1A1D26] border-mtg-border hover:border-slate-600'
    }`}>
      
      {/* Left: Quantity, Name & Badges */}
      <div className="flex items-center space-x-3 overflow-hidden">
        <span className="w-6 h-6 flex items-center justify-center rounded-md bg-[#0F1117] border border-mtg-border text-xs font-bold text-slate-300 shrink-0">
          {deckCard.quantity}x
        </span>

        {/* Card Name with Hover Preview Trigger */}
        <div className="relative">
          <span
            onMouseEnter={() => setShowImagePreview(true)}
            onMouseLeave={() => setShowImagePreview(false)}
            className="font-bold text-sm text-white group-hover:text-orange-400 transition-colors cursor-pointer truncate max-w-[160px] sm:max-w-[240px] block"
          >
            {card.name}
          </span>

          {/* Hover Image Preview Tooltip */}
          {showImagePreview && (
            <div className="fixed z-50 pointer-events-none transform -translate-y-1/2 left-auto right-10 top-1/2 hidden sm:block">
              <img
                src={card.imageUrl}
                alt={card.name}
                className="w-52 rounded-xl shadow-2xl border-2 border-orange-500 animate-in fade-in zoom-in-95 duration-150"
              />
            </div>
          )}
        </div>

        {/* Function Category Badge */}
        <span className={`hidden md:inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${categoryBadges[deckCard.categoryByFunction] || 'bg-slate-700 text-slate-300'}`}>
          {deckCard.categoryByFunction}
        </span>
      </div>

      {/* Right: Mana Cost, Reasoning Info & Actions */}
      <div className="flex items-center space-x-2 shrink-0">
        {card.manaCost && (
          <span className="text-xs font-mono font-bold text-slate-300 bg-[#0F1117] px-2 py-0.5 rounded border border-mtg-border">
            {card.manaCost}
          </span>
        )}

        {/* Reasoning Info Tooltip Trigger */}
        <div className="relative">
          <button
            type="button"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-orange-400 hover:bg-[#0F1117] transition-colors"
            title="Motivazione inclusione"
          >
            <Info className="w-4 h-4" />
          </button>

          {showTooltip && (
            <div className="absolute right-0 bottom-full mb-2 w-64 bg-[#0F1117] border border-orange-500/40 text-xs text-slate-200 p-3 rounded-xl shadow-2xl z-50 leading-relaxed">
              <div className="font-bold text-orange-400 mb-1">{card.name}</div>
              <p className="italic text-slate-300">{deckCard.reasoning}</p>
            </div>
          )}
        </div>

        {/* Lock / Unlock Card Button */}
        <button
          type="button"
          onClick={() => toggleLockCard(card.normalizedName)}
          className={`p-1.5 rounded-lg border transition-all ${
            deckCard.isLocked
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
              : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-[#0F1117]'
          }`}
          title={deckCard.isLocked ? 'Carta bloccata (rimarrà fissa durante la rigenerazione)' : 'Blocca carta'}
        >
          {deckCard.isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
        </button>

        {/* Remove Card Button */}
        {!deckCard.isLocked && (
          <button
            type="button"
            onClick={() => removeCard(card.normalizedName)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Rimuovi dal mazzo"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

    </div>
  );
};
