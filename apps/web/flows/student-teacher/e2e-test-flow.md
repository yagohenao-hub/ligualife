# Flujo E2E: Registro Profesor + Alumno → Clase

Guia paso a paso para replicar el flujo completo de registro, activacion y primera clase entre un profesor y un alumno nuevo.

**URL Local**: http://localhost:3000
**URL Produccion**: https://lingualife.vercel.app
**Admin Token**: LinguaAdmin2025
**Tiempo estimado**: 10-15 minutos
**Ultima validacion**: 2026-04-02 (Playwright + localhost)

---

## Paso 1: Registrar Profesor

1. Ir a `/register/teacher`
2. Llenar:
   - Nombre: `[nombre real del profesor]`
   - Email: `[email real]`
   - WhatsApp: `+57 [numero]`
   - Pais: Colombia
3. Click "Siguiente"
4. Seleccionar **al menos 3 intereses** (ej: Cine, Gastronomia, Deportes)
5. Click "Siguiente"
6. En el grid de disponibilidad, seleccionar bloques horarios
   - Los bloques con borde morado = demanda de alumnos
   - Los bloques con borde verde = ya hay otros profesores (alta competencia)
   - Recomendado: elegir al menos 4 bloques (ej: Mar/Jue 2pm-3pm)
7. Click "Siguiente"
8. Llenar datos de pago:
   - Numero de Identificacion
   - Nombre del Banco
   - Tipo de Cuenta (Ahorros/Corriente)
   - Numero de Cuenta
9. Click "Finalizar Registro"
10. Debe aparecer: "Aplicacion Enviada!"

**Resultado en Airtable**: Nuevo record en tabla Teachers con PIN auto-generado (4 digitos). El profesor NO ve su PIN — se le comunica por WhatsApp/email cuando el admin lo apruebe.

---

## Paso 2: Registrar Alumno (matcheando con el profesor)

1. Ir a `/register/student`
2. Llenar:
   - Nombre: `[nombre del alumno]`
   - Email: `[email real]`
   - WhatsApp: `+57 [numero]`
   - Rango de edad: Jovenes/Adultos (14+)
3. Click "Siguiente"
4. Seleccionar objetivo (ej: Travel & Culture → asigna nivel A2 automaticamente)
   - General → B1
   - Business → B2
   - B2 to C1 → C1
   - Travel → A2
   - Marketing → B2
5. Click "Siguiente"
6. Seleccionar **al menos 5 intereses** — incluir los mismos que el profesor para matchear
7. Click "Siguiente"
8. En el grid de disponibilidad:
   - Los bloques con borde verde indican donde HAY profesores disponibles
   - **Seleccionar los mismos horarios** que el profesor registro para asegurar match
9. Opcionalmente activar "Voy a tomar clases grupales"
10. Click "Finalizar Registro"
11. Debe aparecer: "Registro Exitoso!" con **PIN visible en pantalla**

**Resultado en Airtable**: Nuevo record en Students con:
- Status = Pending
- PIN auto-generado (6 caracteres alfanumerico, unico contra Students + Teachers)
- Level guardado en campo Notes como "Level: A2 | Goal ID: recXXX"

**IMPORTANTE**: El alumno debe anotar su PIN — es la unica vez que lo ve.

---

## Paso 3: Activar en Admin

1. Ir a `/admin`, ingresar token `LinguaAdmin2025`
2. Tab "Alumnos" → buscar al alumno nuevo (Status=Pending)
3. Cambiar Status a "Active"
4. Asignar tokens (minimo 3 recomendado)
5. Tab "Profesores" → verificar que el profesor aparece con su PIN
6. **MANUAL EN AIRTABLE**: Ir a tabla Student-Teacher, crear record:
   - Student: [link al alumno]
   - Teacher: [link al profesor]
   - Status: Active

**Nota**: El PIN del alumno ya se genera automaticamente en el registro. No necesita asignacion manual.

**Via API** (mas rapido para el link Student-Teacher):
```
POST https://api.airtable.com/v0/app9ZtojlxX5FoZ7y/Student-Teacher
Headers: { Authorization: Bearer [AIRTABLE_API_KEY] }
Body: {
  "fields": {
    "Student": ["[studentRecordId]"],
    "Teacher": ["[teacherRecordId]"],
    "Status": "Active"
  },
  "typecast": true
}
```

---

## Paso 4: Generar Clases

**Via API** (recomendado):
```
POST /api/admin/generate-classes
Headers: { x-admin-token: LinguaAdmin2025 }
Body: {
  "studentId": "[id del alumno]",
  "teacherId": "[id del profesor]",
  "weeksToGenerate": 4
}
```

**Resultado**:
- N sesiones creadas en tabla Sessions + Session Participants
- Sesiones en festivos colombianos marcadas como Canceled con IsHoliday=true
- **Curriculum Topics asignados secuencialmente** a cada sesion (por campo Order)
- Horas almacenadas en UTC correcto (ej: 2pm Colombia = 19:00 UTC)

