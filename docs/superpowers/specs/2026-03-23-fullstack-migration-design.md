# LinguaLife — Migración Fullstack

**Fecha:** 2026-03-23
**Estado:** Aprobado

## Contexto

LinguaLife es un dashboard para profesores de idiomas. Actualmente es una app frontend-only (HTML/CSS/JS vanilla) que accede a Airtable directamente desde el browser, exponiendo la API key en el código cliente.

**Objetivo:** migrar a un monorepo Next.js fullstack desplegable en Vercel, con el backend actuando como proxy seguro hacia Airtable.

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | Next.js (React) + CSS Modules |
| Backend | Next.js API Routes (Vercel Serverless Functions) |
| Base de datos | Airtable (sin migración de datos) |
| Deploy | Vercel (root directory: `apps/web`) |
| Lenguaje | TypeScript |

## Estructura del monorepo

```
LinguaLife-main/
├── apps/
│   └── web/                        ← Next.js app
│       ├── pages/
│       │   ├── index.tsx           ← Login con PIN
│       │   ├── dashboard.tsx       ← Vista principal del profesor
│       │   └── classroom.tsx       ← Vista de clase activa (?sessionId=)
│       ├── pages/api/
│       │   ├── sessions.ts         ← GET /api/sessions
│       │   ├── session.ts          ← GET /api/session (detalle de una sesión)
│       │   ├── teacher/
│       │   │   └── validate.ts     ← POST /api/teacher/validate
│       │   ├── student.ts          ← GET /api/student
│       │   ├── topic.ts            ← GET /api/topic
│       │   └── exercises.ts        ← GET /api/exercises
│       ├── components/
│       │   ├── SessionCard.tsx
│       │   ├── ExerciseCard.tsx
│       │   ├── TopicPanel.tsx
│       │   └── PinInput.tsx
│       ├── context/
│       │   └── AppContext.tsx      ← Estado global (reemplaza state.js)
│       ├── hooks/
│       │   └── useRequireAuth.ts   ← Protección de rutas + acceso a sesión
│       ├── types/
│       │   └── index.ts            ← Tipos de dominio (Teacher, Session, etc.)
│       ├── lib/
│       │   └── airtable.ts         ← Cliente Airtable (solo server-side)
│       ├── styles/                 ← CSS Modules (glassmorphism portado)
│       ├── public/
│       ├── .env.local.example      ← plantilla de variables de entorno
│       ├── next.config.js
│       ├── tsconfig.json
│       └── package.json            ← name: "lingualife-web"
├── dashboard/                      ← código original (referencia, no se modifica)
├── docs/
└── package.json                    ← workspace root: { "workspaces": ["apps/*"] }
```

## TypeScript — Tipos de dominio

```typescript
// apps/web/types/index.ts

// Teacher: datos completos del registro en Airtable (solo usado server-side)
export interface Teacher {
  id: string
  name: string
  pin: string
}

// AuthTeacher: datos del profesor autenticado almacenados en AppContext y sessionStorage
// No incluye pin (nunca sale del servidor)
export interface AuthTeacher {
  id: string   // teacherId retornado por /api/teacher/validate
  name: string
}

export interface Session {
  id: string
  teacherId: string
  studentId: string
  topicId: string    // ID del tópico curricular asociado a la sesión
  date: string       // ISO 8601 e.g. "2026-03-23"
  time: string       // "HH:MM"
  status: string
}

export interface Student {
  id: string
  name: string
  level: string
  notes?: string
}

export interface Topic {
  id: string
  title: string
  description: string
  level: string
}

export interface Exercise {
  id: string
  studentId: string
  description: string
  type: string
  date: string       // ISO 8601 e.g. "2026-03-20"
}
```

## Airtable — Tablas y campos

Los nombres de tabla y campos se toman del código actual en `dashboard/js/api.js`:

| Tabla Airtable | Tipo TS | Campos utilizados |
|---|---|---|
| `Sessions` | `Session` | `Teacher`, `Student`, `Topic`, `Date`, `Time`, `Status` |
| `Teachers` | `Teacher` | `Name`, `PIN` |
| `Students` | `Student` | `Name`, `Level`, `Notes` |
| `Curriculum Topics` | `Topic` | `Title`, `Description`, `Level` |
| `Exercises` | `Exercise` | `Student`, `Description`, `Type`, `Date` |

