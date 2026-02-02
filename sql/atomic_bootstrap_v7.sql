-- GCM MAESTRO - ATOMIC BOOTSTRAP V7.1
-- AVISO: Este script apaga TODA a estrutura pública e recria do zero.

-- 1. LIMPEZA TOTAL DE ESTRUTURA (DROP CASCATA)
DROP TABLE IF EXISTS public.xp_events CASCADE;
DROP TABLE IF EXISTS public.player_achievements CASCADE;
DROP TABLE IF EXISTS public.store_orders CASCADE;
DROP TABLE IF EXISTS public.store_items CASCADE;
DROP TABLE IF EXISTS public.missions CASCADE;
DROP TABLE IF EXISTS public.attendance CASCADE;
DROP TABLE IF EXISTS public.student_songs CASCADE;
DROP TABLE IF EXISTS public.performance_recordings CASCADE;
DROP TABLE IF EXISTS public.music_classes CASCADE;
DROP TABLE IF EXISTS public.students CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.schools CASCADE;
DROP TABLE IF EXISTS public.system_configs CASCADE;
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.notices CASCADE;
DROP TABLE IF EXISTS public.knowledge_docs CASCADE;
DROP TABLE IF EXISTS public.concert_hall CASCADE;
DROP TABLE IF EXISTS public.student_sketches CASCADE;

-- 2. CRIAÇÃO DAS TABELAS FUNDAMENTAIS (SCHEMA V7)

-- Unidades Escolares (Tenants)
CREATE TABLE public.schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    branding JSONB DEFAULT '{"primaryColor": "#38bdf8", "secondaryColor": "#0f172a", "borderRadius": "24px"}'::jsonb,
    settings JSONB DEFAULT '{"max_students": 100}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    owner_id UUID,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Perfis de Usuário
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'student',
    school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT valid_role CHECK (role IN ('super_admin', 'admin', 'professor', 'student', 'guardian', 'school_manager', 'manager'))
);

-- Alunos (Entidade Pedagógica)
CREATE TABLE public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    professor_id UUID REFERENCES auth.users(id),
    school_id UUID REFERENCES public.schools(id),
    name TEXT NOT NULL,
    instrument TEXT,
    school_grade TEXT,
    xp INTEGER DEFAULT 0,
    coins INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 1,
    current_streak_days INTEGER DEFAULT 0,
    invite_code TEXT UNIQUE,
    guardian_id UUID,
    completed_module_ids TEXT[] DEFAULT '{}',
    completed_content_ids TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Missões e Gamificação
CREATE TABLE public.missions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    professor_id UUID NOT NULL,
    school_id UUID REFERENCES public.schools(id),
    title TEXT NOT NULL,
    description TEXT,
    xp_reward INTEGER DEFAULT 30,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'done', 'expired')),
    is_template BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Log de XP (Auditável)
CREATE TABLE public.xp_events (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    player_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    school_id UUID REFERENCES public.schools(id),
    event_type TEXT NOT NULL,
    xp_amount INTEGER NOT NULL,
    coins_amount INTEGER DEFAULT 0,
    context_type TEXT,
    context_id UUID,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Configurações Globais
CREATE TABLE public.system_configs (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Auditoria Maestro
CREATE TABLE public.audit_logs (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id UUID,
    action TEXT NOT NULL,
    table_name TEXT,
    record_id TEXT,
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. MOTOR DE SEGURANÇA (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.check_is_super_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. ATIVAÇÃO DO GODMODE (ROOT ADMIN)
-- Localiza o ID do usuário pelo e-mail na tabela de auth e insere no perfil público
DO $$
DECLARE
    root_id UUID;
BEGIN
    SELECT id INTO root_id FROM auth.users WHERE email = 'serparenan@gmail.com' LIMIT 1;
    
    IF root_id IS NOT NULL THEN
        INSERT INTO public.profiles (id, email, full_name, role, created_at)
        VALUES (
            root_id,
            'serparenan@gmail.com',
            'Maestro Renan Serpa (Root)',
            'super_admin',
            now()
        )
        ON CONFLICT (id) DO UPDATE SET 
            role = 'super_admin',
            school_id = NULL;
    END IF;
END $$;

-- 5. POLÍTICAS DE ACESSO RLS (STABLE V7)
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_events ENABLE ROW LEVEL SECURITY;

-- Schools: Apenas Super Admin gerencia
CREATE POLICY "SuperAdmin_Manage_All_Schools" ON public.schools
FOR ALL TO authenticated USING (public.check_is_super_admin());

-- Profiles: Usuário vê o próprio, Super Admin vê tudo
CREATE POLICY "Profiles_Self_Read" ON public.profiles
FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "SuperAdmin_Manage_All_Profiles" ON public.profiles
FOR ALL TO authenticated USING (public.check_is_super_admin());

-- Students: Professor vê os dele, Aluno vê o seu, Super Admin vê tudo
CREATE POLICY "SuperAdmin_Full_Access_Students" ON public.students
FOR ALL TO authenticated USING (public.check_is_super_admin());

-- 6. CONFIGURAÇÕES INICIAIS DO KERNEL
INSERT INTO public.system_configs (key, value, description)
VALUES 
('global_xp_multiplier', '1.0', 'Multiplicador de XP global'),
('feature_flags', '[]', 'Flags de ativação de módulos');