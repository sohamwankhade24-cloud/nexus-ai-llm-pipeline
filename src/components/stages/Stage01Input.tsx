import React from 'react';
import { motion } from 'framer-motion';
import { Play, Sparkles, Sliders, ShieldAlert, Cpu, Check, HelpCircle } from 'lucide-react';
import { PIPELINE_PRESETS } from '../../services/presets';
import { soundFx } from '../audio/soundEffects';

interface Stage01InputProps {
  inputText: string;
  onChangeInput: (text: string) => void;
  onExecute: () => void;
  isExecuting: boolean;
  temperature: number;
  onChangeTemperature: (val: number) => void;
  causalMask: boolean;
  onToggleCausalMask: () => void;
  attentionThreshold: number;
  onChangeAttentionThreshold: (val: number) => void;
  onSelectPreset: (presetId: string) => void;
  tokenCount: number;
}

export const Stage01Input: React.FC<Stage01InputProps> = ({
  inputText,
  onChangeInput,
  onExecute,
  isExecuting,
  temperature,
  onChangeTemperature,
  causalMask,
  onToggleCausalMask,
  attentionThreshold,
  onChangeAttentionThreshold,
  onSelectPreset,
  tokenCount
}) => {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Stage Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-cyan-500/20 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs uppercase tracking-widest font-semibold">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>STAGE 01 — PROMPT INGESTION & PARAMETERS</span>
          </div>
          <h2 className="text-2xl font-orbitron font-extrabold text-white mt-1">
            INPUT TEXT & INFERENCE ENGINE
          </h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Define the natural language sequence and tune model hyperparameters before neural propagation.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            soundFx.playStageTransition();
            onExecute();
          }}
          disabled={isExecuting || !inputText.trim()}
          className="px-6 py-3 rounded-xl font-orbitron font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 text-space-950 shadow-[0_0_25px_rgba(0,242,254,0.4)] hover:shadow-[0_0_35px_rgba(0,242,254,0.7)] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2.5"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>RUN FULL PIPELINE</span>
        </button>
      </div>

      {/* Main Grid: Input console on left, Hyperparameters on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Span 2): Live Textarea & Benchmark Presets */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 rounded-2xl border border-cyan-500/30 bg-space-950/80 backdrop-blur-xl shadow-glow-cyan relative">
            <div className="flex items-center justify-between mb-3 text-xs font-mono text-slate-400">
              <span className="flex items-center space-x-1.5 text-cyan-300 font-bold">
                <Cpu className="w-3.5 h-3.5" />
                <span>USER_PROMPT_BUFFER</span>
              </span>
              <div className="flex items-center space-x-3 text-[11px]">
                <span>CHARS: <b className="text-slate-200">{inputText.length}</b></span>
                <span>EST. TOKENS: <b className="text-cyan-400">{tokenCount}</b></span>
              </div>
            </div>

            <textarea
              value={inputText}
              onChange={(e) => onChangeInput(e.target.value)}
              placeholder="Enter any sentence to analyze through the Transformer pipeline..."
              rows={4}
              className="w-full bg-space-900/90 border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 rounded-xl p-4 text-base font-sans text-slate-100 placeholder:text-slate-500 transition-all outline-none resize-none leading-relaxed"
            />

            {/* Quick Presets Carousel */}
            <div className="mt-4 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono uppercase text-slate-400 flex items-center space-x-1.5">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  <span>CURATED BENCHMARKS (CLICK TO LOAD)</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PIPELINE_PRESETS.map((preset) => {
                  const isSelected = inputText === preset.text;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => {
                        soundFx.playClick();
                        onSelectPreset(preset.id);
                      }}
                      className={`text-left p-2.5 rounded-lg border text-xs font-mono transition-all ${
                        isSelected
                          ? 'bg-cyan-950/70 border-cyan-400 text-cyan-200 shadow-sm'
                          : 'bg-space-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-cyan-300 truncate">{preset.title}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        "{preset.text}"
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Hyperparameter Controls */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl border border-violet-500/30 bg-space-950/80 backdrop-blur-xl shadow-glow-purple space-y-5">
            <div className="flex items-center space-x-2 text-violet-300 font-mono text-xs uppercase font-bold border-b border-violet-500/20 pb-3">
              <Sliders className="w-4 h-4 text-violet-400" />
              <span>HYPERPARAMETERS</span>
            </div>

            {/* Temperature Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300">TEMPERATURE (T):</span>
                <span className="px-2 py-0.5 rounded bg-violet-950/70 border border-violet-500/40 text-violet-300 font-bold">
                  {temperature.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.8"
                step="0.05"
                value={temperature}
                onChange={(e) => onChangeTemperature(parseFloat(e.target.value))}
                className="w-full accent-violet-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>0.1 (Deterministic)</span>
                <span>0.7 (Balanced)</span>
                <span>1.8 (Creative)</span>
              </div>
            </div>

            {/* Causal Masking Toggle */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-mono font-bold text-slate-200">
                    CAUSAL ATTENTION MASK
                  </div>
                  <p className="text-[10px] text-slate-400 font-sans">
                    {causalMask
                      ? 'GPT-style autoregressive (tokens only attend to past tokens)'
                      : 'BERT-style bidirectional (tokens attend to all positions)'}
                  </p>
                </div>
                <button
                  onClick={onToggleCausalMask}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${
                    causalMask
                      ? 'bg-cyan-950 border-cyan-400 text-cyan-300 font-bold'
                      : 'bg-space-900 border-slate-700 text-slate-400'
                  }`}
                >
                  {causalMask ? 'CAUSAL (GPT)' : 'FULL (BERT)'}
                </button>
              </div>
            </div>

            {/* Attention Filter Threshold */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300">ATTN FILTER THRESHOLD:</span>
                <span className="px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 font-bold">
                  {(attentionThreshold * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min="0.0"
                max="0.4"
                step="0.02"
                value={attentionThreshold}
                onChange={(e) => onChangeAttentionThreshold(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <p className="text-[10px] text-slate-400 font-sans">
                Suppresses weak attention edges in 2D heatmaps and 3D arcs.
              </p>
            </div>
          </div>

          {/* Quick Engine Telemetry */}
          <div className="p-4 rounded-xl border border-slate-800 bg-space-900/60 text-xs font-mono space-y-2 text-slate-400">
            <div className="flex justify-between">
              <span>MODEL ARCHITECTURE:</span>
              <span className="text-slate-200">Transformer Decoder</span>
            </div>
            <div className="flex justify-between">
              <span>EMBEDDING DIM (d_model):</span>
              <span className="text-cyan-400">16 dimensions</span>
            </div>
            <div className="flex justify-between">
              <span>ATTENTION HEADS (H):</span>
              <span className="text-violet-400">4 Heads (d_k = 4)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
