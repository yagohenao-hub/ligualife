import { useState, useEffect, useRef } from 'react'
import { Search, RefreshCw, Check, X, Youtube, Sparkles, User, Loader2, AlertCircle } from 'lucide-react'
import styles from './App.module.css'

interface Video {
  id: string
  title: string
  url: string
  thumbnail: string
  duration?: number
  isNative: boolean
}

export default function App() {
  const [query, setQuery] = useState('')
  const [queue, setQueue] = useState<Video[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [level, setLevel] = useState('Medium')
  const [vertical, setVertical] = useState('General')
  const [isOrganic, setIsOrganic] = useState(true)
  
  const isFetchingRef = useRef(false)
  const hasFailedOnceRef = useRef(false)
  const [discardedIds, setDiscardedIds] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('curator_discarded')
    return saved ? new Set(JSON.parse(saved)) : new Set()
  })
  const discardedIdsRef = useRef(discardedIds)
  
  useEffect(() => {
    discardedIdsRef.current = discardedIds
  }, [discardedIds])

  // Initial load
  useEffect(() => {
    if (queue.length === 0 && !loading && !error) {
       handleDiscover(false)
    }
  }, [])

  // Infinite pre-fetch - ensures at least 25 videos are kept ahead
  useEffect(() => {
    const queueLeft = queue.length - currentIndex
    if (queue.length > 0 && queueLeft < 25 && !loading && !isFetchingRef.current && !hasFailedOnceRef.current) {
      handleDiscover(true)
    }
  }, [currentIndex, queue.length, loading])

  async function handleDiscover(append = false) {
    if (isFetchingRef.current && append) return
    isFetchingRef.current = true
    setLoading(true)
    
    if (!append) {
      setError(null)
      setQueue([])
      setCurrentIndex(0)
      hasFailedOnceRef.current = false
    }
    
    try {
      const controller = new AbortController()
      const tId = setTimeout(() => controller.abort(), 25000)

      const res = await fetch(`/api/scout/discover?q=${encodeURIComponent(query)}&organic=${isOrganic}`, {
        signal: controller.signal
      })
      const data = await res.json()
      clearTimeout(tId)

      if (!res.ok) throw new Error(data.message || 'Error en búsqueda')
      
      const currentDiscards = discardedIdsRef.current
      const incoming = (data.videos || []).filter((v: any) => !currentDiscards.has(v.id))
      
      if (incoming.length === 0 && !query.trim()) {
        // Auto-retry if empty and using random seed
        isFetchingRef.current = false 
        handleDiscover(append)
        return
      }

      if (append) {
        let addedCount = 0
        setQueue(prev => {
          const alive = prev.filter(p => !currentDiscards.has(p.id))
          const currentIds = new Set(alive.map(p => p.id))
          const fresh = incoming.filter((v: any) => !currentIds.has(v.id))
          addedCount = fresh.length
          return [...alive, ...fresh]
        })
        if (addedCount === 0) hasFailedOnceRef.current = true
      } else {
        setQueue(incoming)
        setCurrentIndex(0)
        if (incoming.length === 0) {
            hasFailedOnceRef.current = true
            setError(query.trim() ? `No encontramos videos nuevos para "${query}".` : 'No logramos cargar el feed aleatorio. YouTube responde lento, intenta de nuevo en un momento.')
        }
      }
    } catch (err: any) {
      console.error(err)
      if (!append || currentIndex >= queue.length) {
          setError(err.name === 'AbortError' ? 'La búsqueda tardó demasiado. YouTube timeout.' : err.message)
      }
      hasFailedOnceRef.current = true
    } finally {
      setLoading(false)
      isFetchingRef.current = false
    }
  }

  async function handleAction(action: 'add' | 'discard') {
    const vid = queue[currentIndex]
    if (!vid) return
    
    if (action === 'add') {
      try {
        const res = await fetch('/api/scout/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...vid, level, vertical })
        })
        if (!res.ok) throw new Error('Error Airtable')
        saveDiscard(vid.id)
      } catch (err: any) {
        alert(err.message)
        return
      }
    } else {
      saveDiscard(vid.id)
    }

    setCurrentIndex(prev => prev + 1)
  }

  function saveDiscard(id: string) {
    setDiscardedIds(prev => {
      const next = new Set(prev).add(id)
      localStorage.setItem('curator_discarded', JSON.stringify(Array.from(next)))
      return next
    })
  }

  const currentVideo = queue[currentIndex]
  const isEndReached = queue.length > 0 && currentIndex >= queue.length

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logoGroup}><Sparkles size={24} /><h1 className={styles.title}>Kurator</h1></div>
        <div className={styles.controlsGroup}>
            <div className={styles.searchBar}>
                <input placeholder="Busca un tema (vlogs, nyc interview...)" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleDiscover(false)} />
                <button className={styles.discoverBtn} onClick={() => handleDiscover(false)} disabled={loading && !currentVideo}>
                    {loading && !currentVideo ? <Loader2 className={styles.spinning} /> : <RefreshCw size={18} />}
                    {loading && currentVideo ? 'Cargando...' : 'Descubrir'}
                </button>
            </div>
            <button className={`${styles.toggleBtn} ${isOrganic ? styles.active : ''}`} onClick={() => {setIsOrganic(!isOrganic); handleDiscover(false)}}>
                <User size={18} /> {isOrganic ? 'Popular' : 'Estricto'}
            </button>
        </div>
      </header>

      <main className={styles.main}>
        {loading && queue.length === 0 && !error && (
            <div className={styles.loadingState}><Loader2 className={styles.spinning} size={48} /><p>Escaneando YouTube en busca de contenido...</p></div>
        )}

        {error && !currentVideo && (
            <div className={`${styles.error} glass`}>
                <AlertCircle size={32} />
                <p>{error}</p>
                <button onClick={() => {hasFailedOnceRef.current = false; handleDiscover(false)}}>
                    <RefreshCw size={16} /> Reintentar Búsqueda Aleatoria
                </button>
            </div>
        )}

        {isEndReached && !loading && (
          <div className={`${styles.emptyState} glass`}>
            <Youtube size={48} className={styles.emptyIcon} />
            <h3>Cola terminada</h3>
            <p>Ya viste todos los videos de este grupo.</p>
            <button className={styles.discoverBtn} onClick={() => {hasFailedOnceRef.current=false; handleDiscover(false)}} style={{marginTop: '1.5rem'}}>
                <RefreshCw size={18} /> Cargar mas videos
            </button>
          </div>
        )}

        {isEndReached && loading && (
          <div className={styles.loadingState}>
            <Loader2 className={styles.spinning} size={48} />
            <p>Buscando clips nativos automáticamente...</p>
          </div>
        )}

        {currentVideo && (
          <div className={styles.videoCard}>
            <div className={styles.videoHeader}>
              <div className={styles.queueInfoBadge}>
                <Youtube size={14} style={{ color: '#ff0000' }} />
                Video {currentIndex + 1} de {queue.length}
              </div>
              {loading && <span className={styles.loadBadge}><Loader2 className={styles.spinning} size={14} /> Refilling...</span>}
            </div>
            <div className={styles.playerWrapper}>
              <iframe 
                  key={currentVideo.id} 
                  src={`https://www.youtube.com/embed/${currentVideo.id}?autoplay=1`} 
                  frameBorder="0" allow="autoplay; encrypted-media; fullscreen" allowFullScreen 
              />
            </div>
            <div className={styles.videoInfo}>
              <p className={styles.subtitle}>Native Content Title:</p>
              <h2 className={styles.videoTitle}>{currentVideo.title}</h2>
              
              <div className={styles.metadataSelection}>
                <div className={styles.selectGroup}><label>Level</label><select value={level} onChange={e => setLevel(e.target.value)}><option>Easy</option><option>Medium</option><option>Hard</option></select></div>
                <div className={styles.selectGroup}><label>Vertical</label><select value={vertical} onChange={e => setVertical(e.target.value)}><option>General</option><option>Business</option><option>Medical</option></select></div>
              </div>
              
              <div className={styles.actionGrid}>
                <button className={styles.discardBtn} onClick={() => handleAction('discard')} title="Discard (Ctrl+X)">
                  <X size={20} /> Skip (Descartar)
                </button>
                <button className={styles.addBtn} onClick={() => handleAction('add')} title="Save (Enter)">
                  <Check size={20} /> Add to Bank (Guardar)
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
