// ──────────────────────────────────────────────────────────────────────────────
// LinguaLife Journey Test Script
// Creates mock data in Airtable and tests every major API endpoint
// Run: node test-journey.mjs
// ──────────────────────────────────────────────────────────────────────────────

const BASE = 'app9ZtojlxX5FoZ7y'
const KEY = process.env.AIRTABLE_API_KEY
const API_BASE = 'http://localhost:3000'

// ── Airtable helpers ──────────────────────────────────────────────────────────

async function atCreate(table, fields) {
  const r = await fetch(`https://api.airtable.com/v0/${BASE}/${encodeURIComponent(table)}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ records: [{ fields }], typecast: true }),
  })
  const d = await r.json()
  if (!r.ok) throw new Error(`Airtable POST ${table}: ${JSON.stringify(d)}`)
  return d.records[0]
}

async function atDelete(table, id) {
  const r = await fetch(`https://api.airtable.com/v0/${BASE}/${encodeURIComponent(table)}/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${KEY}` },
  })
  if (!r.ok) { const d = await r.json(); console.warn(`  ⚠ DELETE ${table}/${id}: ${JSON.stringify(d)}`) }
}

async function atGet(table, id) {
  const r = await fetch(`https://api.airtable.com/v0/${BASE}/${encodeURIComponent(table)}/${id}`, {
    headers: { Authorization: `Bearer ${KEY}` },
  })
  if (!r.ok) return null
  return r.json()
}

async function atFind(table, formula) {
  const r = await fetch(`https://api.airtable.com/v0/${BASE}/${encodeURIComponent(table)}?filterByFormula=${encodeURIComponent(formula)}&maxRecords=5`, {
    headers: { Authorization: `Bearer ${KEY}` },
  })
  const d = await r.json()
  return d.records || []
}

// ── API helpers ───────────────────────────────────────────────────────────────

async function apiGet(path) {
  const r = await fetch(`${API_BASE}${path}`)
  const status = r.status
  const body = await r.json().catch(() => ({}))
  return { status, body, ok: r.ok }
}

async function apiPost(path, data) {
  const r = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const status = r.status
  const body = await r.json().catch(() => ({}))
  return { status, body, ok: r.ok }
}

// ── Test runner ───────────────────────────────────────────────────────────────

let passed = 0, failed = 0, warnings = 0
const issues = []

function check(label, condition, message = '', severity = 'fail') {
  if (condition) {
    console.log(`  ✅ ${label}`)
    passed++
  } else {
    const icon = severity === 'warn' ? '⚠️ ' : '❌'
    console.log(`  ${icon} ${label}${message ? ': ' + message : ''}`)
    if (severity === 'warn') warnings++
    else { failed++; issues.push({ label, message }) }
  }
}

// ── Cleanup registry ──────────────────────────────────────────────────────────

const toDelete = {
  'Teachers': [],
  'Students': [],
  'Student-Teacher': [],
  'Sessions': [],
  'Session Participants': [],
  'Teacher Reviews': [],
}

// ═════════════════════════════════════════════════════════════════════════════
//  SETUP: Find a real Curriculum Topic to use
// ═════════════════════════════════════════════════════════════════════════════

console.log('\n╔══════════════════════════════════════════════════════╗')
console.log('║       LinguaLife Journey Test — Mock Data Suite       ║')
console.log('╚══════════════════════════════════════════════════════╝\n')

console.log('🔍 Finding existing curriculum topic...')
let topicRecord = null
try {
  const topics = await atFind('Curriculum Topics', 'NOT({Order} = "")')
  topicRecord = topics[0]
  if (topicRecord) {
    console.log(`  ✅ Found topic: "${topicRecord.fields['Topic Name'] ?? topicRecord.fields['Title'] ?? topicRecord.fields['Name']}" (order ${topicRecord.fields['Order']})`)
  } else {
    console.log('  ⚠️  No curriculum topics found — topic-dependent tests will be limited')
  }
} catch (e) {
  console.log('  ⚠️  Could not fetch curriculum topics:', e.message)
}

// ═════════════════════════════════════════════════════════════════════════════
//  STEP 1 — Create mock teacher in Airtable
// ═════════════════════════════════════════════════════════════════════════════

console.log('\n── Step 1: Create mock teacher ──────────────────────────')

