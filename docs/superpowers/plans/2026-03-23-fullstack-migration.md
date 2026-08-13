# LinguaLife Fullstack Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate LinguaLife from a frontend-only Airtable app to a Next.js fullstack monorepo deployable on Vercel, with the API key secured server-side.

**Architecture:** Next.js app in `apps/web/` with React pages and API Routes as Vercel Serverless Functions. The Airtable client lives only in `lib/airtable.ts` (server-side). The browser never sees the API key.

**Tech Stack:** Next.js 14, TypeScript, React, CSS Modules, Airtable REST API, npm workspaces, Vercel

**Spec:** `docs/superpowers/specs/2026-03-23-fullstack-migration-design.md`

> **Note on TDD:** The spec explicitly excludes automated tests from MVP scope. Each task includes a manual verification step instead of automated tests.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `package.json` | Modify | Add npm workspace config |
| `apps/web/package.json` | Create | Next.js app dependencies |
| `apps/web/tsconfig.json` | Create | TypeScript config |
| `apps/web/next.config.js` | Create | Next.js config |
| `apps/web/.env.local.example` | Create | Env var template |
| `apps/web/types/index.ts` | Create | Domain types |
| `apps/web/lib/airtable.ts` | Create | Airtable server-side client |
| `apps/web/context/AppContext.tsx` | Create | Global state (AuthTeacher, Session, Student, Topic, Exercises) |
| `apps/web/hooks/useRequireAuth.ts` | Create | Route protection + session access |
| `apps/web/pages/_app.tsx` | Create | App wrapper with AppProvider |
| `apps/web/pages/index.tsx` | Create | Login page (PIN input) |
| `apps/web/pages/dashboard.tsx` | Create | Teacher dashboard (session list) |
| `apps/web/pages/classroom.tsx` | Create | Active classroom view |
| `apps/web/pages/api/teacher/validate.ts` | Create | POST /api/teacher/validate |
| `apps/web/pages/api/sessions.ts` | Create | GET /api/sessions |
| `apps/web/pages/api/session.ts` | Create | GET /api/session |
| `apps/web/pages/api/student.ts` | Create | GET /api/student |
| `apps/web/pages/api/topic.ts` | Create | GET /api/topic |
| `apps/web/pages/api/exercises.ts` | Create | GET /api/exercises |
| `apps/web/components/PinInput.tsx` | Create | PIN input component |
| `apps/web/components/PinInput.module.css` | Create | PIN input styles |
| `apps/web/components/SessionCard.tsx` | Create | Session card component |
| `apps/web/components/SessionCard.module.css` | Create | Session card styles |
| `apps/web/components/ExerciseCard.tsx` | Create | Exercise card component |
| `apps/web/components/ExerciseCard.module.css` | Create | Exercise card styles |
| `apps/web/components/TopicPanel.tsx` | Create | Topic panel component |
| `apps/web/components/TopicPanel.module.css` | Create | Topic panel styles |
| `apps/web/pages/_document.tsx` | Create | HTML head with Google Fonts |
| `apps/web/styles/globals.css` | Create | Glassmorphism base styles |
| `apps/web/styles/Home.module.css` | Create | Login page styles |
| `apps/web/styles/Dashboard.module.css` | Create | Dashboard styles |
| `apps/web/styles/Classroom.module.css` | Create | Classroom styles |

---

## Task 1: Monorepo scaffold

**Files:**
- Modify: `package.json`
- Create: `apps/web/package.json`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/next.config.js`
- Create: `apps/web/.env.local.example`
- Create: `apps/web/.gitignore`

- [ ] **Step 1: Update root `package.json` to add npm workspaces**

Replace the contents of the root `package.json` (currently only has pdf-parse deps) with:

```json
{
  "name": "lingualife-monorepo",
  "private": true,
  "workspaces": ["apps/*"],
  "dependencies": {
    "pdf-parse": "^2.4.5",
    "pdfjs-dist": "^2.16.105"
  }
}
```

- [ ] **Step 2: Create `apps/web/` directory and scaffold Next.js app**

```bash
mkdir -p apps/web
cd apps/web
npx create-next-app@latest . --typescript --no-eslint --no-tailwind --no-src-dir --no-app --import-alias "@/*"
```

When prompted, accept defaults. This scaffolds a pages-router Next.js app with TypeScript.

- [ ] **Step 3: Create `.env.local.example`**

Create `apps/web/.env.local.example`:
```
AIRTABLE_API_KEY=your_api_key_here
AIRTABLE_BASE_ID=your_base_id_here
```

- [ ] **Step 4: Copy `.env.local.example` to `.env.local` and fill in real values**

```bash
cp apps/web/.env.local.example apps/web/.env.local
```

Edit `apps/web/.env.local` with the actual values from `dashboard/js/api.js` (CONFIG.API_KEY and CONFIG.BASE_ID):
```
AIRTABLE_API_KEY=<copy from dashboard/js/api.js>
AIRTABLE_BASE_ID=<copy from dashboard/js/api.js>
```

- [ ] **Step 5: Ensure `.env.local` is in `.gitignore`**

Open `apps/web/.gitignore` (created by create-next-app) and verify it contains `.env.local`. If not, add it.

- [ ] **Step 6: Verify the scaffold runs**

```bash
cd apps/web && npm run dev
```

Expected: Next.js dev server starts on `http://localhost:3000` with no errors.

