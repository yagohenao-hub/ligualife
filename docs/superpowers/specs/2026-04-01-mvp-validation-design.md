# LinguaLife MVP — Spec de Validacion y Lanzamiento

**Fecha**: 2026-04-01
**Enfoque**: Validar y Pulir — cero codigo nuevo, 100% testing E2E y fix de bugs
**Objetivo**: Que el ciclo completo (admin activa estudiante → profesor dicta clase con slides AI → estudiante reagenda) funcione sin errores en produccion (Vercel)

---

## Contexto

LinguaLife tiene todo el codigo necesario para operar. El problema no es codigo faltante sino que nunca se ha validado el flujo completo end-to-end en produccion. El deploy en Vercel ya funciona y las variables de entorno estan configuradas. Hay datos parciales en Airtable.

## Alcance MVP

### Incluido (ya implementado, necesita validacion)

| Prioridad | Flujo | Ruta | Criterio de exito |
|-----------|-------|------|-------------------|
| P1 | Login profesor | `/` | PIN valido → redirect a `/dashboard` con datos en sessionStorage |
| P1 | Login estudiante | `/` | PIN valido → redirect a `/student` con teacher resuelto |
| P1 | Admin: CRUD estudiantes | `/admin` | Crear, editar status, asignar tokens |
| P1 | Admin: asignar profesor | `/admin` | Crear Student-Teacher link activo |
| P1 | Admin: generar clases | `/admin` | Bulk create N semanas, holidays marcados correctamente |
| P1 | Dashboard profesor: agenda | `/dashboard` | Ver SessionCards del dia con datos correctos |
| P1 | Classroom: sesion completa | `/classroom` | Cargar session+student+topic, generar slides Gemini, timer 3 fases, guardar notas |
| P2 | Dashboard estudiante | `/student` | Ver sesiones proximas/completadas, tokens, progreso |
| P2 | Reagendamiento con tokens | `/student` | Cancelar → token devuelto → seleccionar slot → redimir (group-aware) |
| P2 | Confirmacion de festivos | ambos dashboards | Dual confirmation teacher+student → session se reactiva |
| P3 | Registro estudiante | `/register/student` | Wizard 5 pasos → record en Airtable con Status=Pending |
| P3 | Registro profesor | `/register/teacher` | Wizard 4 pasos → record en Airtable |

### Excluido (codigo existe, se activa post-MVP)

- Scout YouTube (`/api/scout/*`)
- Story Studio (`/admin/story-studio`)
- Series Companion (`/series-companion`)
- Video Bank random (`/api/video-bank-random`)
- Stories processing (`/api/stories/*`)

Estos no se eliminan — simplemente no se validan ni se garantizan para el MVP.

## Datos Minimos en Airtable

Para validar el E2E se necesitan estos records minimos:

### Teachers (1 record)
| Campo | Valor ejemplo |
|-------|---------------|
| Name | "Sebastian" |
| PIN | "1234" |
| Email | email real |
| Phone | telefono real |
| Meeting Link | URL de Zoom/Meet |
| Availability | JSON boolean[][] (grid 15x7) |

### Students (2 records)
| Campo | Valor ejemplo |
|-------|---------------|
| Full Name | "Estudiante Test 1" |
| PIN | "5678" |
| Email | email real |
| Status | "Active" |
| Tokens de Reposicion | 3 |
| Interests | "Technology, Music" |
| Level | "B1" |
| Vertical | "General" |

### Student-Teacher (1-2 records)
| Campo | Valor |
|-------|-------|
| Student | [link al student] |
| Teacher | [link al teacher] |
| Status | "Active" |

### Curriculum Topics (10 records minimo)
| Campo | Valor ejemplo |
|-------|---------------|
| Title | "Present Simple - Daily Routines" |
| Description | "Describe daily activities using present simple" |
| Level | "B1" |
| Order | 1 (secuencial) |
| LDS Formula | "S + do/does + Action" |
| AI Context | "Focus on routine verbs: wake up, commute, work..." |

### Sessions + Session Participants
Se generan automaticamente via `POST /api/admin/generate-classes`.

## Checklist de Validacion E2E

Cada item se valida en produccion (Vercel). Si falla, se documenta el bug y se arregla antes de avanzar.

### P1 — Core (bloquea lanzamiento)

