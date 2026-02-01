-- PROVISIONAMENTO FINAL: REDHOUSE CUIABÁ (REPAIR MODE)
-- Este script garante a inserção dos dados com a estrutura já corrigida.

-- 1. Criar Unidade Escolar (Tenant) com Branding Oficial
INSERT INTO public.schools (id, name, slug, is_active, branding, settings)
VALUES (
    '88888888-4444-4444-4444-121212121212',
    'RedHouse School Cuiabá',
    'redhouse-cuiaba',
    true,
    '{
        "primaryColor": "#E11D48", 
        "secondaryColor": "#0F172A", 
        "borderRadius": "40px", 
        "logoUrl": "https://redhouseschool.com.br/wp-content/themes/redhouse/assets/images/logo-redhouse.png"
    }',
    '{"max_students": 150, "storage_gb": 50, "audio_latency_max": 100}'
) ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    branding = EXCLUDED.branding,
    settings = EXCLUDED.settings;

-- 2. Vinculação do Professor Titular (Renan Serpa)
-- Garante que o perfil do professor aponte para a RedHouse para o RLS funcionar
UPDATE public.profiles 
SET school_id = '88888888-4444-4444-4444-121212121212',
    role = 'professor'
WHERE email = 'serparenan@gmail.com';

-- 3. Missão de Boas-Vindas (Spider Walk v1)
-- Agora utilizando is_template e metadata após a correção no master_admin.sql
INSERT INTO public.missions (
    title, 
    description, 
    xp_reward, 
    professor_id, 
    school_id, 
    is_template, 
    status,
    week_start,
    metadata
) VALUES (
    'Spider Walk: O Despertar',
    'Aqueça os motores rítmicos na RedHouse! Complete 4 ciclos subindo as cordas com precisão.',
    200,
    (SELECT id FROM public.profiles WHERE email = 'serparenan@gmail.com'),
    '88888888-4444-4444-4444-121212121212',
    true,
    'pending',
    now(),
    '{"bpm_target": 75, "required_accuracy": 0.85, "type": "Technique"}'
);