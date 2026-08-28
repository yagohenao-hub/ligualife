import { useState, useEffect } from 'react'
import { FlashcardPack, FlashcardItem, getAllFlashcardPacks, saveFlashcardPackAsync, deleteFlashcardPack, fetchFlashcardPacksFromServer } from '@/lib/flashcards'
import { FlashcardViewer } from '@/components/FlashcardViewer'

export function FlashcardStudioTab() {
  const [packs, setPacks] = useState<FlashcardPack[]>([])
  const [editingPack, setEditingPack] = useState<FlashcardPack | null>(null)
  const [viewingPack, setViewingPack] = useState<FlashcardPack | null>(null)
  const [step, setStep] = useState<'list' | 'create' | 'edit' | 'viewer'>('list')
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)

  // Form State
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [category, setCategory] = useState('Polisemia & Morfología')
  const [vocabInput, setVocabInput] = useState('')

  useEffect(() => {
    setPacks(getAllFlashcardPacks())
    fetchFlashcardPacksFromServer().then(fresh => {
      if (fresh && fresh.length > 0) setPacks(fresh)
    })
  }, [])

  function handleStartNew() {
    setTitle('Familia Conceptual de "RUN"')
    setSubtitle('Descubre colocaciones y significados derivados de Run: run out of, run a business, runner-up...')
    setCategory('Polisemia & Morfología')
    setVocabInput('Run, Run out of, Run a business, Runner-up, Run through, Overrun')
    setStep('create')
  }

  async function handleGenerateWithAI(e: React.FormEvent) {
    e.preventDefault()
    setIsGeneratingAI(true)

    try {
      const res = await fetch('/api/admin/generate-flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category,
          level: 'B1-B2',
          vocabInput
        })
      })

      const data = await res.json()
      if (!res.ok || !data.pack) {
        throw new Error(data.error || 'Error al generar pack de flashcards')
      }

      setEditingPack(data.pack)
      setStep('edit')
    } catch (err: any) {
      alert(`⚠️ ${err.message || 'Error en la generación'}`)
    } finally {
      setIsGeneratingAI(false)
    }
  }

  async function handleSavePack() {
    if (!editingPack) return
    try {
      await saveFlashcardPackAsync(editingPack)
      const fresh = await fetchFlashcardPacksFromServer()
      setPacks(fresh)
      setStep('list')
      setEditingPack(null)
      alert('🎉 ¡Pack de Flashcards guardado y publicado en la plataforma!')
    } catch (err) {
      alert('⚠️ Hubo un detalle al guardar en servidor, pero quedó almacenado en este equipo.')
    }
  }

  function handleDeletePack(id: string) {
    if (confirm('¿Estás seguro de eliminar este pack de tarjetas?')) {
      deleteFlashcardPack(id)
      setPacks(getAllFlashcardPacks())
    }
  }

  return (
    <div style={{ padding: '1rem 0' }}>
      {/* STEP 1: LIST VIEW */}
      {step === 'list' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f4f4f5', margin: 0 }}>
                Studio de Flashcards Conceptuales
              </h2>
              <p style={{ color: '#a1a1aa', fontSize: '0.9rem', margin: '0.3rem 0 0 0' }}>
                Crea y edita packs de tarjetas interactivas pensados a cabalidad para enseñar familias de palabras, polisemia y colocaciones.
              </p>
            </div>

            <button
              onClick={handleStartNew}
              style={{
                background: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)',
                color: '#fff',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '10px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(124, 58, 237, 0.4)'
              }}
            >
              + Crear Pack de Flashcards con IA
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {packs.map(p => (
              <div
                key={p.id}
                style={{
                  background: 'rgba(18, 18, 24, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ height: '160px', overflow: 'hidden', position: 'relative', background: '#090d12' }}>
                  <img
                    src={p.cards[0]?.imageSrc || '/flashcards/draw.png'}
                    alt={p.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <span style={{ position: 'absolute', top: '10px', right: '10px', background: '#7c3aed', color: '#fff', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>
                    {p.cards.length} Tarjetas
                  </span>
                </div>

                <div style={{ padding: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f4f4f5', marginBottom: '0.4rem' }}>
                    {p.title}
                  </h3>
                  <p style={{ fontSize: '0.825rem', color: '#9ca3af', lineHeight: 1.4, marginBottom: '1.25rem' }}>
                    {p.subtitle}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <div style={{ display: 'flex', gap: '0.6rem' }}>
                      <button
                        onClick={() => {
                          setViewingPack(p)
                          setStep('viewer')
                        }}
                        style={{
                          flex: 1,
                          background: 'rgba(124, 58, 237, 0.15)',
                          border: '1px solid rgba(124, 58, 237, 0.3)',
                          color: '#c4b5fd',
                          padding: '0.5rem',
                          borderRadius: '8px',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        🃏 Probador de Tarjetas
                      </button>

                      <button
                        onClick={() => {
                          setEditingPack(JSON.parse(JSON.stringify(p)))
                          setStep('edit')
                        }}
                        style={{
                          flex: 1,
                          background: 'rgba(255, 255, 255, 0.08)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          color: '#fff',
                          padding: '0.5rem',
                          borderRadius: '8px',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        ✏️ Editar
                      </button>
                    </div>

                    {p.id !== 'draw-family-pack' && (
                      <button
                        onClick={() => handleDeletePack(p.id)}
                        style={{
                          background: 'rgba(239, 68, 68, 0.15)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          color: '#ef4444',
                          padding: '0.4rem',
                          borderRadius: '8px',
                          fontSize: '0.85rem',
                          cursor: 'pointer'
                        }}
                      >
                        🗑️ Eliminar Pack
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2: CREATE PACK FORM */}
      {step === 'create' && (
        <div style={{ maxWidth: '680px', margin: '0 auto', background: 'rgba(18, 18, 24, 0.95)', border: '1px solid rgba(124, 58, 237, 0.3)', padding: '2rem', borderRadius: '20px' }}>
          <button onClick={() => setStep('list')} style={{ background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer', marginBottom: '1rem' }}>
            ← Volver a la lista
          </button>

          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginBottom: '0.4rem' }}>
            Nuevo Pack de Flashcards con IA
          </h2>
          <p style={{ color: '#a1a1aa', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            Ingresa la palabra raíz o tema. Gemini generará tarjetas conceptuales con definiciones sencillas en inglés y traducciones al español.
          </p>

          <form onSubmit={handleGenerateWithAI}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', color: '#d4d4d8', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Título / Palabra Raíz del Pack *
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '0.75rem', borderRadius: '8px', outline: 'none' }}
                required
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', color: '#d4d4d8', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Subtítulo / Descripción
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={e => setSubtitle(e.target.value)}
                style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '0.75rem', borderRadius: '8px', outline: 'none' }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', color: '#a78bfa', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Conceptos / Expresiones a incluir (Separados por coma)
              </label>
              <textarea
                value={vocabInput}
                onChange={e => setVocabInput(e.target.value)}
                rows={3}
                style={{ width: '100%', background: 'rgba(124, 58, 237, 0.1)', border: '1px solid rgba(124, 58, 237, 0.4)', color: '#c4b5fd', padding: '0.75rem', borderRadius: '8px', outline: 'none' }}
              />
            </div>

            <button
              type="submit"
              disabled={isGeneratingAI}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)',
                color: '#fff',
                border: 'none',
                padding: '0.9rem',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              {isGeneratingAI ? '⚡ Generando Tarjetas con IA...' : '✨ Generar Pack de Tarjetas'}
            </button>
          </form>
        </div>
      )}

      {/* STEP 3: EDIT PACK & CARDS */}
      {step === 'edit' && editingPack && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <button onClick={() => setStep('list')} style={{ background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}>
              ← Cancelar y volver
            </button>
            <h3 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>
              Editando: {editingPack.title} ({editingPack.cards.length} Tarjetas)
            </h3>
            <button
              onClick={handleSavePack}
              style={{ background: '#10b981', color: '#fff', border: 'none', padding: '0.65rem 1.4rem', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}
            >
              💾 Guardar & Publicar Pack
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {editingPack.cards.map((card, idx) => (
              <div
                key={card.id}
                style={{
                  background: 'rgba(18, 18, 24, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  padding: '1.25rem',
                  display: 'grid',
                  gridTemplateColumns: '120px 1fr',
                  gap: '1.25rem'
                }}
              >
                <img
                  src={card.imageSrc}
                  alt={card.word}
                  style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '12px', background: '#000' }}
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ color: '#a1a1aa', fontSize: '0.75rem', fontWeight: 700 }}>Palabra / Expresión</label>
                    <input
                      type="text"
                      value={card.word}
                      onChange={e => {
                        const nextCards = [...editingPack.cards]
                        nextCards[idx].word = e.target.value
                        setEditingPack({ ...editingPack, cards: nextCards })
                      }}
                      style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '0.5rem', borderRadius: '6px', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ color: '#a1a1aa', fontSize: '0.75rem', fontWeight: 700 }}>Traducción al Español</label>
                    <input
                      type="text"
                      value={card.translationEs}
                      onChange={e => {
                        const nextCards = [...editingPack.cards]
                        nextCards[idx].translationEs = e.target.value
                        setEditingPack({ ...editingPack, cards: nextCards })
                      }}
                      style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '0.5rem', borderRadius: '6px', outline: 'none' }}
                    />
                  </div>

                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ color: '#a1a1aa', fontSize: '0.75rem', fontWeight: 700 }}>Definición Sencilla en Inglés (A1-A2)</label>
                    <input
                      type="text"
                      value={card.definitionEn}
                      onChange={e => {
                        const nextCards = [...editingPack.cards]
                        nextCards[idx].definitionEn = e.target.value
                        setEditingPack({ ...editingPack, cards: nextCards })
                      }}
                      style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '0.5rem', borderRadius: '6px', outline: 'none' }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 4: VIEWER PREVIEW */}
      {step === 'viewer' && viewingPack && (
        <div style={{ background: 'rgba(18, 18, 24, 0.95)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '2rem', borderRadius: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: 0 }}>Vista Previa de Alumno</h3>
            <button
              onClick={() => {
                setStep('list')
                setViewingPack(null)
              }}
              style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#fff', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}
            >
              ← Volver a la lista
            </button>
          </div>
          <FlashcardViewer pack={viewingPack} />
        </div>
      )}
    </div>
  )
}
