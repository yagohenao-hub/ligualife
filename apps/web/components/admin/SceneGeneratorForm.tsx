import { useState } from 'react'
import styles from '@/styles/Landing.module.css'

interface SceneGeneratorFormProps {
  onImageReady: (imageSrc: string) => void
}

export function SceneGeneratorForm({ onImageReady }: SceneGeneratorFormProps) {
  const [activeTab, setActiveTab] = useState<'prompt' | 'url'>('prompt')
  
  // Prompt form states
  const [theme, setTheme] = useState('')
  const [characters, setCharacters] = useState('')
  const [styleDesc, setStyleDesc] = useState('Ilustración isométrica, estilo tech startup moderna, paleta de colores vibrante, iluminación cinemática, alta calidad, muy detallado')
  const [generatedPrompt, setGeneratedPrompt] = useState('')
  
  // URL form state
  const [imageUrl, setImageUrl] = useState('')

  const handleGeneratePrompt = () => {
    const prompt = `Un escenario detallado de ${theme || '[Tema/Escenario]'}. Hay múltiples personajes realizando diferentes acciones: ${characters || '[Acciones de personajes]'}. Estilo visual: ${styleDesc}. Todos los elementos deben estar claramente distinguibles para poder interactuar con ellos.`
    setGeneratedPrompt(prompt)
  }

  const handleCopyPrompt = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(generatedPrompt)
    }
    alert('Prompt copiado al portapapeles. ¡Pégalo en Midjourney o DALL-E 3!')
  }

  const handleSubmitUrl = (e: React.FormEvent) => {
    e.preventDefault()
    if (imageUrl) {
      onImageReady(imageUrl)
    }
  }

  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '2rem' }}>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
        <button 
          onClick={() => setActiveTab('prompt')}
          style={{ 
            background: activeTab === 'prompt' ? 'rgba(16,185,129,0.2)' : 'transparent',
            color: activeTab === 'prompt' ? '#10b981' : '#a1a1aa',
            border: activeTab === 'prompt' ? '1px solid #10b981' : '1px solid transparent',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 600,
            transition: 'all 0.2s'
          }}
        >
          ✨ Asistente de Prompt (IA)
        </button>
        <button 
          onClick={() => setActiveTab('url')}
          style={{ 
            background: activeTab === 'url' ? 'rgba(59,130,246,0.2)' : 'transparent',
            color: activeTab === 'url' ? '#3b82f6' : '#a1a1aa',
            border: activeTab === 'url' ? '1px solid #3b82f6' : '1px solid transparent',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 600,
            transition: 'all 0.2s'
          }}
        >
          🔗 Enlazar Imagen Existente
        </button>
      </div>

      {activeTab === 'prompt' ? (
        <div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Generador de Prompt Maestro</h3>
          <p style={{ color: '#a1a1aa', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Llena los campos para estructurar el prompt óptimo. Luego cópialo, genera la imagen en tu IA favorita, y pega el enlace de la imagen en la otra pestaña.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#d1d5db' }}>Escenario / Tema Central</label>
              <input 
                type="text" 
                value={theme}
                onChange={e => setTheme(e.target.value)}
                placeholder="Ej. Oficina moderna, parque urbano, cafetería concurrida..."
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#d1d5db' }}>Acciones de los Personajes (Ideas iniciales)</label>
              <textarea 
                value={characters}
                onChange={e => setCharacters(e.target.value)}
                placeholder="Ej. Una mujer programando, un hombre tomando café, dos personas discutiendo un plano..."
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', minHeight: '80px', fontFamily: 'inherit' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#d1d5db' }}>Estilo Visual</label>
              <input 
                type="text" 
                value={styleDesc}
                onChange={e => setStyleDesc(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
              />
            </div>
          </div>

          <button onClick={handleGeneratePrompt} className={styles.btnPrimary} style={{ marginBottom: '1.5rem' }}>
            Generar Prompt
          </button>

          {generatedPrompt && (
            <div style={{ background: '#0f172a', padding: '1.5rem', borderRadius: '12px', border: '1px solid #1e293b' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: 700 }}>
                Prompt Resultante:
              </div>
              <p style={{ color: '#f8fafc', lineHeight: 1.5, marginBottom: '1rem', fontSize: '0.95rem' }}>
                {generatedPrompt}
              </p>
              <button 
                onClick={handleCopyPrompt}
                style={{ background: 'white', color: 'black', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
              >
                Copiar al Portapapeles
              </button>
            </div>
          )}
        </div>
      ) : (
        <div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Iniciar con una Imagen</h3>
          <p style={{ color: '#a1a1aa', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Si ya tienes tu imagen (o la acabas de generar), pega la URL directa aquí para empezar a colocar los puntos interactivos. 
            También puedes usar rutas locales (Ej. `/interactive_office_scene.png`).
          </p>

          <form onSubmit={handleSubmitUrl} style={{ display: 'flex', gap: '1rem' }}>
            <input 
              type="text" 
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              placeholder="https://ejemplo.com/mi-imagen.png"
              style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
              required
            />
            <button type="submit" className={styles.btnSecondary} style={{ background: '#3b82f6', color: 'white' }}>
              Cargar Imagen
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