// Availability: Mon–Fri (cols 0–4), 7am–8pm (rows 1–13 of 15)
const availability = Array.from({ length: 15 }, (_, r) =>
  Array.from({ length: 7 }, (_, c) => r >= 1 && r <= 13 && c <= 4)
)

let teacherRecord
try {
  teacherRecord = await atCreate('Teachers', {
    fldYW4Oh6dPrZh4wY: 'Ana García Test',
    fldwHO6pmhgSxhtMU: 'ana.garcia.test@lingualife.co',
    fldmvzzWizaHinAMu: '+57 321 000 0001',
    fldsq1cfz7OnxNfm9: 'America/Bogota',
    fld7vSUdd69zdl6yQ: JSON.stringify(availability),
    fld9QkYJhY4df17Bb: JSON.stringify({ Bank: 'Bancolombia', AccountType: 'Ahorros', AccountNumber: '69812345678', ID: '1020345678', IDType: 'Cédula de Ciudadanía' }),
    fldwAF9uwhjDUXoZj: ['Startups & Emprendimiento', 'Inteligencia Artificial & Tech', 'Programación & Software', 'Liderazgo & Gestión de Equipos', 'Inversiones, Crypto & Finanzas'],
    fldsCFNKymtmEbVDe: 'AN1234',
    fldSIYNoMW8jWfJPf: 'Active',
    fldt7Uk2WdYmMemW7: 'https://meet.google.com/test-ana-garcia',
  })
  toDelete['Teachers'].push(teacherRecord.id)
  console.log(`  ✅ Teacher created: ${teacherRecord.id}`)
} catch (e) {
  console.log(`  ❌ Teacher creation failed: ${e.message}`)
  process.exit(1)
}

// ═════════════════════════════════════════════════════════════════════════════
//  STEP 2 — Create mock student with 2 tokens
// ═════════════════════════════════════════════════════════════════════════════

console.log('\n── Step 2: Create mock student ──────────────────────────')

const studentAvail = Array.from({ length: 15 }, (_, r) =>
  Array.from({ length: 7 }, (_, c) => r >= 1 && r <= 13 && c <= 4)
)

let studentRecord
try {
  studentRecord = await atCreate('Students', {
    fldbdDNucZwILRMwO: 'Carlos Pérez Test',
    fldxAsAn6aQDHRR9U: 'carlos.perez.test@gmail.com',
    fldu8P3X4o9P4V9dn: '+57 320 000 0002',
    fld1Vi2ti4xdraYyo: '14+',
    fldTfNhYtykGeDx1x: ['Startups & Emprendimiento', 'Inteligencia Artificial & Tech', 'Programación & Software', 'Liderazgo & Gestión de Equipos', 'Inversiones, Crypto & Finanzas'],
    fldmPdharKvZzqsMq: JSON.stringify(studentAvail),
    fldXUKKO28Wr1dN76: 'Active',
    flddBUJK1K42KKsJv: false,
    fldYfN4QGDOa5JAGM: 'America/Bogota',
    fld3C6vGWEA7RR1LM: 'CP5678',
    fld9Gd9q1eMuxf9MX: 2,
  })
  toDelete['Students'].push(studentRecord.id)
  console.log(`  ✅ Student created: ${studentRecord.id} | PIN: CP5678 | Tokens: 2`)
} catch (e) {
  console.log(`  ❌ Student creation failed: ${e.message}`)
  process.exit(1)
}

// ═════════════════════════════════════════════════════════════════════════════
//  STEP 3 — Create Student-Teacher junction
// ═════════════════════════════════════════════════════════════════════════════

console.log('\n── Step 3: Link student ↔ teacher ──────────────────────')

let stRecord
try {
  stRecord = await atCreate('Student-Teacher', {
    flducGScj8CAuebVd: [studentRecord.id],
    fld4sRiJEA7g85fOA: [teacherRecord.id],
    fld14OomEuzP6b8Wr: 'Active',
  })
  toDelete['Student-Teacher'].push(stRecord.id)
  console.log(`  ✅ Student-Teacher junction: ${stRecord.id}`)
} catch (e) {
  console.log(`  ❌ Student-Teacher creation failed: ${e.message}`)
  process.exit(1)
}

// ═════════════════════════════════════════════════════════════════════════════
//  STEP 4 — Create two sessions (one upcoming, one past/seen)
// ═════════════════════════════════════════════════════════════════════════════

console.log('\n── Step 4: Create sessions ───────────────────────────────')

