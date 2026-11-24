import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  BookOpen, 
  Cpu, 
  Binary, 
  Layers, 
  GitCommit, 
  Sparkles, 
  ChevronRight,
  Database,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { MathDisplay } from '../ui/MathDisplay';
import { soundFx } from '../audio/soundEffects';

interface EducationalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TOPICS = [
  {
    id: 'transformers',
    title: 'Transformer Architecture',
    subtitle: 'Vaswani et al., 2017',
    icon: Cpu,
    category: 'Foundations',
    formula: '\\text{Transformer}(X) = \\text{LayerNorm}(X + \\text{MultiHead}(X))',
    summary: 'The Transformer replaces recurrent sequential dependencies with global self-attention, allowing massive parallelism and capturing arbitrary-range token interactions across sequences.',
    keyPoints: [
      'Eliminates RNN bottlenecks where memory had to step serially token-by-token.',
      'Operates in O(1) sequential operations per layer, but O(N^2) pairwise attention computation.',
      'Stacked layers of Multi-Head Self-Attention, Feed-Forward Networks, and Residual Connections.'
    ]
  },
  {
    id: 'tokenization',
    title: 'Byte-Pair Encoding (BPE)',
    subtitle: 'From Characters to Subwords',
    icon: Binary,
    category: 'Stage 02',
    formula: 'V_{t+1} = V_t \\cup \\{\\text{arg max}_{(a,b)} \\text{freq}(a,b)\\}',
    summary: 'Tokenization maps unstructured raw Unicode text into a closed vocabulary of discrete integer IDs. Byte-Pair Encoding merges frequent character pairs into reusable subwords.',
    keyPoints: [
      'Balances vocabulary size (typically 32k–100k) with sequence length.',
      'Common words like "attention" form a single token, while rare words are split into subwords.',
      'Handles arbitrary out-of-vocabulary inputs without crashing.'
    ]
  },
  {
    id: 'embeddings',
    title: 'High-Dimensional Embeddings',
    subtitle: 'Semantic Vector Space',
    icon: Layers,
    category: 'Stage 03',
    formula: '\\mathbf{E} \\in \\mathbb{R}^{V \\times d_{\\text{model}}}, \\quad \\mathbf{x}_i = \\mathbf{E}[\\text{token\\_id}_i]',
    summary: 'Tokens are looked up in a continuous learned embedding matrix. Tokens with related semantic meanings or grammatical roles cluster close together in cosine similarity space.',
    keyPoints: [
      'Transforms discrete IDs into dense continuous geometric points.',
      'Enables linear vector arithmetic (e.g. King - Man + Woman = Queen).',
      'Typically ranges from 768 dimensions (GPT-2 Small) up to 8,192+ dimensions (LLaMA-3).'
    ]
  },
  {
    id: 'positional',
    title: 'Positional Encodings (PE)',
    subtitle: 'Injecting Word Sequence Order',
    icon: Database,
    category: 'Stage 03',
    formula: 'PE_{(pos, 2i)} = \\sin\\left(\\frac{pos}{10000^{2i/d}}\\right), \\quad PE_{(pos, 2i+1)} = \\cos\\left(\\frac{pos}{10000^{2i/d}}\\right)',
    summary: 'Because Self-Attention is mathematically permutation-equivariant, the model needs explicit positional encoding to distinguish "dog bites man" from "man bites dog".',
    keyPoints: [
      'Sinusoidal functions produce unique orthogonal geometric fingerprints for every sequence index.',
      'Allows the model to easily learn relative positions via trigonometric angle-addition identities.',
      'Added directly element-wise to the token embedding vectors: x = E + PE.'
    ]
  },
  {
    id: 'qkv',
    title: 'Query, Key & Value (QKV)',
    subtitle: 'Differentiable Information Retrieval',
    icon: GitCommit,
    category: 'Stage 04',
    formula: 'Q = X W_Q, \\quad K = X W_K, \\quad V = X W_V',
    summary: 'Inspired by database retrieval systems: Query is what a token searches for, Key is what a token offers or advertises, and Value is the actual payload information retrieved.',
    keyPoints: [
      'Each token projects its embedding into three specialized subspaces using learned linear weights.',
      'Dot product Q · K^T measures agreement or relevance between querying and advertising tokens.',
      'Softmax weights scale the Value vectors to form the contextualized output.'
    ]
  },
  {
    id: 'attention',
    title: 'Scaled Dot-Product Attention',
    subtitle: 'The Heart of Modern LLMs',
    icon: Sparkles,
    category: 'Stage 04',
    formula: '\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V',
    summary: 'The primary calculation that routes information across the entire sequence. The scaling factor 1/√d_k stabilizes softmax gradients for large vector dimensions.',
    keyPoints: [
      'Multi-Head Attention runs multiple parallel heads (e.g. 8 to 128 heads), allowing the model to attend to syntax, semantics, and facts simultaneously.',
      'Causal masking zeroes out future positions for autoregressive language generation.',
      'Computes an N × N relational map between all tokens in the context window.'
    ]
  },
  {
    id: 'softmax',
    title: 'Softmax & Temperature',
    subtitle: 'Probabilistic Normalization',
    icon: Zap,
    category: 'Stage 05',
    formula: 'P(w_i) = \\frac{\\exp(z_i / T)}{\\sum_{j=1}^{V} \\exp(z_j / T)}',
    summary: 'Softmax transforms unbounded raw real-valued logit scores into a normalized probability distribution summing strictly to 1.0. Temperature T controls entropy and randomness.',
    keyPoints: [
      'T < 1.0 sharpens the distribution, favoring high-confidence top tokens (focused/deterministic).',
      'T > 1.0 flattens the distribution, giving lower-ranked tokens a higher chance (creative/exploratory).',
      'Exponentiation amplifies differences between top logits.'
    ]
  },
  {
    id: 'autoregressive',
    title: 'Autoregressive Decoding',
    subtitle: 'Sequential Token Generation',
    icon: CheckCircle2,
    category: 'Stage 05',
    formula: 'P(W) = \\prod_{t=1}^{T} P(w_t \\mid w_1, w_2, \\dots, w_{t-1})',
    summary: 'Large Language Models generate text by predicting the next token, appending it to the prompt history, and repeating the cycle recursively until an EOS (End of Sequence) token is emitted.',
    keyPoints: [
      'KV Caching saves past key/value states so previous tokens do not need full re-computation at every step.',
      'Sampling strategies include Greedy ArgMax, Top-K, Top-P (Nucleus Sampling), and Min-P.',
      'Complex reasoning emerges from iterating this local conditional probability distribution.'
    ]
  }
];

