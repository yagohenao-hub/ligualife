import { useEffect, useState, useCallback } from 'react'
import Head from 'next/head'
import styles from '@/styles/Admin.module.css'

// ─── Types ──────────────────────────────────────────────────────────────────
type Tab = 'overview' | 'students' | 'teachers'

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
}

const ADMIN_TOKEN = 'LinguaAdmin2025'
const STUDENT_STATUSES = ['Active', 'Paused', 'Inactive', 'Blocked']

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

// ─── Blank forms ─────────────────────────────────────────────────────────────
const blankStudent = { name: '', email: '', phone: '', timezone: 'America/Bogota', tokens: 0, notes: '' }
const blankTeacher = { name: '', email: '', phone: '', timezone: 'America/Bogota', bio: '', meetingLink: '' }

// ─── Component ───────────────────────────────────────────────────────────────
export default function AdminPage() {
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
  }, [authed])

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

  // ── Filtered data ─────────────────────────────────────────────────────────────
  const filteredStudents = students.filter(s => {
    const matchSearch = !studentSearch || s.name.toLowerCase().includes(studentSearch.toLowerCase()) || s.email.toLowerCase().includes(studentSearch.toLowerCase())
    const matchStatus = studentStatusFilter === 'all' || s.status === studentStatusFilter
    return matchSearch && matchStatus
  })

  const filteredTeachers = teachers.filter(t =>
    !teacherSearch || t.name.toLowerCase().includes(teacherSearch.toLowerCase()) || t.email.toLowerCase().includes(teacherSearch.toLowerCase())
  )

  // ── Login screen ───────────────────────────────────────────────────────────
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
            ] as { key: Tab; icon: string; label: string }[]).map(item => (
              <button
                key={item.key}
                className={`${styles.navItem} ${tab === item.key ? styles.navItemActive : ''}`}
                onClick={() => setTab(item.key)}
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
                <button className={styles.addBtn} onClick={openCreateStudent}>+ Vincular Alumno</button>
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
    </>
  )
}
