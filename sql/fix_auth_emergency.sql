-- GCM MAESTRO - EMERGENCY DATABASE REPAIR v6.0
-- Este script limpa inconsistências e garante que o login funcione

-- 1. Remover RLS e Constraints para limpeza
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS check_roles;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- 2. Corrigir Dados Inválidos (Onde o erro 23514 mora)
-- Mapeia qualquer coisa estranha para 'student' ou 'school_manager'
UPDATE public.profiles SET role = 'school_manager' WHERE role IN ('manager', 'director', 'gestor');
UPDATE public.profiles SET role = 'student' WHERE role NOT IN ('super_admin', 'school_manager', 'admin', 'professor', 'student', 'guardian') OR role IS NULL;

-- 3. Re-aplicar a Constraint de Roles com todos os novos papéis
ALTER TABLE public.profiles ADD CONSTRAINT check_roles 
CHECK (role IN ('super_admin', 'school_manager', 'admin', 'professor', 'student', 'guardian', 'manager'));

-- 4. Corrigir o Trigger de Auto-Criação (Garante que todo novo usuário Auth ganhe um Profile)
CREATE OR REPLACE FUNCTION public.handle_new_user_v3()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Novo Usuário'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; -- CRÍTICO: Roda com permissão de sistema

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_v3();

-- 5. Re-habilitar RLS com Políticas Transparentes
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Public profiles are readable" ON public.profiles;
CREATE POLICY "Public profiles are readable" ON public.profiles
FOR SELECT USING (true); -- Facilita a sincronia inicial

-- 6. Garantir permissões ao Service Role (Seed)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;