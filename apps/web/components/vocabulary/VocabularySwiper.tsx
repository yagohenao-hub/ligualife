import React, { useState } from 'react';
import { VocabularyWordItem, TriageStatus, saveLocalStudentWordState } from '@/lib/vocabulary';
import styles from '@/styles/Vocabulary.module.css';

interface Props {
  words: VocabularyWordItem[];
  onWordClassified?: (wordId: string, status: TriageStatus) => void;
}

export const VocabularySwiper: React.FC<Props> = ({ words, onWordClassified }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [history, setHistory] = useState<{ index: number; senseId: string; prevStatus: TriageStatus }[]>([]);

  if (words.length === 0) {
    return (
      <div className={styles.classifierArea} style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <p style={{ color: '#a1a1aa' }}>No hay palabras disponibles para este nivel con los filtros actuales.</p>
      </div>
    );
  }

  if (currentIndex >= words.length) {
    return (
      <div className={styles.classifierArea} style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f4f4f5', marginBottom: '0.5rem' }}>
          ¡Completaste la clasificación de este nivel!
        </h3>
        <p style={{ color: '#a1a1aa', maxWidth: '420px', margin: '0 auto 1.5rem', lineHeight: 1.5 }}>
          Has categorizado todas las palabras disponibles. Ahora puedes afianzar tu memoria en la <strong>Trivia</strong> o consultar tu progreso en <strong>Mi Inventario</strong>.
        </p>
        <button
          onClick={() => {
            setCurrentIndex(0);
            setShowDetails(false);
          }}
          className={styles.tabBtn}
          style={{ margin: '0 auto', background: '#10b981', color: '#042f1a', fontWeight: 800 }}
        >
          🔄 Volver a revisar palabras
        </button>
      </div>
    );
  }

  const currentItem = words[currentIndex];
  const primarySense = currentItem.senses[0];
  const progressPercent = Math.round(((currentIndex) / words.length) * 100);

  function playNativeAudio(text: string) {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.88;
      window.speechSynthesis.speak(utterance);
    }
  }

  function handleAction(status: TriageStatus) {
    if (!primarySense) return;

    // Feedback sonoro inmediato si decide aprenderla
    if (status === 'to_learn') {
      playNativeAudio(currentItem.word);
    }

    saveLocalStudentWordState(primarySense.id, status);
    if (onWordClassified) {
      onWordClassified(currentItem.id, status);
    }

    setHistory(prev => [
      ...prev,
      { index: currentIndex, senseId: primarySense.id, prevStatus: currentItem.triageStatus || 'unreviewed' }
    ]);

    setShowDetails(false);
    setCurrentIndex(prev => prev + 1);
  }

  function handleUndo() {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    saveLocalStudentWordState(last.senseId, last.prevStatus);
    setHistory(prev => prev.slice(0, -1));
    setCurrentIndex(last.index);
    setShowDetails(false);
  }

  return (
    <div className={styles.classifierArea}>
      {/* Barra de progreso */}
      <div className={styles.progressBarContainer}>
        <span>
          Palabra <strong>{currentIndex + 1}</strong> de {words.length}
        </span>
        {history.length > 0 && (
          <button
            type="button"
            onClick={handleUndo}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#c084fc',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.82rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            ↩ Deshacer anterior
          </button>
        )}
      </div>

      <div className={styles.progressBarTrack}>
        <div className={styles.progressBarFill} style={{ width: `${progressPercent}%` }} />
      </div>

      {/* Tarjeta de Estudio y Diagnóstico */}
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
              onClick={() => playNativeAudio(currentItem.word)}
              title="Escuchar pronunciación nativa"
            >
              🔊
            </button>
          </div>

          {currentItem.ipa && <div className={styles.cardIpa}>{currentItem.ipa}</div>}

          <div className={styles.senseBadge}>
            Acepción #{primarySense?.senseIndex || 1}
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
              <span>👁️ Ver traducción al español y ejemplo contextual</span>
            </button>
          ) : (
            <div className={styles.revealedBox}>
              <div className={styles.spanishTranslation}>
                💡 {primarySense?.definitionEs}
              </div>
              {primarySense?.exampleSentenceEn && (
                <div className={styles.exampleBox}>
                  <div style={{ fontWeight: 600 }}>&ldquo;{primarySense.exampleSentenceEn}&rdquo;</div>
                  <div style={{ color: '#a1a1aa', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                    {primarySense.exampleSentenceEs}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 3 Botones de Decisión Claramente Explicados (Sin arrastre) */}
      <div className={styles.decisionButtonsGrid}>
        {/* Botón 1: Ya me la sé */}
        <button
          type="button"
          className={`${styles.decisionBtn} ${styles.decisionBtnMastered}`}
          onClick={() => handleAction('mastered')}
        >
          <div className={styles.decisionBtnIcon}>✓</div>
          <div className={styles.decisionBtnTextWrap}>
            <span className={styles.decisionBtnTitle} style={{ color: '#34d399' }}>
              Ya me la sé (Dominada)
            </span>
            <span className={styles.decisionBtnDesc}>
              La conozco perfectamente y sé usarla. No se añadirá al mazo de repaso.
            </span>
          </div>
        </button>

        {/* Botón 2: Vocabulario Pasivo */}
        <button
          type="button"
          className={`${styles.decisionBtn} ${styles.decisionBtnPassive}`}
          onClick={() => handleAction('passive')}
        >
          <div className={styles.decisionBtnIcon}>👁️</div>
          <div className={styles.decisionBtnTextWrap}>
            <span className={styles.decisionBtnTitle} style={{ color: '#c084fc' }}>
              Vocabulario Pasivo (La reconozco)
            </span>
            <span className={styles.decisionBtnDesc}>
              La entiendo al leer/escuchar, pero dudo al hablar. Aparecerá en los enunciados de las preguntas para reactivarla.
            </span>
          </div>
        </button>

        {/* Botón 3: Quiero aprenderla */}
        <button
          type="button"
          className={`${styles.decisionBtn} ${styles.decisionBtnToLearn}`}
          onClick={() => handleAction('to_learn')}
        >
          <div className={styles.decisionBtnIcon}>+</div>
          <div className={styles.decisionBtnTextWrap}>
            <span className={styles.decisionBtnTitle} style={{ color: '#fbbf24' }}>
              Quiero aprenderla (Al mazo de estudio)
            </span>
            <span className={styles.decisionBtnDesc}>
              Necesito memorizarla y practicarla. Se programará en la trivia y juegos.
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};