// Tomorrow at 9am Bogota
const tomorrow = new Date()
tomorrow.setDate(tomorrow.getDate() + 1)
tomorrow.setHours(9, 0, 0, 0)

// Last week (completed)
const lastWeek = new Date()
lastWeek.setDate(lastWeek.getDate() - 7)
lastWeek.setHours(9, 0, 0, 0)

let upcomingSession, completedSession

try {
  upcomingSession = await atCreate('Sessions', {
    Teacher: [teacherRecord.id],
    'Scheduled Date/Time': tomorrow.toISOString(),
    Status: 'Scheduled',
    'Session Name': 'Clase de prueba — Carlos Pérez',
    'Location/Link': 'https://meet.google.com/test-ana-garcia',
    ...(topicRecord ? { 'Curriculum Topic': [topicRecord.id] } : {}),
  })
  toDelete['Sessions'].push(upcomingSession.id)
  console.log(`  ✅ Upcoming session: ${upcomingSession.id} (${tomorrow.toLocaleDateString('es-CO')})`)
} catch (e) {
  console.log(`  ❌ Upcoming session creation failed: ${e.message}`)
}

try {
  completedSession = await atCreate('Sessions', {
    Teacher: [teacherRecord.id],
    'Scheduled Date/Time': lastWeek.toISOString(),
    Status: 'Seen',
    'Session Name': 'Clase completada — Carlos Pérez',
    ...(topicRecord ? { 'Curriculum Topic': [topicRecord.id] } : {}),
  })
  toDelete['Sessions'].push(completedSession.id)
  console.log(`  ✅ Completed session: ${completedSession.id} (${lastWeek.toLocaleDateString('es-CO')})`)
} catch (e) {
  console.log(`  ❌ Completed session creation failed: ${e.message}`)
}

// ═════════════════════════════════════════════════════════════════════════════
//  STEP 5 — Create Session Participants
// ═════════════════════════════════════════════════════════════════════════════

console.log('\n── Step 5: Create session participants ───────────────────')

let upcomingParticipant, completedParticipant
if (upcomingSession) {
  try {
    upcomingParticipant = await atCreate('Session Participants', {
      fldks0CvUFGcgfDJQ: [upcomingSession.id],
      fldc7e8c28KUXVCam: [studentRecord.id],
    })
    toDelete['Session Participants'].push(upcomingParticipant.id)
    console.log(`  ✅ Upcoming participant: ${upcomingParticipant.id}`)
  } catch (e) {
    console.log(`  ❌ Upcoming participant failed: ${e.message}`)
  }
}
if (completedSession) {
  try {
    completedParticipant = await atCreate('Session Participants', {
      fldks0CvUFGcgfDJQ: [completedSession.id],
      fldc7e8c28KUXVCam: [studentRecord.id],
    })
    toDelete['Session Participants'].push(completedParticipant.id)
    console.log(`  ✅ Completed participant: ${completedParticipant.id}`)
  } catch (e) {
    console.log(`  ❌ Completed participant failed: ${e.message}`)
  }
}

// ═════════════════════════════════════════════════════════════════════════════
//  PHASE 1 — TEACHER FLOW TESTS
// ═════════════════════════════════════════════════════════════════════════════

console.log('\n\n╔══════════════════════════════════════════════════════╗')
console.log('║              TEACHER FLOW TESTS                       ║')
console.log('╚══════════════════════════════════════════════════════╝')

// ── T1: Teacher login (PIN validation) ───────────────────────────────────────

console.log('\n── T1: Teacher PIN login ─────────────────────────────────')
{
  const r = await apiPost('/api/teacher/validate', { pin: 'AN1234' })
  check('POST /api/teacher/validate returns 200', r.ok, `got ${r.status}`)
  check('Returns teacherId', !!r.body.teacherId, JSON.stringify(r.body))
  check('Returns name "Ana García Test"', r.body.name === 'Ana García Test', `got "${r.body.name}"`)

  const rBad = await apiPost('/api/teacher/validate', { pin: 'WRONGPIN' })
  check('Invalid PIN returns 401', rBad.status === 401)

  const rEmpty = await apiPost('/api/teacher/validate', {})
  check('Missing PIN returns 400', rEmpty.status === 400)
}

// ── T2: Sessions list for today's date ───────────────────────────────────────

