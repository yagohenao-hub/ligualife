import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import styles from '@/styles/StudentDashboard.module.css'
import { LinguaLifeLogo } from '@/components/LinguaLifeLogo'
import { InfiniteTriviaModal } from '@/components/InfiniteTriviaModal'
import { ShortReadingModal } from '@/components/ShortReadingModal'
import { getTopicSummary } from '@/lib/curriculum-summary'
import { getFriendlyTopicName } from '@/lib/friendly-topics'
import { BUILTIN_FLASHCARD_PACKS, FLASHCARD_CATEGORIES } from '@/lib/flashcards'
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
  ArrowLeft,
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
  ChevronDown,
  ChevronUp,
  CircleDot,
  Volume2
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

// ── Helpers para Repaso Mental y Sanitización de Prompts ──
function sanitizeItemPrompt(prompt: string, solution?: string): string {
  if (!prompt) return ''
  let cleaned = prompt
  if (solution) {
    const sol = solution.trim()
    // 1. Quitar solución exacta si aparece tras [___]
    const solEscaped = sol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    cleaned = cleaned.replace(new RegExp(`\\[___\\]\\s+${solEscaped}\\b`, 'gi'), '[___]')

    // 2. Quitar palabras individuales de la solución si se colaron tras [___]
    const words = sol.split(/\s+/).map(w => w.trim()).filter(w => w.length >= 2)
    for (const w of words) {
      const wEscaped = w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      cleaned = cleaned.replace(new RegExp(`\\[___\\]\\s+${wEscaped}\\b`, 'gi'), '[___]')
    }
  }
  return cleaned
}

function renderPromptWithBlank(prompt: string) {
  if (!prompt.includes('[___]')) {
    return <span>{prompt}</span>
  }
  const parts = prompt.split('[___]')
  return (
    <span>
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 && (
            <span className={styles.blankSlotBadge} title="Espacio para responder en tu mente">
              ( ... )
            </span>
          )}
        </span>
      ))}
    </span>
  )
}

interface MixedPracticeItem {
  itemKey: string
  category: 'pattern' | 'trap' | 'sprint'
  categoryLabel: string
  prompt: string
  hint?: string
  solution: string
  explanation: string
}

