import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Flame,
  Trophy,
  Star,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Check,
  Volume2,
  VolumeX,
  Zap,
  History
} from 'lucide-react';
import { VocabularyWordItem, VocabCategory, CefrLevel } from '@/lib/vocabulary';
import {
  TriviaQuestion,
  TriviaDifficulty,
  AnsweredTriviaQuestion,
  getSeedQuestionsForVocabulary
} from '@/lib/trivia-seed';
import { soundEngine } from '@/lib/sound-effects';
import styles from '@/styles/Vocabulary.module.css';

interface Props {
  words: VocabularyWordItem[];
  category?: VocabCategory;
  level?: CefrLevel;
}

const normalizeKey = (q?: string | null): string =>
  (q || '').trim().toLowerCase().replace(/\s+/g, ' ');

export const VocabularyTrivia: React.FC<Props> = ({
  words,
  category = 'time_words',
  level = 'A1'
}) => {
  const [queue, setQueue] = useState<TriviaQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<TriviaQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [masteredCount, setMasteredCount] = useState(0);
  const [history, setHistory] = useState<AnsweredTriviaQuestion[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [milestoneNotice, setMilestoneNotice] = useState<string | null>(null);
  const [isMusicOn, setIsMusicOn] = useState(false);

  // Refs sincronizados para garantizar un loop infinito sin cierres obsoletos (stale closures)
  const queueRef = useRef<TriviaQuestion[]>([]);
  const currentQuestionRef = useRef<TriviaQuestion | null>(null);
  const seenQuestionsRef = useRef<Set<string>>(new Set());
  const recentContextsRef = useRef<string[]>([]);
  const isRefillingRef = useRef<boolean>(false);
  const lastRefillAttemptRef = useRef<number>(0);
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const storageKeySuffix = `vocab_${category}_${level}`;

  const syncQueue = useCallback((newQueue: TriviaQuestion[]) => {
    queueRef.current = newQueue;
    setQueue(newQueue);
  }, []);

  const syncCurrentQuestion = useCallback((q: TriviaQuestion | null) => {
    currentQuestionRef.current = q;
    if (q?.question) {
      const k = normalizeKey(q.question);
      seenQuestionsRef.current.add(k);
      recentContextsRef.current = [...recentContextsRef.current.slice(-18), q.question];
    }
    setCurrentQuestion(q);
  }, []);

  const clearAutoAdvanceTimer = useCallback(() => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearAutoAdvanceTimer();
      soundEngine.stopAmbientLoop();
    };
  }, [clearAutoAdvanceTimer]);

  const buildFullVocabPool = useCallback((): TriviaQuestion[] => {
    const baseSeeds = getSeedQuestionsForVocabulary(category, level, words);
    let cachedAi: TriviaQuestion[] = [];
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(`ll_trivia_ai_pool_v2_${storageKeySuffix}`);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) cachedAi = parsed;
        }
      } catch {}
    }

    const combined = [...cachedAi, ...baseSeeds];
    const unique: TriviaQuestion[] = [];
    const seen = new Set<string>();
    for (const item of combined) {
      if (!item || !item.question || !Array.isArray(item.options) || item.options.length < 2) continue;
      const k = normalizeKey(item.question);
      if (!seen.has(k)) {
        seen.add(k);
        unique.push(item);
      }
    }
    return unique;
  }, [category, level, words, storageKeySuffix]);

  // Inicializar cola de preguntas al cambiar de categoría o nivel
  useEffect(() => {
    clearAutoAdvanceTimer();
    try {
      const savedBest = localStorage.getItem(`ll_trivia_best_guest_${storageKeySuffix}`);
      setBestStreak(savedBest ? parseInt(savedBest, 10) : 0);
      const savedMastered = localStorage.getItem(`ll_trivia_mastered_guest_${storageKeySuffix}`);
      setMasteredCount(savedMastered ? parseInt(savedMastered, 10) : 0);
    } catch {}

    seenQuestionsRef.current.clear();
    recentContextsRef.current = [];
    lastRefillAttemptRef.current = 0;

    const pool = buildFullVocabPool();
    if (pool.length > 0) {
      syncCurrentQuestion(pool[0]);
      syncQueue(pool.slice(1));
    }

    setStreak(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setHistory([]);
    setShowHistory(false);
    setMilestoneNotice(null);
  }, [category, level, words, storageKeySuffix, buildFullVocabPool, syncCurrentQuestion, syncQueue, clearAutoAdvanceTimer]);

  // Recarga de preguntas con IA en segundo plano
  const refillQuestions = useCallback(async () => {
    if (isRefillingRef.current) return;
    const now = Date.now();
    if (now - lastRefillAttemptRef.current < 6000) return;

    isRefillingRef.current = true;
    lastRefillAttemptRef.current = now;

    try {
      const difficultyLevel: TriviaDifficulty =
        masteredCount >= 8 || streak >= 7
          ? 'advanced'
          : masteredCount >= 4 || streak >= 3
          ? 'intermediate'
          : 'basic';

      const res = await fetch('/api/student/trivia-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contextType: 'vocabulary',
          vocabCategory: category,
          cefrLevel: level,
          topicOrder: 100,
          topicName: `Vocabulario ${category} (${level})`,
          difficultyLevel,
          excludeContexts: recentContextsRef.current.slice(-15)
        })
      });

      const data = await res.json();
      if (data.ok && Array.isArray(data.questions) && data.questions.length > 0) {
        const currentKey = normalizeKey(currentQuestionRef.current?.question);
        const existingKeys = new Set(queueRef.current.map(q => normalizeKey(q.question)));

        const fresh: TriviaQuestion[] = data.questions.filter((q: TriviaQuestion) => {
          const k = normalizeKey(q?.question);
          return k && k !== currentKey && !existingKeys.has(k);
        });

        if (fresh.length > 0) {
          const updated = [...queueRef.current, ...fresh];
          syncQueue(updated);

          if (typeof window !== 'undefined' && data.source === 'ai') {
            try {
              const cacheKey = `ll_trivia_ai_pool_v2_${storageKeySuffix}`;
              const prevRaw = localStorage.getItem(cacheKey);
              const prevList: TriviaQuestion[] = prevRaw ? JSON.parse(prevRaw) : [];
              const merged = [...fresh, ...prevList];
              const deduped: TriviaQuestion[] = [];
              const seen = new Set<string>();
              for (const item of merged) {
                const k = normalizeKey(item.question);
                if (!seen.has(k)) {
                  seen.add(k);
                  deduped.push(item);
                }
              }
              localStorage.setItem(cacheKey, JSON.stringify(deduped.slice(0, 40)));
            } catch {}
          }
        }
      }
    } catch {
      // Fallo silencioso, el sintetizador local mantiene el loop infinito activo
    } finally {
      isRefillingRef.current = false;
    }
  }, [category, level, masteredCount, streak, storageKeySuffix, syncQueue]);

  useEffect(() => {
    if (queue.length < 5 && !isRefillingRef.current) {
      refillQuestions();
    }
  }, [queue.length, refillQuestions]);

  const getGuaranteedDifferentQuestion = useCallback(
    (avoidQuestionText?: string | null): TriviaQuestion | null => {
      const avoidKey = normalizeKey(avoidQuestionText);
      const fullPool = buildFullVocabPool();
      if (fullPool.length === 0) return null;

      const unseenDifferent = fullPool.filter(q => {
        const k = normalizeKey(q.question);
        return k !== avoidKey && !seenQuestionsRef.current.has(k);
      });

      if (unseenDifferent.length > 0) {
        return {
          ...unseenDifferent[0],
          id: `${unseenDifferent[0].id}-fresh-${Date.now()}`
        };
      }

      seenQuestionsRef.current.clear();
      if (avoidKey) seenQuestionsRef.current.add(avoidKey);

      const diffPool = fullPool.filter(q => normalizeKey(q.question) !== avoidKey);
      const candidates = diffPool.length > 0 ? diffPool : fullPool;
      const idx = Math.floor(Math.random() * candidates.length);
      return {
        ...candidates[idx],
        id: `${candidates[idx].id}-cycle-${Date.now()}-${idx}`
      };
    },
    [buildFullVocabPool]
  );

  const handleNext = useCallback(() => {
    clearAutoAdvanceTimer();

    const currentKey = normalizeKey(currentQuestionRef.current?.question);
    const workingQueue = [...queueRef.current];
    let nextQ: TriviaQuestion | null = null;

    const unseenIdx = workingQueue.findIndex(q => {
      const k = normalizeKey(q.question);
      return k !== currentKey && !seenQuestionsRef.current.has(k);
    });

    if (unseenIdx !== -1) {
      nextQ = workingQueue[unseenIdx];
      workingQueue.splice(unseenIdx, 1);
    } else {
      const nonDupIdx = workingQueue.findIndex(q => normalizeKey(q.question) !== currentKey);
      if (nonDupIdx !== -1) {
        nextQ = workingQueue[nonDupIdx];
        workingQueue.splice(nonDupIdx, 1);
      } else {
        workingQueue.length = 0;
        nextQ = getGuaranteedDifferentQuestion(currentQuestionRef.current?.question);
      }
    }

    if (!nextQ) {
      nextQ = getGuaranteedDifferentQuestion(currentQuestionRef.current?.question);
    }

    if (workingQueue.length < 3) {
      const pool = buildFullVocabPool();
      const nextKey = normalizeKey(nextQ?.question);
      const refillCandidates = pool.filter(p => {
        const pk = normalizeKey(p.question);
        return (
          pk !== currentKey &&
          pk !== nextKey &&
          !seenQuestionsRef.current.has(pk) &&
          !workingQueue.some(wq => normalizeKey(wq.question) === pk)
        );
      });
      workingQueue.push(...refillCandidates.slice(0, 6));
    }

    if (nextQ) {
      syncCurrentQuestion(nextQ);
      syncQueue(workingQueue);
    }

    setSelectedOption(null);
    setIsAnswered(false);
    setMilestoneNotice(null);

    if (workingQueue.length < 5 && !isRefillingRef.current) {
      refillQuestions();
    }
  }, [
    clearAutoAdvanceTimer,
    getGuaranteedDifferentQuestion,
    buildFullVocabPool,
    syncCurrentQuestion,
    syncQueue,
    refillQuestions
  ]);

  const handleSelectOption = useCallback(
    (index: number) => {
      const activeQ = currentQuestionRef.current;
      if (isAnswered || !activeQ) return;

      clearAutoAdvanceTimer();
      setSelectedOption(index);
      setIsAnswered(true);

      const isCorrect = index === activeQ.correctIndex;

      if (isCorrect) {
        soundEngine.playRewardChime();
        const nextStreak = streak + 1;
        setStreak(nextStreak);

        if (nextStreak > bestStreak) {
          setBestStreak(nextStreak);
          try {
            localStorage.setItem(`ll_trivia_best_guest_${storageKeySuffix}`, String(nextStreak));
          } catch {}
        }

        const isMilestone =
          [5, 10, 15, 20, 25].includes(nextStreak) ||
          (nextStreak > 25 && nextStreak % 5 === 0);
        if (isMilestone) {
          soundEngine.playMilestoneFanfare();
          const tierLabels: Record<number, string> = {
            5: 'Bronce 🥉',
            10: 'Plata 🥈',
            15: 'Oro 🏆',
            20: 'Diamante 💎',
            25: 'Platino 👑'
          };
          setMilestoneNotice(
            `¡Racha de ${nextStreak}! Alcanzaste el rango ${tierLabels[nextStreak] || 'Maestro 🔥'} en este módulo.`
          );
        }

        setMasteredCount(prev => {
          const next = prev + 1;
          try {
            localStorage.setItem(`ll_trivia_mastered_guest_${storageKeySuffix}`, String(next));
          } catch {}
          return next;
        });

        autoAdvanceTimerRef.current = setTimeout(() => {
          handleNext();
        }, 950);
      } else {
        setStreak(0);
        setMilestoneNotice(null);

        const working = [...queueRef.current];
        const activeKey = normalizeKey(activeQ.question);
        if (working.filter(q => normalizeKey(q.question) !== activeKey).length < 2) {
          const filler = getGuaranteedDifferentQuestion(activeQ.question);
          if (filler) working.unshift(filler);
        }
        const retryClone: TriviaQuestion = {
          ...activeQ,
          id: `${activeQ.id}-retry-${Date.now()}`
        };
        const insertPos = Math.min(3, Math.max(2, working.length));
        working.splice(insertPos, 0, retryClone);
        syncQueue(working);
      }

      const answeredItem: AnsweredTriviaQuestion = {
        ...activeQ,
        selectedIndex: index,
        isCorrect,
        answeredAt: Date.now()
      };
      setHistory(prev => [answeredItem, ...prev].slice(0, 3));
    },
    [
      isAnswered,
      streak,
      bestStreak,
      storageKeySuffix,
      clearAutoAdvanceTimer,
      handleNext,
      getGuaranteedDifferentQuestion,
      syncQueue
    ]
  );

  if (!currentQuestion) {
    return (
      <div style={{ color: '#a1a1aa', textAlign: 'center', padding: '3rem' }}>
        Preparando motor de Trivia Infinita...
      </div>
    );
  }

  const isCurrentCorrect = selectedOption === currentQuestion.correctIndex;
  const activeDifficulty: TriviaDifficulty =
    currentQuestion.difficulty ||
    (masteredCount >= 8 || streak >= 7
      ? 'advanced'
      : masteredCount >= 4 || streak >= 3
      ? 'intermediate'
      : 'basic');

  const diffBadge =
    activeDifficulty === 'advanced'
      ? { label: 'Nivel 3: Master 🔥', color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.14)' }
      : activeDifficulty === 'intermediate'
      ? { label: 'Nivel 2: Ágil ⚡', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.14)' }
      : { label: 'Nivel 1: Base 🌱', color: '#10b981', bg: 'rgba(16, 185, 129, 0.14)' };

  const nextMilestoneTarget = Math.floor(streak / 5) * 5 + 5;
  const progressInTier = ((streak % 5) / 5) * 100;

  return (
    <div className={styles.triviaCard} style={{ position: 'relative' }}>
      {/* Top Metrics & Dopamine Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginBottom: '0.85rem',
          paddingBottom: '0.75rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              padding: '0.25rem 0.65rem',
              borderRadius: '999px',
              color: diffBadge.color,
              background: diffBadge.bg,
              border: `1px solid ${diffBadge.color}40`
            }}
          >
            {diffBadge.label}
          </span>

          {streak >= 2 && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.75rem',
                fontWeight: 800,
                color: '#38bdf8',
                background: 'rgba(56, 189, 248, 0.12)',
                padding: '0.25rem 0.6rem',
                borderRadius: '999px'
              }}
            >
              <Zap size={13} /> Combo x{Math.min(5, Math.floor(streak / 2) + 1)}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', color: '#fbbf24', fontWeight: 800 }}>
            <Flame size={15} /> Racha: {streak}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', color: '#c084fc', fontWeight: 700 }}>
            <Trophy size={14} /> Récord: {bestStreak}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', color: '#34d399', fontWeight: 700 }}>
            <Star size={14} /> Dominio: {masteredCount}
          </span>

          <button
            type="button"
            onClick={() => {
              const playing = soundEngine.toggleMusic();
              setIsMusicOn(playing);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              background: isMusicOn ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: isMusicOn ? '#38bdf8' : '#a1a1aa',
              padding: '0.25rem 0.6rem',
              borderRadius: '8px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {isMusicOn ? <Volume2 size={14} /> : <VolumeX size={14} />}
            <span>{isMusicOn ? 'Música On' : 'Música Off'}</span>
          </button>

          {history.length > 0 && (
            <button
              type="button"
              onClick={() => setShowHistory(prev => !prev)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                background: showHistory ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(168, 85, 247, 0.35)',
                color: '#e9d5ff',
                padding: '0.25rem 0.6rem',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <History size={13} />
              <span>Últimas {history.length}</span>
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar Toward Next Milestone */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '1rem'
        }}
      >
        <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 600, whiteSpace: 'nowrap' }}>
          Próximo rango a los <strong style={{ color: '#fbbf24' }}>{nextMilestoneTarget} aciertos</strong> ({streak % 5}/5)
        </span>
        <div
          style={{
            flex: 1,
            height: '6px',
            background: 'rgba(255, 255, 255, 0.07)',
            borderRadius: '999px',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              width: `${Math.max(8, progressInTier)}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #38bdf8, #a855f7, #fbbf24)',
              borderRadius: '999px',
              transition: 'width 0.35s ease'
            }}
          />
        </div>
      </div>

      {milestoneNotice && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.2), rgba(168, 85, 247, 0.2))',
            border: '1px solid rgba(251, 191, 36, 0.45)',
            color: '#fef3c7',
            padding: '0.6rem 0.9rem',
            borderRadius: '10px',
            marginBottom: '1rem',
            fontSize: '0.85rem',
            fontWeight: 700
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Sparkles size={15} color="#fbbf24" />
            {milestoneNotice}
          </span>
          <button
            type="button"
            onClick={() => setMilestoneNotice(null)}
            style={{ background: 'transparent', border: 'none', color: '#fde68a', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Archetype & Context Tag */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
        <span
          style={{
            fontSize: '0.74rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: '#c084fc',
            background: 'rgba(168, 85, 247, 0.14)',
            padding: '0.25rem 0.65rem',
            borderRadius: '6px',
            fontWeight: 800
          }}
        >
          {currentQuestion.archetype === 'cloze'
            ? 'Completar Contexto (Cloze)'
            : currentQuestion.archetype === 'transform'
            ? 'Contraste Polisémico'
            : currentQuestion.archetype === 'detective'
            ? 'Producción Inversa'
            : currentQuestion.archetype === 'spot_trap'
            ? 'Spot the Trap'
            : 'Situación Comunicativa'}
        </span>

        {currentQuestion.contextScenario && (
          <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>
            {currentQuestion.contextScenario}
          </span>
        )}
      </div>

      {/* Question Prompt */}
      <div className={styles.contextSentence} style={{ marginBottom: '1.15rem' }}>
        {currentQuestion.question}
      </div>

      {/* 4 Options */}
      <div className={styles.optionsGrid}>
        {currentQuestion.options.map((optText, idx) => {
          const letter = ['A', 'B', 'C', 'D'][idx];
          const isSelected = selectedOption === idx;
          const isRightOption = idx === currentQuestion.correctIndex;
          let optClass = styles.optionBtn;

          if (isAnswered) {
            if (isRightOption) optClass += ` ${styles.optionCorrect}`;
            else if (isSelected && !isRightOption) optClass += ` ${styles.optionWrong}`;
          }

          return (
            <button
              key={`${currentQuestion.id}-${idx}`}
              type="button"
              onClick={() => handleSelectOption(idx)}
              className={optClass}
              disabled={isAnswered}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.65rem' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textAlign: 'left' }}>
                <strong
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '24px',
                    height: '24px',
                    borderRadius: '6px',
                    background: 'rgba(255,255,255,0.08)',
                    fontSize: '0.78rem',
                    flexShrink: 0
                  }}
                >
                  {letter}
                </strong>
                <span>{optText}</span>
              </span>
              {isAnswered && isRightOption && <Check size={16} color="#34d399" />}
              {isAnswered && isSelected && !isRightOption && <span>✗</span>}
            </button>
          );
        })}
      </div>

      {/* Instant Feedback */}
      {isAnswered && (
        <div style={{ marginTop: '1.2rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          {isCurrentCorrect ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#34d399',
                fontWeight: 700,
                fontSize: '0.92rem'
              }}
            >
              <CheckCircle2 size={18} />
              <span>¡Excelente! Respuesta correcta. Cargando siguiente reto...</span>
            </div>
          ) : (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.28)',
                borderRadius: '12px',
                padding: '1rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#f87171', fontWeight: 800, fontSize: '0.85rem' }}>
                  <AlertCircle size={16} /> Respuesta Incorrecta
                </span>
                <span style={{ fontSize: '0.85rem', color: '#e2e8f0' }}>
                  Correcta: <strong style={{ color: '#34d399' }}>{currentQuestion.options[currentQuestion.correctIndex]}</strong>
                </span>
              </div>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.88rem', color: '#e2e8f0', lineHeight: 1.5 }}>
                {currentQuestion.explanation}
              </p>
              {currentQuestion.trapExplanation && (
                <p style={{ margin: '0 0 0.9rem 0', fontSize: '0.82rem', color: '#fcd34d' }}>
                  <strong>💡 Clave para recordar:</strong> {currentQuestion.trapExplanation}
                </p>
              )}
              <button
                type="button"
                onClick={handleNext}
                className={styles.tabBtn}
                style={{ width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <span>Continuar al siguiente reto</span>
                <ArrowRight size={15} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Mini Historial de las últimas 3 preguntas */}
      {showHistory && history.length > 0 && (
        <div
          style={{
            marginTop: '1.25rem',
            padding: '1rem',
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            borderRadius: '12px'
          }}
        >
          <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', color: '#e9d5ff' }}>
            Últimas {history.length} preguntas respondidas
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {history.map((h, i) => (
              <div
                key={i}
                style={{
                  padding: '0.65rem',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderLeft: `3px solid ${h.isCorrect ? '#10b981' : '#ef4444'}`
                }}
              >
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.25rem' }}>
                  {h.question}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#34d399', marginBottom: '0.2rem' }}>
                  ✓ {h.options[h.correctIndex]}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{h.explanation}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
