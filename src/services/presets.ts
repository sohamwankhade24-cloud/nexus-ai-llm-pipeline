import { PipelinePreset } from '../types/pipeline';

export const PIPELINE_PRESETS: PipelinePreset[] = [
  {
    id: 'preset-attention',
    title: 'Transformer Architecture',
    text: 'Attention is all you need for understanding language',
    category: 'AI & Science',
    description: 'The iconic title from Vaswani et al. (2017) introducing the Transformer model.'
  },
  {
    id: 'preset-cat',
    title: 'Syntactic & Physical Context',
    text: 'The robotic cat rested smoothly upon the glowing charging pad',
    category: 'Classic',
    description: 'Demonstrates spatial relationships, adjectives, and mechanical context tokens.'
  },
  {
    id: 'preset-future-ai',
    title: 'Future Intelligence',
    text: 'Artificial neural networks synthesize human thoughts into coherent digital reality',
    category: 'AI & Science',
    description: 'Complex technical and abstract nouns highlighting multi-head cross-attention.'
  },
  {
    id: 'preset-philosophy',
    title: 'Consciousness & Computation',
    text: 'Does a deep neural model dream in high dimensional vector embeddings',
    category: 'Philosophy',
    description: 'Philosophical inquiry testing semantic clustering of question structures.'
  }
];