Stop the server (Ctrl+C).

- [ ] **Step 7: Commit**

```bash
git add apps/web package.json
git commit -m "feat: scaffold Next.js monorepo in apps/web"
```

---

## Task 2: Domain types + Airtable client

**Files:**
- Create: `apps/web/types/index.ts`
- Create: `apps/web/lib/airtable.ts`

- [ ] **Step 1: Create `apps/web/types/index.ts`**

> **Note:** These types extend the spec with fields discovered in the original `dashboard/js/app.js` (e.g. `Exercise.generatedExample` maps to Airtable field `Generated Example`; `Exercise.solutionArchetype` maps to `Solution/Archetype`; `Session.sessionName` maps to `Session Name`). The Airtable `Full Name` field is confirmed correct for both Teachers and Students per the original code.

```typescript
// Teacher: full Airtable record (server-side only)
export interface Teacher {
  id: string
  name: string
  pin: string
}

// AuthTeacher: stored in AppContext and sessionStorage (no pin)
export interface AuthTeacher {
  id: string
  name: string
}

export interface Session {
  id: string
  teacherId: string
  studentId: string
  topicId: string | null
  date: string       // ISO 8601 e.g. "2026-03-23"
  time: string       // "HH:MM"
  status: string
  sessionName: string
}

export interface Student {
  id: string
  name: string
  level: string
  notes?: string
  interests?: string
}

export interface Topic {
  id: string
  title: string
  description: string
  level: string
  order?: number
}

export interface Exercise {
  id: string
  studentId: string
  generatedExample: string
  solutionArchetype: string
  date: string       // ISO 8601
}
```

- [ ] **Step 2: Create `apps/web/lib/airtable.ts`**

```typescript
const BASE_ID = process.env.AIRTABLE_BASE_ID!
const API_KEY = process.env.AIRTABLE_API_KEY!

export async function fetchFromAirtable(table: string, params = ''): Promise<any> {
  const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(table)}?${params}`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  })
  if (!res.ok) throw new Error(`Airtable error: ${res.status}`)
  return res.json()
}

export async function fetchAirtableRecord(table: string, recordId: string): Promise<any> {
  const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(table)}/${recordId}`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`Airtable error: ${res.status}`)
  return res.json()
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd apps/web && npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add apps/web/types apps/web/lib
git commit -m "feat: add domain types and Airtable server-side client"
```

---

## Task 3: API Route — POST /api/teacher/validate

**Files:**
- Create: `apps/web/pages/api/teacher/validate.ts`

- [ ] **Step 1: Create `apps/web/pages/api/teacher/validate.ts`**

```typescript
import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchFromAirtable } from '@/lib/airtable'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { pin } = req.body as { pin?: string }
  if (!pin) {
    return res.status(400).json({ error: 'pin es requerido' })
  }

  try {
    const formula = `{PIN} = '${pin}'`
    const data = await fetchFromAirtable('Teachers', `filterByFormula=${encodeURIComponent(formula)}`)

    if (!data.records || data.records.length === 0) {
      return res.status(401).json({ error: 'PIN inválido' })
    }

    const record = data.records[0]
    return res.status(200).json({
      teacherId: record.id,
      name: record.fields['Full Name'] as string,
    })
  } catch {
    return res.status(500).json({ error: 'Error al validar PIN' })
  }
}
```

- [ ] **Step 2: Start dev server and test manually**

```bash
cd apps/web && npm run dev
```

In a new terminal:
```bash
curl -X POST http://localhost:3000/api/teacher/validate \
  -H "Content-Type: application/json" \
  -d '{"pin":"WRONG"}'
```

Expected: `{"error":"PIN inválido"}` with status 401.

```bash
curl -X POST http://localhost:3000/api/teacher/validate \
  -H "Content-Type: application/json" \
  -d '{"pin":"YOUR_REAL_PIN"}'
```

