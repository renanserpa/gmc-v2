-- GCM MAESTRO - MULTITENANCY & RLS SHIELD V3.0 (PROD STABLE)

-- 1. Estrutura de Tabelas (Garantir colunas de isolamento)
ALTER TABLE IF EXISTS public.music_classes ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.schools(id);
ALTER TABLE IF EXISTS public.missions ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.schools(id);
ALTER TABLE IF EXISTS public.students ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.schools(id);
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.schools(id);

-- 2. Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- 3. Função Auxiliar: Verificador de Super Admin (Para evitar loops de recursão em políticas)
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'super_admin' OR email = 'serparenan@gmail.com'
    FROM public.profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Políticas de Isolamento por School_ID (Tenant Isolation)

-- Profiles: Usuário vê a si mesmo ou colegas da mesma escola. Super Admin vê tudo.
DROP POLICY IF EXISTS "Tenant Isolation: Profiles" ON public.profiles;
CREATE POLICY "Tenant Isolation: Profiles" ON public.profiles
FOR ALL USING (
    is_super_admin() OR school_id = (SELECT p.school_id FROM public.profiles p WHERE p.id = auth.uid())
);

-- Music Classes: Professor vê suas turmas. Super Admin vê tudo.
DROP POLICY IF EXISTS "Tenant Isolation: Music Classes" ON public.music_classes;
CREATE POLICY "Tenant Isolation: Music Classes" ON public.music_classes
FOR ALL USING (
    is_super_admin() OR school_id = (SELECT p.school_id FROM public.profiles p WHERE p.id = auth.uid())
);

-- Missions: Aluno vê suas tarefas. Professor vê as da sua unidade. Super Admin vê tudo.
DROP POLICY IF EXISTS "Tenant Isolation: Missions" ON public.missions;
CREATE POLICY "Tenant Isolation: Missions" ON public.missions
FOR ALL USING (
    is_super_admin() OR school_id = (SELECT p.school_id FROM public.profiles p WHERE p.id = auth.uid())
);

-- Students: Isolamento de dados pedagógicos e financeiros de alunos.
DROP POLICY IF EXISTS "Tenant Isolation: Students" ON public.students;
CREATE POLICY "Tenant Isolation: Students" ON public.students
FOR ALL USING (
    is_super_admin() OR school_id = (SELECT p.school_id FROM public.profiles p WHERE p.id = auth.uid())
);

-- 5. Configuração Realtime (CDC)
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.music_classes REPLICA IDENTITY FULL;
ALTER TABLE public.missions REPLICA IDENTITY FULL;
ALTER TABLE public.students REPLICA IDENTITY FULL;