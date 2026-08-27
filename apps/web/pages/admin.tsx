import { useEffect, useState, useCallback } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import styles from '@/styles/Admin.module.css'
import GroupMatchmaker from '@/components/dashboard/GroupMatchmaker'
import VideoBankCurator from '@/components/admin/VideoBankCurator'
import { SceneStudioTab } from '@/components/admin/SceneStudioTab'

// ─── Types ──────────────────────────────────────────────────────────────────
type Tab = 'overview' | 'students' | 'teachers' | 'matchmaker' | 'groups' | 'videobank' | 'scene_studio'

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
  classesRemaining: number
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
const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const HOURS = ['6am', '7am', '8am', '9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm', '7pm', '8pm']

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
  if (isNaN(expiry.getTime())) {
    return { label: 'SS Registrada', color: '#fbbf24', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)' }
  }
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
  const [isDirectoryExpanded, setIsDirectoryExpanded] = useState(false)
  const [isContentExpanded, setIsContentExpanded] = useState(false)
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
  const [linkForm, setLinkForm] = useState({ studentIds: [] as string[], teacherId: '', notes: '', selectedDays: [] as string[], selectedTimes: {} as Record<string, string> })
  const [linkFormLoading, setLinkFormLoading] = useState(false)

  // Edit Group state
  const [showEditGroupModal, setShowEditGroupModal] = useState(false)
  const [editGroupForm, setEditGroupForm] = useState({ id: '', type: 'conocidos', studentIds: [] as string[], teacherId: '', notes: '', selectedDays: [] as string[], selectedTimes: {} as Record<string, string> })
  const [editGroupLoading, setEditGroupLoading] = useState(false)

  // Groups management state
  const [acquaintanceGroups, setAcquaintanceGroups] = useState<any[]>([])
  const [matchmakerGroups, setMatchmakerGroups] = useState<any[]>([])
  const [groupsLoading, setGroupsLoading] = useState(false)
  const [scheduleFilter, setScheduleFilter] = useState<'all' | 'individual' | 'group'>('all')

  // Secretary Pending Inbox state
  const [seriesRequests, setSeriesRequests] = useState<any[]>([])
  const [pendingFilter, setPendingFilter] = useState<'all' | 'teachers' | 'students' | 'ss' | 'series'>('all')

  function openWhatsApp(phone: string, text: string) {
    const cleanPhone = phone.replace(/[^0-9]/g, '')
    if (!cleanPhone) {
      alert('Este usuario no tiene un número de teléfono registrado.')
      return
    }
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

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

  const loadSeriesRequests = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/series-requests', { headers: adminHeaders() })
      if (res.ok) {
        const data = await res.json()
        setSeriesRequests(data.requests ?? [])
      }
    } catch {}
  }, [])

  useEffect(() => {
    if (!authed) return
    loadMetrics()
    loadStudents()
    loadTeachers()
    loadGroups()
    loadSeriesRequests()
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
    
    const timesString = linkForm.selectedDays.map(d => linkForm.selectedTimes?.[d] || '').join(', ')

    setLinkFormLoading(true)
    try {
      const res = await fetch('/api/admin/link-group', {
        method: 'POST',
        headers: adminHeaders(),
        body: JSON.stringify({
            ...linkForm,
            days: linkForm.selectedDays,
            time: timesString
        }),
      })
      if (res.ok) {
        setShowLinkModal(false)
        setLinkForm({ studentIds: [], teacherId: '', notes: '', selectedDays: [], selectedTimes: {} })
        alert('✅ Alumno/Grupo vinculado exitosamente')
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

  const handleTeacherChangeInLink = (teacherId: string) => {
    const selectedStudentsData = students.filter(s => linkForm.studentIds.includes(s.id))
    const teacher = teachers.find(t => t.id === teacherId)
    let chosenDays: string[] = []
    const chosenTimes: Record<string, string> = {}

    if (teacher) {
      const matchingSlots = getMatchingSlots(selectedStudentsData, teacher)
      const days = Array.from(new Set(matchingSlots.map(s => s.split('-')[0])))
      if (days.length >= 2) {
          chosenDays = [days[0], days[1]]
          const time1 = matchingSlots.find(s => s.startsWith(days[0]))?.split('-')[1] || ''
          const time2 = matchingSlots.find(s => s.startsWith(days[1]))?.split('-')[1] || ''
          chosenTimes[days[0]] = time1
          chosenTimes[days[1]] = time2
      } else if (days.length === 1) {
          chosenDays = [days[0]]
          chosenTimes[days[0]] = matchingSlots[0].split('-')[1]
      }
    }

    setLinkForm(prev => ({
      ...prev,
      teacherId,
      selectedDays: chosenDays,
      selectedTimes: chosenTimes
    }))
  }

  async function submitEditGroupForm() {
    if (!editGroupForm.id || !editGroupForm.teacherId) return
    const timesString = editGroupForm.selectedDays.map(d => editGroupForm.selectedTimes?.[d] || '').join(', ')

    setEditGroupLoading(true)
    try {
      const res = await fetch('/api/admin/groups', {
        method: 'PATCH',
        headers: adminHeaders(),
        body: JSON.stringify({
          id: editGroupForm.id,
          type: editGroupForm.type,
          teacherId: editGroupForm.teacherId,
          days: editGroupForm.selectedDays,
          time: timesString,
          notes: editGroupForm.notes
        })
      })
      if (res.ok) {
        setShowEditGroupModal(false)
        alert('✅ Horario/Grupo actualizado exitosamente')
        loadGroups()
      } else {
        const data = await res.json()
        alert(data.error || 'Error al actualizar grupo')
      }
    } finally {
      setEditGroupLoading(false)
    }
  }

  const openEditGroup = (group: any) => {
    const timesArray = typeof group.time === 'string' ? group.time.split(',').map((t: string) => t.trim()) : []
    const timesMap: Record<string, string> = {}
    if (Array.isArray(group.days)) {
      group.days.forEach((day: string, idx: number) => {
        timesMap[day] = timesArray[idx] || timesArray[0] || ''
      })
    }

    setEditGroupForm({
      id: group.id,
      type: group.type,
      studentIds: group.studentIds || [],
      teacherId: group.teacherId || '',
      notes: group.notes || '',
      selectedDays: group.days || [],
      selectedTimes: timesMap
    })
    setShowEditGroupModal(true)
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
    const activeTeachers = teachers.filter(t => (t.status || 'Active') === 'Active')
    if (selectedStudentsData.length === 0) return activeTeachers

    const studentInterests = Array.from(
      new Set(
        selectedStudentsData.flatMap(s => {
          const rawInterests = s.interests as any
          if (Array.isArray(rawInterests)) return rawInterests
          if (typeof rawInterests === 'string' && rawInterests) {
            return rawInterests.split(',').map((x: string) => x.trim())
          }
          return []
        })
      )
    )

    return [...activeTeachers].sort((a, b) => {
        const aSlots = getMatchingSlots(selectedStudentsData, a).length
        const bSlots = getMatchingSlots(selectedStudentsData, b).length
        if (bSlots !== aSlots) return bSlots - aSlots

        const rawASpecs = a.specialty as any
        const aSpecs: string[] = Array.isArray(rawASpecs) 
          ? rawASpecs 
          : (typeof rawASpecs === 'string' && rawASpecs ? rawASpecs.split(',').map((x: string) => x.trim()) : [])

        const rawBSpecs = b.specialty as any
        const bSpecs: string[] = Array.isArray(rawBSpecs) 
          ? rawBSpecs 
          : (typeof rawBSpecs === 'string' && rawBSpecs ? rawBSpecs.split(',').map((x: string) => x.trim()) : [])

        const aMatch = aSpecs.filter((x: string) => studentInterests.includes(x)).length
        const bMatch = bSpecs.filter((x: string) => studentInterests.includes(x)).length
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
            {/* 1. Visión General */}
            <button 
              className={`${styles.navItem} ${tab === 'overview' ? styles.navItemActive : ''}`}
              onClick={() => setTab('overview')}
            >
              <span className={styles.navIcon}>📥</span>
              <span>Visión General</span>
            </button>

            {/* 2. Directorio (Collapsible) */}
            <div>
              <button 
                className={styles.navItem}
                onClick={() => setIsDirectoryExpanded(!isDirectoryExpanded)}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className={styles.navIcon}>👥</span>
                  <span style={{ fontWeight: 600 }}>Directorio</span>
                </div>
                <span className={`${styles.categoryArrow} ${isDirectoryExpanded ? styles.categoryArrowExpanded : ''}`}>▶</span>
              </button>
              {isDirectoryExpanded && (
                <div className={styles.subNavContainer}>
                  <button 
                    className={`${styles.subNavItem} ${tab === 'students' ? styles.subNavItemActive : ''}`}
                    onClick={() => setTab('students')}
                  >
                    <span className={styles.navIcon}>👩‍🎓</span>
                    <span>Alumnos</span>
                  </button>
                  <button 
                    className={`${styles.subNavItem} ${tab === 'teachers' ? styles.subNavItemActive : ''}`}
                    onClick={() => setTab('teachers')}
                  >
                    <span className={styles.navIcon}>👨‍🏫</span>
                    <span>Profesores</span>
                  </button>
                </div>
              )}
            </div>

            {/* 3. Agenda & Clases */}
            <button 
              className={`${styles.navItem} ${tab === 'groups' ? styles.navItemActive : ''}`}
              onClick={() => setTab('groups')}
            >
              <span className={styles.navIcon}>📅</span>
              <span>Agenda & Clases</span>
            </button>

            {/* 4. Contenido & Studio (Collapsible) */}
            <div>
              <button 
                className={styles.navItem}
                onClick={() => setIsContentExpanded(!isContentExpanded)}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className={styles.navIcon}>🎬</span>
                  <span style={{ fontWeight: 600 }}>Contenido & Studio</span>
                </div>
                <span className={`${styles.categoryArrow} ${isContentExpanded ? styles.categoryArrowExpanded : ''}`}>▶</span>
              </button>
              {isContentExpanded && (
                <div className={styles.subNavContainer}>
                  <button 
                    className={`${styles.subNavItem} ${tab === 'videobank' ? styles.subNavItemActive : ''}`}
                    onClick={() => setTab('videobank')}
                  >
                    <span className={styles.navIcon}>📹</span>
                    <span>Video Bank</span>
                  </button>
                  <button 
                    className={`${styles.subNavItem} ${tab === 'scene_studio' ? styles.subNavItemActive : ''}`}
                    onClick={() => setTab('scene_studio')}
                  >
                    <span className={styles.navIcon}>🔍</span>
                    <span>Studio Escenas</span>
                  </button>
                  <button 
                    className={styles.subNavItem}
                    onClick={() => router.push('/series-companion')}
                  >
                    <span className={styles.navIcon}>📺</span>
                    <span>Series Master</span>
                  </button>
                  <button 
                    className={styles.subNavItem}
                    onClick={() => router.push('/admin/story-studio')}
                  >
                    <span className={styles.navIcon}>📖</span>
                    <span>Story Studio</span>
                  </button>
                </div>
              )}
            </div>
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

                  {/* ═══ SECRETARY PENDING INBOX ═══ */}
                  {(() => {
                    const pendingTeachers = teachers.filter(t => t.status === 'Pending')
                    const pendingStudents = students.filter(s => s.status === 'Pending')
                    const ssAlertTeachers = teachers.filter(t => {
                      const ss = getSSStatus(t.ssExpiryDate)
                      return ss.label.startsWith('Sin SS') || ss.label.startsWith('Vencida') || ss.label.startsWith('Vence en')
                    })
                    const pendingSeries = seriesRequests.filter(r => r.status === 'Pending')
                    const totalPending = pendingTeachers.length + pendingStudents.length + ssAlertTeachers.length + pendingSeries.length

                    return (
                      <div className={styles.pendingSection}>
                        <div className={styles.pendingHeader}>
                          <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', margin: 0 }}>
                            <span>📥</span> Bandeja de Pendientes del Secretario
                            {totalPending > 0 && <span className={styles.pendingBadge}>{totalPending}</span>}
                          </h2>
                          <div className={styles.pendingFilters}>
                            <button className={`${styles.filterChip} ${pendingFilter === 'all' ? styles.filterChipActive : ''}`} onClick={() => setPendingFilter('all')}>
                              Todos ({totalPending})
                            </button>
                            <button className={`${styles.filterChip} ${pendingFilter === 'teachers' ? styles.filterChipActive : ''}`} onClick={() => setPendingFilter('teachers')}>
                              👨‍🏫 Profesores ({pendingTeachers.length})
                            </button>
                            <button className={`${styles.filterChip} ${pendingFilter === 'students' ? styles.filterChipActive : ''}`} onClick={() => setPendingFilter('students')}>
                              👩‍🎓 Alumnos ({pendingStudents.length})
                            </button>
                            <button className={`${styles.filterChip} ${pendingFilter === 'ss' ? styles.filterChipActive : ''}`} onClick={() => setPendingFilter('ss')}>
                              ⚠️ SS Docs ({ssAlertTeachers.length})
                            </button>
                            <button className={`${styles.filterChip} ${pendingFilter === 'series' ? styles.filterChipActive : ''}`} onClick={() => setPendingFilter('series')}>
                              📺 Series ({pendingSeries.length})
                            </button>
                          </div>
                        </div>

                        {totalPending === 0 ? (
                          <div className={styles.emptyPending}>
                            <span>🎉</span>
                            <h3>¡Todo al día! No hay pendientes operativos en este momento.</h3>
                          </div>
                        ) : (
                          <div className={styles.pendingGrid}>
                            {/* Pending Teachers Cards */}
                            {(pendingFilter === 'all' || pendingFilter === 'teachers') && pendingTeachers.map(t => (
                              <div key={t.id} className={`${styles.pendingCard} ${styles.pendingCardAmber}`}>
                                <div className={styles.pendingCardTop}>
                                  <span className={styles.pendingTag}>👨‍🏫 Profesor Pendiente</span>
                                  <span className={styles.pendingTime}>{t.timezone || 'América/Bogotá'}</span>
                                </div>
                                <h4 className={styles.pendingTitle}>{t.name}</h4>
                                <p className={styles.pendingSub}>{t.email} {t.phone ? `· ${t.phone}` : ''}</p>
                                <div className={styles.pendingActions}>
                                  <button className={styles.actionBtnPrimary} onClick={() => changeTeacherStatus(t, 'Active')}>
                                    ✅ Aprobar
                                  </button>
                                  <button className={styles.actionBtnSecondary} onClick={() => openEditTeacher(t)}>
                                    ✏️ Editar
                                  </button>
                                  {t.phone && (
                                    <button className={styles.actionBtnWa} onClick={() => openWhatsApp(t.phone, `Hola ${t.name}, tu registro como profesor en LinguaLife ha sido aprobado. ¡Bienvenido!`)}>
                                      💬 WhatsApp
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}

                            {/* Pending Students Cards */}
                            {(pendingFilter === 'all' || pendingFilter === 'students') && pendingStudents.map(s => (
                              <div key={s.id} className={`${styles.pendingCard} ${styles.pendingCardBlue}`}>
                                <div className={styles.pendingCardTop}>
                                  <span className={styles.pendingTag}>👩‍🎓 Alumno Sin Profesor</span>
                                  <span className={styles.pendingTime}>{s.timezone || 'América/Bogotá'}</span>
                                </div>
                                <h4 className={styles.pendingTitle}>{s.name}</h4>
                                <p className={styles.pendingSub}>{s.email} {s.interests ? `· ${Array.isArray(s.interests) ? s.interests.join(' · ') : s.interests}` : ''}</p>
                                <div className={styles.pendingActions}>
                                  <button className={styles.actionBtnPrimary} onClick={() => { setLinkForm({ studentIds: [s.id], teacherId: '', notes: '', selectedDays: [], selectedTimes: {} }); setShowLinkModal(true); }}>
                                    🔗 Asignar Profesor
                                  </button>
                                  <button className={styles.actionBtnSecondary} onClick={() => openEditStudent(s)}>
                                    ✏️ Editar
                                  </button>
                                  {s.phone && (
                                    <button className={styles.actionBtnWa} onClick={() => openWhatsApp(s.phone, `Hola ${s.name}, tu inscripción a LinguaLife está confirmada. Pronto te asignaremos profesor.`)}>
                                      💬 WhatsApp
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}

                            {/* SS Alert Teachers Cards */}
                            {(pendingFilter === 'all' || pendingFilter === 'ss') && ssAlertTeachers.map(t => {
                              const ss = getSSStatus(t.ssExpiryDate)
                              return (
                                <div key={`ss-${t.id}`} className={`${styles.pendingCard} ${styles.pendingCardRed}`}>
                                  <div className={styles.pendingCardTop}>
                                    <span className={styles.pendingTag}>⚠️ Seguridad Social</span>
                                    <span className={styles.pendingTime} style={{ color: ss.color }}>{ss.label}</span>
                                  </div>
                                  <h4 className={styles.pendingTitle}>{t.name}</h4>
                                  <p className={styles.pendingSub}>Documento SS: {t.ssExpiryDate ? `Vence: ${t.ssExpiryDate}` : 'Sin soporte cargado'}</p>
                                  <div className={styles.pendingActions}>
                                    {t.ssDocumentUrl && (
                                      <button className={styles.actionBtnSecondary} onClick={() => window.open(t.ssDocumentUrl!, '_blank')}>
                                        📄 Ver Doc
                                      </button>
                                    )}
                                    <button className={styles.actionBtnSecondary} onClick={() => openEditTeacher(t)}>
                                      ✏️ Actualizar SS
                                    </button>
                                    {t.phone && (
                                      <button className={styles.actionBtnWa} onClick={() => openWhatsApp(t.phone, `Hola ${t.name}, te recordamos actualizar tu documento de Seguridad Social en LinguaLife.`)}>
                                        💬 WhatsApp
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )
                            })}

                            {/* Series Requests Cards */}
                            {(pendingFilter === 'all' || pendingFilter === 'series') && pendingSeries.map(r => (
                              <div key={r.id} className={`${styles.pendingCard} ${styles.pendingCardPurple}`}>
                                <div className={styles.pendingCardTop}>
                                  <span className={styles.pendingTag}>📺 Solicitud de Serie</span>
                                  <span className={styles.pendingTime}>{r.date && !isNaN(new Date(r.date).getTime()) ? new Date(r.date).toLocaleDateString('es-CO') : 'Reciente'}</span>
                                </div>
                                <h4 className={styles.pendingTitle}>{r.studentName}</h4>
                                <p className={styles.pendingSub}>Serie deseada: <strong>{r.seriesName}</strong></p>
                                <div className={styles.pendingActions}>
                                  <button className={styles.actionBtnPrimary} onClick={() => router.push('/series-companion')}>
                                    🎬 Ir a Series Master
                                  </button>
                                  {r.whatsapp && (
                                    <button className={styles.actionBtnWa} onClick={() => openWhatsApp(r.whatsapp, `Hola ${r.studentName}, estamos procesando tu solicitud para la serie ${r.seriesName}.`)}>
                                      💬 WhatsApp
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })()}
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
                  <button className={styles.addBtn} onClick={openCreateStudent}>+ Nuevo Alumno</button>
                  <button className={styles.addBtnSecondary} onClick={() => { setLinkForm({ studentIds: [], teacherId: '', notes: '', selectedDays: [], selectedTimes: {} }); setShowLinkModal(true); }}>🔗 Vincular Grupo</button>
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
                        <th>Saldo Clases</th>
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
                            <span style={{ fontWeight: 'bold', color: s.classesRemaining <= 2 ? '#ef4444' : '#10b981' }}>{s.classesRemaining}</span>
                          </td>
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
                            <button 
                              className={styles.editBtn} 
                              style={{ marginLeft: '0.5rem', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', borderColor: 'rgba(59,130,246,0.2)' }} 
                              onClick={() => { setLinkForm({ studentIds: [s.id], teacherId: '', notes: '', selectedDays: [], selectedTimes: {} }); setShowLinkModal(true); }}
                            >
                              🔗 Asignar
                            </button>
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

          {/* ═══ AGENDA & CLASES TAB ═══ */}
          {tab === 'groups' && (
            <div className={styles.tabContent}>
              <div className={styles.pageHeader}>
                <div>
                  <h1 className={styles.pageTitle}>Agenda & Clases Activas <span className={styles.countBadge}>{acquaintanceGroups.length}</span></h1>
                  <p style={{ fontSize: '0.85rem', opacity: 0.6, marginTop: '0.2rem' }}>
                    Gestión centralizada de horarios para clases individuales 1-a-1 y parejas/grupos familiares
                  </p>
                </div>
                <button 
                  className={styles.addBtn} 
                  onClick={() => { setLinkForm({ studentIds: [], teacherId: '', notes: '', selectedDays: [], selectedTimes: {} }); setShowLinkModal(true); }}
                >
                  🔗 + Asignar Clase / Pareja / Familia
                </button>
              </div>

              {/* Class Type Filter Tabs */}
              <div className={styles.filterRow} style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    className={`${styles.filterChip} ${scheduleFilter === 'all' ? styles.filterChipActive : ''}`} 
                    onClick={() => setScheduleFilter('all')}
                  >
                    Todas las Clases ({acquaintanceGroups.length})
                  </button>
                  <button 
                    className={`${styles.filterChip} ${scheduleFilter === 'individual' ? styles.filterChipActive : ''}`} 
                    onClick={() => setScheduleFilter('individual')}
                  >
                    👤 1-a-1 Individuales ({acquaintanceGroups.filter(g => g.studentIds.length === 1).length})
                  </button>
                  <button 
                    className={`${styles.filterChip} ${scheduleFilter === 'group' ? styles.filterChipActive : ''}`} 
                    onClick={() => setScheduleFilter('group')}
                  >
                    👥 Pareja / Grupo Familiar ({acquaintanceGroups.filter(g => g.studentIds.length > 1).length})
                  </button>
                </div>
              </div>

              {groupsLoading && <div className="spinner" />}

              {!groupsLoading && (
                <div className={styles.tableWrap}>
                  <table className={styles.dataTable}>
                    <thead>
                      <tr>
                        <th>Tipo</th>
                        <th>Alumno(s) Vinculado(s)</th>
                        <th>Profesor Asignado</th>
                        <th>Horarios Recurrentes</th>
                        <th>Notas Internas</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {acquaintanceGroups
                        .filter(g => {
                          if (scheduleFilter === 'individual') return g.studentIds.length === 1
                          if (scheduleFilter === 'group') return g.studentIds.length > 1
                          return true
                        })
                        .length === 0 && (
                          <tr>
                            <td colSpan={6} className={styles.emptyRow}>
                              No hay clases registradas en esta categoría.
                            </td>
                          </tr>
                        )}
                      {acquaintanceGroups
                        .filter(g => {
                          if (scheduleFilter === 'individual') return g.studentIds.length === 1
                          if (scheduleFilter === 'group') return g.studentIds.length > 1
                          return true
                        })
                        .map(g => {
                          const isIndividual = g.studentIds.length === 1
                          return (
                            <tr key={g.id} className={styles.tableRow}>
                              <td>
                                {isIndividual ? (
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.65rem', borderRadius: '6px', background: 'rgba(59, 130, 246, 0.12)', color: '#60a5fa', fontSize: '0.75rem', fontWeight: 600, border: '1px solid rgba(59, 130, 246, 0.25)' }}>
                                    👤 1-a-1 Individual
                                  </span>
                                ) : (
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.65rem', borderRadius: '6px', background: 'rgba(168, 85, 247, 0.12)', color: '#c084fc', fontSize: '0.75rem', fontWeight: 600, border: '1px solid rgba(168, 85, 247, 0.25)' }}>
                                    👥 Pareja / Familia ({g.studentIds.length})
                                  </span>
                                )}
                              </td>
                              <td>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                  {g.studentIds.map((sid: string) => {
                                      const s = students.find(x => x.id === sid)
                                      return (
                                        <div key={sid} style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                                          👤 {s?.name || 'Cargando...'}
                                          {g.studentIds.length > 1 && (
                                            <button 
                                              onClick={() => deleteGroup(g.id, 'conocidos', sid)} 
                                              style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginLeft: 'auto' }}
                                              title="Remover de esta pareja/grupo"
                                            >✕</button>
                                          )}
                                        </div>
                                      )
                                  })}
                                </div>
                              </td>
                              <td>{teachers.find(t => t.id === g.teacherId)?.name || '—'}</td>
                              <td>
                                <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                                  {(() => {
                                    const timesArray = typeof g.time === 'string' ? g.time.split(',').map((t: string) => t.trim()) : []
                                    if (Array.isArray(g.days) && g.days.length > 0) {
                                      return g.days.map((day: string, idx: number) => (
                                        <div key={day}>
                                          📅 <strong>{day}</strong>: {timesArray[idx] || timesArray[0] || 'Sin hora'}
                                        </div>
                                      ))
                                    }
                                    return <div style={{ opacity: 0.5 }}>Sin horario</div>
                                  })()}
                                </div>
                              </td>
                              <td style={{ maxWidth: '150px', whiteSpace: 'normal', fontSize: '0.75rem', opacity: 0.7 }}>{g.notes || '—'}</td>
                              <td>
                                <button className={styles.editBtn} onClick={() => openEditGroup(g)}>✏️ Editar Horario</button>
                                <button className={styles.editBtn} style={{ marginLeft: '0.5rem', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }} onClick={() => deleteGroup(g.id, 'conocidos')}>🗑️ Eliminar</button>
                              </td>
                            </tr>
                          )
                        })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ═══ SCENE STUDIO TAB ═══ */}
          {tab === 'scene_studio' && (
            <div className={styles.tabContent}>
              <SceneStudioTab />
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
              <span>🔗 Asignar Clase (1-a-1 o Pareja / Grupo Familiar)</span>
              <button className={styles.modalClose} onClick={() => setShowLinkModal(false)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className={styles.fieldLabel}>Alumnos Vinculados (Máx 3)</span>
                {linkForm.studentIds.length === 1 && (
                  <span style={{ fontSize: '0.75rem', color: '#60a5fa', fontWeight: 600, background: 'rgba(59, 130, 246, 0.15)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                    👤 Clase Individual 1-a-1
                  </span>
                )}
                {linkForm.studentIds.length > 1 && (
                  <span style={{ fontSize: '0.75rem', color: '#c084fc', fontWeight: 600, background: 'rgba(168, 85, 247, 0.15)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                    👥 Pareja / Grupo Familiar ({linkForm.studentIds.length} pers)
                  </span>
                )}
              </div>
              <div style={{ 
                maxHeight: '180px', 
                overflowY: 'auto', 
                background: 'rgba(0,0,0,0.2)', 
                borderRadius: '10px', 
                border: '1px solid rgba(255,255,255,0.05)',
                padding: '0.5rem'
              }}>
                {students.map(s => (
                  <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', cursor: 'pointer', borderRadius: '6px', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    <input 
                      type="checkbox" 
                      checked={linkForm.studentIds.includes(s.id)}
                      onChange={() => toggleStudentInLink(s.id)}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.85rem' }}>{s.name} {s.status === 'Pending' ? ' (Pendiente)' : ''}</span>
                        <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>
                          {s.interests 
                            ? (Array.isArray(s.interests) ? s.interests.join(' · ') : s.interests) 
                            : 'Sin intereses registrados'}
                        </span>
                    </div>
                  </label>
                ))}
                {students.length === 0 && <div style={{ opacity: 0.5, fontSize: '0.8rem', textAlign: 'center', padding: '1rem' }}>No hay alumnos registrados.</div>}
              </div>

              <label className={styles.fieldLabel} style={{ marginTop: '0.5rem' }}>Profesor Compatible (Ordenados por afinidad)</label>
              <select 
                className={styles.fieldInput} 
                value={linkForm.teacherId} 
                onChange={e => handleTeacherChangeInLink(e.target.value)}
                disabled={linkForm.studentIds.length === 0}
              >
                <option value="">{linkForm.studentIds.length === 0 ? 'Selecciona alumnos primero...' : 'Selecciona un profesor compatible...'}</option>
                {getSortedTeachers().map(t => {
                  const selectedStudentsData = students.filter(s => linkForm.studentIds.includes(s.id))
                  const studentInterests = Array.from(
                    new Set(
                      selectedStudentsData.flatMap(s => {
                        const rawInterests = s.interests as any
                        if (Array.isArray(rawInterests)) return rawInterests
                        if (typeof rawInterests === 'string' && rawInterests) {
                          return rawInterests.split(',').map((x: string) => x.trim())
                        }
                        return []
                      })
                    )
                  )
                  const slots = getMatchingSlots(selectedStudentsData, t).length
                  const rawSpecs = t.specialty as any
                  const tSpecs = Array.isArray(rawSpecs) 
                    ? rawSpecs 
                    : (typeof rawSpecs === 'string' && rawSpecs ? rawSpecs.split(',').map((x: string) => x.trim()) : [])
                  const matchCount = tSpecs.filter((x: string) => studentInterests.includes(x)).length

                  const availabilityText = slots > 0 ? `Coincide en ${slots} horario${slots > 1 ? 's' : ''}` : 'Sin coincidencia horaria'
                  const affinityText = matchCount > 0 ? `· ${matchCount} gusto${matchCount > 1 ? 's' : ''} en común` : '· Sin gustos en común'

                  return (
                    <option key={t.id} value={t.id} style={{ background: '#121218', color: '#fff' }}>
                      {t.name} — {availabilityText} {affinityText}
                    </option>
                  )
                })}
              </select>

              {linkForm.teacherId && (
                <>
                  <label className={styles.fieldLabel} style={{ marginTop: '0.75rem' }}>Días de Recurrencia (Selecciona máx. 2)</label>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                    {DAYS.map(d => {
                      const isChecked = linkForm.selectedDays.includes(d)
                      return (
                        <label key={d} style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.25rem', 
                          padding: '0.35rem 0.65rem', 
                          borderRadius: '6px', 
                          background: isChecked ? 'rgba(124, 58, 237, 0.2)' : 'rgba(255,255,255,0.03)',
                          border: isChecked ? '1px solid rgba(124, 58, 237, 0.4)' : '1px solid rgba(255,255,255,0.05)',
                          cursor: 'pointer',
                          fontSize: '0.8rem'
                        }}>
                          <input 
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              setLinkForm(prev => {
                                const exist = prev.selectedDays.includes(d)
                                const next = exist 
                                  ? prev.selectedDays.filter(x => x !== d) 
                                  : [...prev.selectedDays, d].slice(0, 2)
                                return { ...prev, selectedDays: next }
                              })
                            }}
                            style={{ display: 'none' }}
                          />
                          {d}
                        </label>
                      )
                    })}
                  </div>

                  {linkForm.selectedDays.map(day => (
                    <div key={day} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.5rem' }}>
                      <label className={styles.fieldLabel}>Hora para el {day}</label>
                      <select
                        className={styles.fieldInput}
                        value={linkForm.selectedTimes?.[day] || ''}
                        onChange={e => {
                          setLinkForm(prev => ({
                            ...prev,
                            selectedTimes: {
                              ...(prev.selectedTimes || {}),
                              [day]: e.target.value
                            }
                          }))
                        }}
                      >
                        <option value="">Selecciona hora para {day}...</option>
                        {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </div>
                  ))}
                </>
              )}
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
              <button className={styles.cancelBtn} onClick={() => { setShowLinkModal(false); setLinkForm({ studentIds: [], teacherId: '', notes: '', selectedDays: [], selectedTimes: {} }) }}>Cancelar</button>
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

      {showEditGroupModal && (
        <div className={styles.modalOverlay} onClick={() => setShowEditGroupModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span>✏️ Editar Horario / Grupo</span>
              <button className={styles.modalClose} onClick={() => setShowEditGroupModal(false)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <label className={styles.fieldLabel}>Alumnos Vinculados</label>
              <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                {editGroupForm.studentIds.map(sid => {
                  const s = students.find(x => x.id === sid)
                  return <div key={sid}>• {s?.name || 'Alumno'}</div>
                })}
              </div>

              <label className={styles.fieldLabel}>Profesor Asignado</label>
              <select 
                className={styles.fieldInput} 
                value={editGroupForm.teacherId} 
                onChange={e => setEditGroupForm({ ...editGroupForm, teacherId: e.target.value })}
              >
                <option value="">Selecciona profesor...</option>
                {teachers.filter(t => t.status === 'Active').map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>

              <label className={styles.fieldLabel} style={{ marginTop: '0.75rem' }}>Días de Recurrencia (Selecciona máx. 2)</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                {DAYS.map(d => {
                  const isChecked = editGroupForm.selectedDays.includes(d)
                  return (
                    <label key={d} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.25rem', 
                      padding: '0.35rem 0.65rem', 
                      borderRadius: '6px', 
                      background: isChecked ? 'rgba(124, 58, 237, 0.2)' : 'rgba(255,255,255,0.03)',
                      border: isChecked ? '1px solid rgba(124, 58, 237, 0.4)' : '1px solid rgba(255,255,255,0.05)',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}>
                      <input 
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          setEditGroupForm(prev => {
                            const exist = prev.selectedDays.includes(d)
                            const next = exist 
                              ? prev.selectedDays.filter(x => x !== d) 
                              : [...prev.selectedDays, d].slice(0, 2)
                            return { ...prev, selectedDays: next }
                          })
                        }}
                        style={{ display: 'none' }}
                      />
                      {d}
                    </label>
                  )
                })}
              </div>

              {editGroupForm.selectedDays.map(day => (
                <div key={day} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.5rem' }}>
                  <label className={styles.fieldLabel}>Hora para el {day}</label>
                  <select
                    className={styles.fieldInput}
                    value={editGroupForm.selectedTimes?.[day] || ''}
                    onChange={e => {
                      setEditGroupForm(prev => ({
                        ...prev,
                        selectedTimes: {
                          ...(prev.selectedTimes || {}),
                          [day]: e.target.value
                        }
                      }))
                    }}
                  >
                    <option value="">Selecciona hora para {day}...</option>
                    {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              ))}

              <label className={styles.fieldLabel} style={{ marginTop: '0.75rem' }}>Notas</label>
              <textarea 
                className={styles.fieldTextarea} 
                value={editGroupForm.notes} 
                onChange={e => setEditGroupForm({ ...editGroupForm, notes: e.target.value })} 
                placeholder="Ej: Modificaciones hechas por el secretario..." 
                rows={2} 
              />
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setShowEditGroupModal(false)}>Cancelar</button>
              <button 
                className={styles.submitBtn} 
                onClick={submitEditGroupForm} 
                disabled={editGroupLoading || !editGroupForm.teacherId}
              >
                {editGroupLoading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
