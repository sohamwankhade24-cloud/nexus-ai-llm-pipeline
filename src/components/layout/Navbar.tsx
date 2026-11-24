import React from 'react';
import { Volume2, VolumeX, Maximize2, Minimize2, BookOpen, Sparkles, Activity, Cpu } from 'lucide-react';
import { soundFx } from '../audio/soundEffects';

interface NavbarProps {
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenEducational: () => void;
  onReturnToHero?: () => void;
  viewMode: '2D' | '3D';
  onToggleViewMode: () => void;
  isHeroVisible: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  isMuted,
  onToggleMute,
  onOpenEducational,
  onReturnToHero,
  viewMode,
  onToggleViewMode,
  isHeroVisible
}) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const toggleFullscreen = () => {
    soundFx.playClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 border-b border-cyan-500/20 bg-space-950/80 backdrop-blur-xl px-4 lg:px-8 flex items-center justify-between transition-all">
      {/* Brand Identity */}
      <div className="flex items-center space-x-3 cursor-pointer group" onClick={onReturnToHero}>
        <div className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-400 via-indigo-500 to-purple-600 p-[1px] shadow-glow-cyan">
          <div className="w-full h-full bg-space-950 rounded-[7px] flex items-center justify-center">
            <Cpu className="w-5 h-5 text-cyan-400 group-hover:rotate-45 transition-transform duration-500" />
          </div>
          <div className="absolute -inset-0.5 rounded-lg bg-cyan-400/20 blur opacity-75 group-hover:opacity-100 transition duration-500"></div>
        </div>

        <div>
          <div className="flex items-center space-x-2">
            <span className="font-orbitron font-extrabold text-lg tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-sky-300 to-violet-400">
              NEXUS AI
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-mono tracking-widest uppercase">
              v2040.4
            </span>
          </div>
          <p className="text-[10px] text-slate-400 hidden sm:block tracking-wide font-sans">
            Explore the Intelligence Behind Every Token
          </p>
        </div>
      </div>

      {/* Center Status Telemetry (Visible on md+) */}
      <div className="hidden md:flex items-center space-x-6 text-xs font-mono text-slate-400">
        <div className="flex items-center space-x-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <span className="text-slate-300">CORE STATUS:</span>
          <span className="text-cyan-400 font-semibold">SYNAPTIC ONLINE</span>
        </div>

        <div className="h-3 w-[1px] bg-slate-800" />

        <div className="flex items-center space-x-1.5">
          <Activity className="w-3.5 h-3.5 text-violet-400" />
          <span>LATENCY:</span>
          <span className="text-violet-300 font-semibold">1.4 ms</span>
        </div>

        <div className="h-3 w-[1px] bg-slate-800" />

        <div className="flex items-center space-x-1.5">
          <span>VOCAB:</span>
          <span className="text-slate-200">50,257 BPE</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* 2D / 3D Mode Toggle (When inside pipeline) */}
        {!isHeroVisible && (
          <button
            onClick={() => {
              soundFx.playClick();
              onToggleViewMode();
            }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${
              viewMode === '3D'
                ? 'bg-gradient-to-r from-cyan-950 to-blue-950 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(0,242,254,0.3)]'
                : 'bg-space-900 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle between 2D Matrix and 3D Interactive Space"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-bold">{viewMode} VIEW</span>
          </button>
        )}

        {/* Educational Center Modal */}
        <button
          onClick={() => {
            soundFx.playClick();
            onOpenEducational();
          }}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border border-violet-500/40 bg-violet-950/40 hover:bg-violet-900/50 text-violet-300 transition-all hover:shadow-[0_0_15px_rgba(127,0,255,0.3)]"
        >
          <BookOpen className="w-3.5 h-3.5 text-violet-400" />
          <span className="hidden sm:inline">RESEARCH ARCHIVE</span>
        </button>

        {/* Audio Mute/Unmute */}
        <button
          onClick={onToggleMute}
          className="p-2 rounded-lg border border-slate-800 bg-space-900 hover:bg-space-800 text-slate-300 hover:text-cyan-300 transition-colors"
          title={isMuted ? 'Unmute Futuristic Audio' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-lg border border-slate-800 bg-space-900 hover:bg-space-800 text-slate-300 hover:text-cyan-300 transition-colors"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
