-- GCM MAESTRO - KERNEL RECOVERY v5.0
-- Execute este bloco completo para resetar a camada de segurança

-- 1. Desabilitar RLS temporariamente para limpeza profunda
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 2. Garantir que a tabela tenha as colunas corretas
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS school_id UUID;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;

-- 3. Atualizar Constraint de Roles
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS check_roles;
ALTER TABLE public.profiles ADD CONSTRAINT check_roles 
CHECK (role IN ('super_admin', 'admin', 'school_manager', 'manager', 'professor', 'student', 'guardian'));

-- 4. Criar gatilho de auto-criação de perfil (Sync automático do Auth -> Profiles)
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
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    role = COALESCE(EXCLUDED.role, profiles.role);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_v3();

-- 5. Re-habilitar RLS com políticas ultra-permissivas para o dono
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Dono lê próprio perfil" ON public.profiles;
CREATE POLICY "Dono lê próprio perfil" ON public.profiles
FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Dono atualiza próprio perfil" ON public.profiles;
CREATE POLICY "Dono atualiza próprio perfil" ON public.profiles
FOR UPDATE USING (auth.uid() = id);

-- 6. Garantir acesso ao Service Role (Script de Seed)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
