/**
 * GCM Maestro V3.0 - Fonte da Verdade do Banco de Dados
 * Este arquivo contém o DDL completo para restauração do ambiente.
 */

export const GCM_DB_SCHEMA = `-- GCM MAESTRO V3.0 - SCRIPT DE INFRAESTRUTURA
-- Execute no SQL Editor do Supabase

-- 1. Extensões Necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela de Perfis (Profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    role TEXT DEFAULT 'student' CHECK (role IN ('admin', 'professor', 'student', 'guardian', 'manager')),
    school_id UUID,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabela de Turmas (Classes)
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    professor_id UUID REFERENCES public.profiles(id),
    days_of_week TEXT[],
    start_time TEXT,
    program_level TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Tabela de Alunos (Students)
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    avatar_url TEXT,
    instrument TEXT,
    xp INTEGER DEFAULT 0,
    coins INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    streak_days INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Tabela de Missões (Missions)
CREATE TABLE IF NOT EXISTS public.missions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    xp_reward INTEGER DEFAULT 30,
    coins_reward INTEGER DEFAULT 5,
    type TEXT DEFAULT 'practice',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Logs de Auditoria (Audit Logs)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    professor_id UUID REFERENCES public.profiles(id),
    event_type TEXT NOT NULL,
    xp_amount INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Configuração de Segurança (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Políticas Básicas (Permitir leitura para autenticados)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow authenticated read') THEN
        CREATE POLICY "Allow authenticated read" ON public.profiles FOR SELECT TO authenticated USING (true);
        CREATE POLICY "Allow authenticated read" ON public.classes FOR SELECT TO authenticated USING (true);
        CREATE POLICY "Allow authenticated read" ON public.students FOR SELECT TO authenticated USING (true);
        CREATE POLICY "Allow authenticated read" ON public.missions FOR SELECT TO authenticated USING (true);
        CREATE POLICY "Allow authenticated read" ON public.audit_logs FOR SELECT TO authenticated USING (true);
    END IF;
END $$;

-- OVERRIDE ADMIN: RENAN SERPA
UPDATE public.profiles 
SET role = 'admin', school_id = '00000000-0000-0000-0000-000000000000'
WHERE full_name = 'Renan Serpa';
`;