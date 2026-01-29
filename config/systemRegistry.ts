export interface SystemNode {
    id: string;
    label: string;
    layer: 'database' | 'services' | 'ui_core' | 'pages';
    path: string;
    dependencies: string[];
    description: string;
}

export const SYSTEM_REGISTRY: SystemNode[] = [
    // DATABASE LAYER
    { id: 'db-profiles', label: 'Profiles Table', layer: 'database', path: 'public.profiles', dependencies: ['supabase'], description: 'Tabela central de usuários e roles.' },
    { id: 'db-students', label: 'Students Table', layer: 'database', path: 'public.students', dependencies: ['supabase', 'profiles'], description: 'Dados pedagógicos e gamificação.' },
    { id: 'db-missions', label: 'Missions Table', layer: 'database', path: 'public.missions', dependencies: ['supabase', 'students'], description: 'Tarefas e recompensas de XP.' },
    { id: 'db-audit', label: 'Audit Logs', layer: 'database', path: 'public.audit_logs', dependencies: ['supabase'], description: 'Logs de eventos e erros do kernel.' },
    
    // SERVICES LAYER
    { id: 'svc-auth', label: 'Auth Context', layer: 'services', path: '../contexts/AuthContext.tsx', dependencies: ['supabase'], description: 'Gerenciamento de sessão e JWT.' },
    { id: 'svc-data', label: 'Data Service', layer: 'services', path: '../services/dataService.ts', dependencies: ['supabase'], description: 'Abstração de queries CRUD.' },
    { id: 'svc-ai', label: 'Maestro Brain', layer: 'services', path: '../services/aiService.ts', dependencies: ['gemini-api'], description: 'Inteligência pedagógica via IA.' },
    { id: 'svc-haptics', label: 'Haptics Engine', layer: 'services', path: '../lib/haptics.ts', dependencies: ['navigator.vibrate'], description: 'Feedback tátil (Mobile).' },
    
    // UI CORE LAYER
    { id: 'ui-button', label: 'Button Component', layer: 'ui_core', path: '../components/ui/Button.tsx', dependencies: ['radix-ui', 'class-variance-authority'], description: 'Botão padrão com feedback tátil.' },
    { id: 'ui-card', label: 'Card Base', layer: 'ui_core', path: '../components/ui/Card.tsx', dependencies: ['tailwind'], description: 'Container visual padrão.' },
    { id: 'ui-avatar', label: 'User Avatar', layer: 'ui_core', path: '../components/ui/UserAvatar.tsx', dependencies: ['dicebear'], description: 'Renderizador de fotos e iniciais.' },
    
    // PAGES LAYER
    { id: 'pg-login', label: 'Login Portal', layer: 'pages', path: '../pages/Login.tsx', dependencies: ['AuthContext', 'ui-core'], description: 'Porta de entrada do sistema.' },
    { id: 'pg-prof', label: 'Professor Dash', layer: 'pages', path: '../pages/ProfessorDashboard.tsx', dependencies: ['dataService', 'aiService'], description: 'Cockpit de gestão de turmas.' },
    { id: 'pg-admin', label: 'Admin God Mode', layer: 'pages', path: '../pages/AdminDashboard.tsx', dependencies: ['all-layers'], description: 'Controle global do kernel.' },
    { id: 'pg-stud', label: 'Student Journey', layer: 'pages', path: '../pages/StudentDashboard.tsx', dependencies: ['gamificationService'], description: 'Interface principal do aluno.' }
];