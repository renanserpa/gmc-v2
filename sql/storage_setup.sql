-- 1. CRIAR BUCKET DE BRANDING
INSERT INTO storage.buckets (id, name, public) 
VALUES ('branding', 'branding', true)
ON CONFLICT (id) DO NOTHING;

-- 2. LIBERAR UPLOAD PARA O SUPER ADMIN (VIA JWT EMAIL)
-- Removemos políticas antigas para evitar conflitos
DROP POLICY IF EXISTS "SuperAdmin_Upload_Branding" ON storage.objects;

CREATE POLICY "SuperAdmin_Upload_Branding" ON storage.objects
FOR ALL TO authenticated
USING (bucket_id = 'branding' AND (auth.jwt() ->> 'email' = 'serparenan@gmail.com'))
WITH CHECK (bucket_id = 'branding' AND (auth.jwt() ->> 'email' = 'serparenan@gmail.com'));
