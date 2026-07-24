import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Sparkles, RotateCcw, ZoomIn, ZoomOut, Zap, Flame, Info, Eye } from 'lucide-react';
import { DeckSynergyReport, SynergyNode } from '../types/synergy';

interface SynergyNetworkGraph3DProps {
  report: DeckSynergyReport;
}

export const SynergyNetworkGraph3D: React.FC<SynergyNetworkGraph3DProps> = ({ report }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<SynergyNode | null>(null);

  const { nodes, links } = report;

  // Filter top nodes (Commander + up to 18 key cards)
  const commanderNode = nodes.find(n => n.typeCategory === 'Commander') || nodes[0];
  const otherNodes = nodes.filter(n => n.id !== commanderNode.id).slice(0, 18);
  const displayNodes = [commanderNode, ...otherNodes];
  const displayNodeIds = new Set(displayNodes.map(n => n.id));
  const displayLinks = links.filter(l => displayNodeIds.has(l.sourceId) && displayNodeIds.has(l.targetId));

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = 520;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0f1117, 0.0015);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 40, 220);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Background Particle Starfield
    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = 400;
    const starPositions = new Float32Array(starsCount * 3);

    for (let i = 0; i < starsCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 600;
      starPositions[i + 1] = (Math.random() - 0.5) * 600;
      starPositions[i + 2] = (Math.random() - 0.5) * 600;
    }

    starsGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xff8533,
      size: 1.5,
      transparent: true,
      opacity: 0.6
    });
    const starField = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starField);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xff6b00, 2, 300);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);

    // 4. Create 3D Nodes (Spheres + Glowing Rings)
    const nodeMeshMap = new Map<string, THREE.Group>();
    const nodePositionsMap = new Map<string, THREE.Vector3>();

    // Commander at (0, 0, 0)
    nodePositionsMap.set(commanderNode.id, new THREE.Vector3(0, 0, 0));

    // Place other nodes in 3D spherical orbits
    const radius = 110;
    otherNodes.forEach((node, index) => {
      const phi = Math.acos(-1 + (2 * index) / otherNodes.length);
      const theta = Math.sqrt(otherNodes.length * Math.PI) * phi;

      const x = radius * Math.cos(theta) * Math.sin(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(phi);

      nodePositionsMap.set(node.id, new THREE.Vector3(x, y, z));
    });

    displayNodes.forEach(node => {
      const pos = nodePositionsMap.get(node.id)!;
      const isCommander = node.typeCategory === 'Commander';

      const group = new THREE.Group();
      group.position.copy(pos);

      // Core Sphere
      const sphereGeo = new THREE.SphereGeometry(isCommander ? 10 : 6, 32, 32);
      const colorHex = isCommander 
        ? 0xff6b00 
        : node.functionalCategory === 'Ramp' 
        ? 0x10b981 
        : node.functionalCategory === 'Draw' 
        ? 0x3b82f6 
        : node.functionalCategory === 'Removal' 
        ? 0xef4444 
        : 0xf59e0b;

      const sphereMat = new THREE.MeshStandardMaterial({
        color: colorHex,
        emissive: colorHex,
        emissiveIntensity: isCommander ? 0.6 : 0.3,
        roughness: 0.2,
        metalness: 0.8
      });

      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      group.add(sphere);

      // Outer Glowing Ring for Commander
      if (isCommander) {
        const ringGeo = new THREE.RingGeometry(14, 16, 32);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0xff8533,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.7
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        group.add(ring);
      }

      scene.add(group);
      nodeMeshMap.set(node.id, group);
    });

    // 5. Create 3D Laser Lines for Synergy Connections
    const linesGroup = new THREE.Group();
    displayLinks.forEach(link => {
      const posA = nodePositionsMap.get(link.sourceId);
      const posB = nodePositionsMap.get(link.targetId);
      if (!posA || !posB) return;

      const geometry = new THREE.BufferGeometry().setFromPoints([posA, posB]);
      const colorHex = link.strength === 'combo' ? 0xef4444 : link.strength === 'high' ? 0xf59e0b : 0x3b82f6;

      const material = new THREE.LineBasicMaterial({
        color: colorHex,
        transparent: true,
        opacity: 0.5,
        linewidth: link.strength === 'combo' ? 3 : 1
      });

      const line = new THREE.Line(geometry, material);
      linesGroup.add(line);
    });
    scene.add(linesGroup);

    // 6. Mouse Interaction & Orbit Controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaMove = {
        x: e.clientX - previousMousePosition.x,
        y: e.clientY - previousMousePosition.y
      };

      scene.rotation.y += deltaMove.x * 0.005;
      scene.rotation.x += deltaMove.y * 0.005;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    // Raycasting for clicking nodes
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      const meshes: THREE.Object3D[] = [];
      nodeMeshMap.forEach(g => meshes.push(g.children[0]));

      const intersects = raycaster.intersectObjects(meshes);
      if (intersects.length > 0) {
        const hitMesh = intersects[0].object;
        nodeMeshMap.forEach((g, id) => {
          if (g.children[0] === hitMesh) {
            const foundNode = displayNodes.find(n => n.id === id);
            if (foundNode) setSelectedNode(foundNode);
          }
        });
      }
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domElement.addEventListener('click', onClick);

    // 7. Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Slow ambient rotation when not dragging
      if (!isDragging) {
        scene.rotation.y += 0.0015;
      }

      // Pulse starfield
      starField.rotation.y -= 0.0005;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domElement.removeEventListener('click', onClick);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [report]);

  return (
    <div className="bg-mtg-surface border border-mtg-border rounded-3xl p-6 shadow-2xl space-y-6 relative overflow-hidden">
      
      {/* Glow background */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-mtg-border relative z-10">
        <div>
          <span className="px-3 py-1 bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-400 border border-orange-500/30 rounded-full text-xs font-black uppercase tracking-wider mb-2 inline-block">
            TREND #1: 3D WebGL Particle Universe
          </span>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-400 animate-pulse" /> Universo Sinergico 3D Interattivo
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Trascina per ruotare lo spazio 3D in 360°. Clicca sulle sfere per isolare le sinergie di ogni carta.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-bold text-slate-300">
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F1117] border border-mtg-border rounded-xl">
            <Eye className="w-4 h-4 text-orange-400" /> Trascina 360°
          </span>
        </div>
      </div>

      {/* 3D WebGL Canvas Container + HUD Overlay */}
      <div className="relative rounded-2xl overflow-hidden border border-mtg-border bg-[#0F1117] shadow-inner">
        <div ref={containerRef} className="w-full h-[520px] cursor-grab active:cursor-grabbing" />

        {/* Floating Glassmorphic HUD overlay for selected 3D node */}
        {selectedNode && (
          <div className="absolute top-4 right-4 max-w-sm w-full bg-[#1A1D26]/90 backdrop-blur-xl border border-orange-500/50 rounded-2xl p-4 shadow-2xl text-white z-20 animate-in fade-in slide-in-from-right-4 duration-200">
            <div className="flex items-center space-x-3 mb-3 pb-2 border-b border-mtg-border">
              <img
                src={selectedNode.imageUrl}
                alt={selectedNode.name}
                className="w-12 h-16 object-cover rounded-lg border border-orange-500 shadow-md"
              />
              <div>
                <h4 className="font-extrabold text-sm text-white">{selectedNode.name}</h4>
                <span className="text-xs text-orange-400 font-semibold">{selectedNode.functionalCategory}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <p className="font-bold text-amber-300">Sinergie Attive nel Mazzo:</p>
              {links
                .filter(l => l.sourceId === selectedNode.id || l.targetId === selectedNode.id)
                .slice(0, 3)
                .map((link, idx) => (
                  <div key={idx} className="bg-[#0F1117] p-2.5 rounded-lg border border-mtg-border text-[11px] leading-relaxed">
                    <span className="text-orange-400 font-bold block mb-0.5">★ Connessione Tattica:</span>
                    {link.description}
                  </div>
                ))}
            </div>

            <button
              onClick={() => setSelectedNode(null)}
              className="mt-3 w-full py-1.5 text-[11px] font-bold text-slate-400 hover:text-white bg-[#0F1117] rounded-lg border border-mtg-border transition-colors"
            >
              Chiudi HUD Carta
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
