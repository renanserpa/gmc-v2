
-- GCM MAESTRO - EXPANSÃO: TURMAS E FATURAMENTO POR HORA

-- 1. Valor da Hora-Aula no Tenant
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10,2) DEFAULT 0.00;

-- 2. Tabela de Turmas (Horários fixos na escola)
CREATE TABLE IF NOT EXISTS public.music_classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- Ex: "Segunda 16h - Kids"
    day_of_week TEXT CHECK (day_of_week IN ('Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo')),
    start_time TIME,
    capacity INTEGER DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Tabela de Matrículas (Um aluno pode estar em várias turmas)
CREATE TABLE IF NOT EXISTS public.enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.music_classes(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(student_id, class_id)
);

-- 4. Log de Aulas Dadas (Auditável para Cobrança)
CREATE TABLE IF NOT EXISTS public.class_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID REFERENCES public.music_classes(id) ON DELETE SET NULL,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES public.profiles(id),
    duration_minutes INTEGER DEFAULT 60,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS para as novas tabelas
ALTER TABLE public.music_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin_Manage_Classes" ON public.music_classes FOR ALL TO authenticated USING (public.check_is_super_admin());
CREATE POLICY "Admin_Manage_Enrollments" ON public.enrollments FOR ALL TO authenticated USING (public.check_is_super_admin());
CREATE POLICY "Admin_Manage_Logs" ON public.class_logs FOR ALL TO authenticated USING (public.check_is_super_admin());
