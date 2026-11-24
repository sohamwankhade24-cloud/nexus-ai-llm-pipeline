import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Layers, Eye, Compass, Move3d, Grid, Cpu, ArrowRight } from 'lucide-react';
import { Token } from '../../types/pipeline';
import { VectorSpace3D } from '../canvas/VectorSpace3D';
import { MathDisplay } from '../ui/MathDisplay';
import { cosineSimilarity } from '../../services/llmEngine';
import { soundFx } from '../audio/soundEffects';

interface Stage03EmbeddingsProps {
  tokens: Token[];
  selectedToken: Token | null;
  onSelectToken: (token: Token) => void;
  viewMode: '2D' | '3D';
  onToggleViewMode: () => void;
}

export const Stage03Embeddings: React.FC<Stage03EmbeddingsProps> = ({
  tokens,
  selectedToken,
  onSelectToken,
  viewMode,
  onToggleViewMode
}) => {
  const [activeTab, setActiveTab] = useState<'3d' | 'heatmap' | 'positional' | 'similarity'>('3d');

  const activeToken = selectedToken || tokens[0] || null;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-indigo-500/20 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 font-mono text-xs uppercase tracking-widest font-semibold">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            <span>STAGE 03 — VECTOR EMBEDDINGS & POSITIONAL HARMONICS</span>
          </div>
          <h2 className="text-2xl font-orbitron font-extrabold text-white mt-1">
            HIGH-DIMENSIONAL CONTINUOUS VECTOR SPACE
          </h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Tokens are projected into continuous 16-dimensional semantic geometry and blended with sinusoidal positional encodings.
          </p>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center space-x-2 p-1 rounded-xl bg-space-950 border border-slate-800 text-xs font-mono">
          {[
            { id: '3d', label: '3D UNIVERSE', icon: Move3d },
            { id: 'heatmap', label: '2D TENSOR HEATMAP', icon: Grid },
            { id: 'positional', label: 'PE FORMULA', icon: Cpu },
            { id: 'similarity', label: 'COSINE SIMILARITY', icon: Compass }
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
                    ? 'bg-indigo-950 border border-indigo-400/60 text-indigo-300 font-bold shadow-[0_0_12px_rgba(129,140,248,0.4)]'
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

      {/* Main Interactive Display Area */}
      {activeTab === '3d' && (
        <div className="relative h-[480px] w-full rounded-2xl border border-indigo-500/30 bg-space-950/90 overflow-hidden shadow-glow-purple">
          {/* Canvas */}
          <Canvas
            camera={{ position: [0, 4, 10], fov: 45 }}
            gl={{ antialias: true }}
          >
            <color attach="background" args={['#02040a']} />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1.5} color="#00f2fe" />
            <pointLight position={[-10, 10, -10]} intensity={1.5} color="#818cf8" />

            <Suspense fallback={null}>
              <VectorSpace3D
                tokens={tokens}
                selectedToken={activeToken}
                onSelectToken={onSelectToken}
              />
              <OrbitControls
                enableZoom={true}
                enablePan={true}
                maxDistance={20}
                minDistance={3}
              />
            </Suspense>
          </Canvas>

          {/* HUD Overlay Info Box */}
          <div className="absolute top-4 left-4 z-10 glass-panel p-3 rounded-xl border border-indigo-500/30 bg-space-950/80 backdrop-blur-md text-xs font-mono max-w-xs space-y-1">
            <span className="text-[10px] text-indigo-400 uppercase tracking-widest font-bold block">
              3D EMBEDDING TOPOLOGY
            </span>
            <p className="text-slate-300 text-[11px]">
              Left-click & drag to orbit; scroll to zoom. Click any token sphere to inspect its vector coordinates.
            </p>
          </div>

          {/* Selected Token Floating Card */}
          {activeToken && (
            <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-10 glass-panel p-3.5 rounded-xl border border-indigo-400/50 bg-space-950/90 backdrop-blur-md text-xs font-mono shadow-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-2 font-bold text-white">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: activeToken.color }}
                  />
                  <span>TOKEN: "{activeToken.cleanText}" (POS #{activeToken.position})</span>
                </span>
                <span className="text-indigo-400 font-bold">ID: {activeToken.id}</span>
              </div>

              <div className="text-[11px] text-slate-400">
                3D Coordinates: [{activeToken.coords3D.map(n => n.toFixed(2)).join(', ')}]
              </div>

              {/* Vector dimension strip preview */}
              <div className="pt-1">
                <span className="text-[10px] text-slate-500 block mb-1">
                  DIMENSIONS [d_0 .. d_15]:
                </span>
                <div className="grid grid-cols-8 gap-1 text-[9px] text-center">
                  {activeToken.finalEmbedding.map((val, idx) => (
                    <div
                      key={`dim-${idx}`}
                      className="p-1 rounded bg-space-900 border border-slate-800 truncate"
                      style={{
                        borderColor: val > 0 ? 'rgba(0,242,254,0.4)' : 'rgba(244,63,94,0.4)',
                        color: val > 0 ? '#38bdf8' : '#fb7185'
                      }}
                      title={`d_${idx}: ${val}`}
                    >
                      {val.toFixed(2)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2D Heatmap View */}
      {activeTab === 'heatmap' && (
        <div className="p-5 rounded-2xl border border-indigo-500/30 bg-space-950/80 backdrop-blur-xl shadow-glow-purple space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-orbitron font-bold text-sm text-white">
                TOKEN EMBEDDING TENSOR MATRIX (SeqLen × 16 Dim)
              </h3>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Each cell corresponds to numerical weight value in the continuous vector representation.
              </p>
            </div>
            <div className="flex items-center space-x-2 text-[10px] font-mono">
              <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-500/40">+ Positive</span>
              <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/40">- Negative</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 text-[10px]">
                  <th className="p-2 text-left">TOKEN</th>
                  {Array.from({ length: 16 }).map((_, i) => (
                    <th key={`head-${i}`} className="p-2 text-center">d_{i}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tokens.map((token) => {
                  const isSelected = activeToken?.id === token.id;
                  return (
                    <tr
                      key={`row-${token.id}`}
                      onClick={() => onSelectToken(token)}
                      className={`cursor-pointer border-b border-slate-900 transition-colors ${
                        isSelected ? 'bg-indigo-950/60 font-bold' : 'hover:bg-space-900/50'
                      }`}
                    >
                      <td className="p-2 whitespace-nowrap">
                        <span
                          className="inline-block w-2 h-2 rounded-full mr-2"
                          style={{ backgroundColor: token.color }}
                        />
                        <span className="text-white">"{token.cleanText}"</span>
                      </td>
                      {token.finalEmbedding.map((val, d) => {
                        const isPos = val >= 0;
                        const opacity = Math.min(1, Math.abs(val) * 1.2);
                        return (
                          <td key={`val-${d}`} className="p-1.5 text-center">
                            <span
                              className="px-1.5 py-0.5 rounded text-[10px] block"
                              style={{
                                backgroundColor: isPos
                                  ? `rgba(56, 189, 248, ${opacity * 0.25})`
                                  : `rgba(244, 63, 94, ${opacity * 0.25})`,
                                color: isPos ? '#38bdf8' : '#fb7185'
                              }}
                            >
                              {val.toFixed(2)}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Positional Encoding Deep-Dive */}
      {activeTab === 'positional' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl border border-slate-800 bg-space-950/80 backdrop-blur-xl space-y-4">
            <div className="flex items-center space-x-2 text-xs font-mono font-bold text-slate-200 border-b border-slate-800 pb-3">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <span>SINUSOIDAL POSITIONAL ENCODING FORMULA</span>
            </div>

            <div className="p-4 rounded-xl bg-space-900 border border-indigo-500/30 text-center font-mono space-y-3">
              <div className="text-cyan-300">
                <MathDisplay block math="PE_{(pos, 2i)} = \sin\left(\frac{pos}{10000^{2i/d_{model}}}\right)" />
              </div>
              <div className="text-violet-300">
                <MathDisplay block math="PE_{(pos, 2i+1)} = \cos\left(\frac{pos}{10000^{2i/d_{model}}}\right)" />
              </div>
            </div>

            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Because Transformers lack recurrence (unlike RNNs or LSTMs), they are permutation invariant by default. Positional encoding adds unique sinusoidal geometric phase shifts to preserve word order.
            </p>

            <div className="p-3 rounded-xl bg-space-900/60 border border-slate-800 text-xs font-mono space-y-1">
              <span className="text-indigo-300 font-bold block">Final Representation Vector:</span>
              <div className="text-center py-1">
                <MathDisplay math="\mathbf{x}_{final} = \mathbf{E}_{token} + \mathbf{PE}_{(pos)}" />
              </div>
            </div>
          </div>

          {/* Active Token Decomposition */}
          {activeToken && (
            <div className="p-5 rounded-2xl border border-slate-800 bg-space-950/80 backdrop-blur-xl space-y-4">
              <div className="flex items-center space-x-2 text-xs font-mono font-bold text-slate-200 border-b border-slate-800 pb-3">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>VECTOR ADDITION FOR "{activeToken.cleanText}" (POS {activeToken.position})</span>
              </div>

              <div className="space-y-3 text-xs font-mono">
                {/* Raw Semantic */}
                <div className="p-2.5 rounded-lg bg-space-900 border border-cyan-500/20">
                  <span className="text-cyan-300 text-[11px] block mb-1">
                    1. Learned Semantic Embedding (E_token):
                  </span>
                  <div className="truncate text-slate-400 text-[10px]">
                    [{activeToken.rawEmbedding.slice(0, 6).join(', ')} ... +10 dims]
                  </div>
                </div>

                {/* Positional */}
                <div className="p-2.5 rounded-lg bg-space-900 border border-violet-500/20">
                  <span className="text-violet-300 text-[11px] block mb-1">
                    2. Positional Encoding Vector (PE):
                  </span>
                  <div className="truncate text-slate-400 text-[10px]">
                    [{activeToken.positionalEmbedding.slice(0, 6).join(', ')} ... +10 dims]
                  </div>
                </div>

                {/* Final Sum */}
                <div className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-400/50 shadow-sm">
                  <span className="text-white text-[11px] font-bold block mb-1">
                    = Final Context Vector (E_final):
                  </span>
                  <div className="truncate text-indigo-300 font-bold text-[10px]">
                    [{activeToken.finalEmbedding.slice(0, 6).join(', ')} ... +10 dims]
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cosine Similarity Matrix */}
      {activeTab === 'similarity' && (
        <div className="p-5 rounded-2xl border border-indigo-500/30 bg-space-950/80 backdrop-blur-xl shadow-glow-purple space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-orbitron font-bold text-sm text-white">
                PAIRWISE COSINE SIMILARITY MATRIX
              </h3>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Measures the cosine of the angle between token embedding vectors in 16D space: <MathDisplay math="\cos(\theta) = \frac{\mathbf{u} \cdot \mathbf{v}}{\|\mathbf{u}\| \|\mathbf{v}\|}" />
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                  <th className="p-2 text-left">TOKEN</th>
                  {tokens.map((t) => (
                    <th key={`sim-head-${t.id}`} className="p-2 text-center truncate max-w-[80px]">
                      "{t.cleanText}"
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tokens.map((rowToken) => (
                  <tr key={`sim-row-${rowToken.id}`} className="border-b border-slate-900">
                    <td className="p-2 whitespace-nowrap font-bold text-slate-200">
                      "{rowToken.cleanText}"
                    </td>
                    {tokens.map((colToken) => {
                      const sim = cosineSimilarity(rowToken.finalEmbedding, colToken.finalEmbedding);
                      const isSelf = rowToken.id === colToken.id;
                      return (
                        <td key={`sim-cell-${colToken.id}`} className="p-2 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              isSelf
                                ? 'bg-indigo-950 text-indigo-300 border border-indigo-500/30'
                                : sim > 0.4
                                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/30'
                                : sim > 0
                                ? 'text-slate-300'
                                : 'text-rose-400'
                            }`}
                          >
                            {sim.toFixed(2)}
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
      )}
    </div>
  );
};
