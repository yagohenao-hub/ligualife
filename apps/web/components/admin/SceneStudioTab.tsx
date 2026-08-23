import { useState, useEffect, useRef } from 'react'
import { getAllScenes, saveScene, deleteScene, InteractiveScene, Hotspot, INITIAL_OFFICE_SCENE } from '@/lib/interactive-scenes'
import styles from '@/styles/Admin.module.css'

export function SceneStudioTab() {
  const [scenes, setScenes] = useState<InteractiveScene[]>([])
  const [editingScene, setEditingScene] = useState<InteractiveScene | null>(null)
  const [step, setStep] = useState<'list' | 'step1' | 'step2'>('list')
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)

  // Step 1 Form State
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [imageSrc, setImageSrc] = useState('')
  const [category, setCategory] = useState('Fitness & Gimnasio')
  const [webUrl, setWebUrl] = useState('')
  const [vocabInput, setVocabInput] = useState('')

  // Step 2 Canvas State
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const imageRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    setScenes(getAllScenes())
  }, [])

  function handleStartNew() {
    setTitle('Fitness & Workout Scene')
    setSubtitle('Haz clic en las personas en el gimnasio para aprender expresiones de fitness en inglés.')
    setImageSrc('')
    setCategory('Fitness & Gimnasio')
    setWebUrl('https://www.espressoenglish.net/50-english-vocabulary-words-for-fitness-exercise/')
    setVocabInput('Stretching, Lifting weights, Squatting, Hydrating')
    setStep('step1')
  }

  function handleEditExisting(scene: InteractiveScene) {
    setEditingScene(JSON.parse(JSON.stringify(scene)))
    setStep('step2')
  }

  function handleDeleteScene(id: string) {
    if (id === INITIAL_OFFICE_SCENE.id) {
      alert('La escena inicial por defecto no se puede eliminar.')
      return
    }
    if (confirm('¿Estás seguro de eliminar esta escena?')) {
      deleteScene(id)
      setScenes(getAllScenes())
    }
  }

  // ✨ Generate Scene via AI Scraper & Prompt Pipeline
  async function handleGenerateWithAI(e?: React.FormEvent) {
    if (e) e.preventDefault()
    setIsGeneratingAI(true)

    try {
      const targetUrl = webUrl || (vocabInput.includes('http') ? vocabInput : '')
      const res = await fetch('/api/admin/generate-scene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || 'Escena Interactiva B2',
          category: category || 'General',
          level: 'B2',
          url: targetUrl,
          vocabInput: vocabInput,
        })
      })

      const data = await res.json()
      if (!res.ok || !data.scene) {
        throw new Error(data.error || 'Error al generar la escena con IA')
      }

      setEditingScene(data.scene)
      setSelectedHotspot(data.scene.hotspots[0] || null)
      setStep('step2')
    } catch (err: any) {
      alert(`⚠️ ${err.message || 'Error en la generación por IA'}`)
    } finally {
      setIsGeneratingAI(false)
    }
  }

  function handleStep1Submit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return alert('El título es requerido.')

    // Check if user entered a URL in vocabInput or webUrl -> auto route to AI scraper
    if (webUrl || vocabInput.includes('http://') || vocabInput.includes('https://')) {
      handleGenerateWithAI()
      return
    }

    // Manual creation fallback
    const initialVerbs = vocabInput.split(',').map(v => v.trim()).filter(Boolean)
    const fallbackImage = imageSrc.trim() || '/interactive_office_scene.png'

    const newHotspots: Hotspot[] = (initialVerbs.length > 0 ? initialVerbs : ['Action 1', 'Action 2']).map((v, i) => ({
      id: `h_auto_${Date.now()}_${i}`,
      x: Math.min(85, Math.max(15, 20 + (i * 18) % 70)),
      y: Math.min(80, Math.max(20, 30 + (i * 15) % 50)),
      verb: v,
      sentence: `He is ${v.toLowerCase()} in the ${category.toLowerCase()} area.`,
      translation: `Él está realizando la acción de ${v.toLowerCase()} en el área.`,
      level: 'B2',
      category: category,
    }))

    const newScene: InteractiveScene = {
      id: `scene_${Date.now()}`,
      title,
      subtitle: subtitle || 'Haz clic en los personajes para aprender inglés en contexto.',
      imageSrc: fallbackImage,
      totalVerbs: newHotspots.length,
      hotspots: newHotspots,
      createdAt: new Date().toISOString().split('T')[0],
    }

    setEditingScene(newScene)
    setSelectedHotspot(newHotspots[0] || null)
    setStep('step2')
  }

  function handleCanvasClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!editingScene || !imageRef.current) return
    const rect = imageRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const clickY = e.clientY - rect.top

    const percentX = Math.round((clickX / rect.width) * 100)
    const percentY = Math.round((clickY / rect.height) * 100)

    const newHotspot: Hotspot = {
      id: `h_${Date.now()}`,
      x: Math.min(95, Math.max(5, percentX)),
      y: Math.min(95, Math.max(5, percentY)),
      verb: 'New Action',
      sentence: 'She is performing a novel action in this area.',
      translation: 'Ella está realizando una nueva acción en este punto.',
      level: 'B2',
      category: category || 'General',
    }

    const updatedScene = {
      ...editingScene,
      hotspots: [...editingScene.hotspots, newHotspot],
      totalVerbs: editingScene.hotspots.length + 1,
    }

    setEditingScene(updatedScene)
    setSelectedHotspot(newHotspot)
  }

  function handleUpdateSelectedHotspot(field: keyof Hotspot, value: any) {
    if (!editingScene || !selectedHotspot) return
    const updatedHotspot = { ...selectedHotspot, [field]: value }

    const updatedHotspots = editingScene.hotspots.map(h => 
      h.id === selectedHotspot.id ? updatedHotspot : h
    )

    setEditingScene({
      ...editingScene,
      hotspots: updatedHotspots,
      totalVerbs: updatedHotspots.length,
    })
    setSelectedHotspot(updatedHotspot)
  }

  function handleDeleteHotspot(id: string) {
    if (!editingScene) return
    const updatedHotspots = editingScene.hotspots.filter(h => h.id !== id)
    setEditingScene({
      ...editingScene,
      hotspots: updatedHotspots,
      totalVerbs: updatedHotspots.length,
    })
    setSelectedHotspot(null)
  }

  function playAudio(text: string) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US'
      utterance.rate = 0.88
      utterance.onstart = () => setIsPlayingAudio(true)
      utterance.onend = () => setIsPlayingAudio(false)
      utterance.onerror = () => setIsPlayingAudio(false)
      window.speechSynthesis.speak(utterance)
    }
  }

  function handleSaveFinal() {
    if (!editingScene) return
    saveScene(editingScene)
    setScenes(getAllScenes())
    setStep('list')
    setEditingScene(null)
    alert('🎉 ¡Escena interactiva guardada y publicada en la biblioteca!')
  }

  return (
    <div style={{ padding: '1rem 0' }}>
      {/* Step 1: List View */}
      {step === 'list' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f4f4f5', margin: 0 }}>
                Studio de Escenas Interactivas ("Buscando a Waldo")
              </h2>
              <p style={{ color: '#a1a1aa', fontSize: '0.9rem', margin: '0.3rem 0 0 0' }}>
                Crea talleres visuales con IA. Ingresa un tema o URL de vocabulario y el sistema extraerá los verbos y generará la ilustración.
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
              + Crear Nueva Escena con IA
            </button>
          </div>

          {/* Grid of Scenes */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {scenes.map(s => (
              <div
                key={s.id}
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
                <div style={{ height: '180px', overflow: 'hidden', position: 'relative', background: '#090d12' }}>
                  <img src={s.imageSrc} alt={s.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <span style={{ position: 'absolute', top: '10px', right: '10px', background: '#10b981', color: '#fff', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>
                    {s.hotspots.length} Puntos
                  </span>
                </div>

                <div style={{ padding: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f4f4f5', marginBottom: '0.4rem' }}>
                    {s.title}
                  </h3>
                  <p style={{ fontSize: '0.825rem', color: '#9ca3af', lineHeight: 1.4, marginBottom: '1.25rem' }}>
                    {s.subtitle}
                  </p>

                  <div style={{ display: 'flex', gap: '0.6rem' }}>
                    <button
                      onClick={() => handleEditExisting(s)}
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
                      ✏️ Editar Hotspots
                    </button>

                    {s.id !== INITIAL_OFFICE_SCENE.id && (
                      <button
                        onClick={() => handleDeleteScene(s.id)}
                        style={{
                          background: 'rgba(239, 68, 68, 0.15)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          color: '#ef4444',
                          padding: '0.5rem 0.8rem',
                          borderRadius: '8px',
                          fontSize: '0.85rem',
                          cursor: 'pointer'
                        }}
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Form Builder */}
      {step === 'step1' && (
        <div style={{ maxWidth: '680px', margin: '0 auto', background: 'rgba(18, 18, 24, 0.95)', border: '1px solid rgba(124, 58, 237, 0.3)', padding: '2rem', borderRadius: '20px', boxShadow: '0 20px 50px rgba(0,0,0,0.8)' }}>
          <button onClick={() => setStep('list')} style={{ background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer', marginBottom: '1rem' }}>
            ← Volver a la biblioteca
          </button>

          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginBottom: '0.4rem' }}>
            Paso 1: Generador & Embudo de IA (Prompt + Scraper)
          </h2>
          <p style={{ color: '#a1a1aa', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            Pega la URL de una lección o ingresa el tema. Gemini extraerá las palabras B2 y generará la ilustración de la escena automáticamente.
          </p>

          <form onSubmit={handleStep1Submit}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', color: '#d4d4d8', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Título / Tema de la Escena *
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ej: Fitness & Exercise Vocabulary, Aeropuerto Internacional..."
                style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '0.75rem', borderRadius: '8px', outline: 'none' }}
                required
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', color: '#7c3aed', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                🔗 URL de Artículo o Web de Vocabulario (Recomendado)
              </label>
              <input
                type="url"
                value={webUrl}
                onChange={e => setWebUrl(e.target.value)}
                placeholder="https://www.espressoenglish.net/50-english-vocabulary-words-for-fitness-exercise/"
                style={{ width: '100%', background: 'rgba(124, 58, 237, 0.1)', border: '1px solid rgba(124, 58, 237, 0.4)', color: '#c4b5fd', padding: '0.75rem', borderRadius: '8px', outline: 'none' }}
              />
              <span style={{ fontSize: '0.75rem', color: '#a78bfa', marginTop: '0.2rem', display: 'block' }}>
                ✨ Si pegas un enlace aquí, Gemini analizará la web y extraerá automáticamente los 10 verbos B2 con oraciones y traducción.
              </span>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', color: '#d4d4d8', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Categoría / Sesgo
              </label>
              <input
                type="text"
                value={category}
                onChange={e => setCategory(e.target.value)}
                placeholder="Ej: Fitness, Negocios, Aeropuerto, Restaurante"
                style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '0.75rem', borderRadius: '8px', outline: 'none' }}
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', color: '#d4d4d8', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Palabras Clave Opcionales o Texto Libre
              </label>
              <textarea
                value={vocabInput}
                onChange={e => setVocabInput(e.target.value)}
                placeholder="Stretching, Lifting weights, Squatting, Hydrating, Jogging"
                rows={2}
                style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '0.75rem', borderRadius: '8px', outline: 'none' }}
              />
            </div>

            <div style={{ marginBottom: '1.75rem' }}>
              <label style={{ display: 'block', color: '#d4d4d8', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                URL de Imagen Personalizada (Opcional - Dejar vacío para Generar por IA)
              </label>
              <input
                type="text"
                value={imageSrc}
                onChange={e => setImageSrc(e.target.value)}
                placeholder="Dejar vacío para generar ilustración isométrica con IA..."
                style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '0.75rem', borderRadius: '8px', outline: 'none' }}
              />
            </div>

            <button
              type="button"
              onClick={() => handleGenerateWithAI()}
              disabled={isGeneratingAI}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)',
                color: '#fff',
                border: 'none',
                padding: '0.95rem',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '1rem',
                cursor: isGeneratingAI ? 'wait' : 'pointer',
                boxShadow: '0 4px 20px rgba(124, 58, 237, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              {isGeneratingAI ? '🧠 Analizando URL y Generando Ilustración con IA...' : '✨ Generar Ilustración con IA & Extraer Vocabulario ➔'}
            </button>
          </form>
        </div>
      )}

      {/* Step 3: Interactive Visual Canvas Hotspot Editor */}
      {step === 'step2' && editingScene && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <button onClick={() => setStep('list')} style={{ background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}>
              ← Cancelar y volver
            </button>
            <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
              Paso 2: Editor Visual de Puntos ({editingScene.hotspots.length} Puntos en {editingScene.title})
            </h3>
            <button
              onClick={handleSaveFinal}
              style={{ background: '#10b981', color: '#fff', border: 'none', padding: '0.65rem 1.4rem', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}
            >
              💾 Guardar & Publicar Escena
            </button>
          </div>

          <p style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            👇 <strong>Haz clic en cualquier parte de la imagen</strong> para agregar un nuevo punto de interés, o haz clic sobre un punto existente para editar su verbo, frase y traducción.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem', alignItems: 'start' }}>
            {/* Visual Canvas */}
            <div
              onClick={handleCanvasClick}
              style={{
                position: 'relative',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '2px solid #7c3aed',
                cursor: 'crosshair',
                boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
                background: '#090d12',
                minHeight: '350px'
              }}
            >
              <img
                ref={imageRef}
                src={editingScene.imageSrc}
                alt={editingScene.title}
                style={{ width: '100%', height: 'auto', display: 'block', userSelect: 'none' }}
              />

              {editingScene.hotspots.map((h) => {
                const isSelected = selectedHotspot?.id === h.id
                return (
                  <div
                    key={h.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedHotspot(h)
                    }}
                    style={{
                      position: 'absolute',
                      top: `${h.y}%`,
                      left: `${h.x}%`,
                      transform: 'translate(-50%, -50%)',
                      width: isSelected ? '34px' : '26px',
                      height: isSelected ? '34px' : '26px',
                      borderRadius: '50%',
                      background: isSelected ? '#7c3aed' : '#10b981',
                      border: '3px solid #ffffff',
                      boxShadow: isSelected ? '0 0 20px #7c3aed' : '0 4px 10px rgba(0,0,0,0.5)',
                      cursor: 'pointer',
                      zIndex: isSelected ? 30 : 20,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontWeight: 800,
                      fontSize: '0.75rem'
                    }}
                    title={h.verb}
                  >
                    ●
                  </div>
                )
              })}
            </div>

            {/* Sidebar Hotspot Inspector Form */}
            <div style={{ background: 'rgba(18, 18, 24, 0.95)', border: '1px solid rgba(255,255,255,0.1)', padding: '1.5rem', borderRadius: '16px' }}>
              {selectedHotspot ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem' }}>
                    <h4 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
                      Editar Punto ({selectedHotspot.x}%, {selectedHotspot.y}%)
                    </h4>
                    <button
                      onClick={() => handleDeleteHotspot(selectedHotspot.id)}
                      style={{ background: 'rgba(239,68,68,0.2)', border: 'none', color: '#ef4444', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 700 }}
                    >
                      Eliminar Punto
                    </button>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', color: '#a1a1aa', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                      Palabra / Verbo B2
                    </label>
                    <input
                      type="text"
                      value={selectedHotspot.verb}
                      onChange={e => handleUpdateSelectedHotspot('verb', e.target.value)}
                      style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '0.6rem', borderRadius: '6px', outline: 'none' }}
                    />
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', color: '#a1a1aa', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                      Frase Descriptiva en Contexto (Inglés)
                    </label>
                    <textarea
                      value={selectedHotspot.sentence}
                      onChange={e => handleUpdateSelectedHotspot('sentence', e.target.value)}
                      rows={3}
                      style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '0.6rem', borderRadius: '6px', outline: 'none' }}
                    />
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', color: '#a1a1aa', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                      Traducción al Español
                    </label>
                    <textarea
                      value={selectedHotspot.translation}
                      onChange={e => handleUpdateSelectedHotspot('translation', e.target.value)}
                      rows={2}
                      style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '0.6rem', borderRadius: '6px', outline: 'none' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    <div>
                      <label style={{ display: 'block', color: '#a1a1aa', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                        Nivel CEFR
                      </label>
                      <select
                        value={selectedHotspot.level}
                        onChange={e => handleUpdateSelectedHotspot('level', e.target.value)}
                        style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '0.5rem', borderRadius: '6px' }}
                      >
                        <option value="A2+">A2+</option>
                        <option value="B1+">B1+</option>
                        <option value="B2">B2</option>
                        <option value="B2+">B2+</option>
                        <option value="C1">C1</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', color: '#a1a1aa', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                        Categoría
                      </label>
                      <input
                        type="text"
                        value={selectedHotspot.category}
                        onChange={e => handleUpdateSelectedHotspot('category', e.target.value)}
                        style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '0.5rem', borderRadius: '6px' }}
                      />
                    </div>
                  </div>

                  {/* Audio Test Button */}
                  <button
                    onClick={() => playAudio(selectedHotspot.sentence)}
                    style={{ width: '100%', background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)', color: '#60a5fa', padding: '0.6rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    {isPlayingAudio ? '🔊 Reproduciendo Voz Nativa...' : '▶ Probar Audio Sintético WebSpeech'}
                  </button>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem 0', color: '#9ca3af' }}>
                  👆 Haz clic en cualquier parte de la imagen a la izquierda para crear un nuevo punto o selecciona uno existente para editar.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
