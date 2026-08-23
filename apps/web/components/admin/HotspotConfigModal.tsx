import { useState, useEffect } from 'react'
import { Hotspot } from '@/lib/interactive-scenes'
import styles from '@/styles/Landing.module.css'

interface HotspotConfigModalProps {
  hotspot: Partial<Hotspot>
  onSave: (hotspot: Hotspot) => void
  onCancel: () => void
  onDelete?: () => void
}

export function HotspotConfigModal({ hotspot, onSave, onCancel, onDelete }: HotspotConfigModalProps) {
  const [verb, setVerb] = useState(hotspot.verb || '')
  const [sentence, setSentence] = useState(hotspot.sentence || '')
  const [translation, setTranslation] = useState(hotspot.translation || '')
  const [level, setLevel] = useState(hotspot.level || 'B1')
  const [category, setCategory] = useState(hotspot.category || 'General')

  const isNew = !hotspot.verb

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      id: hotspot.id || `h_${Date.now()}`,
      x: hotspot.x || 0,
      y: hotspot.y || 0,
      verb,
      sentence,
      translation,
      level,
      category
    })
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '1.25rem'
      }}
    >
      <div
        style={{
          background: '#121218',
          border: '1px solid rgba(124, 58, 237, 0.4)',
          borderRadius: '20px',
          padding: '2rem',
          maxWidth: '500px',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9)',
          position: 'relative'
        }}
      >
        <button
          onClick={onCancel}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'rgba(255,255,255,0.06)',
            border: 'none',
            color: '#a1a1aa',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          ✕
        </button>

        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'white' }}>
          {isNew ? '✨ Nuevo Punto Interactivo' : '✏️ Editar Punto Interactivo'}
        </h2>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: '0.3rem' }}>Verbo / Frase (Inglés)</label>
              <input 
                type="text" 
                value={verb} 
                onChange={e => setVerb(e.target.value)}
                required
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                placeholder="Ej. Pitching"
              />
            </div>
            <div style={{ width: '100px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: '0.3rem' }}>Nivel CEFR</label>
              <select 
                value={level} 
                onChange={e => setLevel(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
              >
                <option value="A1">A1</option>
                <option value="A2">A2</option>
                <option value="B1">B1</option>
                <option value="B2">B2</option>
                <option value="C1">C1</option>
                <option value="C2">C2</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: '0.3rem' }}>Categoría</label>
            <input 
              type="text" 
              value={category} 
              onChange={e => setCategory(e.target.value)}
              required
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
              placeholder="Ej. Negocios & Ventas"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: '0.3rem' }}>Frase en Contexto (Inglés)</label>
            <textarea 
              value={sentence} 
              onChange={e => setSentence(e.target.value)}
              required
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', minHeight: '60px', fontFamily: 'inherit' }}
              placeholder="Ej. She is pitching the growth strategy."
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: '0.3rem' }}>Traducción (Español)</label>
            <textarea 
              value={translation} 
              onChange={e => setTranslation(e.target.value)}
              required
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', minHeight: '60px', fontFamily: 'inherit' }}
              placeholder="Ej. Ella está presentando la estrategia de crecimiento."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
            {onDelete ? (
              <button 
                type="button" 
                onClick={onDelete}
                style={{ background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
              >
                Eliminar Punto
              </button>
            ) : <div></div>}
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                type="button" 
                onClick={onCancel}
                style={{ background: 'transparent', color: '#a1a1aa', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className={styles.btnPrimary}
                style={{ padding: '0.5rem 1.5rem' }}
              >
                Guardar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
