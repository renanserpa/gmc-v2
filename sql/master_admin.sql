-- GCM MAESTRO - MULTITENANCY & RLS SHIELD V3.3 (ULTRA STABLE)
-- Este script prepara o banco para o isolamento de dados e funcionalidades avançadas.

-- 1. Estrutura da Tabela SCHOOLS
ALTER TABLE IF EXISTS public.schools ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE IF EXISTS public.schools ADD COLUMN IF NOT EXISTS branding JSONB DEFAULT '{"primaryColor": "#38bdf8", "secondaryColor": "#a78bfa", "borderRadius": "24px", "logoUrl": null}';
ALTER TABLE IF EXISTS public.schools ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{"max_students": 50, "storage_gb": 5}';

-- 2. Estrutura da Tabela MISSIONS (Correção do Erro reported)
ALTER TABLE IF EXISTS public.missions ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.schools(id);
ALTER TABLE IF EXISTS public.missions ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT false;
ALTER TABLE IF EXISTS public.missions ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
ALTER TABLE IF EXISTS public.missions ADD COLUMN IF NOT EXISTS week_start TIMESTAMPTZ DEFAULT now();

-- 3. Estrutura de Vínculos Multitenant
ALTER TABLE IF EXISTS public.music_classes ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.schools(id);
ALTER TABLE IF EXISTS public.students ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.schools(id);
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.schools(id);

-- 4. Habilitar RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- 5. Função de Segurança para Super Admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND (role = 'super_admin' OR email = 'serparenan@gmail.com')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Política Global de Visibilidade de Missões (Exemplo RLS)
DROP POLICY IF EXISTS "Missions isolation" ON public.missions;
CREATE POLICY "Missions isolation" ON public.missions
FOR ALL USING (
    is_super_admin() OR 
    school_id = (SELECT school_id FROM public.profiles WHERE id = auth.uid()) OR
    (is_template = true AND school_id IS NULL)
);