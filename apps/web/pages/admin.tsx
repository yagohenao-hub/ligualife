import { useEffect, useState, useCallback } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import styles from '@/styles/Admin.module.css'
import GroupMatchmaker from '@/components/dashboard/GroupMatchmaker'
import VideoBankCurator from '@/components/admin/VideoBankCurator'

// ─── Types ──────────────────────────────────────────────────────────────────
type Tab = 'overview' | 'students' | 'teachers' | 'matchmaker' | 'groups' | 'videobank'

interface Metrics {
  totalStudents: number
  totalTeachers: number
  upcomingSessionsCount: number
  doneSessionsThisMonth: number
  studentsWithTokens: number
  rescheduledThisMonth: number
}

interface Student {
  id: string
  name: string
  email: string
  phone: string
  timezone: string
  tokens: number
  pin: string
  status: string
  notes: string
  interests: string[]
  availability: string // JSON array of "Day-Hour"
}

interface Teacher {
  id: string
  name: string
  email: string
  phone: string
  timezone: string
  pin: string
  bio: string
  meetingLink: string
  studentCount: number
  specialty: string[]
  availability: string // JSON array of "Day-Hour"
  status: string
  ssExpiryDate: string | null
  ssLastUpdated: string | null
  ssDocumentUrl: string | null
}

const ADMIN_TOKEN = 'LinguaAdmin2025'
const STUDENT_STATUSES = ['Active', 'Paused', 'Inactive', 'Blocked']
const TEACHER_STATUSES = ['Pending', 'Active', 'Paused', 'Inactive']

