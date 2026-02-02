-- 1. Garante colunas de Multitenancy e Templates em Missions
ALTER TABLE IF EXISTS public.missions 
ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.schools(id),
ADD COLUMN IF NOT EXISTS slug TEXT;

-- 2. Insere/Corrige a RedHouse com todos os campos obrigatórios para o Kernel
INSERT INTO public.schools (id, name, slug, is_active, branding)
VALUES (
    '77777777-7777-7777-7777-777777777777', 
    'RedHouse School Cuiaba', 
    'redhouse-cuiaba', 
    true, 
    '{"primaryColor": "#E11D48", "secondaryColor": "#000000", "borderRadius": "40px", "logoUrl": null}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET 
    slug = EXCLUDED.slug,
    is_active = true,
    branding = EXCLUDED.branding;

-- 3. Vincula o Perfil do Renan como Super Admin da Unidade RedHouse
-- Nota: Usamos auth.uid() para aplicar ao usuário logado no momento da execução
UPDATE public.profiles 
SET school_id = '77777777-7777-7777-7777-777777777777', 
    role = 'super_admin'
WHERE email = 'serparenan@gmail.com';