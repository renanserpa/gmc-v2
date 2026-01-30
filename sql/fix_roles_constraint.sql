-- GCM MAESTRO V3 - REPARO DE CONSTRAINT E MIGRAÇÃO DE DADOS
-- Execute este script no SQL Editor do Supabase para destravar o banco.

-- 1. Remover todas as possíveis variações de nomes de constraints antigas
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS check_roles;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- 2. LIMPEZA DE DADOS (CRÍTICO): 
-- Converte qualquer role 'manager' antigo para o novo padrão 'school_manager' 
-- e garante que não existam nulos ou valores inválidos que quebrem a constraint.
UPDATE public.profiles 
SET role = 'school_manager' 
WHERE role = 'manager';

UPDATE public.profiles 
SET role = 'student' 
WHERE role NOT IN ('super_admin', 'school_manager', 'admin', 'professor', 'student', 'guardian') 
   OR role IS NULL;

-- 3. Adicionar a nova restrição abrangente
ALTER TABLE public.profiles ADD CONSTRAINT check_roles 
CHECK (role IN ('super_admin', 'school_manager', 'admin', 'professor', 'student', 'guardian'));

-- 4. Garantir política de leitura (Fix do Login Loop)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- 5. Garantir permissões de sistema
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;