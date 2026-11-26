import React, { useState, useEffect } from 'react';
import { X, Zap, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import {
  VocabCategory,
  CefrLevel,
  VocabularyWordItem,
  VocabMentalGymExercise,
  getVocabMentalGymExercises
} from '@/lib/vocabulary';
import { soundEngine } from '@/lib/sound-effects';
import styles from '@/styles/Vocabulary.module.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  category: VocabCategory;
  categoryTitle: string;
  level?: CefrLevel;
  words?: VocabularyWordItem[];
}

export const VocabRepasoModal: React.FC<Props> = ({
  isOpen,
  onClose,
  category,
  categoryTitle,
  level = 'A1',
  words
}) => {
  const exercises = getVocabMentalGymExercises(category, level, words);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checkedResults, setCheckedResults] = useState<Record<number, boolean>>({});
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    setAnswers({});
    setCheckedResults({});
    setShowSummary(false);
  }, [category, level]);

  if (!isOpen) return null;

  function handleInputChange(id: number, val: string) {
    setAnswers(prev => ({ ...prev, [id]: val }));
  }

  function handleCheckItem(ex: VocabMentalGymExercise) {
    const raw = (answers[ex.id] || '').trim().toLowerCase();
    const cleanSol = ex.solution.toLowerCase().replace(/[.?!,]/g, '').trim();
    const cleanUser = raw.replace(/[.?!,]/g, '').trim();

    const isMatch = cleanUser === cleanSol ||
      cleanUser.includes(cleanSol) ||
      (ex.type === 'fill' && cleanUser === cleanSol.split(' ')[0]);

    if (isMatch) {
      soundEngine.playRewardChime();
    }
    setCheckedResults(prev => ({ ...prev, [ex.id]: isMatch }));
  }

  function handleReset() {
    setAnswers({});
    setCheckedResults({});
    setShowSummary(false);
  }

  const answeredCount = Object.keys(checkedResults).length;
  const correctCount = Object.values(checkedResults).filter(Boolean).length;
  const progressPercent = Math.round((answeredCount / exercises.length) * 100);

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ background: 'rgba(234, 179, 8, 0.15)', padding: '0.45rem', borderRadius: '10px', color: '#facc15' }}>
              <Zap size={20} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Gimnasio Mental de Repaso</h2>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                {categoryTitle} • 15 ejercicios intensivos
              </span>
            </div>
          </div>
          <button onClick={onClose} className={styles.modalCloseBtn} title="Cerrar modal">
            <X size={18} />
          </button>
        </div>

        {/* Progress Bar */}
        <div style={{ padding: '0.75rem 1.25rem', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--surface-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
            <span>Progreso de verificación: {answeredCount} de {exercises.length} resueltos</span>
            <span style={{ fontWeight: 700, color: 'var(--brand-cyan, #1AC1E7)' }}>{correctCount} Aciertos</span>
          </div>
          <div style={{ height: '6px', background: 'var(--surface-border)', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{ width: `${progressPercent}%`, height: '100%', background: 'var(--accent-green, #34D399)', transition: 'width 0.3s ease' }} />
          </div>
        </div>

        {/* Exercises Scroll Container */}
        <div className={styles.repasoListScroll}>
          {exercises.map((ex, idx) => {
            const isChecked = checkedResults[ex.id] !== undefined;
            const isCorrect = checkedResults[ex.id] === true;
            const userVal = answers[ex.id] || '';

            return (
              <div key={ex.id} className={styles.repasoItemBox}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: ex.type === 'fill' ? 'var(--brand-cyan, #1AC1E7)' : ex.type === 'trap' ? 'var(--brand-pink, #FF5076)' : 'var(--brand-purple, #8C31C5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    #{idx + 1} • {ex.type === 'fill' ? 'Fill the Pattern' : ex.type === 'trap' ? 'Spot the Trap' : 'Reverse Sprint'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Pista: {ex.hint}
                  </span>
                </div>

                <p style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {ex.instruction}
                </p>

                <p style={{ margin: '0 0 0.75rem', fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', background: 'var(--surface-1)', padding: '0.6rem 0.8rem', borderRadius: '8px', borderLeft: '3px solid var(--brand-cyan, #1AC1E7)' }}>
                  {ex.promptText}
                </p>

                {/* Input & Check Button */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    value={userVal}
                    placeholder="Escribe tu respuesta aquí..."
                    onChange={e => handleInputChange(ex.id, e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleCheckItem(ex);
                    }}
                    className={styles.repasoInput}
                    disabled={isChecked && isCorrect}
                  />
                  <button
                    onClick={() => handleCheckItem(ex)}
                    className={styles.repasoCheckBtn}
                    disabled={!userVal.trim()}
                  >
                    Verificar
                  </button>
                </div>

                {/* Feedback Box */}
                {isChecked && (
                  <div style={{ marginTop: '0.65rem', padding: '0.6rem 0.8rem', borderRadius: '8px', background: isCorrect ? 'rgba(52, 211, 153, 0.12)' : 'rgba(255, 80, 118, 0.12)', border: `1px solid ${isCorrect ? 'rgba(52, 211, 153, 0.35)' : 'rgba(255, 80, 118, 0.35)'}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: isCorrect ? 'var(--accent-green, #34D399)' : 'var(--brand-pink, #FF5076)', fontWeight: 700, fontSize: '0.85rem' }}>
                      {isCorrect ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                      <span>{isCorrect ? '¡Excelente acierto!' : `Solución esperada: "${ex.solution}"`}</span>
                    </div>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      💡 {ex.explanation}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          <button onClick={handleReset} className={styles.modalNavBtn} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <RefreshCw size={14} /> Reiniciar sesión
          </button>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Aciertos: {correctCount} / {exercises.length}
          </span>
          <button onClick={onClose} className={styles.modalNavBtn} style={{ background: 'var(--brand-cyan, #1AC1E7)', color: '#090C10', borderColor: 'transparent', fontWeight: 800 }}>
            Completar Repaso
          </button>
        </div>
      </div>
    </div>
  );
};