function getMixedPracticeItems(activities: any[]): MixedPracticeItem[] {
  if (!activities || !Array.isArray(activities)) return []

  const actMap: Record<number, { category: 'pattern' | 'trap' | 'sprint'; label: string }> = {
    1: { category: 'pattern', label: 'Deduce la Forma' },
    2: { category: 'trap', label: 'Detecta la Trampa' },
    3: { category: 'sprint', label: 'Traducción Ágil' }
  }

  const itemsByAct = activities.map((act, actIdx) => {
    const actId = act.id || actIdx + 1
    const meta = actMap[actId] || (
      act.title?.toLowerCase().includes('pattern') ? actMap[1] :
      act.title?.toLowerCase().includes('trap') ? actMap[2] :
      actMap[3] || { category: 'pattern', label: act.title || 'Ejercicio' }
    )
    return (act.items || []).map((it: any, itemIdx: number) => ({
      itemKey: it.id || `act-${actId}-${itemIdx}`,
      category: meta.category,
      categoryLabel: meta.label,
      prompt: sanitizeItemPrompt(it.prompt || '', it.solution || ''),
      hint: it.hint,
      solution: it.solution,
      explanation: it.explanation
    }))
  })

  // Intercalar actividades (round-robin: 1 de patrón, 1 de trampa, 1 de sprint...)
  const mixed: MixedPracticeItem[] = []
  const maxLen = Math.max(...itemsByAct.map(list => list.length), 0)

  for (let i = 0; i < maxLen; i++) {
    for (let a = 0; a < itemsByAct.length; a++) {
      if (itemsByAct[a][i]) {
        mixed.push(itemsByAct[a][i])
      }
    }
  }

  return mixed
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

  // Short Reading Modal State
  const [activeReadingTopic, setActiveReadingTopic] = useState<{ order: number; name: string } | null>(null)

  // Modal de Tema: Pestaña Activa ('resumen' o 'ia')
  const [topicModalTab, setTopicModalTab] = useState<'resumen' | 'ia'>('resumen')

  // Estado de secciones desplegables / abatibles
  const [isProgressCollapsed, setIsProgressCollapsed] = useState(false)
  const [isClassesCollapsed, setIsClassesCollapsed] = useState(false)
  const [isTopicsCollapsed, setIsTopicsCollapsed] = useState(false)
  const [isSeriesCollapsed, setIsSeriesCollapsed] = useState(false)

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
    // Instant cache read for masteryMap so tiers never flicker or vanish
    try {
      const cached = localStorage.getItem(`ll_mastery_${p.id}`)
      if (cached) {
        setMasteryMap(JSON.parse(cached))
      }
    } catch {}
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
      if (data.masteryMap) {
        setMasteryMap(data.masteryMap)
        try {
          localStorage.setItem(`ll_mastery_${sid}`, JSON.stringify(data.masteryMap))
        } catch {}
      }
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

  // ── Bloqueo de Scroll del Body al abrir cualquier Modal (Previene Scroll Bleed & Freeze) ──
  const isAnyModalOpen = Boolean(selectedTopic || showTokenModal || showScheduleModal || showRateModal || showTriviaModal || activeReadingTopic)

  useEffect(() => {
    if (typeof document === 'undefined') return
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden'
      document.body.style.touchAction = 'none'
    } else {
      document.body.style.overflow = ''
      document.body.style.touchAction = ''
    }
    return () => {
      document.body.style.overflow = ''
      document.body.style.touchAction = ''
    }
  }, [isAnyModalOpen])

  // ── Listener Tecla Escape para Cerrar Modales ──
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (showTriviaModal) setShowTriviaModal(false)
        else if (activeReadingTopic) setActiveReadingTopic(null)
        else if (selectedTopic) closeTopicModal()
        else if (showTokenModal) setShowTokenModal(false)
        else if (showScheduleModal) setShowScheduleModal(false)
        else if (showRateModal) setShowRateModal(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showTriviaModal, activeReadingTopic, selectedTopic, showTokenModal, showScheduleModal, showRateModal])

  // ── Cerrar Modal de Tema y limpiar Query Param sin recargar ──
  const closeTopicModal = useCallback(() => {
    setSelectedTopic(null)
    setPracticeDoc(null)
    setPracticeCards([])
    setPracticeLimitNotice(null)
    if (router.query.topic) {
      const nextQuery = { ...router.query }
      delete nextQuery.topic
      router.push({ pathname: '/student', query: nextQuery }, undefined, { shallow: true })
    }
  }, [router])

  // ── Abrir Modal de Tema y Sincronizar URL (Shallow Routing para botón Atrás) ──
  const handleOpenTopicModal = useCallback(async (session: StudentSession, updateUrl = true, initialTab: 'resumen' | 'ia' = 'resumen') => {
    setSelectedTopic(session)
    setTopicModalTab(initialTab)
    setPracticeLimitNotice(null)
    setPracticeLimitInfo(checkPracticeLimit())
    const order = session.topicOrder ?? 0

    // Restaurar guía de práctica previa si ya se generó para este tema (en sessionStorage o localStorage)
    try {
      const cachedDoc = sessionStorage.getItem(`ll_practice_${order}`) || localStorage.getItem(`ll_practice_${order}`)
      if (cachedDoc) setPracticeDoc(JSON.parse(cachedDoc))
      else setPracticeDoc(null)
      const cachedCards = sessionStorage.getItem(`ll_practice_cards_${order}`) || localStorage.getItem(`ll_practice_cards_${order}`)
      if (cachedCards) setPracticeCards(JSON.parse(cachedCards))
      else setPracticeCards([])
    } catch {}

    // Sincroniza query param ?topic=X para que el botón atrás del celular cierre el modal
    if (updateUrl && order && router.query.topic !== String(order)) {
      router.push({ pathname: '/student', query: { ...router.query, topic: order } }, undefined, { shallow: true })
    }

    if (!profile || !order) return
    
    // Subida de maestría: registrar estudio/repaso inmediatamente al entrar
    try {
      const res = await fetch('/api/student/topic-mastery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: profile.id, topicOrder: order })
      })
      const data = await res.json()
      if (data.ok && data.masteryMap) {
        setMasteryMap(data.masteryMap)
        try {
          localStorage.setItem(`ll_mastery_${profile.id}`, JSON.stringify(data.masteryMap))
        } catch {}
      }
    } catch {
      // Silencioso para no bloquear la lectura de slides
    }
  }, [profile, router, checkPracticeLimit])

  const handleOpenTrivia = useCallback((order: number, cleanTitle: string) => {
    setActiveTriviaTopic({
      order: order || 1,
      name: cleanTitle
    })
    setShowTriviaModal(true)
    if (router.query.trivia !== '1') {
      router.push({
        pathname: '/student',
        query: { ...router.query, topic: order, trivia: '1' }
      }, undefined, { shallow: true })
    }
  }, [router])

  const handleCloseTrivia = useCallback(() => {
    setShowTriviaModal(false)
    if (router.query.trivia || router.query.topic) {
      const nextQuery = { ...router.query }
      delete nextQuery.trivia
      delete nextQuery.topic
      router.push({ pathname: '/student', query: nextQuery }, undefined, { shallow: true })
    }
  }, [router])

  const handleOpenShortReading = useCallback((order: number, cleanTitle: string) => {
    setActiveReadingTopic({ order, name: cleanTitle })
    if (router.query.reading !== '1' || router.query.topic !== String(order)) {
      router.push({
        pathname: '/student',
        query: { ...router.query, topic: order, reading: '1' }
      }, undefined, { shallow: true })
    }
  }, [router])

  const handleCloseShortReading = useCallback(() => {
    setActiveReadingTopic(null)
    if (router.query.reading || router.query.topic) {
      const nextQuery = { ...router.query }
      delete nextQuery.reading
      delete nextQuery.topic
      router.push({ pathname: '/student', query: nextQuery }, undefined, { shallow: true })
    }
  }, [router])

  const handleOpenPractice = useCallback((session: StudentSession) => {
    handleOpenTopicModal(session, true, 'ia')
    const order = session.topicOrder ?? 0
    let hasCached = false
    try {
      const cached = sessionStorage.getItem(`ll_practice_${order}`) || localStorage.getItem(`ll_practice_${order}`)
      if (cached) hasCached = true
    } catch {}
    if (!hasCached) {
      handleGeneratePractice(session)
    }
  }, [handleOpenTopicModal])

  // ── Sincronizar Estado cuando el usuario pulsa Atrás en el navegador/celular o desliza desde el borde ──
  useEffect(() => {
    if (!router.isReady) return
    const topicParam = router.query.topic
    const triviaParam = router.query.trivia
    const readingParam = router.query.reading

    if (topicParam) {
      const order = Number(topicParam)
      const found = completed.find(s => s.topicOrder === order) || upcoming.find(s => s.topicOrder === order)
      const cleanTitle = (found?.topicName || `Tema ${order}`).replace(/\s*\([^)]*\)/g, '').trim()

      // Si no es trivia ni reading, sincronizar modal de diapositiva
      if (readingParam !== '1' && triviaParam !== '1') {
        if (found && (!selectedTopic || selectedTopic.topicOrder !== order)) {
          handleOpenTopicModal(found, false)
        }
      }

      // Sincronizar estado de trivia según URL
      if (triviaParam === '1') {
        setActiveTriviaTopic({ order, name: cleanTitle })
        setShowTriviaModal(true)
      } else {
        setShowTriviaModal(false)
      }

      // Sincronizar estado de reading según URL
      if (readingParam === '1') {
        setActiveReadingTopic({ order, name: cleanTitle })
      } else {
        setActiveReadingTopic(null)
      }
    } else {
      setShowTriviaModal(false)
      setActiveReadingTopic(null)
      if (selectedTopic) {
        setSelectedTopic(null)
        setPracticeDoc(null)
        setPracticeCards([])
        setPracticeLimitNotice(null)
      }
    }
  }, [router.isReady, router.query.topic, router.query.trivia, router.query.reading, completed, upcoming])

  async function handleGeneratePractice(topic: StudentSession) {
    const order = topic.topicOrder ?? 0

    // Si ya existe en caché, cargarla al instante
    try {
      const cached = sessionStorage.getItem(`ll_practice_${order}`) || localStorage.getItem(`ll_practice_${order}`)
      if (cached) {
        setPracticeDoc(JSON.parse(cached))
        return
      }
    } catch {}

    const limit = checkPracticeLimit()
    if (!limit.allowed) {
      setPracticeLimitNotice(`Has alcanzado el límite de 3 guías de estudio cada 12 horas. Tu próximo ciclo se renovará en ${limit.remainingText}.`)
      return
    }
    setPracticeLimitNotice(null)

    setPracticeLoading(true)
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
        try {
          sessionStorage.setItem(`ll_practice_${order}`, JSON.stringify(data))
          localStorage.setItem(`ll_practice_${order}`, JSON.stringify(data))
        } catch {}
        recordPracticeUsage()
      } else if (data.cards) {
        setPracticeCards(data.cards)
        try {
          sessionStorage.setItem(`ll_practice_cards_${order}`, JSON.stringify(data.cards))
          localStorage.setItem(`ll_practice_cards_${order}`, JSON.stringify(data.cards))
        } catch {}
        recordPracticeUsage()
      }
    } catch {
      console.warn('Error al generar la guía de práctica')
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
              <button
                type="button"
                className={styles.sectionCollapseBtn}
                onClick={() => setIsProgressCollapsed(prev => !prev)}
                title={isProgressCollapsed ? "Desplegar progreso" : "Plegar progreso"}
              >
                {isProgressCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
              </button>
            </div>
          </div>

          {!isProgressCollapsed && (
            <>
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
            </>
          )}
        </div>

        {/* === Header Row: Clases & Agenda === */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '1.5rem 0 0.75rem' }}>
          <h2 className={styles.sectionTitle} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={18} color="var(--accent-primary)" />
            <span>Clases & Horario</span>
          </h2>
          <button
            type="button"
            className={styles.sectionCollapseBtn}
            onClick={() => setIsClassesCollapsed(prev => !prev)}
            title={isClassesCollapsed ? "Desplegar clases y horario" : "Plegar clases y horario"}
          >
            {isClassesCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
        </div>

        {/* === Grid Row: Próximas Clases & Tokens === */}
        {!isClassesCollapsed && (
          <div className={styles.grid}>

            {/* Próximas Clases */}
            <section className={styles.card}>
              <h3 className={styles.sectionTitle} style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={16} color="var(--accent-primary)" />
                <span>Próximas Clases</span>
              </h3>
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
              <h3 className={styles.sectionTitle} style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award size={16} color="var(--accent-amber)" />
                <span>Tokens de Reposición</span>
              </h3>
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
                <h3 className={styles.sectionTitle} style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Star size={16} color="var(--accent-amber)" />
                  <span>Calificar a {profile.teacherName ?? 'tu Profesor'}</span>
                </h3>
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
        )}

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

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {/* Botonera de Paginación Inteligente */}
                    {sortedCompleted.length > TOPICS_PER_PAGE && !isTopicsCollapsed && (
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

                    <button
                      type="button"
                      className={styles.sectionCollapseBtn}
                      onClick={() => setIsTopicsCollapsed(prev => !prev)}
                      title={isTopicsCollapsed ? "Desplegar temas" : "Plegar temas"}
                    >
                      {isTopicsCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                    </button>
                  </div>
                </div>

                {!isTopicsCollapsed && (
                  <>
                    {loading && <div className="spinner" />}
                    {!loading && sortedCompleted.length === 0 && (
                      <p className={styles.empty}>Aún no has completado ningún tema. ¡Tu primera clase marcará el inicio de tu camino!</p>
                    )}

                    {/* Banner Gráfico Permanente de Tiers & Racha de Maestría */}
                    <div className={styles.tierStatusBanner}>
                      <div className={styles.tierStatusItem}>
                        <span className={styles.tierStatusBadge} style={{ color: '#ea580c' }}>
                          <Award size={13} color="#ea580c" /> Bronze
                        </span>
                        <span className={styles.tierStatusDesc}>Racha 5+</span>
                      </div>
                      <div className={styles.tierStatusItem}>
                        <span className={styles.tierStatusBadge} style={{ color: '#94a3b8' }}>
                          <Shield size={13} color="#94a3b8" /> Silver
                        </span>
                        <span className={styles.tierStatusDesc}>Racha 10+</span>
                      </div>
                      <div className={styles.tierStatusItem}>
                        <span className={styles.tierStatusBadge} style={{ color: '#f59e0b' }}>
                          <Trophy size={13} color="#f59e0b" /> Gold
                        </span>
                        <span className={styles.tierStatusDesc}>Racha 15+</span>
                      </div>
                      <div className={styles.tierStatusItem}>
                        <span className={styles.tierStatusBadge} style={{ color: '#38bdf8' }}>
                          <Gem size={13} color="#38bdf8" /> Diamond
                        </span>
                        <span className={styles.tierStatusDesc}>Racha 20+</span>
                      </div>
                      <div className={styles.tierStatusItem}>
                        <span className={styles.tierStatusBadge} style={{ color: '#10b981' }}>
                          <Crown size={13} color="#10b981" /> Platinum
                        </span>
                        <span className={styles.tierStatusDesc}>Racha 25+</span>
                      </div>
                    </div>

                    <div className={styles.topicsList}>
                      {displayedTopics.map((s) => {
                        // Empieza en Nivel 0 (Nada absoluto / Sin rango) por defecto
                        const order = s.topicOrder ?? 0
                        const currentTier = masteryMap[order]?.tier ?? 0
                        const tierCfg = getTierConfig(currentTier)
                        const cleanTitle = (s.topicName || `Tema ${order}`).replace(/\s*\([^)]*\)/g, '').trim()

                        return (
                          <div 
                            key={s.id} 
                            className={`${styles.topicRowCapsule} ${tierCfg.class}`}
                            style={{ borderColor: tierCfg.color }}
                          >
                            <div className={styles.topicRowInfo}>
                              <span className={styles.tierBadge}>{tierCfg.icon}</span>
                              <span className={styles.topicNum} style={{ borderColor: `${tierCfg.color}77`, color: tierCfg.color }}>
                                {s.topicOrder ? String(s.topicOrder).padStart(2, '0') : '–'}
                              </span>
                              <span className={styles.topicName}>{s.topicName ?? 'Clase completada'}</span>
                            </div>

                            <div className={styles.topicRowActions}>
                              {/* 1. Botón Resumen (a la izquierda) */}
                              <button
                                type="button"
                                className={`${styles.topicActionBtn} ${styles.btnResumen}`}
                                onClick={() => handleOpenTopicModal(s, true, 'resumen')}
                                title="Ver diapositiva y resumen del concepto esencial"
                              >
                                <BookOpen size={14} />
                                <span>Resumen</span>
                              </button>

                              {/* 2. Botón Repaso */}
                              <button
                                type="button"
                                className={`${styles.topicActionBtn} ${styles.btnAi}`}
                                onClick={() => handleOpenPractice(s)}
                                title="Sesión de repaso mental con 15 ejercicios"
                              >
                                <Zap size={14} />
                                <span>Repaso</span>
                              </button>

                              {/* 3. Botón Trivia */}
                              <button
                                type="button"
                                className={`${styles.topicActionBtn} ${styles.btnTrivia}`}
                                onClick={() => handleOpenTrivia(order || 1, cleanTitle)}
                                title="Entrenar con la Trivia Infinita de este tema"
                              >
                                <Flame size={14} color="#fde047" />
                                <span>Trivia</span>
                              </button>

                              {/* 4. Botón Short Reading */}
                              <button
                                type="button"
                                className={`${styles.topicActionBtn} ${styles.btnReading}`}
                                onClick={() => handleOpenShortReading(order || 1, cleanTitle)}
                                title="Escuchar y leer micro-lectura pedagógica con audio"
                              >
                                <Volume2 size={14} />
                                <span>Short Reading</span>
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </>
                )}
              </>
            )
          })()}
        </section>

        {/* === Full Width Card: Flashcards Conceptuales (Mini-App de Vocabulario) === */}
        <section className={styles.flashcardsSection}>
          <div className={styles.flashcardsHeaderWrap}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                <Layers size={22} color="var(--accent-purple, #a855f7)" />
                <h2 className={styles.sectionTitle} style={{ margin: 0 }}>
                  Flashcards Conceptuales
                </h2>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '999px', background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
                  Beta 0.2
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '999px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  8 Decks • 120 Tarjetas
                </span>
              </div>
              <p className={styles.empty} style={{ margin: 0, fontSize: '0.85rem' }}>
                Aprende vocabulario sin traducir 1 a 1: vocabulario general, situaciones y lugares, familias conceptuales y verbos frasales.
              </p>
            </div>
            <a
              href="/flashcards_vocabulary.csv"
              download="flashcards_vocabulary.csv"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#c4b5fd',
                background: 'rgba(124, 58, 237, 0.12)',
                border: '1px solid rgba(124, 58, 237, 0.3)',
                padding: '0.4rem 0.85rem',
                borderRadius: '8px',
                textDecoration: 'none'
              }}
            >
              <FileDown size={14} />
              <span>Descargar CSV</span>
            </a>
          </div>

          {/* Categorías organizadas */}
          {FLASHCARD_CATEGORIES.map(category => {
            const categoryPacks = BUILTIN_FLASHCARD_PACKS.filter(p => p.category === category)
            if (categoryPacks.length === 0) return null
            return (
              <div key={category} style={{ marginBottom: '1.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#e4e4e7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {category}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#a1a1aa' }}>
                    ({categoryPacks.length} {categoryPacks.length === 1 ? 'deck' : 'decks'} • {categoryPacks.reduce((acc, p) => acc + p.cards.length, 0)} tarjetas)
                  </span>
                </div>
                <div className={styles.flashcardsGrid}>
                  {categoryPacks.map(pack => (
                    <Link
                      key={pack.id}
                      href={`/student/flashcards?packId=${pack.id}`}
                      className={styles.flashcardPackCard}
                    >
                      <div>
                        <div className={styles.flashcardPackTitle}>{pack.title}</div>
                        <div className={styles.flashcardPackSub}>{pack.subtitle}</div>
                      </div>
                      <div className={styles.flashcardPackMeta}>
                        <span>{pack.cards.length} Tarjetas • {pack.level}</span>
                        <span className={styles.flashcardPracticarBtn}>
                          <span>Practicar</span>
                          <ArrowRight size={14} />
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
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

            <button
              type="button"
              className={styles.sectionCollapseBtn}
              onClick={() => setIsSeriesCollapsed(prev => !prev)}
              title={isSeriesCollapsed ? "Desplegar actividad de serie" : "Plegar actividad de serie"}
            >
              {isSeriesCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </button>
          </div>

          {!isSeriesCollapsed && (
            <>
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
            </>
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
            <Link 
              href="/student/flashcards"
              className={styles.comingItem}
              style={{ textDecoration: 'none', cursor: 'pointer' }}
            >
              <div>
                <div className={styles.comingHeader}>
                  <span className={styles.comingIcon} style={{ color: 'var(--accent-purple)' }}>
                    <Layers size={20} />
                  </span>
                  <span className={styles.comingBadge} style={{ background: 'rgba(124, 58, 237, 0.2)', color: '#c4b5fd', borderColor: 'rgba(124, 58, 237, 0.4)' }}>
                    <span className={styles.comingPulse} style={{ background: '#a78bfa' }} />
                    <span>Beta Disponible ↗</span>
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
            </Link>

            {/* 3. Interactive Scene Explorer */}
            <Link 
              href="/student/interactive-scene"
              className={styles.comingItem}
              style={{ textDecoration: 'none', cursor: 'pointer' }}
            >
              <div>
                <div className={styles.comingHeader}>
                  <span className={styles.comingIcon} style={{ color: 'var(--accent-blue)' }}>
                    <Compass size={20} />
                  </span>
                  <span className={styles.comingBadge} style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd', borderColor: 'rgba(59, 130, 246, 0.4)' }}>
                    <span className={styles.comingPulse} style={{ background: '#60a5fa' }} />
                    <span>Beta Disponible ↗</span>
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
            </Link>

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

      {/* === Modal de Repaso: Diapositiva Única de Concepto Esencial (Sin Scroll Bleed & Mobile Optimized) === */}
      {selectedTopic && (() => {
        const order = selectedTopic.topicOrder ?? 0
        const currentTier = masteryMap[order]?.tier ?? 0
        const tierCfg = getTierConfig(currentTier)
        const summary = getTopicSummary(order, selectedTopic.topicName, selectedTopic.cachedSlides)
        const cleanTitle = (selectedTopic.topicName || summary.title).replace(/\s*\([^)]*\)/g, '').trim()

        return (
          <div className={styles.modalOverlay} onClick={closeTopicModal} role="dialog" aria-modal="true">
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
              
              {/* Top Navigation Bar: Sticky con Volver, Título y Cerrar */}
              <div className={styles.modalNavHeader}>
                <button
                  type="button"
                  className={styles.modalBackBtn}
                  onClick={closeTopicModal}
                  aria-label="Volver al temario"
                >
                  <ArrowLeft size={18} />
                  <span>Volver</span>
                </button>

                <div className={styles.modalTitleWrap}>
                  <span className={styles.tierBadge} style={{ borderColor: tierCfg.color, color: tierCfg.color }}>
                    {tierCfg.icon}
                  </span>
                  <div className={styles.modalTitleText}>
                    <span className={styles.modalTopicOrder}>Tema #{order}</span>
                    <span className={styles.modalCleanTitle}>{cleanTitle}</span>
                  </div>
                </div>

                <button
                  type="button"
                  className={styles.modalCloseBtn}
                  onClick={closeTopicModal}
                  aria-label="Cerrar ventana"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Tab Selector: Ficha de Resumen vs Repaso */}
              <div className={styles.modalTabBar}>
                <button
                  type="button"
                  className={`${styles.modalTabBtn} ${topicModalTab === 'resumen' ? styles.modalTabActive : ''}`}
                  onClick={() => setTopicModalTab('resumen')}
                >
                  <BookOpen size={16} />
                  <span>Ficha de Resumen</span>
                </button>

                <button
                  type="button"
                  className={`${styles.modalTabBtn} ${topicModalTab === 'ia' ? styles.modalTabActive : ''}`}
                  onClick={() => {
                    setTopicModalTab('ia')
                    if (!practiceDoc && !practiceLoading) {
                      handleGeneratePractice(selectedTopic)
                    }
                  }}
                >
                  <Zap size={16} />
                  <span>Repaso</span>
                </button>
              </div>

              <div className={styles.slidesContainer}>

                {/* Aviso explicativo cuando agota su cupo de práctica */}
                {practiceLimitNotice && (
                  <div className={styles.limitNoticeBanner}>
                    <Clock size={16} />
                    <span>{practiceLimitNotice}</span>
                  </div>
                )}

                {/* ═══ VISTA 1: REPASO (15 RETOS MEZCLADOS + GIMNASIO MENTAL) ═══ */}
                {topicModalTab === 'ia' && (
                  <div>
                    {/* Estado de Carga con Animación */}
                    {practiceLoading && (
                      <div className={styles.aiLoadingState}>
                        <div className={styles.aiSpinner} />
                        <div className={styles.aiLoadingTitle}>Generando tu Sesión de Repaso...</div>
                        <div className={styles.aiLoadingSub}>
                          Estructurando 15 retos mezclados: Fill the Pattern, Spot the Trap y Reverse Sprint para <b>{cleanTitle}</b>.
                        </div>
                      </div>
                    )}

                    {/* Guía Pedagógica Completa con Ejercicios Mezclados */}
                    {!practiceLoading && practiceDoc && practiceDoc.activities && (() => {
                      const mixedItems = getMixedPracticeItems(practiceDoc.activities)

                      return (
                        <div className={styles.practiceDoc}>
                          {/* Banner explicativo del Gimnasio Mental */}
                          <div className={styles.mentalGymBanner}>
                            <div className={styles.mentalGymHeader}>
                              <Sparkles size={18} color="#c084fc" />
                              <span className={styles.mentalGymTitle}>Gimnasio Mental de Repaso</span>
                            </div>
                            <p className={styles.mentalGymDesc}>
                              <strong>Sin escribir:</strong> Lee cada reto y responde mentalmente en menos de <strong>3 segundos</strong>. Luego pulsa <em>"Ver Solución"</em> para comprobar tu agilidad y reflejo inmediato.
                            </p>
                          </div>

                          <div className={styles.practiceDocHeader}>
                            <div className={styles.docTitleRow}>
                              <Target size={20} color="var(--accent-primary)" />
                              <div>
                                <div className={styles.docTitle}>{practiceDoc.documentTitle || `Sesión de Repaso: ${cleanTitle}`}</div>
                                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                  15 retos rápidos mezclados para consolidar agilidad y reflejos automáticos
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className={styles.itemsList}>
                            {mixedItems.map((item, idx) => {
                              const itemKey = item.itemKey
                              const isRevealed = revealedSolutions[itemKey]

                              return (
                                <div key={itemKey} className={styles.itemRow}>
                                  <div className={styles.itemMetaRow}>
                                    <span className={styles.itemNum}>#{idx + 1}</span>
                                    <span className={`${styles.mixedCategoryBadge} ${
                                      item.category === 'pattern' ? styles.badgePattern :
                                      item.category === 'trap' ? styles.badgeTrap : styles.badgeSprint
                                    }`}>
                                      {item.category === 'pattern' && <Layers size={12} />}
                                      {item.category === 'trap' && <AlertCircle size={12} />}
                                      {item.category === 'sprint' && <Zap size={12} />}
                                      <span>{item.categoryLabel}</span>
                                    </span>
                                  </div>

                                  <div className={styles.itemPromptRow}>
                                    <span className={styles.itemPromptText}>
                                      {renderPromptWithBlank(item.prompt)}
                                    </span>
                                  </div>

                                  {item.hint && (
                                    <div className={styles.itemHint}>
                                      <Sparkles size={13} color="var(--accent-amber)" />
                                      <span>Pista: {item.hint}</span>
                                    </div>
                                  )}

                                  <div className={styles.itemActionRow}>
                                    <button
                                      type="button"
                                      className={styles.solutionToggleBtn}
                                      onClick={() => setRevealedSolutions(prev => ({ ...prev, [itemKey]: !prev[itemKey] }))}
                                    >
                                      {isRevealed ? 'Ocultar Solución' : 'Ver Solución & Explicación'}
                                    </button>
                                  </div>

                                  {isRevealed && (
                                    <div className={styles.solutionRevealBox}>
                                      <div className={styles.solutionCorrect}>
                                        <Check size={16} />
                                        <span>{item.solution}</span>
                                      </div>
                                      <div className={styles.solutionWhy}>{item.explanation}</div>
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })()}

                    {/* Estado Vacío si aún no se ha generado */}
                    {!practiceLoading && !practiceDoc && (
                      <div className={styles.emptyPracticeCard}>
                        <Zap size={34} color="#a855f7" />
                        <h3>Sesión de Repaso Activo</h3>
                        <p>Genera 15 retos rápidos mezclados con pistas y explicaciones para fijar <b>{cleanTitle}</b> en tu memoria.</p>
                        <button
                          type="button"
                          className={styles.ctaPracticeBtn}
                          onClick={() => handleGeneratePractice(selectedTopic)}
                        >
                          <Sparkles size={16} />
                          <span>Iniciar Repaso (15 Retos)</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* ═══ VISTA 2: FICHA ESENCIAL DE REPASO (CONCEPTO, LEGO, EJEMPLOS Y TRAMPAS) ═══ */}
                {topicModalTab === 'resumen' && (
                  <div>
                    <div className={styles.summarySlideCard}>
                      <div className={styles.summarySlideHeader}>
                        <span className={styles.summaryHeaderTitle}>
                          Ficha Esencial de Repaso
                        </span>
                      </div>

                      <div className={styles.summaryGrid}>
                        {/* 1. ¿De qué se trata? */}
                        <div className={styles.summaryBlock}>
                          <div className={styles.summaryBlockTitle}>
                            <Target size={18} color="#38bdf8" />
                            <span>1. ¿De qué se trata el tema?</span>
                          </div>
                          <p className={styles.summaryBlockDesc}>
                            {summary.concept}
                          </p>
                        </div>

                        {/* 2. La Forma Correcta (Estructura LEGO) */}
                        <div className={styles.summaryBlock}>
                          <div className={styles.summaryBlockTitle}>
                            <Sparkles size={18} color="#10b981" />
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
                            {summary.correctMethod.includes('—')
                              ? summary.correctMethod.split('—').slice(1).join('—').trim()
                              : summary.correctMethod}
                          </p>
                        </div>

                        {/* 3. Ejemplos en Acción */}
                        <div className={styles.summaryBlock}>
                          <div className={styles.summaryBlockTitle}>
                            <BookOpen size={18} color="#a855f7" />
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
                            <AlertCircle size={18} color="#f59e0b" />
                            <span>4. Errores Comunes a Evitar</span>
                          </div>
                          <div className={styles.mistakeCompareBox}>
                            <div className={styles.mistakeWrong}>
                              <span className={styles.mistakeLabelWrong}>❌ Evita:</span>
                              <span className={styles.mistakeText}>"{summary.commonMistake.wrong}"</span>
                            </div>
                            <div className={styles.mistakeRight}>
                              <span className={styles.mistakeLabelRight}>✅ Lo correcto:</span>
                              <span className={styles.mistakeText}>"{summary.commonMistake.correct}"</span>
                            </div>
                          </div>
                          <p className={styles.summaryBlockSub} style={{ marginTop: '0.65rem' }}>
                            {summary.commonMistake.explanation}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Llamado a la Acción para pasar a la práctica */}
                    <div className={styles.resumenBottomCta}>
                      <div>
                        <div className={styles.ctaTitle}>¿Listo para practicar este tema?</div>
                        <div className={styles.ctaSubtitle}>Pon a prueba tus reflejos con 15 ejercicios interactivos y soluciones explicadas.</div>
                      </div>
                      <button
                        type="button"
                        className={styles.ctaPracticeBtn}
                        onClick={() => {
                          setTopicModalTab('ia')
                          if (!practiceDoc && !practiceLoading) {
                            handleGeneratePractice(selectedTopic)
                          }
                        }}
                      >
                        <Zap size={16} />
                        <span>Ir a Repaso (15 Retos) →</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })()}

      {/* === Modal Interactivo: Juego de Trivia Infinita === */}
      {showTriviaModal && activeTriviaTopic && (
        <InfiniteTriviaModal
          isOpen={showTriviaModal}
          onClose={handleCloseTrivia}
          topicOrder={activeTriviaTopic.order}
          topicName={activeTriviaTopic.name}
          studentProfile={profile}
          onMasteryUpgrade={(updatedMap) => {
            setMasteryMap(updatedMap)
          }}
        />
      )}

      {/* === Modal Interactivo: Short Reading con Audio TTS & IA === */}
      {activeReadingTopic && (
        <ShortReadingModal
          topicOrder={activeReadingTopic.order}
          topicName={activeReadingTopic.name}
          studentName={profile?.name}
          onClose={handleCloseShortReading}
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
