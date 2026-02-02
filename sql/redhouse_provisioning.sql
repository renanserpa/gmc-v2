-- PROVISIONAMENTO REDHOUSE SCHOOL CUIABÁ - HOMOLOGAÇÃO V1
-- Este script assume que o master_admin.sql já foi executado.

-- 1. Criar a Unidade Escolar
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
    branding = EXCLUDED.branding,
    settings = EXCLUDED.settings;

-- 2. Sincronizar o Perfil Master (Renan Serpa) com a Unidade
UPDATE public.profiles 
SET school_id = '88888888-4444-4444-4444-121212121212',
    role = 'professor'
WHERE email = 'serparenan@gmail.com';

-- 3. Criar Missão Spider Walk (Referência Pedagógica)
INSERT INTO public.missions (
    title, 
    description, 
    xp_reward, 
    professor_id, 
    school_id, 
    is_template, 
    status,
    metadata
) VALUES (
    'Spider Walk: Desafio RedHouse Cuiabá',
    'Execute a subida rítmica (1-2-3-4) em todas as cordas mantendo o arco da mão esquerda.',
    300,
    (SELECT id FROM public.profiles WHERE email = 'serparenan@gmail.com' LIMIT 1),
    '88888888-4444-4444-4444-121212121212',
    true,
    'pending',
    '{"bpm_target": 75, "required_accuracy": 0.85, "type": "Technique", "fret_range": [1, 4]}'
);
