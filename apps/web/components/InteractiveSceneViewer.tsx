import { useState, useEffect } from 'react'
import { INITIAL_OFFICE_SCENE, InteractiveScene, Hotspot } from '@/lib/interactive-scenes'
import styles from '@/styles/Landing.module.css'

interface InteractiveSceneViewerProps {
  scene?: InteractiveScene
}

export function InteractiveSceneViewer({ scene: customScene }: InteractiveSceneViewerProps) {
  const [scene, setScene] = useState<InteractiveScene>(customScene || INITIAL_OFFICE_SCENE)
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null)
  const [discoveredIds, setDiscoveredIds] = useState<Set<string>>(new Set())
  const [showTranslation, setShowTranslation] = useState(false)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)

  useEffect(() => {
    if (customScene) {
      setScene(customScene)
      setDiscoveredIds(new Set())
      setActiveHotspot(null)
    }
  }, [customScene])

  function handleHotspotClick(hotspot: Hotspot) {
    setActiveHotspot(hotspot)
    setShowTranslation(false)
    setDiscoveredIds(prev => new Set(prev).add(hotspot.id))
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

  const totalVerbs = scene.hotspots.length || scene.totalVerbs || 1
  const progressPercent = Math.round((discoveredIds.size / totalVerbs) * 100)

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header bar with tracker */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(18, 18, 24, 0.9)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '1rem 1.5rem',
          borderRadius: '16px 16px 0 0',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f4f4f5', margin: 0 }}>
            {scene.title}
          </h3>
          <p style={{ fontSize: '0.825rem', color: '#a1a1aa', margin: '0.2rem 0 0 0' }}>
            {scene.subtitle}
          </p>
        </div>

        {/* Progress tracker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>
              Progreso de Verbos
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#10b981' }}>
              {discoveredIds.size} / {totalVerbs} Descubiertos
            </div>
          </div>
          
          <div style={{ width: '54px', height: '54px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="54" height="54" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="3.8"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#10b981"
                strokeWidth="3.8"
                strokeDasharray={`${progressPercent}, 100`}
              />
            </svg>
            <span style={{ position: 'absolute', fontSize: '0.75rem', fontWeight: 800, color: '#fff' }}>
              {progressPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* Main Image Stage */}
      <div 
        style={{
          position: 'relative',
          width: '100%',
          borderRadius: '0 0 16px 16px',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderTop: 'none',
          boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
          background: '#090d12'
        }}
      >
        <img
          src={scene.imageSrc}
          alt={scene.title}
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />

        {/* Hotspots overlay */}
        {scene.hotspots.map((h) => {
          const isDiscovered = discoveredIds.has(h.id)
          const isActive = activeHotspot?.id === h.id

          return (
            <button
              key={h.id}
              onClick={() => handleHotspotClick(h)}
              style={{
                position: 'absolute',
                top: `${h.y}%`,
                left: `${h.x}%`,
                transform: 'translate(-50%, -50%)',
                width: isActive ? '36px' : '30px',
                height: isActive ? '36px' : '30px',
                borderRadius: '50%',
                background: isActive 
                  ? 'linear-gradient(135deg, #7c3aed, #3b82f6)' 
                  : isDiscovered 
                  ? '#10b981' 
                  : 'rgba(239, 68, 68, 0.9)',
                border: '3px solid #ffffff',
                boxShadow: isActive 
                  ? '0 0 20px #7c3aed, 0 0 30px #3b82f6' 
                  : '0 4px 12px rgba(0,0,0,0.5)',
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                zIndex: isActive ? 20 : 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.75rem',
                outline: 'none'
              }}
              title={`Verbo: ${h.verb}`}
            >
              {isDiscovered ? '✓' : '?'}
            </button>
          )
        })}
      </div>

      {/* Floating Active Hotspot Popup Card */}
      {activeHotspot && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1.25rem'
          }}
          onClick={() => setActiveHotspot(null)}
        >
          <div
            style={{
              background: '#121218',
              border: '1px solid rgba(124, 58, 237, 0.4)',
              borderRadius: '20px',
              padding: '2rem',
              maxWidth: '480px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9)',
              position: 'relative'
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveHotspot(null)}
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <span style={{ background: 'rgba(124, 58, 237, 0.2)', border: '1px solid #7c3aed', color: '#c4b5fd', padding: '0.25rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                {activeHotspot.category}
              </span>
              <span style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: 700 }}>
                Nivel {activeHotspot.level}
              </span>
            </div>

            <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
              {activeHotspot.verb}
            </h3>

            <div style={{ background: 'rgba(255,255,255,0.04)', borderLeft: '3px solid #3b82f6', padding: '1rem', borderRadius: '6px', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                FRASE EN CONTEXTO:
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#f4f4f5', lineHeight: 1.4 }}>
                "{activeHotspot.sentence}"
              </div>
            </div>

            {/* Actions: Listen Audio & Toggle Translation */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => playAudio(activeHotspot.sentence)}
                className={styles.btnPrimary}
                style={{ fontSize: '0.85rem', padding: '0.55rem 1rem' }}
              >
                {isPlayingAudio ? '🔊 Reproduciendo Voz Nativa...' : '▶ Escuchar Pronunciación'}
              </button>

              <button
                onClick={() => setShowTranslation(!showTranslation)}
                className={styles.btnSecondary}
                style={{ fontSize: '0.85rem', padding: '0.55rem 1rem' }}
              >
                {showTranslation ? 'Ocultar Traducción' : 'Ver Traducción 🇪🇸'}
              </button>
            </div>

            {showTranslation && (
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.85rem 1rem', borderRadius: '8px', color: '#34d399', fontSize: '0.9rem' }}>
                <strong>Español:</strong> {activeHotspot.translation}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
