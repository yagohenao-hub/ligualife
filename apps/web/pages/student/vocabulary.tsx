import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  CefrLevel, 
  VocabCategory, 
  VocabularyWordItem, 
  TriageStatus,
  getVocabularyByCategory 
} from '@/lib/vocabulary';
import { VocabularyLevelSelector } from '@/components/vocabulary/VocabularyLevelSelector';
import { VocabularySwiper } from '@/components/vocabulary/VocabularySwiper';
import { VocabularyGridManager } from '@/components/vocabulary/VocabularyGridManager';
import { VocabularyTrivia } from '@/components/vocabulary/VocabularyTrivia';
import { SpeedLinker } from '@/components/vocabulary/SpeedLinker';
import { VocabResumenModal } from '@/components/vocabulary/VocabResumenModal';
import { VocabRepasoModal } from '@/components/vocabulary/VocabRepasoModal';
import { VocabReadingModal } from '@/components/vocabulary/VocabReadingModal';
import { BookOpen, Zap, Flame, Volume2, Sparkles, Layers } from 'lucide-react';
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
    title: '⏱️ Palabras del Tiempo (12)',
    badge: '12-13 Modales & Auxiliares',
    description: 'Auxiliares y verbos modales clave (can, could, will, would, should, must, do, did, be, have) con sus funciones básicas y reglas de tiempo.'
  },
  {
    id: 'prepositions_in_on_at',
    title: '📍 In / On / At',
    badge: 'Preposiciones Clave',
    description: 'Uso espacial (superficies vs contenedores), temporal (horas, días, meses) y la regla comunicativa de Preposition Stranding.'
  },
  {
    id: 'wh_words',
    title: '❓ Preguntas WH',
    badge: 'Preguntas & Conectores',
    description: 'Palabras interrogativas directas (where, what, who, when, why, how, which) y su uso como conectores afirmativos sin invertir auxiliar.'
  },
  {
    id: 'cefr_general',
    title: '🌐 Vocabulario CEFR',
    badge: 'Niveles A1 a C2',
    description: 'Modelo en espiral polisémico: palabras cotidianas con al menos 2 acepciones, sinónimos, antónimos y red conceptual.'
  }
];

