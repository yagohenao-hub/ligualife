import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import styles from '@/styles/StudentDashboard.module.css'
import { LinguaLifeLogo } from '@/components/LinguaLifeLogo'
import { InfiniteTriviaModal } from '@/components/InfiniteTriviaModal'
import { getTopicSummary } from '@/lib/curriculum-summary'
import { 
  AlertCircle,
  BookOpen, 
  Calendar, 
  Flame, 
  Trophy, 
  Clock, 
  Shield, 
  Star, 
  Award, 
  CheckCircle2, 
  RotateCcw, 
  FileDown, 
  Compass, 
  HelpCircle, 
  Info, 
  Play, 
  ArrowRight, 
  LogOut, 
  Layers, 
  Crown, 
  Zap, 
  Check, 
  Sparkles, 
  Tv, 
  Target, 
  X, 
  Gem,
  MessageSquare,
  Video,
  ChevronLeft,
  ChevronRight,
  CircleDot
} from 'lucide-react'

const DAYS_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const HOURS = ['6am','7am','8am','9am','10am','11am','12pm','1pm','2pm','3pm','4pm','5pm','6pm','7pm','8pm']
const HOURS_START = 6 // 6am

interface StudentSession {
  id: string
  date: string
  status: string
  topicId: string | null
  topicName: string | null
  cachedSlides?: any[] | null
  topicOrder: number | null
  isHoliday?: boolean
  holidayConfirmedTeacher?: boolean
  holidayConfirmedStudent?: boolean
}

interface StudentProfile {
  id: string
  name: string
  email: string
  tokens: number
  classesRemaining?: number
  teacherId: string | null
  teacherName: string | null
}

