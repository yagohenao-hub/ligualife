import React, { useState, useEffect } from 'react';
import { X, Volume2, Square, Sparkles, CheckCircle2, AlertCircle, BookOpen, HelpCircle } from 'lucide-react';
import { VocabCategory, VOCAB_SHORT_READINGS } from '@/lib/vocabulary';
import styles from '@/styles/Vocabulary.module.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  category: VocabCategory;
  categoryTitle: string;
}

export const VocabReadingModal: React.FC<Props> = ({
  isOpen,
  onClose,
  category,
  categoryTitle
}) => {
  const reading = VOCAB_SHORT_READINGS[category] || VOCAB_SHORT_READINGS.time_words;
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showSpanish, setShowSpanish] = useState(false);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!isOpen) return null;

  function toggleAudio() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(reading.storyEn);
    utterance.lang = 'en-US';
    utterance.rate = 0.85;

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
  }

  function handleSelectOption(idx: number) {
    if (showResult) return;
    setSelectedOption(idx);
    setShowResult(true);
  }

  const isCorrect = selectedOption === reading.comprehensionQuestion.correctIndex;

  // Resaltado de palabras clave en el texto
  function renderHighlightedText(text: string, wordsToHighlight: string[]) {
    const regex = new RegExp(`\\b(${wordsToHighlight.join('|')})\\b`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, i) => {
      const isWord = wordsToHighlight.some(w => w.toLowerCase() === part.toLowerCase());
      if (isWord) {
        return (
          <span key={i} className={styles.readingWordHighlight}>
            {part}
          </span>
        );
      }
      return part;
    });
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '0.45rem', borderRadius: '10px', color: '#34d399' }}>
              <Volume2 size={20} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Short Reading en Contexto</h2>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                {categoryTitle} • {reading.wordCount} palabras
              </span>
            </div>
          </div>
          <button onClick={onClose} className={styles.modalCloseBtn} title="Cerrar modal">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.25rem', overflowY: 'auto', maxHeight: '72vh' }}>
          {/* Audio Controls Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', background: 'rgba(255,255,255,0.03)', padding: '0.65rem 1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>
                {reading.title}
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Micro-lectura de fijación natural
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setShowSpanish(prev => !prev)}
                className={styles.translationToggleBtn}
              >
                {showSpanish ? 'Ocultar ES' : 'Ver ES'}
              </button>
              <button
                onClick={toggleAudio}
                className={styles.audioPlayToggleBtn}
                style={{ background: isPlayingAudio ? '#ef4444' : '#10b981' }}
              >
                {isPlayingAudio ? <Square size={16} /> : <Volume2 size={16} />}
                <span>{isPlayingAudio ? 'Detener' : 'Escuchar Audio'}</span>
              </button>
            </div>
          </div>

          {/* Reading Paragraph */}
          <div className={styles.readingStoryBox}>
            <p style={{ margin: 0, fontSize: '1.1rem', lineHeight: 1.7, color: '#f1f5f9', fontWeight: 400 }}>
              {renderHighlightedText(reading.storyEn, reading.highlightWords)}
            </p>

            {showSpanish && (
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6, fontStyle: 'italic' }}>
                {reading.storyEs}
              </div>
            )}
          </div>

          {/* Target Words Badges */}
          <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', color: '#a1a1aa', fontWeight: 700 }}>Palabras integradas:</span>
            {reading.highlightWords.map((w, idx) => (
              <span key={idx} style={{ fontSize: '0.75rem', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', padding: '0.2rem 0.5rem', borderRadius: '6px', border: '1px solid rgba(56, 189, 248, 0.2)', fontWeight: 700 }}>
                {w}
              </span>
            ))}
          </div>

          {/* Interactive Comprehension Question */}
          <div style={{ marginTop: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '1.1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fbbf24', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              <HelpCircle size={16} />
              <span>Pregunta de Comprensión y Uso en Contexto</span>
            </div>

            <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#ffffff', margin: '0 0 0.85rem' }}>
              {reading.comprehensionQuestion.question}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {reading.comprehensionQuestion.options.map((opt, oIdx) => {
                const isSelected = selectedOption === oIdx;
                const isCorrectOption = oIdx === reading.comprehensionQuestion.correctIndex;

                let optClass = styles.readingOptionBtn;
                if (showResult) {
                  if (isCorrectOption) optClass += ` ${styles.optionCorrect}`;
                  else if (isSelected && !isCorrectOption) optClass += ` ${styles.optionWrong}`;
                }

                return (
                  <button
                    key={oIdx}
                    onClick={() => handleSelectOption(oIdx)}
                    className={optClass}
                    disabled={showResult}
                  >
                    <span>{opt}</span>
                    {showResult && isCorrectOption && <CheckCircle2 size={16} color="#34d399" />}
                    {showResult && isSelected && !isCorrectOption && <AlertCircle size={16} color="#f87171" />}
                  </button>
                );
              })}
            </div>

            {showResult && (
              <div style={{ marginTop: '0.85rem', padding: '0.7rem 0.9rem', borderRadius: '8px', background: isCorrect ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)', border: `1px solid ${isCorrect ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}` }}>
                <p style={{ margin: 0, fontSize: '0.88rem', color: isCorrect ? '#34d399' : '#f87171', fontWeight: 700 }}>
                  {isCorrect ? '¡Correcto!' : 'Respuesta a reforzar:'}
                </p>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: '#cbd5e1' }}>
                  {reading.comprehensionQuestion.explanation}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          <button onClick={onClose} className={styles.modalNavBtn} style={{ background: '#3b82f6', color: '#ffffff', fontWeight: 800 }}>
            Cerrar Lectura
          </button>
        </div>
      </div>
    </div>
  );
};