Expected: `{"teacherId":"recXXX","name":"..."}` with status 200.

- [ ] **Step 3: Commit**

```bash
git add apps/web/pages/api/teacher
git commit -m "feat: add POST /api/teacher/validate route"
```

---

## Task 4: API Route — GET /api/sessions

**Files:**
- Create: `apps/web/pages/api/sessions.ts`

- [ ] **Step 1: Create `apps/web/pages/api/sessions.ts`**

```typescript
import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchFromAirtable } from '@/lib/airtable'
import type { Session } from '@/types'

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { teacherId, date } = req.query as { teacherId?: string; date?: string }

  if (!teacherId || !date) {
    return res.status(400).json({ error: 'teacherId y date son requeridos' })
  }
  if (!ISO_DATE_RE.test(date)) {
    return res.status(400).json({ error: 'date debe tener formato YYYY-MM-DD' })
  }

  try {
    const formula = `AND({Teacher} = '${teacherId}', {Status} = 'Scheduled')`
    const params = [
      `filterByFormula=${encodeURIComponent(formula)}`,
      `sort[0][field]=Scheduled Date/Time`,
      `sort[0][direction]=asc`,
    ].join('&')

    const data = await fetchFromAirtable('Sessions', params)

    const sessions: Session[] = (data.records || []).map((r: any) => ({
      id: r.id,
      teacherId: teacherId as string,
      studentId: (r.fields['Session Participants'] as string[])?.[0] ?? '',
      topicId: (r.fields['Curriculum Topic'] as string[])?.[0] ?? null,
      date: date as string,
      time: r.fields['Scheduled Date/Time']
        ? new Date(r.fields['Scheduled Date/Time']).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '',
      status: r.fields['Status'] as string,
      sessionName: r.fields['Session Name'] as string ?? '',
    }))

    return res.status(200).json(sessions)
  } catch {
    return res.status(500).json({ error: 'Error al obtener sesiones' })
  }
}
```

- [ ] **Step 2: Test manually**

```bash
curl "http://localhost:3000/api/sessions?teacherId=YOUR_TEACHER_ID&date=2026-03-23"
```

Expected: JSON array of sessions (may be empty `[]` if none today).

```bash
curl "http://localhost:3000/api/sessions?teacherId=abc&date=notadate"
```

Expected: `{"error":"date debe tener formato YYYY-MM-DD"}` with status 400.

- [ ] **Step 3: Commit**

```bash
git add apps/web/pages/api/sessions.ts
git commit -m "feat: add GET /api/sessions route"
```

---

## Task 5: API Route — GET /api/session (single session by ID)

**Files:**
- Create: `apps/web/pages/api/session.ts`

- [ ] **Step 1: Create `apps/web/pages/api/session.ts`**

```typescript
import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchAirtableRecord } from '@/lib/airtable'
import type { Session } from '@/types'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { id } = req.query as { id?: string }
  if (!id) return res.status(400).json({ error: 'id es requerido' })

  try {
    const record = await fetchAirtableRecord('Sessions', id)
    if (!record) return res.status(404).json({ error: 'Sesión no encontrada' })

    const session: Session = {
      id: record.id,
      teacherId: (record.fields['Teacher'] as string[])?.[0] ?? '',
      studentId: (record.fields['Session Participants'] as string[])?.[0] ?? '',
      topicId: (record.fields['Curriculum Topic'] as string[])?.[0] ?? null,
      date: record.fields['Scheduled Date/Time']
        ? new Date(record.fields['Scheduled Date/Time']).toISOString().slice(0, 10)
        : '',
      time: record.fields['Scheduled Date/Time']
        ? new Date(record.fields['Scheduled Date/Time']).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '',
      status: record.fields['Status'] as string,
      sessionName: record.fields['Session Name'] as string ?? '',
    }

    return res.status(200).json(session)
  } catch {
    return res.status(500).json({ error: 'Error al obtener sesión' })
  }
}
```

- [ ] **Step 2: Test manually**

```bash
curl "http://localhost:3000/api/session?id=recXXXXXX"
```

Expected: full Session JSON or 404 if ID doesn't exist.

- [ ] **Step 3: Commit**

```bash
git add apps/web/pages/api/session.ts
git commit -m "feat: add GET /api/session route"
```

---

## Task 6: API Routes — student, topic, exercises

**Files:**
- Create: `apps/web/pages/api/student.ts`
- Create: `apps/web/pages/api/topic.ts`
- Create: `apps/web/pages/api/exercises.ts`

- [ ] **Step 1: Create `apps/web/pages/api/student.ts`**