// ─── Helpers ─────────────────────────────────────────────────────────────────
function adminHeaders() {
  return { 'Content-Type': 'application/json', 'x-admin-token': ADMIN_TOKEN }
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function statusColor(status: string) {
  const map: Record<string, string> = {
    Active: '#10b981',
    Paused: '#f59e0b',
    Inactive: '#8888aa',
    Blocked: '#ef4444',
  }
  return map[status] ?? '#8888aa'
}

function getSSStatus(expiryDate: string | null): { label: string; color: string; bg: string; border: string } {
  if (!expiryDate) return { label: 'Sin SS', color: '#f87171', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)' }
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiry = new Date(expiryDate)
  expiry.setHours(0, 0, 0, 0)
  const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return { label: `Vencida ${expiry.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}`, color: '#f87171', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)' }
  if (diffDays <= 3) return { label: `Vence en ${diffDays}d`, color: '#fbbf24', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)' }
  return { label: `OK · ${expiry.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}`, color: '#4ade80', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)' }
}

// ─── Blank forms ─────────────────────────────────────────────────────────────
const blankStudent = { name: '', email: '', phone: '', timezone: 'America/Bogota', tokens: 0, notes: '' }
const blankTeacher = { name: '', email: '', phone: '', timezone: 'America/Bogota', bio: '', meetingLink: '' }

// ─── Component ───────────────────────────────────────────────────────────────
export default function AdminPage() {
  const router = useRouter()
  const [authed, setAuthed] = useState(false)
  const [pinInput, setPinInput] = useState('')
  const [pinError, setPinError] = useState('')

  const [tab, setTab] = useState<Tab>('overview')
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [metricsLoading, setMetricsLoading] = useState(false)

  // Students state
  const [students, setStudents] = useState<Student[]>([])
  const [studentsLoading, setStudentsLoading] = useState(false)
  const [studentSearch, setStudentSearch] = useState('')
  const [studentStatusFilter, setStudentStatusFilter] = useState('all')
  const [showStudentModal, setShowStudentModal] = useState(false)
  const [editStudent, setEditStudent] = useState<Student | null>(null)
  const [studentForm, setStudentForm] = useState({ ...blankStudent })
  const [studentFormLoading, setStudentFormLoading] = useState(false)
  const [newPinAlert, setNewPinAlert] = useState<{ pin: string; name: string } | null>(null)

  // Teachers state
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [teachersLoading, setTeachersLoading] = useState(false)
  const [teacherSearch, setTeacherSearch] = useState('')
  const [showTeacherModal, setShowTeacherModal] = useState(false)
  const [editTeacher, setEditTeacher] = useState<Teacher | null>(null)
  const [teacherForm, setTeacherForm] = useState({ ...blankTeacher })
  const [teacherFormLoading, setTeacherFormLoading] = useState(false)

  // Link Group state
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [linkForm, setLinkForm] = useState({ studentIds: [] as string[], teacherId: '', notes: '' })
  const [linkFormLoading, setLinkFormLoading] = useState(false)

  // Groups management state
  const [acquaintanceGroups, setAcquaintanceGroups] = useState<any[]>([])
  const [matchmakerGroups, setMatchmakerGroups] = useState<any[]>([])
  const [groupsLoading, setGroupsLoading] = useState(false)

  // ── Auth ────────────────────────────────────────────────────────────────────
  function handleAdminLogin() {
    if (pinInput === ADMIN_TOKEN) {
      setAuthed(true)
      setPinError('')
    } else {
      setPinError('Acceso denegado. Token incorrecto.')
    }
  }

  // ── Data loaders ────────────────────────────────────────────────────────────
  const loadMetrics = useCallback(async () => {
    setMetricsLoading(true)
    try {
      const res = await fetch('/api/admin/metrics', { headers: adminHeaders() })
      if (res.ok) setMetrics(await res.json())
    } finally {
      setMetricsLoading(false)
    }
  }, [])

  const loadStudents = useCallback(async () => {
    setStudentsLoading(true)
    try {
      const res = await fetch('/api/admin/students', { headers: adminHeaders() })
      if (res.ok) {
        const data = await res.json()
        setStudents(data.students ?? [])
      }
    } finally {
      setStudentsLoading(false)
    }
  }, [])

  const loadTeachers = useCallback(async () => {
    setTeachersLoading(true)
    try {
      const res = await fetch('/api/admin/teachers', { headers: adminHeaders() })
      if (res.ok) {
        const data = await res.json()
        setTeachers(data.teachers ?? [])
      }
    } finally {
      setTeachersLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!authed) return
    loadMetrics()
    loadStudents()
    loadTeachers()
    loadGroups()
  }, [authed])

  const loadGroups = useCallback(async () => {
    setGroupsLoading(true)
    try {
      const res = await fetch('/api/admin/groups', { headers: adminHeaders() })
      if (res.ok) {
          const data = await res.json()
          setAcquaintanceGroups(data.acquaintanceGroups || [])
          setMatchmakerGroups(data.matchmakerGroups || [])
      }
    } finally {
      setGroupsLoading(false)
    }
  }, [])

  async function deleteGroup(id: string, type: string, studentId?: string) {
    if (!confirm(studentId ? '¿Desvincular a este alumno del grupo?' : '¿Eliminar este grupo definitivamente?')) return
    const url = `/api/admin/groups?id=${id}&type=${type}${studentId ? `&studentId=${studentId}` : ''}`
    const res = await fetch(url, { method: 'DELETE', headers: adminHeaders() })
    if (res.ok) {
        alert('Operación exitosa')
        loadGroups()
        loadStudents()
    }
  }

  // ── Student CRUD ─────────────────────────────────────────────────────────────
  function openCreateStudent() {
    setEditStudent(null)
    setStudentForm({ ...blankStudent })
    setShowStudentModal(true)
  }

  function openEditStudent(s: Student) {
    setEditStudent(s)
    setStudentForm({ name: s.name, email: s.email, phone: s.phone, timezone: s.timezone, tokens: s.tokens, notes: s.notes })
    setShowStudentModal(true)
  }

  async function submitStudentForm() {
    setStudentFormLoading(true)
    try {
      if (editStudent) {
        // PATCH
        const res = await fetch('/api/admin/students', {
          method: 'PATCH',
          headers: adminHeaders(),
          body: JSON.stringify({ id: editStudent.id, tokens: studentForm.tokens, notes: studentForm.notes }),
        })
        if (res.ok) { setShowStudentModal(false); loadStudents() }
      } else {
        // POST
        const res = await fetch('/api/admin/students', {
          method: 'POST',
          headers: adminHeaders(),
          body: JSON.stringify(studentForm),
        })
        const data = await res.json()
        if (res.ok) {
          setShowStudentModal(false)
          setNewPinAlert({ pin: data.pin, name: studentForm.name })
          loadStudents()
          loadMetrics()
        } else {
          alert(data.error ?? 'Error al crear alumno')
        }
      }
    } finally {
      setStudentFormLoading(false)
    }
  }

  async function changeStudentStatus(s: Student, status: string) {
    await fetch('/api/admin/students', {
      method: 'PATCH',
      headers: adminHeaders(),
      body: JSON.stringify({ id: s.id, status }),
    })
    loadStudents()
    loadMetrics()
  }

  async function adjustTokens(s: Student, delta: number) {
    const newTokens = Math.max(0, s.tokens + delta)
    await fetch('/api/admin/students', {
      method: 'PATCH',
      headers: adminHeaders(),
      body: JSON.stringify({ id: s.id, tokens: newTokens }),
    })
    setStudents(prev => prev.map(x => x.id === s.id ? { ...x, tokens: newTokens } : x))
  }

  // ── Teacher CRUD ─────────────────────────────────────────────────────────────
  function openCreateTeacher() {
    setEditTeacher(null)
    setTeacherForm({ ...blankTeacher })
    setShowTeacherModal(true)
  }

  function openEditTeacher(t: Teacher) {
    setEditTeacher(t)
    setTeacherForm({ name: t.name, email: t.email, phone: t.phone, timezone: t.timezone, bio: t.bio, meetingLink: t.meetingLink })
    setShowTeacherModal(true)
  }

  async function changeTeacherStatus(t: Teacher, status: string) {
    await fetch('/api/admin/teachers', {
      method: 'PATCH',
      headers: adminHeaders(),
      body: JSON.stringify({ id: t.id, status }),
    })
    loadTeachers()
    loadMetrics()
  }

  async function submitTeacherForm() {
    setTeacherFormLoading(true)
    try {
      if (editTeacher) {
        const res = await fetch('/api/admin/teachers', {
          method: 'PATCH',
          headers: adminHeaders(),
          body: JSON.stringify({ id: editTeacher.id, bio: teacherForm.bio, phone: teacherForm.phone, meetingLink: teacherForm.meetingLink, timezone: teacherForm.timezone }),
        })
        if (res.ok) { setShowTeacherModal(false); loadTeachers() }
      } else {
        const res = await fetch('/api/admin/teachers', {
          method: 'POST',
          headers: adminHeaders(),
          body: JSON.stringify(teacherForm),
        })
        const data = await res.json()
        if (res.ok) {
          setShowTeacherModal(false)
          setNewPinAlert({ pin: data.pin, name: teacherForm.name })
          loadTeachers()
          loadMetrics()
        } else {
          alert(data.error ?? 'Error al crear profesor')
        }
      }
    } finally {
      setTeacherFormLoading(false)
    }
  }

  async function submitLinkForm() {
    if (linkForm.studentIds.length === 0 || !linkForm.teacherId) return
    
    // Assign random schedule from available common slots
    const selectedStudentsData = students.filter(s => linkForm.studentIds.includes(s.id))
    const teacher = teachers.find(t => t.id === linkForm.teacherId)
    if (!teacher) return

    const matchingSlots = getMatchingSlots(selectedStudentsData, teacher)
    const days = Array.from(new Set(matchingSlots.map(s => s.split('-')[0])))
    
    let chosenDays: string[] = []
    let chosenTime: string = ''

    if (days.length >= 2) {
        chosenDays = [days[0], days[1]]
        chosenTime = matchingSlots.find(s => s.startsWith(days[0]))?.split('-')[1] || ''
    } else if (days.length === 1) {
        chosenDays = [days[0]]
        chosenTime = matchingSlots[0].split('-')[1]
    }

    setLinkFormLoading(true)
    try {
      const res = await fetch('/api/admin/link-group', {
        method: 'POST',
        headers: adminHeaders(),
        body: JSON.stringify({
            ...linkForm,
            days: chosenDays,
            time: chosenTime
        }),
      })
      if (res.ok) {
        setShowLinkModal(false)
        setLinkForm({ studentIds: [], teacherId: '', notes: '' })
        alert('✅ Grupo vinculado exitosamente con horario asignado')
        loadMetrics()
        loadStudents()
        loadGroups()
      } else {
        const data = await res.json()
        alert(data.error || 'Error al vincular')
      }
    } finally {
      setLinkFormLoading(false)
    }
  }

  function getMatchingSlots(selectedStudents: Student[], teacher: Teacher) {
    try {
        const studentAvails = selectedStudents.map(s => {
            try { return JSON.parse(s.availability || '[]') as string[] } catch { return [] }
        })
        const teacherAvail = JSON.parse(teacher.availability || '[]') as string[]
        const intersection = studentAvails.reduce((acc, curr) => acc.filter(x => curr.includes(x)), studentAvails[0] || [])
        return intersection.filter(x => teacherAvail.includes(x))
    } catch { return [] }
  }

  function getSortedTeachers() {
    const selectedStudentsData = students.filter(s => linkForm.studentIds.includes(s.id))
    if (selectedStudentsData.length === 0) return []

    const candidates = teachers.filter(t => {
        const match = getMatchingSlots(selectedStudentsData, t)
        return match.length > 0
    })

    const studentInterests = Array.from(new Set(selectedStudentsData.flatMap(s => s.interests || [])))
    
    return candidates.sort((a, b) => {
        const aMatch = (a.specialty || []).filter(x => studentInterests.includes(x)).length
        const bMatch = (b.specialty || []).filter(x => studentInterests.includes(x)).length
        return bMatch - aMatch
    })
  }

  const toggleStudentInLink = (id: string) => {
    setLinkForm(prev => {
      const exists = prev.studentIds.includes(id)
      if (exists) return { ...prev, studentIds: prev.studentIds.filter(x => x !== id) }
      if (prev.studentIds.length >= 3) {
        alert('Límite de 3 personas para grupos vinculados')
        return prev
      }
      return { ...prev, studentIds: [...prev.studentIds, id] }
    })
  }

  const filteredStudents = students.filter(s => {
    const matchSearch = !studentSearch || s.name.toLowerCase().includes(studentSearch.toLowerCase()) || s.email.toLowerCase().includes(studentSearch.toLowerCase())
    const matchStatus = studentStatusFilter === 'all' || s.status === studentStatusFilter
    return matchSearch && matchStatus
  })

  const filteredTeachers = teachers.filter(t =>
    !teacherSearch || t.name.toLowerCase().includes(teacherSearch.toLowerCase()) || t.email.toLowerCase().includes(teacherSearch.toLowerCase())
  )

  if (!authed) {

    return (
      <>
        <Head>
          <title>LinguaLife — Admin</title>
        </Head>
        <div className={styles.loginWrap}>
          <div className={styles.loginCard}>
            <div className={styles.loginLogo}>🛡️</div>
            <h1 className={styles.loginTitle}>Panel Administrativo</h1>
            <p className={styles.loginSub}>LinguaLife Academia</p>
            <input
              className={styles.tokenInput}
              type="password"
              placeholder="Token de acceso"
              value={pinInput}
              onChange={e => setPinInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdminLogin()}
            />
            {pinError && <div className={styles.loginError}>{pinError}</div>}
            <button className={styles.loginBtn} onClick={handleAdminLogin}>
              Ingresar →
            </button>
          </div>
        </div>
      </>
    )
  }

  // ── Main admin dashboard ────────────────────────────────────────────────────
  return (
    <>
      <Head>
        <title>Admin — LinguaLife</title>
        <meta name="robots" content="noindex" />
      </Head>

      <div className={styles.adminWrap}>
        {/* ── Sidebar ── */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarLogo}>
            <span className={styles.logoBadge}>LL</span>
            <span className={styles.logoText}>Admin</span>
          </div>
          <nav className={styles.sidebarNav}>
            {([
              { key: 'overview', icon: '📊', label: 'General' },
              { key: 'students', icon: '👩‍🎓', label: 'Alumnos' },
              { key: 'teachers', icon: '👩‍🏫', label: 'Profesores' },
              { key: 'matchmaker', icon: '🎲', label: 'Matchmaker' },
              { key: 'groups', icon: '👥', label: 'Gestión Grupos' },
              { key: 'videobank', icon: '🎬', label: 'Video Bank' },
              { key: 'series', icon: '📺', label: 'Series Master' },
              { key: 'stories', icon: '📖', label: 'Story Studio' },
            ] as { key: any; icon: string; label: string }[]).map(item => (
              <button
                key={item.key}
                className={`${styles.navItem} ${tab === item.key ? styles.navItemActive : ''}`}
                onClick={() => {
                  if (item.key === 'series') router.push('/series-companion')
                  else if (item.key === 'stories') router.push('/admin/story-studio')
                  else setTab(item.key)
                }}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
          <div className={styles.sidebarFooter}>
            <span className={styles.footerVersion}>MVP v1.0</span>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className={styles.mainContent}>

          {/* ═══ OVERVIEW TAB ═══ */}
          {tab === 'overview' && (
            <div className={styles.tabContent}>
              <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Visión General</h1>
                <button className={styles.refreshBtn} onClick={() => { loadMetrics(); loadStudents(); loadTeachers() }}>↺ Actualizar</button>
              </div>

              {metricsLoading && <div className="spinner" />}
              {!metricsLoading && metrics && (
                <>
                  <div className={styles.metricsGrid}>
                    <div className={`${styles.metricCard} ${styles.metricBlue}`}>
                      <div className={styles.metricIcon}>👩‍🎓</div>
                      <div className={styles.metricValue}>{metrics.totalStudents}</div>
                      <div className={styles.metricLabel}>Alumnos Totales</div>
                    </div>
                    <div className={`${styles.metricCard} ${styles.metricPurple}`}>
                      <div className={styles.metricIcon}>👩‍🏫</div>
                      <div className={styles.metricValue}>{metrics.totalTeachers}</div>
                      <div className={styles.metricLabel}>Profesores Activos</div>
                    </div>
                    <div className={`${styles.metricCard} ${styles.metricGreen}`}>
                      <div className={styles.metricIcon}>📅</div>
                      <div className={styles.metricValue}>{metrics.upcomingSessionsCount}</div>
                      <div className={styles.metricLabel}>Clases Esta Semana</div>
                    </div>
                    <div className={`${styles.metricCard} ${styles.metricAmber}`}>
                      <div className={styles.metricIcon}>✅</div>
                      <div className={styles.metricValue}>{metrics.doneSessionsThisMonth}</div>
                      <div className={styles.metricLabel}>Clases Este Mes</div>
                    </div>
                    <div className={`${styles.metricCard} ${styles.metricRed}`}>
                      <div className={styles.metricIcon}>🎟️</div>
                      <div className={styles.metricValue}>{metrics.studentsWithTokens}</div>
                      <div className={styles.metricLabel}>Alumnos con Tokens</div>
                    </div>
                    <div className={`${styles.metricCard} ${styles.metricAmber}`} style={{ '--metric-color': '#f59e0b' } as any}>
                      <div className={styles.metricIcon}>🔄</div>
                      <div className={styles.metricValue}>{metrics.rescheduledThisMonth}</div>
                      <div className={styles.metricLabel}>Clases Reagendadas</div>
                    </div>
                  </div>

                  {/* Quick access */}
                  <div className={styles.quickActions}>
                    <h2 className={styles.sectionTitle}>Acciones Rápidas</h2>
                    <div className={styles.quickBtns}>
                      <button className={styles.quickBtn} onClick={() => { setTab('students'); openCreateStudent() }}>
                        <span>➕</span> Nuevo Alumno
                      </button>
                      <button className={styles.quickBtn} onClick={() => { setTab('teachers'); openCreateTeacher() }}>
                        <span>➕</span> Nuevo Profesor
                      </button>
                      <button className={styles.quickBtn} onClick={() => setTab('students')}>
                        <span>👁️</span> Ver Alumnos
                      </button>
                      <button className={styles.quickBtn} onClick={() => router.push('/series-companion')}>
                        <span>🎬</span> Series Activity Master
                      </button>
                      <button className={styles.quickBtn} onClick={() => setTab('teachers')}>
                        <span>👁️</span> Ver Profesores
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ═══ STUDENTS TAB ═══ */}
          {tab === 'students' && (
            <div className={styles.tabContent}>
              <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Alumnos <span className={styles.countBadge}>{students.length}</span></h1>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button className={styles.addBtnSecondary} onClick={() => setShowLinkModal(true)}>🔗 Vincular Grupo</button>
                </div>
              </div>

              {/* Filters */}
              <div className={styles.filterRow}>
                <input
                  className={styles.searchInput}
                  placeholder="🔍 Buscar por nombre o email..."
                  value={studentSearch}
                  onChange={e => setStudentSearch(e.target.value)}
                />
                <select
                  className={styles.filterSelect}
                  value={studentStatusFilter}
                  onChange={e => setStudentStatusFilter(e.target.value)}
                >
                  <option value="all">Todos los estados</option>
                  {STUDENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {studentsLoading && <div className="spinner" />}

              {!studentsLoading && (
                <div className={styles.tableWrap}>
                  <table className={styles.dataTable}>
                    <thead>
                      <tr>
                        <th>Alumno</th>
                        <th>Email</th>
                        <th>Día de Cobro</th>
                        <th>Tokens</th>
                        <th>PIN</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.length === 0 && (
                        <tr><td colSpan={7} className={styles.emptyRow}>No se encontraron alumnos.</td></tr>
                      )}
                      {filteredStudents.map(s => (
                        <tr key={s.id} className={styles.tableRow}>
                          <td>
                            <div className={styles.nameCell}>
                              <div className={styles.avatar}>{getInitials(s.name)}</div>
                              <div>
                                <div className={styles.nameText}>{s.name}</div>
                                <div className={styles.subText}>{s.phone || '—'}</div>
                              </div>
                            </div>
                          </td>
                          <td className={styles.emailCell}>{s.email || '—'}</td>
                          <td className={styles.tzCell} style={{ opacity: 0.5 }}>Próximamente</td>
                          <td>
                            <div className={styles.tokenCell}>
                              <button className={styles.tokenBtn} onClick={() => adjustTokens(s, -1)} disabled={s.tokens <= 0}>−</button>
                              <span className={styles.tokenNum}>{s.tokens}</span>
                              <button className={styles.tokenBtn} onClick={() => adjustTokens(s, 1)}>+</button>
                            </div>
                          </td>
                          <td>
                            <span className={styles.pinBadge}>{s.pin || '—'}</span>
                          </td>
                          <td>
                            <select
                              className={styles.statusSelect}
                              value={s.status}
                              onChange={e => changeStudentStatus(s, e.target.value)}
                              style={{ borderColor: statusColor(s.status), color: statusColor(s.status) }}
                            >
                              {STUDENT_STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
                            </select>
                          </td>
                          <td>
                            <button className={styles.editBtn} onClick={() => openEditStudent(s)}>✏️ Editar</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ═══ TEACHERS TAB ═══ */}
          {tab === 'teachers' && (
            <div className={styles.tabContent}>
              <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Profesores <span className={styles.countBadge}>{teachers.length}</span></h1>
                <button className={styles.addBtn} onClick={openCreateTeacher}>+ Vincular Profesor</button>
              </div>

              <div className={styles.filterRow}>
                <input
                  className={styles.searchInput}
                  placeholder="🔍 Buscar por nombre o email..."
                  value={teacherSearch}
                  onChange={e => setTeacherSearch(e.target.value)}
                />
              </div>

              {teachersLoading && <div className="spinner" />}

              {!teachersLoading && (
                <div className={styles.tableWrap}>
                  <table className={styles.dataTable}>
                    <thead>
                      <tr>
                        <th>Profesor</th>
                        <th>Email</th>
                        <th>Zona Horaria</th>
                        <th>Alumnos</th>
                        <th>PIN</th>
                        <th>Estado</th>
                        <th>SS</th>
                        <th>Meet Link</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTeachers.length === 0 && (
                        <tr><td colSpan={7} className={styles.emptyRow}>No se encontraron profesores.</td></tr>
                      )}
                      {filteredTeachers.map(t => (
                        <tr key={t.id} className={styles.tableRow}>
                          <td>
                            <div className={styles.nameCell}>
                              <div className={`${styles.avatar} ${styles.avatarTeacher}`}>{getInitials(t.name)}</div>
                              <div>
                                <div className={styles.nameText}>{t.name}</div>
                                <div className={styles.subText}>{t.phone || '—'}</div>
                              </div>
                            </div>
                          </td>
                          <td className={styles.emailCell}>{t.email || '—'}</td>
                          <td className={styles.tzCell}>{t.timezone || '—'}</td>
                          <td>
                            <span className={styles.studentCountBadge}>{t.studentCount}</span>
                          </td>
                          <td>
                            <span className={styles.pinBadge}>{t.pin || '—'}</span>
                          </td>
                          <td>
                            <select
                              className={styles.statusSelect}
                              value={t.status || 'Active'}
                              onChange={e => changeTeacherStatus(t, e.target.value)}
                              style={{ borderColor: statusColor(t.status), color: statusColor(t.status) }}
                            >
                              {TEACHER_STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
                            </select>
                          </td>
                          <td>
                            {(() => {
                              const ss = getSSStatus(t.ssExpiryDate)
                              return (
                                <span
                                  title={t.ssDocumentUrl ? `Documento: ${t.ssDocumentUrl}\nÚltima actualización: ${t.ssLastUpdated ?? 'N/A'}` : 'Sin documento registrado'}
                                  style={{ display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: '50px', fontSize: '0.72rem', fontWeight: 700, color: ss.color, background: ss.bg, border: `1px solid ${ss.border}`, cursor: t.ssDocumentUrl ? 'pointer' : 'default' }}
                                  onClick={() => t.ssDocumentUrl && window.open(t.ssDocumentUrl, '_blank')}
                                >
                                  {ss.label}
                                </span>
                              )
                            })()}
                          </td>
                          <td>
                            {t.meetingLink ? (
                              <a href={t.meetingLink} target="_blank" rel="noreferrer" className={styles.meetLink}>🔗 Meet</a>
                            ) : '—'}
                          </td>
                          <td>
                            <button className={styles.editBtn} onClick={() => openEditTeacher(t)}>✏️ Editar</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ═══ VIDEO BANK TAB ═══ */}
          {tab === 'videobank' && (
            <div className={styles.tabContent}>
              <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Video Bank</h1>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Curación de videos nativos para el banco de contenido
                </span>
              </div>
              <VideoBankCurator />
            </div>
          )}

          {/* ═══ GROUPS TAB ═══ */}
          {tab === 'groups' && (
            <div className={styles.tabContent}>
              <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Gestión de Grupos <span className={styles.countBadge}>{acquaintanceGroups.length + matchmakerGroups.length}</span></h1>
              </div>

              {groupsLoading && <div className="spinner" />}

              {!groupsLoading && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  
                  {/* Conocidos Section */}
                  <section>
                    <h2 className={styles.sectionTitle}>Grupos de Conocidos (Directos)</h2>
                    <div className={styles.tableWrap}>
                      <table className={styles.dataTable}>
                        <thead>
                          <tr>
                            <th>Alumnos</th>
                            <th>Profesor</th>
                            <th>Horario</th>
                            <th>Notas</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {acquaintanceGroups.length === 0 && <tr><td colSpan={5} className={styles.emptyRow}>No hay grupos de conocidos vinculados.</td></tr>}
                          {acquaintanceGroups.map(g => (
                            <tr key={g.id} className={styles.tableRow}>
                              <td>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                  {g.studentIds.map((sid: string) => {
                                      const s = students.find(x => x.id === sid)
                                      return (
                                        <div key={sid} style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                                          👤 {s?.name || 'Cargando...'}
                                          <button 
                                            onClick={() => deleteGroup(g.id, 'conocidos', sid)} 
                                            style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                            title="Desvincular del grupo"
                                          >✕</button>
                                        </div>
                                      )
                                  })}
                                </div>
                              </td>
                              <td>{teachers.find(t => t.id === g.teacherId)?.name || '—'}</td>
                              <td>
                                <div style={{ fontSize: '0.8rem' }}>
                                    <div>📅 {g.days.join(', ')}</div>
                                    <div style={{ opacity: 0.7 }}>⏰ {g.time}</div>
                                </div>
                              </td>
                              <td style={{ maxWidth: '150px', whiteSpace: 'normal', fontSize: '0.75rem', opacity: 0.7 }}>{g.notes || '—'}</td>
                              <td>
                                <button className={styles.editBtn} style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }} onClick={() => deleteGroup(g.id, 'conocidos')}>🗑️ Eliminar</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>

                  {/* Matchmaker Groups Section */}
                  <section>
                    <h2 className={styles.sectionTitle}>Grupos Matchmaker (Propuestos)</h2>
                    <div className={styles.tableWrap}>
                      <table className={styles.dataTable}>
                        <thead>
                          <tr>
                            <th>Nombre / Tema</th>
                            <th>Alumnos</th>
                            <th>Profesor</th>
                            <th>Nivel</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {matchmakerGroups.length === 0 && <tr><td colSpan={5} className={styles.emptyRow}>No hay grupos de matchmaker activos.</td></tr>}
                          {matchmakerGroups.map(g => (
                            <tr key={g.id} className={styles.tableRow}>
                              <td>
                                <div style={{ fontWeight: 600 }}>{g.name}</div>
                                <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>{g.topic}</div>
                              </td>
                              <td>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                                  {g.studentIds.map((sid: string) => {
                                      const s = students.find(x => x.id === sid)
                                      return (
                                        <div key={sid} style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                                          {s?.name?.split(' ')[0] || '...'}
                                          <button onClick={() => deleteGroup(g.id, 'matchmaker', sid)} style={{ marginLeft: '4px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
                                        </div>
                                      )
                                  })}
                                </div>
                              </td>
                              <td>{teachers.find(t => t.id === g.teacherId)?.name || '—'}</td>
                              <td><span className={styles.pinBadge} style={{ fontSize: '0.75rem' }}>{g.level}</span></td>
                              <td>
                                <button className={styles.editBtn} style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }} onClick={() => deleteGroup(g.id, 'matchmaker')}>🗑️ Eliminar</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ═══ STUDENT MODAL ═══ */}
      {showStudentModal && (
        <div className={styles.modalOverlay} onClick={() => setShowStudentModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span>{editStudent ? '✏️ Editar Alumno' : '➕ Vincular Nuevo Alumno'}</span>
              <button className={styles.modalClose} onClick={() => setShowStudentModal(false)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              {!editStudent && (
                <>
                  <label className={styles.fieldLabel}>Nombre completo *</label>
                  <input className={styles.fieldInput} value={studentForm.name} onChange={e => setStudentForm(f => ({ ...f, name: e.target.value }))} placeholder="Ej: María Gómez" />
                  <label className={styles.fieldLabel}>Email *</label>
                  <input className={styles.fieldInput} type="email" value={studentForm.email} onChange={e => setStudentForm(f => ({ ...f, email: e.target.value }))} placeholder="alumno@email.com" />
                  <label className={styles.fieldLabel}>Teléfono</label>
                  <input className={styles.fieldInput} value={studentForm.phone} onChange={e => setStudentForm(f => ({ ...f, phone: e.target.value }))} placeholder="+57 300 000 0000" />
                  <label className={styles.fieldLabel}>Zona Horaria</label>
                  <input className={styles.fieldInput} value={studentForm.timezone} onChange={e => setStudentForm(f => ({ ...f, timezone: e.target.value }))} placeholder="America/Bogota" />
                </>
              )}
              <label className={styles.fieldLabel}>Tokens de Reposición</label>
              <input className={styles.fieldInput} type="number" min="0" value={studentForm.tokens} onChange={e => setStudentForm(f => ({ ...f, tokens: parseInt(e.target.value) || 0 }))} />
              <label className={styles.fieldLabel}>Notas internas</label>
              <textarea className={styles.fieldTextarea} value={studentForm.notes} onChange={e => setStudentForm(f => ({ ...f, notes: e.target.value }))} placeholder="Ej: Nivel A2, interesado en negocios..." rows={3} />
              {!editStudent && (
                <div className={styles.pinHint}>
                  🔐 Se generará automáticamente un PIN de 6 caracteres y se asignará al alumno.
                </div>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setShowStudentModal(false)}>Cancelar</button>
              <button className={styles.submitBtn} onClick={submitStudentForm} disabled={studentFormLoading}>
                {studentFormLoading ? 'Guardando...' : (editStudent ? 'Guardar Cambios' : 'Crear Alumno')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ TEACHER MODAL ═══ */}
      {showTeacherModal && (
        <div className={styles.modalOverlay} onClick={() => setShowTeacherModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span>{editTeacher ? '✏️ Editar Profesor' : '➕ Vincular Nuevo Profesor'}</span>
              <button className={styles.modalClose} onClick={() => setShowTeacherModal(false)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              {!editTeacher && (
                <>
                  <label className={styles.fieldLabel}>Nombre completo *</label>
                  <input className={styles.fieldInput} value={teacherForm.name} onChange={e => setTeacherForm(f => ({ ...f, name: e.target.value }))} placeholder="Ej: Carlos Pérez" />
                  <label className={styles.fieldLabel}>Email *</label>
                  <input className={styles.fieldInput} type="email" value={teacherForm.email} onChange={e => setTeacherForm(f => ({ ...f, email: e.target.value }))} placeholder="profesor@email.com" />
                </>
              )}
              <label className={styles.fieldLabel}>Teléfono</label>
              <input className={styles.fieldInput} value={teacherForm.phone} onChange={e => setTeacherForm(f => ({ ...f, phone: e.target.value }))} placeholder="+57 300 000 0000" />
              <label className={styles.fieldLabel}>Zona Horaria</label>
              <input className={styles.fieldInput} value={teacherForm.timezone} onChange={e => setTeacherForm(f => ({ ...f, timezone: e.target.value }))} placeholder="America/Bogota" />
              <label className={styles.fieldLabel}>Bio / Especialidad</label>
              <textarea className={styles.fieldTextarea} value={teacherForm.bio} onChange={e => setTeacherForm(f => ({ ...f, bio: e.target.value }))} placeholder="Especialista en inglés de negocios..." rows={3} />
              <label className={styles.fieldLabel}>Link de Meet personal</label>
              <input className={styles.fieldInput} value={teacherForm.meetingLink} onChange={e => setTeacherForm(f => ({ ...f, meetingLink: e.target.value }))} placeholder="https://meet.google.com/..." />
              {!editTeacher && (
                <div className={styles.pinHint}>
                  🔐 Se generará automáticamente un PIN de 6 caracteres y se asignará al profesor.
                </div>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setShowTeacherModal(false)}>Cancelar</button>
              <button className={styles.submitBtn} onClick={submitTeacherForm} disabled={teacherFormLoading}>
                {teacherFormLoading ? 'Guardando...' : (editTeacher ? 'Guardar Cambios' : 'Crear Profesor')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ NEW PIN ALERT ═══ */}
      {newPinAlert && (
        <div className={styles.modalOverlay} onClick={() => setNewPinAlert(null)}>
          <div className={styles.pinModal} onClick={e => e.stopPropagation()}>
            <div className={styles.pinModalIcon}>🎉</div>
            <h2 className={styles.pinModalTitle}>¡Registrado exitosamente!</h2>
            <p className={styles.pinModalName}>{newPinAlert.name}</p>
            <div className={styles.pinDisplay}>{newPinAlert.pin}</div>
            <p className={styles.pinModalSub}>Guarda y comparte este PIN con el usuario. Necesitará recordarlo para acceder a la plataforma.</p>
            <button className={styles.submitBtn} onClick={() => setNewPinAlert(null)}>Entendido ✓</button>
          </div>
        </div>
      )}

      {/* ═══ LINK GROUP MODAL ═══ */}
      {showLinkModal && (
        <div className={styles.modalOverlay} onClick={() => setShowLinkModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span>🔗 Vincular Conocidos (Grupo Directo)</span>
              <button className={styles.modalClose} onClick={() => setShowLinkModal(false)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Selecciona hasta 3 alumnos **Pendientes** para crear su primer vínculo grupal. 
              </p>
              
              <label className={styles.fieldLabel}>Alumnos Pendientes (Máx 3)</label>
              <div style={{ 
                maxHeight: '180px', 
                overflowY: 'auto', 
                background: 'rgba(0,0,0,0.2)', 
                borderRadius: '10px', 
                border: '1px solid rgba(255,255,255,0.05)',
                padding: '0.5rem'
              }}>
                {students.filter(s => s.status === 'Pending').map(s => (
                  <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', cursor: 'pointer', borderRadius: '6px', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    <input 
                      type="checkbox" 
                      checked={linkForm.studentIds.includes(s.id)}
                      onChange={() => toggleStudentInLink(s.id)}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.85rem' }}>{s.name}</span>
                        <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>{s.interests?.join(' · ')}</span>
                    </div>
                  </label>
                ))}
                {students.filter(s => s.status === 'Pending').length === 0 && <div style={{ opacity: 0.5, fontSize: '0.8rem', textAlign: 'center', padding: '1rem' }}>No hay alumnos pendientes.</div>}
              </div>

              <label className={styles.fieldLabel} style={{ marginTop: '0.5rem' }}>Profesor Compatible (Ordenados por afinidad)</label>
              <select 
                className={styles.fieldInput} 
                value={linkForm.teacherId} 
                onChange={e => setLinkForm({ ...linkForm, teacherId: e.target.value })}
                disabled={linkForm.studentIds.length === 0}
              >
                <option value="">{linkForm.studentIds.length === 0 ? 'Selecciona alumnos primero...' : 'Selecciona un profesor compatible...'}</option>
                {getSortedTeachers().map(t => (
                  <option key={t.id} value={t.id}>{t.name} — Coincide disponibilidad</option>
                ))}
              </select>
              {linkForm.studentIds.length > 0 && getSortedTeachers().length === 0 && (
                  <p style={{ fontSize: '0.7rem', color: '#ef4444' }}>⚠️ No hay profesores con disponibilidad coincidente para este grupo.</p>
              )}

              <label className={styles.fieldLabel}>Notas (Opcional)</label>
              <textarea 
                className={styles.fieldTextarea} 
                value={linkForm.notes} 
                onChange={e => setLinkForm({ ...linkForm, notes: e.target.value })} 
                placeholder="Ej: Grupo de primos, nivel intermedio..." 
                rows={2} 
              />
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => { setShowLinkModal(false); setLinkForm({ studentIds: [], teacherId: '', notes: '' }) }}>Cancelar</button>
              <button 
                className={styles.submitBtn} 
                onClick={submitLinkForm} 
                disabled={linkFormLoading || linkForm.studentIds.length === 0 || !linkForm.teacherId}
              >
                {linkFormLoading ? 'Vinculando...' : 'Crear Vínculo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
