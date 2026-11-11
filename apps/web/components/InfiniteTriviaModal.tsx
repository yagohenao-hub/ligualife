import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  X,
  Flame,
  Trophy,
  Star,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  History,
  BookOpen,
  ArrowLeft,
  ArrowRight,
  Check,
  Volume2,
  VolumeX,
  Zap
} from 'lucide-react'
import styles from '@/styles/InfiniteTrivia.module.css'
import {
  TriviaQuestion,
  TriviaDifficulty,
  AnsweredTriviaQuestion,
  getSeedQuestionsForTopic,
  getSeedQuestionsForVocabulary
} from '@/lib/trivia-seed'
import { VocabCategory, CefrLevel, VocabularyWordItem } from '@/lib/vocabulary'
import { soundEngine } from '@/lib/sound-effects'

interface InfiniteTriviaModalProps {
  isOpen: boolean
  onClose: () => void
  topicOrder: number
  topicName: string
  ldsFormula?: string
  commonMistake?: string
  grammarFocus?: string
  contextType?: 'topic' | 'vocabulary'
  vocabCategory?: VocabCategory
  cefrLevel?: CefrLevel
  vocabWords?: VocabularyWordItem[]
  studentProfile?: {
    id?: string
    name?: string
    interests?: string
    vertical?: string
    notes?: string
    level?: string
  } | null
  onMasteryUpgrade?: (newMasteryMap: any) => void
}

const normalizeQuestionKey = (q?: string | null): string =>
  (q || '').trim().toLowerCase().replace(/\s+/g, ' ')