- [ ] **AUTH-1**: Profesor ingresa PIN → ve dashboard con su nombre
- [ ] **AUTH-2**: Estudiante ingresa PIN → ve dashboard con nombre + profesor asignado + tokens
- [ ] **AUTH-3**: PIN invalido → mensaje de error claro
- [ ] **ADMIN-1**: Admin accede a `/admin` con token correcto
- [ ] **ADMIN-2**: Admin crea estudiante manual → record aparece en Airtable
- [ ] **ADMIN-3**: Admin edita status de estudiante (Pending → Active)
- [ ] **ADMIN-4**: Admin asigna tokens a estudiante
- [ ] **ADMIN-5**: Admin genera 4 semanas de clases para 1 estudiante → sessions creadas en Airtable con participants
- [ ] **ADMIN-6**: Clases en festivos colombianos tienen Status=Canceled e IsHoliday=true
- [ ] **DASH-1**: Profesor ve SessionCards del dia actual
- [ ] **DASH-2**: SessionCard muestra nombre de estudiante, tema, hora correcta
- [ ] **CLASS-1**: Click en sesion → `/classroom` carga con datos de session, student, topic
- [ ] **CLASS-2**: Curriculum nav muestra topics y posicion actual
- [ ] **CLASS-3**: Click "Generar Slides" → Gemini retorna 4 slides + warmup + cooldown
- [ ] **CLASS-4**: Slides se renderizan correctamente (HTML dark theme)
- [ ] **CLASS-5**: Timer funciona: warmup (7min) → core (45min) → download (8min)
- [ ] **CLASS-6**: Notas de sesion se guardan en Airtable
- [ ] **CLASS-7**: "Finalizar clase" muestra info de proxima sesion

### P2 — Operacion recurrente

- [ ] **STU-1**: Estudiante ve sesiones proximas ordenadas por fecha
- [ ] **STU-2**: Estudiante ve sesiones completadas
- [ ] **STU-3**: Barra de progreso refleja topics completados/total
- [ ] **STU-4**: Estudiante ve cantidad de tokens correcta
- [ ] **RESCH-1**: Click reagendar → sesion cancelada → token devuelto
- [ ] **RESCH-2**: Modal de calendario muestra slots disponibles del profesor
- [ ] **RESCH-3**: Seleccionar slot → session creada → token descontado
- [ ] **RESCH-4**: Regla 24h: no permite agendar con menos de 24h
- [ ] **HOL-1**: Sesion en festivo muestra indicador visual
- [ ] **HOL-2**: Profesor confirma festivo → campo actualizado
- [ ] **HOL-3**: Estudiante confirma festivo → campo actualizado
- [ ] **HOL-4**: Ambos confirman → sesion reactiva (Status → Scheduled)

### P3 — Growth

- [ ] **REG-1**: `/register/student` carga correctamente (5 pasos)
- [ ] **REG-2**: Paso de disponibilidad muestra heatmap global
- [ ] **REG-3**: Submit → record creado en Students con Status=Pending
- [ ] **REG-4**: `/register/teacher` carga correctamente (4 pasos)
- [ ] **REG-5**: Submit → record creado en Teachers

## Proceso de Trabajo

1. **Poblar Airtable** con datos minimos (manual o script)
2. **Recorrer P1** en Vercel item por item, documentar bugs
3. **Arreglar bugs P1** hasta que todos los checks pasen
4. **Recorrer P2**, fix bugs
5. **Recorrer P3**, fix bugs
6. **Smoke test final**: recorrer todo P1+P2 una vez mas para confirmar que los fixes no rompieron nada

## Criterio de Lanzamiento

El MVP esta listo cuando:
- Todos los items P1 estan check
- Al menos 80% de P2 esta check
- P3 funciona (registro basico completo)
- No hay errores 500 en ningun flujo core

## Archivos Criticos

Estos son los archivos que mas probablemente necesiten fixes:

| Archivo | Razon |
|---------|-------|
| `pages/api/validate-unified.ts` | Auth — si falla, nada funciona |
| `pages/api/admin/generate-classes.ts` | Generacion masiva — logica compleja de holidays |
| `pages/api/generate-slides.ts` | Gemini — si el prompt falla, no hay clase |
| `pages/api/student/redeem-token.ts` | Token redemption — logica group-aware mas compleja |
| `pages/api/confirm-holiday.ts` | Festivos — dual confirmation |
| `pages/classroom.tsx` | UI mas compleja — timer, slides, sidebar, notes |
| `pages/dashboard.tsx` | UI del profesor — agenda, availability |
| `pages/student.tsx` | UI del estudiante — tokens, calendario, rating |
| `lib/airtable.ts` | Capa de datos — errores aqui afectan todo |
| `lib/holidays.ts` | Solo tiene 2026 — verificar que las fechas son correctas |
