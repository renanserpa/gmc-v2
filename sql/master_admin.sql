-- GCM MAESTRO - MULTITENANCY & RLS SHIELD V2.0

-- 1. Garantir colunas de isolamento
ALTER TABLE IF EXISTS public.music_classes ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.schools(id);
ALTER TABLE IF EXISTS public.missions ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.schools(id);
ALTER TABLE IF EXISTS public.students ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.schools(id);

-- 2. Habilitar RLS em todas as tabelas críticas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de Isolamento por School_ID (Tenant Isolation)

-- Policy: Profiles (Usuários só veem colegas da mesma escola, Admins veem tudo)
CREATE POLICY "Tenant Isolation: Profiles" ON public.profiles
FOR ALL USING (
    school_id = (SELECT school_id FROM public.profiles WHERE id = auth.uid())
    OR 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'super_admin')
);

-- Policy: Music Classes (Professor vê apenas turmas da sua escola)
CREATE POLICY "Tenant Isolation: Music Classes" ON public.music_classes
FOR ALL USING (
    school_id = (SELECT school_id FROM public.profiles WHERE id = auth.uid())
    OR 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'super_admin')
);

-- Policy: Missions (Aluno vê suas missões, Professor vê as da sua escola)
CREATE POLICY "Tenant Isolation: Missions" ON public.missions
FOR ALL USING (
    school_id = (SELECT school_id FROM public.profiles WHERE id = auth.uid())
    OR 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'super_admin')
);

-- Policy: Students (Isolamento total de dados sensíveis de menores)
CREATE POLICY "Tenant Isolation: Students" ON public.students
FOR ALL USING (
    school_id = (SELECT school_id FROM public.profiles WHERE id = auth.uid())
    OR 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'super_admin')
);

-- 4. Replica Identity para Realtime CDC
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.music_classes REPLICA IDENTITY FULL;
