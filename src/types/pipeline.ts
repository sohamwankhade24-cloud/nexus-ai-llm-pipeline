export interface Token {
  id: number;
  text: string;
  cleanText: string;
  position: number;
  frequency: number;
  color: string;
  rawEmbedding: number[];
  positionalEmbedding: number[];
  finalEmbedding: number[];
  coords3D: [number, number, number];
}

export interface AttentionHead {
  headIndex: number;
  name: string;
  qVectors: number[][]; // [seqLen x d_k]
  kVectors: number[][]; // [seqLen x d_k]
  vVectors: number[][]; // [seqLen x d_k]
  rawScores: number[][]; // QK^T / sqrt(d_k)
  attentionWeights: number[][]; // Softmax(rawScores)
}

export interface AttentionData {
  heads: AttentionHead[];
  averageMatrix: number[][];
  topConnections: {
    from: number;
    to: number;
    score: number;
    fromToken: string;
    toToken: string;
  }[];
}

export interface CandidateToken {
  token: string;
  id: number;
  logit: number;
  probability: number;
  cumulativeProb: number;
  color: string;
  rank: number;
  reasoning: string;
}

export interface PredictionData {
  candidates: CandidateToken[];
  topToken: CandidateToken;
  temperature: number;
  contextEmbeddingVector: number[];
  entropy: number;
}

export interface StageInfo {
  id: number;
  number: string;
  name: string;
  tagline: string;
  shortDesc: string;
  iconName: string;
  status: 'idle' | 'processing' | 'completed' | 'active';
  latencyMs: number;
}

export interface TerminalLog {
  id: string;
  timestamp: string;
  level: 'info' | 'success' | 'warn' | 'tensor' | 'math';
  stageId?: number;
  message: string;
  details?: Record<string, any>;
}

export interface PipelinePreset {
  id: string;
  title: string;
  text: string;
  category: 'Classic' | 'Philosophy' | 'AI & Science' | 'Creative';
  description: string;
}
