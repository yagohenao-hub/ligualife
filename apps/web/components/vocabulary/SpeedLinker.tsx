import React, { useState, useEffect } from 'react';
import { VocabularyWordItem } from '@/lib/vocabulary';
import styles from '@/styles/Vocabulary.module.css';

interface Props {
  words: VocabularyWordItem[];
}

interface PairItem {
  id: string;
  word: string;
  pairId: string;
  relationType: 'synonym' | 'antonym';
  matched: boolean;
}

export const SpeedLinker: React.FC<Props> = ({ words }) => {
  const [timeLeft, setTimeLeft] = useState(45);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [selectedFirst, setSelectedFirst] = useState<PairItem | null>(null);
  const [cards, setCards] = useState<PairItem[]>([]);

  // Pares de prueba basados en el grafo semántico
  const INITIAL_PAIRS: { word1: string; word2: string; type: 'synonym' | 'antonym' }[] = [
    { word1: 'run (manage)', word2: 'manage', type: 'synonym' },
    { word1: 'kind (friendly)', word2: 'mean', type: 'antonym' },
    { word1: 'light (weight)', word2: 'heavy', type: 'antonym' },
    { word1: 'book (reserve)', word2: 'reserve', type: 'synonym' },
    { word1: 'fair (just)', word2: 'unfair', type: 'antonym' },
    { word1: 'safe (protected)', word2: 'dangerous', type: 'antonym' }
  ];

  function startGame() {
    const list: PairItem[] = [];
    INITIAL_PAIRS.forEach((p, idx) => {
      const pairKey = `pair-${idx}`;
      list.push({ id: `${pairKey}-a`, word: p.word1, pairId: pairKey, relationType: p.type, matched: false });
      list.push({ id: `${pairKey}-b`, word: p.word2, pairId: pairKey, relationType: p.type, matched: false });
    });

    // Barajar
    setCards(list.sort(() => Math.random() - 0.5));
    setTimeLeft(45);
    setScore(0);
    setCombo(0);
    setSelectedFirst(null);
    setIsPlaying(true);
  }

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
      setSelectedFirst(item);
      return;
    }

    if (selectedFirst.id === item.id) {
      setSelectedFirst(null);
      return;
    }

    // Comprobar coincidencia
    if (selectedFirst.pairId === item.pairId) {
      // Correcto
      setCards(prev => prev.map(c => c.pairId === item.pairId ? { ...c, matched: true } : c));
      setScore(s => s + 10 + combo * 2);
      setCombo(c => c + 1);
      setSelectedFirst(null);
    } else {
      // Fallo
      setCombo(0);
      setSelectedFirst(null);
    }
  }

  const allMatched = cards.length > 0 && cards.every(c => c.matched);

  return (
    <div className={styles.triviaCard}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#f4f4f5' }}>
            ⚡ Speed Linker (Conector del Grafo)
          </h3>
          <span style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>
            Conecta pares válidos de sinónimos y antónimos a contrarreloj.
          </span>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: timeLeft < 10 ? '#ef4444' : '#fbbf24' }}>
            ⏱ {timeLeft}s
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34d399' }}>
            ★ {score} pts
          </div>
        </div>
      </div>

      {!isPlaying && !allMatched && (
        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🕸️</div>
          <p style={{ color: '#d4d4d8', maxWidth: '420px', margin: '0 auto 1.5rem', lineHeight: 1.5 }}>
            Empareja las palabras con sus sinónimos y antónimos directos en el menor tiempo posible para activar tu red semántica.
          </p>
          <button
            onClick={startGame}
            className={styles.tabBtn}
            style={{ margin: '0 auto', background: '#7c3aed', color: '#fff', fontSize: '1rem', padding: '0.75rem 1.8rem' }}
          >
            ▶ Comenzar Ronda (45s)
          </button>
        </div>
      )}

      {(isPlaying || allMatched) && (
        <>
          {allMatched ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🌟</div>
              <h4 style={{ fontSize: '1.3rem', color: '#34d399', fontWeight: 800 }}>
                ¡Excelente! Despejaste toda la red de conexiones
              </h4>
              <p style={{ color: '#a1a1aa', marginBottom: '1.5rem' }}>
                Puntaje obtenido: {score} puntos
              </p>
              <button onClick={startGame} className={styles.tabBtn} style={{ margin: '0 auto' }}>
                🔄 Jugar de nuevo
              </button>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
              gap: '0.75rem'
            }}>
              {cards.map(item => {
                const isSelected = selectedFirst?.id === item.id;
                let bg = 'rgba(255, 255, 255, 0.04)';
                let border = 'rgba(255, 255, 255, 0.1)';
                let opacity = 1;

                if (item.matched) {
                  bg = 'rgba(16, 185, 129, 0.15)';
                  border = '#10b981';
                  opacity = 0.35;
                } else if (isSelected) {
                  bg = 'rgba(124, 58, 237, 0.3)';
                  border = '#a78bfa';
                }

                return (
                  <button
                    key={item.id}
                    disabled={item.matched}
                    onClick={() => handleCardClick(item)}
                    style={{
                      background: bg,
                      border: `1px solid ${border}`,
                      borderRadius: '12px',
                      padding: '1rem 0.5rem',
                      color: item.matched ? '#34d399' : '#fff',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      cursor: item.matched ? 'default' : 'pointer',
                      transition: 'all 0.15s ease',
                      opacity,
                      transform: isSelected ? 'scale(1.04)' : 'none'
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
