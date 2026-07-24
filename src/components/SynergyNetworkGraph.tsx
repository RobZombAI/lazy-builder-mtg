import React, { useState } from 'react';
import { Network, Sparkles, Zap, Flame, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { DeckSynergyReport, SynergyNode, SynergyLink } from '../types/synergy';

interface SynergyNetworkGraphProps {
  report: DeckSynergyReport;
}

export const SynergyNetworkGraph: React.FC<SynergyNetworkGraphProps> = ({ report }) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const { nodes, links } = report;

  // Filter top nodes for crisp graph rendering (up to 16 key nodes)
  const commanderNode = nodes.find(n => n.typeCategory === 'Commander') || nodes[0];
  const otherNodes = nodes.filter(n => n.id !== commanderNode.id).slice(0, 15);
  const displayNodes = [commanderNode, ...otherNodes];
  const displayNodeIds = new Set(displayNodes.map(n => n.id));

  const displayLinks = links.filter(l => displayNodeIds.has(l.sourceId) && displayNodeIds.has(l.targetId));

  // Compute radial positions
  const width = 650;
  const height = 480;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = 180;

  const nodePositions: Record<string, { x: number; y: number }> = {};
  nodePositions[commanderNode.id] = { x: centerX, y: centerY };

  otherNodes.forEach((node, index) => {
    const angle = (index / otherNodes.length) * 2 * Math.PI - Math.PI / 2;
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
    <div className="bg-mtg-surface border border-mtg-border rounded-3xl p-6 shadow-2xl space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-mtg-border">
        <div>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <Network className="w-5 h-5 text-orange-400" /> Grafico di Rete delle Sinergie (Interactive Node Graph)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Clicca su una carta per evidenziare le connessioni tattiche e le sinergie dirette.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-[11px] font-bold">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <Flame className="w-3 h-3" /> Combo Loops
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Sparkles className="w-3 h-3" /> Sinergia Alta
          </span>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        
        <div className="lg:col-span-2 relative bg-[#0F1117] border border-mtg-border rounded-2xl p-4 flex justify-center shadow-inner overflow-hidden">
          
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-h-[460px] select-none">
            
            {/* Draw Links */}
            {displayLinks.map((link, idx) => {
              const sourcePos = nodePositions[link.sourceId];
              const targetPos = nodePositions[link.targetId];
              if (!sourcePos || !targetPos) return null;

              const isHighlighted = selectedNodeId && (link.sourceId === selectedNodeId || link.targetId === selectedNodeId);
              const strokeColor = link.strength === 'combo' ? '#EF4444' : link.strength === 'high' ? '#F59E0B' : '#3B82F6';
              const strokeWidth = isHighlighted ? 3.5 : 1.5;
              const opacity = selectedNodeId ? (isHighlighted ? 1 : 0.15) : 0.6;

              return (
                <line
                  key={`${link.sourceId}-${link.targetId}-${idx}`}
                  x1={sourcePos.x}
                  y1={sourcePos.y}
                  x2={targetPos.x}
                  y2={targetPos.y}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeOpacity={opacity}
                  strokeDasharray={link.strength === 'combo' ? '4,4' : 'none'}
                  className="transition-all duration-300"
                />
              );
            })}

            {/* Draw Nodes */}
            {displayNodes.map((node) => {
              const pos = nodePositions[node.id];
              if (!pos) return null;

              const isCommander = node.typeCategory === 'Commander';
              const isSelected = selectedNodeId === node.id;
              const isConnected = connectedNodeIds.has(node.id);

              const nodeRadius = isCommander ? 26 : 18;
              const opacity = selectedNodeId ? (isSelected || isConnected ? 1 : 0.3) : 1;

              return (
                <g
                  key={node.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  onClick={() => setSelectedNodeId(isSelected ? null : node.id)}
                  className="cursor-pointer transition-transform duration-200 hover:scale-110"
                  opacity={opacity}
                >
                  {/* Glow ring */}
                  <circle
                    r={nodeRadius + 4}
                    fill="none"
                    stroke={isCommander ? '#FF6B00' : isSelected ? '#F59E0B' : '#2E3446'}
                    strokeWidth={isSelected ? 3 : 1.5}
                    className={isSelected ? 'animate-pulse' : ''}
                  />

                  {/* Node Circle */}
                  <circle
                    r={nodeRadius}
                    fill={isCommander ? '#FF6B00' : '#1A1D26'}
                    stroke={isCommander ? '#F59E0B' : '#3B82F6'}
                    strokeWidth={2}
                  />

                  {/* Node Label Text */}
                  <text
                    y={nodeRadius + 14}
                    textAnchor="middle"
                    fill="#F8FAFC"
                    fontSize={isCommander ? "11" : "9"}
                    fontWeight={isCommander ? "800" : "600"}
                    className="font-sans pointer-events-none drop-shadow"
                  >
                    {node.name.length > 16 ? `${node.name.substring(0, 14)}...` : node.name}
                  </text>
                </g>
              );
            })}

          </svg>
        </div>

        {/* Selected Node Synergy Details Sidebar */}
        <div className="bg-[#0F1117] border border-mtg-border rounded-2xl p-5 shadow-xl h-full flex flex-col justify-between">
          {selectedNode ? (
            <div>
              <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-mtg-border">
                <img
                  src={selectedNode.imageUrl}
                  alt={selectedNode.name}
                  className="w-12 h-16 object-cover rounded-lg shadow border border-orange-500/40"
                />
                <div>
                  <h4 className="font-extrabold text-sm text-white">{selectedNode.name}</h4>
                  <span className="text-xs text-orange-400 font-semibold">{selectedNode.functionalCategory}</span>
                </div>
              </div>

              <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Sinergie Dirette ({connectedLinks.length})
              </h5>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {connectedLinks.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Nessuna sinergia diretta isolata per questa carta.</p>
                ) : (
                  connectedLinks.map((link, idx) => {
                    const partnerId = link.sourceId === selectedNode.id ? link.targetId : link.sourceId;
                    const partner = nodes.find(n => n.id === partnerId);
                    return (
                      <div key={idx} className="bg-mtg-surface p-3 rounded-xl border border-mtg-border text-xs">
                        <div className="font-bold text-amber-400 mb-1 flex items-center gap-1">
                          ➔ {partner?.name}
                        </div>
                        <p className="text-slate-300 text-[11px] leading-relaxed">{link.description}</p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <Sparkles className="w-8 h-8 text-orange-400/50 mx-auto mb-2 animate-bounce" />
              <p className="text-xs font-semibold">Clicca su uno dei nodi del grafico per esplorare le sinergie nel dettaglio.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
