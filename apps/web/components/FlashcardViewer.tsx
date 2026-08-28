import { useState, useEffect } from 'react'
import { FlashcardPack, FlashcardItem, getAllFlashcardPacks, fetchFlashcardPacksFromServer } from '@/lib/flashcards'
import { InteractiveSceneViewer } from '@/components/InteractiveSceneViewer'
import { InteractiveScene } from '@/lib/interactive-scenes'
import styles from '@/styles/Flashcard.module.css'

interface FlashcardViewerProps {
  pack?: FlashcardPack
}

export function FlashcardViewer({ pack: customPack }: FlashcardViewerProps) {
  const [packsList, setPacksList] = useState<FlashcardPack[]>([])
  const [activePack, setActivePack] = useState<FlashcardPack | null>(customPack || null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [showTranslation, setShowTranslation] = useState(false)
  const [mode, setMode] = useState<'cards' | 'scene'>('cards')
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    const list = getAllFlashcardPacks()
    setPacksList(list)
    if (customPack) {
      setActivePack(customPack)
      setCurrentIndex(0)
      setIsFlipped(false)
      setShowTranslation(false)
    } else if (list.length > 0 && !activePack) {
      setActivePack(list[0])
    }

    fetchFlashcardPacksFromServer().then(fresh => {
      if (fresh && fresh.length > 0) {
        setPacksList(fresh)
        if (!customPack) {
          const currentInFresh = fresh.find(p => p.id === (activePack?.id || list[0]?.id))
          if (currentInFresh) setActivePack(currentInFresh)
        }
      }
    })
  }, [customPack])

  if (!activePack || activePack.cards.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: '#a1a1aa' }}>
        No hay tarjetas disponibles en este pack.
      </div>
    )
  }

  const currentCard: FlashcardItem = activePack.cards[currentIndex] || activePack.cards[0]
  const totalCards = activePack.cards.length

  function handleNext() {
    setIsFlipped(false)
    setShowTranslation(false)
    setCurrentIndex(prev => (prev + 1) % totalCards)
  }

  function handlePrev() {
    setIsFlipped(false)
    setShowTranslation(false)
    setCurrentIndex(prev => (prev - 1 + totalCards) % totalCards)
  }

  function handleShuffle() {
    setIsFlipped(false)
    setShowTranslation(false)
    const randomIndex = Math.floor(Math.random() * totalCards)
    setCurrentIndex(randomIndex)
  }

  function handlePlayAudio(e: React.MouseEvent, text: string) {
    e.stopPropagation()
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US'
      utterance.rate = 0.88
      window.speechSynthesis.speak(utterance)
    }
  }

  function toggleMastered(cardId: string) {
    setMasteredIds(prev => {
      const next = new Set(prev)
      if (next.has(cardId)) next.delete(cardId)
      else next.add(cardId)
      return next
    })
  }

  // Map Pack cards to InteractiveScene for 'scene' mode
  const pairedScene: InteractiveScene = {
    id: activePack.id + '-scene',
    title: activePack.title + ' — Escena Visual',
    subtitle: activePack.subtitle,
    imageSrc: activePack.sceneImageSrc || '/flashcards/draw_family_scene.png',
    totalVerbs: activePack.cards.length,
    hotspots: activePack.cards.map((c, i) => ({
      id: c.id,
      x: c.hotspotCoordinates?.x ?? (15 + (i * 12) % 70),
      y: c.hotspotCoordinates?.y ?? (25 + (i * 10) % 65),
      verb: c.word,
      sentence: `${c.word}: ${c.definitionEn}`,
      translation: `${c.translationEs}: ${c.definitionTranslationEs}`,
      level: activePack.level || 'B2',
      category: activePack.category || 'Vocabulario'
    }))
  }

  return (
    <div style={{ width: '100%', maxWidth: '900px', margin: '0 auto' }}>
      {/* Header Controls: Pack Switcher & Mode Toggle */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(18, 18, 24, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '1rem 1.5rem',
          borderRadius: '16px',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
              {activePack.title}
            </h3>
            {packsList.length > 1 && !customPack && (
              <select
                value={activePack.id}
                onChange={e => {
                  const found = packsList.find(p => p.id === e.target.value)
                  if (found) {
                    setActivePack(found)
                    setCurrentIndex(0)
                    setIsFlipped(false)
                  }
                }}
                style={{
                  background: 'rgba(124, 58, 237, 0.15)',
                  border: '1px solid rgba(124, 58, 237, 0.4)',
                  color: '#c4b5fd',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  padding: '0.3rem 0.7rem',
                  borderRadius: '8px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {packsList.map(p => (
                  <option key={p.id} value={p.id} style={{ background: '#121218', color: '#fff' }}>
                    Pack: {p.title}
                  </option>
                ))}
              </select>
            )}
          </div>
          <p style={{ fontSize: '0.825rem', color: '#9ca3af', margin: '0.3rem 0 0 0' }}>
            {activePack.subtitle}
          </p>
        </div>

        {/* Mode Switcher Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.3rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <button
            onClick={() => setMode('cards')}
            style={{
              background: mode === 'cards' ? 'linear-gradient(135deg, #7c3aed, #2563eb)' : 'transparent',
              color: '#fff',
              border: 'none',
              padding: '0.45rem 0.9rem',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            🃏 Flashcards
          </button>
          <button
            onClick={() => setMode('scene')}
            style={{
              background: mode === 'scene' ? 'linear-gradient(135deg, #10b981, #059669)' : 'transparent',
              color: '#fff',
              border: 'none',
              padding: '0.45rem 0.9rem',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            🖼️ Escena Interactiva
          </button>
        </div>
      </div>

      {mode === 'scene' ? (
        <InteractiveSceneViewer scene={pairedScene} />
      ) : (
        <div>
          {/* Card Progress Tracker */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#a1a1aa', fontWeight: 600 }}>
              Tarjeta {currentIndex + 1} de {totalCards}
            </span>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button
                onClick={() => toggleMastered(currentCard.id)}
                style={{
                  background: masteredIds.has(currentCard.id) ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                  border: masteredIds.has(currentCard.id) ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.15)',
                  color: masteredIds.has(currentCard.id) ? '#34d399' : '#a1a1aa',
                  padding: '0.35rem 0.8rem',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {masteredIds.has(currentCard.id) ? '✓ Dominada' : '⭐ Marcar como Dominada'}
              </button>

              <button
                onClick={handleShuffle}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#d4d4d8',
                  padding: '0.35rem 0.8rem',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                🔀 Mezclar
              </button>
            </div>
          </div>

          {/* 3D Flip Flashcard */}
          <div className={styles.cardContainer}>
            <div
              className={`${styles.cardInner} ${isFlipped ? styles.cardFlipped : ''}`}
              onClick={() => setIsFlipped(!isFlipped)}
            >
              {/* FRONT OF CARD (ONLY IMAGE - NO SPOILER TEXT) */}
              <div className={`${styles.cardFace} ${styles.cardFront}`}>
                <img
                  src={currentCard.imageSrc}
                  alt="Flashcard Visual Concept"
                  className={styles.cardFrontImage}
                />
                <div className={styles.cardFrontHint}>
                  👆 Haz clic para voltear y descubrir el concepto
                </div>
              </div>

              {/* BACK OF CARD (Word, IPA, Audio, Simple Def, Hidden Translation Button) */}
              <div className={`${styles.cardFace} ${styles.cardBack}`}>
                <div className={styles.cardBackHeader}>
                  <div>
                    <h2 className={styles.wordTitle}>{currentCard.word}</h2>
                    {currentCard.ipa && <div className={styles.ipaText}>{currentCard.ipa}</div>}
                  </div>

                  <button
                    className={styles.audioBtn}
                    onClick={(e) => handlePlayAudio(e, currentCard.word)}
                    title="Escuchar Pronunciación"
                  >
                    🔊
                  </button>
                </div>

                <div className={styles.definitionSection}>
                  <div className={styles.defLabel}>Definición en Inglés (Simple)</div>
                  <div className={styles.defTextEn}>{currentCard.definitionEn}</div>
                </div>

                <div>
                  <button
                    className={styles.translationToggleBtn}
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowTranslation(!showTranslation)
                    }}
                  >
                    {showTranslation ? '👁️ Ocultar Traducción' : '👁️ Mostrar Traducción Oculta'}
                  </button>

                  {showTranslation && (
                    <div className={styles.translationBox}>
                      <div className={styles.translationWord}>Traducción: {currentCard.translationEs}</div>
                      <div className={styles.translationDef}>{currentCard.definitionTranslationEs}</div>
                    </div>
                  )}
                </div>

                <div className={styles.cardBackFooter}>
                  <span>Pack: {activePack.category}</span>
                  <span>🔄 Haz clic para volver al frente</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card Navigation Footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', marginTop: '1.75rem' }}>
            <button
              onClick={handlePrev}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              ← Anterior
            </button>

            <button
              onClick={() => setIsFlipped(!isFlipped)}
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                border: 'none',
                color: '#ffffff',
                padding: '0.75rem 1.75rem',
                borderRadius: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(124, 58, 237, 0.4)',
                fontSize: '0.9rem'
              }}
            >
              🔄 Voltear Tarjeta
            </button>

            <button
              onClick={handleNext}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
