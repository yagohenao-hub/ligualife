import React, { useState, useEffect, useCallback } from 'react';
import {
  VocabularyWordItem,
  VocabCategory,
  CefrLevel,
  getVocabularyByCategory
} from '@/lib/vocabulary';
import { soundEngine } from '@/lib/sound-effects';
import styles from '@/styles/Vocabulary.module.css';

interface Props {
  words: VocabularyWordItem[];
  category?: VocabCategory;
  level?: CefrLevel;
}

interface PairItem {
  id: string;
  word: string;
  pairId: string;
  relationType: 'synonym' | 'antonym';
  matched: boolean;
}

type LinkMode = 'synonym' | 'antonym';

export const SpeedLinker: React.FC<Props> = ({
  words,
  category = 'time_words',
  level = 'A1'
}) => {
  const [linkMode, setLinkMode] = useState<LinkMode>('synonym');
  const [timeLeft, setTimeLeft] = useState(45);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [selectedFirst, setSelectedFirst] = useState<PairItem | null>(null);
  const [errorPairIds, setErrorPairIds] = useState<string[]>([]);
  const [cards, setCards] = useState<PairItem[]>([]);

  // Pares de respaldo limpios (cero paréntesis ni pistas reveladoras)
  const CLEAN_FALLBACKS: Record<LinkMode, { word1: string; word2: string }[]> = {
    synonym: [
      { word1: 'run', word2: 'manage' },
      { word1: 'book', word2: 'reserve' },
      { word1: 'kind', word2: 'friendly' },
      { word1: 'safe', word2: 'secure' },
      { word1: 'cool', word2: 'awesome' },
      { word1: 'right', word2: 'correct' }
    ],
    antonym: [
      { word1: 'run', word2: 'walk' },
      { word1: 'book', word2: 'cancel' },
      { word1: 'kind', word2: 'mean' },
      { word1: 'light', word2: 'heavy' },
      { word1: 'safe', word2: 'dangerous' },
      { word1: 'cool', word2: 'warm' }
    ]
  };

  const buildDynamicPairs = useCallback(
    (mode: LinkMode): { word1: string; word2: string; type: LinkMode }[] => {
      const pairs: { word1: string; word2: string; type: LinkMode }[] = [];
      const seenPairKeys = new Set<string>();
      const usedTokens = new Set<string>();

      // Combinar palabras activas si el pool actual es muy pequeño
      const primaryPool = [...words].sort(() => Math.random() - 0.5);
      const extendedPool =
        primaryPool.length < 4
          ? [
            ...primaryPool,
            ...getVocabularyByCategory(category, level)
              .filter(ext => !primaryPool.some(p => p.id === ext.id))
              .sort(() => Math.random() - 0.5)
          ]
          : primaryPool;

      for (const w of extendedPool) {
        if (pairs.length >= 6) break;
        const leftClean = w.word.replace(/\s*\([^)]*\)/g, '').trim();
        const leftKey = leftClean.toLowerCase();
        if (!leftClean || usedTokens.has(leftKey)) continue;

        const matchingRels = (w.relations || [])
          .filter(rel => rel.relationType === mode)
          .sort(() => Math.random() - 0.5);

        for (const rel of matchingRels) {
          const rightClean = (rel.targetWord || '').replace(/\s*\([^)]*\)/g, '').trim();
          const rightKey = rightClean.toLowerCase();
          const pairKey = [leftKey, rightKey].sort().join('|');

          if (
            rightClean &&
            leftKey !== rightKey &&
            !usedTokens.has(rightKey) &&
            !seenPairKeys.has(pairKey)
          ) {
            seenPairKeys.add(pairKey);
            usedTokens.add(leftKey);
            usedTokens.add(rightKey);
            pairs.push({ word1: leftClean, word2: rightClean, type: mode });
            break; // Una relación limpia por tarjeta fuente para evitar colisiones
          }
        }
      }

      if (pairs.length >= 6) return pairs;

      // Si el módulo tiene entre 1 y 5 pares válidos, completamos el tablero hasta 6 con pares limpios sin colisiones
      const padded = [...pairs];
      for (const f of CLEAN_FALLBACKS[mode]) {
        if (padded.length >= 6) break;
        const k1 = f.word1.toLowerCase();
        const k2 = f.word2.toLowerCase();
        if (!usedTokens.has(k1) && !usedTokens.has(k2)) {
          usedTokens.add(k1);
          usedTokens.add(k2);
          padded.push({ word1: f.word1, word2: f.word2, type: mode });
        }
      }
      return padded;
    },
    [words, category, level]
  );

  function startGame(overrideMode?: LinkMode) {
    const activeMode = overrideMode || linkMode;
    const chosenPairs = buildDynamicPairs(activeMode);
    const list: PairItem[] = [];
    chosenPairs.forEach((p, idx) => {
      const pairKey = `pair-${idx}`;
      list.push({
        id: `${pairKey}-a`,
        word: p.word1,
        pairId: pairKey,
        relationType: p.type,
        matched: false
      });
      list.push({
        id: `${pairKey}-b`,
        word: p.word2,
        pairId: pairKey,
        relationType: p.type,
        matched: false
      });
    });

    setCards(list.sort(() => Math.random() - 0.5));
    setTimeLeft(45);
    setScore(0);
    setCombo(0);
    setSelectedFirst(null);
    setErrorPairIds([]);
    setIsPlaying(true);
  }

  function handleModeSwitch(nextMode: LinkMode) {
    if (nextMode === linkMode) return;
    setLinkMode(nextMode);
    setIsPlaying(false);
    setCards([]);
    setSelectedFirst(null);
    setErrorPairIds([]);
    setScore(0);
    setCombo(0);
    setTimeLeft(45);
  }

  useEffect(() => {
    setIsPlaying(false);
    setCards([]);
    setSelectedFirst(null);
    setErrorPairIds([]);
  }, [words]);

  useEffect(() => {
    if (!isPlaying) return;
    if (timeLeft <= 0) {
      setIsPlaying(false);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, timeLeft]);

  function handleCardClick(item: PairItem) {
    if (!isPlaying || item.matched) return;

    if (!selectedFirst) {
      setErrorPairIds([]);
      setSelectedFirst(item);
      return;
    }

    if (selectedFirst.id === item.id) {
      setSelectedFirst(null);
      return;
    }

    if (selectedFirst.pairId === item.pairId) {
      soundEngine.playRewardChime();
      setCards(prev => prev.map(c => (c.pairId === item.pairId ? { ...c, matched: true } : c)));
      setScore(s => s + 10 + combo * 2);
      setCombo(c => c + 1);
      setSelectedFirst(null);
      setErrorPairIds([]);
    } else {
      setCombo(0);
      setErrorPairIds([selectedFirst.id, item.id]);
      setSelectedFirst(null);
      setTimeout(() => setErrorPairIds([]), 420);
    }
  }

  const allMatched = cards.length > 0 && cards.every(c => c.matched);
  const modeAccent = linkMode === 'synonym' ? 'var(--brand-cyan, #1AC1E7)' : 'var(--brand-pink, #FF5076)';

  return (
    <div className={styles.triviaCard}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.25rem'
        }}
      >
        <div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
            ⚡ Conector Semántico
          </h3>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            {linkMode === 'synonym'
              ? 'Encuentra cada palabra con su sinónimo equivalente sin pistas.'
              : 'Encuentra cada palabra con su antónimo u opuesto directo.'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Switch exclusivo Sinónimos / Antónimos */}
          <div
            role="group"
            aria-label="Modo de conexión"
            style={{
              display: 'inline-flex',
              padding: '4px',
              borderRadius: '12px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--surface-border)',
              gap: '4px'
            }}
          >
            <button
              type="button"
              onClick={() => handleModeSwitch('synonym')}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '9px',
                border: 'none',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: linkMode === 'synonym' ? 'var(--brand-cyan, #1AC1E7)' : 'transparent',
                color: linkMode === 'synonym' ? '#090C10' : 'var(--text-secondary)'
              }}
            >
              🔗 Sinónimos
            </button>
            <button
              type="button"
              onClick={() => handleModeSwitch('antonym')}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '9px',
                border: 'none',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: linkMode === 'antonym' ? 'var(--brand-pink, #FF5076)' : 'transparent',
                color: linkMode === 'antonym' ? '#ffffff' : 'var(--text-secondary)'
              }}
            >
              ⚡ Antónimos
            </button>
          </div>

          <div
            style={{
              fontSize: '1.05rem',
              fontWeight: 800,
              color: timeLeft < 10 ? 'var(--brand-pink, #FF5076)' : 'var(--brand-yellow, #FDBA3B)'
            }}
          >
            ⏱ {timeLeft}s
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--accent-green, #34D399)' }}>
            ★ {score} pts
          </div>
        </div>
      </div>

      {!isPlaying && !allMatched && (
        <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
          <div style={{ fontSize: '2.6rem', marginBottom: '0.75rem' }}>
            {linkMode === 'synonym' ? '🔗' : '⚖️'}
          </div>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '450px', margin: '0 auto 1.35rem', lineHeight: 1.55, fontSize: '0.94rem' }}>
            {linkMode === 'synonym'
              ? 'Modo Sinónimos activo: conecta pares con significado equivalente sin pistas entre paréntesis.'
              : 'Modo Antónimos activo: conecta cada término con su significado opuesto antes de que termine el tiempo.'}
          </p>
          <button
            type="button"
            onClick={() => startGame(linkMode)}
            className={styles.tabBtn}
            style={{
              margin: '0 auto',
              background: modeAccent,
              color: linkMode === 'synonym' ? '#090C10' : '#ffffff',
              borderColor: 'transparent',
              fontSize: '0.95rem',
              fontWeight: 800,
              padding: '0.75rem 1.8rem'
            }}
          >
            ▶ Comenzar ({linkMode === 'synonym' ? 'Sinónimos' : 'Antónimos'} • 45s)
          </button>
        </div>
      )}

      {(isPlaying || allMatched) && (
        <>
          {allMatched ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '2.8rem', marginBottom: '0.5rem' }}>🌟</div>
              <h4 style={{ fontSize: '1.25rem', color: 'var(--accent-green, #34D399)', fontWeight: 800 }}>
                ¡Excelente! Despejaste toda la red de {linkMode === 'synonym' ? 'sinónimos' : 'antónimos'}
              </h4>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.35rem' }}>
                Puntaje obtenido: <strong style={{ color: 'var(--text-primary)' }}>{score} puntos</strong>
              </p>
              <button type="button" onClick={() => startGame(linkMode)} className={styles.tabBtn} style={{ margin: '0 auto' }}>
                🔄 Jugar otra ronda
              </button>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: '0.75rem'
              }}
            >
              {cards.map(item => {
                const isSelected = selectedFirst?.id === item.id;
                const isWrong = errorPairIds.includes(item.id);
                let bg = 'var(--surface-elevated, var(--bg-card))';
                let border = 'var(--surface-border)';
                let textColor = 'var(--text-primary)';
                let opacity = 1;

                if (item.matched) {
                  bg = 'rgba(52, 211, 153, 0.16)';
                  border = 'var(--accent-green, #34D399)';
                  textColor = 'var(--accent-green, #34D399)';
                  opacity = 0.42;
                } else if (isWrong) {
                  bg = 'rgba(255, 80, 118, 0.18)';
                  border = 'var(--brand-pink, #FF5076)';
                } else if (isSelected) {
                  bg = linkMode === 'synonym' ? 'rgba(26, 193, 231, 0.2)' : 'rgba(255, 80, 118, 0.2)';
                  border = modeAccent;
                }

                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={item.matched}
                    onClick={() => handleCardClick(item)}
                    style={{
                      background: bg,
                      border: `1.5px solid ${border}`,
                      borderRadius: '14px',
                      padding: '1rem 0.65rem',
                      color: textColor,
                      fontSize: '0.92rem',
                      fontWeight: 700,
                      cursor: item.matched ? 'default' : 'pointer',
                      transition: 'all 0.15s ease',
                      opacity,
                      transform: isSelected ? 'scale(1.03)' : 'none',
                      boxShadow: isSelected ? '0 0 0 2px rgba(26, 193, 231, 0.2)' : 'none'
                    }}
                  >
                    {item.word}
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};
