
-- SCRIPT DE ATUALIZAÇÃO GCM MAESTRO V4.5 - SALES & PROVISIONING
-- EXECUTE ESTE SCRIPT NO SQL EDITOR DO SUPABASE

-- 1. Garantir que a tabela notices existe (Fix para erro 42P01)
CREATE TABLE IF NOT EXISTS public.notices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    content TEXT,
    priority TEXT DEFAULT 'normal',
    target_audience TEXT DEFAULT 'all',
    school_id UUID REFERENCES public.schools(id),
    professor_id UUID,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Atualizar tabela schools para controle de módulos e contratos
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS enabled_modules JSONB DEFAULT '{"gamification": true, "financial": true, "ai_pitch": true, "library": true}'::jsonb;
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS contract_expiry TIMESTAMPTZ;
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES public.profiles(id);

-- 3. Atualizar constraint de roles (Profiles)
DO $$ 
BEGIN 
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
    CHECK (role IN ('god_mode', 'saas_admin_global', 'saas_admin_finance', 'saas_admin_ops', 'teacher_owner', 'professor', 'student', 'guardian', 'manager', 'school_manager', 'admin', 'super_admin'));
EXCEPTION WHEN others THEN 
    RAISE NOTICE 'Constraint role já atualizada.';
END $$;

-- 4. Re-ativar Realtime (com check de existência)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.notices;
        ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_logs;
        ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
        ALTER PUBLICATION supabase_realtime ADD TABLE public.schools;
    END IF;
EXCEPTION WHEN others THEN
    RAISE NOTICE 'Publicação realtime pode já conter estas tabelas.';
END $$;

-- 5. Política de Auditoria para God Mode
DROP POLICY IF EXISTS "God_Reads_Audit" ON public.audit_logs;
CREATE POLICY "God_Reads_Audit" ON public.audit_logs
FOR SELECT TO authenticated
USING (auth.jwt() ->> 'email' = 'serparenan@gmail.com');

COMMENT ON COLUMN public.schools.enabled_modules IS 'Flags de acesso a funcionalidades por unidade.';
