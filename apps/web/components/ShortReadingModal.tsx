import React, { useState, useEffect, useRef } from 'react'
import { 
  X, 
  Volume2, 
  Square, 
  Sparkles, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle, 
  BookOpen, 
  RefreshCw, 
  Clock,
  Award
} from 'lucide-react'
import { ShortReadingItem } from '@/lib/short-reading-seed'
import styles from '@/styles/ShortReadingModal.module.css'

interface ShortReadingModalProps {
  topicOrder: number
  topicName: string
  studentName?: string
  onClose: () => void
  onGenerateCustom?: () => Promise<void>
}

export function ShortReadingModal({
  topicOrder,
  topicName,
  studentName,
  onClose
}: ShortReadingModalProps) {
  const [reading, setReading] = useState<ShortReadingItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [generatingAi, setGeneratingAi] = useState(false)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [audioRate, setAudioRate] = useState<number>(0.75)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showAnswerResult, setShowAnswerResult] = useState(false)
  const [tooltipWord, setTooltipWord] = useState<{ word: string; meaning: string } | null>(null)
  const [limitNotice, setLimitNotice] = useState<string | null>(null)

  // Cargar lectura al montar (Primero desde cache / inventario)
  useEffect(() => {
    let isMounted = true
    const cacheKey = `ll_short_reading_${topicOrder}`

    // 1. Intentar leer desde sessionStorage local primero
    try {
      const cached = sessionStorage.getItem(cacheKey)
      if (cached) {
        const parsed = JSON.parse(cached)
        setReading(parsed)
        setLoading(false)
        return
      }
    } catch {}

    // 2. Fetch al endpoint
    async function loadInitial() {
      setLoading(true)
      try {
        const res = await fetch('/api/student/generate-short-reading', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topicOrder,
            topicName,
            studentName,
            forceNew: false
          })
        })
        const data = await res.json()
        if (isMounted && data.reading) {
          setReading(data.reading)
          try {
            sessionStorage.setItem(cacheKey, JSON.stringify(data.reading))
          } catch {}
        }
      } catch (err) {
        console.error('[ShortReadingModal] Error cargando lectura:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadInitial()

    return () => {
      isMounted = false
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [topicOrder, topicName, studentName])

  // Bloquear scroll del fondo cuando la ventana modal está abierta
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    document.body.style.touchAction = 'none'
    return () => {
      document.body.style.overflow = ''
      document.body.style.touchAction = ''
    }
  }, [])

  // Detener audio al cerrar o desmontar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [onClose])

  // Función de Text-to-Speech nativa idéntica a Flashcards y Escenas
  function handlePlayAudio() {
    if (!reading || !('speechSynthesis' in window)) return

    if (isPlayingAudio) {
      window.speechSynthesis.cancel()
      setIsPlayingAudio(false)
      return
    }

    window.speechSynthesis.cancel()
    const textToSpeak = `${reading.title}. ${reading.readingText}`
    const utterance = new SpeechSynthesisUtterance(textToSpeak)
    utterance.lang = 'en-US'
    utterance.rate = audioRate

    utterance.onstart = () => setIsPlayingAudio(true)
    utterance.onend = () => setIsPlayingAudio(false)
    utterance.onerror = () => setIsPlayingAudio(false)

    window.speechSynthesis.speak(utterance)
  }

  function handleStopAudio() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      setIsPlayingAudio(false)
    }
  }

  function handleRateChange(newRate: number) {
    setAudioRate(newRate)
    if (isPlayingAudio && reading && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const textToSpeak = `${reading.title}. ${reading.readingText}`
      const utterance = new SpeechSynthesisUtterance(textToSpeak)
      utterance.lang = 'en-US'
      utterance.rate = newRate
      utterance.onstart = () => setIsPlayingAudio(true)
      utterance.onend = () => setIsPlayingAudio(false)
      utterance.onerror = () => setIsPlayingAudio(false)
      window.speechSynthesis.speak(utterance)
    }
  }

  // Generar nueva versión personalizada con IA respetando cuota
  async function handleGenerateNewWithAi() {
    // Restricción simple de rate-limit: 3 por hora por tema
    const usageKey = `ll_sr_limit_${topicOrder}`
    try {
      const history = JSON.parse(localStorage.getItem(usageKey) || '[]')
      const oneHourAgo = Date.now() - 60 * 60 * 1000
      const recent = history.filter((t: number) => t > oneHourAgo)
      if (recent.length >= 3) {
        setLimitNotice('Has generado 3 lecturas en esta hora para este tema. Disfruta y practica con las actuales.')
        return
      }
    } catch {}

    setGeneratingAi(true)
    setLimitNotice(null)
    handleStopAudio()

    try {
      const res = await fetch('/api/student/generate-short-reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicOrder,
          topicName,
          studentName,
          forceNew: true
        })
      })
      const data = await res.json()
      if (data.reading) {
        setReading(data.reading)
        setSelectedAnswer(null)
        setShowAnswerResult(false)
        try {
          sessionStorage.setItem(`ll_short_reading_${topicOrder}`, JSON.stringify(data.reading))
          const history = JSON.parse(localStorage.getItem(usageKey) || '[]')
          history.push(Date.now())
          localStorage.setItem(usageKey, JSON.stringify(history))
        } catch {}
      }
    } catch (err) {
      alert('Hubo un inconveniente al generar la nueva lectura con IA. Inténtalo de nuevo en unos momentos.')
    } finally {
      setGeneratingAi(false)
    }
  }

  // Resaltador de vocabulario (desactivado temporalmente a petición del usuario para MVP)
  function renderHighlightedText(text: string, _vocabList: ShortReadingItem['highlightedVocab']) {
    return <span>{text}</span>
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        
        {/* Header Bar */}
        <div className={styles.modalHeader}>
          <div className={styles.titleInfo}>
            <span className={styles.topicBadge}>Tema #{topicOrder}</span>
            <div className={styles.titleText}>
              <h2 className={styles.topicName}>{topicName}</h2>
              <span className={styles.featureLabel}>📖 Short Reading (Micro-lectura enfocada)</span>
            </div>
          </div>

          <button 
            type="button" 
            className={styles.closeBtn} 
            onClick={onClose} 
            aria-label="Cerrar lectura"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cuerpo del Modal */}
        <div className={styles.modalContent}>
          {loading ? (
            <div className={styles.loaderWrap}>
              <div className="spinner" />
              <p>Cargando lectura pedagógica...</p>
            </div>
          ) : reading ? (
            <>
              {/* Barra de Control de Audio TTS */}
              <div className={styles.audioToolbar}>
                <div className={styles.audioMainControls}>
                  <button 
                    type="button"
                    className={`${styles.audioPlayBtn} ${isPlayingAudio ? styles.audioPlaying : ''}`}
                    onClick={handlePlayAudio}
                  >
                    {isPlayingAudio ? (
                      <>
                        <Square size={16} />
                        <span>Pausar Lectura</span>
                      </>
                    ) : (
                      <>
                        <Volume2 size={18} />
                        <span>Escuchar Lectura</span>
                      </>
                    )}
                  </button>

                  {isPlayingAudio && (
                    <button 
                      type="button" 
                      className={styles.audioStopBtn} 
                      onClick={handleStopAudio}
                      title="Detener audio"
                    >
                      <Square size={14} />
                    </button>
                  )}

                  {/* Selector de velocidad de voz */}
                  <div className={styles.rateSelector}>
                    <button 
                      type="button"
                      className={`${styles.rateBtn} ${audioRate === 0.5 ? styles.rateActive : ''}`}
                      onClick={() => handleRateChange(0.5)}
                      title="Velocidad muy lenta (0.5x)"
                    >
                      0.5x
                    </button>
                    <button 
                      type="button"
                      className={`${styles.rateBtn} ${audioRate === 0.75 ? styles.rateActive : ''}`}
                      onClick={() => handleRateChange(0.75)}
                      title="Velocidad pausada (0.75x)"
                    >
                      0.75x
                    </button>
                    <button 
                      type="button"
                      className={`${styles.rateBtn} ${audioRate === 1.0 ? styles.rateActive : ''}`}
                      onClick={() => handleRateChange(1.0)}
                      title="Velocidad normal nativa (1x)"
                    >
                      1x
                    </button>
                  </div>
                </div>
              </div>

              {/* Tarjeta de Lectura Principal */}
              <article className={styles.readingCard}>
                <header className={styles.readingHeader}>
                  <h3 className={styles.readingTitle}>{reading.title}</h3>
                  <span className={styles.focusTag}>
                    <Sparkles size={13} /> {reading.focusGrammar}
                  </span>
                </header>

                <div className={styles.readingBody}>
                  <p className={styles.readingText}>
                    {renderHighlightedText(reading.readingText, reading.highlightedVocab)}
                  </p>
                </div>
              </article>

              {/* Check de Comprensión Rápida */}
              {reading.quickQuestion && (
                <div className={styles.comprehensionBox}>
                  <div className={styles.comprehensionHeader}>
                    <HelpCircle size={17} color="var(--accent-primary)" />
                    <span className={styles.comprehensionTitle}>Micro-Check de Comprensión</span>
                  </div>

                  <p className={styles.questionText}>{reading.quickQuestion.question}</p>

                  <div className={styles.optionsList}>
                    {reading.quickQuestion.options.map((opt, idx) => {
                      const isChosen = selectedAnswer === idx
                      const isCorrect = idx === reading.quickQuestion.correctIndex

                      let optionClass = styles.optionBtn
                      if (showAnswerResult) {
                        if (isCorrect) optionClass += ` ${styles.optionCorrect}`
                        else if (isChosen) optionClass += ` ${styles.optionWrong}`
                      } else if (isChosen) {
                        optionClass += ` ${styles.optionSelected}`
                      }

                      return (
                        <button
                          key={idx}
                          type="button"
                          className={optionClass}
                          disabled={showAnswerResult}
                          onClick={() => {
                            setSelectedAnswer(idx)
                            setShowAnswerResult(true)
                          }}
                        >
                          <span className={styles.optionLetter}>{String.fromCharCode(65 + idx)}</span>
                          <span className={styles.optionLabel}>{opt}</span>
                        </button>
                      )
                    })}
                  </div>

                  {showAnswerResult && (
                    <div className={styles.feedbackWrap}>
                      {selectedAnswer === reading.quickQuestion.correctIndex ? (
                        <div className={styles.feedbackSuccess}>
                          <CheckCircle2 size={16} />
                          <span>¡Correcto! {reading.quickQuestion.explanationEs}</span>
                        </div>
                      ) : (
                        <div className={styles.feedbackError}>
                          <AlertCircle size={16} />
                          <span>Revisa el texto. {reading.quickQuestion.explanationEs}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Banner de Aviso de Límite si se superó */}
              {limitNotice && (
                <div className={styles.limitAlert}>
                  <Clock size={16} />
                  <span>{limitNotice}</span>
                </div>
              )}
            </>
          ) : (
            <p>No se pudo cargar la lectura.</p>
          )}
        </div>

        {/* Footer con Botón de Generar Nueva con IA */}
        <div className={styles.modalFooter}>
          <button
            type="button"
            className={styles.generateAiBtn}
            onClick={handleGenerateNewWithAi}
            disabled={generatingAi}
            title="Diseñar una nueva variante de lectura de 100 palabras con Gemini"
          >
            <RefreshCw size={15} className={generatingAi ? styles.spinIcon : ''} />
            <span>{generatingAi ? 'Creando con IA...' : 'Generar otra lectura con IA'}</span>
          </button>

          <button 
            type="button" 
            className={styles.closeModalBtn} 
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  )
}
