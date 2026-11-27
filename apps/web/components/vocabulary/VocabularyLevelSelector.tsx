import React from 'react';
import { CefrLevel } from '@/lib/vocabulary';
import styles from '@/styles/Vocabulary.module.css';

interface Props {
  selectedLevel: CefrLevel;
  onSelectLevel: (lvl: CefrLevel) => void;
  wordCount?: number;
}

const CEFR_LEVELS: CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export const VocabularyLevelSelector: React.FC<Props> = ({
  selectedLevel,
  onSelectLevel,
  wordCount
}) => {
  return (
    <div className={styles.headerBar}>
      <div className={styles.levelSelectorTop}>
        <div className={styles.levelSelectorLabel}>
          <span>🎯 Nivel MCER:</span>
          <span
            style={{
              fontSize: '0.76rem',
              color: 'var(--brand-cyan, #1AC1E7)',
              fontWeight: 800,
              background: 'rgba(26, 193, 231, 0.12)',
              padding: '0.15rem 0.55rem',
              borderRadius: '999px'
            }}
          >
            {selectedLevel}
            {typeof wordCount === 'number' && wordCount > 0 ? ` • ${wordCount} palabras` : ''}
          </span>
        </div>

        <div className={styles.levelPills}>
          {CEFR_LEVELS.map(lvl => (
            <button
              key={lvl}
              type="button"
              onClick={() => onSelectLevel(lvl)}
              className={`${styles.levelBtn} ${selectedLevel === lvl ? styles.levelBtnActive : ''}`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