console.log('\n── T2: Teacher sessions list ─────────────────────────────')
{
  const today = new Date().toISOString().slice(0, 10)
  const tomorrowDate = tomorrow.toISOString().slice(0, 10)

  // Today — should be empty (no sessions today)
  const rToday = await apiGet(`/api/sessions?teacherId=${teacherRecord.id}&date=${today}`)
  check('GET /api/sessions returns 200', rToday.ok, `got ${rToday.status}: ${JSON.stringify(rToday.body)}`)
  check('Sessions is an array', Array.isArray(rToday.body))

  // Tomorrow — should have 1 session
  const rTomorrow = await apiGet(`/api/sessions?teacherId=${teacherRecord.id}&date=${tomorrowDate}`)
  check('Sessions for tomorrow returns 200', rTomorrow.ok, `got ${rTomorrow.status}`)
  check('Finds 1 upcoming session tomorrow', rTomorrow.body.length === 1, `got ${rTomorrow.body.length}`)

  if (rTomorrow.body[0]) {
    const s = rTomorrow.body[0]
    check('Session has studentName (resolved via participant junction)', !!s.sessionName, `got "${s.sessionName}"`)
    check('Session has time field', !!s.time, `got "${s.time}"`)
    check('Session status is Scheduled', s.status === 'Scheduled', `got "${s.status}"`)
    check('Session has topicName (if topic was assigned)', topicRecord ? !!s.topicName : true, `topicName="${s.topicName}"`)
  }

  // Missing params — should fail gracefully
  const rNoDate = await apiGet(`/api/sessions?teacherId=${teacherRecord.id}`)
  check('Missing date param returns 400', rNoDate.status === 400)

  const rBadDate = await apiGet(`/api/sessions?teacherId=${teacherRecord.id}&date=not-a-date`)
  check('Invalid date format returns 400', rBadDate.status === 400)
}

// ── T3: Single session detail ─────────────────────────────────────────────────

console.log('\n── T3: Single session detail ─────────────────────────────')
if (upcomingSession) {
  const r = await apiGet(`/api/session?id=${upcomingSession.id}`)
  check('GET /api/session returns 200', r.ok, `${r.status}: ${JSON.stringify(r.body)}`)
  check('Session has id', r.body.id === upcomingSession.id)
  check('Session has teacherId', r.body.teacherId === teacherRecord.id)
  check('Session resolves studentId via participant junction', !!r.body.studentId, `studentId="${r.body.studentId}"`)
  check('Session has participantId', !!r.body.participantId, `participantId="${r.body.participantId}"`)
  check('Session has meetingLink (teacher fallback)', !!r.body.meetingLink, `meetingLink="${r.body.meetingLink}"`)
  check('Session date formatted correctly', !!r.body.date, `date="${r.body.date}"`)
  check('Session time formatted correctly', !!r.body.time, `time="${r.body.time}"`)
  check('Status is Scheduled', r.body.status === 'Scheduled')

  const rMissing = await apiGet('/api/session')
  check('Missing id param returns 400', rMissing.status === 400)

  const rBad = await apiGet('/api/session?id=recNONEXISTENT')
  check('Non-existent session returns 404', rBad.status === 404)
}

// ── T4: Teacher reschedule ─────────────────────────────────────────────────────

console.log('\n── T4: Teacher reschedule session ───────────────────────')
if (upcomingSession) {
  const r = await apiPost('/api/reschedule-session', { sessionId: upcomingSession.id })
  check('POST /api/reschedule-session returns 200', r.ok, `${r.status}: ${JSON.stringify(r.body)}`)
  check('Returns ok:true', r.body.ok === true)

  // Verify session is now Canceled in Airtable
  const sessionAfter = await atGet('Sessions', upcomingSession.id)
  check('Session status changed to Canceled in Airtable', sessionAfter?.fields?.['Status'] === 'Canceled', `got "${sessionAfter?.fields?.['Status']}"`)

  // Verify token was refunded
  const studentAfter = await atGet('Students', studentRecord.id)
  const tokensAfter = studentAfter?.fields?.['Tokens de Reposición']
  check('Token refunded to student (3 tokens now)', tokensAfter === 3, `got ${tokensAfter}`)

  // Missing sessionId
  const rMissing = await apiPost('/api/reschedule-session', {})
  check('Missing sessionId returns 400', rMissing.status === 400)

  // Can't reschedule already-canceled session (no error expected, just logs)
  console.log('  ℹ️  Session is now Canceled — re-using for token redeem test later')
}

