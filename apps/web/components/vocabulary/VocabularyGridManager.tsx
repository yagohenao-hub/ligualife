import React, { useState, useEffect } from 'react';
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
      if (w.senses[0]) map[w.id] = w.triageStatus || 'unreviewed';
    });
    return map;
  });

  useEffect(() => {
    const map: Record<string, TriageStatus> = {};
    words.forEach(w => {
      map[w.id] = w.triageStatus || 'unreviewed';
    });
    setLocalStates(map);
  }, [words]);

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
            type="button"
            onClick={() => setFilter('all')}
            className={`${styles.filterBtn} ${filter === 'all' ? styles.filterBtnActive : ''}`}
          >
            Todas ({counts.all})
          </button>
          <button
            type="button"
            onClick={() => setFilter('to_learn')}
            className={`${styles.filterBtn} ${filter === 'to_learn' ? styles.filterBtnActive : ''}`}
            style={{ color: 'var(--brand-yellow, #FDBA3B)' }}
          >
            🟠 Por Aprender ({counts.to_learn})
          </button>
          <button
            type="button"
            onClick={() => setFilter('passive')}
            className={`${styles.filterBtn} ${filter === 'passive' ? styles.filterBtnActive : ''}`}
            style={{ color: 'var(--brand-purple, #8C31C5)' }}
          >
            🟣 Pasivas ({counts.passive})
          </button>
          <button
            type="button"
            onClick={() => setFilter('mastered')}
            className={`${styles.filterBtn} ${filter === 'mastered' ? styles.filterBtnActive : ''}`}
            style={{ color: 'var(--accent-green, #34D399)' }}
          >
            🟢 Dominadas ({counts.mastered})
          </button>
          <button
            type="button"
            onClick={() => setFilter('unreviewed')}
            className={`${styles.filterBtn} ${filter === 'unreviewed' ? styles.filterBtnActive : ''}`}
          >
            ⚪ Sin Clasificar ({counts.unreviewed})
          </button>
        </div>

        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          💡 Haz clic en una tarjeta para rotar su estado.
        </span>
      </div>

      <div className={styles.gridMatrix}>
        {filteredWords.map(item => {
          const status = localStates[item.id] || item.triageStatus || 'unreviewed';
          const primarySense = item.senses[0];

          let chipClass = '';
          let statusLabel = 'Sin clasificar';
          let statusColor = 'var(--text-muted, #64748b)';

          if (status === 'mastered') {
            chipClass = styles.chipMastered;
            statusLabel = 'Dominada';
            statusColor = 'var(--accent-green, #34D399)';
          } else if (status === 'to_learn') {
            chipClass = styles.chipToLearn;
            statusLabel = 'Por aprender';
            statusColor = 'var(--brand-yellow, #FDBA3B)';
          } else if (status === 'passive') {
            chipClass = styles.chipPassive;
            statusLabel = 'Pasiva';
            statusColor = 'var(--brand-purple, #8C31C5)';
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
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (primarySense) setInspectSense(primarySense);
                  }}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0 2px', fontSize: '0.85rem' }}
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
                  <span style={{ fontSize: '0.65rem', background: 'var(--bg-hover, rgba(255, 255, 255, 0.08))', padding: '0.1rem 0.35rem', borderRadius: '4px', color: 'var(--text-secondary)' }}>
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
          background: 'rgba(6, 9, 17, 0.72)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
          padding: '1rem'
        }} onClick={() => setInspectSense(null)}>
          <div style={{
            background: 'var(--surface-elevated, var(--bg-card))',
            border: '1px solid var(--surface-border)',
            boxShadow: 'var(--clay)',
            borderRadius: '20px',
            padding: '1.85rem',
            maxWidth: '500px',
            width: '100%',
            color: 'var(--text-primary)'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.55rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  {inspectSense.word}
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {inspectSense.partOfSpeech} • {inspectSense.cefrLevelTarget}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setInspectSense(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--brand-purple, #8C31C5)', fontWeight: 700, marginBottom: '0.2rem' }}>
                Acepción #{inspectSense.senseIndex}:
              </div>
              <p style={{ margin: 0, color: 'var(--text-primary)', lineHeight: 1.45 }}>
                {inspectSense.definitionEn}
              </p>
              <div style={{ marginTop: '0.45rem', color: 'var(--accent-green, #34D399)', fontSize: '0.92rem', fontWeight: 600 }}>
                💡 {inspectSense.definitionEs}
              </div>
            </div>

            {inspectSense.exampleSentenceEn && (
              <div className={styles.cardExample} style={{ marginBottom: '1.35rem' }}>
                <div>&ldquo;{inspectSense.exampleSentenceEn}&rdquo;</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '0.25rem' }}>
                  {inspectSense.exampleSentenceEs}
                </div>
              </div>
            )}

            <button
              type="button"
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
