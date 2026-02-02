
-- GCM MAESTRO - MÓDULO 2: RH & TURMAS

-- 1. Expansão de Perfis para Gestão e Especialidade
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS specialty TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS guardian_id UUID REFERENCES public.profiles(id);

-- 2. Tabela de Turmas (Schedules)
CREATE TABLE IF NOT EXISTS public.music_classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    name TEXT NOT NULL, 
    day_of_week TEXT CHECK (day_of_week IN ('Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo')),
    start_time TIME NOT NULL,
    capacity INTEGER DEFAULT 5,
    teacher_id UUID REFERENCES public.profiles(id), -- Professor responsável
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Tabela de Matrículas (Muitos-para-Muitos)
-- Permite que Lucca esteja na Turma A e Turma B simultaneamente
CREATE TABLE IF NOT EXISTS public.enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.music_classes(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(student_id, class_id)
);

-- RLS para as novas entidades
ALTER TABLE public.music_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "SuperAdmin_Full_Access_Classes" ON public.music_classes FOR ALL TO authenticated USING (public.check_is_super_admin());
CREATE POLICY "SuperAdmin_Full_Access_Enrollments" ON public.enrollments FOR ALL TO authenticated USING (public.check_is_super_admin());

-- Gestores também podem ver turmas da sua escola
CREATE POLICY "Manager_View_Own_School_Classes" ON public.music_classes 
FOR SELECT TO authenticated 
USING (school_id IN (SELECT school_id FROM public.profiles WHERE id = auth.uid() AND role = 'manager'));
