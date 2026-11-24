import { Token, AttentionData, AttentionHead, PredictionData, CandidateToken } from '../types/pipeline';

// Cyberpunk neon colors for token chips
const TOKEN_COLORS = [
  '#00f2fe', // Electric Cyan
  '#7f00ff', // Deep Violet
  '#e100ff', // Magenta
  '#00ffcc', // Neon Green
  '#4facfe', // Sky Blue
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#8b5cf6', // Purple
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#a855f7', // Fuchsia
];

// Hash function for deterministic values
function hashString(str: string, seed: number = 0): number {
  let h = seed ^ 0xdeadbeef;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 2654435761);
  }
  return (h ^ (h >>> 16)) >>> 0;
}

// Pseudo-random float between 0 and 1 from seed
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Dot product of two vectors
export function dotProduct(a: number[], b: number[]): number {
  let sum = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    sum += a[i] * b[i];
  }
  return sum;
}

// Vector magnitude
export function vectorMagnitude(a: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += a[i] * a[i];
  }
  return Math.sqrt(sum);
}

// Cosine similarity
export function cosineSimilarity(a: number[], b: number[]): number {
  const magA = vectorMagnitude(a);
  const magB = vectorMagnitude(b);
  if (magA === 0 || magB === 0) return 0;
  return dotProduct(a, b) / (magA * magB);
}

// Tokenize text into BPE-like subwords and tokens
export function tokenizeInput(text: string): Token[] {
  if (!text || text.trim().length === 0) {
    text = "Attention is all you need";
  }

  // Split preserving spaces and punctuation
  const rawPieces = text.match(/\w+|[^\w\s]|\s+/g) || [text];
  const cleanedTokens: { text: string; cleanText: string }[] = [];

  for (let i = 0; i < rawPieces.length; i++) {
    const piece = rawPieces[i];
    if (piece.trim() === '') {
      // It's whitespace - attach as leading indicator for next token if possible
      if (i + 1 < rawPieces.length) {
        rawPieces[i + 1] = ' ' + rawPieces[i + 1];
      }
      continue;
    }

    // Check for common subwords (e.g., "understanding" -> "under", "standing", or "Transformers" -> "Transform", "ers")
    const clean = piece.replace(/\s+/g, '');
    if (clean.length > 7 && /^[A-Za-z]+$/.test(clean) && !['attention', 'language'].includes(clean.toLowerCase())) {
      const splitPoint = Math.floor(clean.length * 0.55);
      const part1 = piece.startsWith(' ') ? ' ' + clean.slice(0, splitPoint) : clean.slice(0, splitPoint);
      const part2 = '##' + clean.slice(splitPoint);
      cleanedTokens.push({ text: part1, cleanText: clean.slice(0, splitPoint) });
      cleanedTokens.push({ text: part2, cleanText: clean.slice(splitPoint) });
    } else {
      cleanedTokens.push({ text: piece, cleanText: clean });
    }
  }

  // Count frequencies
  const freqMap = new Map<string, number>();
  cleanedTokens.forEach(t => {
    const key = t.cleanText.toLowerCase();
    freqMap.set(key, (freqMap.get(key) || 0) + 1);
  });

  const embeddingDim = 16;

  return cleanedTokens.map((t, idx) => {
    // Generate deterministic realistic GPT-2 style token ID (between 1000 and 49999)
    const baseHash = hashString(t.cleanText.toLowerCase(), 42);
    const id = 1000 + (baseHash % 48999);
    const color = TOKEN_COLORS[idx % TOKEN_COLORS.length];

    // Generate Raw Semantic Embedding (16 dimensions)
    const rawEmbedding: number[] = [];
    for (let d = 0; d < embeddingDim; d++) {
      const dimHash = hashString(t.cleanText.toLowerCase() + `_dim_${d}`, 1337 + d);
      // Normalized between -1 and 1 with semantic clustering
      const val = (pseudoRandom(dimHash) * 2 - 1) * 0.85;
      rawEmbedding.push(parseFloat(val.toFixed(4)));
    }

    // Sinusoidal Positional Encoding (Transformer paper formula)
    // PE(pos, 2i) = sin(pos / 10000^(2i/d_model))
    // PE(pos, 2i+1) = cos(pos / 10000^(2i/d_model))
    const positionalEmbedding: number[] = [];
    for (let i = 0; i < embeddingDim; i++) {
      const exponent = (2 * Math.floor(i / 2)) / embeddingDim;
      const angle = idx / Math.pow(10000, exponent);
      const pe = i % 2 === 0 ? Math.sin(angle) : Math.cos(angle);
      positionalEmbedding.push(parseFloat(pe.toFixed(4)));
    }

    // Final Combined Embedding = Raw Embedding + Positional Encoding
    const finalEmbedding = rawEmbedding.map((val, d) => {
      return parseFloat((val + positionalEmbedding[d] * 0.4).toFixed(4));
    });

    // 3D coordinates projected via PCA-like dimensions for 3D vector space
    // We spread them out aesthetically in a 3D bubble
    const coordX = (finalEmbedding[0] * 3.5) + (pseudoRandom(id + 1) - 0.5) * 1.5;
    const coordY = (finalEmbedding[1] * 3.5) + (pseudoRandom(id + 2) - 0.5) * 1.5;
    const coordZ = (finalEmbedding[2] * 3.5) + (pseudoRandom(id + 3) - 0.5) * 1.5;

    return {
      id,
      text: t.text,
      cleanText: t.cleanText,
      position: idx,
      frequency: freqMap.get(t.cleanText.toLowerCase()) || 1,
      color,
      rawEmbedding,
      positionalEmbedding,
      finalEmbedding,
      coords3D: [
        parseFloat(coordX.toFixed(2)),
        parseFloat(coordY.toFixed(2)),
        parseFloat(coordZ.toFixed(2))
      ]
    };
  });
}

