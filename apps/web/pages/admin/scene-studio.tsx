import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { InteractiveScene, saveScene, getAllScenes } from '@/lib/interactive-scenes'
import { SceneGeneratorForm } from '@/components/admin/SceneGeneratorForm'
import { VisualSceneEditor } from '@/components/admin/VisualSceneEditor'
import styles from '@/styles/Landing.module.css'

export default function SceneStudio() {
  const [scenes, setScenes] = useState<InteractiveScene[]>([])
  const [currentScene, setCurrentScene] = useState<InteractiveScene | null>(null)
  
  // Modos: 'list', 'generate', 'edit'
  const [mode, setMode] = useState<'list' | 'generate' | 'edit'>('list')

  useEffect(() => {
    setScenes(getAllScenes())
  }, [])

  const handleCreateNew = () => {
    setMode('generate')
  }

  const handleImageReady = (imageSrc: string) => {
    // Inicializar nueva escena
    const newScene: InteractiveScene = {
      id: `scene_${Date.now()}`,
      title: 'Nueva Escena Interactiva',
      subtitle: 'Haz clic en la imagen para agregar puntos de vocabulario',
      imageSrc,
      totalVerbs: 0,
      hotspots: [],
      createdAt: new Date().toISOString()
    }
    setCurrentScene(newScene)
    setMode('edit')
  }

  const handleEditScene = (scene: InteractiveScene) => {
    setCurrentScene(scene)
    setMode('edit')
  }

  const handleSaveScene = () => {
    if (currentScene) {
      saveScene(currentScene)
      setScenes(getAllScenes())
      setMode('list')
      setCurrentScene(null)
    }
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Scene Studio - LinguaLife</title>
      </Head>

      <main className={styles.main} style={{ padding: '2rem 1rem' }}>
        <div style={{ width: '100%', maxWidth: '1200px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 className={styles.title} style={{ fontSize: '2.5rem', margin: 0, textAlign: 'left' }}>
              Scene <span style={{ color: '#10b981' }}>Studio</span>
            </h1>
            <p style={{ color: '#9ca3af', margin: '0.5rem 0 0 0' }}>Gestor de Vocabulario Visual Interactivo</p>
          </div>
          <Link href="/admin" style={{ color: '#9ca3af', textDecoration: 'none', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '8px' }}>
            ← Volver a Admin
          </Link>
        </div>

        {mode === 'list' && (
          <div style={{ width: '100%', maxWidth: '1200px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Mis Escenas</h2>
              <button className={styles.btnPrimary} onClick={handleCreateNew}>
                + Crear Nueva Escena
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {scenes.map(scene => (
                <div key={scene.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', overflow: 'hidden' }}>
                  <div style={{ height: '160px', background: `url(${scene.imageSrc}) center/cover` }} />
                  <div style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.5rem 0' }}>{scene.title}</h3>
                    <p style={{ color: '#9ca3af', fontSize: '0.85rem', margin: '0 0 1rem 0' }}>{scene.hotspots.length} puntos interactivos</p>
                    <button 
                      onClick={() => handleEditScene(scene)}
                      className={styles.btnSecondary}
                      style={{ width: '100%', background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }}
                    >
                      Editar Escena
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {mode === 'generate' && (
          <div style={{ width: '100%', maxWidth: '1000px' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <button onClick={() => setMode('list')} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
                ← Cancelar
              </button>
            </div>
            <SceneGeneratorForm onImageReady={handleImageReady} />
          </div>
        )}

        {mode === 'edit' && currentScene && (
          <div style={{ width: '100%', maxWidth: '1200px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ flex: 1 }}>
                <input 
                  type="text" 
                  value={currentScene.title}
                  onChange={(e) => setCurrentScene({...currentScene, title: e.target.value})}
                  style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '1.5rem', fontWeight: 'bold', width: '100%', outline: 'none' }}
                  placeholder="Título de la escena"
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  onClick={() => {
                    setCurrentScene(null)
                    setMode('list')
                  }} 
                  className={styles.btnSecondary}
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSaveScene} 
                  className={styles.btnPrimary}
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
            
            <VisualSceneEditor 
              scene={currentScene} 
              onChangeScene={setCurrentScene} 
            />
          </div>
        )}

      </main>
    </div>
  )
}
