export type FeatureStatus = 'stable' | 'beta' | 'deprecated' | 'broken' | 'maintenance';
export type FeaturePriority = 'critical' | 'high' | 'medium' | 'low';

export interface FeatureItem {
  id: string;
  name: string;
  status: FeatureStatus;
  version: string;
  priority: FeaturePriority;
  healthCheckEndpoint?: string;
  toggleable: boolean;
  isActive: boolean;
  description: string;
}

export const INITIAL_FEATURES: FeatureItem[] = [
  {
    id: 'audio-pitch-core',
    name: 'Pitch Detection Core',
    status: 'stable',
    version: 'v3.2',
    priority: 'critical',
    toggleable: true,
    isActive: true,
    description: 'Motor principal de processamento de sinal para reconhecimento de notas em tempo real.'
  },
  {
    id: 'metronome-engine',
    name: 'High-Precision Metronome',
    status: 'stable',
    version: 'v1.4',
    priority: 'medium',
    toggleable: true,
    isActive: true,
    description: 'Scheduler de áudio de baixa latência para sincronia rítmica.'
  },
  {
    id: 'payment-gateway',
    name: 'Stripe Payment Gateway',
    status: 'beta',
    version: 'v0.8',
    priority: 'high',
    toggleable: true,
    isActive: true,
    description: 'Integração para checkout de assinaturas e compra de OlieCoins.'
  },
  {
    id: 'classroom-tv',
    name: 'Classroom TV Mode',
    status: 'stable',
    version: 'v2.1',
    priority: 'medium',
    toggleable: true,
    isActive: true,
    description: 'Interface de alta resolução otimizada para projetores e TVs de sala de aula.'
  },
  {
    id: 'xp-gamification',
    name: 'Student XP System',
    status: 'stable',
    version: 'v1.0',
    priority: 'high',
    toggleable: false,
    isActive: true,
    description: 'Kernel de cálculo de experiência, níveis e streaks diários.'
  },
  {
    id: 'supabase-auth',
    name: 'Supabase Auth Layer',
    status: 'stable',
    version: 'v4.0',
    priority: 'critical',
    toggleable: false,
    isActive: true,
    description: 'Middleware de autenticação JWT e controle de políticas RLS.'
  },
  {
    id: 'tab-engine',
    name: 'AlphaTab Renderer',
    status: 'maintenance',
    version: 'v1.8',
    priority: 'high',
    toggleable: true,
    isActive: true,
    description: 'Renderizador de tablaturas e partituras dinâmicas via AlphaTex.'
  }
];