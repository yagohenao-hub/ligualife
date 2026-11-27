import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  CefrLevel,
  VocabCategory,
  VocabularyWordItem,
  getVocabularyByCategory,
  loadVocabularyByCategoryAsync
} from '@/lib/vocabulary';
import { VocabularyLevelSelector } from '@/components/vocabulary/VocabularyLevelSelector';
import { VocabularySwiper } from '@/components/vocabulary/VocabularySwiper';
import { VocabularyGridManager } from '@/components/vocabulary/VocabularyGridManager';
import { VocabularyTrivia } from '@/components/vocabulary/VocabularyTrivia';
import { SpeedLinker } from '@/components/vocabulary/SpeedLinker';
import { VocabResumenModal } from '@/components/vocabulary/VocabResumenModal';
import { VocabRepasoModal } from '@/components/vocabulary/VocabRepasoModal';
import { VocabReadingModal } from '@/components/vocabulary/VocabReadingModal';
import { LinguaLifeLogo } from '@/components/LinguaLifeLogo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { BookOpen, Zap, Flame, Volume2, Layers, Link2 } from 'lucide-react';
import styles from '@/styles/Vocabulary.module.css';

interface CategoryConfig {
  id: VocabCategory;
  title: string;
  badge: string;
  description: string;
}

const CATEGORIES: CategoryConfig[] = [
  {
    id: 'time_words',
    title: '⏱️ Palabras del Tiempo (13)',
    badge: '13 Modales & Auxiliares',
    description: 'Auxiliares y modales esenciales (can, could, will, would, should, must, might, may, do, did, be, have, shall).'
  },
  {
    id: 'prepositions_in_on_at',
    title: '📍 In / On / At',
    badge: 'Preposiciones Clave',
    description: 'Espacio (superficie vs interior), tiempo exacto (horas, días, meses) y Preposition Stranding.'
  },
  {
    id: 'wh_words',
    title: '❓ Preguntas WH',
    badge: 'Preguntas & Conectores',
    description: 'Palabras WH (where, what, who, when, why, how, which) para preguntar o conectar frases.'
  },
  {
    id: 'logical_connectors',
    title: '🔗 Conectores Lógicos',
    badge: 'Discurso & Fluidez',
    description: 'Conectores de contraste, causa-efecto, adición, secuencia y transiciones conversacionales nativas.'
  },
  {
    id: 'phrasal_verbs',
    title: '🚀 Phrasal Verbs',
    badge: 'Verbos Frasales Esenciales',
    description: 'Los verbos frasales más usados en trabajo, reuniones y conversación real (con múltiples acepciones y opuestos).'
  },
  {
    id: 'cefr_general',
    title: '🌐 Vocabulario CEFR',
    badge: 'Banco Completo A1 – C2',
    description: 'Listas completas oficiales MCER (A1 a C2) con definiciones, IPA, ejemplos bilingües y red de sinónimos/antónimos.'
  }
];

