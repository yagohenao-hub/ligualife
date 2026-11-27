import React, { useState, useEffect, useMemo } from 'react';
import { Search, Volume2 } from 'lucide-react';
import { VocabularyWordItem } from '@/lib/vocabulary';
import styles from '@/styles/Vocabulary.module.css';

interface Props {
  words: VocabularyWordItem[];
}

type PosFilter = 'all' | 'verb' | 'noun' | 'adjective' | 'adverb' | 'other';

const PAGE_SIZE = 60;

export const VocabularyGridManager: React.FC<Props> = ({ words }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [posFilter, setPosFilter] = useState<PosFilter>('all');
  const [visibleLimit, setVisibleLimit] = useState(PAGE_SIZE);
  const [inspectWord, setInspectWord] = useState<VocabularyWordItem | null>(null);

  useEffect(() => {
    setVisibleLimit(PAGE_SIZE);
    setInspectWord(null);
  }, [words, searchQuery, posFilter]);

  const filteredWords = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return words.filter(w => {
      if (posFilter !== 'all') {
        const p = (w.partOfSpeech || '').toLowerCase();
        if (posFilter === 'verb' && !p.includes('verb')) return false;
        if (posFilter === 'noun' && !p.includes('noun')) return false;
        if (posFilter === 'adjective' && !p.includes('adj')) return false;
        if (posFilter === 'adverb' && !p.includes('adv')) return false;
        if (posFilter === 'other' && (p.includes('verb') || p.includes('noun') || p.includes('adj') || p.includes('adv'))) return false;
      }
      if (!q) return true;
      if (w.word.toLowerCase().includes(q)) return true;
      return w.senses.some(
        s =>
          s.definitionEs.toLowerCase().includes(q) ||
          s.definitionEn.toLowerCase().includes(q)
      );
    });
  }, [words, searchQuery, posFilter]);

  const visibleWords = useMemo(
    () => filteredWords.slice(0, visibleLimit),
    [filteredWords, visibleLimit]
  );

  function speakWord(text: string) {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.88;
      window.speechSynthesis.speak(utterance);
    }
  }

  return (
    <div>
      {/* Barra de Búsqueda + Filtros por Categoría Gramatical */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.85rem',
          marginBottom: '1.15rem'
        }}
      >
        <div
          style={{
            position: 'relative',
            flex: '1 1 260px',
            maxWidth: '380px'
          }}
        >
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '0.85rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-secondary)'
            }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar palabra o significado en español..."
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '0.58rem 0.9rem 0.58rem 2.35rem',
              borderRadius: '12px',
              background: 'var(--surface-1)',
              border: '1px solid var(--surface-border)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          />
        </div>

        <div className={styles.filterPills}>
          {[
            { id: 'all', label: `Todas (${words.length})` },
            { id: 'verb', label: 'Verbos' },
            { id: 'noun', label: 'Sustantivos' },
            { id: 'adjective', label: 'Adjetivos' },
            { id: 'adverb', label: 'Adverbios' },
            { id: 'other', label: 'Conectores / Otros' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setPosFilter(tab.id as PosFilter)}
              className={`${styles.filterBtn} ${posFilter === tab.id ? styles.filterBtnActive : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contador */}
      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
        Mostrando <strong style={{ color: 'var(--text-primary)' }}>{visibleWords.length}</strong> de{' '}
        <strong style={{ color: 'var(--brand-cyan, #1AC1E7)' }}>{filteredWords.length}</strong> términos disponibles. Haz clic en cualquier tarjeta para ver su significado, IPA y ejemplos.
      </div>

      {/* Cuadrícula de Palabras */}
      <div className={styles.gridMatrix}>
        {visibleWords.map(item => {
          const primarySense = item.senses[0];
          const shortMeaning = primarySense?.definitionEs?.split(':')[0] || primarySense?.partOfSpeech || item.partOfSpeech;

          return (
            <div
              key={item.id}
              className={styles.wordChip}
              onClick={() => setInspectWord(item)}
              style={{ cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.4rem' }}>
                <span className={styles.chipWord}>{item.word}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    speakWord(item.word.split('/')[0].trim());
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--brand-cyan, #1AC1E7)',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'inline-flex',
                    alignItems: 'center'
                  }}
                  title="Escuchar pronunciación"
                >
                  <Volume2 size={15} />
                </button>
              </div>

              <div
                style={{
                  fontSize: '0.78rem',
                  color: 'var(--accent-green, #34D399)',
                  fontWeight: 600,
                  marginTop: '0.2rem',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {shortMeaning}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.4rem' }}>
                <span className={styles.chipStatus} style={{ color: 'var(--text-secondary)' }}>
                  {item.partOfSpeech}
                </span>
                {item.senses.length > 1 && (
                  <span style={{ fontSize: '0.65rem', background: 'var(--bg-hover, rgba(255, 255, 255, 0.08))', padding: '0.1rem 0.35rem', borderRadius: '4px', color: 'var(--brand-purple, #8C31C5)', fontWeight: 700 }}>
                    {item.senses.length} acep.
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Botón Cargar Más */}
      {visibleLimit < filteredWords.length && (
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <button
            type="button"
            onClick={() => setVisibleLimit(prev => prev + PAGE_SIZE)}
            className={styles.tabBtn}
            style={{
              margin: '0 auto',
              background: 'rgba(26, 193, 231, 0.14)',
              borderColor: 'rgba(26, 193, 231, 0.45)',
              color: 'var(--brand-cyan, #1AC1E7)',
              fontWeight: 800
            }}
          >
            Mostrar {Math.min(PAGE_SIZE, filteredWords.length - visibleLimit)} palabras más ({filteredWords.length - visibleLimit} restantes)
          </button>
        </div>
      )}

      {/* Modal de Detalle Completo */}
      {inspectWord && (
        <div
          style={{
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
          }}
          onClick={() => setInspectWord(null)}
        >
          <div
            style={{
              background: 'var(--surface-elevated, var(--bg-card))',
              border: '1px solid var(--surface-border)',
              boxShadow: 'var(--clay)',
              borderRadius: '20px',
              padding: '1.75rem',
              maxWidth: '540px',
              width: '100%',
              maxHeight: '85vh',
              overflowY: 'auto',
              color: 'var(--text-primary)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: '1.65rem', fontWeight: 900, margin: 0, color: 'var(--text-primary)' }}>
                    {inspectWord.word}
                  </h3>
                  {inspectWord.ipa && (
                    <span style={{ fontSize: '0.9rem', fontFamily: 'monospace', color: 'var(--brand-cyan, #1AC1E7)', background: 'rgba(26, 193, 231, 0.12)', padding: '0.15rem 0.5rem', borderRadius: '6px' }}>
                      {inspectWord.ipa}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => speakWord(inspectWord.word.split('/')[0].trim())}
                    className={styles.audioBtn}
                    title="Pronunciar"
                  >
                    🔊
                  </button>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {inspectWord.partOfSpeech} • Nivel {inspectWord.cefrLevel}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setInspectWord(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem' }}>
              {inspectWord.senses.map((s, idx) => (
                <div key={s.id || idx} style={{ padding: '0.95rem', borderRadius: '14px', background: 'var(--bg-secondary)', border: '1px solid var(--surface-border)' }}>
                  <div style={{ fontSize: '0.82rem', color: 'var(--brand-purple, #8C31C5)', fontWeight: 800, marginBottom: '0.25rem' }}>
                    Acepción #{s.senseIndex} ({s.partOfSpeech} • {s.cefrLevelTarget})
                  </div>
                  <p style={{ margin: '0 0 0.4rem', color: 'var(--text-primary)', lineHeight: 1.45, fontSize: '0.94rem' }}>
                    {s.definitionEn}
                  </p>
                  <div style={{ color: 'var(--accent-green, #34D399)', fontSize: '0.92rem', fontWeight: 700, marginBottom: '0.65rem' }}>
                    💡 {s.definitionEs}
                  </div>
                  {s.exampleSentenceEn && (
                    <div className={styles.cardExample}>
                      <div>&ldquo;{s.exampleSentenceEn}&rdquo;</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '0.25rem' }}>
                        {s.exampleSentenceEs}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {inspectWord.relations && inspectWord.relations.length > 0 && (
              <div style={{ marginBottom: '1.25rem', display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                {inspectWord.relations.map(rel => (
                  <span
                    key={rel.id}
                    style={{
                      fontSize: '0.76rem',
                      padding: '0.25rem 0.6rem',
                      borderRadius: '999px',
                      background: rel.relationType === 'antonym' ? 'rgba(255, 80, 118, 0.14)' : 'rgba(26, 193, 231, 0.14)',
                      color: rel.relationType === 'antonym' ? 'var(--brand-pink, #FF5076)' : 'var(--brand-cyan, #1AC1E7)',
                      fontWeight: 700
                    }}
                  >
                    {rel.relationType === 'antonym' ? '⚡ Antónimo:' : '🔗 Sinónimo:'} {rel.targetWord} ({rel.targetDefinitionEs})
                  </span>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => setInspectWord(null)}
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
