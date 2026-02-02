-- GCM MAESTRO - PATCH DE SEGURANÇA V5.1 (EMERGENCY RECURSION FIX)

-- 1. Funções de Bypass de RLS (Security Definer)
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_my_school()
RETURNS uuid AS $$
  SELECT school_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- 2. Reset de Políticas de Profiles para evitar recursão (42P17)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_self_access" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_bypass" ON public.profiles;
DROP POLICY IF EXISTS "profiles_self_update" ON public.profiles;

CREATE POLICY "Perfil_Proprio" ON public.profiles 
FOR SELECT TO authenticated 
USING (auth.uid() = id);

CREATE POLICY "SuperAdmin_Full_Access" ON public.profiles 
FOR ALL TO authenticated 
USING (public.get_my_role() = 'super_admin');

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Forçar ativação e propriedade da RedHouse Cuiabá
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
    owner_id = EXCLUDED.owner_id,
    is_active = true,
    slug = 'redhouse-cuiaba';

-- 4. Sincronizar o Admin com a Unidade RedHouse
UPDATE public.profiles 
SET school_id = '77777777-7777-7777-7777-777777777777'
WHERE email = 'serparenan@gmail.com';