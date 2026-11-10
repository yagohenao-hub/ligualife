-- =============================================================================
-- ESQUEMA DE BASE DE DATOS: VOCABULARIO CEFR, RED SEMÁNTICA & GAMIFICACIÓN
-- LinguaLife System
-- =============================================================================

-- 1. Tabla de Palabras Lema
CREATE TABLE IF NOT EXISTS public.vocabulary_words (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    word TEXT NOT NULL,
    cefr_level TEXT NOT NULL CHECK (cefr_level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
    part_of_speech TEXT NOT NULL,
    ipa TEXT,
    audio_url TEXT,
    frequency_rank INTEGER,
    thematic_cluster TEXT, -- Preparado para clústeres futuros (Negocios, Viajes, etc.)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_word_level UNIQUE(word, cefr_level)
);

-- 2. Tabla de Acepciones Individuales (Senses)
CREATE TABLE IF NOT EXISTS public.vocabulary_senses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    word_id UUID NOT NULL REFERENCES public.vocabulary_words(id) ON DELETE CASCADE,
    sense_index INTEGER NOT NULL DEFAULT 1,
    cefr_level_target TEXT NOT NULL CHECK (cefr_level_target IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
    definition_en TEXT NOT NULL,
    definition_es TEXT NOT NULL,
    example_sentence_en TEXT NOT NULL,
    example_sentence_es TEXT NOT NULL,
    collocations JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_sense_per_word UNIQUE(word_id, sense_index)
);

-- 3. Tabla de Red y Relaciones Semánticas (Grafo de Sinónimos y Antónimos)
CREATE TABLE IF NOT EXISTS public.vocabulary_relations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_sense_id UUID NOT NULL REFERENCES public.vocabulary_senses(id) ON DELETE CASCADE,
    target_sense_id UUID NOT NULL REFERENCES public.vocabulary_senses(id) ON DELETE CASCADE,
    relation_type TEXT NOT NULL CHECK (relation_type IN ('synonym', 'antonym', 'related')),
    strength NUMERIC DEFAULT 1.0,
    thematic_topic TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_relation UNIQUE(source_sense_id, target_sense_id, relation_type)
);

-- 4. Tabla de Estado y Progreso Individual del Alumno por Acepción
CREATE TABLE IF NOT EXISTS public.student_vocabulary_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    sense_id UUID NOT NULL REFERENCES public.vocabulary_senses(id) ON DELETE CASCADE,
    triage_status TEXT NOT NULL DEFAULT 'unreviewed' 
        CHECK (triage_status IN ('mastered', 'to_learn', 'passive', 'unreviewed')),
    learning_stage TEXT NOT NULL DEFAULT 'learning' 
        CHECK (learning_stage IN ('learning', 'practicing', 'mastered')),
    context_embedding_priority NUMERIC NOT NULL DEFAULT 1.0,
    retention_score INTEGER DEFAULT 0 CHECK (retention_score BETWEEN 0 AND 100),
    swiped_at TIMESTAMPTZ,
    last_reviewed_at TIMESTAMPTZ,
    times_reviewed INTEGER DEFAULT 0,
    times_correct INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_student_sense UNIQUE(student_id, sense_id)
);

-- 5. Tabla de Sesiones de Juego y Métricas Gamificadas
CREATE TABLE IF NOT EXISTS public.vocabulary_game_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    game_mode TEXT NOT NULL CHECK (game_mode IN ('trivia', 'speed_linker')),
    target_level TEXT NOT NULL,
    included_previous_pending BOOLEAN DEFAULT FALSE,
    score INTEGER NOT NULL DEFAULT 0,
    correct_count INTEGER NOT NULL DEFAULT 0,
    total_questions INTEGER NOT NULL DEFAULT 0,
    mistakes_log JSONB DEFAULT '[]'::jsonb,
    played_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices de Alta Eficiencia
CREATE INDEX IF NOT EXISTS idx_vocab_words_level ON public.vocabulary_words(cefr_level);
CREATE INDEX IF NOT EXISTS idx_vocab_senses_level ON public.vocabulary_senses(cefr_level_target);
CREATE INDEX IF NOT EXISTS idx_vocab_senses_word ON public.vocabulary_senses(word_id);
CREATE INDEX IF NOT EXISTS idx_vocab_state_lookup ON public.student_vocabulary_state(student_id, triage_status);
CREATE INDEX IF NOT EXISTS idx_vocab_relations_src ON public.vocabulary_relations(source_sense_id);
