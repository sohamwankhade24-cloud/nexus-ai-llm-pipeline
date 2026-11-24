import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Terminal, Cpu, Database, Eye } from 'lucide-react';
import { NeuralBrain3D } from '../canvas/NeuralBrain3D';
import { BackgroundParticles3D } from '../canvas/BackgroundParticles3D';
import { MathDisplay } from '../ui/MathDisplay';
import { soundFx } from '../audio/soundEffects';

interface HeroLandingProps {
  onEnterPipeline: () => void;
  onExplorePresets: (presetId: string) => void;
}

export const HeroLanding: React.FC<HeroLandingProps> = ({ onEnterPipeline, onExplorePresets }) => {
  const handleEnter = () => {
    soundFx.playStageTransition();
    onEnterPipeline();
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-between overflow-hidden bg-[#02040a] pt-16 select-none">
      {/* 3D Background Canvas */}
      <div className="absolute inset-0 z-0">
        <Canvas
          camera={{ position: [0, 0, 7.5], fov: 45 }}
          gl={{ antialias: true, alpha: true }}
        >
          <color attach="background" args={['#02040a']} />
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={1.5} color="#00f2fe" />
          <pointLight position={[-10, -10, -10]} intensity={1.5} color="#e100ff" />
          
          <Suspense fallback={null}>
            <BackgroundParticles3D />
            <NeuralBrain3D isPulsing={true} />
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              autoRotate={false}
              maxPolarAngle={Math.PI / 1.7}
              minPolarAngle={Math.PI / 2.3}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Cybernetic Radial Grid & Vignette Overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#02040a_85%)] z-[1]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#00f2fe05_1px,transparent_1px),linear-gradient(to_bottom,#00f2fe05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] z-[1]" />

      {/* Floating Mathematical Equations (Holographic HUD Badges) */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4, duration: 1 }}
        className="pointer-events-none absolute left-6 lg:left-16 top-28 z-10 hidden md:block"
      >
        <div className="glass-panel p-3.5 rounded-xl border border-cyan-500/30 bg-space-950/70 backdrop-blur-md shadow-glow-cyan text-xs font-mono text-cyan-300 space-y-1">
          <div className="flex items-center space-x-2 text-[10px] text-cyan-400/70 uppercase tracking-widest font-bold">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>ATTENTION MECHANISM</span>
          </div>
          <div className="pt-1">
            <MathDisplay math="Attention(Q,K,V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V" />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6, duration: 1 }}
        className="pointer-events-none absolute right-6 lg:right-16 top-36 z-10 hidden md:block"
      >
        <div className="glass-panel p-3.5 rounded-xl border border-violet-500/30 bg-space-950/70 backdrop-blur-md shadow-glow-purple text-xs font-mono text-violet-300 space-y-1">
          <div className="flex items-center space-x-2 text-[10px] text-violet-400/70 uppercase tracking-widest font-bold">
            <Cpu className="w-3 h-3 text-violet-400" />
            <span>POSITIONAL HARMONICS</span>
          </div>
          <div className="pt-1">
            <MathDisplay math="PE_{(pos, 2i)} = \sin\left(\frac{pos}{10000^{2i/d_{model}}}\right)" />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 1 }}
        className="pointer-events-none absolute right-8 lg:right-24 bottom-32 z-10 hidden lg:block"
      >
        <div className="glass-panel p-3 rounded-xl border border-pink-500/30 bg-space-950/70 backdrop-blur-md text-xs font-mono text-pink-300 space-y-1">
          <div className="flex items-center space-x-2 text-[10px] text-pink-400/70 uppercase tracking-widest font-bold">
            <Database className="w-3 h-3 text-pink-400" />
            <span>TEMPERATURE SOFTMAX</span>
          </div>
          <div className="pt-1">
            <MathDisplay math="P(w_i) = \frac{\exp(z_i / T)}{\sum_j \exp(z_j / T)}" />
          </div>
        </div>
      </motion.div>

      {/* Hero Central Header Content */}
      <div className="relative z-10 text-center max-w-4xl px-4 pt-12 lg:pt-16 flex flex-col items-center">
        {/* Futuristic Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border border-cyan-400/40 bg-cyan-950/40 backdrop-blur-md mb-6 shadow-glow-cyan"
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-mono text-cyan-300 font-semibold tracking-widest uppercase">
            NEURAL RESEARCH LABORATORY 2040
          </span>
        </motion.div>

        {/* Large Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="font-orbitron text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white mb-6 uppercase"
        >
          INSIDE THE MIND <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-sky-300 to-violet-500 drop-shadow-[0_0_35px_rgba(0,242,254,0.4)]">
            OF ARTIFICIAL INTELLECT
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.8 }}
          className="text-slate-300 text-base sm:text-xl max-w-2xl font-sans font-light leading-relaxed mb-10"
        >
          Discover how machines understand, process and generate human language through five interactive, mathematically rigorous stages.
        </motion.p>

        {/* Glowing Portal Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <button
            onClick={handleEnter}
            className="group relative px-8 py-4 rounded-xl font-orbitron font-bold text-sm tracking-wider uppercase text-space-950 bg-gradient-to-r from-cyan-400 via-sky-300 to-cyan-400 hover:from-cyan-300 hover:to-sky-200 transition-all duration-300 shadow-[0_0_30px_rgba(0,242,254,0.6)] hover:shadow-[0_0_50px_rgba(0,242,254,0.9)] hover:scale-105 active:scale-95 flex items-center space-x-3"
          >
            <Sparkles className="w-5 h-5 text-space-950" />
            <span>ENTER THE PIPELINE</span>
            <ArrowRight className="w-5 h-5 text-space-950 group-hover:translate-x-1.5 transition-transform" />
            
            {/* Glowing outer pulse ring */}
            <span className="absolute -inset-1 rounded-xl bg-cyan-400/40 blur-md group-hover:blur-lg transition-all -z-10 animate-pulse-slow" />
          </button>
        </motion.div>

        {/* Live Interaction Hint */}
        <p className="mt-4 text-xs font-mono text-cyan-400/60 flex items-center space-x-1.5">
          <Eye className="w-3.5 h-3.5" />
          <span>Interactive 3D Brain: Click and drag to orbit cortex</span>
        </p>
      </div>

      {/* Bottom Quick-Start Stage Cards / Presets */}
      <div className="relative z-10 w-full max-w-6xl px-4 py-8">
        <div className="text-center mb-3">
          <span className="text-[11px] font-mono tracking-widest text-slate-400 uppercase">
            SELECT A BENCHMARK QUERY OR CUSTOMIZE YOUR OWN
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              id: 'preset-attention',
              title: 'Attention Is All You Need',
              tag: 'TRANSFORMER FOUNDATION',
              color: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/40 text-cyan-300',
              badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-500/40'
            },
            {
              id: 'preset-cat',
              title: 'Robotic Cat Upon Charging Pad',
              tag: 'SPATIAL & PHYSICAL SYNTAX',
              color: 'from-violet-500/20 to-purple-500/10 border-violet-500/40 text-violet-300',
              badgeColor: 'bg-violet-950 text-violet-300 border-violet-500/40'
            },
            {
              id: 'preset-future-ai',
              title: 'Neural Networks Synthesize Reality',
              tag: 'MULTI-HEAD CROSS-ATTENTION',
              color: 'from-pink-500/20 to-rose-500/10 border-pink-500/40 text-pink-300',
              badgeColor: 'bg-pink-950 text-pink-300 border-pink-500/40'
            },
            {
              id: 'preset-philosophy',
              title: 'Does A Neural Model Dream?',
              tag: 'SEMANTIC HIGH DIMENSIONS',
              color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/40 text-emerald-300',
              badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
            }
          ].map((item) => (
            <div
              key={item.id}
              onClick={() => {
                soundFx.playClick();
                onExplorePresets(item.id);
              }}
              className={`p-3.5 rounded-xl border bg-gradient-to-b ${item.color} backdrop-blur-md cursor-pointer hover:scale-[1.02] hover:border-cyan-400 transition-all duration-200 group flex flex-col justify-between`}
            >
              <div>
                <span className={`text-[9px] px-2 py-0.5 rounded border font-mono font-bold tracking-wider ${item.badgeColor}`}>
                  {item.tag}
                </span>
                <p className="mt-2 text-sm font-semibold text-slate-100 group-hover:text-cyan-200 transition-colors">
                  "{item.title}"
                </p>
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Launch Stage 01</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-cyan-400" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
