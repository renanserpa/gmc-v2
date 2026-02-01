-- GCM MAESTRO - MASTER ADMIN LAYER V1.0
-- Este script provisiona a infraestrutura de governança e auditoria imutável.

-- 1. Tabela de Configurações Globais (System Flags)
CREATE TABLE IF NOT EXISTS public.system_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT now(),
    updated_by UUID REFERENCES auth.users(id)
);

-- 2. Tabela de Logs de Auditoria (Immutable Engine)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL, -- INSERT, UPDATE, DELETE
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabela de Avisos e Comunicações (Notices)
CREATE TABLE IF NOT EXISTS public.notices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    message TEXT, -- Retrocompatibilidade
    content TEXT, -- Requisito Master
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
    target_audience TEXT DEFAULT 'all', -- 'all', 'professors', 'students'
    school_id UUID REFERENCES public.schools(id), -- target_school
    professor_id UUID REFERENCES public.profiles(id),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Segurança RLS: Configurações do Sistema
ALTER TABLE public.system_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Configurações visíveis para usuários autenticados"
ON public.system_configs FOR SELECT TO authenticated USING (true);

CREATE POLICY "Apenas Admins gerenciam configurações"
ON public.system_configs FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')
  )
);

-- 5. Segurança RLS: Auditoria Imutável
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Apenas Admins visualizam logs"
ON public.audit_logs FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')
  )
);

-- Proteção de imutabilidade
CREATE POLICY "Bloqueio de edição de log" ON public.audit_logs FOR UPDATE TO authenticated USING (false);
CREATE POLICY "Bloqueio de deleção de log" ON public.audit_logs FOR DELETE TO authenticated USING (false);

-- 6. Segurança RLS: Avisos (Notices)
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins e Professores criam avisos"
ON public.notices FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'professor')
  )
);

CREATE POLICY "Leitura de avisos filtrada"
ON public.notices FOR SELECT TO authenticated
USING (
    target_audience = 'all' OR 
    school_id = (SELECT school_id FROM public.profiles WHERE id = auth.uid()) OR
    professor_id = auth.uid()
);

-- 7. Trigger Engine: Função Genérica de Auditoria
CREATE OR REPLACE FUNCTION handle_audit_log() RETURNS TRIGGER AS $$
DECLARE
    v_old JSONB := NULL;
    v_new JSONB := NULL;
BEGIN
    IF (TG_OP = 'UPDATE' OR TG_OP = 'DELETE') THEN v_old := to_jsonb(OLD); END IF;
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN v_new := to_jsonb(NEW); END IF;

    -- Proteção de Dados: Omitir campos de sensíveis (Placeholder para LGPD)
    IF v_old ? 'password_hash' THEN v_old := v_old - 'password_hash'; END IF;
    IF v_new ? 'password_hash' THEN v_new := v_new - 'password_hash'; END IF;

    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_data, new_data)
    VALUES (
        auth.uid(),
        TG_OP,
        TG_TABLE_NAME,
        CASE WHEN TG_OP = 'DELETE' THEN OLD.id::text ELSE NEW.id::text END,
        v_old,
        v_new
    );
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicação dos Triggers nas tabelas core
CREATE TRIGGER audit_schools AFTER INSERT OR UPDATE OR DELETE ON public.schools FOR EACH ROW EXECUTE FUNCTION handle_audit_log();
CREATE TRIGGER audit_profiles AFTER INSERT OR UPDATE OR DELETE ON public.profiles FOR EACH ROW EXECUTE FUNCTION handle_audit_log();
CREATE TRIGGER audit_missions AFTER INSERT OR UPDATE OR DELETE ON public.missions FOR EACH ROW EXECUTE FUNCTION handle_audit_log();

-- 8. Realtime Enablement (CDC)
ALTER TABLE public.system_configs REPLICA IDENTITY FULL;
ALTER TABLE public.audit_logs REPLICA IDENTITY FULL;
ALTER TABLE public.notices REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
  
  ALTER PUBLICATION supabase_realtime ADD TABLE public.system_configs;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_logs;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.notices;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Publicação Realtime já configurada ou erro de permissão.';
END $$;