export default function StudentDashboardPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [upcoming, setUpcoming] = useState<StudentSession[]>([])
  const [completed, setCompleted] = useState<StudentSession[]>([])
  const [loading, setLoading] = useState(true)
  const [rescheduling, setRescheduling] = useState<string | null>(null)
  const [showTokenModal, setShowTokenModal] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState<StudentSession | null>(null)
  const [teacherAvail, setTeacherAvail] = useState<boolean[][]>([])
  const [redeemMsg, setRedeemMsg] = useState<string | null>(null)
  const [courseTotal, setCourseTotal] = useState(60)
  const [calSelectedDate, setCalSelectedDate] = useState<Date | null>(null)

  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showRateModal, setShowRateModal] = useState(false)
  const [teacherRating, setTeacherRating] = useState(0)
  const [teacherComment, setTeacherComment] = useState('')
  const [ratingLoading, setRatingLoading] = useState(false)

  // Series Request state
  const [seriesName, setSeriesName] = useState('')
  const [seriesLoading, setSeriesLoading] = useState(false)
  const [seriesMsg, setSeriesMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const [showSeriesInfo, setShowSeriesInfo] = useState(false)

  // Mastery / Platinado State (6 Tiers + Tier 0 Nada Absoluto)
  const [masteryMap, setMasteryMap] = useState<Record<number, { tier: number; lastTrainedAt: string }>>({})
  const [cooldownMsg, setCooldownMsg] = useState<string | null>(null)

  // Topics Pagination State (5 per page default)
  const [topicPage, setTopicPage] = useState(1)
  const [showAllTopics, setShowAllTopics] = useState(false)
  const TOPICS_PER_PAGE = 5

  // AI Practice Document State (3 activities x 5 points each)
  const [practiceDoc, setPracticeDoc] = useState<any | null>(null)
  const [practiceCards, setPracticeCards] = useState<any[]>([])
  const [practiceLoading, setPracticeLoading] = useState(false)
  const [revealedSolutions, setRevealedSolutions] = useState<Record<string, boolean>>({})
  const [practiceLimitInfo, setPracticeLimitInfo] = useState<{ allowed: boolean; remainingText?: string; count: number }>({ allowed: true, count: 0 })
  const [practiceLimitNotice, setPracticeLimitNotice] = useState<string | null>(null)

  // Experience Bar Interactive Breakdown Drawer State
  const [showExpDetails, setShowExpDetails] = useState(false)

  // Infinite Scroll Trivia Mini-App Modal State
  const [showTriviaModal, setShowTriviaModal] = useState(false)
  const [activeTriviaTopic, setActiveTriviaTopic] = useState<{ order: number; name: string; ldsFormula?: string; commonMistake?: string } | null>(null)

  // Verifica y gestiona el límite de 3 prácticas de IA cada 12 horas
  const checkPracticeLimit = useCallback(() => {
    if (typeof window === 'undefined') return { allowed: true, count: 0 }
    const key = `ll_practice_uses_${profile?.id || 'guest'}`
    try {
      const raw = localStorage.getItem(key)
      const timestamps: number[] = raw ? JSON.parse(raw) : []
      const now = Date.now()
      const twelveHoursAgo = now - 12 * 60 * 60 * 1000
      const recent = timestamps.filter(t => t > twelveHoursAgo)
      localStorage.setItem(key, JSON.stringify(recent))

      if (recent.length >= 3) {
        const oldestRecent = Math.min(...recent)
        const nextAvailable = oldestRecent + 12 * 60 * 60 * 1000
        const diffMs = Math.max(0, nextAvailable - now)
        const diffH = Math.floor(diffMs / (1000 * 60 * 60))
        const diffM = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
        return { allowed: false, remainingText: `${diffH}h ${diffM}m`, count: recent.length }
      }
      return { allowed: true, count: recent.length }
    } catch {
      return { allowed: true, count: 0 }
    }
  }, [profile?.id])

  function recordPracticeUsage() {
    if (typeof window === 'undefined') return
    const key = `ll_practice_uses_${profile?.id || 'guest'}`
    try {
      const raw = localStorage.getItem(key)
      const timestamps: number[] = raw ? JSON.parse(raw) : []
      timestamps.push(Date.now())
      localStorage.setItem(key, JSON.stringify(timestamps))
      setPracticeLimitInfo(checkPracticeLimit())
    } catch {}
  }

  useEffect(() => {
    const raw = sessionStorage.getItem('ll_student')
    if (!raw) { router.replace('/login'); return }
    let p: StudentProfile
    try {
      p = JSON.parse(raw)
    } catch {
      sessionStorage.removeItem('ll_student')
      router.replace('/login')
      return
    }
    setProfile(p)
    loadSessions(p.id)
  }, [])

  async function loadSessions(sid: string) {
    setLoading(true)
    const res = await fetch(`/api/student/sessions?studentId=${sid}`)
    if (res.ok) {
      const data = await res.json()
      setUpcoming(data.upcomingSessions ?? [])
      setCompleted(data.completedSessions ?? [])
      if (data.totalTopics) setCourseTotal(data.totalTopics)
      if (data.masteryMap) setMasteryMap(data.masteryMap)
      if (data.studentProfile) {
        setProfile(prev => {
          const updated = { ...(prev || {}), ...data.studentProfile }
          sessionStorage.setItem('ll_student', JSON.stringify(updated))
          return updated
        })
      }
    }
    setLoading(false)
  }

  async function handleOpenTopicModal(session: StudentSession) {
    setSelectedTopic(session)
    setPracticeDoc(null)
    setPracticeCards([])
    setCooldownMsg(null)
    setPracticeLimitNotice(null)
    setPracticeLimitInfo(checkPracticeLimit())
    const order = session.topicOrder ?? 0
    if (!profile || !order) return
    
    // Subida de maestría: Si está en Nivel 0, el primer clic lo convierte en Nivel 1 (Madera)
    try {
      const res = await fetch('/api/student/topic-mastery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: profile.id, topicOrder: order })
      })
      const data = await res.json()
      if (data.ok) {
        setMasteryMap(data.masteryMap)
        if (data.promotedFromZero) {
          // Sin aviso de inicio de repaso
          setCooldownMsg(null)
        } else {
          setCooldownMsg(`¡Subiste de rango en este tema! Podrás subir nuevamente en 12 horas si vuelves a repasar.`)
        }
      } else if (data.cooldownActive) {
        setCooldownMsg(`Si vuelves a repasar en ${data.remainingText}, vas a subir la maestría en este tema.`)
      }
    } catch {
      // Silencioso para no bloquear la lectura de slides
    }
  }

  async function handleGeneratePractice(topic: StudentSession) {
    const limit = checkPracticeLimit()
    if (!limit.allowed) {
      setPracticeLimitNotice(`Has alcanzado el límite de 3 guías de estudio cada 12 horas. Tu próximo ciclo se renovará en ${limit.remainingText}.`)
      return
    }
    setPracticeLimitNotice(null)

    setPracticeLoading(true)
    setPracticeDoc(null)
    setPracticeCards([])
    setRevealedSolutions({})
    try {
      const res = await fetch('/api/student/generate-practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: profile?.name,
          topicName: topic.topicName,
          level: 'B1'
        })
      })
      const data = await res.json()
      if (data.activities) {
        setPracticeDoc(data)
        recordPracticeUsage()
      } else if (data.cards) {
        setPracticeCards(data.cards)
        recordPracticeUsage()
      }
    } catch {
      alert('Error al generar la guía de práctica con IA')
    } finally {
      setPracticeLoading(false)
    }
  }

  function getTierConfig(tier: number) {
    switch (tier) {
      case 1:
        return { name: 'Bronze', icon: <Award size={13} color="#ea580c" />, class: styles.tier1, desc: 'Streak 5+', color: '#ea580c' }
      case 2:
        return { name: 'Silver', icon: <Shield size={13} color="#94A3B8" />, class: styles.tier2, desc: 'Streak 10+', color: '#94a3b8' }
      case 3:
        return { name: 'Gold', icon: <Trophy size={13} color="#FBBF24" />, class: styles.tier3, desc: 'Streak 15+', color: '#f59e0b' }
      case 4:
        return { name: 'Diamond', icon: <Gem size={13} color="#38BDF8" />, class: styles.tier4, desc: 'Streak 20+', color: '#38bdf8' }
      case 5:
      case 6:
        return { name: 'Platinum', icon: <Crown size={13} color="#34D399" />, class: styles.tier5, desc: 'Streak 25+', color: '#10b981' }
      case 0:
      default:
        return { name: 'Unranked', icon: <CircleDot size={13} color="#64748B" />, class: styles.tier0, desc: 'Sin rango', color: '#475569' }
    }
  }

  async function handleReschedule(session: StudentSession) {
    if (!confirm('¿Seguro que quieres reagendar esta clase? Se te asignará un token de reposición y el temario avanzará a la próxima sesión.')) return
    setRescheduling(session.id)
    const res = await fetch('/api/student/reschedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: session.id, studentId: profile?.id, canceledBy: 'student' }),
    })
    const data = await res.json()
    if (!res.ok) { alert(data.error || 'Error al reagendar'); setRescheduling(null); return }
    const updated: StudentProfile = { ...profile!, tokens: profile!.tokens + 1 }
    setProfile(updated)
    sessionStorage.setItem('ll_student', JSON.stringify(updated))
    loadSessions(profile!.id)
    setRescheduling(null)
  }

  async function openTokenModal() {
    if (!profile?.teacherId) { alert('No tienes profesor asignado aún.'); return }
    setRedeemMsg(null)
    setCalSelectedDate(null)
    const res = await fetch(`/api/student/teacher-availability?teacherId=${profile.teacherId}`)
    if (res.ok) {
      const data = await res.json()
      setTeacherAvail(data.availability ?? [])
    }
    setShowTokenModal(true)
  }

  async function handleRedeem(selectedDateTime: Date) {
    if (!profile) return
    const label = selectedDateTime.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })
    const hourLabel = selectedDateTime.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
    if (!confirm(`¿Agendar clase el ${label} a las ${hourLabel}? Se usará 1 token.`)) return

    const jsDay = selectedDateTime.getDay()
    const dayIndex = jsDay === 0 ? 6 : jsDay - 1
    const hourIndex = selectedDateTime.getHours() - HOURS_START

    const res = await fetch('/api/student/redeem-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        studentId: profile.id, 
        teacherId: profile.teacherId, 
        dayIndex, 
        hourIndex,
        exactDate: selectedDateTime.toISOString()
      }),
    })
    const data = await res.json()
    if (!res.ok) { setRedeemMsg(data.error || 'Error'); return }
    const updated = { ...profile, tokens: profile.tokens - 1 }
    setProfile(updated)
    sessionStorage.setItem('ll_student', JSON.stringify(updated))
    setShowTokenModal(false)
    setCalSelectedDate(null)
    loadSessions(profile.id)
    alert('¡Clase agendada exitosamente!')
  }

  async function openScheduleModal() {
    if (!profile?.teacherId) { alert('No tienes profesor asignado aún.'); return }
    const res = await fetch(`/api/student/teacher-availability?teacherId=${profile.teacherId}`)
    if (res.ok) {
      const data = await res.json()
      setTeacherAvail(data.availability ?? [])
    }
    setShowScheduleModal(true)
  }

  async function submitRating() {
    if (!profile || teacherRating === 0) return
    setRatingLoading(true)
    const res = await fetch('/api/student/rate-teacher', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId: profile.id, teacherId: profile.teacherId, rating: teacherRating, comment: teacherComment })
    })
    setRatingLoading(false)
    if (res.ok) {
        setShowRateModal(false)
        setTeacherRating(0)
        setTeacherComment('')
        alert('Gracias por tu feedback.')
    } else {
        alert('Error al enviar la calificación.')
    }
  }

  async function handleSeriesRequest() {
    if (!profile || !seriesName.trim()) return
    setSeriesLoading(true)
    setSeriesMsg(null)
    try {
      const res = await fetch('/api/student/series-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: profile.id, seriesName: seriesName.trim() })
      })
      const data = await res.json()
      if (res.ok) {
        setSeriesMsg({ text: 'Solicitud enviada. ¡Te avisaremos cuando esté lista!', type: 'success' })
        setSeriesName('')
      } else {
        setSeriesMsg({ text: data.error || 'Error al enviar solicitud', type: 'error' })
      }
    } catch {
      setSeriesMsg({ text: 'Error de conexión', type: 'error' })
    } finally {
      setSeriesLoading(false)
    }
  }

  function buildCalendarDays(): { date: Date; availableHours: { hour: number; label: string }[] }[] {
    const now = new Date()
    const minTime = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const days: { date: Date; availableHours: { hour: number; label: string }[] }[] = []

    for (let i = 1; i <= 14; i++) {
      const d = new Date(now)
      d.setDate(now.getDate() + i)
      d.setHours(0, 0, 0, 0)

      const jsDay = d.getDay()
      const gridCol = jsDay === 0 ? 6 : jsDay - 1

      const availableHours: { hour: number; label: string }[] = []
      for (let row = 0; row < HOURS.length; row++) {
        if (!teacherAvail[row]?.[gridCol]) continue
        const slotDate = new Date(d)
        slotDate.setHours(HOURS_START + row, 0, 0, 0)
        if (slotDate >= minTime) {
          availableHours.push({ hour: HOURS_START + row, label: HOURS[row] })
        }
      }
      if (availableHours.length > 0) {
        days.push({ date: d, availableHours })
      }
    }
    return days
  }

  function downloadSlidesPDF(session: StudentSession) {
    if (!session.cachedSlides || session.cachedSlides.length === 0) return
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${session.topicName ?? 'Material'}</title>
    <style>
      body { font-family: sans-serif; background: #080a11; color: #f8fafc; margin: 0; padding: 2rem; }
      .slide { page-break-after: always; margin-bottom: 3rem; padding: 2rem; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; }
      .slide-title { font-size: 1.4rem; font-weight: 700; margin-bottom: 1.5rem; color: #8b5cf6; }
      h2, h3, h4 { color: #8b5cf6; }
      table { border-collapse: collapse; width: 100%; }
      td, th { border: 1px solid rgba(255,255,255,0.15); padding: 8px; }
    </style></head><body>
    ${session.cachedSlides.map((s, i) => `<div class="slide"><div class="slide-title">${i + 1}. ${s.title}</div>${s.content}</div>`).join('')}
    </body></html>`

    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${session.topicName ?? 'material'}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  function formatDate(iso: string) {
    const d = new Date(iso)
    return d.toLocaleDateString('es-CO', { weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const completedCount = completed.length
  const classProgress = courseTotal > 0 ? (completedCount / courseTotal) : 0

  // Course progress bar only advances when a topic reaches the penultimate or final level (Diamond=4 or Platinum=5)
  let diamondOrPlatinumCount = 0
  let diamondOrPlatinumScore = 0
  for (let i = 1; i <= courseTotal; i++) {
    const t = masteryMap[i]?.tier || 0
    if (t >= 5) {
      diamondOrPlatinumCount += 1
      diamondOrPlatinumScore += 1.0 // Full mastery point for Platinum
    } else if (t === 4) {
      diamondOrPlatinumCount += 1
      diamondOrPlatinumScore += 0.75 // Substantial credit for Diamond (penultimate level)
    }
  }
  const masteryProgress = courseTotal > 0 ? (diamondOrPlatinumScore / courseTotal) : 0
  const combinedPct = Math.min(100, Math.round((classProgress * 0.6 + masteryProgress * 0.4) * 100))

  if (!profile) return null

  return (
    <>
      <Head>
        <title>LinguaLife — Mi Progreso</title>
        <meta name="description" content="Sigue tu progreso de aprendizaje de inglés con LinguaLife." />
      </Head>

      <div className={styles.container}>
        {/* Subtle Cozy-Tech Minimal Background Texture */}
        <div className={styles.dashboardTexture} aria-hidden="true" />
        {/* === Header === */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.greeting}>Hola, {profile.name.split(' ')[0]}</h1>
            {profile.teacherId && (
              <div className={styles.headerActions} style={{ marginTop: '0.4rem' }}>
                <button className={styles.headerBtn} onClick={openScheduleModal} title="Cambiar horario regular" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Calendar size={14} />
                  <span>Ajustar Horario Regular</span>
                </button>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button className={styles.logoutBtn} onClick={() => { sessionStorage.removeItem('ll_student'); router.replace('/') }} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <LogOut size={14} />
              <span>Salir</span>
            </button>
          </div>
        </div>

        {/* === Cockpit Progress Card (Centered Percentage & Interactive Game Experience Bar) === */}
        <div className={styles.progressCard}>
          <div className={styles.progressTopRow}>
            <div className={styles.cockpitStatusBadge}>
              <span className={styles.statusLiveDot} />
              <span>Progreso general</span>
            </div>
            {combinedPct >= 90 ? (
              <span className={styles.badgeGold} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <Crown size={14} />
                <span>Nivel Maestro Platino</span>
              </span>
            ) : combinedPct >= 50 ? (
              <span className={styles.badgeGold} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <Trophy size={14} />
                <span>Nivel Avanzado</span>
              </span>
            ) : (
              <span className={styles.badgeGold} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <Zap size={14} />
                <span>Ruta Activa</span>
              </span>
            )}
          </div>

          {/* Porcentaje Centrado y Grande (Sin subtítulo) */}
          <div className={styles.cockpitCenterWrap}>
            <div className={styles.cockpitPctCentered}>
              {combinedPct}<span className={styles.pctSign}>%</span>
            </div>
          </div>

          {/* Barra de Experiencia Gruesa e Interactiva con Haz de Luz Dinámico */}
          <div 
            className={styles.progressTrackInteractive}
            onClick={() => setShowExpDetails(prev => !prev)}
            title="Haz clic para ver/ocultar el desglose de experiencia"
          >
            <div className={styles.progressFillThick} style={{ width: `${combinedPct}%` }} />
          </div>

          {/* Desglose de Experiencia Interactivo (Aparece al hacer clic en la barra) */}
          {showExpDetails && (
            <div className={styles.expDetailsDrawer}>
              <div className={styles.cockpitPill}>
                <span className={styles.cockpitPillIcon} style={{ color: 'var(--accent-primary)' }}>
                  <BookOpen size={18} />
                </span>
                <div className={styles.cockpitPillText}>
                  <span className={styles.cockpitPillTitle}>{completedCount} de {courseTotal} temas completados</span>
                  <span className={styles.cockpitPillSub}>Ponderación de 60% en tu avance de clases</span>
                </div>
              </div>

              <div className={styles.cockpitPill}>
                <span className={styles.cockpitPillIcon} style={{ color: 'var(--accent-emerald)' }}>
                  <Crown size={18} />
                </span>
                <div className={styles.cockpitPillText}>
                  <span className={styles.cockpitPillTitle}>{diamondOrPlatinumCount} de {courseTotal} temas en Diamond o Platinum</span>
                  <span className={styles.cockpitPillSub}>Ponderación de 40% (solo rangos Diamond y Platinum avanzan tu barra)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* === Grid Row: Próximas Clases & Tokens === */}
        <div className={styles.grid}>

          {/* Próximas Clases */}
          <section className={styles.card}>
            <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={18} color="var(--accent-primary)" />
              <span>Próximas Clases</span>
            </h2>
            {loading && <div className="spinner" />}
            {!loading && upcoming.length === 0 && (
              <p className={styles.empty}>No tienes clases programadas próximamente.</p>
            )}
            {!loading && upcoming.map(s => {
              const isSkipped = s.isHoliday && s.status === 'Canceled'
              return (
                <div key={s.id} className={`${styles.sessionRow} ${isSkipped ? styles.skipped : ''}`}>
                  <div className={styles.sessionDot} />
                  <div className={styles.sessionInfo}>
                    <div className={styles.sessionDateRow}>
                      <div className={styles.sessionDate}>{formatDate(s.date)}</div>
                      {s.isHoliday && <span className={styles.holidayBadge}>Festivo</span>}
                    </div>
                    {s.topicName && <div className={styles.sessionTopic}>{s.topicName}</div>}
                    {isSkipped && (
                      <div className={styles.skippedNote} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Clock size={14} />
                        <span>Día festivo. Esta clase se reprogramará automáticamente.</span>
                      </div>
                    )}
                  </div>
                  {!isSkipped && (
                    <div className={styles.rescheduleWrap}>
                      <div className={styles.infoTooltipWrap}>
                        <span className={styles.infoIcon} style={{ display: 'inline-flex', alignItems: 'center' }}>
                          <Info size={13} />
                        </span>
                        <div className={styles.tooltipText}>
                          Si reagendas, la sesión se moverá para usar 1 token y el temario avanzará. Permitiendo reagendar hasta 24h antes.
                        </div>
                      </div>
                      <button
                        className={styles.rescheduleBtn}
                        onClick={() => handleReschedule(s)}
                        disabled={rescheduling === s.id}
                        title="Reagendar esta clase"
                        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        {rescheduling === s.id ? '...' : <RotateCcw size={14} />}
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </section>

          {/* Tokens de Reposición */}
          <section className={styles.card}>
            <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Award size={18} color="var(--accent-amber)" />
              <span>Tokens de Reposición</span>
            </h2>
            <div className={styles.tokenBalance}>
              <span className={styles.tokenCount}>{profile.tokens}</span>
              <span className={styles.tokenLabel}>{profile.tokens === 1 ? 'token disponible' : 'tokens disponibles'}</span>
            </div>
            {profile.tokens > 0 ? (
              <button className={styles.redeemBtn} onClick={openTokenModal} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <span>Agendar Clase Extra</span>
                <ArrowRight size={16} />
              </button>
            ) : (
              <p className={styles.empty}>Cuando reagendes una clase con anticipación, tu token aparecerá aquí para agendar tu sesión de reposición.</p>
            )}
          </section>

          {/* Rate Teacher Card */}
          {profile.teacherId && (
            <section className={styles.card}>
              <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Star size={18} color="var(--accent-amber)" />
                <span>Calificar a {profile.teacherName ?? 'tu Profesor'}</span>
              </h2>
              <p className={styles.empty}>Tu opinión ayuda a mejorar la experiencia de todos. ¿Cómo ha sido tu experiencia?</p>
              <button
                className={styles.redeemBtn}
                style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                onClick={() => setShowRateModal(true)}
              >
                <Star size={16} fill="currentColor" />
                <span>Dejar una Calificación</span>
              </button>
            </section>
          )}

        </div>

        {/* === Completed Topics: Repasa lo que has visto (Paginado a 5 por página) === */}
        <section className={styles.topicsCard}>
          {(() => {
            const sortedCompleted = [...completed].sort((a,b) => (a.topicOrder ?? 0) - (b.topicOrder ?? 0))
            const totalPages = Math.max(1, Math.ceil(sortedCompleted.length / TOPICS_PER_PAGE))
            const currentPage = Math.min(topicPage, totalPages)
            const displayedTopics = showAllTopics 
              ? sortedCompleted 
              : sortedCompleted.slice((currentPage - 1) * TOPICS_PER_PAGE, currentPage * TOPICS_PER_PAGE)

            return (
              <>
                <div className={styles.topicsHeaderWrap}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div className={styles.topicsSectionBadge}>
                      <BookOpen size={16} />
                      <h2 className={styles.sectionTitle} style={{ margin: 0 }}>Repasa estos temas importantes</h2>
                    </div>
                  </div>

                  {/* Botonera de Paginación Inteligente */}
                  {sortedCompleted.length > TOPICS_PER_PAGE && (
                    <div className={styles.paginationControls}>
                      <button
                        className={styles.pageBtn}
                        disabled={showAllTopics || currentPage <= 1}
                        onClick={() => setTopicPage(p => Math.max(1, p - 1))}
                        title="Página anterior"
                      >
                        <ChevronLeft size={14} />
                        <span>Anterior</span>
                      </button>

                      <div className={styles.pageSelectWrap}>
                        <span>Pág.</span>
                        <select
                          className={styles.pageSelect}
                          value={currentPage}
                          disabled={showAllTopics}
                          onChange={e => setTopicPage(Number(e.target.value))}
                          aria-label="Cambiar número de página"
                        >
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                            <option key={num} value={num}>
                              {num} de {totalPages}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        className={styles.pageBtn}
                        disabled={showAllTopics || currentPage >= totalPages}
                        onClick={() => setTopicPage(p => Math.min(totalPages, p + 1))}
                        title="Página siguiente"
                      >
                        <span>Siguiente</span>
                        <ChevronRight size={14} />
                      </button>

                      <button
                        className={styles.toggleAllBtn}
                        onClick={() => setShowAllTopics(prev => !prev)}
                        title={showAllTopics ? "Mostrar 5 por página" : "Mostrar todos los temas a la vez"}
                      >
                        {showAllTopics ? "Ver 5 por página" : `Mostrar todo (${sortedCompleted.length})`}
                      </button>
                    </div>
                  )}
                </div>

                {loading && <div className="spinner" />}
                {!loading && sortedCompleted.length === 0 && (
                  <p className={styles.empty}>Aún no has completado ningún tema. ¡Tu primera clase marcará el inicio de tu camino!</p>
                )}

                <div className={styles.topicsGrid}>
                  {displayedTopics.map((s) => {
                    // Empieza en Nivel 0 (Nada absoluto / Sin rango) por defecto
                    const currentTier = masteryMap[s.topicOrder ?? 0]?.tier ?? 0
                    const tierCfg = getTierConfig(currentTier)

                    return (
                      <button
                        key={s.id}
                        className={`${styles.topicChip} ${tierCfg.class} ${s.cachedSlides ? styles.topicClickable : ''}`}
                        onClick={() => s.cachedSlides && handleOpenTopicModal(s)}
                        title={`Tema #${s.topicOrder}: ${s.topicName} — Rango: ${tierCfg.name} (${tierCfg.desc})`}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.55rem', borderColor: tierCfg.color }}
                      >
                        <span className={styles.tierBadge}>{tierCfg.icon}</span>
                        <span className={styles.topicNum} style={{ borderColor: `${tierCfg.color}77`, color: tierCfg.color }}>
                          {s.topicOrder ? String(s.topicOrder).padStart(2, '0') : '–'}
                        </span>
                        <span className={styles.topicName}>{s.topicName ?? 'Clase completada'}</span>
                        {s.cachedSlides && (
                          <span className={styles.viewSlides} style={{ marginLeft: 'auto', opacity: 0.8, display: 'inline-flex', alignItems: 'center' }}>
                            <BookOpen size={13} />
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </>
            )
          })()}
        </section>

        {/* === Full Width Card: Actividad de Serie === */}
        <section className={styles.seriesCardFull} style={{ margin: '2rem 0' }}>
          <div className={styles.seriesHeaderWrap}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h2 className={styles.sectionTitle} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                <Tv size={20} color="var(--accent-primary)" />
                <span>Actividad de Serie</span>
              </h2>
              <div style={{ position: 'relative', display: 'inline-flex' }}>
                <button
                  type="button"
                  className={styles.seriesInfoBtn}
                  onClick={() => setShowSeriesInfo(prev => !prev)}
                  title="Información sobre la actividad de serie"
                  aria-label="Información de la actividad de serie"
                >
                  <Info size={15} />
                </button>

                {/* Burbuja flotante por encima con cierre instantáneo al hacer clic afuera */}
                {showSeriesInfo && (
                  <>
                    <div 
                      style={{ position: 'fixed', inset: 0, zIndex: 998, background: 'transparent' }} 
                      onClick={() => setShowSeriesInfo(false)} 
                    />
                    <div 
                      className={styles.seriesFloatingBubble}
                      onClick={e => e.stopPropagation()}
                    >
                      <div className={styles.seriesInfoPopoverTitle} style={{ margin: '0 0 0.5rem 0' }}>
                        <Sparkles size={16} />
                        <span>¿Cómo funciona la Actividad de Serie?</span>
                      </div>
                      <ul className={styles.seriesInfoPopoverList}>
                        <li><strong>100% Personalizada:</strong> Adaptada a tu nivel actual y diseñada con vocabulario auténtico de la serie o película que estás viendo.</li>
                        <li><strong>Enfoque Práctico:</strong> Ejercicios de listening, frases coloquiales y expresiones cotidianas reales extraídas de los episodios.</li>
                      </ul>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          <p className={styles.empty} style={{ marginBottom: '1.25rem', marginTop: '0.4rem' }}>
            ¿Estás viendo una serie? Pídenos una actividad pedagógica.
          </p>
          <div className={styles.seriesRequestBox}>
            <input
              className={styles.seriesInput}
              placeholder="Escribe el nombre de la serie que estás viendo..."
              value={seriesName}
              onChange={e => setSeriesName(e.target.value)}
              disabled={seriesLoading}
            />
            <button 
              className={styles.seriesBtn} 
              onClick={handleSeriesRequest}
              disabled={seriesLoading || !seriesName.trim()}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              {seriesLoading ? 'Enviando...' : (
                <>
                  <span>Solicitar Actividad</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </div>
          {seriesMsg && (
            <div className={`${styles.seriesMsg} ${seriesMsg.type === 'error' ? styles.seriesError : styles.seriesSuccess}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={16} />
              <span>{seriesMsg.text}</span>
            </div>
          )}
        </section>

        {/* === Próximamente en LinguaLife (Gran Título Animado & Sin Spoilers) === */}
        <section className={styles.comingSoonCard}>
          <div className={styles.comingBigTitleWrap}>
            <div>
              <h2 className={styles.comingBigTitle}>
                <Sparkles size={28} color="#38bdf8" />
                <span>Próximamente en LinguaLife</span>
              </h2>
              <p className={styles.comingBigSub}>
                Nuevas herramientas inmersivas y módulos pedagógicos en desarrollo activo.
              </p>
            </div>
            <span className={styles.comingBadge} style={{ alignSelf: 'flex-start' }}>
              <span className={styles.comingPulse} />
              <span>Pronto</span>
            </span>
          </div>

          <div className={styles.comingSoonGrid}>
            {/* 1. Lecturas Personalizadas (Interactive Readers) - Ocupa todo el ancho (Featured) */}
            <div className={`${styles.comingItem} ${styles.comingItemFeatured}`}>
              <div>
                <div className={styles.comingHeader}>
                  <span className={styles.comingIcon} style={{ color: 'var(--accent-primary)' }}>
                    <BookOpen size={20} />
                  </span>
                  <span className={styles.comingBadge}>
                    <span className={styles.comingPulse} />
                    <span>Pronto</span>
                  </span>
                </div>

                {/* Cozy Cyberpunk Pixel Art Image Showcase */}
                <div className={`${styles.cardImageWrap} ${styles.cardImageWrapFeatured}`}>
                  <img 
                    src="/coming-soon/reader_pixel.jpg" 
                    alt="Lecturas Personalizadas (Interactive Readers)" 
                    className={styles.cardPixelImg} 
                    loading="lazy" 
                  />
                </div>

                <div className={styles.comingTitle}>Lecturas Personalizadas (Interactive Readers)</div>
                <div className={styles.comingDesc}>Historias adaptadas a tu nivel con resaltador inteligente en tiempo real y traducción contextual al hacer clic en cualquier oración.</div>
              </div>
            </div>

            {/* 2. Vocabulary Practicer (Flashcards) */}
            <div className={styles.comingItem}>
              <div>
                <div className={styles.comingHeader}>
                  <span className={styles.comingIcon} style={{ color: 'var(--accent-purple)' }}>
                    <Layers size={20} />
                  </span>
                  <span className={styles.comingBadge}>
                    <span className={styles.comingPulse} />
                    <span>Pronto</span>
                  </span>
                </div>

                {/* Cozy Cyberpunk Pixel Art Image Showcase */}
                <div className={styles.cardImageWrap}>
                  <img 
                    src="/coming-soon/flashcard_pixel.jpg" 
                    alt="Vocabulary Practicer (Flashcards)" 
                    className={styles.cardPixelImg} 
                    loading="lazy" 
                  />
                </div>

                <div className={styles.comingTitle}>Vocabulary Practicer (Flashcards)</div>
                <div className={styles.comingDesc}>Tarjetas interactivas de repaso 3D con repetición espaciada y pronunciación nativa para consolidar vocabulario.</div>
              </div>
            </div>

            {/* 3. Interactive Scene Explorer */}
            <div className={styles.comingItem}>
              <div>
                <div className={styles.comingHeader}>
                  <span className={styles.comingIcon} style={{ color: 'var(--accent-blue)' }}>
                    <Compass size={20} />
                  </span>
                  <span className={styles.comingBadge}>
                    <span className={styles.comingPulse} />
                    <span>Pronto</span>
                  </span>
                </div>

                {/* Cozy Cyberpunk Pixel Art Image Showcase */}
                <div className={styles.cardImageWrap}>
                  <img 
                    src="/coming-soon/scene_pixel.jpg" 
                    alt="Interactive Scene Explorer" 
                    className={styles.cardPixelImg} 
                    loading="lazy" 
                  />
                </div>

                <div className={styles.comingTitle}>Interactive Scene Explorer</div>
                <div className={styles.comingDesc}>Escenarios visuales interactivos 2D con vocabulario situacional, audios contextuales y práctica guiada paso a paso.</div>
              </div>
            </div>

            {/* 4. Banco de Videos Nativos */}
            <div className={styles.comingItem}>
              <div>
                <div className={styles.comingHeader}>
                  <span className={styles.comingIcon} style={{ color: 'var(--accent-emerald)' }}>
                    <Video size={20} />
                  </span>
                  <span className={styles.comingBadge}>
                    <span className={styles.comingPulse} />
                    <span>Pronto</span>
                  </span>
                </div>

                {/* Cozy Cyberpunk Pixel Art Image Showcase */}
                <div className={styles.cardImageWrap}>
                  <img 
                    src="/coming-soon/video_pixel.jpg" 
                    alt="Banco de Videos Nativos" 
                    className={styles.cardPixelImg} 
                    loading="lazy" 
                  />
                </div>

                <div className={styles.comingTitle}>Banco de Videos Nativos</div>
                <div className={styles.comingDesc}>Clips y videos auténticos seleccionados por nivel con transcripción sincronizada para acostumbrar tu oído al ritmo nativo.</div>
              </div>
            </div>

            {/* 5. Sistema de Logros & Medallas */}
            <div className={styles.comingItem}>
              <div>
                <div className={styles.comingHeader}>
                  <span className={styles.comingIcon} style={{ color: 'var(--accent-amber)' }}>
                    <Trophy size={20} />
                  </span>
                  <span className={styles.comingBadge}>
                    <span className={styles.comingPulse} />
                    <span>Pronto</span>
                  </span>
                </div>

                {/* Cozy Cyberpunk Pixel Art Image Showcase */}
                <div className={styles.cardImageWrap}>
                  <img 
                    src="/coming-soon/trophy_pixel.jpg" 
                    alt="Sistema de Logros & Medallas" 
                    className={styles.cardPixelImg} 
                    loading="lazy" 
                  />
                </div>

                <div className={styles.comingTitle}>Sistema de Logros & Medallas</div>
                <div className={styles.comingDesc}>Insignias de constancia, hitos de fluidez y recompensas exclusivas al platinar lecciones y completar tus retos semanales.</div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* === Modal de Repaso: Diapositiva Única de Concepto Esencial (Sin Scroll) === */}
      {selectedTopic && (() => {
        const order = selectedTopic.topicOrder ?? 0
        const currentTier = masteryMap[order]?.tier ?? 0
        const tierCfg = getTierConfig(currentTier)
        const summary = getTopicSummary(order, selectedTopic.topicName, selectedTopic.cachedSlides)
        const cleanTitle = (selectedTopic.topicName || summary.title).replace(/\s*\([^)]*\)/g, '').trim()

        return (
          <div className={styles.modalOverlay} onClick={() => { setSelectedTopic(null); setPracticeDoc(null); setPracticeCards([]); setCooldownMsg(null); setPracticeLimitNotice(null) }}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span className={styles.tierBadge} style={{ borderColor: tierCfg.color, color: tierCfg.color }}>
                    {tierCfg.icon}
                  </span>
                  <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#ffffff' }}>
                    Tema #{order}: {cleanTitle}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
                  <button
                    type="button"
                    className={styles.aiTriviaBtn}
                    onClick={() => {
                      setActiveTriviaTopic({
                        order: order || 1,
                        name: cleanTitle
                      })
                      setShowTriviaModal(true)
                    }}
                    title="Entrenar con la Trivia Infinita de este tema específico"
                  >
                    <Flame size={15} color="#fde047" />
                    <span>Trivia Infinita</span>
                  </button>
                  <button
                    type="button"
                    className={styles.aiPracticeBtn}
                    onClick={() => handleGeneratePractice(selectedTopic)}
                    disabled={practiceLoading}
                    title="Generar guía de estudio intensiva (3 actividades x 5 puntos)"
                  >
                    <Zap size={15} />
                    <span>
                      {practiceLoading ? 'Diseñando Guía...' : 'Estudiar con IA'}
                    </span>
                  </button>
                  <button className={styles.modalClose} onClick={() => { setSelectedTopic(null); setPracticeDoc(null); setPracticeCards([]); setCooldownMsg(null); setPracticeLimitNotice(null) }}>
                    <X size={18} />
                  </button>
                </div>
              </div>
              
              <div className={styles.slidesContainer}>

                {/* Aviso explicativo solo cuando la persona intenta y agotó su cupo */}
                {practiceLimitNotice && (
                  <div style={{ padding: '0.75rem 1rem', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '10px', color: 'var(--accent-amber)', fontSize: '0.82rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <Clock size={15} />
                    <span>{practiceLimitNotice}</span>
                  </div>
                )}

                {/* Documento Estructurado de Práctica (3 Actividades x 5 Puntos) - Si se activa con IA */}
                {practiceDoc && practiceDoc.activities && (
                  <div className={styles.practiceDoc}>
                    <div className={styles.practiceDocHeader}>
                      <div className={styles.docTitleRow}>
                        <Target size={20} color="var(--accent-primary)" />
                        <div>
                          <div className={styles.docTitle}>{practiceDoc.documentTitle || `Guía Pedagógica: ${cleanTitle}`}</div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            3 actividades pedagógicas enfocadas • 15 puntos de dominio
                          </span>
                        </div>
                      </div>
                    </div>

                    {practiceDoc.activities.map((act: any) => (
                      <div key={act.id} className={styles.activityCard}>
                        <div className={styles.activityHeader}>
                          <div className={styles.activityTitle}>
                            <Zap size={15} color="var(--accent-primary)" />
                            <span>{act.title}</span>
                          </div>
                          <span style={{ fontSize: '0.72rem', color: 'var(--accent-primary)', fontWeight: 700 }}>5 puntos</span>
                        </div>
                        <div className={styles.activityInstruction}>{act.instruction}</div>

                        <div className={styles.itemsList}>
                          {act.items?.map((item: any, idx: number) => {
                            const isRevealed = revealedSolutions[item.id || `${act.id}-${idx}`]
                            const itemKey = item.id || `${act.id}-${idx}`

                            return (
                              <div key={itemKey} className={styles.itemRow}>
                                <div className={styles.itemPromptRow}>
                                  <span className={styles.itemNum}>#{idx + 1}</span>
                                  <span>{item.prompt}</span>
                                </div>
                                {item.hint && (
                                  <div className={styles.itemHint}>
                                    <Sparkles size={12} color="var(--accent-amber)" />
                                    <span>Pista: {item.hint}</span>
                                  </div>
                                )}
                                <div>
                                  <button
                                    type="button"
                                    className={styles.solutionToggleBtn}
                                    onClick={() => setRevealedSolutions(prev => ({ ...prev, [itemKey]: !prev[itemKey] }))}
                                  >
                                    {isRevealed ? 'Ocultar Solución' : 'Ver Solución & Explicación'}
                                  </button>
                                  {isRevealed && (
                                    <div className={styles.solutionRevealBox}>
                                      <div className={styles.solutionCorrect}>
                                        <Check size={14} />
                                        <span>{item.solution}</span>
                                      </div>
                                      <div className={styles.solutionWhy}>{item.explanation}</div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* === Diapositiva Única y Compacta de Repaso (Single Essential Slide) === */}
                <div className={styles.summarySlideCard}>
                  <div className={styles.summarySlideHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span className={styles.summaryPhaseBadge}>Fase: {summary.phase}</span>
                      <span className={styles.summaryLevelBadge}>{summary.level}</span>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>
                      Ficha Esencial de Repaso
                    </span>
                  </div>

                  <div className={styles.summaryGrid}>
                    {/* 1. ¿De qué se trata? */}
                    <div className={styles.summaryBlock}>
                      <div className={styles.summaryBlockTitle}>
                        <Target size={16} color="#38bdf8" />
                        <span>1. ¿De qué se trata el tema?</span>
                      </div>
                      <p className={styles.summaryBlockDesc}>
                        {summary.concept}
                      </p>
                    </div>

                    {/* 2. La Forma Correcta (Estructura LEGO) */}
                    <div className={styles.summaryBlock}>
                      <div className={styles.summaryBlockTitle}>
                        <Sparkles size={16} color="#10b981" />
                        <span>2. La Forma Correcta de Hacerlo</span>
                      </div>
                      <div className={styles.legoBlocksRow}>
                        {summary.structureBlocks.map((blk, i) => (
                          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span className={styles.legoBlock}>{blk}</span>
                            {i < summary.structureBlocks.length - 1 && (
                              <span className={styles.legoPlus}>+</span>
                            )}
                          </span>
                        ))}
                      </div>
                      <p className={styles.summaryBlockSub}>
                        {summary.correctMethod}
                      </p>
                    </div>

                    {/* 3. Ejemplos en Acción */}
                    <div className={styles.summaryBlock}>
                      <div className={styles.summaryBlockTitle}>
                        <BookOpen size={16} color="#a855f7" />
                        <span>3. Ejemplos en Acción</span>
                      </div>
                      <div className={styles.examplesList}>
                        {summary.examples.map((ex, i) => (
                          <div key={i} className={styles.exampleItem}>
                            <div className={styles.exampleEn}>"{ex.en}"</div>
                            <div className={styles.exampleEs}>→ {ex.es}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 4. Errores Comunes & Trampas del Español */}
                    <div className={styles.summaryBlock}>
                      <div className={styles.summaryBlockTitle}>
                        <AlertCircle size={16} color="#f59e0b" />
                        <span>4. Errores Comunes a Evitar</span>
                      </div>
                      <div className={styles.mistakeCompareBox}>
                        <div className={styles.mistakeWrong}>
                          <span className={styles.mistakeLabelWrong}>❌ Evita:</span>
                          <span>"{summary.commonMistake.wrong}"</span>
                        </div>
                        <div className={styles.mistakeRight}>
                          <span className={styles.mistakeLabelRight}>✅ Lo correcto:</span>
                          <span>"{summary.commonMistake.correct}"</span>
                        </div>
                      </div>
                      <p className={styles.summaryBlockSub} style={{ marginTop: '0.45rem' }}>
                        {summary.commonMistake.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {/* === Modal Interactivo: Juego de Trivia Infinita === */}
      {showTriviaModal && activeTriviaTopic && (
        <InfiniteTriviaModal
          isOpen={showTriviaModal}
          onClose={() => setShowTriviaModal(false)}
          topicOrder={activeTriviaTopic.order}
          topicName={activeTriviaTopic.name}
          studentProfile={profile}
          onMasteryUpgrade={(updatedMap) => {
            setMasteryMap(updatedMap)
          }}
        />
      )}

      {/* === Token Redemption Modal === */}
      {showTokenModal && (() => {
        const calDays = buildCalendarDays()
        const selectedDayData = calSelectedDate
          ? calDays.find(d => d.date.toDateString() === calSelectedDate.toDateString())
          : null

        return (
          <div className={styles.modalOverlay} onClick={() => setShowTokenModal(false)}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Award size={18} color="var(--accent-amber)" />
                  <span>Agenda tu clase de reposición</span>
                </span>
                <button className={styles.modalClose} onClick={() => setShowTokenModal(false)}>
                  <X size={18} />
                </button>
              </div>
              <p className={styles.modalSub}>
                {calSelectedDate ? 'Elige la hora disponible:' : 'Selecciona un día disponible (próximas 2 semanas):'}
              </p>
              {redeemMsg && <div className={styles.redeemError}>{redeemMsg}</div>}

              {!calSelectedDate ? (
                <div className={styles.calGrid}>
                  {calDays.length === 0 && (
                    <p className={styles.empty}>Tu profesor no tiene disponibilidad en las próximas 2 semanas.</p>
                  )}
                  {calDays.map(({ date, availableHours }) => {
                    const dayName = DAYS_SHORT[date.getDay()]
                    const dayNum = date.getDate()
                    const month = date.toLocaleDateString('es-CO', { month: 'short' })
                    return (
                      <button
                        key={date.toDateString()}
                        className={styles.calDayBtn}
                        onClick={() => setCalSelectedDate(date)}
                      >
                        <span className={styles.calDayName}>{dayName}</span>
                        <span className={styles.calDayNum}>{dayNum}</span>
                        <span className={styles.calDayMonth}>{month}</span>
                        <span className={styles.calDaySlots}>{availableHours.length} hora{availableHours.length !== 1 ? 's' : ''}</span>
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div>
                  <button className={styles.calBackBtn} onClick={() => setCalSelectedDate(null)}>
                    ← Cambiar día
                  </button>
                  <div className={styles.calDateTitle}>
                    {calSelectedDate.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </div>
                  <div className={styles.calHourGrid}>
                    {selectedDayData?.availableHours.map(({ hour, label }) => {
                      const slotDate = new Date(calSelectedDate)
                      slotDate.setHours(hour, 0, 0, 0)
                      return (
                        <button
                          key={hour}
                          className={styles.calHourBtn}
                          onClick={() => handleRedeem(slotDate)}
                        >
                          {label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      })()}

      {/* === Schedule Modal === */}
      {showScheduleModal && (
        <div className={styles.modalOverlay} onClick={() => setShowScheduleModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={18} color="var(--accent-primary)" />
                <span>Horarios Disponibles de {profile.teacherName}</span>
              </span>
              <button className={styles.modalClose} onClick={() => setShowScheduleModal(false)}>
                <X size={18} />
              </button>
            </div>
            <p className={styles.modalSub}>
              Estos son los espacios que tu profesor tiene habitualmente. Comenta con soporte si deseas hacer un cambio fijo.
            </p>
            <div className={styles.availGridWeekly}>
              <div className={styles.availDayRow}>
                <div />
                {DAYS_SHORT.map(d => <div key={d} className={styles.availDayLabel}>{d}</div>)}
              </div>
              {HOURS.map((hour, r) => (
                <div key={hour} className={styles.availDayRow}>
                  <span className={styles.availHourLabel}>{hour}</span>
                  {DAYS_SHORT.map((_, c) => (
                    <div key={c} className={`${styles.availCellWeekly} ${teacherAvail[r]?.[c === 0 ? 6 : c - 1] ? styles.availCellActive : ''}`} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* === Rate Teacher Modal === */}
      {showRateModal && (
        <div className={styles.modalOverlay} onClick={() => setShowRateModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Star size={18} color="var(--accent-amber)" />
                <span>Calificar a {profile.teacherName}</span>
              </span>
              <button className={styles.modalClose} onClick={() => setShowRateModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className={styles.rateBody}>
              <p className={styles.rateTopic}>¿Qué tal tu experiencia general con tu profesor?</p>
              <div className={styles.starsWrap}>
                {[1,2,3,4,5].map(star => (
                   <span key={star} onClick={() => setTeacherRating(star)} className={`${styles.star} ${teacherRating >= star ? styles.starActive : ''}`}>★</span>
                ))}
              </div>
              <textarea 
                className={styles.rateComment} 
                placeholder="Escribe un comentario o sugerencia... (opcional)" 
                value={teacherComment} 
                onChange={e => setTeacherComment(e.target.value)} 
              />
              <button className={styles.submitRatingBtn} onClick={submitRating} disabled={ratingLoading || teacherRating === 0}>
                {ratingLoading ? 'Enviando...' : 'Enviar Calificación'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
