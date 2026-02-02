
-- GCM MAESTRO V7.2 - MÓDULO 2: HUB DE PRESTAÇÃO DE SERVIÇOS (VERSÃO FINAL VALIDADA)

-- 1. Expansão de Contratos na tabela Schools
ALTER TABLE public.schools 
ADD COLUMN IF NOT EXISTS billing_model TEXT DEFAULT 'hourly' CHECK (billing_model IN ('hourly', 'per_student', 'fixed')),
ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS monthly_fee DECIMAL(10,2) DEFAULT 0.00;

-- 2. Tabela de Turmas (Grade Horária)
CREATE TABLE IF NOT EXISTS public.music_classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    name TEXT NOT NULL, 
    day_of_week TEXT NOT NULL CHECK (day_of_week IN ('Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo')),
    start_time TIME NOT NULL,
    capacity INTEGER DEFAULT 5,
    teacher_id UUID, -- Referência ao profile_id do professor
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Tabela de Matrículas (Muitos-para-Muitos)
-- RESOLVE: Lucca em várias turmas sem duplicar perfil
CREATE TABLE IF NOT EXISTS public.enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.music_classes(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(student_id, class_id)
);

-- 4. Log de Sessões (Auditoria de horas dadas para faturamento)
CREATE TABLE IF NOT EXISTS public.class_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID REFERENCES public.music_classes(id) ON DELETE SET NULL,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    teacher_id UUID, 
    duration_minutes INTEGER DEFAULT 60,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. FUNÇÕES DE SEGURANÇA (SECURITY DEFINER) - Evita erro de recursão no RLS
CREATE OR REPLACE FUNCTION public.check_user_role(target_role TEXT)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = target_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. POLÍTICAS RLS ATUALIZADAS (APLICANDO SECURITY DEFINER)
ALTER TABLE public.music_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_logs ENABLE ROW LEVEL SECURITY;

-- Reset de políticas para garantir aplicação limpa
DROP POLICY IF EXISTS "SuperAdmin_Full_Classes" ON public.music_classes;
DROP POLICY IF EXISTS "SuperAdmin_Full_Enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Professor_Manage_Own_School_Classes" ON public.music_classes;
DROP POLICY IF EXISTS "Professor_Manage_Own_School_Enrollments" ON public.enrollments;

-- Super Admin: Acesso Total
CREATE POLICY "SuperAdmin_Full_Classes" ON public.music_classes FOR ALL USING (public.check_is_super_admin());
CREATE POLICY "SuperAdmin_Full_Enrollments" ON public.enrollments FOR ALL USING (public.check_is_super_admin());

-- Professor: Gerencia turmas da sua escola
CREATE POLICY "Professor_Manage_Own_School_Classes" ON public.music_classes
FOR ALL USING (
    school_id IN (SELECT school_id FROM public.profiles WHERE id = auth.uid() AND role = 'professor')
);

-- Professor: Gerencia matrículas da sua escola
CREATE POLICY "Professor_Manage_Own_School_Enrollments" ON public.enrollments
FOR ALL USING (
    class_id IN (SELECT id FROM public.music_classes WHERE school_id IN (SELECT school_id FROM public.profiles WHERE id = auth.uid() AND role = 'professor'))
);

-- 7. PROVISIONAMENTO DO PROFESSOR (SOLUÇÃO RESILIENTE)
-- Nota: O UPDATE é seguro. Se o perfil não existir, nada acontece.
UPDATE public.profiles 
SET role = 'professor', 
    school_id = (SELECT id FROM public.schools WHERE slug = 'redhouse-cuiaba' LIMIT 1)
WHERE email = 'professor@oliemusic.com.br';
