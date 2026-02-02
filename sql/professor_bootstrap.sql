
-- GCM MAESTRO - PROVISIONAMENTO DE PROFESSOR & PERMISSÕES

-- 1. Criação do Perfil do Professor (Garante integridade se já existir)
-- Nota: O ID é gerado, mas será sincronizado pelo Supabase Auth no primeiro login
INSERT INTO public.profiles (id, email, full_name, role)
VALUES (
    gen_random_uuid(), 
    'professor@oliemusic.com.br', 
    'Maestro Renan (RedHouse)', 
    'professor'
)
ON CONFLICT (email) DO UPDATE SET role = 'professor';

-- 2. Vinculação à RedHouse como Professor Responsável
UPDATE public.schools 
SET owner_id = (SELECT id FROM public.profiles WHERE email = 'professor@oliemusic.com.br')
WHERE slug = 'redhouse-cuiaba';

-- 3. Função para checagem de papel de Professor
CREATE OR REPLACE FUNCTION public.check_is_professor()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'professor'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Atualização de Políticas RLS para Autonomia do Professor

-- Turmas: Professores podem criar na sua própria escola
CREATE POLICY "Professors_Manage_Own_Classes" ON public.music_classes
FOR ALL TO authenticated
USING (
    school_id IN (SELECT school_id FROM public.profiles WHERE id = auth.uid() AND role = 'professor')
)
WITH CHECK (
    school_id IN (SELECT school_id FROM public.profiles WHERE id = auth.uid() AND role = 'professor')
);

-- Alunos: Professores podem cadastrar novos perfis do tipo 'student'
CREATE POLICY "Professors_Create_Students" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (
    role = 'student' AND 
    public.check_is_professor()
);

-- Students: Professores veem alunos do seu school_id
CREATE POLICY "Professors_View_Own_School_Students" ON public.students
FOR ALL TO authenticated
USING (
    school_id IN (SELECT school_id FROM public.profiles WHERE id = auth.uid() AND role = 'professor')
);