export function InfiniteTriviaModal({
  isOpen,
  onClose,
  topicOrder,
  topicName,
  ldsFormula,
  commonMistake = 'Traducción directa palabra por palabra del español',
  grammarFocus = '',
  contextType = 'topic',
  vocabCategory = 'time_words',
  cefrLevel = 'A1',
  vocabWords,
  studentProfile,
  onMasteryUpgrade
}: InfiniteTriviaModalProps) {
  const [queue, setQueue] = useState<TriviaQuestion[]>([])
  const [currentQuestion, setCurrentQuestion] = useState<TriviaQuestion | null>(null)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [masteredCount, setMasteredCount] = useState(0)
  const [history, setHistory] = useState<AnsweredTriviaQuestion[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [isRefilling, setIsRefilling] = useState(false)
  const [milestoneNotice, setMilestoneNotice] = useState<string | null>(null)
  const [isMusicOn, setIsMusicOn] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [currentTierName, setCurrentTierName] = useState<string>('Unranked')

  // Refs sincronizados para evitar cierres obsoletos (stale closures) en timers asíncronos
  const queueRef = useRef<TriviaQuestion[]>([])
  const currentQuestionRef = useRef<TriviaQuestion | null>(null)
  const seenQuestionsRef = useRef<Set<string>>(new Set())
  const recentContextsRef = useRef<string[]>([])
  const isRefillingRef = useRef<boolean>(false)
  const lastRefillAttemptRef = useRef<number>(0)
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null)

  const contextStorageKey =
    contextType === 'vocabulary'
      ? `vocab_${vocabCategory}_${cefrLevel}`
      : `topic_${topicOrder}`

  const syncQueue = useCallback((newQueue: TriviaQuestion[]) => {
    queueRef.current = newQueue
    setQueue(newQueue)
  }, [])

  const syncCurrentQuestion = useCallback((q: TriviaQuestion | null) => {
    currentQuestionRef.current = q
    if (q?.question) {
      const norm = normalizeQuestionKey(q.question)
      seenQuestionsRef.current.add(norm)
      recentContextsRef.current = [...recentContextsRef.current.slice(-18), q.question]
    }
    setCurrentQuestion(q)
  }, [])

  const clearAutoAdvanceTimer = useCallback(() => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current)
      autoAdvanceTimerRef.current = null
    }
  }, [])

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current)
    }
    inactivityTimerRef.current = setTimeout(() => {
      clearAutoAdvanceTimer()
      soundEngine.stopAmbientLoop()
      onClose()
    }, 120000)
  }, [clearAutoAdvanceTimer, onClose])

  useEffect(() => {
    if (!isOpen) {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current)
      return
    }
    resetInactivityTimer()
    const handleActivity = () => resetInactivityTimer()
    window.addEventListener('pointerdown', handleActivity)
    window.addEventListener('keydown', handleActivity)
    return () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current)
      window.removeEventListener('pointerdown', handleActivity)
      window.removeEventListener('keydown', handleActivity)
    }
  }, [isOpen, resetInactivityTimer])

  useEffect(() => {
    return () => {
      clearAutoAdvanceTimer()
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current)
    }
  }, [clearAutoAdvanceTimer])

  useEffect(() => {
    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = ''
        document.body.style.touchAction = ''
      }
    }
  }, [])

  // Obtiene el banco base + caché persistente de IA en localStorage
  const buildFullPool = useCallback((): TriviaQuestion[] => {
    const baseSeeds =
      contextType === 'vocabulary'
        ? getSeedQuestionsForVocabulary(vocabCategory, cefrLevel, vocabWords)
        : getSeedQuestionsForTopic(topicOrder, topicName, ldsFormula, commonMistake, grammarFocus)

    let cachedAiQuestions: TriviaQuestion[] = []
    if (typeof window !== 'undefined') {
      try {
        const rawCache = localStorage.getItem(`ll_trivia_ai_pool_v2_${contextStorageKey}`)
        if (rawCache) {
          const parsed = JSON.parse(rawCache)
          if (Array.isArray(parsed)) cachedAiQuestions = parsed
        }
      } catch {}
    }

    const combined = [...cachedAiQuestions, ...baseSeeds]
    const unique: TriviaQuestion[] = []
    const seenKeys = new Set<string>()

    for (const item of combined) {
      if (!item || !item.question || !Array.isArray(item.options) || item.options.length < 2) continue
      const k = normalizeQuestionKey(item.question)
      if (!seenKeys.has(k)) {
        seenKeys.add(k)
        unique.push(item)
      }
    }
    return unique
  }, [
    contextType,
    vocabCategory,
    cefrLevel,
    vocabWords,
    topicOrder,
    topicName,
    ldsFormula,
    commonMistake,
    grammarFocus,
    contextStorageKey
  ])

  // Inicializar al abrir el modal o cambiar de tema/categoría
  useEffect(() => {
    if (!isOpen) {
      clearAutoAdvanceTimer()
      return
    }
    const studentKey = studentProfile?.id || 'guest'
    try {
      const savedBest = localStorage.getItem(`ll_trivia_best_${studentKey}_${contextStorageKey}`)
      setBestStreak(savedBest ? parseInt(savedBest, 10) : 0)
      const savedMastered = localStorage.getItem(`ll_trivia_mastered_${studentKey}_${contextStorageKey}`)
      setMasteredCount(savedMastered ? parseInt(savedMastered, 10) : 0)
    } catch {}

    seenQuestionsRef.current.clear()
    recentContextsRef.current = []
    lastRefillAttemptRef.current = 0

    const pool = buildFullPool()
    if (pool.length > 0) {
      syncCurrentQuestion(pool[0])
      syncQueue(pool.slice(1))
    }

    setStreak(0)
    setSelectedOption(null)
    setIsAnswered(false)
    setHistory([])
    setShowHistory(false)
    setMilestoneNotice(null)
    clearAutoAdvanceTimer()
  }, [
    isOpen,
    contextStorageKey,
    studentProfile?.id,
    buildFullPool,
    syncCurrentQuestion,
    syncQueue,
    clearAutoAdvanceTimer
  ])

  // Generación y caché de nuevas preguntas con IA en segundo plano
  const refillQuestions = useCallback(
    async (force = false) => {
      if (isRefillingRef.current) return
      const now = Date.now()
      if (!force && now - lastRefillAttemptRef.current < 6000) return

      isRefillingRef.current = true
      lastRefillAttemptRef.current = now
      setIsRefilling(true)

      try {
        const difficultyLevel: TriviaDifficulty =
          masteredCount >= 8 || streak >= 7
            ? 'advanced'
            : masteredCount >= 4 || streak >= 3
            ? 'intermediate'
            : 'basic'

        const res = await fetch('/api/student/trivia-questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contextType,
            topicOrder,
            topicName,
            ldsFormula,
            commonMistake,
            grammarFocus,
            vocabCategory,
            cefrLevel,
            studentName: studentProfile?.name || 'Estudiante',
            studentInterests: studentProfile?.interests || 'Tecnología, negocios, viajes y cultura',
            vertical: studentProfile?.vertical || '',
            level: studentProfile?.level || cefrLevel || 'B1',
            difficultyLevel,
            excludeContexts: recentContextsRef.current.slice(-15)
          })
        })

        const data = await res.json()
        if (data.ok && Array.isArray(data.questions) && data.questions.length > 0) {
          const currentKey = normalizeQuestionKey(currentQuestionRef.current?.question)
          const existingQueueKeys = new Set(queueRef.current.map(q => normalizeQuestionKey(q.question)))

          const freshQuestions: TriviaQuestion[] = data.questions.filter((q: TriviaQuestion) => {
            const k = normalizeQuestionKey(q?.question)
            return k && k !== currentKey && !existingQueueKeys.has(k)
          })

          if (freshQuestions.length > 0) {
            const updatedQueue = [...queueRef.current, ...freshQuestions]
            syncQueue(updatedQueue)

            // Persistir en caché local de IA si vinieron del motor generativo
            if (typeof window !== 'undefined' && data.source === 'ai') {
              try {
                const storageKey = `ll_trivia_ai_pool_v2_${contextStorageKey}`
                const rawPrev = localStorage.getItem(storageKey)
                const prevList: TriviaQuestion[] = rawPrev ? JSON.parse(rawPrev) : []
                const merged = [...freshQuestions, ...prevList]
                const deduped: TriviaQuestion[] = []
                const seen = new Set<string>()
                for (const item of merged) {
                  const k = normalizeQuestionKey(item.question)
                  if (!seen.has(k)) {
                    seen.add(k)
                    deduped.push(item)
                  }
                }
                localStorage.setItem(storageKey, JSON.stringify(deduped.slice(0, 40)))
              } catch {}
            }
          }
        }
      } catch (err) {
        console.warn('Background trivia refill warning:', err)
      } finally {
        isRefillingRef.current = false
        setIsRefilling(false)
      }
    },
    [
      contextType,
      topicOrder,
      topicName,
      ldsFormula,
      commonMistake,
      grammarFocus,
      vocabCategory,
      cefrLevel,
      studentProfile,
      masteredCount,
      streak,
      contextStorageKey,
      syncQueue
    ]
  )

  // Disparar recarga anticipada cuando la cola baja de 5 preguntas
  useEffect(() => {
    if (isOpen && queue.length < 5 && !isRefillingRef.current) {
      refillQuestions()
    }
  }, [isOpen, queue.length, refillQuestions])

  // Promoción de rango de maestría en rachas múltiplos de 5
  const handleMilestoneReward = useCallback(
    async (newStreak: number) => {
      const tierNames: Record<number, string> = {
        5: 'Bronce 🥉',
        10: 'Plata 🥈',
        15: 'Oro 🏆',
        20: 'Diamante 💎',
        25: 'Platino 👑'
      }
      const fallbackTier = tierNames[newStreak] || `Maestro (${newStreak}🔥)`

      if (!studentProfile?.id || contextType !== 'topic') {
        setCurrentTierName(fallbackTier)
        setMilestoneNotice(`¡Racha impecable de ${newStreak}! Alcanzaste nivel ${fallbackTier}.`)
        return
      }

      try {
        const res = await fetch('/api/student/topic-mastery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId: studentProfile.id,
            topicOrder,
            streak: newStreak
          })
        })
        const data = await res.json()
        if (data.ok && data.masteryMap) {
          onMasteryUpgrade?.(data.masteryMap)
          if (data.tierName) {
            setCurrentTierName(data.tierName)
          }
          setMilestoneNotice(
            `¡Racha de ${newStreak}! Has alcanzado el rango ${data.tierName || fallbackTier} en ${topicName}.`
          )
        }
      } catch {
        setMilestoneNotice(`¡Racha de ${newStreak}! Nivel ${fallbackTier} desbloqueado.`)
      }
    },
    [studentProfile?.id, contextType, topicOrder, topicName, onMasteryUpgrade]
  )

  useEffect(() => {
    return () => {
      soundEngine.stopAmbientLoop()
    }
  }, [])

  const handleToggleMusic = useCallback(() => {
    const isPlaying = soundEngine.toggleMusic()
    setIsMusicOn(isPlaying)
  }, [])

  // Selecciona una pregunta semilla garantizada que NUNCA sea idéntica a la pregunta actual
  const getGuaranteedDifferentQuestion = useCallback(
    (avoidQuestionText?: string | null): TriviaQuestion | null => {
      const avoidKey = normalizeQuestionKey(avoidQuestionText)
      const fullPool = buildFullPool()
      if (fullPool.length === 0) return null

      // Prioridad 1: Preguntas del pool que aún no se han visto en esta sesión y no son la actual
      const unseenDifferent = fullPool.filter(q => {
        const k = normalizeQuestionKey(q.question)
        return k !== avoidKey && !seenQuestionsRef.current.has(k)
      })

      if (unseenDifferent.length > 0) {
        const picked = unseenDifferent[0]
        return {
          ...picked,
          id: `${picked.id}-fresh-${Date.now()}`
        }
      }

      // Prioridad 2: Reiniciar registro de vistas y elegir cualquiera que NO sea la pregunta actual
      seenQuestionsRef.current.clear()
      if (avoidKey) seenQuestionsRef.current.add(avoidKey)

      const differentPool = fullPool.filter(q => normalizeQuestionKey(q.question) !== avoidKey)
      const candidates = differentPool.length > 0 ? differentPool : fullPool
      const randomIdx = Math.floor(Math.random() * candidates.length)
      const picked = candidates[randomIdx]

      return {
        ...picked,
        id: `${picked.id}-cycle-${Date.now()}-${randomIdx}`
      }
    },
    [buildFullPool]
  )

  // Avanza a la siguiente pregunta leyendo directamente de queueRef para evitar cierres obsoletos
  const handleNext = useCallback(() => {
    clearAutoAdvanceTimer()

    if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }

    const currentKey = normalizeQuestionKey(currentQuestionRef.current?.question)
    const workingQueue = [...queueRef.current]
    let nextQ: TriviaQuestion | null = null

    // 1. Buscar la primera pregunta en cola que aún NO se haya visto y que NO sea igual a la actual
    const unseenIdx = workingQueue.findIndex(q => {
      const k = normalizeQuestionKey(q.question)
      return k !== currentKey && !seenQuestionsRef.current.has(k)
    })

    if (unseenIdx !== -1) {
      nextQ = workingQueue[unseenIdx]
      workingQueue.splice(unseenIdx, 1)
    } else {
      // 2. Buscar cualquier pregunta en cola que NO sea igual a la pregunta actual
      const nonDupIdx = workingQueue.findIndex(q => normalizeQuestionKey(q.question) !== currentKey)
      if (nonDupIdx !== -1) {
        nextQ = workingQueue[nonDupIdx]
        workingQueue.splice(nonDupIdx, 1)
      } else {
        // 3. Si la cola estaba vacía o solo tenía duplicados de la actual, limpiar duplicados y sacar una nueva garantizada
        workingQueue.length = 0
        nextQ = getGuaranteedDifferentQuestion(currentQuestionRef.current?.question)
      }
    }

    if (!nextQ) {
      nextQ = getGuaranteedDifferentQuestion(currentQuestionRef.current?.question)
    }

    // Si después de sacar nextQ la cola queda corta, rehidratar con preguntas frescas del pool
    if (workingQueue.length < 3) {
      const pool = buildFullPool()
      const nextKey = normalizeQuestionKey(nextQ?.question)
      const refillCandidates = pool.filter(p => {
        const pk = normalizeQuestionKey(p.question)
        return (
          pk !== currentKey &&
          pk !== nextKey &&
          !seenQuestionsRef.current.has(pk) &&
          !workingQueue.some(wq => normalizeQuestionKey(wq.question) === pk)
        )
      })
      workingQueue.push(...refillCandidates.slice(0, 6))
    }

    if (nextQ) {
      syncCurrentQuestion(nextQ)
      syncQueue(workingQueue)
    }

    setSelectedOption(null)
    setIsAnswered(false)
    setMilestoneNotice(null)

    if (workingQueue.length < 5 && !isRefillingRef.current) {
      refillQuestions()
    }
  }, [
    clearAutoAdvanceTimer,
    getGuaranteedDifferentQuestion,
    buildFullPool,
    syncCurrentQuestion,
    syncQueue,
    refillQuestions
  ])

  // Manejo de selección de respuesta
  const handleSelectOption = useCallback(
    (index: number) => {
      const activeQ = currentQuestionRef.current
      if (isAnswered || !activeQ) return

      clearAutoAdvanceTimer()
      setSelectedOption(index)
      setIsAnswered(true)

      const correct = index === activeQ.correctIndex
      const studentKey = studentProfile?.id || 'guest'

      let updatedStreak = streak
      if (correct) {
        soundEngine.playRewardChime()

        updatedStreak = streak + 1
        setStreak(updatedStreak)
        if (updatedStreak > bestStreak) {
          setBestStreak(updatedStreak)
          try {
            localStorage.setItem(
              `ll_trivia_best_${studentKey}_${contextStorageKey}`,
              String(updatedStreak)
            )
          } catch {}
        }

        const isMilestone =
          [5, 10, 15, 20, 25].includes(updatedStreak) ||
          (updatedStreak > 25 && updatedStreak % 5 === 0)
        if (isMilestone) {
          soundEngine.playMilestoneFanfare()
          setShowConfetti(true)
          setTimeout(() => setShowConfetti(false), 3000)
          handleMilestoneReward(updatedStreak)
        } else {
          setMilestoneNotice(null)
        }

        setMasteredCount(prev => {
          const newCount = prev + 1
          try {
            localStorage.setItem(
              `ll_trivia_mastered_${studentKey}_${contextStorageKey}`,
              String(newCount)
            )
          } catch {}
          return newCount
        })

        // Avance automático fluido usando queueRef actualizado
        autoAdvanceTimerRef.current = setTimeout(() => {
          handleNext()
        }, 950)
      } else {
        setStreak(0)
        setMilestoneNotice(null)

        // Repetición espaciada: reinsertar la pregunta fallada 3 posiciones más adelante
        // garantizando siempre al menos 2 preguntas diferentes en medio
        const working = [...queueRef.current]
        const activeKey = normalizeQuestionKey(activeQ.question)

        if (working.filter(q => normalizeQuestionKey(q.question) !== activeKey).length < 2) {
          const filler = getGuaranteedDifferentQuestion(activeQ.question)
          if (filler) working.unshift(filler)
        }

        const retryClone: TriviaQuestion = {
          ...activeQ,
          id: `${activeQ.id}-retry-${Date.now()}`
        }
        const insertPos = Math.min(3, Math.max(2, working.length))
        working.splice(insertPos, 0, retryClone)
        syncQueue(working)
      }

      const answeredItem: AnsweredTriviaQuestion = {
        ...activeQ,
        selectedIndex: index,
        isCorrect: correct,
        answeredAt: Date.now()
      }

      setHistory(prev => [answeredItem, ...prev].slice(0, 3))
    },
    [
      isAnswered,
      streak,
      bestStreak,
      contextStorageKey,
      studentProfile?.id,
      handleMilestoneReward,
      handleNext,
      clearAutoAdvanceTimer,
      getGuaranteedDifferentQuestion,
      syncQueue
    ]
  )

  // Atajos de teclado (1-4 / A-D para responder, Enter para avanzar)
  useEffect(() => {
    if (!isOpen) return

    function handleKeyDown(e: KeyboardEvent) {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return

      if (e.key === 'Escape') {
        if (showHistory) {
          setShowHistory(false)
        } else {
          clearAutoAdvanceTimer()
          onClose()
        }
        return
      }

      if (!isAnswered) {
        if (e.key === '1' || e.key.toLowerCase() === 'a') handleSelectOption(0)
        else if (e.key === '2' || e.key.toLowerCase() === 'b') handleSelectOption(1)
        else if (e.key === '3' || e.key.toLowerCase() === 'c') handleSelectOption(2)
        else if (e.key === '4' || e.key.toLowerCase() === 'd') handleSelectOption(3)
      } else {
        if (e.key === 'Enter') {
          handleNext()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isAnswered, showHistory, handleSelectOption, handleNext, onClose, clearAutoAdvanceTimer])

  if (!isOpen || !currentQuestion) return null

  const isCurrentCorrect = selectedOption === currentQuestion.correctIndex
  const cleanTopicName = (topicName || '').replace(/\s*\([^)]*\)/g, '').trim()

  // Cálculo de nivel de dificultad adaptativo y progreso hacia el siguiente hito de dopamina
  const activeDifficulty: TriviaDifficulty =
    currentQuestion.difficulty ||
    (masteredCount >= 8 || streak >= 7
      ? 'advanced'
      : masteredCount >= 4 || streak >= 3
      ? 'intermediate'
      : 'basic')

  const difficultyBadgeConfig =
    activeDifficulty === 'advanced'
      ? { label: 'Nivel 3: Master 🔥', color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.14)' }
      : activeDifficulty === 'intermediate'
      ? { label: 'Nivel 2: Ágil ⚡', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.14)' }
      : { label: 'Nivel 1: Base 🌱', color: '#10b981', bg: 'rgba(16, 185, 129, 0.14)' }

  const nextMilestoneTarget = Math.floor(streak / 5) * 5 + 5
  const progressInTier = ((streak % 5) / 5) * 100
  const milestoneTierLabels: Record<number, string> = {
    5: 'Bronce 🥉',
    10: 'Plata 🥈',
    15: 'Oro 🏆',
    20: 'Diamante 💎',
    25: 'Platino 👑'
  }
  const nextTierLabel = milestoneTierLabels[nextMilestoneTarget] || `Racha ${nextMilestoneTarget}🔥`

  return (
    <div
      className={styles.overlay}
      onClick={() => {
        clearAutoAdvanceTimer()
        onClose()
      }}
    >
      <div className={styles.window} onClick={e => e.stopPropagation()}>
        {/* Top Header & Metrics Bar */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button
              type="button"
              className={styles.triviaBackBtn}
              onClick={() => {
                clearAutoAdvanceTimer()
                soundEngine.stopAmbientLoop()
                onClose()
              }}
              title="Volver"
              aria-label="Volver"
            >
              <ArrowLeft size={18} />
              <span>Volver</span>
            </button>

            <span className={styles.topicTag}>
              <Sparkles size={14} />
              <span>
                {contextType === 'vocabulary'
                  ? cleanTopicName
                  : `Tema #${topicOrder}: ${cleanTopicName}`}
              </span>
            </span>
          </div>

          <div className={styles.headerStats}>
            {/* Racha actual */}
            <div className={styles.statItem} title="Racha actual consecutiva">
              <Flame
                size={16}
                className={streak > 0 ? styles.flameActive : styles.flameInactive}
              />
              <span>Racha:</span>
              <span className={`${styles.statVal} ${streak > 0 ? styles.streakActive : ''}`}>
                {streak}
              </span>
            </div>

            {/* Récord histórico */}
            <div className={styles.statItem} title="Mejor racha histórica">
              <Trophy size={15} className={styles.trophyIcon} />
              <span>Récord:</span>
              <span className={styles.statVal}>{bestStreak}</span>
            </div>

            {/* Dominadas */}
            <div className={styles.statItem} title="Preguntas dominadas">
              <Star size={15} className={styles.starIcon} />
              <span>Dominio:</span>
              <span className={styles.statVal}>{masteredCount}</span>
            </div>
          </div>

          <div className={styles.headerActions}>
            <button
              type="button"
              className={`${styles.soundToggleBtn} ${isMusicOn ? styles.soundToggleActive : ''}`}
              onClick={handleToggleMusic}
              title={
                isMusicOn
                  ? 'Pausar música de fondo (los efectos de sonido siguen activos)'
                  : 'Encender música de fondo relajante'
              }
            >
              {isMusicOn ? <Volume2 size={15} /> : <VolumeX size={15} />}
              <span>{isMusicOn ? 'Música On' : 'Música Off'}</span>
            </button>

            {history.length > 0 && (
              <button
                type="button"
                className={styles.historyBtn}
                onClick={() => setShowHistory(prev => !prev)}
                title="Repasar explicaciones de las últimas 3 preguntas"
              >
                <History size={14} />
                <span>Últimas 3 ({history.length})</span>
              </button>
            )}
          </div>
        </header>

        {/* Barra de Dopamina: Nivel de Dificultad + Progreso hacia el próximo Rango */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            padding: '0.45rem 1.25rem',
            background: 'rgba(15, 23, 42, 0.75)',
            borderBottom: '1px solid rgba(148, 163, 184, 0.12)',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '0.2rem 0.6rem',
                borderRadius: '999px',
                color: difficultyBadgeConfig.color,
                background: difficultyBadgeConfig.bg,
                border: `1px solid ${difficultyBadgeConfig.color}40`,
                letterSpacing: '0.03em'
              }}
            >
              {difficultyBadgeConfig.label}
            </span>
            {streak >= 2 && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: '#38bdf8',
                  background: 'rgba(56, 189, 248, 0.12)',
                  padding: '0.2rem 0.55rem',
                  borderRadius: '999px'
                }}
              >
                <Zap size={12} /> Combo x{Math.min(5, Math.floor(streak / 2) + 1)}
              </span>
            )}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              flex: '1 1 200px',
              maxWidth: '340px'
            }}
          >
            <span
              style={{
                fontSize: '0.72rem',
                color: '#cbd5e1',
                fontWeight: 600,
                whiteSpace: 'nowrap'
              }}
            >
              Próximo hito: <strong style={{ color: '#fbbf24' }}>{nextTierLabel}</strong> ({streak % 5}/5)
            </span>
            <div
              style={{
                flex: 1,
                height: '7px',
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '999px',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  width: `${Math.max(8, progressInTier)}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #38bdf8, #818cf8, #fbbf24)',
                  borderRadius: '999px',
                  transition: 'width 0.35s cubic-bezier(0.22, 1, 0.36, 1)'
                }}
              />
            </div>
          </div>
        </div>

        {/* Micro-Confetti Burst */}
        {showConfetti && (
          <div className={styles.confettiOverlay}>
            {Array.from({ length: 32 }).map((_, idx) => (
              <div
                key={idx}
                className={styles.confettiPiece}
                style={{
                  left: `${(idx * 3.1) % 98}%`,
                  background: ['#38bdf8', '#f59e0b', '#10b981', '#ec4899', '#a855f7', '#3b82f6', '#fbbf24'][idx % 7],
                  animationDelay: `${(idx * 0.05) % 0.6}s`,
                  transform: `rotate(${(idx * 45) % 360}deg)`
                }}
              />
            ))}
          </div>
        )}

        {/* Milestone Banner */}
        {milestoneNotice && (
          <div className={styles.milestoneBanner}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={16} />
              <span>{milestoneNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setMilestoneNotice(null)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fde68a',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Question Area */}
        <div className={styles.contentArea}>
          <div className={styles.questionCard}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.5rem',
                flexWrap: 'wrap',
                marginBottom: '0.35rem'
              }}
            >
              {currentQuestion.archetype && (
                <span
                  className={`${styles.archetypeBadge} ${
                    currentQuestion.archetype === 'situation'
                      ? styles.archetypeSituation
                      : currentQuestion.archetype === 'spot_trap'
                      ? styles.archetypeTrap
                      : currentQuestion.archetype === 'transform'
                      ? styles.archetypeTransform
                      : styles.archetypeDetective
                  }`}
                >
                  {currentQuestion.archetype === 'situation'
                    ? 'Situación Real'
                    : currentQuestion.archetype === 'spot_trap'
                    ? 'Spot the Trap'
                    : currentQuestion.archetype === 'transform'
                    ? 'Transformación & Polisemia'
                    : currentQuestion.archetype === 'cloze'
                    ? 'Eslabón Clave (Cloze)'
                    : 'Modo Detective'}
                </span>
              )}

              {currentQuestion.contextScenario && (
                <span
                  style={{
                    fontSize: '0.76rem',
                    color: '#94a3b8',
                    fontWeight: 600,
                    background: 'rgba(255, 255, 255, 0.04)',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '6px'
                  }}
                >
                  {currentQuestion.contextScenario}
                </span>
              )}
            </div>

            <div className={styles.questionTitle}>{currentQuestion.question}</div>
          </div>

          {/* Options 2x2 Grid */}
          <div className={styles.optionsGrid2x2}>
            {currentQuestion.options.map((option, idx) => {
              const letter = ['A', 'B', 'C', 'D'][idx]
              let optClass = styles.optionBtn

              if (isAnswered) {
                if (idx === currentQuestion.correctIndex) {
                  optClass = `${styles.optionBtn} ${styles.optionCorrect}`
                } else if (idx === selectedOption) {
                  optClass = `${styles.optionBtn} ${styles.optionIncorrect}`
                } else {
                  optClass = `${styles.optionBtn} ${styles.optionDimmed}`
                }
              }

              return (
                <button
                  key={`${currentQuestion.id || currentQuestion.question}-${idx}`}
                  type="button"
                  className={optClass}
                  onClick={() => handleSelectOption(idx)}
                  disabled={isAnswered}
                >
                  <span className={styles.optionBadge}>{letter}</span>
                  <span className={styles.optionText}>{option}</span>
                  {isAnswered && idx === currentQuestion.correctIndex && (
                    <span className={styles.optionStatusCheck}>
                      <Check size={16} />
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Feedback & Correction Drawer */}
          {isAnswered && (
            <>
              {isCurrentCorrect ? (
                <div className={styles.correctFeedbackPulse}>
                  <CheckCircle2 size={18} color="#34d399" />
                  <span>¡Excelente! Respuesta correcta. Cargando siguiente reto...</span>
                </div>
              ) : (
                <div className={styles.correctionCard}>
                  <div className={styles.correctionHeader}>
                    <div className={styles.correctionAlertBadge}>
                      <AlertCircle size={18} />
                      <span>Respuesta Incorrecta</span>
                    </div>
                    <div className={styles.correctReveal}>
                      La correcta es:{' '}
                      <strong>
                        {['A', 'B', 'C', 'D'][currentQuestion.correctIndex]}:{' '}
                        {currentQuestion.options[currentQuestion.correctIndex]}
                      </strong>
                    </div>
                  </div>

                  <div className={styles.correctionExplanation}>
                    {currentQuestion.explanation}
                  </div>

                  {currentQuestion.trapExplanation && (
                    <div className={styles.correctionTrap}>
                      <strong>Cuidado con el error común:</strong> {currentQuestion.trapExplanation}
                    </div>
                  )}

                  <div className={styles.correctionActions}>
                    <span className={styles.keyHintText}>
                      Presiona <kbd className={styles.keyKbd}>Enter ↵</kbd> o haz clic para continuar
                    </span>
                    <button
                      type="button"
                      className={styles.continueBtn}
                      onClick={handleNext}
                      autoFocus
                    >
                      <span>Continuar</span>
                      <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* History Drawer of Last 3 Questions */}
        {showHistory && (
          <aside className={styles.historyDrawer}>
            <div className={styles.historyHeader}>
              <div className={styles.historyTitle}>
                <BookOpen size={16} color="#c084fc" />
                <span>Últimas 3 Preguntas Respondidas</span>
              </div>
              <button
                type="button"
                className={styles.iconBtn}
                onClick={() => setShowHistory(false)}
                title="Cerrar historial"
              >
                <ArrowLeft size={16} />
              </button>
            </div>

            <div className={styles.historyList}>
              {history.map((item, idx) => (
                <div key={idx} className={styles.historyCard}>
                  <div className={styles.historyCardHeader}>
                    <span
                      className={`${styles.historyStatusBadge} ${
                        item.isCorrect ? styles.historyCorrectBadge : styles.historyErrorBadge
                      }`}
                    >
                      {item.isCorrect ? (
                        <>
                          <CheckCircle2 size={12} />
                          <span>Acertada</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle size={12} />
                          <span>Fallada</span>
                        </>
                      )}
                    </span>
                  </div>

                  <div className={styles.historyQuestionText}>{item.question}</div>

                  <div className={styles.historyPillsGrid}>
                    {item.options.map((opt, optIdx) => {
                      const letter = ['A', 'B', 'C', 'D'][optIdx]
                      const isOptionCorrect = optIdx === item.correctIndex
                      const isOptionChosenWrong = !item.isCorrect && optIdx === item.selectedIndex

                      let pillClass = styles.historyPillNeutral
                      if (isOptionCorrect) {
                        pillClass = styles.historyPillCorrect
                      } else if (isOptionChosenWrong) {
                        pillClass = styles.historyPillWrong
                      }

                      return (
                        <div key={optIdx} className={`${styles.historyPill} ${pillClass}`}>
                          <span className={styles.historyPillBadge}>{letter}</span>
                          <span className={styles.historyPillText}>{opt}</span>
                          {isOptionCorrect && <Check size={12} className={styles.historyPillIcon} />}
                          {isOptionChosenWrong && <X size={12} className={styles.historyPillIcon} />}
                        </div>
                      )
                    })}
                  </div>

                  <div className={styles.historyExplanation}>
                    <strong>Explicación:</strong> {item.explanation}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}
