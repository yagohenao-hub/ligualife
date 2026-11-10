import React, { useState } from 'react';
import { VocabularyWordItem, TriageStatus, saveLocalStudentWordState, VocabularySense } from '@/lib/vocabulary';
import styles from '@/styles/Vocabulary.module.css';

interface Props {
  words: VocabularyWordItem[];
  onStatusChanged?: (wordId: string, newStatus: TriageStatus) => void;
}

export const VocabularyGridManager: React.FC<Props> = ({ words, onStatusChanged }) => {
  const [filter, setFilter] = useState<'all' | TriageStatus>('all');
  const [inspectSense, setInspectSense] = useState<VocabularySense | null>(null);
  const [localStates, setLocalStates] = useState<Record<string, TriageStatus>>(() => {
    const map: Record<string, TriageStatus> = {};
    words.forEach(w => {
      const sense = w.senses[0];
      if (sense) map[w.id] = w.triageStatus || 'unreviewed';
    });
    return map;
  });

  const nextStatusCycle: Record<TriageStatus, TriageStatus> = {
    unreviewed: 'to_learn',
    to_learn: 'passive',
    passive: 'mastered',
    mastered: 'unreviewed'
  };

  function handleCycleStatus(item: VocabularyWordItem) {
    const primarySense = item.senses[0];
    if (!primarySense) return;

    const current = localStates[item.id] || 'unreviewed';
    const next = nextStatusCycle[current];

    setLocalStates(prev => ({ ...prev, [item.id]: next }));
    saveLocalStudentWordState(primarySense.id, next);

    if (onStatusChanged) {
      onStatusChanged(item.id, next);
    }
  }

  // Conteos
  const counts = {
    all: words.length,
    to_learn: words.filter(w => (localStates[w.id] || w.triageStatus) === 'to_learn').length,
    passive: words.filter(w => (localStates[w.id] || w.triageStatus) === 'passive').length,
    mastered: words.filter(w => (localStates[w.id] || w.triageStatus) === 'mastered').length,
    unreviewed: words.filter(w => (localStates[w.id] || w.triageStatus) === 'unreviewed').length
  };

  const filteredWords = words.filter(w => {
    if (filter === 'all') return true;
    return (localStates[w.id] || w.triageStatus || 'unreviewed') === filter;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div className={styles.filterPills}>
          <button
            onClick={() => setFilter('all')}
            className={`${styles.filterBtn} ${filter === 'all' ? styles.filterBtnActive : ''}`}
          >
            Todas ({counts.all})
          </button>
          <button
            onClick={() => setFilter('to_learn')}
            className={`${styles.filterBtn} ${filter === 'to_learn' ? styles.filterBtnActive : ''}`}
            style={{ color: '#fbbf24' }}
          >
            🟠 Por Aprender ({counts.to_learn})
          </button>
          <button
            onClick={() => setFilter('passive')}
            className={`${styles.filterBtn} ${filter === 'passive' ? styles.filterBtnActive : ''}`}
            style={{ color: '#c084fc' }}
          >
            🟣 Vocabulario Pasivo ({counts.passive})
          </button>
          <button
            onClick={() => setFilter('mastered')}
            className={`${styles.filterBtn} ${filter === 'mastered' ? styles.filterBtnActive : ''}`}
            style={{ color: '#34d399' }}
          >
            🟢 Dominadas ({counts.mastered})
          </button>
          <button
            onClick={() => setFilter('unreviewed')}
            className={`${styles.filterBtn} ${filter === 'unreviewed' ? styles.filterBtnActive : ''}`}
          >
            ⚪ Sin Clasificar ({counts.unreviewed})
          </button>
        </div>

        <span style={{ fontSize: '0.8rem', color: '#71717a' }}>
          💡 Haz click en cualquier palabra para rotar su estado directamente.
        </span>
      </div>

      <div className={styles.gridMatrix}>
        {filteredWords.map(item => {
          const status = localStates[item.id] || item.triageStatus || 'unreviewed';
          const primarySense = item.senses[0];

          let chipClass = '';
          let statusLabel = 'Sin clasificar';
          let statusColor = '#71717a';

          if (status === 'mastered') {
            chipClass = styles.chipMastered;
            statusLabel = 'Dominada';
            statusColor = '#10b981';
          } else if (status === 'to_learn') {
            chipClass = styles.chipToLearn;
            statusLabel = 'Por aprender';
            statusColor = '#f59e0b';
          } else if (status === 'passive') {
            chipClass = styles.chipPassive;
            statusLabel = 'Pasiva';
            statusColor = '#a855f7';
          }

          return (
            <div
              key={item.id}
              className={`${styles.wordChip} ${chipClass}`}
              onClick={() => handleCycleStatus(item)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span className={styles.chipWord}>{item.word}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (primarySense) setInspectSense(primarySense);
                  }}
                  style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer', padding: '0 2px', fontSize: '0.85rem' }}
                  title="Ver acepciones y detalles"
                >
                  ℹ️
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={styles.chipStatus} style={{ color: statusColor }}>
                  {statusLabel}
                </span>
                {item.senses.length > 1 && (
                  <span style={{ fontSize: '0.65rem', background: 'rgba(255, 255, 255, 0.08)', padding: '0.1rem 0.35rem', borderRadius: '4px', color: '#cbd5e1' }}>
                    {item.senses.length} acep.
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Detalle */}
      {inspectSense && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
          padding: '1rem'
        }} onClick={() => setInspectSense(null)}>
          <div style={{
            background: '#18181b',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '20px',
            padding: '2rem',
            maxWidth: '500px',
            width: '100%',
            color: '#fff'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>
                  {inspectSense.word}
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>
                  {inspectSense.partOfSpeech} • {inspectSense.cefrLevelTarget}
                </span>
              </div>
              <button
                onClick={() => setInspectSense(null)}
                style={{ background: 'transparent', border: 'none', color: '#a1a1aa', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.9rem', color: '#c4b5fd', fontWeight: 600, marginBottom: '0.2rem' }}>
                Acepción #{inspectSense.senseIndex}:
              </div>
              <p style={{ margin: 0, color: '#e4e4e7', lineHeight: 1.45 }}>
                {inspectSense.definitionEn}
              </p>
              <div style={{ marginTop: '0.4rem', color: '#34d399', fontSize: '0.9rem' }}>
                💡 {inspectSense.definitionEs}
              </div>
            </div>

            {inspectSense.exampleSentenceEn && (
              <div className={styles.cardExample} style={{ marginBottom: '1.5rem' }}>
                <div>&ldquo;{inspectSense.exampleSentenceEn}&rdquo;</div>
                <div style={{ color: '#a1a1aa', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                  {inspectSense.exampleSentenceEs}
                </div>
              </div>
            )}

            <button
              onClick={() => setInspectSense(null)}
              className={styles.tabBtn}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
