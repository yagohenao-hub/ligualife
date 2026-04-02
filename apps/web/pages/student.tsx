import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import styles from '@/styles/StudentDashboard.module.css'

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
  const [courseTotal, setCourseTotal] = useState(58)
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

  useEffect(() => {
    const raw = sessionStorage.getItem('ll_student')
    if (!raw) { router.replace('/'); return }
    const p: StudentProfile = JSON.parse(raw)
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
    }
    setLoading(false)
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
    // Refresh
    const updated: StudentProfile = { ...profile!, tokens: profile!.tokens + 1 }
    setProfile(updated)
    sessionStorage.setItem('ll_student', JSON.stringify(updated))
    loadSessions(profile!.id)
    setRescheduling(null)
  }

  async function handleConfirmHoliday(session: StudentSession) {
    try {
      const res = await fetch('/api/confirm-holiday', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session.id, role: 'student' }),
      })
      if (!res.ok) throw new Error('Error')
      loadSessions(profile!.id)
    } catch {
      alert('Error al confirmar clase en festivo')
    }
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

    // Calculate indices for the API
    const jsDay = selectedDateTime.getDay() // 0=Sun
    const dayIndex = jsDay === 0 ? 6 : jsDay - 1 // 0=Mon, 6=Sun per grid
    const hourIndex = selectedDateTime.getHours() - HOURS_START

    const res = await fetch('/api/student/redeem-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        studentId: profile.id, 
        teacherId: profile.teacherId, 
        dayIndex, 
        hourIndex,
        exactDate: selectedDateTime.toISOString() // Pass exact date
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
    alert('🎉 ¡Clase agendada exitosamente!')
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
        setSeriesMsg({ text: '✅ Solicitud enviada. ¡Te avisaremos cuando esté lista!', type: 'success' })
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

  // Build 14-day calendar with available slots
  function buildCalendarDays(): { date: Date; availableHours: { hour: number; label: string }[] }[] {
    const now = new Date()
    const minTime = new Date(now.getTime() + 24 * 60 * 60 * 1000) // 24h from now
    const days: { date: Date; availableHours: { hour: number; label: string }[] }[] = []

    for (let i = 1; i <= 14; i++) {
      const d = new Date(now)
      d.setDate(now.getDate() + i)
      d.setHours(0, 0, 0, 0)

      const jsDay = d.getDay() // 0=Sun
      // teacherAvail grid: rows=hours(0-14), cols=days(0=Mon, 6=Sun)
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
      body { font-family: Arial, sans-serif; background: #0a0e14; color: #e2e8f0; margin: 0; padding: 2rem; }
      .slide { page-break-after: always; margin-bottom: 3rem; padding: 2rem; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; }
      .slide-title { font-size: 1.4rem; font-weight: 700; margin-bottom: 1.5rem; color: #f59e0b; }
      h2, h3, h4 { color: #f59e0b; }
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
  const progressPct = courseTotal > 0 ? Math.round((completedCount / courseTotal) * 100) : 0

  if (!profile) return null

  return (
    <>
      <Head>
        <title>LinguaLife — Mi Progreso</title>
        <meta name="description" content="Sigue tu progreso de aprendizaje de inglés con LinguaLife." />
      </Head>

      <div className={styles.container}>
        {/* === Header === */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.greeting}>¡Hola, {profile.name.split(' ')[0]}! 👋</h1>
            <div className={styles.teacherBar}>
              <p className={styles.sub} style={{ margin: 0 }}>Aquí está tu progreso con {profile.teacherName ?? 'tu profesor'}</p>
              {profile.teacherId && (
                <div className={styles.headerActions}>
                  <button className={styles.headerBtn} onClick={openScheduleModal} title="Cambiar horario regular">📅 Ajustar Horario</button>
                  <button className={styles.headerBtn} onClick={() => setShowRateModal(true)} title="Calificar al profesor">⭐ Calificar</button>
                </div>
              )}
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={() => { sessionStorage.removeItem('ll_student'); router.replace('/') }}>
            Salir ↗
          </button>
        </div>

        {/* === Progress Bar === */}
        <div className={styles.progressCard}>
          <div className={styles.progressHeader}>
            <span className={styles.progressLabel}>🎯 Tu Progreso</span>
            <span className={styles.progressPct}>{completedCount} tema{completedCount !== 1 ? 's' : ''} completado{completedCount !== 1 ? 's' : ''}</span>
          </div>
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: `${progressPct}%` }} />
          </div>
          <div className={styles.progressMeta}>
            {progressPct}% del camino recorrido
            {progressPct >= 50 && <span className={styles.badge}>🏆 ¡Más de la mitad!</span>}
          </div>
        </div>

        {/* === Body Grid === */}
        <div className={styles.grid}>

          {/* Upcoming Sessions */}
          <section className={styles.card}>
            <h2 className={styles.sectionTitle}>📅 Próximas Clases</h2>
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
                      <div className={styles.holidayAlert}>
                        ⚠️ Clase cancelada por festivo.
                        <button 
                          className={styles.holidayConfirmBtn}
                          onClick={() => handleConfirmHoliday(s)}
                          disabled={s.holidayConfirmedStudent}
                        >
                          {s.holidayConfirmedStudent ? '✓ Confirmado por ti' : 'Ver clase de todos modos'}
                        </button>
                        <div className={styles.holidayStatusText}>
                          Estado: {s.holidayConfirmedTeacher ? '✅ Profesor confirmó' : '⏳ Profesor pendiente'}
                        </div>
                      </div>
                    )}
                  </div>
                  {!isSkipped && (
                    <div className={styles.rescheduleWrap}>
                      <div className={styles.infoTooltipWrap}>
                        <span className={styles.infoIcon}>i</span>
                        <div className={styles.tooltipText}>
                          Si reagendas, la sesión se moverá para usar 1 token y el temario avanzará. Solo permitido hasta 24h antes.
                        </div>
                      </div>
                      <button
                        className={styles.rescheduleBtn}
                        onClick={() => handleReschedule(s)}
                        disabled={rescheduling === s.id}
                        title="Reagendar esta clase"
                      >
                        {rescheduling === s.id ? '...' : '↺'}
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </section>

          {/* Tokens */}
          <section className={styles.card}>
            <h2 className={styles.sectionTitle}>🎟️ Tokens de Reposición</h2>
            <div className={styles.tokenBalance}>
              <span className={styles.tokenCount}>{profile.tokens}</span>
              <span className={styles.tokenLabel}>{profile.tokens === 1 ? 'token disponible' : 'tokens disponibles'}</span>
            </div>
            {profile.tokens > 0 ? (
              <button className={styles.redeemBtn} onClick={openTokenModal}>
                Agendar Clase Extra →
              </button>
            ) : (
              <p className={styles.empty}>Cuando reagendes una clase, tu token aparecerá aquí y podrás usarlo para agendar una sesión de reposición.</p>
            )}
          </section>

          {/* Series Request Section */}
          <section className={styles.card}>
            <h2 className={styles.sectionTitle}>🎬 Actividad de Serie</h2>
            <p className={styles.empty}>¿Viendo una serie nueva? Pídenos una actividad pedagógica (1 por semana).</p>
            <div className={styles.seriesRequestBox}>
              <input
                className={styles.seriesInput}
                placeholder="Nombre de la serie..."
                value={seriesName}
                onChange={e => setSeriesName(e.target.value)}
                disabled={seriesLoading}
              />
              <button 
                className={styles.seriesBtn} 
                onClick={handleSeriesRequest}
                disabled={seriesLoading || !seriesName.trim()}
              >
                {seriesLoading ? '...' : 'Solicitar'}
              </button>
            </div>
            {seriesMsg && (
              <div className={`${styles.seriesMsg} ${seriesMsg.type === 'error' ? styles.seriesError : styles.seriesSuccess}`}>
                {seriesMsg.text}
              </div>
            )}
          </section>
        </div>

        {/* === Completed Topics === */}
        <section className={styles.topicsCard}>
          <h2 className={styles.sectionTitle}>✅ Temas Completados</h2>
          {loading && <div className="spinner" />}
          {!loading && completed.length === 0 && (
            <p className={styles.empty}>Aún no has completado ningún tema. ¡Tu primera clase marcará el inicio de tu camino!</p>
          )}
          <div className={styles.topicsGrid}>
            {[...completed].sort((a,b) => (a.topicOrder ?? 0) - (b.topicOrder ?? 0)).map((s) => (
              <button
                key={s.id}
                className={`${styles.topicChip} ${s.cachedSlides ? styles.topicClickable : ''}`}
                onClick={() => s.cachedSlides && setSelectedTopic(s)}
                title={s.cachedSlides ? 'Ver material de esta clase' : undefined}
              >
                <span className={styles.topicNum}>{s.topicOrder ?? '–'}</span>
                <span className={styles.topicName}>{s.topicName ?? 'Clase completada'}</span>
                {s.cachedSlides && <span className={styles.viewSlides}>📖</span>}
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* === Material Modal === */}
      {selectedTopic && selectedTopic.cachedSlides && (
        <div className={styles.modalOverlay} onClick={() => setSelectedTopic(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span>Material de Clase: {selectedTopic.topicName}</span>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button 
                  className={styles.pdfBtnSmall} 
                  onClick={() => downloadSlidesPDF(selectedTopic)}
                  title="Descargar como PDF"
                >
                  ⬇ PDF
                </button>
                <button className={styles.modalClose} onClick={() => setSelectedTopic(null)}>✕</button>
              </div>
            </div>
            
            <div className={styles.slidesContainer}>
              {selectedTopic.cachedSlides.map((slide, idx) => (
                <div key={idx} className={styles.slidePage}>
                  <h3 className={styles.slideTitle}>{slide.title}</h3>
                  <div 
                    className={styles.slideContent} 
                    dangerouslySetInnerHTML={{ __html: slide.content }} 
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
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
                <span>🎟️ Agenda tu clase de reposición</span>
                <button className={styles.modalClose} onClick={() => setShowTokenModal(false)}>✕</button>
              </div>
              <p className={styles.modalSub}>
                {calSelectedDate ? 'Elige la hora disponible:' : 'Selecciona un día disponible (próximas 2 semanas):'}
              </p>
              {redeemMsg && <div className={styles.redeemError}>{redeemMsg}</div>}

              {!calSelectedDate ? (
                /* Step 1: Day picker */
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
                /* Step 2: Hour picker */
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
              <span>📅 Horarios Disponibles de {profile.teacherName}</span>
              <button className={styles.modalClose} onClick={() => setShowScheduleModal(false)}>✕</button>
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
              <span>⭐ Calificar a {profile.teacherName}</span>
              <button className={styles.modalClose} onClick={() => setShowRateModal(false)}>✕</button>
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
