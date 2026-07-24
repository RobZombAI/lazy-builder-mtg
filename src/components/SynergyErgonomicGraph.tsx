import React, { useState } from 'react';
import { Sparkles, ZoomIn, ZoomOut, RotateCcw, Zap, Flame, Eye, Layers } from 'lucide-react';
import { DeckSynergyReport, SynergyNode } from '../types/synergy';
import { getCardImageUrl, handleCardImageError } from '../utils/cardImage';

interface SynergyErgonomicGraphProps {
  report: DeckSynergyReport;
}

export const SynergyErgonomicGraph: React.FC<SynergyErgonomicGraphProps> = ({ report }) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const { nodes, links } = report;

  const commanderNode = nodes.find(n => n.typeCategory === 'Commander') || nodes[0];
  const otherNodes = nodes.filter(n => n.id !== commanderNode.id).slice(0, 16);
  const displayNodes = [commanderNode, ...otherNodes];

  const filteredNodes = categoryFilter === 'all'
    ? displayNodes
    : displayNodes.filter(n => n.typeCategory === 'Commander' || n.functionalCategory === categoryFilter);

  const displayNodeIds = new Set(filteredNodes.map(n => n.id));
  const displayLinks = links.filter(l => displayNodeIds.has(l.sourceId) && displayNodeIds.has(l.targetId));

  // Ergonomic layout bounds
  const width = 850;
  const height = 560;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = 220;

  const nodePositions: Record<string, { x: number; y: number }> = {};
  nodePositions[commanderNode.id] = { x: centerX, y: centerY };

  const nonCmdFiltered = filteredNodes.filter(n => n.id !== commanderNode.id);
  nonCmdFiltered.forEach((node, index) => {
    const angle = (index / nonCmdFiltered.length) * 2 * Math.PI - Math.PI / 2;
    nodePositions[node.id] = {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  });

  const selectedNode = displayNodes.find(n => n.id === selectedNodeId);
  const connectedLinks = selectedNodeId
    ? displayLinks.filter(l => l.sourceId === selectedNodeId || l.targetId === selectedNodeId)
    : [];

  const connectedNodeIds = new Set(
    connectedLinks.flatMap(l => [l.sourceId, l.targetId])
  );

  return (
    <div className="bg-mtg-surface border border-mtg-border rounded-3xl p-6 shadow-2xl space-y-6 relative overflow-hidden">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-mtg-border">
        <div>
          <span className="px-3 py-1 bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-400 border border-orange-500/30 rounded-full text-xs font-black uppercase tracking-wider mb-2 inline-block">
            TREND #1: Rete Sinergica Ergonomica (100% Anteprime Carte)
          </span>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-400" /> Rete di Carte Ergonomica & Card Artwork
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Ogni carta mostra la figura reale. Clicca sui nodi per evidenziare le sinergie dirette.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2">
          <div className="flex bg-[#0F1117] p-1 rounded-xl border border-mtg-border text-xs font-semibold">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-slate-200 px-2 py-1 outline-none text-xs"
            >
              <option value="all" className="bg-[#1A1D26]">Tutte le Categorie</option>
              <option value="TokenGenerator" className="bg-[#1A1D26]">Pedine</option>
              <option value="SacrificeOutlet" className="bg-[#1A1D26]">Sacrifici</option>
              <option value="Ramp" className="bg-[#1A1D26]">Ramp</option>
              <option value="Draw" className="bg-[#1A1D26]">Pescaggio</option>
            </select>
          </div>

          <div className="flex bg-[#0F1117] p-1 rounded-xl border border-mtg-border text-xs">
            <button
              onClick={() => setZoomLevel(prev => Math.min(1.3, prev + 0.1))}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-mtg-surface transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-mtg-surface transition-colors"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(prev => Math.max(0.7, prev - 0.1))}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-mtg-surface transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Canvas Layer Container */}
      <div className="relative bg-[#0F1117] border border-mtg-border rounded-2xl p-4 h-[560px] shadow-inner overflow-hidden flex items-center justify-center">
        
        <div
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
          className="relative w-[850px] h-[540px] transition-transform duration-300 select-none"
        >
          {/* SVG Connector Lines Layer */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            {displayLinks.map((link, idx) => {
              const posA = nodePositions[link.sourceId];
              const posB = nodePositions[link.targetId];
              if (!posA || !posB) return null;

              const isHighlighted = selectedNodeId && (link.sourceId === selectedNodeId || link.targetId === selectedNodeId);
              const strokeColor = link.strength === 'combo' ? '#EF4444' : link.strength === 'high' ? '#F59E0B' : '#3B82F6';
              const opacity = selectedNodeId ? (isHighlighted ? 1 : 0.12) : 0.65;

              return (
                <line
                  key={`${link.sourceId}-${link.targetId}-${idx}`}
                  x1={posA.x}
                  y1={posA.y}
                  x2={posB.x}
                  y2={posB.y}
                  stroke={strokeColor}
                  strokeWidth={isHighlighted ? 3.5 : 1.8}
                  strokeOpacity={opacity}
                  strokeDasharray={link.strength === 'combo' ? '5,5' : 'none'}
                />
              );
            })}
          </svg>

          {/* HTML Card Nodes Layer with Guaranteed 100% Image Loading */}
          {filteredNodes.map((node) => {
            const pos = nodePositions[node.id];
            if (!pos) return null;

            const isCommander = node.typeCategory === 'Commander';
            const isSelected = selectedNodeId === node.id;
            const isConnected = connectedNodeIds.has(node.id);

            const cardW = isCommander ? 86 : 68;
            const cardH = isCommander ? 116 : 90;
            const opacity = selectedNodeId ? (isSelected || isConnected ? 1 : 0.25) : 1;

            return (
              <div
                key={node.id}
                style={{
                  left: `${pos.x - cardW / 2}px`,
                  top: `${pos.y - cardH / 2}px`,
                  width: `${cardW}px`,
                  height: `${cardH}px`,
                  opacity
                }}
                onClick={() => setSelectedNodeId(isSelected ? null : node.id)}
                className={`absolute z-10 rounded-xl cursor-pointer transition-all duration-200 p-1 flex flex-col justify-between shadow-2xl border ${
                  isCommander
                    ? 'bg-[#1A1D26] border-orange-500 ring-2 ring-orange-500/50 scale-105'
                    : isSelected
                    ? 'bg-[#1A1D26] border-amber-400 ring-2 ring-amber-400/50 scale-110'
                    : 'bg-[#1A1D26] border-slate-700 hover:border-orange-500/80 hover:scale-105'
                }`}
              >
                {/* Guaranteed Card Image Thumbnail */}
                <div className="relative w-full h-[70%] rounded-lg overflow-hidden bg-slate-900 shadow">
                  <img
                    src={getCardImageUrl(node.imageUrl)}
                    onError={handleCardImageError}
                    alt={node.name}
                    className="w-full h-full object-cover"
                  />
                  {isCommander && (
                    <span className="absolute top-0.5 right-0.5 px-1 py-0.2 bg-orange-500 text-white rounded text-[8px] font-black uppercase">
                      CMD
                    </span>
                  )}
                </div>

                {/* Card Name Banner */}
                <div className="bg-[#0F1117] px-1 py-0.5 rounded text-center border border-mtg-border/60">
                  <span className="text-[9px] font-extrabold text-white truncate block">
                    {node.name.length > 13 ? `${node.name.substring(0, 11)}..` : node.name}
                  </span>
                </div>
              </div>
            );
          })}

        </div>

      </div>

      {/* Selected Node Details Drawer */}
      {selectedNode && (
        <div className="bg-[#0F1117] border border-orange-500/40 rounded-2xl p-5 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-mtg-border mb-3">
            <div className="flex items-center space-x-3">
              <img
                src={getCardImageUrl(selectedNode.imageUrl)}
                onError={handleCardImageError}
                alt={selectedNode.name}
                className="w-12 h-16 object-cover rounded-lg border border-orange-500 shadow"
              />
              <div>
                <h4 className="font-extrabold text-base text-white">{selectedNode.name}</h4>
                <span className="text-xs text-orange-400 font-semibold">{selectedNode.functionalCategory} • CMC {selectedNode.cmc}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedNodeId(null)}
              className="px-3 py-1.5 rounded-lg bg-mtg-surface border border-mtg-border text-xs font-bold text-slate-300 hover:text-white"
            >
              Chiudi Dettagli
            </button>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-amber-300 block">Sinergie Attive per {selectedNode.name}:</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {connectedLinks.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Nessuna sinergia diretta registrata.</p>
              ) : (
                connectedLinks.map((link, idx) => {
                  const partnerId = link.sourceId === selectedNode.id ? link.targetId : link.sourceId;
                  const partner = displayNodes.find(n => n.id === partnerId);
                  return (
                    <div key={idx} className="bg-mtg-surface p-3 rounded-xl border border-mtg-border text-xs">
                      <span className="text-amber-400 font-bold block mb-1">➔ {partner?.name}</span>
                      <p className="text-slate-300 text-[11px] leading-relaxed">{link.description}</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
