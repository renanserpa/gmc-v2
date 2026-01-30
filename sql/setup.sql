
-- GCM MAESTRO - SECURITY PATCH v4.1
-- Execute no SQL Editor do Supabase

-- 1. Atualizar constraint de roles para incluir super_admin e manager
DO $$ 
BEGIN 
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS check_roles;
    
    ALTER TABLE public.profiles 
    ADD CONSTRAINT check_roles 
    CHECK (role IN ('super_admin', 'admin', 'manager', 'professor', 'student', 'guardian'));
EXCEPTION 
    WHEN OTHERS THEN 
        RAISE NOTICE 'Constraint already updated or table missing.';
END $$;

-- 2. Garantir RLS para leitura de perfil próprio (Corrige loop de login)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- 3. Trigger robusto de auto-provisionamento
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role, school_id)
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Novo Usuário'), 
        COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
        NULL
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-aplicar trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Garantir tabela de escolas para o seed
CREATE TABLE IF NOT EXISTS public.schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    branding JSONB DEFAULT '{"primaryColor": "#38bdf8", "secondaryColor": "#a78bfa", "borderRadius": "24px", "logoUrl": null}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Tabela de junção para professores (B2B Multi-tenancy)
CREATE TABLE IF NOT EXISTS public.professor_schools (
    professor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    PRIMARY KEY (professor_id, school_id)
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professor_schools ENABLE ROW LEVEL SECURITY;

-- Políticas gerais para permitir o funcionamento do core
CREATE POLICY "Public schools are viewable by everyone" ON public.schools FOR SELECT USING (true);
