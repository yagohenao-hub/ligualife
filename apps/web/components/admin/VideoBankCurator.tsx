import { useState, useEffect, useRef } from 'react'
import { Search, RefreshCw, Check, X, Video, Sparkles, User, Loader2, AlertCircle } from 'lucide-react'
import styles from './VideoBankCurator.module.css'

interface Video {
  id: string
  title: string
  url: string
  thumbnail: string
  duration?: number
  isNative: boolean
}

export default function VideoBankCurator() {
  const [query, setQuery] = useState('')
  const [queue, setQueue] = useState<Video[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [level, setLevel] = useState('Medium')
  const [vertical, setVertical] = useState('General')
  const [isOrganic, setIsOrganic] = useState(true)
  const [savedCount, setSavedCount] = useState(0)

  const isFetchingRef = useRef(false)
  const hasFailedOnceRef = useRef(false)

  const [discardedIds, setDiscardedIds] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set()
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Infinite pre-fetch — keep at least 25 videos ahead
  useEffect(() => {
    const queueLeft = queue.length - currentIndex
    if (queue.length > 0 && queueLeft < 25 && !loading && !isFetchingRef.current && !hasFailedOnceRef.current) {
      handleDiscover(true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, queue.length, loading])

  async function handleDiscover(append = false, retryCount = 0) {
    if (isFetchingRef.current && append) return
    isFetchingRef.current = true
    setLoading(true)

    if (!append && retryCount === 0) {
      setError(null)
      hasFailedOnceRef.current = false
    }

    try {
      const controller = new AbortController()
      const tId = setTimeout(() => controller.abort(), 25000)

      const res = await fetch(
        `/api/scout/discover?q=${encodeURIComponent(query)}&organic=${isOrganic}`,
        { signal: controller.signal }
      )
      const data = await res.json()
      clearTimeout(tId)

      if (!res.ok) throw new Error(data.message || 'Error en búsqueda')

      const currentDiscards = discardedIdsRef.current
      const incoming = (data.videos || []).filter((v: Video) => !currentDiscards.has(v.id))

      // Auto-retry if empty and using random seed, up to 3 times
      if (incoming.length === 0 && !query.trim() && retryCount < 3) {
        isFetchingRef.current = false
        return handleDiscover(append, retryCount + 1)
      }

      if (append) {
        setQueue(prev => {
          const alive = prev.filter(p => !currentDiscards.has(p.id))
          const currentIds = new Set(alive.map(p => p.id))
          const fresh = incoming.filter((v: Video) => !currentIds.has(v.id))
          if (fresh.length === 0) hasFailedOnceRef.current = true
          return [...alive, ...fresh]
        })
      } else {
        setQueue(incoming)
        setCurrentIndex(0)
        if (incoming.length === 0) {
          hasFailedOnceRef.current = true
          setError(
            query.trim()
              ? `No encontramos videos nuevos para "${query}".`
              : 'No logramos cargar videos nuevos. Intenta con una búsqueda manual.'
          )
        }
      }
    } catch (err: any) {
      console.error(err)
      if (!append || currentIndex >= queue.length) {
        setError(
          err.name === 'AbortError'
            ? 'La búsqueda tardó demasiado. YouTube timeout.'
            : err.message
        )
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
          body: JSON.stringify({ ...vid, level, vertical }),
        })
        if (!res.ok) throw new Error('Error al guardar en Airtable')
        saveDiscard(vid.id)
        setSavedCount(c => c + 1)
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
    <div className={styles.wrap}>
      {/* ── Header bar ── */}
      <div className={styles.toolbar}>
        <div className={styles.logoGroup}>
          <Sparkles size={18} />
          <span className={styles.logoText}>Kurator</span>
          {savedCount > 0 && (
            <span className={styles.savedBadge}>+{savedCount} guardados esta sesión</span>
          )}
        </div>

        <div className={styles.controls}>
          <div className={styles.searchRow}>
            <Search size={15} className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              placeholder="Busca un tema (vlogs, nyc interview...)"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleDiscover(false)}
            />
            <button
              className={styles.discoverBtn}
              onClick={() => handleDiscover(false)}
              disabled={loading && !currentVideo}
            >
              {loading && !currentVideo ? <Loader2 className={styles.spinning} size={15} /> : <RefreshCw size={15} />}
              Descubrir
            </button>
          </div>

          <button
            className={`${styles.toggleBtn} ${isOrganic ? styles.toggleActive : ''}`}
            onClick={() => { setIsOrganic(o => !o); handleDiscover(false) }}
          >
            <User size={15} />
            {isOrganic ? 'Popular' : 'Estricto'}
          </button>
        </div>
      </div>

      {/* ── Content area ── */}
      <div className={styles.content}>

        {/* Loading — empty queue */}
        {loading && queue.length === 0 && !error && (
          <div className={styles.stateBox}>
            <Loader2 className={styles.spinning} size={40} />
            <p>Escaneando YouTube en busca de contenido nativo...</p>
          </div>
        )}

        {/* Error — no video to show */}
        {error && !currentVideo && (
          <div className={styles.stateBox}>
            <AlertCircle size={32} style={{ color: '#ef4444' }} />
            <p style={{ color: '#f87171' }}>{error}</p>
            <button
              className={styles.discoverBtn}
              onClick={() => { hasFailedOnceRef.current = false; handleDiscover(false) }}
            >
              <RefreshCw size={15} /> Reintentar búsqueda aleatoria
            </button>
          </div>
        )}

        {/* End of queue */}
        {isEndReached && !loading && (
          <div className={styles.stateBox}>
            <Video size={40} style={{ opacity: 0.25 }} />
            <h3 style={{ margin: 0 }}>Cola terminada</h3>
            <p>Ya revisaste todos los videos de este grupo.</p>
            <button
              className={styles.discoverBtn}
              onClick={() => { hasFailedOnceRef.current = false; handleDiscover(false) }}
            >
              <RefreshCw size={15} /> Cargar más videos
            </button>
          </div>
        )}

        {/* End of queue — loading more */}
        {isEndReached && loading && (
          <div className={styles.stateBox}>
            <Loader2 className={styles.spinning} size={40} />
            <p>Buscando más clips nativos...</p>
          </div>
        )}

        {/* Video card */}
        {currentVideo && (
          <div className={styles.videoCard}>
            {/* Card header */}
            <div className={styles.cardHeader}>
              <span className={styles.queueBadge}>
                <Video size={13} style={{ color: '#ff0000' }} />
                Video {currentIndex + 1} de {queue.length}
              </span>
              {loading && (
                <span className={styles.refillBadge}>
                  <Loader2 className={styles.spinning} size={13} /> Refilling...
                </span>
              )}
            </div>

            {/* Player — 9:16 */}
            <div className={styles.player}>
              <iframe
                key={currentVideo.id}
                src={`https://www.youtube.com/embed/${currentVideo.id}?autoplay=1`}
                frameBorder="0"
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
              />
            </div>

            {/* Info + actions */}
            <div className={styles.info}>
              <p className={styles.infoLabel}>Native Content</p>
              <h2 className={styles.videoTitle}>{currentVideo.title}</h2>

              <div className={styles.metaRow}>
                <div className={styles.selectGroup}>
                  <label>Level</label>
                  <select value={level} onChange={e => setLevel(e.target.value)}>
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                </div>
                <div className={styles.selectGroup}>
                  <label>Vertical</label>
                  <select value={vertical} onChange={e => setVertical(e.target.value)}>
                    <option>General</option>
                    <option>Business</option>
                    <option>Medical</option>
                  </select>
                </div>
              </div>

              <div className={styles.actionRow}>
                <button className={styles.discardBtn} onClick={() => handleAction('discard')}>
                  <X size={18} /> Descartar
                </button>
                <button className={styles.addBtn} onClick={() => handleAction('add')}>
                  <Check size={18} /> Guardar al Banco
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