```typescript
import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchAirtableRecord } from '@/lib/airtable'
import type { Student } from '@/types'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { id } = req.query as { id?: string }
  if (!id) return res.status(400).json({ error: 'id es requerido' })

  try {
    const record = await fetchAirtableRecord('Students', id)
    if (!record) return res.status(404).json({ error: 'Estudiante no encontrado' })

    const student: Student = {
      id: record.id,
      name: record.fields['Full Name'] as string,
      level: (record.fields['Level'] as string) ?? '',
      notes: record.fields['Notes'] as string | undefined,
      interests: record.fields['Interests'] as string | undefined,
    }

    return res.status(200).json(student)
  } catch {
    return res.status(500).json({ error: 'Error al obtener estudiante' })
  }
}
```

- [ ] **Step 2: Create `apps/web/pages/api/topic.ts`**

```typescript
import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchAirtableRecord } from '@/lib/airtable'
import type { Topic } from '@/types'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { id } = req.query as { id?: string }
  if (!id) return res.status(400).json({ error: 'id es requerido' })

  try {
    const record = await fetchAirtableRecord('Curriculum Topics', id)
    if (!record) return res.status(404).json({ error: 'Tópico no encontrado' })

    const topic: Topic = {
      id: record.id,
      title: (record.fields['Topic Name'] ?? record.fields['Name'] ?? '') as string,
      description: (record.fields['Description'] ?? '') as string,
      level: (record.fields['Level'] ?? '') as string,
      order: record.fields['Order'] as number | undefined,
    }

    return res.status(200).json(topic)
  } catch {
    return res.status(500).json({ error: 'Error al obtener tópico' })
  }
}
```

- [ ] **Step 3: Create `apps/web/pages/api/exercises.ts`**

```typescript
import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchFromAirtable } from '@/lib/airtable'
import type { Exercise } from '@/types'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { studentId } = req.query as { studentId?: string }
  if (!studentId) return res.status(400).json({ error: 'studentId es requerido' })

  try {
    const formula = `{Student} = '${studentId}'`
    const params = [
      `filterByFormula=${encodeURIComponent(formula)}`,
      `maxRecords=5`,
      `sort[0][field]=Created`,
      `sort[0][direction]=desc`,
    ].join('&')

    const data = await fetchFromAirtable('Exercises', params)

    const exercises: Exercise[] = (data.records || []).map((r: any) => ({
      id: r.id,
      studentId,
      generatedExample: (r.fields['Generated Example'] ?? '') as string,
      solutionArchetype: (r.fields['Solution/Archetype'] ?? '') as string,
      date: (r.fields['Created'] ?? '') as string,
    }))

    return res.status(200).json(exercises)
  } catch {
    return res.status(500).json({ error: 'Error al obtener ejercicios' })
  }
}
```

- [ ] **Step 4: Test manually**

```bash
curl "http://localhost:3000/api/student?id=recXXXXXX"
curl "http://localhost:3000/api/topic?id=recXXXXXX"
curl "http://localhost:3000/api/exercises?studentId=recXXXXXX"
```

Each should return JSON or appropriate 400/404.

- [ ] **Step 5: Commit**

```bash
git add apps/web/pages/api/student.ts apps/web/pages/api/topic.ts apps/web/pages/api/exercises.ts
git commit -m "feat: add GET /api/student, /api/topic, /api/exercises routes"
```

---

## Task 7: AppContext + useRequireAuth

**Files:**
- Create: `apps/web/context/AppContext.tsx`
- Create: `apps/web/hooks/useRequireAuth.ts`

- [ ] **Step 1: Create `apps/web/context/AppContext.tsx`**

```typescript
import { createContext, useContext, useState, ReactNode } from 'react'
import type { AuthTeacher, Session, Student, Topic, Exercise } from '@/types'

interface AppState {
  teacher: AuthTeacher | null
  currentSession: Session | null
  student: Student | null
  topic: Topic | null
  exercises: Exercise[]
}

interface AppContextValue {
  state: AppState
  setAppState: (patch: Partial<AppState>) => void
}

const initialState: AppState = {
  teacher: null,
  currentSession: null,
  student: null,
  topic: null,
  exercises: [],
}

const AppContext = createContext<AppContextValue>({
  state: initialState,
  setAppState: () => {},
})

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState)

  function setAppState(patch: Partial<AppState>) {
    setState((prev) => ({ ...prev, ...patch }))
  }

  return (
    <AppContext.Provider value={{ state, setAppState }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  return useContext(AppContext)
}
```

- [ ] **Step 2: Create `apps/web/hooks/useRequireAuth.ts`**

