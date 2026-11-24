import React from 'react';
import { motion } from 'framer-motion';
import { 
  Type, 
  Binary, 
  Layers, 
  GitCommit, 
  Sparkles, 
  Play, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { soundFx } from '../audio/soundEffects';

interface PipelineTrackProps {
  currentStage: number; // 1 to 5
  isExecuting: boolean;
  onSelectStage: (stage: number) => void;
  onExecute: () => void;
  onReset: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
}

export const STAGES_CONFIG = [
  {
    id: 1,
    number: '01',
    name: 'TEXT INPUT',
    tagline: 'Raw Prompt Ingestion',
    icon: Type,
    color: '#00f2fe',
    accentBorder: 'border-cyan-400',
    accentGlow: 'shadow-[0_0_20px_rgba(0,242,254,0.5)]',
    bgActive: 'bg-cyan-950/80',
    textActive: 'text-cyan-300'
  },
  {
    id: 2,
    number: '02',
    name: 'TOKENIZATION',
    tagline: 'Subword & Byte-Pair IDs',
    icon: Binary,
    color: '#38bdf8',
    accentBorder: 'border-sky-400',
    accentGlow: 'shadow-[0_0_20px_rgba(56,189,248,0.5)]',
    bgActive: 'bg-sky-950/80',
    textActive: 'text-sky-300'
  },
  {
    id: 3,
    number: '03',
    name: 'EMBEDDINGS',
    tagline: 'Vector Space & Positional PE',
    icon: Layers,
    color: '#818cf8',
    accentBorder: 'border-indigo-400',
    accentGlow: 'shadow-[0_0_20px_rgba(129,140,248,0.5)]',
    bgActive: 'bg-indigo-950/80',
    textActive: 'text-indigo-300'
  },
  {
    id: 4,
    number: '04',
    name: 'SELF-ATTENTION',
    tagline: 'Scaled QKV Multi-Head Dot-Product',
    icon: GitCommit,
    color: '#c084fc',
    accentBorder: 'border-purple-400',
    accentGlow: 'shadow-[0_0_20px_rgba(192,132,252,0.5)]',
    bgActive: 'bg-purple-950/80',
    textActive: 'text-purple-300'
  },
  {
    id: 5,
    number: '05',
    name: 'NEXT-TOKEN PREDICTION',
    tagline: 'Logits, Softmax & Top-5 Probabilities',
    icon: Sparkles,
    color: '#f43f5e',
    accentBorder: 'border-rose-400',
    accentGlow: 'shadow-[0_0_20px_rgba(244,63,94,0.5)]',
    bgActive: 'bg-rose-950/80',
    textActive: 'text-rose-300'
  }
];

export const PipelineTrack: React.FC<PipelineTrackProps> = ({
  currentStage,
  isExecuting,
  onSelectStage,
  onExecute,
  onReset,
  onStepForward,
  onStepBackward
}) => {
  return (
    <div className="w-full bg-space-950/90 border-b border-cyan-500/20 backdrop-blur-md px-4 lg:px-8 py-4">
      {/* Top Controls Bar */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-[11px] font-mono text-cyan-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>ACTIVE STAGE: {currentStage} / 5</span>
          </div>

          <span className="text-xs font-mono text-slate-400 hidden sm:inline">
            // {STAGES_CONFIG[currentStage - 1].tagline}
          </span>
        </div>

        {/* Global Pipeline Action Buttons */}
        <div className="flex items-center space-x-2">
          {/* Step Back */}
          <button
            onClick={() => {
              soundFx.playClick();
              onStepBackward();
            }}
            disabled={currentStage <= 1 || isExecuting}
            className="p-2 rounded-lg border border-slate-800 bg-space-900 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            title="Previous Stage"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Step Forward */}
          <button
            onClick={() => {
              soundFx.playClick();
              onStepForward();
            }}
            disabled={currentStage >= 5 || isExecuting}
            className="p-2 rounded-lg border border-slate-800 bg-space-900 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            title="Next Stage"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Reset Pipeline */}
          <button
            onClick={() => {
              soundFx.playClick();
              onReset();
            }}
            disabled={isExecuting}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg border border-slate-800 bg-space-900 hover:bg-space-800 text-slate-300 hover:text-cyan-300 text-xs font-mono transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">RESET</span>
          </button>

          {/* Execute Full Pipeline Run */}
          <button
            onClick={() => {
              soundFx.playStageTransition();
              onExecute();
            }}
            disabled={isExecuting}
            className={`flex items-center space-x-2 px-5 py-2 rounded-lg font-orbitron font-bold text-xs tracking-wider uppercase transition-all shadow-md ${
              isExecuting
                ? 'bg-cyan-950 text-cyan-400 border border-cyan-500/50 cursor-wait'
                : 'bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 text-space-950 shadow-[0_0_20px_rgba(0,242,254,0.4)] hover:shadow-[0_0_30px_rgba(0,242,254,0.7)] active:scale-95'
            }`}
          >
            {isExecuting ? (
              <>
                <Clock className="w-4 h-4 animate-spin text-cyan-400" />
                <span>COMPUTING...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>EXECUTE PIPELINE</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Horizontal Connected 5-Stage Track */}
      <div className="max-w-7xl mx-auto relative">
        {/* Glowing Background Connection Energy Line */}
        <div className="hidden lg:block absolute top-1/2 left-8 right-8 h-1 -translate-y-1/2 bg-slate-800/80 z-0">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-400 via-sky-400 to-purple-500 shadow-[0_0_15px_rgba(0,242,254,0.8)]"
            initial={{ width: '0%' }}
            animate={{
              width: `${((currentStage - 1) / 4) * 100}%`
            }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />
        </div>

        {/* Five Stage Blocks */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 relative z-10">
          {STAGES_CONFIG.map((stage) => {
            const isActive = currentStage === stage.id;
            const isCompleted = currentStage > stage.id;
            const Icon = stage.icon;

            return (
              <div
                key={stage.id}
                onClick={() => {
                  if (!isExecuting) {
                    soundFx.playClick();
                    onSelectStage(stage.id);
                  }
                }}
                className={`relative p-3 rounded-xl border cursor-pointer transition-all duration-300 flex flex-col justify-between ${
                  isActive
                    ? `${stage.bgActive} ${stage.accentBorder} ${stage.accentGlow} scale-[1.03] ring-1 ring-cyan-400/40`
                    : isCompleted
                    ? 'bg-space-900/90 border-slate-700/80 text-slate-300 hover:border-slate-500'
                    : 'bg-space-950/70 border-slate-800/80 text-slate-500 hover:border-slate-700'
                }`}
              >
                {/* Stage Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-xs font-orbitron font-extrabold ${
                        isActive ? stage.textActive : 'text-slate-400'
                      }`}
                    >
                      {stage.number}
                    </span>
                    <div
                      className={`p-1.5 rounded-lg border ${
                        isActive
                          ? 'bg-cyan-500/20 border-cyan-400/60 text-cyan-300 shadow-[0_0_10px_rgba(0,242,254,0.5)]'
                          : 'bg-space-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Status Indicator */}
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  ) : isActive ? (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
                    </span>
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                  )}
                </div>

                {/* Stage Name & Subtitle */}
                <div>
                  <h4
                    className={`font-orbitron font-bold text-xs tracking-wider uppercase truncate ${
                      isActive ? 'text-white' : 'text-slate-300'
                    }`}
                  >
                    {stage.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5 font-sans">
                    {stage.tagline}
                  </p>
                </div>

                {/* Processing Indicator if actively executing this stage */}
                {isExecuting && isActive && (
                  <motion.div
                    className="absolute -bottom-[2px] left-2 right-2 h-[2px] bg-cyan-400 rounded-full"
                    animate={{ opacity: [0.3, 1, 0.3], scaleX: [0.6, 1, 0.6] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
