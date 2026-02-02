-- GCM MAESTRO - ATOMIC HARD RESET V6.0
-- Este script apaga TODOS os dados antigos e mocks para iniciar o Sprint 1.1 do zero.

-- 1. DESATIVAR RLS TEMPORARIAMENTE PARA LIMPEZA
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.schools DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.students DISABLE ROW LEVEL SECURITY;

-- 2. LIMPEZA TOTAL (PURGA EM CASCATA)
-- Ordem inversa de dependência para evitar erros de FK
TRUNCATE public.xp_events, public.player_achievements, public.store_orders, 
         public.missions, public.attendance, public.student_songs, 
         public.performance_recordings, public.music_classes, 
         public.students, public.profiles, public.schools 
CASCADE;

-- 3. AJUSTE DE SCHEMA E CONSTRAINTS (CORREÇÃO DO ERRO 23505)
-- Removemos a constraint antiga para garantir que a nova estrutura esteja limpa
ALTER TABLE public.schools DROP CONSTRAINT IF EXISTS schools_slug_key;

ALTER TABLE public.schools 
ADD COLUMN IF NOT EXISTS slug TEXT,
ADD COLUMN IF NOT EXISTS branding JSONB DEFAULT '{"primaryColor": "#38bdf8"}'::jsonb,
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);

-- Recriar restrição de unicidade
ALTER TABLE public.schools ADD CONSTRAINT schools_slug_key UNIQUE (slug);

-- 4. FUNÇÃO MESTRE DE BYPASS (SECURITY DEFINER)
-- Essencial para quebrar a recursão infinita do RLS
CREATE OR REPLACE FUNCTION public.check_is_super_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5. PROVISIONAMENTO DA UNIDADE ÂNCORA (REDHOUSE)
INSERT INTO public.schools (id, name, slug, is_active, owner_id, branding)
VALUES (
    '77777777-7777-7777-7777-777777777777', 
    'RedHouse School Cuiaba', 
    'redhouse-cuiaba', 
    true, 
    auth.uid(),
    '{"primaryColor": "#E11D48", "secondaryColor": "#0F172A", "borderRadius": "40px"}'::jsonb
);

-- 6. PROMOÇÃO DO USUÁRIO ATUAL A SUPER ADMIN
INSERT INTO public.profiles (id, email, full_name, role, school_id, created_at)
VALUES (
    auth.uid(),
    'serparenan@gmail.com', -- Ou o email que você estiver usando no login
    'Maestro Renan Serpa',
    'super_admin',
    '77777777-7777-7777-7777-777777777777',
    now()
)
ON CONFLICT (id) DO UPDATE SET 
    role = 'super_admin',
    school_id = '77777777-7777-7777-7777-777777777777';

-- 7. REESTABELECIMENTO DE POLÍTICAS RLS (VERSÃO ESTÁVEL)
DROP POLICY IF EXISTS "Global_Admin_All_Schools" ON public.schools;
CREATE POLICY "Global_Admin_All_Schools" ON public.schools
FOR ALL TO authenticated USING (public.check_is_super_admin());

DROP POLICY IF EXISTS "Profiles_Read_Self" ON public.profiles;
CREATE POLICY "Profiles_Read_Self" ON public.profiles
FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Profiles_SuperAdmin_Manage" ON public.profiles;
CREATE POLICY "Profiles_SuperAdmin_Manage" ON public.profiles
FOR ALL TO authenticated USING (public.check_is_super_admin());

-- 8. REATIVAR RLS
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- VERIFICAÇÃO FINAL
-- A RedHouse deve ser o único tenant ativo e você o único super_admin vinculado a ela.