---

## Paso 5: Login Profesor

1. Ir a `/`
2. Ingresar el PIN del profesor (4 digitos, ver en Airtable campo PIN de Teachers)
3. Debe redirigir a `/dashboard`
4. Verificar:
   - Nombre del profesor correcto ("Bienvenido, [nombre]")
   - Solo sesiones del dia actual (filtro de fecha activo)
   - Si no hay sesiones hoy → "No tienes sesiones programadas para hoy."
   - Si hay sesiones → SessionCards con nombre alumno, hora Colombia, tema

---

## Paso 6: Entrar a Clase (Profesor)

1. En el dashboard, click en una sesion del dia
2. Debe ir a `/classroom?sessionId=recXXX`
3. Verificar:
   - Nombre del alumno correcto
   - Vertical (Travel, Business, etc. segun el goal)
   - **Intereses como nombres legibles** (NO record IDs como recXXX)
   - Malla curricular con topic asignado (titulo del tema, no "#? ...")
   - Link "Unirse a Reunion" si el profesor tiene Meeting Link
4. Click "Generar Slides" si no hay cache
5. Verificar que aparecen 4 slides + warmup + cooldown:
   - Slide 1: Logic Decoder (LDS formula)
   - Slide 2: Colombian Filter (errores tipicos)
   - Slide 3: Real-Life Chunks (expresiones)
   - Slide 4: Conversation & News
6. Click "Iniciar Clase" → timer arranca en fase Warmup (7 min)

---

## Paso 7: Login Alumno

1. Limpiar sessionStorage del navegador (DevTools → Application → Session Storage → Clear)
2. Ir a `/`
3. Ingresar el PIN del alumno (6 caracteres, el que vio en pantalla de registro)
4. Debe redirigir a `/student`
5. Verificar:
   - Nombre correcto ("Hola, [nombre]!")
   - Profesor asignado correcto ("tu progreso con [profesor]")
   - Tokens correctos (los que asigno el admin)
   - Sesiones proximas con **fechas y horas en hora Colombia**
   - Sesiones en festivos marcadas con badge "FESTIVO"
   - Barra de progreso (0% si es alumno nuevo)
   - Boton "Agendar Clase Extra" si tiene tokens

---

## Checklist de Validacion Rapida

Usar despues de cada deploy o cambio significativo:

- [ ] `/register/teacher` → 4 pasos → "Aplicacion Enviada!"
- [ ] `/register/student` → 4 pasos → "Registro Exitoso!" + PIN visible
- [ ] `/admin` → token funciona → metricas cargan → lista alumnos/profesores
- [ ] Login profesor → dashboard con sesiones del dia (o "No hay sesiones")
- [ ] Login alumno → dashboard con sesiones, tokens, profesor correcto
- [ ] Classroom → nombre alumno, intereses legibles, topics asignados
- [ ] Slides → 4 slides generados por Gemini, warmup/cooldown assets
- [ ] Horas en Colombia (2pm = 2pm, no 7pm ni 4am)
- [ ] Festivos colombianos detectados y marcados

---

## Issues Resueltos (historial)

| Issue | Fix | Commit | Fecha |
|-------|-----|--------|-------|
| Timezone UTC vs Colombia | UTC arithmetic con offset constante | `9252b55` | 2026-04-02 |
| PIN faltante en registro alumno | generatePin() + unicidad + pantalla exito | `e5b81e4` | 2026-04-02 |
| Interests como record IDs | Resolucion de linked records en student.ts | `e5b81e4` | 2026-04-02 |
| Sessions sin filtro de fecha | IS_SAME() en Airtable formula | `e5b81e4` | 2026-04-02 |
| Topics no asignados | Auto-asignacion secuencial post-creacion | `e5b81e4` | 2026-04-02 |
| Level nunca asignado | Goal→CEFR mapping, guardado en Notes | `0a5a959` | 2026-04-02 |
| Campo "Level" no existe en Airtable | Removido, info en Notes | `0a5a959` | 2026-04-02 |
| Auth faltante en generate-classes | x-admin-token check agregado | `1760153` | 2026-04-01 |
| JSON.parse sin try/catch | Proteccion en useRequireAuth, student.tsx | `1760153` | 2026-04-01 |
| Teacher name fallback inconsistente | Fallback 'Full Name' agregado | `1760153` | 2026-04-01 |

---

## Issues Pendientes

Ver documento completo: [issues.md](issues.md) (29 issues documentados)

Principales pendientes:
- No hay Status lifecycle para profesores en Airtable
- No hay asignacion automatica Student-Teacher desde admin UI
- Admin token visible en client-side JS
- Rate-teacher no persiste ratings
- totalTopics hardcodeado a 58
