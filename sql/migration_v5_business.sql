
-- SCRIPT DE INFRAESTRUTURA BUSINESS V5.0
-- EXECUTE NO SQL EDITOR DO SUPABASE

-- 1. Coluna de Módulos (Gating)
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS enabled_modules JSONB DEFAULT '{"gamification": true, "financial": true, "ai_pitch": true, "library": true}'::jsonb;

-- 2. Coluna de Faturamento por Aluno (Royalties)
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS fee_per_student NUMERIC DEFAULT 0.00;

-- 3. Vínculo de Propriedade
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES public.profiles(id);

-- 4. Função para calcular MRR por Escola (Opcional para queries complexas)
-- Usaremos lógica de frontend para manter o realtime síncrono por enquanto.

COMMENT ON COLUMN public.schools.enabled_modules IS 'Chaves de ativação de funcionalidades: gamification, financial, ai_pitch, library.';
