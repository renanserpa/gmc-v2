
-- GCM MAESTRO - MASTER SCHEMA V8.0 - BÍBLIA DE GOVERNANÇA

-- 1. EXTENSÕES E ENUMS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM (
            'god_mode', 
            'saas_admin_global', 
            'saas_admin_finance', 
            'saas_admin_ops', 
            'teacher_owner', 
            'professor', 
            'manager', 
            'student', 
            'guardian'
        );
    ELSE
        -- Atualizar enum existente se necessário (Postgres 12+)
        ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'god_mode';
        ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'saas_admin_global';
        ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'saas_admin_finance';
        ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'saas_admin_ops';
        ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'teacher_owner';
    END IF;
END $$;

-- 2. TABELA DE UNIDADES (TENANTS)
CREATE TABLE IF NOT EXISTS public.schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    branding JSONB DEFAULT '{"primaryColor": "#38bdf8", "secondaryColor": "#0f172a", "borderRadius": "24px"}'::jsonb,
    owner_id UUID, -- FK para profiles.id (Teacher-Owner)
    billing_model TEXT DEFAULT 'hourly' CHECK (billing_model IN ('hourly', 'per_student', 'fixed')),
    hourly_rate DECIMAL(10,2) DEFAULT 0.00,
    monthly_fee DECIMAL(10,2) DEFAULT 0.00,
    contract_status TEXT DEFAULT 'trial' CHECK (contract_status IN ('trial', 'active', 'suspended', 'canceled')),
    cnpj TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. PERFIS DE USUÁRIO
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'student',
    school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
    avatar_url TEXT,
    reputation_points INTEGER DEFAULT 0,
    accessibility_settings JSONB DEFAULT '{"uiMode": "standard"}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. ESTRUTURA PEDAGÓGICA (TURMAS E MATRÍCULAS)
CREATE TABLE IF NOT EXISTS public.music_classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    day_of_week TEXT NOT NULL,
    start_time TIME NOT NULL,
    capacity INTEGER DEFAULT 5,
    teacher_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.music_classes(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(student_id, class_id)
);

CREATE TABLE IF NOT EXISTS public.class_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID REFERENCES public.music_classes(id) ON DELETE SET NULL,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES public.profiles(id),
    duration_minutes INTEGER DEFAULT 60,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. FUNÇÕES DE SEGURANÇA (BYPASS RECURSION)
CREATE OR REPLACE FUNCTION public.is_god()
RETURNS boolean AS $$
BEGIN
  -- Soberania absoluta baseada em JWT e Role
  RETURN (auth.jwt() ->> 'email' = 'serparenan@gmail.com') OR 
         EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'god_mode');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.has_saas_access(area TEXT)
RETURNS boolean AS $$
DECLARE
    u_role TEXT;
BEGIN
    SELECT role INTO u_role FROM public.profiles WHERE id = auth.uid();
    IF u_role = 'saas_admin_global' THEN RETURN true; END IF;
    IF area = 'finance' AND u_role = 'saas_admin_finance' THEN RETURN true; END IF;
    IF area = 'ops' AND u_role = 'saas_admin_ops' THEN RETURN true; END IF;
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. POLÍTICAS RLS DE ALTA FIDELIDADE
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music_classes ENABLE ROW LEVEL SECURITY;

-- Schools
CREATE POLICY "God_Manage_All_Schools" ON public.schools FOR ALL USING (public.is_god());
CREATE POLICY "SaaS_Read_All_Schools" ON public.schools FOR SELECT USING (public.has_saas_access('any'));
CREATE POLICY "TeacherOwner_Manage_Own_Schools" ON public.schools FOR ALL USING (owner_id = auth.uid());

-- Profiles
CREATE POLICY "God_Manage_All_Profiles" ON public.profiles FOR ALL USING (public.is_god());
CREATE POLICY "Users_Read_Own_Profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

-- 7. AUDITORIA DE SEGURANÇA
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id UUID,
    action TEXT NOT NULL,
    table_name TEXT,
    record_id TEXT,
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Only_God_Reads_Audit" ON public.audit_logs FOR SELECT USING (public.is_god());