```typescript
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export interface AuthSession {
  teacherId: string
  name: string
}

export function useRequireAuth(): AuthSession | null {
  const router = useRouter()
  const [session, setSession] = useState<AuthSession | null>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem('lingualife_session')
    if (!raw) {
      router.replace('/')
      return
    }
    setSession(JSON.parse(raw) as AuthSession)
  }, [])

  return session
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/context apps/web/hooks
git commit -m "feat: add AppContext and useRequireAuth hook"
```

---

## Task 8: Base styles (glassmorphism)

**Files:**
- Modify: `apps/web/styles/globals.css`
- Create: `apps/web/styles/Home.module.css`
- Create: `apps/web/styles/Dashboard.module.css`
- Create: `apps/web/styles/Classroom.module.css`

- [ ] **Step 1: Replace `apps/web/styles/globals.css`**

Port the CSS variables and global styles from `dashboard/style.css`. Open that file and extract the `:root` variables and base styles.

```css
/* Reference: dashboard/style.css */
:root {
  --bg-primary: #0a0a0f;
  --bg-secondary: #13131a;
  --bg-glass: rgba(255, 255, 255, 0.05);
  --border-glass: rgba(255, 255, 255, 0.1);
  --text-primary: #f0f0f5;
  --text-secondary: #8888aa;
  --accent-purple: #7c3aed;
  --accent-blue: #3b82f6;
  --accent-green: #10b981;
  --accent-red: #ef4444;
  --font-heading: 'Outfit', sans-serif;
  --font-body: 'Inter', sans-serif;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: var(--font-body);
  min-height: 100vh;
}

.glass {
  background: var(--bg-glass);
  border: 1px solid var(--border-glass);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 16px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-glass);
  border-top-color: var(--accent-purple);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 2rem auto;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-message {
  color: var(--accent-red);
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
}
```

Add Google Fonts import in `apps/web/pages/_document.tsx` (create if not exists):

```typescript
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="es">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Outfit:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
```

- [ ] **Step 2: Create `apps/web/styles/Home.module.css`**

```css
.container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: radial-gradient(ellipse at top, #1a0a2e 0%, #0a0a0f 60%);
}

.card {
  width: 100%;
  max-width: 380px;
  padding: 2.5rem;
  text-align: center;
}

.logo {
  font-family: var(--font-heading);
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--accent-purple), var(--accent-blue));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-bottom: 2rem;
}

.errorMessage {
  composes: error-message from global;
  margin-bottom: 1rem;
}
```

- [ ] **Step 3: Create `apps/web/styles/Dashboard.module.css`**

```css
.container {
  min-height: 100vh;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.greeting {
  font-family: var(--font-heading);
  font-size: 1.5rem;
  font-weight: 600;
}

.logoutBtn {
  background: transparent;
  border: 1px solid var(--border-glass);
  color: var(--text-secondary);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.logoutBtn:hover {
  border-color: var(--accent-red);
  color: var(--accent-red);
}

.sessionGrid {
  display: grid;
  gap: 1rem;
}

.emptyState {
  text-align: center;
  color: var(--text-secondary);
  padding: 3rem;
}
```

- [ ] **Step 4: Create `apps/web/styles/Classroom.module.css`**

```css
.container {
  min-height: 100vh;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.title {
  font-family: var(--font-heading);
  font-size: 1.5rem;
  font-weight: 600;
}

.backBtn {
  background: transparent;
  border: 1px solid var(--border-glass);
  color: var(--text-secondary);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 1.5rem;
}

.exercisesList {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
```

- [ ] **Step 5: Commit**

```bash
git add apps/web/styles apps/web/pages/_document.tsx
git commit -m "feat: add glassmorphism base styles and CSS Modules"
```

---

## Task 9: UI Components

**Files:**
- Create: `apps/web/components/PinInput.tsx`
- Create: `apps/web/components/SessionCard.tsx`
- Create: `apps/web/components/ExerciseCard.tsx`
- Create: `apps/web/components/TopicPanel.tsx`

- [ ] **Step 1: Create `apps/web/components/PinInput.tsx`**

```typescript
import { useState } from 'react'
import styles from './PinInput.module.css'

interface Props {
  onSubmit: (pin: string) => void
  loading?: boolean
}

export function PinInput({ onSubmit, loading }: Props) {
  const [pin, setPin] = useState('')

  function handleSubmit() {
    if (pin.length >= 4) onSubmit(pin)
  }

  return (
    <div className={styles.container}>
      <input
        type="password"
        inputMode="numeric"
        placeholder="PIN del profesor"
        value={pin}
        onChange={(e) => setPin(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        className={styles.input}
        maxLength={8}
      />
      <button
        onClick={handleSubmit}
        disabled={loading || pin.length < 4}
        className={styles.button}
      >
        {loading ? 'Validando...' : 'Entrar'}
      </button>
    </div>
  )
}
```

