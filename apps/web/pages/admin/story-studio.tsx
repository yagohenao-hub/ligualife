import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { 
  ChevronLeft, Search, BookOpen, Download, 
  Sparkles, Loader2, Image as ImageIcon, 
  CheckCircle, X, Layers, Printer, Eye,
  Plus, Trash2, ArrowRight, Save, Layout,
  Sliders, Globe, Languages
} from 'lucide-react'
import styles from '../../styles/StoryStudio.module.css'

interface Fragment {
  id: string
  en: string
  es: string
  color: string
}

interface Keyword {
  word: string
  translation: string
  image_prompt: string
  imageUrl?: string 
}

interface PageSpread {
  enText: string
  esText: string
  keywords: Keyword[]
  fragments: Fragment[]
}

export default function StoryStudio() {
  const router = useRouter()
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [wordMax, setWordMax] = useState(3500)
  const [langFilter, setLangFilter] = useState<'all' | 'en' | 'es'>('all')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const [previewStory, setPreviewStory] = useState<{title: string, text: string, url: string, wordCount: number} | null>(null)
  
  const fetchStories = async () => {
    console.log("Fetching stories with:", { searchQuery, wordMax, langFilter })
    setSearching(true)
    try {
      const res = await fetch(`/api/stories/search?query=${encodeURIComponent(searchQuery)}&word_max=${wordMax}&lang=${langFilter}`)
      if (!res.ok) throw new Error("API responded with " + res.status)
      const data = await res.json()
      console.log("Results from API:", data.results?.length || 0)
      setSearchResults(data.results || [])
    } catch (err) {
      console.error("Fetch error:", err)
      // Empty set so at least the spinner stops
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStories()
    }, 300)
    return () => clearTimeout(timer)
  }, [wordMax, langFilter])

  const handleUpdateFilter = () => {
    // Immediate fetch if needed, but the effect handles it
  }

  // Editing state
  const [step, setStep] = useState<'search' | 'keywords' | 'editor'>('search')
  const [isProcessing, setIsProcessing] = useState(false)
  const [activePageIndex, setActivePageIndex] = useState(0)
  const [mood, setMood] = useState('Classic')
  const [title, setTitle] = useState('')

  // The 3 Spreads
  const [spreads, setSpreads] = useState<PageSpread[]>([
    { enText: '', esText: '', keywords: [], fragments: [] },
    { enText: '', esText: '', keywords: [], fragments: [] },
    { enText: '', esText: '', keywords: [], fragments: [] }
  ])

  // Selection state for Manual Nubes
  const [selection, setSelection] = useState<{ en: string, es: string }>({ en: '', es: '' })

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault()
    fetchStories()
  }

  const openPreview = async (story: any) => {
    setSearching(true)
    try {
        const res = await fetch(`/api/stories/search?get_text=${encodeURIComponent(story.url)}`)
        const text = await res.text()
        const wordCount = text.split(/\s+/).length
        setPreviewStory({ 
          title: story.title, 
          text: text, 
          url: story.url,
          wordCount: story.wordCount || wordCount
        })
    } catch (err) {
        alert("Error al cargar previa")
    } finally {
        setSearching(false)
    }
  }

  const startProcessing = async () => {
    if (!previewStory) return
    setIsProcessing(true)
    try {
      const res = await fetch('/api/stories/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: previewStory.text, title: previewStory.title })
      })
      const data = await res.json()
      
      const kPerP = Math.ceil(data.keywords.length / 3)
      const fPerP = Math.ceil(data.fragments.length / 3)
      
      const newSpreads = [0,1,2].map(i => ({
          enText: data.fragments.slice(i*fPerP, (i+1)*fPerP).map((f: any) => f.en).join(' '),
          esText: data.fragments.slice(i*fPerP, (i+1)*fPerP).map((f: any) => f.es).join(' '),
          keywords: data.keywords.slice(i*kPerP, (i+1)*kPerP),
          fragments: []
      }))

      setSpreads(newSpreads)
      setTitle(data.title)
      setMood(data.mood)
      setStep('keywords')
      setPreviewStory(null)
    } catch (err) {
      console.error(err)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleTextSelection = (lang: 'en' | 'es') => {
    const sel = window.getSelection()?.toString().trim()
    if (sel) {
        setSelection(prev => ({ ...prev, [lang]: sel }))
    }
  }

  const createNube = () => {
    if (!selection.en || !selection.es) return
    const colors = ['#7c3aed33', '#10b98133', '#f59e0b33', '#3b82f633', '#ef444433']
    const newFrag: Fragment = {
        id: Math.random().toString(36).substr(2, 9),
        en: selection.en,
        es: selection.es,
        color: colors[spreads[activePageIndex].fragments.length % colors.length]
    }
    
    const upSpreads = [...spreads]
    upSpreads[activePageIndex].fragments.push(newFrag)
    setSpreads(upSpreads)
    setSelection({ en: '', es: '' })
  }

  const removeNube = (id: string) => {
    const upSpreads = [...spreads]
    upSpreads[activePageIndex].fragments = upSpreads[activePageIndex].fragments.filter(f => f.id !== id)
    setSpreads(upSpreads)
  }

  const updateKeyword = (index: number, key: keyof Keyword, val: string) => {
      const upSpreads = [...spreads]
      upSpreads[activePageIndex].keywords[index] = { ...upSpreads[activePageIndex].keywords[index], [key]: val }
      setSpreads(upSpreads)
  }

  return (
    <div className={`${styles.container} ${styles[`theme-${mood.toLowerCase().replace(/[^a-z]/g, '')}`]}`}>
      <Head><title>Story Studio | LinguaLife</title></Head>

      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.push('/admin/')}>
          <ChevronLeft size={18} /> Admin
        </button>
        <h1 className={styles.headerTitle}><BookOpen /> Story Studio</h1>
        <div className={styles.stepInfo}>
            {step === 'keywords' && <span className={styles.badge}>Módulo 1: Vocabulario</span>}
            {step === 'editor' && <span className={styles.badge}>Módulo 2: Nubes y Layout</span>}
        </div>
      </header>

      {step === 'search' && (
        <section className={styles.searchArea}>
          <div className={styles.searchBar}>
            <div className={styles.searchFormWrapper}>
              <form onSubmit={handleSearch} className={styles.searchForm}>
                <Search className={styles.searchIcon} />
                <input 
                  type="text" 
                  placeholder="Título, autor o palabra clave..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                />
               <button type="submit" className={styles.searchBtn} disabled={searching}>
                  {searching ? <Loader2 className={styles.spinning} /> : 'Buscar'}
                </button>
              </form>
            </div>
            
            <div className={styles.filterGrid}>
                <div className={styles.filterGroup}>
                    <label><Sliders size={14} /> Máx. Palabras: <strong>{wordMax >= 10000 ? 'Sin límite' : `${wordMax} palabras`}</strong></label>
                    <input 
                        type="range" min="100" max="10000" step="100" 
                        value={wordMax} 
                        onChange={(e) => setWordMax(parseInt(e.target.value))} 
                        onMouseUp={handleUpdateFilter}
                    />
                </div>
                <div className={styles.langTabs}>
                    <button 
                      className={langFilter === 'all' ? styles.activeLangTab : ''} 
                      onClick={() => { setLangFilter('all'); setTimeout(fetchStories, 0); }}
                    >
                      <Globe size={14} /> Todos
                    </button>
                    <button 
                      className={langFilter === 'es' ? styles.activeLangTab : ''} 
                      onClick={() => { setLangFilter('es'); setTimeout(fetchStories, 0); }}
                    >
                      <Languages size={14} /> Nativo Español
                    </button>
                    <button 
                      className={langFilter === 'en' ? styles.activeLangTab : ''} 
                      onClick={() => { setLangFilter('en'); setTimeout(fetchStories, 0); }}
                    >
                      <Languages size={14} /> Clásicos Inglés
                    </button>
                </div>
            </div>
          </div>

          <div className={styles.bankHeader}>
              <p>Mostrando {searchResults.length} obras literarias encontradas</p>
          </div>

          <div className={styles.resultsGrid}>
            {searchResults.filter(s => s.wordCount <= wordMax).map(story => (
              <div key={story.id} className={styles.storyCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardIconWrapper}>
                    <BookOpen size={24} className={styles.cardIcon} />
                    {story.language === 'es' && <span className={styles.langSmallBadge}>ES</span>}
                  </div>
                  <div className={styles.cardInfo}>
                    <h3>{story.title}</h3>
                    <p className={styles.author}>by {story.author}</p>
                  </div>
                </div>
                
                <div className={styles.cardMetadata}>
                   <span className={styles.wordBadge}>
                     {story.wordCount} palabras
                   </span>
                   {story.source && (
                     <span className={styles.sourceBadge}>{story.source}</span>
                   )}
                </div>

                <div className={styles.cardActions}>
                   <button className={styles.previewBtnSmall} onClick={() => openPreview(story)}>
                      <Eye size={14} /> Ver Ficha
                   </button>
                   <button className={styles.selectBtnSmall} onClick={() => openPreview(story).then(() => startProcessing())}>
                      <Sparkles size={14} /> Procesar
                   </button>
                </div>
              </div>
            ))}
          </div>

          {previewStory && (
              <div className={styles.modalOverlay}>
                  <div className={styles.previewModal}>
                    <div className={styles.modalHeader}>
                        <div className={styles.modalTitleArea}>
                          <h2>{previewStory.title}</h2>
                          <span className={styles.modalSub}>
                             Dominio Público - Selección de {previewStory.wordCount} palabras
                          </span>
                        </div>
                        <button className={styles.closeModalBtn} onClick={() => setPreviewStory(null)}>
                           <X size={20} />
                        </button>
                    </div>
                    <div className={styles.previewContent}>
                       {previewStory.text.split('\n').map((line, i) => (
                           <p key={i}>{line}</p>
                       ))}
                    </div>
                    <div className={styles.modalFooter}>
                        <button className={styles.cancelBtn} onClick={() => setPreviewStory(null)}>Regresar al Banco</button>
                        <button 
                            className={styles.confirmProcessBtn} 
                            onClick={startProcessing}
                            disabled={isProcessing}
                        >
                            {isProcessing ? <Loader2 className={styles.spinning} /> : <><Sparkles size={16} /> Utilizar esta obra</>}
                        </button>
                    </div>
                  </div>
              </div>
          )}
        </section>
      )}

      {step === 'keywords' && (
          <section className={styles.editorArea}>
              <div className={styles.setupCard}>
                  <h2>Pre-selección de Vocabulario (Spread {activePageIndex + 1})</h2>
                  <p>Define los anclajes visuales. La IA propuso estos, pero cámbialos a placer antes de generar imágenes.</p>
                  
                  <div className={styles.keywordsEditor}>
                      {spreads[activePageIndex].keywords.map((kw, i) => (
                          <div key={i} className={styles.kwRow}>
                              <input 
                                value={kw.word} 
                                onChange={(e) => updateKeyword(i, 'word', e.target.value)} 
                                placeholder="Word (EN)"
                              />
                              <input 
                                value={kw.translation} 
                                onChange={(e) => updateKeyword(i, 'translation', e.target.value)} 
                                placeholder="Translation (ES)"
                              />
                              <input 
                                value={kw.image_prompt} 
                                onChange={(e) => updateKeyword(i, 'image_prompt', e.target.value)} 
                                className={styles.wideInput}
                                placeholder="AI Image Prompt"
                              />
                              <button onClick={() => {
                                  const up = [...spreads]
                                  up[activePageIndex].keywords.splice(i, 1)
                                  setSpreads(up)
                              }}><Trash2 size={16} /></button>
                          </div>
                      ))}
                      <button className={styles.addKwBtn} onClick={() => {
                          const up = [...spreads]
                          up[activePageIndex].keywords.push({ word: '', translation: '', image_prompt: '' })
                          setSpreads(up)
                      }}><Plus size={16} /> Añadir Palabra</button>
                  </div>

                  <div className={styles.spreadNav}>
                      <button disabled={activePageIndex === 0} onClick={() => setActivePageIndex(v => v - 1)}>Anterior Página</button>
                      <span>Spread {activePageIndex + 1} de 3</span>
                      {activePageIndex < 2 ? (
                          <button onClick={() => setActivePageIndex(v => v + 1)}>Siguiente Página</button>
                      ) : (
                          <button className={styles.primaryBtn} onClick={() => { setActivePageIndex(0); setStep('editor'); }}>
                              Confirmar Todo y Editar Layout <ArrowRight size={16} />
                          </button>
                      )}
                  </div>
              </div>
          </section>
      )}

      {step === 'editor' && (
        <section className={styles.editorArea}>
          <div className={styles.toolbar}>
             <div className={styles.pageTabs}>
                {[0,1,2].map(i => (
                    <button 
                        key={i} 
                        className={activePageIndex === i ? styles.activeTab : ''}
                        onClick={() => setActivePageIndex(i)}
                    >
                        Spread {i+1}
                    </button>
                ))}
             </div>
             <div style={{ flex: 1 }} />
             <button className={styles.toolBtn} onClick={() => setStep('keywords')}>
                <ImageIcon size={18} /> Ajustar Vocabulario
             </button>
             <button className={`${styles.toolBtn} ${styles.primaryBtn}`} onClick={() => window.print()}>
                <Printer size={18} /> Imprimir (PDF)
             </button>
          </div>

          <div className={styles.editorSplit}>
              <div className={styles.nubeBuilder}>
                  <h3>Herramienta de Nubes Manuales</h3>
                  <div className={styles.selectionPreview}>
                      <div className={styles.selBox}>
                          <label>EN:</label>
                          <div>{selection.en || <span style={{ opacity: 0.3 }}>Selecciona texto a la derecha...</span>}</div>
                      </div>
                      <div className={styles.selBox}>
                          <label>ES:</label>
                          <div>{selection.es || <span style={{ opacity: 0.3 }}>Selecciona traducción abajo...</span>}</div>
                      </div>
                      <button 
                        className={styles.createNubeBtn} 
                        onClick={createNube}
                        disabled={!selection.en || !selection.es}
                      >
                         <Sparkles size={16} /> Crear Nube Unificada
                      </button>
                  </div>

                  <div className={styles.activeFragments}>
                      <h4>Nubes en esta página ({spreads[activePageIndex].fragments.length})</h4>
                      {spreads[activePageIndex].fragments.map(f => (
                          <div key={f.id} className={styles.miniFrag}>
                              <span style={{ borderLeft: `4px solid ${f.color}` }}>{f.en.slice(0, 20)}...</span>
                              <button onClick={() => removeNube(f.id)}><Trash2 size={12} /></button>
                          </div>
                      ))}
                  </div>
              </div>

              <div className={styles.bookSpread}>
                <div className={styles.pageLeft}>
                    <div className={styles.visualGrid}>
                    {spreads[activePageIndex].keywords.map((kw, i) => (
                        <div key={i} className={styles.visualCard}>
                            <div className={styles.imageBox}>
                                {kw.imageUrl ? <img src={kw.imageUrl} alt={kw.word} /> : <div className={styles.imgLoading}>Ancla Visual...</div>}
                            </div>
                            <div className={styles.wordBox}>
                                <span className={styles.enWord}>{kw.word}</span>
                                <span className={styles.esWord}>{kw.translation}</span>
                            </div>
                        </div>
                    ))}
                    </div>
                </div>

                <div className={styles.pageRight}>
                    <div className={styles.pageHeader}>{title} - Pág {activePageIndex + 1}</div>
                    <div className={styles.manualTextEditor}>
                        <div className={styles.textLayer} onMouseUp={() => handleTextSelection('en')}>
                            <p>{spreads[activePageIndex].enText}</p>
                        </div>
                        <div className={styles.textLayerEs} onMouseUp={() => handleTextSelection('es')}>
                            <p>{spreads[activePageIndex].esText}</p>
                        </div>
                        
                        <div className={styles.nubeHighlights}>
                            {spreads[activePageIndex].fragments.map(f => (
                                <div key={f.id} className={styles.nubeTag} style={{ background: f.color }}>
                                    {f.en} ↔ {f.es}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
              </div>
          </div>
        </section>
      )}

      {isProcessing && (
        <div className={styles.processingOverlay}>
          <div className={styles.loaderBox}>
            <Sparkles className={styles.spinning} size={48} style={{ color: 'var(--accent)' }} />
            <h2>Procesando con IA...</h2>
            <p>Estructurando página, traduciendo y generando anclas visuales.</p>
          </div>
        </div>
      )}
    </div>
  )
}
