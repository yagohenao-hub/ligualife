import React, { useState, useCallback, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { 
  FileUp, FileText, Download, CheckCircle, Loader2, 
  X, Copy, Sparkles, ChevronLeft, Trash2, MessageCircle 
} from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import styles from '../styles/SeriesCompanion.module.css'

interface EpisodeQueueItem {
  id: string
  name: string
  file: File
  status: 'pending' | 'cleaning' | 'analyzing' | 'completed' | 'error'
  result?: string
  error?: string
}

interface StudentRequest {
  id: string
  studentName: string
  seriesName: string
  status: 'Pending' | 'Completed'
  whatsapp: string
  date: string
}

export default function SeriesCompanion() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'requests' | 'generator'>('requests')
  
  const [queue, setQueue] = useState<EpisodeQueueItem[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeItem, setActiveItem] = useState<EpisodeQueueItem | null>(null)

  const [requests, setRequests] = useState<StudentRequest[]>([])
  const [requestsLoading, setRequestsLoading] = useState(false)
  const [processedStudent, setProcessedStudent] = useState<StudentRequest | null>(null)

  useEffect(() => {
    loadRequests()
  }, [])

  async function loadRequests() {
    setRequestsLoading(true)
    try {
      const res = await fetch('/api/admin/series-requests', {
          headers: { 'x-admin-token': 'LinguaAdmin2025' }
      })
      if (res.ok) {
        const data = await res.json()
        setRequests(data.requests || [])
      }
    } catch (err) {
      console.error('Error loading requests:', err)
    } finally {
      setRequestsLoading(false)
    }
  }

  async function handleProcessRequest(req: StudentRequest) {
    setProcessedStudent(req)
    setActiveTab('generator')
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newItems = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      name: file.name.replace('.srt', ''),
      file,
      status: 'pending' as const
    }))
    setQueue(prev => [...prev, ...newItems])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: { 'application/x-subrip': ['.srt'], 'text/plain': ['.srt'] } 
  })

  // Batch Queue Engine
  useEffect(() => {
    if (isProcessing) return
    const nextItem = queue.find(i => i.status === 'pending')
    if (nextItem) {
      processItem(nextItem)
    }
  }, [queue, isProcessing])

  async function processItem(item: EpisodeQueueItem) {
    setIsProcessing(true)
    updateStatus(item.id, 'cleaning')

    try {
      const text = await item.file.text()
      updateStatus(item.id, 'analyzing')

      const res = await fetch('/api/series/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ srt: text, title: item.name })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generación fallida')

      setQueue(prev => prev.map(q => 
        q.id === item.id ? { ...q, status: 'completed', result: data.markdown } : q
      ))
      setActiveItem({ ...item, status: 'completed', result: data.markdown })
    } catch (err: any) {
      console.error(err)
      updateStatus(item.id, 'error', err.message)
    } finally {
      setIsProcessing(false)
    }
  }

  function updateStatus(id: string, status: EpisodeQueueItem['status'], error?: string) {
    setQueue(prev => prev.map(q => q.id === id ? { ...q, status, error } : q))
  }

  function remove(id: string) {
    setQueue(prev => prev.filter(q => q.id !== id))
    if (activeItem?.id === id) setActiveItem(null)
  }

  async function downloadPDF(item: EpisodeQueueItem) {
    if (!item.result) return
    
    updateStatus(item.id, 'analyzing') 
    try {
      const element = document.getElementById(`markdown-render-${item.id}`)
      if (!element) return

      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        windowWidth: 794
      })

      const imgData = canvas.toDataURL('image/png')
      const imgWidth = 595.28 
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      
      const doc = new jsPDF('p', 'pt', 'a4')
      const pageHeight = 841.89 
      let heightLeft = imgHeight
      let position = 0

      doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        doc.addPage()
        doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      doc.save(`${item.name}_Activity.pdf`)
    } catch (err: any) {
        console.error('PDF error', err)
    } finally {
        updateStatus(item.id, 'completed')
    }
  }

  function handleCopyMarkdown(text: string) {
    navigator.clipboard.writeText(text)
    alert("Copiado al portapapeles!")
  }

  return (
    <div className={styles.container}>
      <Head><title>Series Activity Generator | LinguaLife</title></Head>

      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.push('/admin/')}>
          <ChevronLeft size={18} /> Admin Panel
        </button>
        <h1 className={styles.headerTitle}><Sparkles /> Series Companion</h1>
        <div style={{ width: 100 }} />
      </header>

      {/* Navigation Tabs */}
      <nav className={styles.tabs}>
        <button 
            className={`${styles.tabBtn} ${activeTab === 'requests' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('requests')}
        >
            📥 Solicitudes ({requests.length})
        </button>
        <button 
            className={`${styles.tabBtn} ${activeTab === 'generator' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('generator')}
        >
            💿 Generador por Lotes
        </button>
      </nav>

      {activeTab === 'requests' ? (
        <section className={styles.requestSection}>
          <h2 className={styles.sectionTitle}>Solicitudes de Alumnos</h2>
          {requestsLoading && <div className={styles.center}><Loader2 className={styles.spinning} /></div>}
          {!requestsLoading && requests.length === 0 && <p className={styles.emptyText}>No hay solicitudes pendientes.</p>}
          {!requestsLoading && requests.length > 0 && (
            <div className={styles.requestsGrid}>
              {requests.map(req => (
                <div key={req.id} className={styles.requestCard}>
                  <div className={styles.requestMain}>
                    <span className={styles.requestStudent}>👤 {req.studentName}</span>
                    <span className={styles.requestSeries}>« {req.seriesName} »</span>
                    {req.whatsapp && (
                        <a 
                            href={`https://wa.me/${req.whatsapp.replace(/\D/g, '')}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className={styles.waLink}
                        >
                            <MessageCircle size={12} /> {req.whatsapp}
                        </a>
                    )}
                  </div>
                  <div className={styles.requestActions}>
                    <button className={styles.processReqBtn} onClick={() => handleProcessRequest(req)}>
                      Procesar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : (
        <>
            {processedStudent && (
                <div className={styles.processedContext}>
                    <div className={styles.ctxHeader}>
                        <span>Solicitud activa para: <strong>{processedStudent.studentName}</strong></span>
                        <button className={styles.clearCtx} onClick={() => setProcessedStudent(null)}>Limpiar contexto</button>
                    </div>
                    <div className={styles.ctxBody}> 
                        Serie pedida: <strong>{processedStudent.seriesName}</strong>
                        {processedStudent.whatsapp && (
                           <a 
                             href={`https://wa.me/${processedStudent.whatsapp.replace(/\D/g, '')}`} 
                             target="_blank" 
                             rel="noopener noreferrer" 
                             className={styles.waBtn}
                           >
                             <MessageCircle size={14} /> Enviar por WhatsApp
                           </a>
                        )}
                    </div>
                </div>
            )}

            <section {...getRootProps()} className={styles.dropzone}>
                <input {...getInputProps()} />
                <FileUp size={48} className={styles.dropzoneIcon} />
                {isDragActive ? (
                <p>Suelta los episodios aquí...</p>
                ) : (
                <div>
                    <h3>{processedStudent ? `Sube los SRT de « ${processedStudent.seriesName} »` : 'Sube una temporada o episodios (.srt)'}</h3>
                    <p style={{ opacity: 0.5 }}>Arrastra los archivos para procesar la actividad</p>
                </div>
                )}
            </section>

            {queue.length > 0 && (
                <section className={styles.queueArea}>
                <h2 className={styles.sectionTitle}>Cola de Procesamiento ({queue.length})</h2>
                <div className={styles.queueList}>
                    {queue.map(item => (
                    <div 
                        key={item.id} 
                        className={`${styles.episodeCard} ${activeItem?.id === item.id ? styles.activeCard : ''}`}
                        onClick={() => item.status === 'completed' && setActiveItem(item)}
                    >
                        <div className={styles.episodeHeader}>
                        <div className={styles.episodeInfo}>
                            <FileText size={20} className={styles.fileIcon} />
                            <span className={styles.episodeTitle}>{item.name}</span>
                        </div>
                        <div className={styles.actions}>
                            <button className={styles.iconBtn} onClick={(e) => { e.stopPropagation(); remove(item.id); }}>
                            <Trash2 size={16} />
                            </button>
                        </div>
                        </div>

                        <div className={styles.statusLabel}>
                        {item.status === 'pending' && <><Loader2 className={styles.spinning} size={14} /> En espera...</>}
                        {item.status === 'cleaning' && <><Loader2 className={styles.spinning} size={14} /> Limpiando SRT...</>}
                        {item.status === 'analyzing' && <><Loader2 className={styles.spinning} size={14} /> Analizando Q1/Q2...</>}
                        {item.status === 'completed' && <><CheckCircle size={14} style={{ color: '#10b981' }} /> Listo</>}
                        {item.status === 'error' && <><X size={14} style={{ color: '#ef4444' }} /> Error: {item.error}</>}
                        </div>

                        {item.status === 'completed' && (
                        <button className={styles.pdfDownloadBtn} onClick={(e) => { e.stopPropagation(); downloadPDF(item); }}>
                            <Download size={14} /> Descargar PDF
                        </button>
                        )}
                    </div>
                    ))}
                </div>
                </section>
            )}
        </>
      )}

      {activeItem?.result && (
        <div className={styles.resultArea}>
          <div className={styles.previewToolbar}>
            <div className={styles.previewInfo}>
              <Sparkles size={18} style={{ color: 'var(--accent)' }} />
              <h3>Vista Previa: {activeItem.name}</h3>
            </div>
            <div className={styles.actions}>
              <button 
                className={`${styles.actionBtn} ${styles.copyBtn}`} 
                onClick={() => handleCopyMarkdown(activeItem.result!)}
              >
                <Copy size={18} /> Copiar Markdown
              </button>
              <button 
                className={`${styles.actionBtn} ${styles.pdfBtn}`} 
                onClick={() => downloadPDF(activeItem)}
              >
                <Download size={18} /> Descargar PDF Final
              </button>
            </div>
          </div>

          <div className={styles.markdownBody}>
             <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {activeItem.result}
             </ReactMarkdown>
          </div>

          <div 
            id={`markdown-render-${activeItem.id}`} 
            style={{ 
              position: 'absolute', 
              top: '-9999px', 
              width: '595px', 
              padding: '40px', 
              background: 'white', 
              color: 'black' 
            }}
          >
            <div style={{ color: 'black', fontFamily: 'serif' }}>
              <h1 style={{ fontSize: '24px', textAlign: 'center', marginBottom: '30px' }}>LinguaLife Activity: {activeItem.name}</h1>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                 {activeItem.result || ''}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