Create `apps/web/components/PinInput.module.css`:
```css
.container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.input {
  background: rgba(255,255,255,0.07);
  border: 1px solid var(--border-glass);
  border-radius: 12px;
  padding: 0.875rem 1rem;
  color: var(--text-primary);
  font-size: 1.25rem;
  letter-spacing: 0.3em;
  text-align: center;
  width: 100%;
  outline: none;
  transition: border-color 0.2s;
}

.input:focus {
  border-color: var(--accent-purple);
}

.button {
  background: linear-gradient(135deg, var(--accent-purple), var(--accent-blue));
  border: none;
  border-radius: 12px;
  padding: 0.875rem;
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

- [ ] **Step 2: Create `apps/web/components/SessionCard.tsx`**

```typescript
import type { Session } from '@/types'
import styles from './SessionCard.module.css'

interface Props {
  session: Session
  onClick: (session: Session) => void
}

export function SessionCard({ session, onClick }: Props) {
  return (
    <div className={`glass ${styles.card}`} onClick={() => onClick(session)} role="button">
      <div className={styles.info}>
        <h4 className={styles.name}>{session.sessionName || 'Sesión'}</h4>
        <span className={styles.time}>{session.time}</span>
      </div>
      <span className={`${styles.status} ${styles[session.status.toLowerCase()]}`}>
        {session.status}
      </span>
    </div>
  )
}
```

Create `apps/web/components/SessionCard.module.css`:
```css
.card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  cursor: pointer;
  transition: border-color 0.2s;
}

.card:hover {
  border-color: var(--accent-purple);
}

.info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.name {
  font-weight: 600;
  font-size: 1rem;
}