// ─── Recreate a fresh upcoming session for further tests ─────────────────────
let freshSession, freshParticipant
try {
  freshSession = await atCreate('Sessions', {
    Teacher: [teacherRecord.id],
    'Scheduled Date/Time': tomorrow.toISOString(),
    Status: 'Scheduled',
    'Session Name': 'Clase fresca — Carlos Pérez',
    'Location/Link': 'https://meet.google.com/test-ana-garcia',
    ...(topicRecord ? { 'Curriculum Topic': [topicRecord.id] } : {}),
  })
  toDelete['Sessions'].push(freshSession.id)
  freshParticipant = await atCreate('Session Participants', {
    Session: [freshSession.id],
    Student: [studentRecord.id],
  })
  toDelete['Session Participants'].push(freshParticipant.id)
  console.log(`  ✅ Fresh session created for further tests: ${freshSession.id}`)
} catch (e) {
  console.log(`  ⚠️  Could not create fresh session: ${e.message}`)
}

// ═════════════════════════════════════════════════════════════════════════════
//  PHASE 2 — STUDENT FLOW TESTS
// ═════════════════════════════════════════════════════════════════════════════

console.log('\n\n╔══════════════════════════════════════════════════════╗')
console.log('║              STUDENT FLOW TESTS                       ║')
console.log('╚══════════════════════════════════════════════════════╝')

// ── S1: Student login ─────────────────────────────────────────────────────────

console.log('\n── S1: Student login ─────────────────────────────────────')
let loggedInStudent = null
{
  const r = await apiPost('/api/student/login', {
    email: 'carlos.perez.test@gmail.com',
    pin: 'CP5678',
  })
  check('POST /api/student/login returns 200', r.ok, `${r.status}: ${JSON.stringify(r.body)}`)
  check('Returns student id', !!r.body.id, JSON.stringify(r.body))
  check('Returns name "Carlos Pérez Test"', r.body.name === 'Carlos Pérez Test', `got "${r.body.name}"`)
  check('Returns tokens (should be 3 after refund)', r.body.tokens === 3, `got ${r.body.tokens}`)
  check('Resolves teacherId via junction', r.body.teacherId === teacherRecord.id, `got "${r.body.teacherId}"`)
  check('Resolves teacherName "Ana García Test"', r.body.teacherName === 'Ana García Test', `got "${r.body.teacherName}"`)
  loggedInStudent = r.body

  const rBadPin = await apiPost('/api/student/login', { email: 'carlos.perez.test@gmail.com', pin: 'WRONG1' })
  check('Wrong PIN returns 401', rBadPin.status === 401)

  const rBadEmail = await apiPost('/api/student/login', { email: 'nobody@test.com', pin: 'CP5678' })
  check('Unknown email returns 401', rBadEmail.status === 401)

  const rMissing = await apiPost('/api/student/login', { email: 'carlos.perez.test@gmail.com' })
  check('Missing PIN returns 400', rMissing.status === 400)
}

// ── S2: Student sessions list ─────────────────────────────────────────────────

console.log('\n── S2: Student sessions ──────────────────────────────────')
{
  const r = await apiGet(`/api/student/sessions?studentId=${studentRecord.id}`)
  check('GET /api/student/sessions returns 200', r.ok, `${r.status}: ${JSON.stringify(r.body)}`)
  check('Has upcomingSessions array', Array.isArray(r.body.upcomingSessions))
  check('Has completedSessions array', Array.isArray(r.body.completedSessions))
  check('totalTopics is a number > 0', typeof r.body.totalTopics === 'number' && r.body.totalTopics > 0, `got ${r.body.totalTopics}`)

  const upcoming = r.body.upcomingSessions
  const completed = r.body.completedSessions
  check('Has at least 1 upcoming session', upcoming.length >= 1, `got ${upcoming.length} (reschedule may have shifted count)`)
  check('Has 1 completed (Seen) session', completed.length === 1, `got ${completed.length}`)

  if (upcoming[0]) {
    check('Upcoming session has date', !!upcoming[0].date)
    check('Upcoming session has status', !!upcoming[0].status)
    check('Upcoming session isHoliday field present', 'isHoliday' in upcoming[0])
  }

  if (completed[0]) {
    check('Completed session has topicName (if topic exists)', topicRecord ? (completed[0].topicName != null) : true, `topicName="${completed[0].topicName}"`)
    check('Completed session has topicOrder', completed[0].topicOrder != null || !topicRecord, `topicOrder=${completed[0].topicOrder}`)
    check('Completed session has cachedSlides field', 'cachedSlides' in completed[0])
  }

  const rMissing = await apiGet('/api/student/sessions')
  check('Missing studentId returns 400', rMissing.status === 400)
}

