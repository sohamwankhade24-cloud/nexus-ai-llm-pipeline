import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Zap, RefreshCw, BarChart2, PlusCircle, CheckCircle } from 'lucide-react';
import { PredictionData, CandidateToken } from '../../types/pipeline';
import { MathDisplay } from '../ui/MathDisplay';
import { soundFx } from '../audio/soundEffects';

interface Stage05NextTokenProps {
  prediction: PredictionData;
  temperature: number;
  onChangeTemperature: (val: number) => void;
  onAppendCandidate: (tokenText: string) => void;
  isExecuting: boolean;
}

export const Stage05NextToken: React.FC<Stage05NextTokenProps> = ({
  prediction,
  temperature,
  onChangeTemperature,
  onAppendCandidate,
  isExecuting
}) => {
  const { candidates, topToken, entropy } = prediction;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-rose-500/20 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-rose-400 font-mono text-xs uppercase tracking-widest font-semibold">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
            <span>STAGE 05 — AUTOREGRESSIVE NEXT-TOKEN GENERATION</span>
          </div>
          <h2 className="text-2xl font-orbitron font-extrabold text-white mt-1">
            LOGIT PROJECTION & SOFTMAX PROBABILITIES
          </h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            The final contextualized hidden state is projected through the language model head onto the 50,257 vocabulary logits.
          </p>
        </div>

        {/* Prediction Telemetry Badge */}
        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-lg border border-rose-500/40 bg-rose-950/50 text-rose-300">
            SHANNON ENTROPY: <b className="text-white ml-1">{entropy} bits</b>
          </div>
          <div className="px-3 py-1.5 rounded-lg border border-slate-800 bg-space-900 text-slate-400">
            CONFIDENCE: <b className="text-cyan-400 ml-1">{(topToken.probability * 100).toFixed(1)}%</b>
          </div>
        </div>
      </div>

      {/* Top Ranked Predicted Token Spotlight */}
      <div className="p-6 rounded-2xl border border-rose-500/40 bg-gradient-to-r from-space-950 via-rose-950/20 to-space-950 backdrop-blur-xl shadow-glow-neon relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs font-mono text-rose-300">
              <Sparkles className="w-4 h-4 text-rose-400" />
              <span className="font-bold tracking-widest uppercase">MOST PROBABLE CONTINUATION</span>
            </div>

            <div className="flex items-baseline space-x-4">
              <span className="font-mono text-4xl sm:text-5xl font-black text-white tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-white via-rose-100 to-rose-300">
                "{topToken.token}"
              </span>
              <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-rose-950 border border-rose-400 text-rose-300 font-bold">
                RANK #1 // {(topToken.probability * 100).toFixed(1)}%
              </span>
            </div>

            <p className="text-xs text-slate-300 font-sans max-w-xl">
              <span className="text-rose-400 font-semibold font-mono">Semantic Reasoning: </span>
              {topToken.reasoning}
            </p>
          </div>

          {/* Autoregressive Append Button */}
          <button
            onClick={() => {
              soundFx.playExecutionComplete();
              onAppendCandidate(topToken.token);
            }}
            disabled={isExecuting}
            className="px-6 py-3.5 rounded-xl font-orbitron font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 hover:from-rose-400 hover:to-purple-500 text-white shadow-[0_0_25px_rgba(244,63,94,0.5)] hover:shadow-[0_0_35px_rgba(244,63,94,0.8)] transition-all flex items-center space-x-2 shrink-0 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>APPEND & CONTINUE GENERATION</span>
          </button>
        </div>

        {/* Ambient background glow ring */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Candidate Probability Distribution (Top 5 Candidates) */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-space-950/80 backdrop-blur-xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-slate-200">
            <BarChart2 className="w-4 h-4 text-cyan-400" />
            <span>TOP-5 CANDIDATE TOKEN PROBABILITIES</span>
          </div>

          <div className="flex items-center space-x-3 text-xs font-mono">
            <span className="text-slate-400">TEMPERATURE (T):</span>
            <input
              type="range"
              min="0.1"
              max="1.8"
              step="0.05"
              value={temperature}
              onChange={(e) => onChangeTemperature(parseFloat(e.target.value))}
              className="w-24 accent-rose-400 cursor-pointer"
            />
            <span className="text-rose-300 font-bold">{temperature.toFixed(2)}</span>
          </div>
        </div>

        {/* Probability Bars */}
        <div className="space-y-4">
          {candidates.map((cand, idx) => {
            const isWinner = idx === 0;

            return (
              <div
                key={`cand-${cand.id}`}
                className={`p-3.5 rounded-xl border transition-all ${
                  isWinner
                    ? 'bg-rose-950/30 border-rose-500/50 shadow-sm'
                    : 'bg-space-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <span
                      className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-mono font-bold"
                      style={{
                        backgroundColor: isWinner ? '#f43f5e' : '#1e293b',
                        color: isWinner ? '#02040a' : '#94a3b8'
                      }}
                    >
                      #{cand.rank}
                    </span>

                    <span className="font-mono text-base font-bold text-white">
                      "{cand.token}"
                    </span>

                    <span className="text-[11px] font-mono text-slate-500">
                      (Logit: {cand.logit} | Vocab ID: {cand.id})
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-mono font-bold text-cyan-300">
                      {(cand.probability * 100).toFixed(1)}%
                    </span>

                    {/* Quick Select Candidate */}
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        onAppendCandidate(cand.token);
                      }}
                      className="px-2 py-1 rounded bg-space-900 hover:bg-space-800 text-[10px] font-mono border border-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="Append this specific candidate"
                    >
                      Choose
                    </button>
                  </div>
                </div>

                {/* Animated Probability Bar */}
                <div className="h-2 w-full bg-space-950 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      backgroundColor: isWinner ? '#f43f5e' : '#38bdf8'
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${cand.probability * 100}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  />
                </div>

                {/* Linguistic Explanation */}
                <p className="text-[11px] text-slate-400 mt-2 font-sans">
                  {cand.reasoning}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step-by-Step Educational Explanation Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl border border-slate-800 bg-space-950/80 backdrop-blur-xl space-y-3">
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-rose-300 border-b border-slate-800 pb-2">
            <Zap className="w-4 h-4 text-rose-400" />
            <span>SOFTMAX FORMULA & TEMPERATURE SCALING</span>
          </div>

          <div className="p-3 rounded-xl bg-space-900 border border-slate-800 font-mono text-center">
            <MathDisplay block math="P(w_i) = \frac{\exp(z_i / T)}{\sum_{j=1}^{V} \exp(z_j / T)}" />
          </div>

          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            Temperature <MathDisplay math="T" /> divides the raw logit scores before exponentiation.
            As <MathDisplay math="T \to 0" />, the distribution collapses into greedy argmax; as <MathDisplay math="T \to \infty" />, it flattens toward uniform randomness.
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-space-950/80 backdrop-blur-xl space-y-3">
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-cyan-300 border-b border-slate-800 pb-2">
            <RefreshCw className="w-4 h-4 text-cyan-400" />
            <span>AUTOREGRESSIVE DECODING LOOP</span>
          </div>

          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            LLMs generate text one token at a time. The selected token is appended to the input context sequence:
          </p>

          <div className="p-3 rounded-xl bg-space-900 border border-slate-800 font-mono text-xs text-cyan-300">
            <MathDisplay block math="\mathbf{X}_{t+1} = [\mathbf{x}_1, \dots, \mathbf{x}_t, \mathbf{w}_{\text{new}}]" />
          </div>

          <p className="text-[11px] text-slate-500 font-sans">
            The updated sequence then re-enters Stage 01, computing new keys, queries, and attention states for the next cycle.
          </p>
        </div>
      </div>
    </div>
  );
};
