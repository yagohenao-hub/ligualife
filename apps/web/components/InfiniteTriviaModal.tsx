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
  Gem,
  Crown,
  Award,
  Shield
} from 'lucide-react'
import styles from '@/styles/InfiniteTrivia.module.css'
import {
  TriviaQuestion,
  AnsweredTriviaQuestion,
  getSeedQuestionsForTopic
} from '@/lib/trivia-seed'
import { soundEngine } from '@/lib/sound-effects'

interface InfiniteTriviaModalProps {
  isOpen: boolean
  onClose: () => void
  topicOrder: number
  topicName: string
  ldsFormula?: string
  commonMistake?: string
  grammarFocus?: string
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

export function InfiniteTriviaModal({
  isOpen,
  onClose,
  topicOrder,
  topicName,
  ldsFormula,
  commonMistake = 'Traducción directa palabra por palabra del español',
  grammarFocus = '',
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
  const [isMuted, setIsMuted] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [currentTierName, setCurrentTierName] = useState<string>('Unranked')

  // Track recent contexts to avoid repetitive questions from Gemini
  const recentContextsRef = useRef<string[]>([])
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Clear auto-advance timer on unmount or question shift
  const clearAutoAdvanceTimer = useCallback(() => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current)
      autoAdvanceTimerRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => {
      clearAutoAdvanceTimer()
    }
  }, [clearAutoAdvanceTimer])

  // Load saved stats from localStorage on mount / topic change
  useEffect(() => {
    if (!isOpen) {
      clearAutoAdvanceTimer()
      return
    }
    const studentKey = studentProfile?.id || 'guest'
    try {
      const savedBest = localStorage.getItem(`ll_trivia_best_${studentKey}_${topicOrder}`)
      if (savedBest) setBestStreak(parseInt(savedBest, 10))
      const savedMastered = localStorage.getItem(`ll_trivia_mastered_${studentKey}_${topicOrder}`)
      if (savedMastered) setMasteredCount(parseInt(savedMastered, 10))
    } catch {}

    // Initialize with instant seed questions (0 ms delay)
    const seeds = getSeedQuestionsForTopic(
      topicOrder,
      topicName,
      ldsFormula,
      commonMistake,
      grammarFocus
    )

    if (seeds.length > 0) {
      setCurrentQuestion(seeds[0])
      setQueue(seeds.slice(1))
    }
    setStreak(0)
    setSelectedOption(null)
    setIsAnswered(false)
    setHistory([])
    setShowHistory(false)
    setMilestoneNotice(null)
    clearAutoAdvanceTimer()
  }, [isOpen, topicOrder, topicName, ldsFormula, commonMistake, grammarFocus, studentProfile?.id, clearAutoAdvanceTimer])

  // Refill questions from Gemini API in the background
  const refillQuestions = useCallback(async () => {
    if (isRefilling) return
    setIsRefilling(true)

    try {
      const difficultyLevel = masteredCount >= 8 || streak >= 7
        ? 'advanced'
        : masteredCount >= 4 || streak >= 3
        ? 'intermediate'
        : 'basic'

      const res = await fetch('/api/student/trivia-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicOrder,
          topicName,
          ldsFormula,
          commonMistake,
          grammarFocus,
          studentName: studentProfile?.name || 'Estudiante',
          studentInterests: studentProfile?.interests || 'Tecnología, viajes y conversaciones casuales',
          vertical: studentProfile?.vertical || '',
          level: studentProfile?.level || 'B1',
          difficultyLevel,
          excludeContexts: recentContextsRef.current.slice(-6)
        })
      })