export default function VocabularyHubPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<VocabCategory>('time_words');
  const [selectedLevel, setSelectedLevel] = useState<CefrLevel>('A1');

  // Vista unificada: Explorar (Cuadrícula/Tarjetas), Trivia Infinita (escala por racha), o Conector Semántico
  const [activeView, setActiveView] = useState<'explore' | 'trivia' | 'linker'>('explore');
  const [exploreLayout, setExploreLayout] = useState<'grid' | 'swiper'>('grid');

  const [words, setWords] = useState<VocabularyWordItem[]>(() =>
    getVocabularyByCategory('time_words', 'A1')
  );
  const [loading, setLoading] = useState(false);

  // Estados de Modales de Repaso / Resumen / Lectura
  const [showResumenModal, setShowResumenModal] = useState(false);
  const [showRepasoModal, setShowRepasoModal] = useState(false);
  const [showReadingModal, setShowReadingModal] = useState(false);

  // Deep-link desde /student (?mode=resumen|repaso|trivia|reading)
  useEffect(() => {
    if (!router.isReady) return;
    const mode = router.query.mode;
    if (mode === 'resumen') setShowResumenModal(true);
    else if (mode === 'repaso') setShowRepasoModal(true);
    else if (mode === 'trivia') setActiveView('trivia');
    else if (mode === 'reading') setShowReadingModal(true);
  }, [router.isReady, router.query.mode]);

  const loadWords = useCallback(async () => {
    setLoading(true);
    const immediate = getVocabularyByCategory(activeCategory, selectedLevel);
    if (immediate.length > 0) setWords(immediate);

    try {
      const fullBank = await loadVocabularyByCategoryAsync(activeCategory, selectedLevel);
      setWords(fullBank);
    } catch (err) {
      console.warn('Error cargando banco de vocabulario:', err);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, selectedLevel]);

  useEffect(() => {
    loadWords();
  }, [loadWords]);

  const currentCategoryConfig = CATEGORIES.find(c => c.id === activeCategory) || CATEGORIES[0];

  return (
    <>
      <Head>
        <title>Vocabulario Conceptual &amp; Red Semántica | LinguaLife</title>
        <meta
          name="description"
          content="Practica Palabras del Tiempo, In/On/At, WH-Words, Conectores Lógicos, Phrasal Verbs y Vocabulario CEFR A1-C2 completo."
        />
      </Head>

      <div className={styles.container}>
        {/* ── BARRA SUPERIOR DE MARCA ── */}
        <header className={styles.topBrandBar}>
          <div className={styles.topLeftGroup}>
            <Link href="/student" style={{ textDecoration: 'none' }}>
              <LinguaLifeLogo size="sm" />
            </Link>
            <Link href="/student" className={styles.backLink}>
              ← Portal del Alumno
            </Link>
          </div>

          <div className={styles.topRightGroup}>
            <span
              style={{
                fontSize: '0.78rem',
                color: 'var(--accent-green, #34D399)',
                background: 'rgba(52, 211, 153, 0.12)',
                padding: '0.35rem 0.8rem',
                borderRadius: '999px',
                fontWeight: 800,
                border: '1px solid rgba(52, 211, 153, 0.3)'
              }}
            >
              ✨ Banco Semántico Activo
            </span>
            <ThemeToggle />
          </div>
        </header>

        {/* ── ENCABEZADO COMPACTO ── */}
        <div style={{ marginBottom: '1rem' }}>
          <h1
            style={{
              fontSize: 'clamp(1.45rem, 3vw, 1.95rem)',
              fontWeight: 900,
              margin: '0 0 0.25rem 0',
              letterSpacing: '-0.025em',
              fontFamily: 'var(--font-display)',
              color: 'var(--text-primary)'
            }}
          >
            Gimnasio de Vocabulario
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem', lineHeight: 1.45 }}>
            Elige un banco temático o nivel CEFR y entrena directamente; la dificultad escala automáticamente según tu racha.
          </p>
        </div>

        {/* ── ETAPA ÚNICA DE CONTEXTO: CATEGORÍA + NIVEL + RESUMEN RÁPIDO ── */}
        <section className={styles.contextCard} aria-label="Selección de categoría">
          <div className={styles.contextTopRow}>
            <div className={styles.categoryPillsContainer}>
              {CATEGORIES.map(cat => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`${styles.categoryPill} ${isActive ? styles.categoryPillActive : ''}`}
                  >
                    <span>{cat.title}</span>
                  </button>
                );
              })}
            </div>

            <div className={styles.contextMetaGroup}>
              <span className={styles.wordCountBadge}>
                {loading ? 'Cargando banco...' : `${words.length} términos`}
              </span>
              <button
                type="button"
                className={styles.resumenPillBtn}
                onClick={() => setShowResumenModal(true)}
                title="Abrir fichas conceptuales, acepciones, IPA y ejemplos"
              >
                <BookOpen size={14} />
                <span>Ficha Resumen</span>
              </button>
            </div>
          </div>

          <div className={styles.contextDescRow}>
            <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
              <span className={styles.contextBadge}>{currentCategoryConfig.badge}</span>
              {currentCategoryConfig.description}
            </p>
          </div>

          {activeCategory === 'cefr_general' && (
            <VocabularyLevelSelector
              selectedLevel={selectedLevel}
              onSelectLevel={setSelectedLevel}
              wordCount={words.length}
            />
          )}
        </section>

        {/* ── FILA ÚNICA UNIFICADA DE 5 MODOS DE PRÁCTICA ── */}
        <nav className={styles.modeStrip} aria-label="Modos de práctica">
          <button
            type="button"
            className={`${styles.modeBtn} ${activeView === 'explore' ? styles.modeBtnActive : ''}`}
            onClick={() => setActiveView('explore')}
          >
            <span
              className={styles.modeBtnIcon}
              style={{ background: 'rgba(26, 193, 231, 0.16)', color: 'var(--brand-cyan, #1AC1E7)' }}
            >
              <Layers size={18} />
            </span>
            <span>
              <span className={styles.modeBtnTitle}>Explorar Banco</span>
              <span className={styles.modeBtnSub}>Cuadrícula &amp; Tarjetas</span>
            </span>
          </button>

          <button
            type="button"
            className={styles.modeBtn}
            onClick={() => setShowRepasoModal(true)}
          >
            <span
              className={styles.modeBtnIcon}
              style={{ background: 'rgba(253, 186, 59, 0.18)', color: 'var(--brand-yellow, #FDBA3B)' }}
            >
              <Zap size={18} />
            </span>
            <span>
              <span className={styles.modeBtnTitle}>Repaso (15)</span>
              <span className={styles.modeBtnSub}>Gimnasio Mental</span>
            </span>
          </button>

          <button
            type="button"
            className={`${styles.modeBtn} ${activeView === 'trivia' ? styles.modeBtnActive : ''}`}
            onClick={() => setActiveView('trivia')}
          >
            <span
              className={styles.modeBtnIcon}
              style={{ background: 'rgba(255, 80, 118, 0.16)', color: 'var(--brand-pink, #FF5076)' }}
            >
              <Flame size={18} />
            </span>
            <span>
              <span className={styles.modeBtnTitle}>Trivia Infinita</span>
              <span className={styles.modeBtnSub}>Escala por racha</span>
            </span>
          </button>

          <button
            type="button"
            className={styles.modeBtn}
            onClick={() => setShowReadingModal(true)}
          >
            <span
              className={styles.modeBtnIcon}
              style={{ background: 'rgba(52, 211, 153, 0.16)', color: 'var(--accent-green, #34D399)' }}
            >
              <Volume2 size={18} />
            </span>
            <span>
              <span className={styles.modeBtnTitle}>Lectura + Audio</span>
              <span className={styles.modeBtnSub}>Short Reading nativo</span>
            </span>
          </button>

          <button
            type="button"
            className={`${styles.modeBtn} ${activeView === 'linker' ? styles.modeBtnActive : ''}`}
            onClick={() => setActiveView('linker')}
          >
            <span
              className={styles.modeBtnIcon}
              style={{ background: 'rgba(140, 49, 197, 0.16)', color: 'var(--brand-purple, #8C31C5)' }}
            >
              <Link2 size={18} />
            </span>
            <span>
              <span className={styles.modeBtnTitle}>Conector</span>
              <span className={styles.modeBtnSub}>Sinónimos / Antónimos</span>
            </span>
          </button>
        </nav>

        {/* ── ÁREA DE PRÁCTICA ACTIVA ── */}
        {activeView === 'explore' && (
          <div>
            <div className={styles.subViewBar}>
              <div className={styles.subViewSegmented} role="group" aria-label="Vista de exploración">
                <button
                  type="button"
                  onClick={() => setExploreLayout('grid')}
                  className={`${styles.subViewSegBtn} ${exploreLayout === 'grid' ? styles.subViewSegBtnActive : ''}`}
                >
                  ⊞ Vista Cuadrícula
                </button>
                <button
                  type="button"
                  onClick={() => setExploreLayout('swiper')}
                  className={`${styles.subViewSegBtn} ${exploreLayout === 'swiper' ? styles.subViewSegBtnActive : ''}`}
                >
                  🃏 Tarjetas Interactivas
                </button>
              </div>

              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {exploreLayout === 'grid'
                  ? 'Busca palabras, escucha pronunciación nativa y explora todas sus acepciones.'
                  : 'Estudia tarjeta por tarjeta con audio nativo y ejemplos reales.'}
              </span>
            </div>

            {exploreLayout === 'grid' ? (
              <VocabularyGridManager words={words} />
            ) : (
              <VocabularySwiper words={words} />
            )}
          </div>
        )}

        {activeView === 'trivia' && (
          <VocabularyTrivia
            words={words}
            category={activeCategory}
            level={selectedLevel}
          />
        )}

        {activeView === 'linker' && (
          <SpeedLinker
            words={words}
            category={activeCategory}
            level={selectedLevel}
          />
        )}

        {/* ── MODALES COMPLEMENTARIOS ── */}
        <VocabResumenModal
          isOpen={showResumenModal}
          onClose={() => {
            setShowResumenModal(false);
            if (router.query.mode) router.replace('/student/vocabulary', undefined, { shallow: true });
          }}
          category={activeCategory}
          categoryTitle={currentCategoryConfig.title}
          words={words}
        />

        <VocabRepasoModal
          isOpen={showRepasoModal}
          onClose={() => {
            setShowRepasoModal(false);
            if (router.query.mode) router.replace('/student/vocabulary', undefined, { shallow: true });
          }}
          category={activeCategory}
          categoryTitle={currentCategoryConfig.title}
          level={selectedLevel}
          words={words}
        />

        <VocabReadingModal
          isOpen={showReadingModal}
          onClose={() => {
            setShowReadingModal(false);
            if (router.query.mode) router.replace('/student/vocabulary', undefined, { shallow: true });
          }}
          category={activeCategory}
          categoryTitle={currentCategoryConfig.title}
          level={selectedLevel}
        />
      </div>
    </>
  );
}
