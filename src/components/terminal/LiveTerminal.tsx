import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Trash2, Copy, Check, ChevronDown, ChevronUp, Cpu, Maximize2 } from 'lucide-react';
import { TerminalLog } from '../../types/pipeline';
import { soundFx } from '../audio/soundEffects';

interface LiveTerminalProps {
  logs: TerminalLog[];
  onClearLogs: () => void;
}

export const LiveTerminal: React.FC<LiveTerminalProps> = ({ logs, onClearLogs }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'tensor' | 'math' | 'info'>('all');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current && !isCollapsed) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isCollapsed]);

  const handleCopyLogs = () => {
    soundFx.playClick();
    const text = logs.map(l => `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredLogs = logs.filter(l => {
    if (selectedFilter === 'all') return true;
    return l.level === selectedFilter;
  });

  return (
    <div className="w-full max-w-6xl mx-auto rounded-2xl border border-cyan-500/30 bg-space-950/95 backdrop-blur-xl shadow-glow-cyan overflow-hidden transition-all">
      {/* Terminal Title Bar */}
      <div className="px-4 py-3 bg-space-900/90 border-b border-cyan-500/20 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>

          <div className="h-3 w-[1px] bg-slate-700" />

          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-cyan-300">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>NEXUS AI // REAL-TIME INFERENCE LOG</span>
          </div>

          <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-400 font-mono hidden sm:inline">
            LIVE EVENTS: {logs.length}
          </span>
        </div>

        {/* Filter & Action Buttons */}
        <div className="flex items-center space-x-2">
          {/* Level Filters */}
          <div className="hidden sm:flex items-center space-x-1 text-[10px] font-mono mr-2">
            {(['all', 'tensor', 'math', 'info'] as const).map(lvl => (
              <button
                key={lvl}
                onClick={() => setSelectedFilter(lvl)}
                className={`px-2 py-0.5 rounded uppercase transition-colors ${
                  selectedFilter === lvl
                    ? 'bg-cyan-900/60 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          {/* Copy Logs */}
          <button
            onClick={handleCopyLogs}
            className="p-1.5 rounded hover:bg-space-800 text-slate-400 hover:text-cyan-300 transition-colors"
            title="Copy Logs to Clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Clear Logs */}
          <button
            onClick={() => {
              soundFx.playClick();
              onClearLogs();
            }}
            className="p-1.5 rounded hover:bg-space-800 text-slate-400 hover:text-rose-400 transition-colors"
            title="Clear Logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* Collapse/Expand */}
          <button
            onClick={() => {
              soundFx.playClick();
              setIsCollapsed(!isCollapsed);
            }}
            className="p-1.5 rounded hover:bg-space-800 text-slate-400 hover:text-white transition-colors"
            title={isCollapsed ? 'Expand Terminal' : 'Collapse Terminal'}
          >
            {isCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      {!isCollapsed && (
        <div
          ref={scrollRef}
          className="p-4 h-48 overflow-y-auto font-mono text-xs space-y-1.5 scrollbar-thin scrollbar-thumb-cyan-500/20 bg-space-950/80"
        >
          {filteredLogs.length === 0 ? (
            <div className="text-slate-500 italic py-4 text-center">
              Awaiting pipeline triggers. Execute a prompt to stream live tensor calculations.
            </div>
          ) : (
            filteredLogs.map((log) => {
              const isTensor = log.level === 'tensor';
              const isMath = log.level === 'math';
              const isSuccess = log.level === 'success';

              return (
                <div key={log.id} className="flex items-start space-x-2 leading-relaxed">
                  <span className="text-slate-500 select-none">[{log.timestamp}]</span>
                  
                  <span
                    className={`font-bold uppercase text-[10px] px-1.5 rounded ${
                      isTensor
                        ? 'bg-indigo-950 text-indigo-300 border border-indigo-500/30'
                        : isMath
                        ? 'bg-purple-950 text-purple-300 border border-purple-500/30'
                        : isSuccess
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                        : 'bg-space-900 text-cyan-300'
                    }`}
                  >
                    {log.level}
                  </span>

                  <span
                    className={`flex-1 ${
                      isSuccess ? 'text-emerald-300 font-semibold' : 'text-slate-200'
                    }`}
                  >
                    {log.message}
                  </span>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
