-- ==============================================================================
-- OLIEMUSIC GCM - KERNEL DE ADMINISTRAÇÃO V4.0
-- Tabelas para Multitenancy e Governança Global
-- ==============================================================================

-- 1. TABELA DE ESCOLAS (TENANTS)
CREATE TABLE IF NOT EXISTS public.schools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    branding JSONB DEFAULT '{"primaryColor": "#38bdf8", "borderRadius": "24px", "logoUrl": null}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. TABELA DE JUNÇÃO (ADMIN ACESSO A ESCOLAS)
CREATE TABLE IF NOT EXISTS public.professor_schools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    professor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(professor_id, school_id)
);

-- 3. CONFIGURAÇÕES GLOBAIS DE SISTEMA
CREATE TABLE IF NOT EXISTS public.system_configs (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Inserir multiplicador padrão se não existir
INSERT INTO public.system_configs (key, value, description)
VALUES ('global_xp_multiplier', '1.0', 'Multiplicador de ganho de XP para todos os alunos')
ON CONFLICT (key) DO NOTHING;

-- 4. POLÍTICAS RLS PARA ADMIN
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins possuem controle total sobre escolas" 
ON public.schools FOR ALL 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'admin' OR email = 'admin@oliemusic.dev')));

CREATE POLICY "Usuários veem suas próprias escolas"
ON public.schools FOR SELECT
USING (id IN (SELECT school_id FROM profiles WHERE id = auth.uid()) OR id IN (SELECT school_id FROM students WHERE auth_user_id = auth.uid()));

-- Grants
GRANT ALL ON public.schools TO authenticated;
GRANT ALL ON public.system_configs TO authenticated;
GRANT ALL ON public.professor_schools TO authenticated;