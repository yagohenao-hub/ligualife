import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { FlashcardViewer } from '@/components/FlashcardViewer'
import { getAllFlashcardPacks, fetchFlashcardPacksFromServer, FlashcardPack } from '@/lib/flashcards'
import styles from '@/styles/Landing.module.css'

export default function StudentFlashcardsPage() {
  const router = useRouter()
  const [packs, setPacks] = useState<FlashcardPack[]>([])
  const [selectedPack, setSelectedPack] = useState<FlashcardPack | undefined>(undefined)

  useEffect(() => {
    const qPackId = router.query.packId as string | undefined
    const list = getAllFlashcardPacks()
    setPacks(list)
    if (list.length > 0) {
      const match = qPackId ? list.find(p => p.id === qPackId) : list[0]
      setSelectedPack(match || list[0])
    }

    fetchFlashcardPacksFromServer().then(fresh => {
      if (fresh && fresh.length > 0) {
        setPacks(fresh)
        setSelectedPack(prev => {
          if (qPackId) {
            const byQuery = fresh.find(p => p.id === qPackId)
            if (byQuery) return byQuery
          }
          return fresh.find(p => p.id === prev?.id) || fresh[0]
        })
      }
    })
  }, [router.query.packId])

  return (
    <>
      <Head>
        <title>Flashcards Conceptuales | LinguaLife</title>
        <meta name="description" content="Aprende familias de palabras, polisemia y conceptos avanzados en inglés con tarjetas visuales e interactivas." />
      </Head>

      <div className={styles.pageContainer} style={{ padding: '2rem 1rem' }}>
        <div className={styles.container}>
          <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Link href="/student" style={{ color: '#a1a1aa', textDecoration: 'none', fontSize: '0.9rem' }}>
                ← Portal de Alumno
              </Link>
            </div>

            <span style={{ fontSize: '0.8rem', color: '#7c3aed', background: 'rgba(124, 58, 237, 0.15)', padding: '0.3rem 0.8rem', borderRadius: '999px', fontWeight: 700 }}>
              🃏 Mini-App de Vocabulario Conceptual
            </span>
          </div>

          <FlashcardViewer pack={selectedPack} />
        </div>
      </div>
    </>
  )
}
