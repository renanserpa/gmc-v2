
/**
 * GCM Maestro V4.0 - Fonte da Verdade do Banco de Dados
 * Versão: 7.6 - Stub Tables & Sovereign RLS
 */

export const GCM_DB_SCHEMA = `-- GCM MAESTRO V7.6 - SCRIPT DE INFRAESTRUTURA COMPLETO

-- 1. Extensões e Limpeza
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela de Perfis
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

-- 3. Unidades Escolares
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
    maintenance_mode BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. [STUB v7.6] Gestão Externa (Clubes / Igrejas)
CREATE TABLE IF NOT EXISTS public.external_contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.schools(id),
    partner_name TEXT NOT NULL,
    contract_type TEXT CHECK (contract_type IN ('clube', 'igreja', 'escola_parceira', 'outros')),
    status TEXT DEFAULT 'active',
    json_content JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. [STUB v7.6] Live Tool Presets
CREATE TABLE IF NOT EXISTS public.live_tool_presets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    professor_id UUID REFERENCES public.profiles(id),
    tool_name TEXT NOT NULL, -- 'metronome' | 'whiteboard' | 'tuner'
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. [STUB v7.6] Family Hub Reports
CREATE TABLE IF NOT EXISTS public.family_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.profiles(id), -- No piloto, profiles atuam como base
    teacher_id UUID REFERENCES public.profiles(id),
    report_text TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    sent_at TIMESTAMPTZ DEFAULT now()
);

-- 7. [STUB v7.6] School Staff
CREATE TABLE IF NOT EXISTS public.school_staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.schools(id),
    profile_id UUID REFERENCES public.profiles(id),
    permissions JSONB DEFAULT '{"billing": false, "pedagogy": true}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. POLÍTICAS RLS (God Mode Sovereignty)
ALTER TABLE public.external_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_tool_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_staff ENABLE ROW LEVEL SECURITY;

-- Política Root: serparenan@gmail.com ignora todas as travas
CREATE POLICY "God Mode Sovereign Access" ON public.external_contracts FOR ALL USING (auth.jwt() ->> 'email' = 'serparenan@gmail.com');
CREATE POLICY "God Mode Sovereign Access" ON public.live_tool_presets FOR ALL USING (auth.jwt() ->> 'email' = 'serparenan@gmail.com');
CREATE POLICY "God Mode Sovereign Access" ON public.family_reports FOR ALL USING (auth.jwt() ->> 'email' = 'serparenan@gmail.com');
CREATE POLICY "God Mode Sovereign Access" ON public.school_staff FOR ALL USING (auth.jwt() ->> 'email' = 'serparenan@gmail.com');

-- 9. Auditoria de God Mode
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
`;