export default function VocabularyHubPage() {
  const [activeCategory, setActiveCategory] = useState<VocabCategory>('time_words');
  const [selectedLevel, setSelectedLevel] = useState<CefrLevel>('A1');
  const [includePreviousPending, setIncludePreviousPending] = useState(false);
  const [activeTab, setActiveTab] = useState<'grid' | 'swiper' | 'trivia' | 'linker'>('grid');
  const [words, setWords] = useState<VocabularyWordItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Student profile (para persistencia en Supabase)
  const [studentId, setStudentId] = useState<string>('');

  // Estados de Modales de los 4 Botones
  const [showResumenModal, setShowResumenModal] = useState(false);
  const [showRepasoModal, setShowRepasoModal] = useState(false);
  const [showReadingModal, setShowReadingModal] = useState(false);

  // Detectar perfil de estudiante activo en localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('ll_student_profile');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.id) setStudentId(parsed.id);
      }
    } catch {}
  }, []);

  // Cargar palabras por categoría (con fallback local instantáneo y fetch a Supabase)
  const loadWords = useCallback(async () => {
    setLoading(true);
    // 1. Carga inmediata reactiva desde el catálogo maestro
    const initialList = getVocabularyByCategory(activeCategory, selectedLevel, includePreviousPending);
    setWords(initialList);

    // 2. Sincronización asíncrona con el backend si hay studentId
    if (studentId) {
      try {
        const res = await fetch(`/api/student/vocabulary?category=${activeCategory}&level=${selectedLevel}&studentId=${studentId}&includePreviousPending=${includePreviousPending}`);
        const data = await res.json();
        if (data.success && data.words) {
          setWords(data.words);
        }
      } catch (err) {
        console.warn('API sync warning:', err);
      }
    }
    setLoading(false);
  }, [activeCategory, selectedLevel, includePreviousPending, studentId]);

  useEffect(() => {
    loadWords();
  }, [loadWords]);

  // Manejo de cambio de estado de una palabra (persiste a Supabase y actualiza UI)
  const handleWordStatusChanged = async (wordId: string, newStatus: TriageStatus) => {
    // 1. Actualizar estado local reactivo
    setWords(prev => prev.map(w => {
      if (w.id === wordId) return { ...w, triageStatus: newStatus };
      return w;
    }));

    // 2. Persistir en la API / Supabase
    const targetWord = words.find(w => w.id === wordId);
    const primarySense = targetWord?.senses[0];
    if (primarySense && studentId) {
      try {
        await fetch('/api/student/vocabulary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId,
            wordId,
            senseId: primarySense.id,
            status: newStatus
          })
        });
      } catch (err) {
        console.error('Error persisting status to Supabase:', err);
      }
    }
  };

  const currentCategoryConfig = CATEGORIES.find(c => c.id === activeCategory) || CATEGORIES[0];

  return (
    <>
      <Head>
        <title>Vocabulario Curado & Red Semántica | LinguaLife</title>
        <meta name="description" content="Estudio de vocabulario con Palabras del Tiempo, Preposiciones In/On/At, WH-Words y CEFR general con los 4 botones de maestría." />
      </Head>

      <div className={styles.container}>
        {/* Top Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <Link href="/student" style={{ color: '#a1a1aa', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            ← Portal de Alumno
          </Link>
          <span style={{ fontSize: '0.8rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.12)', padding: '0.3rem 0.8rem', borderRadius: '999px', fontWeight: 700, border: '1px solid rgba(16, 185, 129, 0.25)' }}>
            ✨ Vocabulario LinguaLife Activo
          </span>
        </div>

        {/* Title */}
        <div style={{ marginBottom: '1.25rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: '0 0 0.4rem 0', letterSpacing: '-0.02em' }}>
            Vocabulario Conceptual & Red Semántica
          </h1>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem', maxWidth: '680px', lineHeight: 1.5 }}>
            Selecciona la categoría de estudio, domina las palabras con los <strong>4 modos de estudio</strong> y gestiona tu inventario con botones interactivos.
          </p>
        </div>

        {/* ── 1. SELECTOR SUPERIOR DE CATEGORÍAS ── */}
        <div className={styles.categoryPillsContainer}>
          {CATEGORIES.map(cat => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`${styles.categoryPill} ${isActive ? styles.categoryPillActive : ''}`}
              >
                <span>{cat.title}</span>
              </button>
            );
          })}
        </div>

        {/* Category Description Banner */}
        <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '0.85rem 1.15rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {currentCategoryConfig.badge}
            </span>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.4 }}>
              {currentCategoryConfig.description}
            </p>
          </div>
          <span style={{ fontSize: '0.82rem', color: '#94a3b8', background: 'rgba(0,0,0,0.3)', padding: '0.3rem 0.65rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', fontWeight: 700 }}>
            {words.length} Palabras en banco
          </span>
        </div>

        {/* Si la categoría es CEFR General, mostrar el selector de niveles A1 - C2 */}
        {activeCategory === 'cefr_general' && (
          <div style={{ marginBottom: '1.25rem' }}>
            <VocabularyLevelSelector
              selectedLevel={selectedLevel}
              onSelectLevel={setSelectedLevel}
              includePreviousPending={includePreviousPending}
              onTogglePreviousPending={setIncludePreviousPending}
            />
          </div>
        )}

        {/* ── 2. LOS 4 BOTONES DE ESTUDIO (RESUMEN, REPASO, TRIVIA, LECTURA) ── */}
        <div style={{ marginBottom: '0.65rem' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Modalidades de Estudio para esta Categoría:
          </span>
        </div>

        <div className={styles.studyActionsGrid}>
          {/* Botón 1: Resumen */}
          <button
            type="button"
            className={`${styles.studyActionBtn} ${styles.btnResumenTheme}`}
            onClick={() => setShowResumenModal(true)}
            title="Ver fichas conceptuales con acepciones, fórmulas, IPA y ejemplos"
          >
            <BookOpen size={22} color="#60a5fa" />
            <span style={{ fontWeight: 800, fontSize: '0.92rem' }}>1. Resumen</span>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Ficha & Acepciones</span>
          </button>

          {/* Botón 2: Repaso */}
          <button
            type="button"
            className={`${styles.studyActionBtn} ${styles.btnRepasoTheme}`}
            onClick={() => setShowRepasoModal(true)}
            title="Sesión de gimnasio mental con 15 ejercicios intensivos"
          >
            <Zap size={22} color="#facc15" />
            <span style={{ fontWeight: 800, fontSize: '0.92rem' }}>2. Repaso</span>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Gimnasio Mental 15</span>
          </button>

          {/* Botón 3: Trivia */}
          <button
            type="button"
            className={`${styles.studyActionBtn} ${styles.btnTriviaTheme}`}
            onClick={() => setActiveTab('trivia')}
            title="Entrenar con trivia gamificada de opción múltiple"
          >
            <Flame size={22} color="#fb923c" />
            <span style={{ fontWeight: 800, fontSize: '0.92rem' }}>3. Trivia</span>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Juego Gamificado</span>
          </button>

          {/* Botón 4: Lectura (Short Reading) */}
          <button
            type="button"
            className={`${styles.studyActionBtn} ${styles.btnReadingTheme}`}
            onClick={() => setShowReadingModal(true)}
            title="Micro-lectura contextual con audio nativo y pregunta de comprensión"
          >
            <Volume2 size={22} color="#34d399" />
            <span style={{ fontWeight: 800, fontSize: '0.92rem' }}>4. Lectura</span>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Short Reading + Audio</span>
          </button>
        </div>

        {/* ── 3. NAVEGACIÓN DE VISTAS (INVENTARIO DE BOTONES, SWIPER, TRIVIA, CONECTOR) ── */}
        <div className={styles.tabNav}>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'grid' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('grid')}
          >
            <span style={{ fontSize: '1.15rem' }}>🔲</span>
            <span>Mi Inventario (Botones)</span>
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'swiper' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('swiper')}
          >
            <span style={{ fontSize: '1.15rem' }}>📋</span>
            <span>Clasificar (Swiper)</span>
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'trivia' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('trivia')}
          >
            <span style={{ fontSize: '1.15rem' }}>🎯</span>
            <span>Trivia Activa</span>
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'linker' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('linker')}
          >
            <span style={{ fontSize: '1.15rem' }}>⚡</span>
            <span>Conector Semántico</span>
          </button>
        </div>

        {/* ── 4. CONTENIDO DE LA PESTAÑA ACTIVA ── */}
        {activeTab === 'grid' && (
          <div>
            <div style={{ marginBottom: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.82rem', color: '#a1a1aa' }}>
                Haz clic sobre cualquier palabra para ciclar su estado: <strong>Por aprender</strong> → <strong>Pasiva</strong> → <strong>Dominada</strong>.
              </span>
            </div>
            <VocabularyGridManager
              words={words}
              onStatusChanged={handleWordStatusChanged}
            />
          </div>
        )}

        {activeTab === 'swiper' && (
          <VocabularySwiper
            words={words}
            onWordClassified={loadWords}
          />
        )}

        {activeTab === 'trivia' && (
          <VocabularyTrivia 
            words={words} 
            category={activeCategory}
          />
        )}

        {activeTab === 'linker' && (
          <SpeedLinker words={words} />
        )}

        {/* ── 5. MODALES DE LOS 4 MODOS DE ESTUDIO ── */}
        <VocabResumenModal
          isOpen={showResumenModal}
          onClose={() => setShowResumenModal(false)}
          category={activeCategory}
          categoryTitle={currentCategoryConfig.title}
          words={words}
        />

        <VocabRepasoModal
          isOpen={showRepasoModal}
          onClose={() => setShowRepasoModal(false)}
          category={activeCategory}
          categoryTitle={currentCategoryConfig.title}
        />

        <VocabReadingModal
          isOpen={showReadingModal}
          onClose={() => setShowReadingModal(false)}
          category={activeCategory}
          categoryTitle={currentCategoryConfig.title}
        />
      </div>
    </>
  );
}
