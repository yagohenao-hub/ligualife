import React from 'react';
import { CefrLevel } from '@/lib/vocabulary';
import styles from '@/styles/Vocabulary.module.css';

interface Props {
  selectedLevel: CefrLevel;
  onSelectLevel: (lvl: CefrLevel) => void;
  includePreviousPending: boolean;
  onTogglePreviousPending: (val: boolean) => void;
}

const CEFR_LEVELS: CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export const VocabularyLevelSelector: React.FC<Props> = ({
  selectedLevel,
  onSelectLevel,
  includePreviousPending,
  onTogglePreviousPending
}) => {
  return (
    <div className={styles.headerBar}>
      <div className={styles.levelSelectorTop}>
        <div className={styles.levelSelectorLabel}>
          <span>🎯 Selecciona tu nivel CEFR:</span>
          <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 700 }}>
            Nivel activo: {selectedLevel}
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

      <div
        className={styles.switchContainer}
        onClick={() => onTogglePreviousPending(!includePreviousPending)}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
          <span style={{ fontWeight: 600, color: '#f4f4f5' }}>
            Incluir palabras pendientes de niveles anteriores
          </span>
          <span style={{ fontSize: '0.74rem', color: '#a1a1aa' }}>
            {includePreviousPending
              ? 'Activado: Estudiarás también lo pendiente de niveles previos'
              : 'Desactivado: Estudiarás solo palabras exclusivas de este nivel'}
          </span>
        </div>

        <div className={`${styles.toggleSwitch} ${includePreviousPending ? styles.toggleSwitchActive : ''}`}>
          <div className={styles.toggleHandle} />
        </div>
      </div>
    </div>
  );
};