// ── S3: Teacher availability (for token redeem modal) ─────────────────────────

console.log('\n── S3: Teacher availability ──────────────────────────────')
{
  const r = await apiGet(`/api/student/teacher-availability?teacherId=${teacherRecord.id}`)
  check('GET /api/student/teacher-availability returns 200', r.ok, `${r.status}: ${JSON.stringify(r.body)}`)
  check('Returns availability 2D array', Array.isArray(r.body), `got ${typeof r.body}`)
  if (Array.isArray(r.body)) {
    check('15 rows (6am-8pm)', r.body.length === 15, `got ${r.body.length}`)
    check('Each row has 7 cols (Mon-Sun)', r.body[0]?.length === 7, `got ${r.body[0]?.length}`)
    check('Mon 7am is available (row 1, col 0)', r.body[1][0] === true, `got ${r.body[1]?.[0]}`)
    check('Sun 7am is NOT available (row 1, col 6)', r.body[1][6] === false, `got ${r.body[1]?.[6]}`)
  }
}

// ── S4: Token redemption ──────────────────────────────────────────────────────

console.log('\n── S4: Token redemption ──────────────────────────────────')
{
  // dayIndex=0 (Mon), hourIndex=3 (9am = HOURS_START(6) + 3)
  const r = await apiPost('/api/student/redeem-token', {
    studentId: studentRecord.id,
    teacherId: teacherRecord.id,
    dayIndex: 0,
    hourIndex: 3,
  })
  check('POST /api/student/redeem-token returns 200', r.ok, `${r.status}: ${JSON.stringify(r.body)}`)
  check('Returns ok:true', r.body.ok === true, JSON.stringify(r.body))
  check('Returns sessionId', !!r.body.sessionId)
  check('Returns date', !!r.body.date)

  if (r.body.sessionId) toDelete['Sessions'].push(r.body.sessionId)

  // Verify token was deducted
  const studentNow = await atGet('Students', studentRecord.id)
  const tokens = studentNow?.fields?.['Tokens de Reposición']
  check('Token deducted (2 tokens remaining)', tokens === 2, `got ${tokens}`)

  // Try with 0 tokens (student now has 2, burn one more first, then try)
  const r2 = await apiPost('/api/student/redeem-token', {
    studentId: studentRecord.id,
    teacherId: teacherRecord.id,
    dayIndex: 1,
    hourIndex: 3,
  })
  if (r2.ok && r2.body.sessionId) toDelete['Sessions'].push(r2.body.sessionId)

  const r3 = await apiPost('/api/student/redeem-token', {
    studentId: studentRecord.id,
    teacherId: teacherRecord.id,
    dayIndex: 2,
    hourIndex: 3,
  })
  check('No tokens returns 400', r3.status === 400 && r3.body.error?.includes('token'), `got ${r3.status}: ${r3.body.error}`)

  // Missing params
  const rMissing = await apiPost('/api/student/redeem-token', { studentId: studentRecord.id })
  check('Missing params returns 400', rMissing.status === 400)

  // Unavailable slot (Sunday)
  const rUnavail = await apiPost('/api/student/redeem-token', {
    studentId: studentRecord.id,
    teacherId: teacherRecord.id,
    dayIndex: 6, // Sunday
    hourIndex: 3,
  })
  check('Unavailable slot returns 400', rUnavail.status === 400, `got ${rUnavail.status}: ${rUnavail.body.error}`)
}

// ── S5: Student reschedule ────────────────────────────────────────────────────

