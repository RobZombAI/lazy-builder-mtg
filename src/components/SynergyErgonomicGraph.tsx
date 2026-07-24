import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ZoomIn, ZoomOut, RotateCcw, Maximize2, Zap, Flame, Eye, Layers } from 'lucide-react';
import { DeckSynergyReport, SynergyNode } from '../types/synergy';
import { getCardImageUrl, handleCardImageError } from '../utils/cardImage';

interface SynergyErgonomicGraphProps {
  report: DeckSynergyReport;
}

export const SynergyErgonomicGraph: React.FC<SynergyErgonomicGraphProps> = ({ report }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [autoScale, setAutoScale] = useState<number>(1);

  const { nodes, links } = report;

  const commanderNode = nodes.find(n => n.typeCategory === 'Commander') || nodes[0];
  const otherNodes = nodes.filter(n => n.id !== commanderNode.id).slice(0, 16);
  const displayNodes = [commanderNode, ...otherNodes];

  const filteredNodes = categoryFilter === 'all'
    ? displayNodes
    : displayNodes.filter(n => n.typeCategory === 'Commander' || n.functionalCategory === categoryFilter);

  const displayNodeIds = new Set(filteredNodes.map(n => n.id));
  const displayLinks = links.filter(l => displayNodeIds.has(l.sourceId) && displayNodeIds.has(l.targetId));

  // Base layout dimensions
  const baseW = 850;
  const baseH = 540;
  const centerX = baseW / 2;
  const centerY = baseH / 2;
  const radius = 210;

  // Auto-fit scale listener for mobile APK displays (Android smartphones & tablets)
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const parentW = containerRef.current.clientWidth - 24; // padding
        const calculatedScale = Math.min(1, Math.max(0.42, parentW / baseW));
        setAutoScale(calculatedScale);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const currentScale = autoScale * zoomLevel;

  return (
    <div className="bg-mtg-surface border border-mtg-border rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4 relative overflow-hidden">
      
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-4 border-b border-mtg-border">
        <div>
          <span className="px-3 py-1 bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-400 border border-orange-500/30 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider mb-1.5 inline-block">
            TREND #1: Rete Ergonomica Mobile Optimized (Android 120Hz)
          </span>
          <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-400" /> Rete Sinergica & Card Thumbnails
          </h3>
        </div>

        {/* Category & Zoom Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">
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
              onClick={() => setZoomLevel(prev => Math.min(1.5, prev + 0.15))}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-mtg-surface transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-mtg-surface transition-colors"
              title="Reset Zoom"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(prev => Math.max(0.6, prev - 0.15))}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-mtg-surface transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* GPU-Accelerated Mobile Viewport Box */}
      <div
        ref={containerRef}
        className="relative bg-[#0F1117] border border-mtg-border rounded-2xl p-2 sm:p-4 shadow-inner overflow-hidden flex justify-center items-center h-[380px] sm:h-[540px] touch-pan-x touch-pan-y"
      >
        <div
          style={{
            width: `${baseW}px`,
            height: `${baseH}px`,
            transform: `scale(${currentScale})`,
            transformOrigin: 'center center'
          }}
          className="relative select-none will-change-transform transform-gpu transition-transform duration-200"
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
                  strokeWidth={isHighlighted ? 4 : 2}
                  strokeOpacity={opacity}
                  strokeDasharray={link.strength === 'combo' ? '6,6' : 'none'}
                />
              );
            })}
          </svg>

          {/* HTML Card Nodes Layer with 100% Mobile Touch Targets */}
          {filteredNodes.map((node) => {
            const pos = nodePositions[node.id];
            if (!pos) return null;

            const isCommander = node.typeCategory === 'Commander';
            const isSelected = selectedNodeId === node.id;
            const isConnected = connectedNodeIds.has(node.id);

            const cardW = isCommander ? 90 : 70;
            const cardH = isCommander ? 122 : 94;
            const opacity = selectedNodeId ? (isSelected || isConnected ? 1 : 0.22) : 1;

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
                    ? 'bg-[#1A1D26] border-orange-500 ring-2 ring-orange-500/60 scale-105'
                    : isSelected
                    ? 'bg-[#1A1D26] border-amber-400 ring-2 ring-amber-400/60 scale-110'
                    : 'bg-[#1A1D26] border-slate-700 hover:border-orange-500/80'
                }`}
              >
                {/* Card Thumbnail Image */}
                <div className="relative w-full h-[72%] rounded-lg overflow-hidden bg-slate-900 shadow">
                  <img
                    src={getCardImageUrl(node.imageUrl, node.name)}
                    onError={(e) => handleCardImageError(e, node.name)}
                    alt={node.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
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
                    {node.name.length > 12 ? `${node.name.substring(0, 10)}..` : node.name}
                  </span>
                </div>
              </div>
            );
          })}

        </div>

      </div>

      {/* Selected Node Details Mobile Bottom Sheet Drawer */}
      {selectedNode && (
        <div className="bg-[#0F1117] border border-orange-500/50 rounded-2xl p-4 shadow-2xl animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-mtg-border mb-3">
            <div className="flex items-center space-x-3">
              <img
                src={getCardImageUrl(selectedNode.imageUrl, selectedNode.name)}
                onError={(e) => handleCardImageError(e, selectedNode.name)}
                alt={selectedNode.name}
                className="w-12 h-16 object-cover rounded-lg border border-orange-500 shadow"
              />
              <div>
                <h4 className="font-extrabold text-sm sm:text-base text-white">{selectedNode.name}</h4>
                <span className="text-xs text-orange-400 font-semibold">{selectedNode.functionalCategory} • CMC {selectedNode.cmc}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedNodeId(null)}
              className="px-3 py-1.5 rounded-lg bg-mtg-surface border border-mtg-border text-xs font-bold text-slate-300 hover:text-white"
            >
              Chiudi
            </button>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-amber-300 block">Sinergie Attive nel Mazzo:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1">
              {connectedLinks.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Nessuna sinergia diretta registrata.</p>
              ) : (
                connectedLinks.map((link, idx) => {
                  const partnerId = link.sourceId === selectedNode.id ? link.targetId : link.sourceId;
                  const partner = displayNodes.find(n => n.id === partnerId);
                  return (
                    <div key={idx} className="bg-mtg-surface p-2.5 rounded-xl border border-mtg-border text-xs">
                      <span className="text-amber-400 font-bold block mb-0.5">➔ {partner?.name}</span>
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
