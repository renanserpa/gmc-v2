
-- GCM MAESTRO V7.3 - TEACHER-OWNER ENGINE

-- 1. Provisionamento do Perfil do Renan (Teacher-Owner)
-- Nota: O ID real será vinculado no login via e-mail.
INSERT INTO public.profiles (id, email, full_name, role)
VALUES (
    gen_random_uuid(), 
    'professor@oliemusic.com.br', 
    'Mestre Renan (Teacher-Owner)', 
    'professor'
)
ON CONFLICT (email) DO UPDATE SET role = 'professor';

-- 2. RESET DE POLÍTICAS PARA TABELA SCHOOLS (GARANTINDO HIERARQUIA)
DROP POLICY IF EXISTS "SuperAdmin_Manage_All_Schools" ON public.schools;
DROP POLICY IF EXISTS "Professors_Create_Own_Schools" ON public.schools;
DROP POLICY IF EXISTS "Professors_Manage_Own_Schools" ON public.schools;

-- A: Super Admin vê absolutamente tudo
CREATE POLICY "SuperAdmin_Full_Access" ON public.schools
FOR ALL TO authenticated USING (public.check_is_super_admin());

-- B: Professor pode criar sua própria escola (INSERT)
CREATE POLICY "Professors_Create_Own_Schools" ON public.schools
FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'professor'
    )
);

-- C: Professor pode gerenciar apenas as escolas onde ele é o OWNER
CREATE POLICY "Professors_Manage_Own_Schools" ON public.schools
FOR ALL TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- 3. AJUSTE DE POLÍTICAS PARA TURMAS E ALUNOS
-- Garante que o professor veja apenas dados vinculados às SUAS escolas
DROP POLICY IF EXISTS "Professor_Manage_Own_School_Classes" ON public.music_classes;
CREATE POLICY "Professor_Manage_Own_School_Classes" ON public.music_classes
FOR ALL USING (
    school_id IN (SELECT id FROM public.schools WHERE owner_id = auth.uid())
    OR public.check_is_super_admin()
);

DROP POLICY IF EXISTS "Professor_Manage_Own_School_Students" ON public.students;
CREATE POLICY "Professor_Manage_Own_School_Students" ON public.students
FOR ALL USING (
    school_id IN (SELECT id FROM public.schools WHERE owner_id = auth.uid())
    OR public.check_is_super_admin()
);
