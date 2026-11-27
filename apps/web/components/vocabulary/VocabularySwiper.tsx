import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Shuffle, Volume2 } from 'lucide-react';
import { VocabularyWordItem } from '@/lib/vocabulary';
import styles from '@/styles/Vocabulary.module.css';

interface Props {
  words: VocabularyWordItem[];
}

export const VocabularySwiper: React.FC<Props> = ({ words }) => {
  const [deck, setDeck] = useState<VocabularyWordItem[]>(words);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  const deckKey = useMemo(() => `${words.length}-${words[0]?.id || ''}`, [words]);
  useEffect(() => {
    setDeck(words);
    setCurrentIndex(0);
    setShowDetails(false);
  }, [deckKey, words]);

  if (deck.length === 0) {
    return (
      <div className={styles.classifierArea} style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <p style={{ color: 'var(--text-secondary)' }}>No hay tarjetas disponibles para esta selección.</p>
      </div>
    );
  }

  const safeIdx = Math.min(currentIndex, deck.length - 1);
  const currentItem = deck[safeIdx];
  const primarySense = currentItem.senses[0];
  const progressPercent = Math.round(((safeIdx + 1) / deck.length) * 100);

  function playNativeAudio(text: string) {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.88;
      window.speechSynthesis.speak(utterance);
    }
  }

  function handlePrev() {
    setShowDetails(false);
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : deck.length - 1));
  }

  function handleNext() {
    setShowDetails(false);
    setCurrentIndex(prev => (prev + 1 < deck.length ? prev + 1 : 0));
  }

  function handleShuffleRandom() {
    const randomIdx = Math.floor(Math.random() * deck.length);
    setShowDetails(false);
    setCurrentIndex(randomIdx);
    playNativeAudio(deck[randomIdx].word.split('/')[0].trim());
  }

  return (
    <div className={styles.classifierArea}>
      {/* Barra de progreso */}
      <div className={styles.progressBarContainer}>
        <span>
          Tarjeta <strong>{safeIdx + 1}</strong> de {deck.length}
        </span>
        <button
          type="button"
          onClick={handleShuffleRandom}
          style={{
            background: 'rgba(26, 193, 231, 0.14)',
            border: '1px solid rgba(26, 193, 231, 0.35)',
            borderRadius: '999px',
            color: 'var(--brand-cyan, #1AC1E7)',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: '0.78rem',
            padding: '0.28rem 0.75rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}
        >
          <Shuffle size={13} /> Saltar a palabra aleatoria
        </button>
      </div>

      <div className={styles.progressBarTrack}>
        <div className={styles.progressBarFill} style={{ width: `${progressPercent}%` }} />
      </div>

      {/* Tarjeta de Estudio */}
      <div className={styles.studyCard}>
        <div className={styles.cardTopRow}>
          <span className={styles.levelTag}>
            Nivel {primarySense?.cefrLevelTarget || currentItem.cefrLevel}
          </span>
          <span className={styles.posTag}>
            {primarySense?.partOfSpeech || currentItem.partOfSpeech}
          </span>
        </div>

        <div className={styles.cardMainBody}>
          <div className={styles.cardWord}>
            <span>{currentItem.word}</span>
            <button
              type="button"
              className={styles.audioBtn}
              onClick={() => playNativeAudio(currentItem.word.split('/')[0].trim())}
              title="Escuchar pronunciación nativa"
            >
              <Volume2 size={18} />
            </button>
          </div>

          {currentItem.ipa && <div className={styles.cardIpa}>{currentItem.ipa}</div>}

          <div className={styles.senseBadge}>
            {currentItem.senses.length > 1
              ? `${currentItem.senses.length} acepciones disponibles`
              : `Acepción #${primarySense?.senseIndex || 1}`}
          </div>

          <p className={styles.definitionText}>
            {primarySense?.definitionEn}
          </p>

          {!showDetails ? (
            <button
              type="button"
              className={styles.revealDetailsBtn}
              onClick={() => setShowDetails(true)}
            >
              <span>👁️ Ver traducción al español y ejemplos reales</span>
            </button>
          ) : (
            <div className={styles.revealedBox}>
              {currentItem.senses.map((s, idx) => (
                <div key={s.id || idx} style={{ marginBottom: idx + 1 < currentItem.senses.length ? '0.9rem' : 0 }}>
                  {currentItem.senses.length > 1 && (
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--brand-purple, #8C31C5)', marginBottom: '0.2rem' }}>
                      Acepción #{s.senseIndex} ({s.partOfSpeech})
                    </div>
                  )}
                  <div className={styles.spanishTranslation}>
                    💡 {s.definitionEs}
                  </div>
                  {s.exampleSentenceEn && (
                    <div className={styles.exampleBox}>
                      <div style={{ fontWeight: 600 }}>&ldquo;{s.exampleSentenceEn}&rdquo;</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                        {s.exampleSentenceEs}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Navegación limpia de Tarjetas */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          gap: '0.75rem',
          width: '100%'
        }}
      >
        <button
          type="button"
          onClick={handlePrev}
          className={styles.tabBtn}
          style={{ justifyContent: 'center' }}
        >
          <ChevronLeft size={17} /> Anterior
        </button>
        <button
          type="button"
          onClick={() => playNativeAudio(primarySense?.exampleSentenceEn || currentItem.word)}
          className={styles.tabBtn}
          style={{
            background: 'rgba(140, 49, 197, 0.14)',
            borderColor: 'rgba(140, 49, 197, 0.4)',
            color: 'var(--brand-purple, #8C31C5)'
          }}
          title="Escuchar oración de ejemplo"
        >
          <Volume2 size={17} /> Escuchar frase
        </button>
        <button
          type="button"
          onClick={handleNext}
          className={styles.tabBtn}
          style={{
            justifyContent: 'center',
            background: 'var(--brand-cyan, #1AC1E7)',
            color: '#090C10',
            borderColor: 'transparent',
            fontWeight: 800
          }}
        >
          Siguiente <ChevronRight size={17} />
        </button>
      </div>
    </div>
  );
};
