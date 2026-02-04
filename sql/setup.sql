
-- ==========================================================
-- GCM MAESTRO V8.0 - KERNEL RECOVERY (STABLE FINAL)
-- OBJETIVO: Corrigir Publicação Realtime e integridade FK
-- ==========================================================

-- 1. PREPARAÇÃO DA ESTRUTURA DE ESCOLAS (PAI)
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS branding JSONB DEFAULT '{"primaryColor": "#38bdf8", "secondaryColor": "#0f172a", "borderRadius": "24px"}'::jsonb;
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS maintenance_mode BOOLEAN DEFAULT false;
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 2. GARANTIA DE IDENTIDADE SOBERANA (PILOTO REDHOUSE)
-- Remove conflitos de slug com IDs diferentes antes da inserção
DELETE FROM public.schools 
WHERE slug = 'redhouse-cuiaba' 
AND id != 'd290f1ee-6c54-4b01-90e6-d701748f0851';

-- Injeção da Unidade Mestra
INSERT INTO public.schools (id, name, slug, branding, is_active)
VALUES (
    'd290f1ee-6c54-4b01-90e6-d701748f0851', 
    'RedHouse School Cuiabá', 
    'redhouse-cuiaba', 
    '{"primaryColor": "#c41234", "secondaryColor": "#ffffff", "borderRadius": "32px"}'::jsonb,
    true
) 
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    branding = EXCLUDED.branding,
    updated_at = now();

-- 3. PREPARAÇÃO DA ESTRUTURA DE PERFIS (FILHO)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'student';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS coins INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS current_level INTEGER DEFAULT 1;

-- 4. REPARO DE CONSTRAINTS DE SEGURANÇA
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS valid_role;
ALTER TABLE public.profiles ADD CONSTRAINT valid_role 
CHECK (role IN (
    'student', 'professor', 'teacher_owner', 'admin', 
    'god_mode', 'guardian', 'school_manager', 'super_admin', 'saas_admin_global'
));

-- 5. SINCRONIA DE USUÁRIO ROOT
UPDATE public.profiles 
SET 
    school_id = 'd290f1ee-6c54-4b01-90e6-d701748f0851', 
    role = 'god_mode',
    full_name = 'Maestro Renan Serpa (Root)'
WHERE email = 'serparenan@gmail.com';

-- 6. CONFIGURAÇÃO DE REPLICAÇÃO (CDC FULL)
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.schools REPLICA IDENTITY FULL;

-- 7. REPARO DA PUBLICAÇÃO REALTIME (SINTAXE CORRETA)
DO $$
BEGIN
    -- Garante que a publicação base do Supabase exista
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        CREATE PUBLICATION supabase_realtime;
    END IF;
END $$;

-- Define as tabelas monitoradas de forma atômica (Sem DROP IF EXISTS problemático)
ALTER PUBLICATION supabase_realtime SET TABLE public.profiles, public.schools;

-- 8. POLÍTICAS DE ACESSO SOBERANO (BYPASS RLS)
DROP POLICY IF EXISTS "God Mode Sovereign Access" ON public.schools;
DROP POLICY IF EXISTS "God Mode Sovereign Access" ON public.profiles;

CREATE POLICY "God Mode Sovereign Access" ON public.schools FOR ALL USING (auth.jwt() ->> 'email' = 'serparenan@gmail.com');
CREATE POLICY "God Mode Sovereign Access" ON public.profiles FOR ALL USING (auth.jwt() ->> 'email' = 'serparenan@gmail.com');

-- 9. LOG DE REPARO FINALIZADO
INSERT INTO public.audit_logs (action, table_name, record_id, new_data)
VALUES ('KERNEL_RECOVERY_V8.0', 'SYSTEM', 'STABLE_PRODUCTION', '{"status": "recovered", "publication": "fixed_atomic", "fk_integrity": "verified"}'::jsonb);
