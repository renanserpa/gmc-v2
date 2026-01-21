
-- ==============================================================================
-- OLIEMUSIC GCM - RECONSTRUÇÃO TOTAL DA ESTRUTURA DE DADOS (V4 - FIX 42501)
-- 
-- Execute este script no SQL Editor do Supabase para corrigir os erros:
-- 1. "permission denied for table profiles"
-- 2. "column professor_id does not exist"
-- ==============================================================================

-- 1. LIMPEZA SEGURA (DROP TOTAL DAS TABELAS PÚBLICAS)
DROP TABLE IF EXISTS public.concert_hall CASCADE;
DROP TABLE IF EXISTS public.performance_recordings CASCADE;
DROP TABLE IF EXISTS public.content_library CASCADE;
DROP TABLE IF EXISTS public.store_orders CASCADE;
DROP TABLE IF EXISTS public.store_items CASCADE;
DROP TABLE IF EXISTS public.player_achievements CASCADE;
DROP TABLE IF EXISTS public.achievements CASCADE;
DROP TABLE IF EXISTS public.xp_events CASCADE;
DROP TABLE IF EXISTS public.notices CASCADE;
DROP TABLE IF EXISTS public.missions CASCADE;
DROP TABLE IF EXISTS public.lessons CASCADE;
DROP TABLE IF EXISTS public.attendance_logs CASCADE;
DROP TABLE IF EXISTS public.music_classes CASCADE;
DROP TABLE IF EXISTS public.student_songs CASCADE;
DROP TABLE IF EXISTS public.student_sketches CASCADE;
DROP TABLE IF EXISTS public.students CASCADE;
DROP TABLE IF EXISTS public.professor_schools CASCADE;
DROP TABLE IF EXISTS public.teacher_progress CASCADE;
DROP TABLE IF EXISTS public.knowledge_docs CASCADE;
DROP TABLE IF EXISTS public.brain_query_cache CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.schools CASCADE;

-- 2. CRIAÇÃO DAS TABELAS (ESTRUTURA CORRETA)

-- Escolas e Perfis
CREATE TABLE public.schools (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    branding JSONB DEFAULT '{"primaryColor": "#38bdf8", "secondaryColor": "#a78bfa", "borderRadius": "24px"}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    role TEXT DEFAULT 'student',
    avatar_url TEXT,
    school_id UUID REFERENCES public.schools(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    badges TEXT[] DEFAULT '{}',
    reputation_points INTEGER DEFAULT 0,
    accessibility_settings JSONB DEFAULT '{"dyslexicFont": false, "highContrast": false, "colorBlindMode": "none", "reducedMotion": false, "uiMode": "standard"}'::jsonb
);

CREATE TABLE public.professor_schools (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    professor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'teacher',
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(professor_id, school_id)
);

-- Alunos (Com a coluna professor_id que faltava)
CREATE TABLE public.students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    professor_id UUID REFERENCES public.profiles(id),
    school_id UUID REFERENCES public.schools(id),
    auth_user_id UUID REFERENCES auth.users(id),
    guardian_id UUID REFERENCES auth.users(id),
    
    name TEXT NOT NULL,
    instrument TEXT DEFAULT 'Violão',
    avatar_url TEXT,
    
    xp INTEGER DEFAULT 0,
    coins INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 1,
    current_streak_days INTEGER DEFAULT 0,
    last_activity_date TIMESTAMPTZ,
    
    invite_code TEXT,
    access_code TEXT,
    completed_module_ids TEXT[] DEFAULT '{}',
    completed_content_ids TEXT[] DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Conteúdo e Pedagogia
CREATE TABLE public.missions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    professor_id UUID REFERENCES public.profiles(id),
    student_id UUID REFERENCES public.students(id),
    title TEXT NOT NULL,
    description TEXT,
    week_start DATE,
    xp_reward INTEGER DEFAULT 30,
    coins_reward INTEGER DEFAULT 5,
    status TEXT DEFAULT 'pending',
    position INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.lessons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    professor_id UUID REFERENCES public.profiles(id),
    student_id UUID REFERENCES public.students(id),
    date DATE NOT NULL,
    starts_at TIME NOT NULL,
    status TEXT DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.notices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    professor_id UUID REFERENCES public.profiles(id),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    target_audience TEXT DEFAULT 'all',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.content_library (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    professor_id UUID REFERENCES public.profiles(id),
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    url TEXT NOT NULL,
    difficulty_level TEXT DEFAULT 'beginner',
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Gamificação
CREATE TABLE public.xp_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    player_id UUID REFERENCES public.students(id),
    event_type TEXT NOT NULL,
    xp_amount INTEGER NOT NULL,
    coins_amount INTEGER DEFAULT 0,
    context_type TEXT,
    context_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.store_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    professor_id UUID REFERENCES public.profiles(id),
    name TEXT NOT NULL,
    description TEXT,
    price_coins INTEGER NOT NULL,
    image_url TEXT,
    metadata JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.store_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    player_id UUID REFERENCES public.students(id),
    store_item_id UUID REFERENCES public.store_items(id),
    coins_spent INTEGER NOT NULL,
    is_equipped BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    xp_reward INTEGER DEFAULT 50,
    icon_key TEXT
);

CREATE TABLE public.player_achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    player_id UUID REFERENCES public.students(id),
    achievement_id UUID REFERENCES public.achievements(id),
    achieved_at TIMESTAMPTZ DEFAULT now()
);