### Cliente Airtable (`lib/airtable.ts`)

```typescript
const BASE_ID = process.env.AIRTABLE_BASE_ID!
const API_KEY = process.env.AIRTABLE_API_KEY!

export async function fetchFromAirtable(table: string, params = '') {
  const res = await fetch(
    `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(table)}?${params}`,
    { headers: { Authorization: `Bearer ${API_KEY}` } }
  )
  if (!res.ok) throw new Error(`Airtable error: ${res.status}`)
  return res.json()
}
```

## Backend — API Routes (contratos)

### `POST /api/teacher/validate`

**Request body:**
```json
{ "pin": "1234" }
```

**Response 200:**
```json
{ "teacherId": "recXXXXXX", "name": "Nombre Profesor" }
```

**Response 401:**
```json
{ "error": "PIN inválido" }
```

---

### `GET /api/sessions?teacherId=recXXXXXX&date=2026-03-23`

**Response 200:**
```json
[
  {
    "id": "recXXX",
    "teacherId": "recTTT",
    "studentId": "recYYY",
    "topicId": "recZZZ",
    "time": "09:00",
    "date": "2026-03-23",
    "status": "scheduled"
  }
]
```

**Response 400 — parámetros faltantes:** `{ "error": "teacherId y date son requeridos" }`
**Response 400 — formato de fecha inválido:** `{ "error": "date debe tener formato YYYY-MM-DD" }`
**Response 500:** `{ "error": "Error al obtener sesiones" }`

---

### `GET /api/session?id=recXXXXXX`

Resuelve una sesión por ID para obtener `studentId` y `topicId`.

**Response 200:**
```json
{
  "id": "recXXX",
  "teacherId": "recTTT",
  "studentId": "recYYY",
  "topicId": "recZZZ",
  "time": "09:00",
  "date": "2026-03-23",
  "status": "scheduled"
}
```

**Response 400:** `{ "error": "id es requerido" }`
**Response 404:** `{ "error": "Sesión no encontrada" }`
**Response 500:** `{ "error": "Error al obtener sesión" }`

---

### `GET /api/student?id=recXXXXXX`

**Response 200:**
```json
{ "id": "recXXX", "name": "Nombre", "level": "B2", "notes": "..." }
```

**Response 400:** `{ "error": "id es requerido" }`
**Response 404:** `{ "error": "Estudiante no encontrado" }`
**Response 500:** `{ "error": "Error al obtener estudiante" }`

---

### `GET /api/topic?id=recXXXXXX`

**Response 200:**
```json
{ "id": "recXXX", "title": "...", "description": "...", "level": "B2" }
```

**Response 400:** `{ "error": "id es requerido" }`
**Response 404:** `{ "error": "Tópico no encontrado" }`
**Response 500:** `{ "error": "Error al obtener tópico" }`

---

### `GET /api/exercises?studentId=recXXXXXX`

**Response 200:**
```json
[
  { "id": "recXXX", "studentId": "recYYY", "description": "...", "type": "grammar", "date": "2026-03-20" }
]
```

**Response 400:** `{ "error": "studentId es requerido" }`
**Response 500:** `{ "error": "Error al obtener ejercicios" }`

## Autenticación

El login es **client-side only** (igual al comportamiento actual). No hay JWT ni sesión de servidor.

Flujo:
1. `POST /api/teacher/validate` con el PIN
2. Si `200`: guardar `{ teacherId, name }` en `sessionStorage` como `lingualife_session`
3. Rutas protegidas leen `sessionStorage` en un hook `useRequireAuth` (client-side, `useEffect`)
4. Si no hay sesión: `router.replace('/')`

**Nota:** la validación server-side del token queda fuera del scope del MVP. La seguridad principal es que la API key de Airtable nunca llega al cliente.

### Hook de protección de rutas y acceso a sesión

