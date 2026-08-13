import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import type { Student, Topic } from '@/types'
import type { Slide } from './api/generate-slides'
import type { TopicProgress } from './api/student-progress'
import type { CurriculumNav } from './api/curriculum-nav'
import styles from '@/styles/Classroom.module.css'

type Phase = 'warmup' | 'core' | 'download'

const PHASE_DURATIONS: Record<Phase, number> = {
  warmup: 7 * 60,
  core: 45 * 60,
  download: 8 * 60,
}

const PHASE_COLORS: Record<Phase, string> = {
  warmup: '#f59e0b',
  core: '#3b82f6',
  download: '#10b981',
}

function PhaseBar({ p, elapsed }: { p: Phase, elapsed: Record<Phase, number> }) {
  const pct = Math.min(100, (elapsed[p] / PHASE_DURATIONS[p]) * 100)
  return (
    <div className={styles.phaseBarWrap}>
      <div className={styles.phaseBarTrack}>
        <div
          className={styles.phaseBarFill}
          style={{ width: `${pct}%`, background: PHASE_COLORS[p] }}
        />
      </div>
    </div>
  )
}

function formatTimeUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - new Date().getTime()
  if (diff <= 0) return 'hace un momento'
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins} min`
  const hrs = Math.floor(mins / 60)
  return `${hrs}h ${mins % 60}m`
}

export default function ClassroomPage() {
  const session = useRequireAuth()
  const router = useRouter()

  const [mounted, setMounted] = useState(false)
  const [student, setStudent] = useState<Student | null>(null)
  const [topic, setTopic] = useState<Topic | null>(null)
  const [curriculumNav, setCurriculumNav] = useState<CurriculumNav | null>(null)
  const [sessionName, setSessionName] = useState('')
  const [phase, setPhase] = useState<Phase>('warmup')
  const [progress, setProgress] = useState<TopicProgress[]>([])
  const [slides, setSlides] = useState<Slide[]>([])
  const [warmupData, setWarmupData] = useState<any | null>(null)
  const [cooldownData, setCooldownData] = useState<any | null>(null)
  const [slideIndex, setSlideIndex] = useState(0)
  const [generatingSlides, setGeneratingSlides] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Timer
  const [elapsed, setElapsed] = useState<Record<Phase, number>>({ warmup: 0, core: 0, download: 0 })
  const [running, setRunning] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [notesOpen, setNotesOpen] = useState(false)
  const [notes, setNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)
  const [notesSaved, setNotesSaved] = useState(false)
  const [classStarted, setClassStarted] = useState(false)
  const [classFinished, setClassFinished] = useState(false)
  const [meetingLink, setMeetingLink] = useState('')
  const [nextSessionInfo, setNextSessionInfo] = useState<{ id: string, date: string, formattedTime: string } | null>(null)
  const [previousNotes, setPreviousNotes] = useState<{ date: string, notes: string, sessionName: string } | null>(null)
  const [showPrevNotes, setShowPrevNotes] = useState(false)

  // AI Chat and Video Bank state
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    { role: 'assistant', content: '¡Hola! Soy tu Copilot de LinguaLife. ¿En qué puedo ayudarte con la clase de hoy?' }
  ])
  const [chatInput, setChatInput] = useState('')
  const [sendingChat, setSendingChat] = useState(false)
  const [videoBank, setVideoBank] = useState<any[]>([])
  const [loadingVideoBank, setLoadingVideoBank] = useState(false)

  const [currentTopicId, setCurrentTopicId] = useState<string | null>(null)
  const [participantId, setParticipantId] = useState<string | null>(null)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted || !session || !router.isReady) return
    const { sessionId } = router.query as { sessionId?: string }
    if (!sessionId) { router.replace('/dashboard'); return }
    loadClassroomData(sessionId)
  }, [mounted, session, router.isReady])

  // Start timer logic
  useEffect(() => {
    if (!mounted || !classStarted || classFinished) return
    setRunning(true)
  }, [mounted, classStarted, classFinished])

  useEffect(() => {
    if (!running) {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }
    timerRef.current = setInterval(() => {
      setElapsed(prev => {
        const cur = prev[phase]
        const max = PHASE_DURATIONS[phase]
        if (cur >= max) return prev
        return { ...prev, [phase]: cur + 1 }
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [running, phase])

  async function loadClassroomData(sessionId: string) {
    setLoading(true)
    setError(null)
    try {
      const sessionRes = await fetch(`/api/session?id=${sessionId}`)
      if (sessionRes.status === 404) { router.replace('/dashboard'); return }
      if (!sessionRes.ok) { const d = await sessionRes.json(); setError(d.error); return }
      const sessionData = await sessionRes.json()
      setSessionName(sessionData.sessionName || '')
      setMeetingLink(sessionData.meetingLink || '')

      const { studentId, topicId, participantId: pId } = sessionData
      setCurrentTopicId(topicId)
      if (pId) setParticipantId(pId)

      const [studentRes, topicRes, nextSessionRes, prevNotesRes] = await Promise.all([
        studentId ? fetch(`/api/student?id=${studentId}`) : Promise.resolve(null),
        topicId ? fetch(`/api/topic?id=${topicId}`) : Promise.resolve(null),
        studentId && sessionId ? fetch(`/api/next-session?studentId=${studentId}&currentSessionId=${sessionId}`) : Promise.resolve(null),
        studentId ? fetch(`/api/previous-notes?studentId=${studentId}`) : Promise.resolve(null),
      ])

      let studentData = null
      if (studentRes?.ok) { studentData = await studentRes.json(); setStudent(studentData) }
      if (nextSessionRes?.ok) { const nsData = await nextSessionRes.json(); setNextSessionInfo(nsData.nextSession) }
      if (prevNotesRes?.ok) { const pnData = await prevNotesRes.json(); setPreviousNotes(pnData.previousNotes) }
      if (topicRes?.ok) {
        const topicData = await topicRes.json()
        setTopic(topicData)
        if (topicId) {
          const navRes = await fetch(`/api/curriculum-nav?topicId=${topicId}`)
          if (navRes.ok) setCurriculumNav(await navRes.json())

          // Load cached slides
          // Load cache (slides, warmup, cooldown)
          const cacheRes = await fetch(`/api/slides-cache?topicId=${topicId}`)
          if (cacheRes.ok) {
            const cacheData = await cacheRes.json()
            if (cacheData.slides) setSlides(cacheData.slides)
            if (cacheData.warmup) setWarmupData(cacheData.warmup)
            if (cacheData.cooldown) setCooldownData(cacheData.cooldown)
          }
        }
      }

      if (studentData?.progressIds?.length) {
        const progressRes = await fetch(`/api/student-progress?ids=${studentData.progressIds.join(',')}`)
        if (progressRes.ok) setProgress(await progressRes.json())
      }

      // Fetch Video Bank for Warmup
      fetchVideoBank(studentData?.level)

    } catch (err: any) {
      setError(err.message || 'Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  async function generateSlides() {
    if (!topic) return
    setGeneratingSlides(true)
    try {
      const res = await fetch('/api/generate-slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: student?.name,
          level: student?.level,
          vertical: student?.vertical,
          interests: student?.interests,
          topicName: topic.title,
          previousTopic: curriculumNav?.prev?.title ?? 'None',
          ldsFormula: topic.ldsFormula,
          aiContext: topic.aiContext,
        }),
      })
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error + (errData.detail ? `: ${JSON.stringify(errData.detail)}` : ''))
      }
      const data = await res.json()
      setSlides(data.slides)
      setWarmupData(data.warmup)
      setCooldownData(data.cooldown)
      setSlideIndex(0)

      // Cache the assets in Airtable for future use
      if (currentTopicId) {
        fetch(`/api/slides-cache?topicId=${currentTopicId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            slides: data.slides,
            warmup: data.warmup,
            cooldown: data.cooldown
          }),
        }).catch(() => {}) // Non-blocking
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setGeneratingSlides(false)
    }
  }

  function handlePhaseChange(p: Phase) {
    setPhase(p)
    if (p === 'core' && slides.length === 0) generateSlides()
  }

  async function fetchVideoBank(level?: string) {
    setLoadingVideoBank(true)
    try {
      const res = await fetch(`/api/video-bank-random?level=${level || ''}&limit=4`)
      if (res.ok) {
        const data = await res.json()
        setVideoBank(data.videos || [])
      }
    } catch (e) {
      console.error('Error fetching video bank:', e)
    } finally {
      setLoadingVideoBank(false)
    }
  }

  async function handleSendChatMessage() {
    if (!chatInput.trim() || sendingChat) return
    const userMsg = chatInput.trim()
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setChatInput('')
    setSendingChat(true)

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...chatMessages, { role: 'user', content: userMsg }],
          context: {
            studentName: student?.name,
            level: student?.level,
            topic: topic?.title,
          }
        })
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.message || 'Sin respuesta de la IA.' }])
    } catch (e) {
      console.error('AI Chat Error:', e)
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Lo siento, tuve un error al procesar tu consulta. Intenta de nuevo.' }])
    } finally {
      setSendingChat(false)
    }
  }

  function getInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  function formatTime(secs: number) {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  function downloadSlidesPDF() {
    if (slides.length === 0) return
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${topic?.title ?? 'Slides'}</title>
    <style>
      body { font-family: Arial, sans-serif; background: #0a0e14; color: #e2e8f0; margin: 0; padding: 2rem; }
      .slide { page-break-after: always; margin-bottom: 3rem; padding: 2rem; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; }
      .slide-title { font-size: 1.4rem; font-weight: 700; margin-bottom: 1.5rem; color: #f59e0b; }
      h2, h3, h4 { color: #f59e0b; }
      table { border-collapse: collapse; width: 100%; }
      td, th { border: 1px solid rgba(255,255,255,0.15); padding: 8px; }
    </style></head><body>
    ${slides.map((s, i) => `<div class="slide"><div class="slide-title">${i + 1}. ${s.title}</div>${s.content}</div>`).join('')}
    </body></html>`

    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${topic?.title ?? 'slides'}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Auto-finalize at 75 minutes
  useEffect(() => {
    const totalElapsed = elapsed.warmup + elapsed.core + elapsed.download
    if (totalElapsed >= 75 * 60 && classStarted && !classFinished) {
      handleFinalizeClass()
    }
  }, [elapsed, classStarted, classFinished])

  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatMessages])

  if (!mounted || !session) return null

  const studentName = student?.name?.split(' ')[0] ?? 'el alumno'
  const vertical = student?.vertical ?? 'General'
  const doneTopic = curriculumNav?.prev?.title ?? 'el tema anterior'
  async function handleFinalizeClass() {
    setClassFinished(true)
    setRunning(false)
    if (timerRef.current) clearInterval(timerRef.current)

    // Save notes explicitly
    if (participantId && notes.trim() !== '') {
      try {
        await fetch('/api/session-notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ participantId, notes }),
        })
      } catch (e) {
        console.error(e)
      }
    }

    await router.push('/dashboard')
  }

  async function handleReschedule() {
    if (!confirm('¿Seguro que deseas reagendar esta sesión? Esta acción la cancelará, te devolverá al dashboard, y moverá la malla curricular a la próxima clase agendada.')) return

    try {
      const res = await fetch('/api/reschedule-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: router.query.sessionId }),
      })
      if (!res.ok) throw new Error('Error al reagendar')
      alert('Clase reagendada correctamente.')
      router.push('/dashboard')
    } catch (e) {
      alert('Hubo un error al reagendar')
    }
  }


  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'baseline' }}>
          <button className={styles.backBtn} onClick={() => router.push('/dashboard')}>← Dashboard</button>
          <h1 className={styles.title}>
            {student ? `Clase #${curriculumNav?.current?.order ?? topic?.order ?? ''} con ${student.name}` : 'Cargando...'}
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {meetingLink && (
            <a href={meetingLink} target="_blank" rel="noreferrer" className={styles.joinBtn}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px', verticalAlign: 'middle'}}>
                <path d="M15 10l5-5v14l-5-5"></path>
                <rect x="2" y="6" width="13" height="12" rx="2" ry="2"></rect>
              </svg>
              Unirse a Reunión
            </a>
          )}
          {nextSessionInfo && (
            <div className={styles.nextClassWrapper}>
              <button 
                className={styles.nextClassBtn} 
                onClick={() => router.push(`/classroom?sessionId=${nextSessionInfo.id}`)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}>
                  <path d="M5 4l10 8-10 8V4z"></path>
                  <path d="M19 5v14"></path>
                </svg>
                Siguiente
              </button>
              <div className={styles.tooltipHover}>Próxima: {formatTimeUntil(nextSessionInfo.date)}</div>
            </div>
          )}
          <button className={styles.rescheduleBtn} onClick={handleReschedule}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}>
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
              <path d="M3 3v5h5"></path>
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path>
              <path d="M16 16h5v5"></path>
            </svg>
            Reagendar
          </button>
          {!classStarted ? (
            <button className={styles.startBtn} onClick={() => setClassStarted(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{marginRight: '6px'}}>
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              Iniciar Clase
            </button>
          ) : (
            <button 
              className={styles.finalizeBtn} 
              onClick={handleFinalizeClass}
              disabled={classFinished}
            >
              {classFinished ? 'Finalizada' : 'Finalizar Clase'}
            </button>
          )}
        </div>
      </div>

      {loading && <div className="spinner" />}
      {error && <div className="error-message">{error}</div>}

      {!loading && (
        <div className={`${styles.classroomGrid} ${!sidebarOpen ? styles.classroomGridCollapsed : ''}`}>

          {/* ── Student Sidebar ── */}
          <aside className={`${styles.sidebar} ${!sidebarOpen ? styles.sidebarCollapsed : ''}`}>
            {/* Toggle button */}
            <button
              className={styles.sidebarToggle}
              onClick={() => setSidebarOpen(o => !o)}
              title={sidebarOpen ? 'Colapsar perfil' : 'Expandir perfil'}
            >
              <svg 
                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                style={{ transform: sidebarOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}
              >
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>

            {sidebarOpen && (
              <>
                <div className={styles.avatarCircle}>
                  <span>{student ? getInitials(student.name) : '?'}</span>
                </div>
                <div className={styles.studentName}>{student?.name ?? 'Alumno'}</div>
                {student?.level && (
                  <div className={styles.levelBadge}>Nivel {student.level}</div>
                )}

                <div className={styles.sidebarSection}>
                  <div className={styles.sidebarLabel}>Vertical</div>
                  <div className={styles.tagRow}>
                    <span className={styles.tag}>{vertical}</span>
                  </div>
                </div>

                {student?.interests && (
                  <div className={styles.sidebarSection}>
                    <div className={styles.sidebarLabel}>Intereses</div>
                    <div className={styles.tagRow}>
                      {student.interests.split(',').map(i => i.trim()).filter(Boolean).map(i => (
                        <span key={i} className={styles.tag}>{i}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Curriculum Nav */}
                <div className={styles.sidebarSection}>
                  <div className={styles.sidebarLabel}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px', verticalAlign: 'middle'}}>
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                    </svg>
                    Malla Curricular
                  </div>
                  <div className={styles.curriculumNav}>
                    <div className={`${styles.curriculumItem} ${styles.curriculumPrev}`}>
                      <span className={styles.curriculumBadge}>
                        {curriculumNav?.prev ? `#${curriculumNav.prev.order} Anterior` : 'Anterior'}
                      </span>
                      <span className={styles.curriculumTitle}>
                        {curriculumNav?.prev?.title ?? '— primera clase —'}
                      </span>
                    </div>
                    <div className={`${styles.curriculumItem} ${styles.curriculumCurrent}`}>
                      <span className={styles.curriculumBadge}>
                        #{curriculumNav?.current?.order ?? topic?.order ?? '?'} Hoy
                      </span>
                      <span className={styles.curriculumTitle}>
                        {curriculumNav?.current?.title ?? topic?.title ?? '...'}
                      </span>
                    </div>
                    <div className={`${styles.curriculumItem} ${styles.curriculumNext}`}>
                      <span className={styles.curriculumBadge}>
                        {curriculumNav?.next ? `#${curriculumNav.next.order} Siguiente` : 'Siguiente'}
                      </span>
                      <span className={styles.curriculumTitle}>
                        {curriculumNav?.next?.title ?? '— último tema —'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Previous Notes */}
                {previousNotes && (
                  <div className={styles.sidebarSection}>
                    <button 
                      className={styles.prevNotesToggle}
                      onClick={() => setShowPrevNotes(o => !o)}
                    >
                      <span style={{display: 'flex', alignItems: 'center'}}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}>
                          <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
                          <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
                        </svg>
                        Notas Previas
                      </span>
                      <svg 
                        width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                        style={{ transform: showPrevNotes ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </button>
                    {showPrevNotes && (
                      <div className={styles.prevNotesContent}>
                        <div className={styles.prevNotesHeader}>
                          Sesión del <small>{new Date(previousNotes.date).toLocaleDateString()}</small>
                        </div>
                        <p>{previousNotes.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </aside>

          {/* ── Main Content ── */}
          <main className={styles.main}>
            {/* Phase Tabs — bars only, no numbers */}
            <div className={styles.phaseTabs}>
              <button
                className={`${styles.phaseTab} ${phase === 'warmup' ? styles.phaseTabActiveWarmup : ''}`}
                onClick={() => handlePhaseChange('warmup')}
              >
                <div className={styles.phaseTabTop}>
                  <span style={{ fontSize: '1.4rem', marginRight: '8px' }}>🔥</span>
                  Warm-up
                </div>
                <div className={styles.phaseInstruction}>
                  <span>7 min · Reactiva el motor de <strong>{studentName}</strong> en su contexto de <strong>{vertical}</strong>.</span>
                </div>
                <PhaseBar p="warmup" elapsed={elapsed} />
              </button>
              <button
                className={`${styles.phaseTab} ${phase === 'core' ? styles.phaseTabActiveCore : ''}`}
                onClick={() => handlePhaseChange('core')}
              >
                <div className={styles.phaseTabTop}>
                  <span style={{ fontSize: '1.4rem', marginRight: '8px' }}>🧠</span>
                  Core
                </div>
                <div className={styles.phaseInstruction}>
                  <span>⏱ 45 min · Material de Clase (Interactive Slides)</span>
                </div>
                <PhaseBar p="core" elapsed={elapsed} />
              </button>
              <button
                className={`${styles.phaseTab} ${phase === 'download' ? styles.phaseTabActiveDownload : ''}`}
                onClick={() => handlePhaseChange('download')}
              >
                <div className={styles.phaseTabTop}>
                  <span style={{ fontSize: '1.4rem', marginRight: '8px' }}>🧘</span>
                  Download
                </div>
                <div className={styles.phaseInstruction}>
                  <span>⏱ 8 min · ¡Buen trabajo, <strong>{studentName}</strong>!</span>
                </div>
                <PhaseBar p="download" elapsed={elapsed} />
              </button>
            </div>

            {/* ── Warmup Content ── */}
            {phase === 'warmup' && (
              <div className={styles.phaseContent}>
                {!warmupData && !generatingSlides && (
                  <div className={styles.card} style={{ textAlign: 'center' }}>
                    <p className={styles.textSecondary}>Contenido de Warmup no generado.</p>
                    <button className={styles.generateBtn} onClick={generateSlides}>Generar Contenido</button>
                  </div>
                )}

                {generatingSlides && (
                  <div className={styles.card} style={{ textAlign: 'center', padding: '2rem' }}>
                    <div className="spinner" />
                    <p className={styles.textSecondary} style={{ marginTop: '1rem' }}>Preparando Warmup...</p>
                  </div>
                )}

                {warmupData && (
                  <>
                    {/* Contextual Question */}
                    <div className={styles.card}>
                      <div className={styles.cardLabel}>
                        <span style={{ fontSize: '1.2rem', marginRight: '8px' }}>🎈</span>
                        Icebreaker — Conexión Real
                      </div>
                      <p className={styles.warmupQuestion}>{warmupData.icebreaker}</p>
                    </div>

                    {/* Spanglish Translation */}
                    <div className={styles.card}>
                      <div className={styles.cardLabel}>
                        <span style={{ fontSize: '1.2rem', marginRight: '8px' }}>🔄</span>
                        Spanglish Translation — [{doneTopic}]
                      </div>
                      <p className={styles.textSecondary} style={{ marginBottom: '1rem' }}>
                        Traduce estas frases. El objetivo es identificar y usar correctamente el concepto destacado.
                      </p>
                      <div className={styles.spanglishGrid}>
                        {(Array.isArray(warmupData.spanglishPhrases) ? warmupData.spanglishPhrases : []).map((phrase: string, idx: number) => (
                          <div key={idx} className={styles.spanglishCard}>
                            <p>{phrase}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bridge Phrase */}
                    <div className={styles.card} style={{ borderLeft: '4px solid #f59e0b', background: 'rgba(245, 158, 11, 0.05)' }}>
                      <div className={styles.cardLabel}>
                        <span style={{ fontSize: '1.2rem', marginRight: '8px' }}>🌉</span>
                        Observation Bridge — Hoy: [{topic?.title}]
                      </div>
                      <div className={styles.bridgeContent}>
                        <div className={styles.bridgePhrase} dangerouslySetInnerHTML={{ __html: `"${warmupData.bridgePhrase}"` }} />
                        <p className={styles.bridgeInstruction}>Mira esta frase cuidadosamente. <strong>¿Qué notas aquí?</strong> ¿Qué estructura te llama la atención?</p>
                      </div>
                    </div>

                    {/* Video Bank Random Links */}
                    <div className={styles.videoBankSection}>
                      <div className={styles.cardLabel}>
                        <span style={{ fontSize: '1.2rem', marginRight: '8px' }}>📺</span>
                        Video Bank — Recomendados para hoy
                      </div>
                      <p className={styles.textSecondary}>
                        Contenido nativo corto para practicar listening y vocabulario real.
                      </p>
                      
                      {loadingVideoBank && <div style={{marginTop: '1rem', opacity: 0.6}}>Cargando videos...</div>}
                      
                      <div className={styles.videoBankGrid}>
                        {videoBank.map((vid) => (
                          <a 
                            key={vid.id} 
                            href={vid.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className={styles.videoMiniCard}
                          >
                            <div 
                              className={styles.videoThumb} 
                              style={{ backgroundImage: `url(https://img.youtube.com/vi/${vid.url.split('v=')[1]?.split('&')[0] || vid.url.split('be/')[1]}/hqdefault.jpg)` }}
                            >
                              <div className={styles.videoThumbOverlay}>
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                              </div>
                            </div>
                            <div className={styles.videoInfo}>
                              <div className={styles.videoMiniTitle}>{vid.title || 'Video Nativo'}</div>
                              <div className={styles.videoMiniMeta}>{vid.level || student?.level}</div>
                            </div>
                          </a>
                        ))}
                      </div>
                      
                      {videoBank.length === 0 && !loadingVideoBank && (
                        <p style={{marginTop: '1rem', fontSize: '0.8rem', opacity: 0.5}}>No hay videos guardados aún.</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── Core Content ── */}
            {phase === 'core' && (
              <div className={styles.phaseContent}>
                {generatingSlides && (
                  <div className={styles.card} style={{ textAlign: 'center', padding: '2rem' }}>
                    <div className="spinner" />
                    <p className={styles.textSecondary} style={{ marginTop: '1rem' }}>Generando slides con IA...</p>
                  </div>
                )}

                {!generatingSlides && slides.length === 0 && (
                  <div className={styles.card} style={{ textAlign: 'center' }}>
                    <p className={styles.textSecondary}>No hay slides generados.</p>
                    <button className={styles.generateBtn} onClick={generateSlides}>Generar Slides</button>
                  </div>
                )}

                {slides.length > 0 && (
                  <>
                    {/* Prev / Next nav + PDF download */}
                    <div className={styles.slideControls}>
                      <div className={styles.slideNavGroup}>
                        <button
                          className={styles.slideNavArrow}
                          onClick={() => setSlideIndex(i => Math.max(0, i - 1))}
                          disabled={slideIndex === 0}
                          title="Anterior"
                        >
                          ←
                        </button>
                        <button
                          className={styles.slideNavArrow}
                          onClick={() => setSlideIndex(i => Math.min(slides.length - 1, i + 1))}
                          disabled={slideIndex === slides.length - 1}
                          title="Siguiente"
                        >
                          →
                        </button>
                      </div>
                      <span className={styles.slideCounter}>
                        {slideIndex + 1} / {slides.length} · <span style={{ opacity: 0.6 }}>{slides[slideIndex]?.title}</span>
                      </span>
                      <div className={styles.slideControlsRight}>
                        <button className={styles.iterateBtn} onClick={generateSlides} title="Regenerar slides">↻</button>
                        <button className={styles.pdfBtn} onClick={downloadSlidesPDF} title="Descargar como PDF">⬇ PDF</button>
                      </div>
                    </div>
                    <div
                      className={styles.slideContent}
                      dangerouslySetInnerHTML={{ __html: slides[slideIndex]?.content ?? '' }}
                    />
                  </>
                )}
              </div>
            )}

            {/* ── Download Content ── */}
            {phase === 'download' && (
              <div className={styles.phaseContent}>
                {!cooldownData && !generatingSlides && (
                  <div className={styles.card} style={{ textAlign: 'center' }}>
                    <p className={styles.textSecondary}>Contenido de Download no generado.</p>
                    <button className={styles.generateBtn} onClick={generateSlides}>Generar Contenido</button>
                  </div>
                )}

                {cooldownData && (
                  <>
                    <div className={styles.cardGrid2}>
                      <div className={styles.card}>
                        <div className={styles.cardLabel}>
                          <span style={{ fontSize: '1.2rem', marginRight: '8px' }}>📚</span>
                          Cultural Byte — Idioms
                        </div>
                        <ul className={styles.idiomList}>
                          {(Array.isArray(cooldownData.idioms) ? cooldownData.idioms : []).map((idiom: string, i: number) => (
                            <li key={i}>{idiom}</li>
                          ))}
                        </ul>
                      </div>
                      <div className={styles.card}>
                        <div className={styles.cardLabel}>
                          <span style={{ fontSize: '1.2rem', marginRight: '8px' }}>🎯</span>
                          Tiny Action Plan
                        </div>
                        <p className={styles.actionText}>{cooldownData.tinyAction}</p>
                      </div>
                    </div>

                    <div className={styles.card}>
                      <div className={styles.cardLabel}>
                        <span style={{ fontSize: '1.2rem', marginRight: '8px' }}>👅</span>
                        Phonetic Pivot — Pronunciación
                      </div>
                      <div className={styles.pivotContent}>
                        <p className={styles.textSecondary}>Drill rápido (30s) para este sonido clave:</p>
                        <div className={styles.twister}>{cooldownData.tongueTwister}</div>
                      </div>
                    </div>

                    <div className={styles.card} style={{ border: '2px dashed #22c55e', background: 'rgba(34, 197, 94, 0.05)' }}>
                      <div className={styles.cardLabel} style={{ color: '#22c55e' }}>
                        <span style={{ fontSize: '1.2rem', marginRight: '8px' }}>⭐</span>
                        Finalizar & Feedback
                      </div>
                      <p>No olvides dar <strong>2 minutos de feedback verbal</strong> a {studentName}.</p>
                      <p className={styles.textSecondary} style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                        Asegúrate de haber anotado los errores clave en el panel de notas antes de cerrar la sesión.
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </main>
        </div>
      )}

      {/* ── Floating Buttons Row ── */}
      <button
        className={`${styles.chatFab} ${chatOpen ? styles.chatFabActive : ''}`}
        onClick={() => {
          setChatOpen(o => !o)
          if (notesOpen) setNotesOpen(false)
        }}
        title="AI Copilot Chat"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          <path d="M12 7v6"></path>
          <path d="M9 10h6"></path>
        </svg>
      </button>

      {/* ── Floating Notes Bubble ── */}
      <button
        className={`${styles.notesFab} ${notesOpen ? styles.notesFabActive : ''}`}
        onClick={() => {
          setNotesOpen(o => !o)
          if (chatOpen) setChatOpen(false)
        }}
        title="Notas del profesor"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="M2 2l1.5 14.5L13 18l5-5-1.5-7.5L2 2z"></path><line x1="2" y1="2" x2="11" y2="11"></line></svg>
      </button>

      {notesOpen && (
        <div className={styles.notesPanel}>
          <div className={styles.notesPanelHeader}>
            <span style={{color: '#60a5fa'}}>📋 Notas del Alumno</span>
            <button className={styles.notesPanelClose} onClick={() => setNotesOpen(false)}>✕</button>
          </div>
          <textarea
            className={styles.notesTextarea}
            placeholder={`Ej: ${studentName} confundió "since" con "for"...`}
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
          <div className={styles.notesPanelFooter}>
            <button className={styles.notesClear} onClick={() => setNotes('')}>Limpiar</button>
            <span className={styles.textSecondary} style={{ fontSize: '0.7rem', alignSelf: 'center', opacity: 0.6 }}> (Se guardan al finalizar) </span>
          </div>
        </div>
      )}

      {chatOpen && (
        <div className={styles.chatPanel}>
          <div className={styles.chatHeader}>
            <div className={styles.chatTitle}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
              AI Copilot
            </div>
            <button className={styles.chatClose} onClick={() => setChatOpen(false)}>✕</button>
          </div>
          
          <div className={styles.chatMessages}>
            {chatMessages.map((m, i) => (
              <div key={i} className={`${styles.chatMessage} ${m.role === 'assistant' ? styles.aiMessage : styles.userMessage}`}>
                {m.content}
              </div>
            ))}
            {sendingChat && (
              <div className={`${styles.chatMessage} ${styles.aiMessage}`} style={{opacity: 0.5}}>...</div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className={styles.chatInputArea}>
            <input 
              className={styles.chatInput}
              placeholder="Pregunta algo (ejemplos, vocabulario...)"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendChatMessage()}
            />
            <button 
              className={styles.chatSendBtn} 
              onClick={handleSendChatMessage}
              disabled={sendingChat || !chatInput.trim()}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