-- Social & Media
CREATE TABLE public.performance_recordings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES public.students(id),
    song_id TEXT,
    professor_id UUID REFERENCES public.profiles(id),
    audio_url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.concert_hall (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    performance_id UUID REFERENCES public.performance_recordings(id) ON DELETE CASCADE,
    professor_id UUID REFERENCES public.profiles(id),
    high_fives_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Outros
CREATE TABLE public.knowledge_docs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    tokens INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.teacher_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    professor_id UUID REFERENCES public.profiles(id),
    module_id TEXT NOT NULL,
    completed_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.brain_query_cache (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    query TEXT,
    answer TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabelas auxiliares
CREATE TABLE public.music_classes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    professor_id UUID REFERENCES public.profiles(id),
    name TEXT NOT NULL,
    start_time TEXT,
    days_of_week TEXT[],
    age_group TEXT,
    school_id UUID REFERENCES public.schools(id)
);

CREATE TABLE public.attendance_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES public.students(id),
    music_class_id UUID REFERENCES public.music_classes(id),
    status TEXT,
    attendance_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.student_songs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES public.students(id),
    song_title TEXT,
    status TEXT DEFAULT 'learning',
    mastery_level INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.student_sketches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES auth.users(id),
    audio_url TEXT NOT NULL,
    title TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. RESTAURAÇÃO DE PERFIS EXISTENTES (Backfill)
INSERT INTO public.profiles (id, email, full_name, role)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'full_name', 'Usuário Recuperado'),
    COALESCE(raw_user_meta_data->>'role', 'student')
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 4. POLÍTICAS DE SEGURANÇA (RLS) - CORRIGIDAS PARA O PILOTO

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;

-- Profiles: Leitura pública, Escrita para o próprio dono (Auto-Healing)
DROP POLICY IF EXISTS "Public Read Profiles" ON public.profiles;
CREATE POLICY "Public Read Profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Self Update Profiles" ON public.profiles;
CREATE POLICY "Self Update Profiles" ON public.profiles 
FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Students:
DROP POLICY IF EXISTS "Students Access" ON public.students;
CREATE POLICY "Students Access" ON public.students 
FOR ALL USING (
  auth.uid() = professor_id OR 
  auth.uid() = auth_user_id OR 
  auth.uid() = guardian_id
);

-- Missions:
DROP POLICY IF EXISTS "Missions Access" ON public.missions;
CREATE POLICY "Missions Access" ON public.missions 
FOR ALL USING (true);

-- Demais tabelas abertas para usuários autenticados para evitar 42501 durante o piloto
ALTER TABLE public.xp_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "XP Events Auth" ON public.xp_events FOR ALL TO authenticated USING (true);

ALTER TABLE public.store_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Store Items Read" ON public.store_items FOR SELECT USING (true);
CREATE POLICY "Store Items Write" ON public.store_items FOR ALL USING (auth.uid() = professor_id);

ALTER TABLE public.store_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Store Orders Auth" ON public.store_orders FOR ALL TO authenticated USING (true);

-- Liberar acesso geral para tabelas auxiliares durante o piloto
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Notices All" ON public.notices FOR ALL USING (true);

ALTER TABLE public.content_library ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lib All" ON public.content_library FOR ALL USING (true);

ALTER TABLE public.music_classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Classes All" ON public.music_classes FOR ALL USING (true);

ALTER TABLE public.attendance_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Attendance All" ON public.attendance_logs FOR ALL USING (true);

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lessons All" ON public.lessons FOR ALL USING (true);

-- 5. FUNÇÕES RPC (Backend Logic)

CREATE OR REPLACE FUNCTION get_students_by_context(p_school_id UUID DEFAULT NULL)
RETURNS SETOF students AS $$
BEGIN
  -- Retorna alunos do professor logado, filtrando por escola se fornecido
  IF p_school_id IS NULL THEN
    RETURN QUERY SELECT * FROM students WHERE professor_id = auth.uid();
  ELSE
    RETURN QUERY SELECT * FROM students WHERE professor_id = auth.uid() AND school_id = p_school_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION give_high_five(target_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE concert_hall 
  SET high_fives_count = high_fives_count + 1 
  WHERE id = target_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION mark_attendance_and_award_xp(p_student_id UUID, p_class_id UUID, p_status TEXT, p_professor_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    xp_val INTEGER := 0;
BEGIN
    -- Verifica se já marcou hoje
    IF EXISTS (SELECT 1 FROM attendance_logs WHERE student_id = p_student_id AND attendance_date = CURRENT_DATE AND music_class_id = p_class_id) THEN
        RETURN FALSE;
    END IF;

    -- Insere Log
    INSERT INTO attendance_logs (student_id, music_class_id, status) VALUES (p_student_id, p_class_id, p_status);

    -- Calcula XP
    IF p_status = 'present' THEN xp_val := 20; END IF;
    IF p_status = 'late' THEN xp_val := 10; END IF;

    -- Dá XP
    IF xp_val > 0 THEN
        UPDATE students SET xp = xp + xp_val WHERE id = p_student_id;
        INSERT INTO xp_events (player_id, event_type, xp_amount, context_type) VALUES (p_student_id, 'ATTENDANCE', xp_val, 'class');
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para novos usuários
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, avatar_url)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    COALESCE(new.raw_user_meta_data->>'role', 'student'),
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==============================================================================
-- 6. OVERRIDES DE DESENVOLVIMENTO (RENAN SERPA ADMIN)
-- ==============================================================================

-- Garantir existência da Unidade HQ Dev para testes de Multi-Tenant
INSERT INTO public.schools (id, name, branding)
VALUES ('00000000-0000-0000-0000-000000000000', 'OlieMusic HQ (Dev)', '{"primaryColor": "#38bdf8", "secondaryColor": "#a78bfa", "borderRadius": "40px"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Promover Renan Serpa e vinculá-lo à unidade padrão de dev
UPDATE public.profiles 
SET role = 'admin', school_id = '00000000-0000-0000-0000-000000000000'
WHERE full_name = 'Renan Serpa' OR email = 'renan@oliemusic.com';
