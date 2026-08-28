import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { InteractiveSceneViewer } from '@/components/InteractiveSceneViewer'
import { getAllScenes, fetchScenesFromServer, InteractiveScene } from '@/lib/interactive-scenes'
import styles from '@/styles/Landing.module.css'

export default function StudentInteractiveScenePage() {
  const [scenes, setScenes] = useState<InteractiveScene[]>([])
  const [selectedScene, setSelectedScene] = useState<InteractiveScene | undefined>(undefined)

  useEffect(() => {
    const list = getAllScenes()
    setScenes(list)
    if (list.length > 0) {
      setSelectedScene(list[0])
    }
    fetchScenesFromServer().then(fresh => {
      if (fresh && fresh.length > 0) {
        setScenes(fresh)
        setSelectedScene(prev => fresh.find(s => s.id === prev?.id) || fresh[0])
      }
    })
  }, [])

  return (
    <>
      <Head>
        <title>Taller de Vocabulario Visual | LinguaLife</title>
        <meta name="description" content="Explora escenas interactivas para aprender verbos y expresiones B2 en contexto." />
      </Head>

      <div className={styles.pageContainer} style={{ padding: '2rem 1rem' }}>
        <div className={styles.container}>
          <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Link href="/student" style={{ color: '#a1a1aa', textDecoration: 'none', fontSize: '0.9rem' }}>
                ← Portal de Alumno
              </Link>
              <Link href="/student/flashcards" style={{ color: '#c4b5fd', background: 'rgba(124, 58, 237, 0.15)', border: '1px solid rgba(124, 58, 237, 0.3)', textDecoration: 'none', fontSize: '0.825rem', padding: '0.3rem 0.8rem', borderRadius: '8px', fontWeight: 600 }}>
                🃏 Ir a Flashcards
              </Link>
            </div>

            {scenes.length > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.825rem', color: '#a1a1aa' }}>Seleccionar Escena:</span>
                <select
                  value={selectedScene?.id}
                  onChange={e => {
                    const found = scenes.find(s => s.id === e.target.value)
                    if (found) setSelectedScene(found)
                  }}
                  style={{ background: 'rgba(18,18,24,0.9)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.85rem' }}
                >
                  {scenes.map(s => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                </select>
              </div>
            )}

            <span style={{ fontSize: '0.8rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '0.3rem 0.8rem', borderRadius: '999px', fontWeight: 600 }}>
              Taller de Vocabulario B2
            </span>
          </div>

          <InteractiveSceneViewer scene={selectedScene} />
        </div>
      </div>
    </>
  )
}