```typescript
// hooks/useRequireAuth.ts
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

Las páginas protegidas llaman `const session = useRequireAuth()` y usan `session?.teacherId` para los fetches.

## Frontend — Páginas

### `pages/index.tsx` — Login
- Muestra `PinInput`
- Al submit: `POST /api/teacher/validate`
- Si OK: guarda sesión y redirige a `/dashboard`

### `pages/dashboard.tsx` — Dashboard
- Llama `useRequireAuth()`
- **Guard:** no fetcha hasta que `session !== null`
- Fetch a `GET /api/sessions?teacherId=session.id&date=YYYY-MM-DD` (fecha de hoy en ISO 8601)
- **Loading state:** mostrar spinner mientras fetcha
- **Error state:** mostrar mensaje de error con el campo `error` de la respuesta
- Guarda sesiones en estado local (`useState`)
- Renderiza lista de `SessionCard`
- Click en sesión → `setAppState({ currentSession })` y navega a `/classroom?sessionId=recXXX`

### `pages/classroom.tsx` — Classroom
- Llama `useRequireAuth()`
- Lee `sessionId` de `router.query`
- **Guard de hidratación:** no inicia ningún fetch hasta que `session !== null && router.isReady === true`
- Primero: `GET /api/session?id=sessionId` → obtiene `{ studentId, topicId }`
  - Si 404: redirigir a `/dashboard` con mensaje de error
  - Si 500: mostrar mensaje de error en pantalla
- Luego (paralelo): `GET /api/student?id=studentId`, `GET /api/topic?id=topicId`, `GET /api/exercises?studentId=studentId`
- Guarda resultados en `AppContext` (via `setAppState`)
- **Loading state:** mostrar spinner mientras cualquier fetch está en curso
- **Error state:** mostrar mensaje de error con el campo `error` de la respuesta
- Renderiza `ExerciseCard[]` + `TopicPanel`

## Estado global (`context/AppContext.tsx`)

```typescript
interface AppState {
  teacher: AuthTeacher | null   // AuthTeacher (sin pin), no Teacher completo
  currentSession: Session | null
  student: Student | null
  topic: Topic | null
  exercises: Exercise[]
}

interface AppContextValue {
  state: AppState
  setAppState: (patch: Partial<AppState>) => void
}
```

**Inicialización y uso:**

- `AppProvider` envuelve toda la app en `_app.tsx` con estado inicial vacío (todos `null`)
- `pages/index.tsx` llama `setAppState({ teacher: { id: teacherId, name } })` tras login exitoso (`AuthTeacher`)
- `pages/dashboard.tsx` llama `setAppState({ currentSession })` cuando el profesor elige una sesión
- `pages/classroom.tsx` llama `setAppState({ student, topic, exercises })` tras resolver los datos de la sesión
- Los componentes leen `state.student`, `state.topic`, etc. via `useContext(AppContext)`

El contexto reemplaza `state.js`. Solo persiste en memoria durante la sesión del browser (se pierde al recargar; el PIN vuelve a pedirse).

## Variables de entorno

### `apps/web/.env.local.example`
```
AIRTABLE_API_KEY=your_api_key_here
AIRTABLE_BASE_ID=your_base_id_here
```

En Vercel: configurar en Settings → Environment Variables. El archivo `.env.local` va en `.gitignore`.

## Monorepo — configuración npm workspaces

### `package.json` (raíz)
```json
{
  "name": "lingualife-monorepo",
  "private": true,
  "workspaces": ["apps/*"]
}
```

### Vercel — configuración
- **Root Directory**: `apps/web`
- **Framework Preset**: Next.js
- El resto se detecta automáticamente

## Flujo de datos

```
Browser (React page)
  → fetch /api/*
    → Vercel Serverless Function
      → Airtable REST API
        → respuesta JSON
          → React state (Context)
            → re-render
```

## Criterios de éxito del MVP

- [ ] `POST /api/teacher/validate` retorna 200 con PIN válido y 401 con PIN inválido
- [ ] Dashboard muestra las sesiones del día del profesor autenticado
- [ ] Classroom muestra nombre del estudiante, al menos un ejercicio y el tópico activo
- [ ] `AIRTABLE_API_KEY` no aparece en ninguna respuesta ni en el bundle del cliente (verificar con `grep -r AIRTABLE_API_KEY .next/` tras build — debe retornar vacío)
- [ ] `vercel deploy` (con Root Directory configurado en `apps/web` en el dashboard de Vercel) completa sin errores de build
- [ ] Ruta `/dashboard` sin sesión activa redirige a `/`

## Fuera de scope (MVP)

- Migración de base de datos (Airtable se mantiene)
- Tests automatizados
- Autenticación server-side (JWT, cookies httpOnly)
- Sistema de roles o permisos adicionales
- Internacionalización