      const data = await res.json()
      if (data.ok && Array.isArray(data.questions) && data.questions.length > 0) {
        setQueue(prev => [...prev, ...data.questions])
        data.questions.forEach((q: TriviaQuestion) => {
          if (q.question) {
            recentContextsRef.current.push(q.question.slice(0, 30))
          }
        })
      }
    } catch (err) {
      console.warn('Silent background refill notice:', err)
    } finally {
      setIsRefilling(false)
    }
  }, [topicOrder, topicName, ldsFormula, commonMistake, grammarFocus, studentProfile, isRefilling])

  // Trigger background refill if queue is running low
  useEffect(() => {
    if (isOpen && queue.length < 3 && !isRefilling) {
      refillQuestions()
    }
  }, [isOpen, queue.length, isRefilling, refillQuestions])

  // Synchronize mastery promotion when achieving a streak milestone (5, 10, 15, 20, 25+)
  const handleMilestoneReward = useCallback(async (newStreak: number) => {
    if (!studentProfile?.id || !topicOrder) return

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
        setMilestoneNotice(`¡Racha de ${newStreak}! Has alcanzado el rango ${data.tierName || 'Superior'} en ${topicName}.`)
      }
    } catch {}
  }, [studentProfile?.id, topicOrder, topicName, onMasteryUpgrade])

  // Stop ambient sound on modal close or unmount
  useEffect(() => {
    return () => {
      soundEngine.stopAmbientLoop()
    }
  }, [])

  const handleToggleSound = useCallback(() => {
    const muted = soundEngine.toggleMute()
    setIsMuted(muted)
    if (!muted) {
      soundEngine.startAmbientLoop()
    }
  }, [])

  // Advance to next question
  const handleNext = useCallback(() => {
    clearAutoAdvanceTimer()

    if (queue.length === 0) {
      refillQuestions()
    }
    const [nextQ, ...rest] = queue
    if (nextQ) {
      setCurrentQuestion(nextQ)
      setQueue(rest)
    }
    setSelectedOption(null)
    setIsAnswered(false)
    setMilestoneNotice(null)
  }, [queue, refillQuestions, clearAutoAdvanceTimer])

  // Answer selection handler
  const handleSelectOption = useCallback((index: number) => {
    if (isAnswered || !currentQuestion) return

    clearAutoAdvanceTimer()
    setSelectedOption(index)
    setIsAnswered(true)

    const correct = index === currentQuestion.correctIndex
    const studentKey = studentProfile?.id || 'guest'

    // Update streak and record
    let updatedStreak = streak
    if (correct) {
      // Zero-latency Pavlovian reward chime
      soundEngine.playRewardChime()

      updatedStreak = streak + 1
      setStreak(updatedStreak)
      if (updatedStreak > bestStreak) {
        setBestStreak(updatedStreak)
        try {
          localStorage.setItem(`ll_trivia_best_${studentKey}_${topicOrder}`, String(updatedStreak))
        } catch {}
      }

      // Check milestones: 5 (Bronze), 10 (Silver), 15 (Gold), 20 (Diamond), 25 (Platinum)
      const isMilestone = [5, 10, 15, 20, 25].includes(updatedStreak) || (updatedStreak > 25 && updatedStreak % 5 === 0)
      if (isMilestone) {
        soundEngine.playMilestoneFanfare()
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 3000)
        handleMilestoneReward(updatedStreak)
      } else {
        setMilestoneNotice(null)
      }

      // Update mastered count
      setMasteredCount(prev => {
        const newCount = prev + 1
        try {
          localStorage.setItem(`ll_trivia_mastered_${studentKey}_${topicOrder}`, String(newCount))
        } catch {}
        return newCount
      })

      // AUTO-ADVANCE on correct answer without pressing any next button
      autoAdvanceTimerRef.current = setTimeout(() => {
        handleNext()
      }, 950)
    } else {
      setStreak(0)
      setMilestoneNotice(null)

      // Re-insert failed question 3 positions later in the queue (Spaced Mastery Loop)
      const clone: TriviaQuestion = {
        ...currentQuestion,
        id: `${currentQuestion.id}-retry-${Date.now()}`
      }
      setQueue(prev => {
        const next = [...prev]
        const insertPos = Math.min(3, next.length)
        next.splice(insertPos, 0, clone)
        return next
      })
    }

    // Save to last-3 history cache
    const answeredItem: AnsweredTriviaQuestion = {
      ...currentQuestion,
      selectedIndex: index,
      isCorrect: correct,
      answeredAt: Date.now()
    }

    setHistory(prev => {
      const nextHist = [answeredItem, ...prev]
      return nextHist.slice(0, 3) // Keep only the last 3 questions
    })
  }, [
    isAnswered,
    currentQuestion,
    streak,
    bestStreak,
    topicOrder,
    studentProfile?.id,
    handleMilestoneReward,
    handleNext,
    clearAutoAdvanceTimer
  ])

  // Keyboard navigation listener (1-4 / A-D to answer, Enter to advance when incorrect)
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

  return (
    <div className={styles.overlay} onClick={() => { clearAutoAdvanceTimer(); onClose(); }}>
      <div
        className={styles.window}
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header & Metrics Bar */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.topicTag}>
              <Sparkles size={14} />
              <span>Tema #{topicOrder}: {cleanTopicName}</span>
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
            <div className={styles.statItem} title="Mejor racha histórica en este tema">
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
            {/* Audio & Ambient Music Toggle */}
            <button
              type="button"
              className={`${styles.soundToggleBtn} ${!isMuted ? styles.soundToggleActive : ''}`}
              onClick={handleToggleSound}
              title={isMuted ? 'Activar audio y música de concentración' : 'Silenciar audio'}
            >
              {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
              <span>{isMuted ? 'Mudo' : 'Audio On'}</span>
            </button>

            {/* Botón de historial de las últimas 3 preguntas */}
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

            {/* Cerrar modal */}
            <button
              type="button"
              className={styles.iconBtn}
              onClick={() => {
                clearAutoAdvanceTimer();
                soundEngine.stopAmbientLoop();
                onClose();
              }}
              title="Cerrar trivia"
              aria-label="Cerrar"
            >
              <X size={18} />
            </button>
          </div>
        </header>

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
              style={{ background: 'transparent', border: 'none', color: '#fde68a', cursor: 'pointer', fontSize: '1rem' }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Question Area */}
        <div className={styles.contentArea}>
          {/* Question Card */}
          <div className={styles.questionCard}>
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
                  ? 'Transformación Ágil'
                  : 'Modo Detective'}
              </span>
            )}

            <div className={styles.questionTitle}>
              {currentQuestion.question}
            </div>
          </div>

          {/* Options 2x2 Grid (Quién Quiere Ser Millonario style) */}
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
                  key={idx}
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
                /* Retroalimentación breve y positiva antes de avanzar automáticamente */
                <div className={styles.correctFeedbackPulse}>
                  <CheckCircle2 size={18} color="#34d399" />
                  <span>¡Excelente! Respuesta correcta. Avanzando...</span>
                </div>
              ) : (
                /* Corrección Intrusiva e Ineludible (Sin requerir scroll) */
                <div className={styles.correctionCard}>
                  <div className={styles.correctionHeader}>
                    <div className={styles.correctionAlertBadge}>
                      <AlertCircle size={18} />
                      <span>Respuesta Incorrecta</span>
                    </div>
                    <div className={styles.correctReveal}>
                      La correcta es:{' '}
                      <strong>
                        {['A', 'B', 'C', 'D'][currentQuestion.correctIndex]}: {currentQuestion.options[currentQuestion.correctIndex]}
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

        {/* History Drawer of Last 3 Questions with 4-Pill Snapshots */}
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

                  <div className={styles.historyQuestionText}>
                    {item.question}
                  </div>

                  {/* 4 Píldoritas de opciones como screenshot del turno */}
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
