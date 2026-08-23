import { useState } from 'react'
import Link from 'next/link'
import styles from '@/styles/Landing.module.css'

interface SamplePrompt {
  id: string
  category: string
  spanish: string
  b2Expression: string
  ldsFormula: string
  pronunciation: string
  topicLesson: string
}

const SAMPLES: SamplePrompt[] = [
  {
    id: '1',
    category: 'Entrevistas & Trabajo',
    spanish: 'Quería saber si podemos reprogramar la reunión de mañana por un inconveniente.',
    b2Expression: 'I was wondering if we could reschedule tomorrow\'s meeting due to an unexpected conflict.',
    ldsFormula: 'Sujeto (I) + Past Continuous (was wondering) + Conector (if we could) + Acción B2',
    pronunciation: 'ai uás uánderin if ui cud riskéyul tumorous míting diu tu an anekspékted kónflikt',
    topicLesson: 'Lección #12 — Peticiones Corteses & Condicionales B2',
  },
  {
    id: '2',
    category: 'Startups & Tech',
    spanish: 'Ayer estuve revisando los datos y me di cuenta de que el sistema tuvo una falla.',
    b2Expression: 'Yesterday I was going over the data and noticed that the system experienced a glitch.',
    ldsFormula: 'Sujeto (I) + Phrasal Verb B2 (going over) + Acción en Pasado (noticed)',
    pronunciation: 'yésterdei ai uás góing óver da déita and nótist dat da sístem ekspírienst a glitch',
    topicLesson: 'Lección #18 — Phrasal Verbs & Reporte de Incidentes',
  },
  {
    id: '3',
    category: 'Viajes & Negociación',
    spanish: 'Me gustaría confirmar si la reserva incluye desayuno y transporte al aeropuerto.',
    b2Expression: 'I\'d like to double-check whether the booking includes breakfast and airport shuttle service.',
    ldsFormula: 'Sujeto (I\'d) + Verbo de Verificación B2 (double-check) + Sustantivo Compuesto',
    pronunciation: 'aid laik tu dábl chek uéder da búking inklúds brékfast and éirport shátl sérvis',
    topicLesson: 'Lección #07 — Confirmaciones & Servicios de Hospedaje',
  },
]

export function PocketCoachSimulator() {
  const [selectedSample, setSelectedSample] = useState<SamplePrompt>(SAMPLES[0])
  const [customText, setCustomText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)

  function handleSelectSample(sample: SamplePrompt) {
    setSelectedSample(sample)
    setCustomText('')
    triggerTypingAnimation()
  }

  function triggerTypingAnimation() {
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
    }, 800)
  }

  function playAudio(text: string) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US'
      utterance.rate = 0.9
      utterance.onstart = () => setIsPlayingAudio(true)
      utterance.onend = () => setIsPlayingAudio(false)
      utterance.onerror = () => setIsPlayingAudio(false)
      window.speechSynthesis.speak(utterance)
    }
  }

  return (
    <section id="simulador" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>Demostración Interactiva</span>
          <h2 className={styles.sectionTitle}>Prueba tu Pocket Coach en Tiempo Real</h2>
          <p className={styles.sectionSubtitle}>
            Selecciona una frase cotidiana o escribe la tuya. Observa cómo la IA de LinguaLife desglosa la estructura LDS, sugiere vocabulario B2 y te enseña la pronunciación perfecta.
          </p>
        </div>

        <div className={styles.simulatorCard}>
          {/* Controls side */}
          <div className={styles.simControls}>
            <div>
              <div className={styles.simFormGroup}>
                <label className={styles.simLabel}>1. Selecciona tu Contexto u Objetivo:</label>
                <div className={styles.simPillGrid}>
                  {SAMPLES.map(s => (
                    <button
                      key={s.id}
                      onClick={() => handleSelectSample(s)}
                      className={`${styles.simPill} ${selectedSample.id === s.id ? styles.simPillActive : ''}`}
                    >
                      {s.category}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.simFormGroup}>
                <label className={styles.simLabel}>2. Frase en Español que deseas expresar:</label>
                <div 
                  style={{ 
                    background: 'rgba(255,255,255,0.04)', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    padding: '0.9rem', 
                    borderRadius: '10px',
                    fontSize: '0.9rem',
                    color: '#e4e4e7',
                    marginBottom: '1rem'
                  }}
                >
                  "{customText || selectedSample.spanish}"
                </div>
              </div>

              <div className={styles.simFormGroup}>
                <label className={styles.simLabel}>O escribe tu propia frase:</label>
                <input
                  type="text"
                  placeholder="Ej: Necesito presentar este proyecto el viernes..."
                  value={customText}
                  onChange={(e) => {
                    setCustomText(e.target.value)
                    if (e.target.value.length > 5) triggerTypingAnimation()
                  }}
                  className={styles.simInput}
                />
              </div>
            </div>

            <div style={{ paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <p style={{ fontSize: '0.8rem', color: '#a1a1aa', marginBottom: '0.75rem' }}>
                💡 En tu WhatsApp real, podrás enviar audios de voz y recibir correcciones personalizadas todos los días.
              </p>
              <Link href="/register/student" className={styles.btnPrimary} style={{ width: '100%', justifyContent: 'center' }}>
                Activar mi Pocket Coach Real ✨
              </Link>
            </div>
          </div>

          {/* WhatsApp Viewport side */}
          <div className={styles.chatWindow}>
            <div className={styles.chatHeader}>
              <div className={styles.avatar}>LL</div>
              <div className={styles.chatHeaderInfo}>
                <div className={styles.chatName}>LinguaLife Pocket Coach 🟢</div>
                <div className={styles.chatStatus}>
                  <span className={styles.statusDot}></span>
                  {isTyping ? 'escribiendo respuesta...' : 'en línea en WhatsApp'}
                </div>
              </div>
            </div>

            <div className={styles.chatBody}>
              <div className={styles.msgUser}>
                {customText || selectedSample.spanish}
              </div>

              {isTyping ? (
                <div className={styles.msgBot} style={{ fontStyle: 'italic', color: '#888' }}>
                  ⏳ Generando corrección LDS y análisis fonético...
                </div>
              ) : (
                <div className={styles.msgBot}>
                  <div className={styles.botHeaderTag}>
                    🎯 Expressing in B2 English ({selectedSample.topicLesson})
                  </div>

                  <div className={styles.botTranslation}>
                    "{selectedSample.b2Expression}"
                  </div>

                  <div className={styles.botFormulaBox}>
                    <strong>📐 Estructura LDS:</strong> <br />
                    {selectedSample.ldsFormula}
                  </div>

                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#9ca3af', display: 'block', marginBottom: '0.3rem' }}>
                      🗣️ Pronunciación Fonética Guiada:
                    </span>
                    <div style={{ fontSize: '0.825rem', color: '#a78bfa', fontStyle: 'italic', marginBottom: '0.6rem' }}>
                      "{selectedSample.pronunciation}"
                    </div>

                    <button
                      onClick={() => playAudio(selectedSample.b2Expression)}
                      className={styles.botAudioBtn}
                    >
                      {isPlayingAudio ? '🔊 Reproduciendo Audio...' : '▶ Escuchar Pronunciación B2'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
