import React, { Suspense, useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { motion } from 'framer-motion';
import { GitCommit, Move3d, Grid, Cpu, Sliders, Layers, Sparkles, Filter } from 'lucide-react';
import { Token, AttentionData } from '../../types/pipeline';
import { AttentionArcs3D } from '../canvas/AttentionArcs3D';
import { MathDisplay } from '../ui/MathDisplay';
import { soundFx } from '../audio/soundEffects';

interface Stage04AttentionProps {
  tokens: Token[];
  attentionData: AttentionData;
  threshold: number;
  onChangeThreshold: (val: number) => void;
  selectedToken: Token | null;
  onSelectToken: (token: Token) => void;
}

export const Stage04Attention: React.FC<Stage04AttentionProps> = ({
  tokens,
  attentionData,
  threshold,
  onChangeThreshold,
  selectedToken,
  onSelectToken
}) => {
  const [activeTab, setActiveTab] = useState<'heatmap' | '3d' | 'qkv' | 'math'>('heatmap');
  const [selectedHeadIdx, setSelectedHeadIdx] = useState<number>(-1); // -1 = Average across all heads
  const [hoveredCell, setHoveredCell] = useState<{ i: number; j: number } | null>(null);

  // Active matrix based on selected head or average
  const currentMatrix = useMemo(() => {
    if (selectedHeadIdx >= 0 && attentionData.heads[selectedHeadIdx]) {
      return attentionData.heads[selectedHeadIdx].attentionWeights;
    }
    return attentionData.averageMatrix;
  }, [attentionData, selectedHeadIdx]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-purple-500/20 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-purple-400 font-mono text-xs uppercase tracking-widest font-semibold">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <span>STAGE 04 — SCALED DOT-PRODUCT MULTI-HEAD ATTENTION</span>
          </div>
          <h2 className="text-2xl font-orbitron font-extrabold text-white mt-1">
            QUERY, KEY & VALUE RELATIONAL PROJECTION
          </h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Tokens dynamically broadcast Query and Key vectors to compute contextual relevance matrices via <MathDisplay math="\text{Softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V" />.
          </p>
        </div>

        {/* View Mode Buttons */}
        <div className="flex items-center space-x-2 p-1 rounded-xl bg-space-950 border border-slate-800 text-xs font-mono">
          {[
            { id: 'heatmap', label: '2D ATTENTION HEATMAP', icon: Grid },
            { id: '3d', label: '3D ATTENTION ARCS', icon: Move3d },
            { id: 'qkv', label: 'Q, K, V TENSORS', icon: Layers },
            { id: 'math', label: 'FORMULA DERIVATION', icon: Cpu }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  soundFx.playClick();
                  setActiveTab(tab.id as any);
                }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  isActive
                    ? 'bg-purple-950 border border-purple-400/60 text-purple-300 font-bold shadow-[0_0_12px_rgba(192,132,252,0.4)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Head Selector & Threshold Slider Controls Bar */}
      <div className="p-4 rounded-xl border border-slate-800 bg-space-950/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        {/* Multi-head buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-mono text-slate-400 mr-2 flex items-center space-x-1">
            <GitCommit className="w-3.5 h-3.5 text-purple-400" />
            <span>HEAD:</span>
          </span>

          <button
            onClick={() => {
              soundFx.playClick();
              setSelectedHeadIdx(-1);
            }}
            className={`px-3 py-1 rounded-lg text-xs font-mono border transition-all ${
              selectedHeadIdx === -1
                ? 'bg-gradient-to-r from-purple-950 to-indigo-950 border-purple-400 text-purple-200 font-bold shadow-sm'
                : 'bg-space-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            AVG (ALL 4 HEADS)
          </button>

          {attentionData.heads.map((head) => (
            <button
              key={`head-btn-${head.headIndex}`}
              onClick={() => {
                soundFx.playClick();
                setSelectedHeadIdx(head.headIndex);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono border transition-all ${
                selectedHeadIdx === head.headIndex
                  ? 'bg-purple-950 border-purple-400 text-purple-200 font-bold shadow-sm'
                  : 'bg-space-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              H{head.headIndex + 1}: {head.name.split(':')[1]?.trim() || `Head ${head.headIndex + 1}`}
            </button>
          ))}
        </div>

        {/* Threshold Slider */}
        <div className="flex items-center space-x-3 text-xs font-mono">
          <Filter className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-slate-400">THRESHOLD:</span>
          <input
            type="range"
            min="0.0"
            max="0.4"
            step="0.02"
            value={threshold}
            onChange={(e) => onChangeThreshold(parseFloat(e.target.value))}
            className="w-24 accent-purple-400 cursor-pointer"
          />
          <span className="px-2 py-0.5 rounded bg-purple-950 border border-purple-500/40 text-purple-300 font-bold">
            {(threshold * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Main Tab 1: 2D Heatmap */}
      {activeTab === 'heatmap' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Heatmap Matrix (Span 2) */}
          <div className="lg:col-span-2 p-5 rounded-2xl border border-purple-500/30 bg-space-950/80 backdrop-blur-xl shadow-glow-purple space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-mono text-purple-300 font-bold">
                ATTENTION WEIGHTS MATRIX <MathDisplay math="A_{ij} \in [0, 1]" />
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                ROW = ATTENDING TOKEN (Query) | COL = ATTENDED TOKEN (Key)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono border-collapse">
                <thead>
                  <tr>
                    <th className="p-2 text-left text-slate-500 text-[10px]">Query \ Key</th>
                    {tokens.map((t, idx) => (
                      <th
                        key={`col-${idx}`}
                        className="p-2 text-center truncate max-w-[70px] text-[11px]"
                        style={{ color: t.color }}
                      >
                        "{t.cleanText}"
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tokens.map((rowToken, i) => (
                    <tr key={`row-${i}`} className="border-t border-slate-800/60">
                      <td className="p-2 whitespace-nowrap font-bold" style={{ color: rowToken.color }}>
                        "{rowToken.cleanText}"
                      </td>
                      {tokens.map((colToken, j) => {
                        const weight = currentMatrix[i]?.[j] ?? 0;
                        const isFiltered = weight < threshold;
                        const isHovered = hoveredCell?.i === i && hoveredCell?.j === j;

                        // Vibrant cyan to purple heat gradient
                        const bgIntensity = Math.min(1, weight * 2.2);

                        return (
                          <td
                            key={`cell-${i}-${j}`}
                            onMouseEnter={() => setHoveredCell({ i, j })}
                            onMouseLeave={() => setHoveredCell(null)}
                            onClick={() => {
                              soundFx.playTokenBeep((i + j) % 6 + 1);
                              onSelectToken(rowToken);
                            }}
                            className={`p-2 text-center cursor-pointer transition-all ${
                              isHovered
                                ? 'ring-2 ring-purple-400 font-black scale-110 z-10'
                                : ''
                            }`}
                            style={{
                              backgroundColor: isFiltered
                                ? 'transparent'
                                : `rgba(168, 85, 247, ${bgIntensity * 0.45})`
                            }}
                          >
                            <span
                              className={`text-[11px] rounded px-1.5 py-0.5 ${
                                isFiltered
                                  ? 'text-slate-600'
                                  : weight > 0.3
                                  ? 'text-white font-bold'
                                  : 'text-purple-300'
                              }`}
                            >
                              {(weight * 100).toFixed(0)}%
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column: Active Cell Details & Top Attention Pairs */}
          <div className="space-y-4">
            {/* Active Cell Inspector */}
            <div className="p-4 rounded-xl border border-purple-500/40 bg-space-950/80 backdrop-blur-md space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-purple-400 font-bold block border-b border-purple-500/20 pb-2">
                FOCUSED ATTENTION CONNECTION
              </span>

              {hoveredCell ? (
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between text-white">
                    <span>Query (From):</span>
                    <span className="font-bold text-cyan-300">"{tokens[hoveredCell.i]?.cleanText}"</span>
                  </div>
                  <div className="flex items-center justify-between text-white">
                    <span>Key (To):</span>
                    <span className="font-bold text-purple-300">"{tokens[hoveredCell.j]?.cleanText}"</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <span className="text-slate-400">Attention Weight:</span>
                    <span className="text-sm font-bold text-white px-2 py-0.5 rounded bg-purple-900/60 border border-purple-400">
                      {((currentMatrix[hoveredCell.i]?.[hoveredCell.j] ?? 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 font-sans">
                  Hover over any heatmap cell to inspect the dynamic Query-Key pairing strength.
                </p>
              )}
            </div>

            {/* Top Ranked Cross-Token Connections */}
            <div className="p-4 rounded-xl border border-slate-800 bg-space-950/80 backdrop-blur-md space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block border-b border-slate-800 pb-2">
                STRONGEST CROSS-ATTENTION FLOWS
              </span>

              <div className="space-y-2 text-xs font-mono max-h-56 overflow-y-auto">
                {attentionData.topConnections.slice(0, 6).map((conn, idx) => (
                  <div
                    key={`conn-${idx}`}
                    className="p-2 rounded-lg bg-space-900 border border-slate-800 flex items-center justify-between hover:border-purple-500/40 transition-colors"
                  >
                    <div className="flex items-center space-x-1.5 truncate">
                      <span className="text-cyan-300 font-semibold truncate">"{conn.fromToken}"</span>
                      <span className="text-slate-500">→</span>
                      <span className="text-purple-300 font-semibold truncate">"{conn.toToken}"</span>
                    </div>
                    <span className="text-purple-400 font-bold ml-2">
                      {(conn.score * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Tab 2: 3D Attention Universe */}
      {activeTab === '3d' && (
        <div className="relative h-[480px] w-full rounded-2xl border border-purple-500/30 bg-space-950/90 overflow-hidden shadow-glow-purple">
          <Canvas
            camera={{ position: [0, 6, 9], fov: 45 }}
            gl={{ antialias: true }}
          >
            <color attach="background" args={['#02040a']} />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1.5} color="#00f2fe" />
            <pointLight position={[-10, 10, -10]} intensity={1.5} color="#c084fc" />

            <Suspense fallback={null}>
              <AttentionArcs3D
                tokens={tokens}
                attentionData={attentionData}
                selectedHead={selectedHeadIdx}
                threshold={threshold}
                selectedToken={selectedToken}
                onSelectToken={onSelectToken}
              />
              <OrbitControls
                enableZoom={true}
                enablePan={true}
                maxDistance={22}
                minDistance={4}
              />
            </Suspense>
          </Canvas>

          {/* Overlay info */}
          <div className="absolute top-4 left-4 z-10 glass-panel p-3 rounded-xl border border-purple-500/30 bg-space-950/80 backdrop-blur-md text-xs font-mono max-w-xs space-y-1">
            <span className="text-[10px] text-purple-400 uppercase tracking-widest font-bold block">
              3D ATTENTION ARCS GEOMETRY
            </span>
            <p className="text-slate-300 text-[11px]">
              Glowing arcs show quadratic Bezier information flows between attending tokens. Arc thickness scales with weight.
            </p>
          </div>
        </div>
      )}

      {/* Main Tab 3: Q, K, V Matrices */}
      {activeTab === 'qkv' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-slate-800 bg-space-900/60 text-xs font-mono text-slate-300">
            Active Head: <b className="text-purple-300">{selectedHeadIdx >= 0 ? attentionData.heads[selectedHeadIdx].name : 'Head 1: Syntactic Relations'}</b> (Projection Dimension: <b className="text-cyan-400">d_k = 4</b>)
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Query Vectors */}
            <div className="p-4 rounded-xl border border-cyan-500/30 bg-space-950/80 backdrop-blur-md space-y-3">
              <span className="text-xs font-mono font-bold text-cyan-300 block border-b border-cyan-500/20 pb-2">
                QUERY VECTORS (Q = X · W_Q)
              </span>
              <div className="space-y-2 text-[11px] font-mono">
                {tokens.map((t, i) => (
                  <div key={`q-${i}`} className="p-2 rounded bg-space-900/80 border border-slate-800">
                    <span className="text-white block font-bold">"{t.cleanText}"</span>
                    <span className="text-cyan-400 text-[10px]">
                      [{(attentionData.heads[Math.max(0, selectedHeadIdx)].qVectors[i] || []).map(v => v.toFixed(2)).join(', ')}]
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Vectors */}
            <div className="p-4 rounded-xl border border-purple-500/30 bg-space-950/80 backdrop-blur-md space-y-3">
              <span className="text-xs font-mono font-bold text-purple-300 block border-b border-purple-500/20 pb-2">
                KEY VECTORS (K = X · W_K)
              </span>
              <div className="space-y-2 text-[11px] font-mono">
                {tokens.map((t, i) => (
                  <div key={`k-${i}`} className="p-2 rounded bg-space-900/80 border border-slate-800">
                    <span className="text-white block font-bold">"{t.cleanText}"</span>
                    <span className="text-purple-400 text-[10px]">
                      [{(attentionData.heads[Math.max(0, selectedHeadIdx)].kVectors[i] || []).map(v => v.toFixed(2)).join(', ')}]
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Value Vectors */}
            <div className="p-4 rounded-xl border border-pink-500/30 bg-space-950/80 backdrop-blur-md space-y-3">
              <span className="text-xs font-mono font-bold text-pink-300 block border-b border-pink-500/20 pb-2">
                VALUE VECTORS (V = X · W_V)
              </span>
              <div className="space-y-2 text-[11px] font-mono">
                {tokens.map((t, i) => (
                  <div key={`v-${i}`} className="p-2 rounded bg-space-900/80 border border-slate-800">
                    <span className="text-white block font-bold">"{t.cleanText}"</span>
                    <span className="text-pink-400 text-[10px]">
                      [{(attentionData.heads[Math.max(0, selectedHeadIdx)].vVectors[i] || []).map(v => v.toFixed(2)).join(', ')}]
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Tab 4: Step-by-Step Mathematical Derivation */}
      {activeTab === 'math' && (
        <div className="p-6 rounded-2xl border border-purple-500/30 bg-space-950/80 backdrop-blur-xl shadow-glow-purple space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h3 className="font-orbitron font-extrabold text-lg text-white">
              MATHEMATICAL DERIVATION OF SELF-ATTENTION
            </h3>
            <p className="text-xs text-slate-400 font-sans">
              How the Transformer computes contextualized token representations without recurrence or convolution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-space-900 border border-slate-800 space-y-2">
              <span className="text-xs font-mono font-bold text-cyan-300 block">
                STEP 1: DOT-PRODUCT SCALING
              </span>
              <div className="py-2 text-center text-xs font-mono text-cyan-200">
                <MathDisplay block math="S_{ij} = \frac{\mathbf{q}_i \cdot \mathbf{k}_j^T}{\sqrt{d_k}}" />
              </div>
              <p className="text-[11px] text-slate-400 font-sans">
                Dividing by <MathDisplay math="\sqrt{d_k}" /> prevents dot products from growing excessively large in high dimensions, which would cause vanishing gradients in softmax.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-space-900 border border-slate-800 space-y-2">
              <span className="text-xs font-mono font-bold text-purple-300 block">
                STEP 2: NORMALIZED SOFTMAX
              </span>
              <div className="py-2 text-center text-xs font-mono text-purple-200">
                <MathDisplay block math="A_{ij} = \frac{\exp(S_{ij})}{\sum_{m=1}^{n} \exp(S_{im})}" />
              </div>
              <p className="text-[11px] text-slate-400 font-sans">
                Exponentiation ensures non-negativity and division by the sum forces each row of the attention matrix to sum exactly to 1.0 (a valid probability distribution).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-space-900 border border-slate-800 space-y-2">
              <span className="text-xs font-mono font-bold text-pink-300 block">
                STEP 3: CONTEXT AGGREGATION
              </span>
              <div className="py-2 text-center text-xs font-mono text-pink-200">
                <MathDisplay block math="\mathbf{z}_i = \sum_{j=1}^{n} A_{ij} \mathbf{v}_j" />
              </div>
              <p className="text-[11px] text-slate-400 font-sans">
                Each token's output representation is a weighted sum over all tokens' value vectors according to their attention weights.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
