-- Schema SQL para LinguaLife en Supabase (PostgreSQL)

CREATE TABLE IF NOT EXISTS public.students (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    timezone TEXT DEFAULT 'America/Bogota',
    pin TEXT NOT NULL,
    status TEXT DEFAULT 'Active',
    age_range TEXT,
    interests JSONB DEFAULT '[]'::jsonb,
    availability TEXT,
    open_to_groups BOOLEAN DEFAULT false,
    classes_remaining INT DEFAULT 16,
    tokens INT DEFAULT 0,
    current_topic_id TEXT,
    goal_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.teachers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    timezone TEXT DEFAULT 'America/Bogota',
    pin TEXT NOT NULL,
    status TEXT DEFAULT 'Active',
    meeting_link TEXT,
    availability TEXT,
    bank_details JSONB,
    interests JSONB DEFAULT '[]'::jsonb,
    ss_expiry_date TEXT,
    ss_last_updated TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.curriculum_topics (
    id TEXT PRIMARY KEY,
    topic_name TEXT NOT NULL,
    "order" INT DEFAULT 1,
    lds_formula TEXT,
    cached_slides JSONB DEFAULT '[]'::jsonb,
    goal_link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sessions (
    id TEXT PRIMARY KEY,
    teacher_id TEXT REFERENCES public.teachers(id) ON DELETE SET NULL,
    scheduled_at TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'Scheduled',
    session_name TEXT,
    topic_id TEXT REFERENCES public.curriculum_topics(id) ON DELETE SET NULL,
    is_holiday BOOLEAN DEFAULT false,
    holiday_confirmed_teacher BOOLEAN DEFAULT false,
    holiday_confirmed_student BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.session_participants (
    id TEXT PRIMARY KEY,
    session_id TEXT REFERENCES public.sessions(id) ON DELETE CASCADE,
    student_id TEXT REFERENCES public.students(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.student_teachers (
    id TEXT PRIMARY KEY,
    student_id TEXT REFERENCES public.students(id) ON DELETE CASCADE,
    teacher_id TEXT REFERENCES public.teachers(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.video_bank (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    youtube_url TEXT NOT NULL,
    thumbnail TEXT,
    level TEXT,
    vertical TEXT,
    status TEXT DEFAULT 'Approved',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.interactive_scenes (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    image_url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.scene_hotspots (
    id TEXT PRIMARY KEY,
    scene_id TEXT REFERENCES public.interactive_scenes(id) ON DELETE CASCADE,
    x NUMERIC NOT NULL,
    y NUMERIC NOT NULL,
    word TEXT NOT NULL,
    phonetic TEXT,
    translation TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Desactivar RLS para desarrollo inicial rápido / habilitar acceso con Service Role Key
ALTER TABLE public.students DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_topics DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_teachers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_bank DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.interactive_scenes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.scene_hotspots DISABLE ROW LEVEL SECURITY;
