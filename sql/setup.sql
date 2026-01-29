-- ==============================================================================
-- OLIEMUSIC GCM - INFRAESTRUTURA MESTRE V3.5 (POLÍTICAS DE GAMIFICAÇÃO)
-- Resolve o erro 42501 na tabela xp_events
-- ==============================================================================

-- 1. CRIAÇÃO DA TABELA DE EVENTOS DE XP (Se não existir)
CREATE TABLE IF NOT EXISTS public.xp_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    xp_amount INTEGER DEFAULT 0,
    coins_amount INTEGER DEFAULT 0,
    context_type TEXT, -- 'mission', 'lesson', 'practice'
    context_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. GARANTIR RLS ATIVO
ALTER TABLE public.xp_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 3. PERMISSÕES DE LEITURA (SELECT) PARA XP_EVENTS
-- Política: Alunos vêem seus próprios eventos.
DROP POLICY IF EXISTS "Alunos vêem seus próprios XP" ON public.xp_events;
CREATE POLICY "Alunos vêem seus próprios XP" ON public.xp_events
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.students 
        WHERE students.id = xp_events.player_id 
        AND students.auth_user_id = auth.uid()
    )
);

-- Política: Professores vêem os XP dos seus alunos.
DROP POLICY IF EXISTS "Professores vêem XP dos seus alunos" ON public.xp_events;
CREATE POLICY "Professores vêem XP dos seus alunos" ON public.xp_events
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.students 
        WHERE students.id = xp_events.player_id 
        AND students.professor_id = auth.uid()
    )
);

-- 4. PERMISSÕES DE LEITURA PARA AUDIT_LOGS
DROP POLICY IF EXISTS "Professores vêem logs dos seus alunos" ON public.audit_logs;
CREATE POLICY "Professores vêem logs dos seus alunos" ON public.audit_logs
FOR SELECT USING (
    professor_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 5. GRANTS EXPLICITOS
GRANT SELECT ON public.xp_events TO authenticated;
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT INSERT ON public.xp_events TO authenticated;

-- 6. CORREÇÃO DE INTEGRIDADE: Garantir que a Role do Professor está correta
-- (Exemplo para p@adm.com se tornar professor se não for)
UPDATE public.profiles SET role = 'professor' WHERE email = 'p@adm.com';
