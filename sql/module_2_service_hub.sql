
-- GCM MAESTRO V7.2 - MÓDULO 2: HUB DE PRESTAÇÃO DE SERVIÇOS

-- 1. Expansão de Contratos na tabela Schools
ALTER TABLE public.schools 
ADD COLUMN IF NOT EXISTS billing_model TEXT DEFAULT 'hourly' CHECK (billing_model IN ('hourly', 'per_student', 'fixed')),
ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS monthly_fee DECIMAL(10,2) DEFAULT 0.00;

-- 2. Tabela de Turmas (Grade Horária Fixa)
CREATE TABLE IF NOT EXISTS public.music_classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    name TEXT NOT NULL, 
    day_of_week TEXT NOT NULL CHECK (day_of_week IN ('Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo')),
    start_time TIME NOT NULL,
    capacity INTEGER DEFAULT 5,
    teacher_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Tabela de Matrículas (Muitos-para-Muitos)
-- Permite que o Aluno Lucca esteja em N turmas diferentes
CREATE TABLE IF NOT EXISTS public.enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.music_classes(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(student_id, class_id)
);

-- 4. Log de Sessões (Auditável para conferência de horas faturadas)
CREATE TABLE IF NOT EXISTS public.class_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID REFERENCES public.music_classes(id) ON DELETE SET NULL,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES public.profiles(id),
    duration_minutes INTEGER DEFAULT 60,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. RLS - Políticas de Segurança para Gestores e Professores
ALTER TABLE public.music_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_logs ENABLE ROW LEVEL SECURITY;

-- Super Admin: Acesso total
CREATE POLICY "SuperAdmin_Full_Access_Classes" ON public.music_classes FOR ALL TO authenticated USING (public.check_is_super_admin());
CREATE POLICY "SuperAdmin_Full_Access_Enrollments" ON public.enrollments FOR ALL TO authenticated USING (public.check_is_super_admin());
CREATE POLICY "SuperAdmin_Full_Access_Logs" ON public.class_logs FOR ALL TO authenticated USING (public.check_is_super_admin());

-- Manager (Gestor): Vê apenas as turmas e matrículas da sua escola
CREATE POLICY "Manager_Own_School_Classes" ON public.music_classes 
FOR SELECT TO authenticated 
USING (school_id IN (SELECT school_id FROM public.profiles WHERE id = auth.uid() AND role IN ('manager', 'school_manager')));

CREATE POLICY "Manager_Own_School_Enrollments" ON public.enrollments 
FOR SELECT TO authenticated 
USING (class_id IN (SELECT id FROM public.music_classes WHERE school_id IN (SELECT school_id FROM public.profiles WHERE id = auth.uid() AND role IN ('manager', 'school_manager'))));