.time {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.status {
  font-size: 0.75rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.scheduled {
  background: rgba(59, 130, 246, 0.15);
  color: var(--accent-blue);
}
```

- [ ] **Step 3: Create `apps/web/components/ExerciseCard.tsx`**

```typescript
import type { Exercise } from '@/types'
import styles from './ExerciseCard.module.css'

interface Props {
  exercise: Exercise
}

export function ExerciseCard({ exercise }: Props) {
  return (
    <div className={`glass ${styles.card}`}>
      <p className={styles.example}>"{exercise.generatedExample}"</p>
      {exercise.solutionArchetype && (
        <small className={styles.solution}>{exercise.solutionArchetype}</small>
      )}
    </div>
  )
}
```

Create `apps/web/components/ExerciseCard.module.css`:
```css
.card {
  padding: 1rem 1.25rem;
}

.example {
  font-size: 0.9rem;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
  font-style: italic;
}

.solution {
  color: var(--text-secondary);
  font-size: 0.78rem;
}
```

- [ ] **Step 4: Create `apps/web/components/TopicPanel.tsx`**

```typescript
import type { Topic } from '@/types'
import styles from './TopicPanel.module.css'

interface Props {
  topic: Topic | null
}

export function TopicPanel({ topic }: Props) {
  if (!topic) return null

  return (
    <div className={`glass ${styles.panel}`}>
      <h3 className={styles.title}>Tópico curricular</h3>
      <p className={styles.topicName}>{topic.title}</p>
      {topic.description && <p className={styles.description}>{topic.description}</p>}
      <div className={styles.meta}>
        {topic.level && <span className={styles.badge}>{topic.level}</span>}
        {topic.order && <span className={styles.order}>#{topic.order}</span>}
      </div>
    </div>
  )
}
```

Create `apps/web/components/TopicPanel.module.css`:
```css
.panel {
  padding: 1.5rem;
}

.title {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-secondary);
  margin-bottom: 0.75rem;
}

.topicName {
  font-family: var(--font-heading);
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.description {
  color: var(--text-secondary);
  font-size: 0.875rem;
  line-height: 1.5;
  margin-bottom: 1rem;
}

.meta {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.badge {
  background: rgba(124, 58, 237, 0.15);
  color: var(--accent-purple);
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
}

.order {
  color: var(--text-secondary);
  font-size: 0.75rem;
}
```

- [ ] **Step 5: Commit**

```bash
git add apps/web/components
git commit -m "feat: add UI components (PinInput, SessionCard, ExerciseCard, TopicPanel)"
```

---

## Task 10: Page — `_app.tsx` and login (`index.tsx`)

**Files:**
- Modify: `apps/web/pages/_app.tsx`
- Modify: `apps/web/pages/index.tsx`

- [ ] **Step 1: Update `apps/web/pages/_app.tsx`**

```typescript
import type { AppProps } from 'next/app'
import { AppProvider } from '@/context/AppContext'
import '@/styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AppProvider>
      <Component {...pageProps} />
    </AppProvider>
  )
}
```

- [ ] **Step 2: Replace `apps/web/pages/index.tsx`**

```typescript
import { useState } from 'react'
import { useRouter } from 'next/router'
import { PinInput } from '@/components/PinInput'
import { useAppContext } from '@/context/AppContext'
import styles from '@/styles/Home.module.css'

export default function LoginPage() {
  const router = useRouter()
  const { setAppState } = useAppContext()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handlePin(pin: string) {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/teacher/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Error al validar')
        return
      }

      const session = { teacherId: data.teacherId, name: data.name }
      sessionStorage.setItem('lingualife_session', JSON.stringify(session))
      setAppState({ teacher: { id: data.teacherId, name: data.name } })
      router.push('/dashboard')
    } catch {
      setError('Error de conexión. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={`glass ${styles.card}`}>
        <h1 className={styles.logo}>LinguaLife</h1>
        <p className={styles.subtitle}>Dashboard del Profesor</p>
        {error && <div className={styles.errorMessage}>{error}</div>}
        <PinInput onSubmit={handlePin} loading={loading} />
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Open browser and verify login page renders**

Navigate to `http://localhost:3000`. You should see the glassmorphism login card with PIN input.

- [ ] **Step 4: Test login flow end-to-end**

Enter a valid PIN → should redirect to `/dashboard` (which shows 404 for now — that's expected).
Enter an invalid PIN → should show "PIN inválido" error.

- [ ] **Step 5: Commit**

```bash
git add apps/web/pages/_app.tsx apps/web/pages/index.tsx
git commit -m "feat: add login page with PIN authentication"
```

---

## Task 11: Dashboard page

**Files:**
- Create: `apps/web/pages/dashboard.tsx`

- [ ] **Step 1: Create `apps/web/pages/dashboard.tsx`**

```typescript
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { useAppContext } from '@/context/AppContext'
import { SessionCard } from '@/components/SessionCard'
import type { Session } from '@/types'
import styles from '@/styles/Dashboard.module.css'

export default function DashboardPage() {
  const session = useRequireAuth()
  const router = useRouter()
  const { setAppState } = useAppContext()

  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!session) return
    loadSessions()
  }, [session])

  async function loadSessions() {
    setLoading(true)
    setError(null)
    const today = new Date().toISOString().slice(0, 10)
    try {
      const res = await fetch(`/api/sessions?teacherId=${session!.teacherId}&date=${today}`)
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Error al cargar sesiones')
        return
      }
      setSessions(data)
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  function handleSessionClick(s: Session) {
    setAppState({ currentSession: s })
    router.push(`/classroom?sessionId=${s.id}`)
  }

  function handleLogout() {
    sessionStorage.removeItem('lingualife_session')
    router.replace('/')
  }

  if (!session) return null

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.greeting}>Bienvenido, {session.name.split(' ')[0]}</h1>
        <button className={styles.logoutBtn} onClick={handleLogout}>Salir</button>
      </div>

      {loading && <div className="spinner" />}
      {error && <div className="error-message">{error}</div>}

      {!loading && !error && (
        <div className={styles.sessionGrid}>
          {sessions.length === 0 ? (
            <p className={styles.emptyState}>No tienes sesiones programadas para hoy.</p>
          ) : (
            sessions.map((s) => (
              <SessionCard key={s.id} session={s} onClick={handleSessionClick} />
            ))
          )}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Open browser and verify dashboard**

After logging in, navigate to `/dashboard`. You should see:
- Greeting with teacher name
- Spinner while loading
- List of today's sessions (or empty state)

- [ ] **Step 3: Commit**

```bash
git add apps/web/pages/dashboard.tsx
git commit -m "feat: add dashboard page with session list"
```

---

## Task 12: Classroom page

**Files:**
- Create: `apps/web/pages/classroom.tsx`

- [ ] **Step 1: Create `apps/web/pages/classroom.tsx`**

```typescript
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { useAppContext } from '@/context/AppContext'
import { ExerciseCard } from '@/components/ExerciseCard'
import { TopicPanel } from '@/components/TopicPanel'
import type { Student, Topic, Exercise } from '@/types'
import styles from '@/styles/Classroom.module.css'

export default function ClassroomPage() {
  const session = useRequireAuth()
  const router = useRouter()
  const { setAppState } = useAppContext()

  const [mounted, setMounted] = useState(false)
  const [student, setStudent] = useState<Student | null>(null)
  const [topic, setTopic] = useState<Topic | null>(null)
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Hydration guard: prevents any client-only code from running during SSR
  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted || !session || !router.isReady) return
    const { sessionId } = router.query as { sessionId?: string }
    if (!sessionId) {
      router.replace('/dashboard')
      return
    }
    loadClassroomData(sessionId)
  }, [mounted, session, router.isReady])

  async function loadClassroomData(sessionId: string) {
    setLoading(true)
    setError(null)

    try {
      // Step 1: resolve session → studentId + topicId
      const sessionRes = await fetch(`/api/session?id=${sessionId}`)
      if (sessionRes.status === 404) {
        router.replace('/dashboard')
        return
      }
      if (!sessionRes.ok) {
        const d = await sessionRes.json()
        setError(d.error || 'Error al cargar sesión')
        return
      }
      const sessionData = await sessionRes.json()
      const { studentId, topicId } = sessionData

      // Step 2: fetch student, topic, exercises in parallel
      const [studentRes, topicRes, exercisesRes] = await Promise.all([
        fetch(`/api/student?id=${studentId}`),
        topicId ? fetch(`/api/topic?id=${topicId}`) : Promise.resolve(null),
        fetch(`/api/exercises?studentId=${studentId}`),
      ])

      const studentData = await studentRes.json()
      if (!studentRes.ok) throw new Error(studentData.error)

      const topicData = topicRes ? await topicRes.json() : null
      const exercisesData = await exercisesRes.json()

      setStudent(studentData)
      setTopic(topicRes?.ok ? topicData : null)
      setExercises(exercisesRes.ok ? exercisesData : [])
      setAppState({ student: studentData, topic: topicData, exercises: exercisesData })
    } catch (err: any) {
      setError(err.message || 'Error al cargar datos de la clase')
    } finally {
      setLoading(false)
    }
  }

  if (!mounted || !session) return null

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.push('/dashboard')}>
          ← Dashboard
        </button>
        <h1 className={styles.title}>
          {student ? `Clase con ${student.name}` : 'Cargando clase...'}
        </h1>
      </div>

      {loading && <div className="spinner" />}
      {error && <div className="error-message">{error}</div>}

      {!loading && !error && student && (
        <div className={styles.grid}>
          <div>
            <TopicPanel topic={topic} />
          </div>
          <div>
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Ejercicios recientes
            </h3>
            {exercises.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>Sin ejercicios registrados.</p>
            ) : (
              <div className={styles.exercisesList}>
                {exercises.map((ex) => (
                  <ExerciseCard key={ex.id} exercise={ex} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Open browser and test classroom**

From the dashboard, click on a session. You should be redirected to `/classroom?sessionId=...` and see:
- Student name in the header
- Topic panel (if session has a topic)
- Exercise cards (if student has exercises)

- [ ] **Step 3: Commit**

```bash
git add apps/web/pages/classroom.tsx
git commit -m "feat: add classroom page with student, topic, and exercises"
```

---

## Task 13: Final verification

- [ ] **Step 1: Verify AIRTABLE_API_KEY is not in the build output**

```bash
cd apps/web && npm run build
grep -r "AIRTABLE_API_KEY" .next/ 2>/dev/null || echo "CLEAN — key not in bundle"
```

Expected output: `CLEAN — key not in bundle`

- [ ] **Step 2: Verify full login → dashboard → classroom flow**

1. Open `http://localhost:3000`
2. Enter valid PIN → redirected to dashboard
3. Click a session → redirected to classroom
4. Student name appears in header

- [ ] **Step 3: Verify route protection**

Open `http://localhost:3000/dashboard` in a new incognito window (no session). You should be redirected to `/`.

- [ ] **Step 4: Commit any remaining changes and tag**

```bash
git add -A
git commit -m "feat: LinguaLife fullstack MVP complete"
```

---

## Task 14: Vercel deploy

- [ ] **Step 1: Push to GitHub**

```bash
git push origin master
```

- [ ] **Step 2: Configure Vercel project**

In the Vercel dashboard:
1. Import the `LinguaLife` GitHub repo
2. Set **Root Directory** to `apps/web`
3. **Framework Preset**: Next.js (auto-detected)
4. Add Environment Variables:
   - `AIRTABLE_API_KEY` = (the real key)
   - `AIRTABLE_BASE_ID` = `app9ZtojlxX5FoZ7y`

- [ ] **Step 3: Deploy**

Click **Deploy**. Wait for build to complete. Expected: green deploy with no build errors.

- [ ] **Step 4: Smoke test on production URL**

1. Open the Vercel URL
2. Log in with PIN
3. Verify dashboard loads sessions
4. Verify classroom loads student + exercises
