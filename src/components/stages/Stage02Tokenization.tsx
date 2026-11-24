import React from 'react';
import { motion } from 'framer-motion';
import { Binary, Hash, BarChart3, Layers, Info, Check } from 'lucide-react';
import { Token } from '../../types/pipeline';
import { MathDisplay } from '../ui/MathDisplay';
import { soundFx } from '../audio/soundEffects';

interface Stage02TokenizationProps {
  tokens: Token[];
  selectedToken: Token | null;
  onSelectToken: (token: Token) => void;
  rawText: string;
}

export const Stage02Tokenization: React.FC<Stage02TokenizationProps> = ({
  tokens,
  selectedToken,
  onSelectToken,
  rawText
}) => {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-sky-500/20 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-sky-400 font-mono text-xs uppercase tracking-widest font-semibold">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            <span>STAGE 02 — DISCRETE TOKENIZATION</span>
          </div>
          <h2 className="text-2xl font-orbitron font-extrabold text-white mt-1">
            SUBWORD SEGMENTATION & VOCABULARY MAPPING
          </h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Breaking continuous natural language into discrete mathematical integer identifiers using Byte-Pair Encoding (BPE).
          </p>
        </div>

        {/* Telemetry badge */}
        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-lg border border-sky-500/40 bg-sky-950/50 text-sky-300">
            TOTAL TOKENS: <b className="text-white ml-1">{tokens.length}</b>
          </div>
          <div className="px-3 py-1.5 rounded-lg border border-slate-800 bg-space-900 text-slate-400">
            COMPRESSION RATIO: <b className="text-cyan-400 ml-1">{(rawText.length / Math.max(1, tokens.length)).toFixed(1)}x</b>
          </div>
        </div>
      </div>

      {/* Raw String to Token Animation Flow */}
      <div className="p-5 rounded-2xl border border-sky-500/30 bg-space-950/80 backdrop-blur-xl shadow-glow-blue space-y-4">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800 pb-2">
          <span className="flex items-center space-x-1.5 text-sky-300 font-bold">
            <Binary className="w-4 h-4" />
            <span>BYTE-PAIR SEGMENTATION BREAKDOWN</span>
          </span>
          <span className="text-[11px] text-slate-500">CLICK ANY TOKEN TO INSPECT ITS TENSOR PROPERTIES</span>
        </div>

        {/* Animated Tokens Flow */}
        <div className="flex flex-wrap gap-2.5 pt-2">
          {tokens.map((token, index) => {
            const isSelected = selectedToken?.id === token.id;

            return (
              <motion.div
                key={`${token.id}-${index}`}
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                onClick={() => {
                  soundFx.playTokenBeep(index + 1);
                  onSelectToken(token);
                }}
                className={`group relative cursor-pointer rounded-xl border p-3 min-w-[100px] transition-all duration-200 select-none ${
                  isSelected
                    ? 'bg-sky-950/90 border-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.5)] scale-105'
                    : 'bg-space-900/90 border-slate-800 hover:border-sky-500/60 hover:scale-[1.02]'
                }`}
                style={{
                  borderTopColor: token.color,
                  borderTopWidth: '3px'
                }}
              >
                {/* Position & Special Indicator */}
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                  <span>POS {token.position}</span>
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: token.color }}
                  />
                </div>

                {/* Token Text */}
                <div className="font-mono text-sm font-bold text-white tracking-wide truncate">
                  {token.text.startsWith(' ') ? (
                    <span>
                      <span className="text-slate-500 opacity-60">_</span>
                      {token.text.trim()}
                    </span>
                  ) : (
                    token.text
                  )}
                </div>

                {/* Token ID */}
                <div className="mt-2 pt-1 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-500">ID</span>
                  <span className="text-sky-300 font-semibold">{token.id}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Two Column Section: Token Frequency & Detailed Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Token Frequency Breakdown */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-space-950/80 backdrop-blur-xl space-y-4">
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-slate-200 border-b border-slate-800 pb-3">
            <BarChart3 className="w-4 h-4 text-sky-400" />
            <span>TOKEN OCCURRENCE FREQUENCY</span>
          </div>

          <div className="space-y-2.5">
            {tokens.map((token, i) => (
              <div key={`freq-${i}`} className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">
                    "{token.cleanText}" <span className="text-slate-500 text-[10px]">(ID: {token.id})</span>
                  </span>
                  <span className="text-sky-400 font-bold">{token.frequency}x</span>
                </div>
                {/* Mini Bar */}
                <div className="h-1.5 w-full bg-space-900 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: token.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (token.frequency / Math.max(...tokens.map(t => t.frequency))) * 100)}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Token Inspector or Mathematical Deep-Dive */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-space-950/80 backdrop-blur-xl space-y-4">
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-slate-200 border-b border-slate-800 pb-3">
            <Info className="w-4 h-4 text-cyan-400" />
            <span>TOKEN METADATA & BPE ALGORITHM</span>
          </div>

          {selectedToken ? (
            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center space-x-3 p-3 rounded-xl bg-space-900 border border-sky-500/30">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-base text-space-950"
                  style={{ backgroundColor: selectedToken.color }}
                >
                  #{selectedToken.position}
                </div>
                <div>
                  <h4 className="text-white text-sm font-bold">"{selectedToken.text}"</h4>
                  <p className="text-[11px] text-slate-400">
                    Vocabulary ID: <span className="text-sky-300 font-bold">{selectedToken.id}</span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded-lg bg-space-900/60 border border-slate-800">
                  <span className="text-slate-500 block">RAW LENGTH</span>
                  <span className="text-slate-200 font-bold">{selectedToken.text.length} characters</span>
                </div>
                <div className="p-2.5 rounded-lg bg-space-900/60 border border-slate-800">
                  <span className="text-slate-500 block">SEQUENCE INDEX</span>
                  <span className="text-slate-200 font-bold">Index {selectedToken.position}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-space-900/40 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                <span className="text-sky-400 font-bold block">Next Transformation:</span>
                <p>
                  This token ID (<b className="text-slate-200">{selectedToken.id}</b>) indexes row {selectedToken.id} of the model's learned embedding table <MathDisplay math="W_e \in \mathbb{R}^{V \times d}" /> to retrieve a continuous 16-dimensional vector in Stage 03.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-xs text-slate-400 font-sans">
              <p>
                Byte-Pair Encoding iteratively merges the most frequent pairs of adjacent bytes or characters into new subword units:
              </p>
              <div className="p-3 rounded-lg bg-space-900 font-mono text-sky-300 text-center">
                <MathDisplay math="V_{new} = V \cup \{ \text{arg max}_{(a, b)} \text{freq}(ab) \}" />
              </div>
              <p className="text-[11px]">
                This prevents out-of-vocabulary (OOV) errors by falling back to character pieces or byte tokens when encountering unfamiliar words.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
