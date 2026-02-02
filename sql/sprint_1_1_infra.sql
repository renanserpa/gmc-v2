-- GCM MAESTRO - SPRINT 1.1 - INFRA & SECURITY RESET

-- 1. LIMPEZA DE POLÍTICAS ANTIGAS (EVITAR CONFLITOS)
DROP POLICY IF EXISTS "Admins_Manage_All_Schools" ON public.schools;
DROP POLICY IF EXISTS "Perfil_Proprio" ON public.profiles;
DROP POLICY IF EXISTS "SuperAdmin_Full_Access" ON public.profiles;
DROP POLICY IF EXISTS "Admins veem todas as escolas" ON public.schools;
DROP POLICY IF EXISTS "Schools_SuperAdmin_Policy" ON public.schools;
DROP POLICY IF EXISTS "Profiles_Self_Policy" ON public.profiles;
DROP POLICY IF EXISTS "Profiles_SuperAdmin_Policy" ON public.profiles;

-- 2. FUNÇÕES SECURITY DEFINER (QUEBRA DE RECURSÃO)
CREATE OR REPLACE FUNCTION public.check_is_super_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. GARANTIR ESTRUTURA DA TABELA SCHOOLS
ALTER TABLE public.schools 
ADD COLUMN IF NOT EXISTS slug TEXT,
ADD COLUMN IF NOT EXISTS branding JSONB DEFAULT '{"primaryColor": "#38bdf8"}'::jsonb,
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);

-- Unicidade do Slug
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'schools_slug_key') THEN
        ALTER TABLE public.schools ADD CONSTRAINT schools_slug_key UNIQUE (slug);
    END IF;
END $$;

-- 4. UPSERT DA REDHOUSE (RESOLVE ERRO DE DUPLICIDADE)
INSERT INTO public.schools (id, name, slug, is_active, owner_id, branding)
VALUES (
    '77777777-7777-7777-7777-777777777777', 
    'RedHouse School Cuiaba', 
    'redhouse-cuiaba', 
    true, 
    auth.uid(),
    '{"primaryColor": "#E11D48", "secondaryColor": "#0F172A", "borderRadius": "40px"}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET 
    slug = EXCLUDED.slug,
    name = EXCLUDED.name,
    is_active = true,
    owner_id = EXCLUDED.owner_id,
    branding = EXCLUDED.branding;

-- 5. NOVAS POLÍTICAS DE ACESSO (STABLE RLS)
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Schools_SuperAdmin_Policy" ON public.schools
FOR ALL TO authenticated USING (public.check_is_super_admin());

CREATE POLICY "Profiles_Self_Policy" ON public.profiles
FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Profiles_SuperAdmin_Policy" ON public.profiles
FOR ALL TO authenticated USING (public.check_is_super_admin());

-- 6. GARANTIR SOBERANIA DO ADMIN ATUAL
UPDATE public.profiles 
SET role = 'super_admin', school_id = '77777777-7777-7777-7777-777777777777'
WHERE id = auth.uid();