// Compute Self-Attention: Q, K, V projections and Scaled Dot-Product Attention
export function computeSelfAttention(
  tokens: Token[],
  causalMask: boolean = false,
  numHeads: number = 4
): AttentionData {
  const seqLen = tokens.length;
  const dModel = 16;
  const dK = dModel / numHeads; // 4 dimensions per head
  const sqrtDk = Math.sqrt(dK);

  const headNames = [
    'Head 1: Syntactic Relations',
    'Head 2: Semantic Alignment',
    'Head 3: Positional Proximity',
    'Head 4: Long-Range Dependencies'
  ];

  const heads: AttentionHead[] = [];

  for (let h = 0; h < numHeads; h++) {
    // Generate deterministic projection weight matrices W_Q, W_K, W_V for this head
    // Dimensions: [dModel x dK]
    const wQ: number[][] = [];
    const wK: number[][] = [];
    const wV: number[][] = [];

    for (let r = 0; r < dModel; r++) {
      wQ[r] = [];
      wK[r] = [];
      wV[r] = [];
      for (let c = 0; c < dK; c++) {
        wQ[r][c] = (pseudoRandom(hashString(`h${h}_wq_${r}_${c}`, 101)) * 2 - 1) * 0.5;
        wK[r][c] = (pseudoRandom(hashString(`h${h}_wk_${r}_${c}`, 202)) * 2 - 1) * 0.5;
        wV[r][c] = (pseudoRandom(hashString(`h${h}_wv_${r}_${c}`, 303)) * 2 - 1) * 0.5;
      }
    }

    // Project Token Final Embeddings X -> Q, K, V
    // Q = X * W_Q,  K = X * W_K,  V = X * W_V
    const qVectors: number[][] = [];
    const kVectors: number[][] = [];
    const vVectors: number[][] = [];

    for (let i = 0; i < seqLen; i++) {
      const x = tokens[i].finalEmbedding;
      const q: number[] = new Array(dK).fill(0);
      const k: number[] = new Array(dK).fill(0);
      const v: number[] = new Array(dK).fill(0);

      for (let c = 0; c < dK; c++) {
        for (let r = 0; r < dModel; r++) {
          q[c] += x[r] * wQ[r][c];
          k[c] += x[r] * wK[r][c];
          v[c] += x[r] * wV[r][c];
        }
        q[c] = parseFloat(q[c].toFixed(4));
        k[c] = parseFloat(k[c].toFixed(4));
        v[c] = parseFloat(v[c].toFixed(4));
      }
      qVectors.push(q);
      kVectors.push(k);
      vVectors.push(v);
    }

    // Raw Attention Scores: S = (Q * K^T) / sqrt(d_k)
    const rawScores: number[][] = [];
    for (let i = 0; i < seqLen; i++) {
      rawScores[i] = [];
      for (let j = 0; j < seqLen; j++) {
        if (causalMask && j > i) {
          rawScores[i][j] = -1e9; // Causal mask
        } else {
          const dot = dotProduct(qVectors[i], kVectors[j]);
          // Scale by sqrt(d_k)
          rawScores[i][j] = parseFloat((dot / sqrtDk).toFixed(4));
        }
      }
    }

    // Softmax: Attention Weights A_ij = exp(S_ij) / sum(exp(S_ik))
    const attentionWeights: number[][] = [];
    for (let i = 0; i < seqLen; i++) {
      attentionWeights[i] = [];
      // Find max for numerical stability
      let maxScore = -Infinity;
      for (let j = 0; j < seqLen; j++) {
        if (rawScores[i][j] > maxScore) maxScore = rawScores[i][j];
      }

      let expSum = 0;
      const exps: number[] = [];
      for (let j = 0; j < seqLen; j++) {
        if (causalMask && j > i) {
          exps[j] = 0;
        } else {
          const e = Math.exp(rawScores[i][j] - maxScore);
          exps[j] = e;
          expSum += e;
        }
      }

      for (let j = 0; j < seqLen; j++) {
        const weight = expSum > 0 ? exps[j] / expSum : (i === j ? 1 : 0);
        attentionWeights[i][j] = parseFloat(weight.toFixed(4));
      }
    }

    heads.push({
      headIndex: h,
      name: headNames[h] || `Head ${h + 1}`,
      qVectors,
      kVectors,
      vVectors,
      rawScores,
      attentionWeights
    });
  }

  // Compute Average Matrix across all heads
  const averageMatrix: number[][] = [];
  for (let i = 0; i < seqLen; i++) {
    averageMatrix[i] = [];
    for (let j = 0; j < seqLen; j++) {
      let sum = 0;
      for (let h = 0; h < numHeads; h++) {
        sum += heads[h].attentionWeights[i][j];
      }
      averageMatrix[i][j] = parseFloat((sum / numHeads).toFixed(4));
    }
  }

  // Extract top attention connections (excluding self-attention if possible)
  const connections: { from: number; to: number; score: number; fromToken: string; toToken: string }[] = [];
  for (let i = 0; i < seqLen; i++) {
    for (let j = 0; j < seqLen; j++) {
      if (i !== j && averageMatrix[i][j] > 0.12) {
        connections.push({
          from: i,
          to: j,
          score: averageMatrix[i][j],
          fromToken: tokens[i].text.trim(),
          toToken: tokens[j].text.trim()
        });
      }
    }
  }
  connections.sort((a, b) => b.score - a.score);

  return {
    heads,
    averageMatrix,
    topConnections: connections.slice(0, 12)
  };
}

