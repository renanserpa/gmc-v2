
-- GCM MAESTRO V7.4 - KERNEL ERP & MULTI-ENROLLMENT

-- 1. ESCOLAS: Adicionar colunas de Billing (ERP Maestro)
ALTER TABLE public.schools 
ADD COLUMN IF NOT EXISTS billing_model TEXT DEFAULT 'hourly' CHECK (billing_model IN ('hourly', 'per_student', 'fixed')),
ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS monthly_fee DECIMAL(10,2) DEFAULT 0.00;

-- 2. TURMAS: Grade horária da Unidade
CREATE TABLE IF NOT EXISTS public.music_classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    name TEXT NOT NULL, 
    day_of_week TEXT NOT NULL CHECK (day_of_week IN ('Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo')),
    start_time TIME NOT NULL,
    capacity INTEGER DEFAULT 5,
    teacher_id UUID, -- Referência ao profile_id
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. MATRÍCULAS: A CURA PARA O "CASO LUCCA"
-- Permite que 1 aluno esteja em N turmas de diferentes escolas
CREATE TABLE IF NOT EXISTS public.enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.music_classes(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(student_id, class_id)
);

-- 4. LOGS DE SESSÃO: Auditoria para Faturamento (ERP)
CREATE TABLE IF NOT EXISTS public.class_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID REFERENCES public.music_classes(id) ON DELETE SET NULL,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    teacher_id UUID, 
    duration_minutes INTEGER DEFAULT 60,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. POLÍTICAS RLS DE SOBERANIA (OWNER-ID DRIVEN)
ALTER TABLE public.music_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_logs ENABLE ROW LEVEL SECURITY;

-- Reset para evitar conflitos
DROP POLICY IF EXISTS "Professor_Manage_Own_Classes" ON public.music_classes;
DROP POLICY IF EXISTS "Professor_Manage_Own_Enrollments" ON public.enrollments;

-- Professor vê e edita apenas o que ele é dono (via school_id -> owner_id)
CREATE POLICY "Professor_Manage_Own_Classes" ON public.music_classes
FOR ALL TO authenticated
USING (
    school_id IN (SELECT id FROM public.schools WHERE owner_id = auth.uid())
    OR public.check_is_super_admin()
);

CREATE POLICY "Professor_Manage_Own_Enrollments" ON public.enrollments
FOR ALL TO authenticated
USING (
    class_id IN (SELECT id FROM public.music_classes WHERE school_id IN (SELECT id FROM public.schools WHERE owner_id = auth.uid()))
    OR public.check_is_super_admin()
);

-- 6. FIX 23503: Promoção do Renan a Professor (Resiliente)
-- Nota: Usamos UPDATE pois assumimos que o e-mail já existe ou será criado no Auth.
-- Se o usuário não existir no Auth ainda, esta query não falhará, apenas esperará o login.
UPDATE public.profiles 
SET role = 'professor'
WHERE email = 'professor@oliemusic.com.br';