export const EducationalModal: React.FC<EducationalModalProps> = ({ isOpen, onClose }) => {
  const [selectedTopicId, setSelectedTopicId] = useState<string>('transformers');

  if (!isOpen) return null;

  const currentTopic = TOPICS.find(t => t.id === selectedTopicId) || TOPICS[0];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-space-950/80 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-5xl h-[85vh] rounded-3xl border border-violet-500/40 bg-space-950 shadow-[0_0_50px_rgba(127,0,255,0.3)] flex flex-col overflow-hidden"
        >
          {/* Modal Top Bar */}
          <div className="px-6 py-4 border-b border-violet-500/20 bg-space-900/80 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-violet-950 border border-violet-500/40 text-violet-300">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-orbitron font-bold text-base text-white tracking-wide">
                  NEXUS ARCHIVE // THEORETICAL FOUNDATIONS OF TRANSFORMERS
                </h2>
                <p className="text-xs text-slate-400 font-sans">
                  Rigorous interactive guide to mathematical foundations and operations of LLMs.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                soundFx.playClick();
                onClose();
              }}
              className="p-2 rounded-xl border border-slate-800 bg-space-900 hover:bg-space-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content Split Layout: Sidebar on Left, Detailed Reader on Right */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Topic Sidebar */}
            <div className="w-full md:w-72 border-r border-violet-500/20 p-4 space-y-1.5 overflow-y-auto bg-space-950/60">
              <span className="text-[10px] font-mono uppercase text-slate-500 px-3 tracking-widest font-bold block mb-2">
                CURRICULUM TOPICS
              </span>

              {TOPICS.map((topic) => {
                const isSelected = topic.id === selectedTopicId;
                const Icon = topic.icon;

                return (
                  <button
                    key={topic.id}
                    onClick={() => {
                      soundFx.playClick();
                      setSelectedTopicId(topic.id);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs font-mono transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-violet-950/70 border-violet-400 text-violet-200 font-bold shadow-sm'
                        : 'bg-space-900/40 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-violet-400' : 'text-slate-500'}`} />
                      <span className="truncate">{topic.title}</span>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-violet-400' : 'text-slate-600'}`} />
                  </button>
                );
              })}
            </div>

            {/* Topic Details Reader View */}
            <div className="flex-1 p-6 sm:p-8 overflow-y-auto space-y-6">
              {/* Topic Header */}
              <div className="border-b border-slate-800 pb-4">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-950 border border-violet-500/40 text-violet-300 uppercase tracking-widest font-bold">
                  {currentTopic.category}
                </span>
                <h3 className="font-orbitron font-extrabold text-2xl text-white mt-2">
                  {currentTopic.title}
                </h3>
                <p className="text-xs font-mono text-cyan-400 mt-0.5">
                  // {currentTopic.subtitle}
                </p>
              </div>

              {/* KaTeX Mathematical Box */}
              <div className="p-5 rounded-2xl border border-violet-500/30 bg-space-900/80 shadow-glow-purple text-center font-mono">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-2">
                  GOVERNING EQUATION
                </span>
                <div className="text-base sm:text-lg text-violet-200 overflow-x-auto py-2">
                  <MathDisplay block math={currentTopic.formula} />
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono uppercase tracking-widest text-slate-300 font-bold">
                  CONCEPT OVERVIEW
                </h4>
                <p className="text-sm text-slate-300 font-sans leading-relaxed">
                  {currentTopic.summary}
                </p>
              </div>

              {/* Architectural Key Points */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-widest text-slate-300 font-bold">
                  KEY PRINCIPLES & MECHANICS
                </h4>
                <div className="space-y-2">
                  {currentTopic.keyPoints.map((point, idx) => (
                    <div
                      key={`pt-${idx}`}
                      className="p-3 rounded-xl bg-space-900/60 border border-slate-800 flex items-start space-x-3 text-xs text-slate-300 font-sans"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
