-- ==============================================================================
-- OLIEMUSIC GCM - INFRAESTRUTURA MESTRE V3.4 (PERMISSÕES CORRIGIDAS)
-- Resolve o erro 42501 (Permission Denied)
-- ==============================================================================

-- 1. GARANTIR DONO E ESCOLA PADRÃO
INSERT INTO public.schools (id, name) 
VALUES ('00000000-0000-0000-0000-000000000000', 'OlieMusic Matriz')
ON CONFLICT (id) DO NOTHING;

-- 2. RESET DE PERMISSÕES DA TABELA PROFILES (Auto-Healing)
ALTER TABLE IF EXISTS public.profiles OWNER TO postgres;

-- 3. GARANTIR GRANTS (O erro 42501 geralmente é falta disso)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO postgres;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO anon, authenticated;
GRANT SELECT ON public.schools TO anon, authenticated;

-- 4. REPOSICIONAR RLS POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Leitura pública de perfis" ON public.profiles;
CREATE POLICY "Leitura pública de perfis" ON public.profiles 
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Usuários podem criar seu próprio perfil" ON public.profiles;
CREATE POLICY "Usuários podem criar seu próprio perfil" ON public.profiles 
FOR INSERT WITH CHECK (true); -- Permitir inserção para self-healing via AuthContext

DROP POLICY IF EXISTS "Auto-gestão de perfil" ON public.profiles;
CREATE POLICY "Auto-gestão de perfil" ON public.profiles 
FOR UPDATE USING (auth.uid() = id);

-- 5. TRIGGER DE AUTO-PROFILING (SECURITY DEFINER é vital aqui)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, school_id)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', 'Novo Usuário'),
    COALESCE(new.raw_user_meta_data->>'role', 'student'),
    '00000000-0000-0000-0000-000000000000'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; -- Executa com privilégios de admin

-- 6. BACKFILL DE SEGURANÇA
INSERT INTO public.profiles (id, email, full_name, role, school_id)
VALUES 
    ('45990533-ad8e-44f7-918f-70df3b2659b2', 'adm@adm.com', 'Super Maestro (Admin)', 'admin', '00000000-0000-0000-0000-000000000000'),
    ('65c7ca9a-028b-45d3-9736-2f1dce6221be', 'p@adm.com', 'Renan Serpa (Professor)', 'professor', '00000000-0000-0000-0000-000000000000'),
    ('cd7859d9-55d8-4af6-8926-80ca207f5525', 'd@adm.com', 'Gestor Unidade 1', 'manager', '00000000-0000-0000-0000-000000000000'),
    ('ddbce67a-f49e-4765-b1ed-f77a3281e7db', 'r@adm.com', 'Responsável Atento', 'guardian', '00000000-0000-0000-0000-000000000000'),
    ('3c0c686d-fff6-404d-baf8-9f1b25e9e842', 'a@adm.com', 'Lucca Maestro (Aluno)', 'student', '00000000-0000-0000-0000-000000000000')
ON CONFLICT (id) DO UPDATE SET 
    role = EXCLUDED.role, 
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email;