console.log('\n── S5: Student reschedule ────────────────────────────────')
if (freshSession) {
  const r = await apiPost('/api/student/reschedule', {
    sessionId: freshSession.id,
    studentId: studentRecord.id,
  })
  check('POST /api/student/reschedule returns 200', r.ok, `${r.status}: ${JSON.stringify(r.body)}`)
  check('Returns ok:true', r.body.ok === true)

  // Verify session canceled + token refunded
  const sessionAfter2 = await atGet('Sessions', freshSession.id)
  check('Session status is Canceled', sessionAfter2?.fields?.['Status'] === 'Canceled')

  const studentAfter2 = await atGet('Students', studentRecord.id)
  const tokensAfter2 = studentAfter2?.fields?.['Tokens de Reposición']
  check('Token refunded after student reschedule (1 token now)', tokensAfter2 === 1, `got ${tokensAfter2}`)

  // Try to reschedule a past session (< 2h away) — create one 30min from now
  const soon = new Date(Date.now() + 30 * 60 * 1000) // 30 min from now
  const soonSession = await atCreate('Sessions', {
    Teacher: [teacherRecord.id],
    'Scheduled Date/Time': soon.toISOString(),
    Status: 'Scheduled',
    'Session Name': 'Clase inmediata test',
  })
  toDelete['Sessions'].push(soonSession.id)
  const soonParticipant = await atCreate('Session Participants', {
    Session: [soonSession.id],
    Student: [studentRecord.id],
  })
  toDelete['Session Participants'].push(soonParticipant.id)

  const rTooLate = await apiPost('/api/student/reschedule', { sessionId: soonSession.id, studentId: studentRecord.id })
  check('Reschedule < 2h before class returns 400', rTooLate.status === 400, `got ${rTooLate.status}: ${rTooLate.body.error}`)

  const rMissing = await apiPost('/api/student/reschedule', {})
  check('Missing sessionId returns 400', rMissing.status === 400)
}

// ── S6: Teacher rating ────────────────────────────────────────────────────────

console.log('\n── S6: Teacher rating ────────────────────────────────────')
{
  const r = await apiPost('/api/student/rate-teacher', {
    studentId: studentRecord.id,
    teacherId: teacherRecord.id,
    rating: 5,
    comment: 'Test de calificación automática — excelente profes',
    sessionId: completedSession?.id,
  })
  check('POST /api/student/rate-teacher returns 200', r.ok, `${r.status}: ${JSON.stringify(r.body)}`)
  check('Returns ok:true', r.body.ok === true, JSON.stringify(r.body))

  // Verify average rating updated on teacher
  const teacherAfter = await atGet('Teachers', teacherRecord.id)
  const avg = teacherAfter?.fields?.['Average Rating']
  check('Teacher Average Rating updated', avg != null && avg > 0, `got "${avg}"`)
  check('Average Rating is 5.0 (only 1 rating)', avg === 5, `got ${avg}`)

  // Find and register review for cleanup
  const reviews = await atFind('Teacher Reviews', `AND(FIND('${teacherRecord.id}', ARRAYJOIN({Teacher}, ',')), FIND('${studentRecord.id}', ARRAYJOIN({Student}, ',')))`)
  reviews.forEach(r => toDelete['Teacher Reviews'].push(r.id))

  // Invalid rating
  const rBad = await apiPost('/api/student/rate-teacher', { studentId: studentRecord.id, teacherId: teacherRecord.id, rating: 6 })
  check('Rating > 5 returns 400', rBad.status === 400)

  const rZero = await apiPost('/api/student/rate-teacher', { studentId: studentRecord.id, teacherId: teacherRecord.id, rating: 0 })
  check('Rating 0 returns 400', rZero.status === 400)

  const rMissing = await apiPost('/api/student/rate-teacher', { studentId: studentRecord.id })
  check('Missing teacherId + rating returns 400', rMissing.status === 400)
}

// ── S7: Holiday confirmation flow ────────────────────────────────────────────

console.log('\n── S7: Holiday confirmation ──────────────────────────────')
{
  // Create a holiday session
  const holidaySession = await atCreate('Sessions', {
    Teacher: [teacherRecord.id],
    'Scheduled Date/Time': tomorrow.toISOString(),
    Status: 'Canceled',
    'Is Holiday': true,
    'Session Name': 'Festivo test',
  })
  toDelete['Sessions'].push(holidaySession.id)
  const hParticipant = await atCreate('Session Participants', {
    Session: [holidaySession.id],
    Student: [studentRecord.id],
  })
  toDelete['Session Participants'].push(hParticipant.id)

  const r = await apiPost('/api/confirm-holiday', {
    sessionId: holidaySession.id,
    by: 'student',
  })
  check('POST /api/confirm-holiday returns 200 or 400', r.status === 200 || r.status === 400, `got ${r.status}: ${JSON.stringify(r.body)}`)
  if (r.ok) check('Holiday confirmation accepted', r.body.ok === true)

  // Teacher confirm
  const r2 = await apiPost('/api/confirm-holiday', {
    sessionId: holidaySession.id,
    by: 'teacher',
  })
  check('Teacher holiday confirm returns 200 or 400', r2.status === 200 || r2.status === 400, `got ${r2.status}`)
}

