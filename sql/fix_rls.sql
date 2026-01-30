
-- GCM MAESTRO - SECURITY PATCH v4.2
-- Execute no SQL Editor do Supabase

-- 1. Resolver o loop de login: Usuário deve poder ver seu PRÓPRIO perfil
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- 2. Permitir que o Auth Sync ocorra sem bloqueios de política inicial
DROP POLICY IF EXISTS "Bootstrap Profile Read" ON public.profiles;
CREATE POLICY "Bootstrap Profile Read" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- 3. Garantir que a service_role tenha autoridade total no esquema public
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- 4. Adicionar constraint de roles atualizada
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS check_roles;
ALTER TABLE public.profiles ADD CONSTRAINT check_roles 
CHECK (role IN ('super_admin', 'admin', 'school_manager', 'professor', 'student', 'guardian'));
