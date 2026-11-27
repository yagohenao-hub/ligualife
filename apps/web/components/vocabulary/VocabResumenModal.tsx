import React, { useState, useEffect, useMemo } from 'react';
import { X, BookOpen, Volume2, Sparkles, Search, Bookmark } from 'lucide-react';
import { VocabularyWordItem, VocabCategory } from '@/lib/vocabulary';
import styles from '@/styles/Vocabulary.module.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  category: VocabCategory;
  categoryTitle: string;
  words: VocabularyWordItem[];
}

export const VocabResumenModal: React.FC<Props> = ({
  isOpen,
  onClose,
  categoryTitle,
  words
}) => {
  const [selectedWordIndex, setSelectedWordIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const wordsKey = `${words.length}-${words[0]?.id || ''}`;
  useEffect(() => {
    setSelectedWordIndex(0);
    setSearchTerm('');
  }, [isOpen, wordsKey]);

  const filteredWords = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return words;
    return words.filter(
      w =>
        w.word.toLowerCase().includes(q) ||
        w.senses.some(s => s.definitionEs.toLowerCase().includes(q))
    );
  }, [words, searchTerm]);

  if (!isOpen || words.length === 0) return null;

  const safeIndex = Math.min(selectedWordIndex, Math.max(0, filteredWords.length - 1));
  const currentWord = filteredWords[safeIndex] || words[0];
  const visibleChips = filteredWords.slice(0, 60);

  function speakWord(text: string) {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ background: 'rgba(26, 193, 231, 0.16)', padding: '0.45rem', borderRadius: '10px', color: 'var(--brand-cyan, #1AC1E7)' }}>
              <BookOpen size={20} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>Ficha de Resumen &amp; Acepciones</h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{categoryTitle} • {words.length} conceptos clave</span>
            </div>
          </div>
          <button onClick={onClose} className={styles.modalCloseBtn} title="Cerrar modal">
            <X size={18} />
          </button>
        </div>

        {/* Buscador rápido cuando el banco es amplio */}
        {words.length > 25 && (
          <div style={{ padding: '0.65rem 1.25rem 0', position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '1.95rem', top: '1.22rem', color: 'var(--text-secondary)' }} />
            <input
              type="text"
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setSelectedWordIndex(0);
              }}
              placeholder={`Filtrar entre ${words.length} términos...`}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '0.45rem 0.75rem 0.45rem 2.1rem',
                borderRadius: '10px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--surface-border)',
                color: 'var(--text-primary)',
                fontSize: '0.82rem',
                outline: 'none'
              }}
            />
          </div>
        )}

        {/* Word Chips Selector Horizontal */}
        <div className={styles.wordChipsScroll}>
          {visibleChips.map((w, idx) => (
            <button
              key={w.id}
              onClick={() => setSelectedWordIndex(idx)}
              className={`${styles.wordChipBtn} ${idx === safeIndex ? styles.wordChipBtnActive : ''}`}
            >
              {w.word}
            </button>
          ))}
        </div>

        {/* Word Card Details */}
        <div className={styles.resumenCardContent}>
          <div className={styles.wordCardHeader}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <h3 style={{ margin: 0, fontSize: '1.85rem', fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                  {currentWord.word}
                </h3>
                {currentWord.ipa && (
                  <span style={{ fontSize: '0.95rem', color: 'var(--brand-cyan, #1AC1E7)', fontFamily: 'monospace', background: 'rgba(26, 193, 231, 0.14)', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
                    {currentWord.ipa}
                  </span>
                )}
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', background: 'var(--bg-hover)', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                  {currentWord.partOfSpeech}
                </span>
              </div>
              <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Clúster temático: <strong style={{ color: 'var(--brand-purple, #8C31C5)' }}>{currentWord.thematicCluster || 'Fundamentos'}</strong>
              </p>
            </div>

            <button
              onClick={() => speakWord(currentWord.word)}
              className={styles.audioSpeakBtn}
              title="Escuchar pronunciación nativa"
            >
              <Volume2 size={18} />
              <span>Pronunciar</span>
            </button>
          </div>

          {/* Senses Display (Mínimo 2 significados / acepciones) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.25rem' }}>
            {currentWord.senses.map((sense, sIdx) => (
              <div key={sense.id || sIdx} className={styles.senseBox}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span className={styles.senseBadge}>
                    Acepción #{sense.senseIndex} ({sense.cefrLevelTarget})
                  </span>
                  {sense.notes && (
                    <span style={{ fontSize: '0.75rem', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Sparkles size={12} /> Regla pedagógica
                    </span>
                  )}
                </div>

                <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.35rem' }}>
                  {sense.definitionEn}
                </p>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '0 0 0.75rem', fontStyle: 'italic' }}>
                  👉 {sense.definitionEs}
                </p>

                {/* Example sentence */}
                <div className={styles.exampleSentenceBox}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                      &ldquo;{sense.exampleSentenceEn}&rdquo;
                    </p>
                    <button
                      onClick={() => speakWord(sense.exampleSentenceEn)}
                      style={{ background: 'none', border: 'none', color: 'var(--brand-cyan, #1AC1E7)', cursor: 'pointer', padding: '0.1rem 0.3rem' }}
                      title="Escuchar oración completa"
                    >
                      <Volume2 size={14} />
                    </button>
                  </div>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {sense.exampleSentenceEs}
                  </p>
                </div>

                {/* Collocations */}
                {sense.collocations && sense.collocations.length > 0 && (
                  <div style={{ marginTop: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Colocaciones:</span>
                    {sense.collocations.map((col, cIdx) => (
                      <span key={cIdx} className={styles.collocationPill}>
                        {col}
                      </span>
                    ))}
                  </div>
                )}

                {/* Pedagogical Note */}
                {sense.notes && (
                  <div style={{ marginTop: '0.65rem', background: 'rgba(253, 186, 59, 0.12)', border: '1px solid rgba(253, 186, 59, 0.32)', padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                    💡 <strong>Tip Pedagógico:</strong> {sense.notes}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Relations / Synonyms & Antonyms */}
          {currentWord.relations && currentWord.relations.length > 0 && (
            <div style={{ marginTop: '1.25rem', padding: '0.85rem', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--surface-border)' }}>
              <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Bookmark size={14} color="var(--brand-purple, #8C31C5)" /> Red Semántica (Conexiones Directas):
              </h4>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {currentWord.relations.map((rel, rIdx) => (
                  <span key={rIdx} style={{ fontSize: '0.8rem', background: 'rgba(140, 49, 197, 0.12)', color: 'var(--brand-purple, #8C31C5)', padding: '0.25rem 0.6rem', borderRadius: '6px', border: '1px solid rgba(140, 49, 197, 0.25)' }}>
                    <strong>{rel.relationType === 'synonym' ? '≈ Sinónimo:' : rel.relationType === 'antonym' ? '≠ Antónimo:' : '→ Relacionado:'}</strong> {rel.targetWord} ({rel.targetDefinitionEs})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className={styles.modalFooter}>
          <button
            disabled={safeIndex === 0}
            onClick={() => setSelectedWordIndex(prev => Math.max(0, prev - 1))}
            className={styles.modalNavBtn}
          >
            ← Anterior
          </button>
          <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
            {filteredWords.length > 0 ? `${safeIndex + 1} de ${filteredWords.length}` : '0 resultados'}
          </span>
          <button
            disabled={safeIndex >= filteredWords.length - 1}
            onClick={() => setSelectedWordIndex(prev => Math.min(filteredWords.length - 1, prev + 1))}
            className={styles.modalNavBtn}
          >
            Siguiente →
          </button>
        </div>
      </div>
    </div>
  );
};
