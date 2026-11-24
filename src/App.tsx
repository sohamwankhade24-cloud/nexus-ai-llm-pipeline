import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Navbar } from './components/layout/Navbar';
import { HeroLanding } from './components/landing/HeroLanding';
import { PipelineTrack, STAGES_CONFIG } from './components/pipeline/PipelineTrack';
import { Stage01Input } from './components/stages/Stage01Input';
import { Stage02Tokenization } from './components/stages/Stage02Tokenization';
import { Stage03Embeddings } from './components/stages/Stage03Embeddings';
import { Stage04Attention } from './components/stages/Stage04Attention';
import { Stage05NextToken } from './components/stages/Stage05NextToken';
import { LiveTerminal } from './components/terminal/LiveTerminal';
import { EducationalModal } from './components/educational/EducationalModal';
import { Token, AttentionData, PredictionData, TerminalLog } from './types/pipeline';
import { tokenizeInput, computeSelfAttention, predictNextToken } from './services/llmEngine';
import { PIPELINE_PRESETS } from './services/presets';
import { soundFx } from './components/audio/soundEffects';

export function App() {
  // Navigation & View State
  const [isHeroVisible, setIsHeroVisible] = useState<boolean>(true);
  const [currentStage, setCurrentStage] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'2D' | '3D'>('3D');
  const [isEducationalOpen, setIsEducationalOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Model & Pipeline Inputs
  const [inputText, setInputText] = useState<string>(
    'Attention is all you need for understanding language'
  );
  const [temperature, setTemperature] = useState<number>(0.7);
  const [causalMask, setCausalMask] = useState<boolean>(true);
  const [attentionThreshold, setAttentionThreshold] = useState<number>(0.08);

  // Pipeline Computed Tensors
  const [tokens, setTokens] = useState<Token[]>([]);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [attentionData, setAttentionData] = useState<AttentionData>({
    heads: [],
    averageMatrix: [],
    topConnections: []
  });
  const [prediction, setPrediction] = useState<PredictionData>({
    candidates: [],
    topToken: {
      token: '',
      id: 0,
      logit: 0,
      probability: 0,
      cumulativeProb: 0,
      color: '#00f2fe',
      rank: 1,
      reasoning: ''
    },
    temperature: 0.7,
    contextEmbeddingVector: [],
    entropy: 0
  });

  // Pipeline Execution State & Terminal Logs
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [logs, setLogs] = useState<TerminalLog[]>([]);

  const addLog = useCallback(
    (level: TerminalLog['level'], message: string, stageId?: number, details?: any) => {
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
      const newLog: TerminalLog = {
        id: `${Date.now()}-${Math.random()}`,
        timestamp: timeStr,
        level,
        message,
        stageId,
        details
      };
      setLogs((prev) => [...prev.slice(-120), newLog]);
    },
    []
  );

  // Recompute pipeline tensors
  const runCalculations = useCallback(() => {
    const newTokens = tokenizeInput(inputText);
    setTokens(newTokens);
    if (!selectedToken || !newTokens.some((t) => t.id === selectedToken.id)) {
      setSelectedToken(newTokens[0] || null);
    }

    const newAttention = computeSelfAttention(newTokens, causalMask, 4);
    setAttentionData(newAttention);

    const newPrediction = predictNextToken(newTokens, temperature);
    setPrediction(newPrediction);

    return { tokens: newTokens, attention: newAttention, prediction: newPrediction };
  }, [inputText, causalMask, temperature, selectedToken]);

  // Initial calculation on mount
  useEffect(() => {
    runCalculations();
    addLog('info', 'NEXUS AI v2040 Core Initialized. Quantum tensor engine ready.');
  }, []);

  // Execution flow with stage-by-stage automated stepping & real logging
  const handleExecutePipeline = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    soundFx.playStageTransition();

    addLog('info', `=== INITIALIZING PIPELINE INFERENCE: "${inputText}" ===`);

    // Stage 1
    setCurrentStage(1);
    addLog('info', `[STAGE 01] Ingesting prompt string (${inputText.length} chars). Target temp T = ${temperature}`);
    await new Promise((r) => setTimeout(r, 600));

    // Stage 2
    setCurrentStage(2);
    const calculated = runCalculations();
    soundFx.playTokenBeep(2);
    addLog('tensor', `[STAGE 02] Tokenization complete: ${calculated.tokens.length} subword tokens generated via BPE.`);
    addLog('info', `[STAGE 02] Token IDs: [${calculated.tokens.map((t) => t.id).join(', ')}]`);
    await new Promise((r) => setTimeout(r, 700));

    // Stage 3
    setCurrentStage(3);
    soundFx.playTokenBeep(3);
    addLog('tensor', `[STAGE 03] Continuous embeddings retrieved from W_e (dimension d_model = 16).`);
    addLog('math', `[STAGE 03] Positional harmonics synthesized via PE(pos, 2i) = sin(pos/10000^(2i/d)).`);
    await new Promise((r) => setTimeout(r, 800));

    // Stage 4
    setCurrentStage(4);
    soundFx.playTokenBeep(4);
    addLog('tensor', `[STAGE 04] Scaled dot-product attention computed across 4 multi-heads (d_k = 4).`);
    addLog('math', `[STAGE 04] Softmax applied along sequence rows with causalMask = ${causalMask}.`);
    if (calculated.attention.topConnections.length > 0) {
      const top = calculated.attention.topConnections[0];
      addLog('info', `[STAGE 04] Peak attention relation: "${top.fromToken}" → "${top.toToken}" (${(top.score * 100).toFixed(0)}%).`);
    }
    await new Promise((r) => setTimeout(r, 850));

    // Stage 5
    setCurrentStage(5);
    soundFx.playExecutionComplete();
    addLog('tensor', `[STAGE 05] Terminal context projected to vocabulary logits. Softmax temperature = ${temperature}.`);
    addLog('success', `[STAGE 05] Top predicted token: "${calculated.prediction.topToken.token}" with ${(calculated.prediction.topToken.probability * 100).toFixed(1)}% probability.`);
    addLog('info', `=== PIPELINE EXECUTION FINISHED SUCCESSFULLY ===`);

    // Subtle celebration confetti
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#00f2fe', '#818cf8', '#c084fc', '#f43f5e']
      });
    } catch (e) {}

    setIsExecuting(false);
  };

  // Reset pipeline
  const handleReset = () => {
    setCurrentStage(1);
    setInputText('Attention is all you need for understanding language');
    setSelectedToken(null);
    setTemperature(0.7);
    setCausalMask(true);
    setAttentionThreshold(0.08);
    addLog('info', 'Pipeline parameters reset to factory benchmarks.');
  };

  // Step controls
  const handleStepForward = () => {
    if (currentStage < 5) {
      setCurrentStage((prev) => prev + 1);
      soundFx.playClick();
    }
  };

  const handleStepBackward = () => {
    if (currentStage > 1) {
      setCurrentStage((prev) => prev - 1);
      soundFx.playClick();
    }
  };

  // Preset selection
  const handleSelectPreset = (presetId: string) => {
    const preset = PIPELINE_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setInputText(preset.text);
      addLog('info', `Loaded benchmark preset: "${preset.title}"`);
      // auto compute
      setTimeout(() => {
        runCalculations();
      }, 50);
    }
  };

  // Autoregressive token append
  const handleAppendCandidate = (candidateTokenText: string) => {
    const updated = inputText + candidateTokenText;
    setInputText(updated);
    addLog('success', `Autoregressively appended "${candidateTokenText}" to context sequence.`);
    // Automatically re-run pipeline on the expanded sequence
    setTimeout(() => {
      runCalculations();
    }, 50);
  };

  return (
    <div className="min-h-screen bg-[#02040a] text-slate-100 flex flex-col font-sans select-none">
      {/* Top Futuristic Navbar */}
      <Navbar
        isMuted={isMuted}
        onToggleMute={() => {
          const muted = soundFx.toggleMute();
          setIsMuted(muted);
        }}
        onOpenEducational={() => setIsEducationalOpen(true)}
        onReturnToHero={() => setIsHeroVisible(true)}
        viewMode={viewMode}
        onToggleViewMode={() => setViewMode(viewMode === '2D' ? '3D' : '2D')}
        isHeroVisible={isHeroVisible}
      />

      {/* Main Dynamic View: Epic Hero Landing or Interactive Pipeline */}
      {isHeroVisible ? (
        <HeroLanding
          onEnterPipeline={() => setIsHeroVisible(false)}
          onExplorePresets={(presetId) => {
            handleSelectPreset(presetId);
            setIsHeroVisible(false);
          }}
        />
      ) : (
        <main className="flex-1 pt-16 flex flex-col pb-16">
          {/* Horizontal 5-Stage Connected Pipeline Track */}
          <PipelineTrack
            currentStage={currentStage}
            isExecuting={isExecuting}
            onSelectStage={(stage) => setCurrentStage(stage)}
            onExecute={handleExecutePipeline}
            onReset={handleReset}
            onStepForward={handleStepForward}
            onStepBackward={handleStepBackward}
          />

          {/* Active Stage Detail Visualizer */}
          <div className="flex-1 px-4 lg:px-8 py-8">
            {currentStage === 1 && (
              <Stage01Input
                inputText={inputText}
                onChangeInput={(text) => {
                  setInputText(text);
                  runCalculations();
                }}
                onExecute={handleExecutePipeline}
                isExecuting={isExecuting}
                temperature={temperature}
                onChangeTemperature={(val) => {
                  setTemperature(val);
                  runCalculations();
                }}
                causalMask={causalMask}
                onToggleCausalMask={() => {
                  setCausalMask(!causalMask);
                  runCalculations();
                }}
                attentionThreshold={attentionThreshold}
                onChangeAttentionThreshold={(val) => setAttentionThreshold(val)}
                onSelectPreset={handleSelectPreset}
                tokenCount={tokens.length}
              />
            )}

            {currentStage === 2 && (
              <Stage02Tokenization
                tokens={tokens}
                selectedToken={selectedToken}
                onSelectToken={(token) => setSelectedToken(token)}
                rawText={inputText}
              />
            )}

            {currentStage === 3 && (
              <Stage03Embeddings
                tokens={tokens}
                selectedToken={selectedToken}
                onSelectToken={(token) => setSelectedToken(token)}
                viewMode={viewMode}
                onToggleViewMode={() => setViewMode(viewMode === '2D' ? '3D' : '2D')}
              />
            )}

            {currentStage === 4 && (
              <Stage04Attention
                tokens={tokens}
                attentionData={attentionData}
                threshold={attentionThreshold}
                onChangeThreshold={(val) => setAttentionThreshold(val)}
                selectedToken={selectedToken}
                onSelectToken={(token) => setSelectedToken(token)}
              />
            )}

            {currentStage === 5 && (
              <Stage05NextToken
                prediction={prediction}
                temperature={temperature}
                onChangeTemperature={(val) => {
                  setTemperature(val);
                  runCalculations();
                }}
                onAppendCandidate={handleAppendCandidate}
                isExecuting={isExecuting}
              />
            )}
          </div>

          {/* Real-time AI Inference Terminal */}
          <div className="px-4 lg:px-8 pt-4">
            <LiveTerminal logs={logs} onClearLogs={() => setLogs([])} />
          </div>
        </main>
      )}

      {/* Educational Control Centre Modal */}
      <EducationalModal
        isOpen={isEducationalOpen}
        onClose={() => setIsEducationalOpen(false)}
      />
    </div>
  );
}

export default App;