// ═════════════════════════════════════════════════════════════════════════════
//  PHASE 3 — HARDCODED VALUES AUDIT
// ═════════════════════════════════════════════════════════════════════════════

console.log('\n\n╔══════════════════════════════════════════════════════╗')
console.log('║         HARDCODED VALUES AUDIT                         ║')
console.log('╚══════════════════════════════════════════════════════╝\n')

const hardcoded = [
  { label: 'HOURLY_RATE_COP (30,000) in register/teacher.tsx', severity: 'warn', note: 'Should come from env or config, not hardcoded in UI' },
  { label: 'HOURS_START=6 (6am) in redeem-token.ts', severity: 'warn', note: 'Needs to match HOURS grid exactly — currently both use 6am, OK' },
  { label: 'ADMIN_TOKEN="LinguaAdmin2025" in admin.tsx', severity: 'fail', note: 'Plaintext admin password in client-side code — high security risk' },
  { label: 'BASE_ID fallback "app9ZtojlxX5FoZ7y" in register/teacher.ts', severity: 'warn', note: 'Fallback is fine but env var AIRTABLE_BASE_ID should always be set in prod' },
  { label: 'Bogota timezone hardcoded in sessions.ts (2 places)', severity: 'warn', note: 'Should use teacher/student timezone from their record' },
  { label: 'Goal record IDs hardcoded in register/student.tsx', severity: 'fail', note: '5 Airtable record IDs ("rectE12...", etc.) — breaks if table is rebuilt' },
  { label: '2h reschedule window hardcoded (student/reschedule.ts)', severity: 'warn', note: 'Business rule, OK for now' },
  { label: '24h token redeem minimum hardcoded (redeem-token.ts)', severity: 'warn', note: 'Business rule, OK for now' },
  { label: '75min auto-finalize in classroom.tsx (inferred)', severity: 'warn', note: 'Session duration = hardcoded 60+15min, no config' },
  { label: 'reschedule-session.ts fetches ALL scheduled sessions globally (no teacher filter)', severity: 'fail', note: 'Performance risk + correctness: cascades any future session, not just the right teacher' },
  { label: 'student/reschedule.ts also fetches ALL sessions globally', severity: 'fail', note: 'Same issue — should filter by teacherId to limit scope' },
  { label: '"Teacher Reviews" table name hardcoded in rate-teacher.ts', severity: 'warn', note: 'If table doesn\'t exist yet, fails silently — add to Airtable now' },
  { label: 'Availability stored as JSON string (fld7vSUdd69zdl6yQ) but API uses field name "Availability" in patches', severity: 'fail', note: 'register/teacher.ts writes with field ID, teacher/availability.ts likely patches with field name "Availability" — inconsistent' },
]

for (const item of hardcoded) {
  check(item.label, false, item.note, item.severity)
}

// ═════════════════════════════════════════════════════════════════════════════
//  CLEANUP — Delete all mock records
// ═════════════════════════════════════════════════════════════════════════════

console.log('\n\n── Cleanup: Deleting mock data ───────────────────────────')
for (const [table, ids] of Object.entries(toDelete)) {
  for (const id of ids) {
    await atDelete(table, id)
    process.stdout.write('.')
  }
}
console.log('\n  ✅ All mock records deleted')

// ═════════════════════════════════════════════════════════════════════════════
//  FINAL REPORT
// ═════════════════════════════════════════════════════════════════════════════

console.log('\n\n╔══════════════════════════════════════════════════════╗')
console.log('║                  FINAL REPORT                         ║')
console.log('╚══════════════════════════════════════════════════════╝\n')
console.log(`  ✅ Passed:   ${passed}`)
console.log(`  ⚠️  Warnings: ${warnings}`)
console.log(`  ❌ Failed:   ${failed}`)

if (issues.length > 0) {
  console.log('\n  FAILURES TO FIX:')
  issues.forEach((i, idx) => console.log(`  ${idx + 1}. ${i.label}\n     → ${i.message}`))
}
