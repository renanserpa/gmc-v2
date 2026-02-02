-- GCM MAESTRO - PATCH DE ATIVAÇÃO REDHOUSE V4.6
-- 1. Garantir colunas essenciais na tabela de escolas
ALTER TABLE IF EXISTS public.schools ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE IF EXISTS public.schools ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);

-- 2. Upsert da RedHouse com SLUG e OWNER (Vinculando ao executor)
-- O ID '7777...' é reservado para a RedHouse no Kernel Maestro
INSERT INTO public.schools (id, name, slug, is_active, owner_id, branding)
VALUES (
    '77777777-7777-7777-7777-777777777777', 
    'RedHouse School Cuiaba', 
    'redhouse-cuiaba', 
    true, 
    auth.uid(), 
    '{"primaryColor": "#E11D48", "secondaryColor": "#0F172A", "borderRadius": "40px", "logoUrl": null}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET 
    slug = EXCLUDED.slug,
    owner_id = EXCLUDED.owner_id,
    is_active = true,
    branding = EXCLUDED.branding;

-- 3. Bypass de Segurança: Admins veem TUDO
DROP POLICY IF EXISTS "Admins veem todas as escolas" ON public.schools;
CREATE POLICY "Admins veem todas as escolas" ON public.schools 
FOR ALL TO authenticated USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('super_admin', 'admin')
);

-- 4. Garantir coluna is_template em missions (prevenção de erro frontend)
ALTER TABLE IF EXISTS public.missions ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT false;