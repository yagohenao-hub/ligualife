import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { useAppContext } from '@/context/AppContext'
import { SessionCard } from '@/components/SessionCard'
import type { Session } from '@/types'
import type { StudioData, StudioStudent } from './api/studio'
import styles from '@/styles/Dashboard.module.css'

type Tab = 'agenda' | 'studio'

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const HOURS = ['6am', '7am', '8am', '9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm', '7pm', '8pm']

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function formatCOP(amount: number) {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`
  if (amount >= 1000) return `$${Math.round(amount / 1000)}K`
  return `$${amount}`
}

export default function DashboardPage() {
  const session = useRequireAuth()
  const router = useRouter()
  const { setAppState } = useAppContext()

  const [tab, setTab] = useState<Tab>('agenda')
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)

  // Studio state
  const [studioData, setStudioData] = useState<StudioData | null>(null)
  const [studioLoading, setStudioLoading] = useState(false)
  const [availability, setAvailability] = useState<boolean[][]>(
    () => Array.from({ length: HOURS.length }, () => Array(DAYS.length).fill(false))
  )
  const [isDragging, setIsDragging] = useState(false)
  const [dragValue, setDragValue] = useState(false)
  const [savingAvail, setSavingAvail] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  useEffect(() => {
    const handleUp = () => setIsDragging(false)
    window.addEventListener('mouseup', handleUp)
    return () => window.removeEventListener('mouseup', handleUp)
  }, [])

  useEffect(() => {
    if (!session) return
    loadSessions()
  }, [session])

  useEffect(() => {
    if (tab === 'studio' && !studioData && session) loadStudio()
  }, [tab, session])

  async function loadSessions() {
    setLoading(true)
    setError(null)
    const today = new Date().toISOString().slice(0, 10)
    try {
      const res = await fetch(`/api/sessions?teacherId=${session!.teacherId}&teacherName=${encodeURIComponent(session!.name)}&date=${today}`)
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Error al cargar sesiones'); return }
      setSessions(data)
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  async function loadStudio() {
    setStudioLoading(true)
    try {
      const res = await fetch(`/api/studio?teacherName=${encodeURIComponent(session!.name)}&teacherId=${session!.teacherId}`)
      const data = await res.json()
      if (res.ok) {
        setStudioData(data)
        if (data.availability) {
          try {
            setAvailability(JSON.parse(data.availability))
          } catch (e) {
            console.error('Error parsing availability', e)
          }
        }
      }
    } finally {
      setStudioLoading(false)
    }
  }

  function handleSessionClick(s: Session) {
    setAppState({ currentSession: s })
    router.push(`/classroom?sessionId=${s.id}`)
  }

  async function handleReschedule(s: Session) {
    if (!confirm('¿Seguro que deseas reagendar esta sesión? Esta acción la cancelará y moverá el progreso curricular a la próxima clase agendada de este estudiante.')) return

    try {
      setLoading(true)
      const res = await fetch('/api/reschedule-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: s.id }),
      })
      if (!res.ok) throw new Error('Error al reagendar')
      alert('Clase reagendada correctamente.')
      loadSessions()
    } catch (e) {
      alert('Hubo un error al reagendar')
      setLoading(false)
    }
  }

  function handleLogout() {
    sessionStorage.removeItem('lingualife_session')
    router.replace('/')
  }

  function updateCell(row: number, col: number, value: boolean) {
    setAvailability(prev => {
      if (prev[row][col] === value) return prev
      const next = prev.map(r => [...r])
      next[row][col] = value
      return next
    })
  }

  function handleMouseDown(row: number, col: number, currentStatus: string | null) {
    if (currentStatus === 'booked' || currentStatus === 'extra') return
    const newValue = !availability[row][col]
    setDragValue(newValue)
    setIsDragging(true)
    updateCell(row, col, newValue)
  }

  function handleMouseEnter(row: number, col: number, currentStatus: string | null) {
    if (isDragging && currentStatus !== 'booked' && currentStatus !== 'extra') {
      updateCell(row, col, dragValue)
    }
  }

  async function saveAvailability() {
    if (!session) return
    setSavingAvail('saving')
    try {
      const res = await fetch('/api/teacher/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: session.teacherId,
          availability: JSON.stringify(availability),
        }),
      })
      setSavingAvail(res.ok ? 'saved' : 'error')
    } catch {
      setSavingAvail('error')
    } finally {
      setTimeout(() => setSavingAvail('idle'), 2500)
    }
  }

  function getRelativeDateLabel(dateStr: string) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const target = new Date(dateStr)
    target.setHours(0, 0, 0, 0)
    
    const diffTime = target.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Hoy'
    if (diffDays === 1) return 'Mañana'
    
    const monthName = target.toLocaleDateString('es-ES', { month: 'long' })
    const dayNum = target.getDate()
    const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1)
    return `${capitalizedMonth} ${dayNum}`
  }

  if (!session) return null

  const filteredSessions = sessions.filter(s => {
    const search = searchTerm.toLowerCase()
    return (
      (s.sessionName || '').toLowerCase().includes(search) ||
      (s.date || '').toLowerCase().includes(search)
    )
  })

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.greeting}>Bienvenido, {session.name?.split(' ')[0] ?? 'Profesor'}</h1>
        <button className={styles.logoutBtn} onClick={handleLogout}>Salir ↗</button>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${tab === 'agenda' ? styles.tabActive : ''}`}
          onClick={() => setTab('agenda')}
        >
          <svg className={`${styles.tabIcon} ${styles.iconBlue}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          Agenda
        </button>
        <button
          className={`${styles.tab} ${tab === 'studio' ? styles.tabActive : ''}`}
          onClick={() => setTab('studio')}
        >
          <svg className={`${styles.tabIcon} ${styles.iconPurple}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
          Mi Studio
        </button>
      </div>

      {/* Agenda Tab */}
      {tab === 'agenda' && (
        <>
          <div className={styles.agendaHeaderMinimal}>
            <div className={styles.filterBarMinimal}>
              <div className={`${styles.searchInputWrapMinimal} ${isSearchExpanded ? styles.expanded : ''}`}>
                <button 
                  className={styles.searchToggleBtn} 
                  onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                  title="Filtrar clases"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                  </svg>
                </button>
                <input 
                  type="text" 
                  placeholder="Filtrar por nombre o fecha..." 
                  className={styles.searchInputMinimal}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus={isSearchExpanded}
                />
                {searchTerm && (
                  <button className={styles.clearSearchMinimal} onClick={() => setSearchTerm('')}>✕</button>
                )}
              </div>
            </div>
          </div>

          {loading && <div className="spinner" />}
          {error && <div className="error-message">{error}</div>}
          {!loading && !error && (
            <div className={styles.sessionGrid}>
              {filteredSessions.length === 0 ? (
                <p className={styles.emptyState}>
                  {searchTerm ? 'No se encontraron clases con ese filtro.' : 'No tienes sesiones programadas para hoy.'}
                </p>
              ) : (
                filteredSessions.map((s) => (
                  <div key={s.id} className={styles.sessionCardWrapper}>
                    <SessionCard 
                      session={{
                        ...s,
                        time: `${getRelativeDateLabel(s.date)} — ${s.time}`,
                        topicName: s.topicName // Explicitly ensuring it's passed
                      }} 
                      onClick={handleSessionClick} 
                      onReschedule={handleReschedule} 
                    />
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}

      {/* Mi Studio Tab */}
      {tab === 'studio' && (
        <div className={styles.studioContent}>
          {studioLoading && <div className="spinner" />}

          {!studioLoading && studioData && (
            <>
              {/* Stats row */}
              <div className={styles.statsRow}>
                <div className={`${styles.statCard} ${styles.statGreen}`}>
                  <div className={styles.statLabel}>
                    <svg className={`${styles.statIcon} ${styles.iconGreen}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    CLASES EXITOSAS
                  </div>
                  <div className={styles.statValue}>{studioData.completedCount}</div>
                  <div className={styles.statSub}>marcadas como "Seen" este mes</div>
                </div>
                <div className={`${styles.statCard} ${styles.statAmber}`}>
                  <div className={styles.statLabel}>
                    <svg className={`${styles.statIcon} ${styles.iconAmber}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                    INGRESOS GANADOS
                  </div>
                  <div className={`${styles.statValue} ${styles.statAmberVal}`}>
                    {formatCOP(studioData.earnedCOP)}
                  </div>
                  <div className={styles.statSub}>COP (clases completadas)</div>
                </div>
                <div className={`${styles.statCard} ${styles.statPurple}`}>
                  <div className={styles.statLabel}>
                    <svg className={`${styles.statIcon} ${styles.iconPurple}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
                    PROYECCIÓN FIN DE MES
                  </div>
                  <div className={`${styles.statValue} ${styles.statPurpleVal}`}>
                    {formatCOP(studioData.projectedCOP)}
                  </div>
                  <div className={styles.statSub}>COP si completas todo</div>
                </div>
              </div>

              {/* Tokens + Students row */}
              <div className={styles.midRow}>
                <div className={styles.midCard}>
                  <div className={styles.midCardLabel}>
                    <svg className={`${styles.statIcon} ${styles.iconRed}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    ALUMNOS CON TOKEN DE REPOSICIÓN
                  </div>
                  <div className={styles.studentList}>
                    {studioData.students.filter((s: any) => (s.tokens || 0) > 0).length === 0 ? (
                      <div className={styles.tokensEmpty}>
                        <svg className={styles.iconGreen} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '10px', verticalAlign: 'middle' }}><polyline points="20 6 9 17 4 12"></polyline></svg>
                        Ningún alumno con tokens pendientes
                      </div>
                    ) : (
                      studioData.students.filter((s: any) => (s.tokens || 0) > 0).map((s: any) => (
                        <div key={s.id} className={styles.studentRow}>
                          <div className={styles.studentAvatar} style={{ background: 'var(--accent-red)' }}>{getInitials(s.name)}</div>
                          <div>
                            <div className={styles.studentName}>{s.name}</div>
                            <div className={styles.studentSub} style={{ color: 'var(--accent-red)', fontWeight: 600 }}>
                              {s.tokens} {s.tokens === 1 ? 'Token pendiente' : 'Tokens pendientes'}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className={styles.midCard}>
                  <div className={styles.midCardLabel}>
                    <svg className={`${styles.statIcon} ${styles.iconCyan}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    MIS ALUMNOS
                  </div>
                  <div className={styles.studentList}>
                    {studioData.students.map((s: StudioStudent) => (
                      <div key={s.id} className={styles.studentRow}>
                        <div className={styles.studentAvatar}>{getInitials(s.name)}</div>
                        <div>
                          <div className={styles.studentName}>{s.name}</div>
                          <div className={styles.studentSub}>{s.level ?? s.vertical ?? 'General'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Weekly availability */}
              <div className={styles.availCard}>
                <div className={styles.availHeader}>
                  <div>
                    <div className={styles.midCardLabel}>
                      <svg className={`${styles.statIcon} ${styles.iconBlue}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                      DISPONIBILIDAD SEMANAL
                    </div>
                    <div className={styles.availSub}>Gestiona tus horas y visualiza clases agendadas.</div>
                    
                    {(() => {
                      let availableCount = 0;
                      for (let row = 0; row < HOURS.length; row++) {
                        for (let col = 0; col < DAYS.length; col++) {
                          if (!availability[row]?.[col]) continue;
                          const h = 6 + row;
                          const isBooked = studioData?.sessions?.some(s => {
                            const d = new Date(s.date);
                            const dayIdx = d.getDay() === 0 ? 6 : d.getDay() - 1;
                            return dayIdx === col && d.getHours() === h;
                          });
                          if (!isBooked) availableCount++;
                        }
                      }
                      
                      if (availableCount > 0) {
                        const potentialExtra = availableCount * 4 * 30000;
                        const totalPotential = (studioData?.projectedCOP ?? 0) + potentialExtra;
                        return (
                          <div className={styles.availSub} style={{ marginTop: '10px', color: 'var(--accent-green)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <svg className={styles.iconGreen} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                            <span>Tu salario proyectado sería de {formatCOP(totalPotential)} COP cuando se agenden estas horas disponibles.</span>
                          </div>
                        );
                      }
                      return null;
                    })()}

                    <div className={styles.availLegend}>
                      <div className={styles.legendItem}><div className={`${styles.legendBox} ${styles.boxAvail}`} /> Disponible</div>
                      <div className={styles.legendItem}><div className={`${styles.legendBox} ${styles.boxBooked}`} /> Clase Agendada</div>
                      <div className={styles.legendItem}><div className={`${styles.legendBox} ${styles.boxExtra}`} /> Clase Extra (Token)</div>
                    </div>
                  </div>
                  <button
                    className={`${styles.saveBtn} ${savingAvail === 'saved' ? styles.saveBtnSaved : ''} ${savingAvail === 'error' ? styles.saveBtnError : ''}`}
                    onClick={saveAvailability}
                    disabled={savingAvail === 'saving'}
                  >
                    {savingAvail === 'saving' && '⏳ Guardando…'}
                    {savingAvail === 'saved' && '✅ Guardado'}
                    {savingAvail === 'error' && '❌ Error'}
                    {savingAvail === 'idle' && 'Guardar Disponibilidad'}
                  </button>
                </div>

                <div className={styles.availGrid}>
                  <div className={styles.availDayRow}>
                    <div className={styles.availHourLabel} />
                    {DAYS.map(d => (
                      <div key={d} className={styles.availDayLabel}>{d}</div>
                    ))}
                  </div>
                  {HOURS.map((hour, row) => (
                    <div key={hour} className={styles.availDayRow}>
                      <div className={styles.availHourLabel}>{hour}</div>
                      {DAYS.map((_, col) => {
                        const status = (() => {
                          const isAvail = availability[row]?.[col]
                          const h = 6 + row
                          // Check if any session matches this day/hour
                          const sess = studioData?.sessions?.find(s => {
                            const d = new Date(s.date)
                            const dayIdx = d.getDay() === 0 ? 6 : d.getDay() - 1 // 0-based Mon-Sun
                            return dayIdx === col && d.getHours() === h
                          })
                          if (sess) return sess.isExtra ? 'extra' : 'booked'
                          return isAvail ? 'avail' : null
                        })()

                        return (
                          <button
                            key={col}
                            className={`${styles.availCell} ${
                              status === 'extra' ? styles.availCellExtra :
                              status === 'booked' ? styles.availCellBooked :
                              status === 'avail' ? styles.availCellAvailable : ''
                            }`}
                            onMouseDown={() => handleMouseDown(row, col, status)}
                            onMouseEnter={() => handleMouseEnter(row, col, status)}
                            title={
                              status === 'extra' ? 'Clase Extraordinaria' :
                              status === 'booked' ? 'Clase Programada' : undefined
                            }
                          />
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
