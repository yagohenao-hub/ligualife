import { useState, useRef } from 'react'
import { InteractiveScene, Hotspot } from '@/lib/interactive-scenes'
import { HotspotConfigModal } from './HotspotConfigModal'

interface VisualSceneEditorProps {
  scene: InteractiveScene
  onChangeScene: (scene: InteractiveScene) => void
}

export function VisualSceneEditor({ scene, onChangeScene }: VisualSceneEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  
  const [editingHotspot, setEditingHotspot] = useState<Partial<Hotspot> | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Si estamos arrastrando, ignorar el clic
    if (draggingId) return

    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    
    // Calcular porcentaje de click
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100)
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100)

    setEditingHotspot({ x, y })
  }

  const handleHotspotClick = (e: React.MouseEvent, h: Hotspot) => {
    e.stopPropagation()
    setEditingHotspot(h)
  }

  const handleSaveHotspot = (hotspot: Hotspot) => {
    const isNew = !scene.hotspots.find(h => h.id === hotspot.id)
    let newHotspots = [...scene.hotspots]

    if (isNew) {
      newHotspots.push(hotspot)
    } else {
      newHotspots = newHotspots.map(h => h.id === hotspot.id ? hotspot : h)
    }

    onChangeScene({
      ...scene,
      hotspots: newHotspots,
      totalVerbs: newHotspots.length
    })
    setEditingHotspot(null)
  }

  const handleDeleteHotspot = () => {
    if (!editingHotspot?.id) return
    const newHotspots = scene.hotspots.filter(h => h.id !== editingHotspot.id)
    onChangeScene({
      ...scene,
      hotspots: newHotspots,
      totalVerbs: newHotspots.length
    })
    setEditingHotspot(null)
  }

  const handlePointerDown = (e: React.PointerEvent, id: string) => {
    e.stopPropagation()
    setDraggingId(id)
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent, id: string) => {
    if (draggingId !== id) return
    e.stopPropagation()

    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    
    let x = Math.round(((e.clientX - rect.left) / rect.width) * 100)
    let y = Math.round(((e.clientY - rect.top) / rect.height) * 100)

    // Boundaries
    x = Math.max(0, Math.min(100, x))
    y = Math.max(0, Math.min(100, y))

    const newHotspots = scene.hotspots.map(h => 
      h.id === id ? { ...h, x, y } : h
    )

    onChangeScene({
      ...scene,
      hotspots: newHotspots
    })
  }

  const handlePointerUp = (e: React.PointerEvent, id: string) => {
    if (draggingId === id) {
      e.stopPropagation()
      setDraggingId(null)
      ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
    }
  }

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Tooltip header */}
      <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '1rem', borderRadius: '12px', marginBottom: '1rem', color: '#60a5fa', fontSize: '0.9rem' }}>
        <strong>Modo Edición:</strong> Haz clic en cualquier parte de la imagen para añadir un punto. Arrastra los puntos existentes para moverlos. Haz clic en un punto para editar su contenido.
      </div>

      <div 
        ref={containerRef}
        onClick={handleImageClick}
        style={{
          position: 'relative',
          width: '100%',
          borderRadius: '16px',
          overflow: 'hidden',
          border: '2px dashed rgba(255, 255, 255, 0.2)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
          background: '#090d12',
          cursor: 'crosshair',
          touchAction: 'none' // Prevent scrolling while dragging
        }}
      >
        <img
          src={scene.imageSrc}
          alt={scene.title}
          style={{ width: '100%', height: 'auto', display: 'block', pointerEvents: 'none' }}
        />

        {scene.hotspots.map((h) => (
          <div
            key={h.id}
            onPointerDown={(e) => handlePointerDown(e, h.id)}
            onPointerMove={(e) => handlePointerMove(e, h.id)}
            onPointerUp={(e) => handlePointerUp(e, h.id)}
            onPointerCancel={(e) => handlePointerUp(e, h.id)}
            onClick={(e) => handleHotspotClick(e, h)}
            style={{
              position: 'absolute',
              top: `${h.y}%`,
              left: `${h.x}%`,
              transform: 'translate(-50%, -50%)',
              width: draggingId === h.id ? '36px' : '30px',
              height: draggingId === h.id ? '36px' : '30px',
              borderRadius: '50%',
              background: '#3b82f6',
              border: '3px solid #ffffff',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              cursor: draggingId === h.id ? 'grabbing' : 'grab',
              zIndex: draggingId === h.id ? 20 : 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.75rem'
            }}
          >
            ✏️
          </div>
        ))}
      </div>

      {editingHotspot && (
        <HotspotConfigModal 
          hotspot={editingHotspot}
          onSave={handleSaveHotspot}
          onCancel={() => setEditingHotspot(null)}
          onDelete={editingHotspot.id ? handleDeleteHotspot : undefined}
        />
      )}
    </div>
  )
}
