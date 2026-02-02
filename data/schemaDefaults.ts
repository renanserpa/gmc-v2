
/**
 * GCM Maestro V4.0 - Fonte da Verdade do Banco de Dados
 * Este arquivo contém o DDL completo para restauração do ambiente SaaS e God Mode.
 */

export const GCM_DB_SCHEMA = `-- GCM MAESTRO V4.0 - SCRIPT DE INFRAESTRUTURA SAAS COMPLETO

-- 1. Extensões e Limpeza
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela de Perfis (Hardened for SaaS Roles)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'student',
    school_id UUID,
    reputation_points INTEGER DEFAULT 0,
    avatar_url TEXT,
    accessibility_settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Unidades Escolares (Tenant Layer)
CREATE TABLE IF NOT EXISTS public.schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    owner_id UUID REFERENCES auth.users(id),
    billing_model TEXT DEFAULT 'fixed',
    monthly_fee NUMERIC DEFAULT 0.00,
    fee_per_student NUMERIC DEFAULT 0.00,
    branding JSONB DEFAULT '{"borderRadius": "24px", "primaryColor": "#38bdf8", "secondaryColor": "#0f172a"}'::jsonb,
    contract_status TEXT DEFAULT 'trial',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Biblioteca Global e IA (Brain Center)
CREATE TABLE IF NOT EXISTS public.knowledge_docs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT DEFAULT 'theory',
    level TEXT DEFAULT 'beginner',
    tokens INTEGER,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Performance e Dossiê (Technical Layer)
CREATE TABLE IF NOT EXISTS public.performance_recordings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.profiles(id),
    song_id UUID,
    audio_url TEXT NOT NULL,
    stats JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Mural Social (Concert Hall)
CREATE TABLE IF NOT EXISTS public.concert_hall (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recording_id UUID REFERENCES public.performance_recordings(id),
    professor_id UUID REFERENCES public.profiles(id),
    high_fives_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Configurações de Economia e Sistema
CREATE TABLE IF NOT EXISTS public.system_configs (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Auditoria de God Mode
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id UUID,
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- SEEDS INICIAIS
INSERT INTO public.system_configs (key, value, description) VALUES 
('XP_MULTIPLIER', '1.0', 'Multiplicador global de ganho de XP'),
('COIN_RATIO', '0.1', 'Taxa de conversão XP para Coins (10%)'),
('STORAGE_LIMIT_SCHOOL', '5120', 'Limite de storage por escola em MB')
ON CONFLICT (key) DO NOTHING;
`;