// Next Token Prediction with Temperature
export function predictNextToken(
  tokens: Token[],
  temperature: number = 0.7
): PredictionData {
  if (tokens.length === 0) {
    const dummy: CandidateToken = {
      token: '...',
      id: 999,
      logit: 5.0,
      probability: 1.0,
      cumulativeProb: 1.0,
      color: '#00f2fe',
      rank: 1,
      reasoning: 'Default token'
    };
    return {
      candidates: [dummy],
      topToken: dummy,
      temperature,
      contextEmbeddingVector: [0, 0, 0, 0],
      entropy: 0.1
    };
  }

  const lastToken = tokens[tokens.length - 1];
  const fullText = tokens.map(t => t.text).join('').toLowerCase().trim();

  // Smart context-aware candidates dictionary
  type CandidateCandidate = {
    token: string;
    logitBias: number;
    reasoning: string;
  };

  let candidatePool: CandidateCandidate[] = [];

  if (fullText.includes('attention is all you need')) {
    candidatePool = [
      { token: ' to', logitBias: 4.8, reasoning: 'Infinitive verb phrase continuation (need to + verb).' },
      { token: ' for', logitBias: 4.2, reasoning: 'Prepositional purpose clause (all you need for...).' },
      { token: ' in', logitBias: 3.1, reasoning: 'Locative context preposition (need in modern transformers).' },
      { token: ' .', logitBias: 2.8, reasoning: 'Punctuation terminating the iconic paper title sentence.' },
      { token: ' when', logitBias: 2.3, reasoning: 'Subordinate clause conditional continuation.' },
    ];
  } else if (fullText.includes('cat') || fullText.includes('dog') || fullText.includes('mat')) {
    candidatePool = [
      { token: ' and', logitBias: 4.6, reasoning: 'Coordinating conjunction joining subsequent animal behavior.' },
      { token: ' quietly', logitBias: 3.9, reasoning: 'Adverb qualifying the resting or sitting state.' },
      { token: ' while', logitBias: 3.4, reasoning: 'Temporal clause describing concurrent surrounding motion.' },
      { token: ' in', logitBias: 2.9, reasoning: 'Prepositional spatial anchoring.' },
      { token: ' .', logitBias: 2.7, reasoning: 'Sentence conclusion period.' }
    ];
  } else if (fullText.includes('neural') || fullText.includes('artificial') || fullText.includes('model') || fullText.includes('intelligence')) {
    candidatePool = [
      { token: ' models', logitBias: 4.7, reasoning: 'Core ML entity continuation following neural/artificial.' },
      { token: ' architectures', logitBias: 4.1, reasoning: 'High-probability technical noun describing transformer design.' },
      { token: ' across', logitBias: 3.5, reasoning: 'Preposition indicating generalization across domains.' },
      { token: ' with', logitBias: 3.0, reasoning: 'Complementary feature specification clause.' },
      { token: ' efficiently', logitBias: 2.6, reasoning: 'Computational optimization adverb.' }
    ];
  } else if (fullText.endsWith('?')) {
    candidatePool = [
      { token: ' Yes', logitBias: 4.3, reasoning: 'Affirmative response token answering interrogative prompt.' },
      { token: ' The', logitBias: 3.8, reasoning: 'Definite article introducing explanatory justification.' },
      { token: ' Perhaps', logitBias: 3.2, reasoning: 'Speculative epistemic marker suitable for philosophy.' },
      { token: ' In', logitBias: 2.9, reasoning: 'Context framing prepositional opening.' },
      { token: ' It', logitBias: 2.5, reasoning: 'Pronoun subject referencing queried phenomenon.' }
    ];
  } else {
    // General semantic continuation based on last token hash
    const hash = hashString(lastToken.cleanText);
    const genericWords = [
      { token: ' with', bias: 4.2, r: 'Preposition connecting attribute' },
      { token: ' that', bias: 3.8, r: 'Relative clause introducing property' },
      { token: ' in', bias: 3.5, r: 'Locational or domain preposition' },
      { token: ' and', bias: 3.1, r: 'Conjunction extending clause' },
      { token: ' .', bias: 2.8, r: 'Sentence terminator' },
      { token: ' through', bias: 2.4, r: 'Instrumental modifier' },
      { token: ' which', bias: 2.1, r: 'Non-restrictive relative clause' }
    ];
    candidatePool = genericWords.slice(0, 5).map(g => ({
      token: g.token,
      logitBias: g.bias + (pseudoRandom(hash) * 0.6 - 0.3),
      reasoning: g.r
    }));
  }

  // Safe temperature clamp
  const safeTemp = Math.max(0.05, Math.min(2.0, temperature));

  // Compute scaled logits and softmax: P_i = exp(logit_i / T) / sum(exp(logit_j / T))
  const logits = candidatePool.map(c => c.logitBias);
  const maxScaledLogit = Math.max(...logits.map(l => l / safeTemp));

  const exps = logits.map(l => Math.exp((l / safeTemp) - maxScaledLogit));
  const sumExp = exps.reduce((acc, val) => acc + val, 0);

  const rawProbabilities = exps.map(e => e / sumExp);

  // Calculate Shannon entropy: H = -sum(p * log2(p))
  let entropy = 0;
  rawProbabilities.forEach(p => {
    if (p > 0.0001) {
      entropy -= p * Math.log2(p);
    }
  });

  let cumulative = 0;
  const candidates: CandidateToken[] = candidatePool.map((c, i) => {
    const prob = rawProbabilities[i];
    cumulative += prob;
    const tokenHash = hashString(c.token);
    const id = 500 + (tokenHash % 49500);

    return {
      token: c.token,
      id,
      logit: parseFloat(c.logitBias.toFixed(2)),
      probability: parseFloat(prob.toFixed(4)),
      cumulativeProb: parseFloat(cumulative.toFixed(4)),
      color: TOKEN_COLORS[i % TOKEN_COLORS.length],
      rank: i + 1,
      reasoning: c.reasoning
    };
  });

  // Sort descending by probability
  candidates.sort((a, b) => b.probability - a.probability);
  candidates.forEach((c, idx) => {
    c.rank = idx + 1;
  });

  return {
    candidates,
    topToken: candidates[0],
    temperature: safeTemp,
    contextEmbeddingVector: lastToken.finalEmbedding.slice(0, 8),
    entropy: parseFloat(entropy.toFixed(3))
  };
}
