-- =============================================================================
-- ESQUEMA DE BASE DE DATOS: VOCABULARIO CEFR, CONECTORES & PHRASAL VERBS
-- LinguaLife System (Banco Compartido & Progresión por Racha)
-- =============================================================================

-- 1. Tabla de Palabras / Expresiones Lema
CREATE TABLE IF NOT EXISTS public.vocabulary_words (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    word TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'cefr_general'
        CHECK (category IN ('time_words', 'prepositions_in_on_at', 'wh_words', 'logical_connectors', 'phrasal_verbs', 'cefr_general')),
    cefr_level TEXT NOT NULL CHECK (cefr_level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
    part_of_speech TEXT NOT NULL,
    ipa TEXT,
    audio_url TEXT,
    frequency_rank INTEGER,
    thematic_cluster TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_word_category_level UNIQUE(word, category, cefr_level)
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
    target_word TEXT NOT NULL,
    target_definition_es TEXT,
    relation_type TEXT NOT NULL CHECK (relation_type IN ('synonym', 'antonym', 'related')),
    strength NUMERIC DEFAULT 1.0,
    thematic_topic TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_relation UNIQUE(source_sense_id, target_word, relation_type)
);

-- Índices de Alta Eficiencia
CREATE INDEX IF NOT EXISTS idx_vocab_words_cat_level ON public.vocabulary_words(category, cefr_level);
CREATE INDEX IF NOT EXISTS idx_vocab_senses_level ON public.vocabulary_senses(cefr_level_target);
CREATE INDEX IF NOT EXISTS idx_vocab_senses_word ON public.vocabulary_senses(word_id);
CREATE INDEX IF NOT EXISTS idx_vocab_relations_src ON public.vocabulary_relations(source_sense_id);
