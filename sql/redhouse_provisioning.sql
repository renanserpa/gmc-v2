-- PROVISIONAMENTO REDHOUSE CUIABÁ - GCM MAESTRO V5.0
-- Este script provisiona a estrutura institucional e pedagógica inicial.

-- 1. Criar Unidade Escolar (Tenant)
INSERT INTO public.schools (id, name, slug, is_active, branding, settings)
VALUES (
    '88888888-4444-4444-4444-121212121212', -- UUID RedHouse Cuiabá
    'RedHouse School Cuiabá',
    'redhouse-cuiaba',
    true,
    '{"primaryColor": "#0ea5e9", "secondaryColor": "#a78bfa", "borderRadius": "32px", "logoUrl": null}',
    '{"max_students": 100, "storage_gb": 20}'
) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 2. Vincular Professor Renan Serpa (Assume-se que o usuário já existe no Auth/Profiles)
UPDATE public.profiles 
SET school_id = '88888888-4444-4444-4444-121212121212',
    role = 'professor'
WHERE email = 'serparenan@gmail.com';

-- 3. Criar Turma Kids RedHouse
INSERT INTO public.music_classes (id, name, professor_id, school_id, start_time, days_of_week, age_group)
VALUES (
    '11111111-2222-3333-4444-555555555555',
    'Turma A - Violão Kids (RedHouse)',
    (SELECT id FROM public.profiles WHERE email = 'serparenan@gmail.com'),
    '88888888-4444-4444-4444-121212121212',
    '16:00',
    ARRAY['Monday'],
    '4-6'
) ON CONFLICT (id) DO NOTHING;

-- 4. Adicionar Missão "O Chamado da Aranha" (Apostila V3.0)
INSERT INTO public.missions (
    title, 
    description, 
    xp_reward, 
    professor_id, 
    school_id, 
    is_template, 
    status,
    week_start
) VALUES (
    'O Chamado da Aranha',
    'Suba as 4 primeiras casas do violão com a técnica de dedos alternados (Verde, Amarelo, Laranja, Vermelho).',
    150,
    (SELECT id FROM public.profiles WHERE email = 'serparenan@gmail.com'),
    '88888888-4444-4444-4444-121212121212',
    true,
    'pending',
    now()
);