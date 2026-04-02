# Falencias del Flujo Student-Teacher

Documento exhaustivo de todos los bugs, features faltantes, e inconsistencias encontrados en el ciclo completo: Registro → Activacion → Clase.

**Fecha**: 2026-04-02
**Metodo**: Auditoria de codigo (5 agentes) + testing E2E con Playwright en produccion

---

## CRITICOS (Bloquean la experiencia del usuario)

### 1. Timezone: Sesiones se generan y muestran en UTC, no en hora Colombia

**Archivos afectados**:
- `pages/api/admin/generate-classes.ts:97-98` — `new Date()` en Vercel es UTC
- `pages/api/session.ts:42` — `toLocaleTimeString` sin timezone explicito (parcialmente arreglado)
- `pages/api/student/redeem-token.ts:54-61` — fallback path usa UTC
- `pages/student.tsx:217` — calendario del cliente usa timezone del browser
- `pages/api/admin/metrics.ts:23-24` — ISO string comparison en UTC

**Impacto**: El alumno ve clases a las 4:00 AM en vez de 9:00 AM. El profesor ve "Hoy" para sesiones que son de otro dia en Colombia.

**Fix requerido**: 
- `generate-classes.ts`: Crear fechas en Colombia time (UTC-5) y almacenar en ISO con offset correcto
- `session.ts`: Usar `timeZone: 'America/Bogota'` en todos los formateos (ya parcialmente aplicado)
- `sessions.ts`: Filtro de "hoy" debe usar fecha Colombia, no UTC
- `student/sessions.ts`: Mismo fix
- Considerar guardar las horas como "2026-04-02T09:00:00-05:00" en vez de "2026-04-02T09:00:00.000Z"

---

### 2. Registro de alumno NO genera PIN

**Archivo**: `pages/api/register/student.ts`

**Impacto**: El alumno se registra exitosamente pero no puede hacer login. El admin debe ir a Airtable manualmente, inventar un PIN, verificar que sea unico, y asignarlo. Esto rompe el flujo de onboarding.

**Fix requerido**: Copiar la logica de generacion de PIN de `pages/api/admin/students.ts:6-14` (funcion `generatePin`) al endpoint de registro de estudiante. Retornar el PIN en la pantalla de exito.

---

### 3. Intereses del alumno se muestran como Record IDs en el Classroom

**Archivo**: `pages/classroom.tsx` (sidebar de perfil del alumno)

**Impacto**: El profesor ve `recaXEw7B7OlBq7uq` en vez de "Inteligencia Artificial & Tech". Esto hace que la informacion del alumno sea ilegible.

**Causa**: El campo Interests en Airtable es un Linked Record field que almacena IDs. Cuando el classroom fetcha el student record, obtiene los IDs pero no resuelve los nombres.

**Fix requerido**: En el endpoint que carga el student para el classroom, hacer un lookup de cada interest ID para obtener el nombre. O cambiar el campo en Airtable a un campo de texto plano (como lo hace el registro que guarda strings directamente).

---

### 4. Sesiones se generan sin Curriculum Topics asignados

**Archivo**: `pages/api/admin/generate-classes.ts`

**Impacto**: El classroom muestra "#? Hoy ..." sin nombre de tema. El profesor no sabe que ensenar. Los slides no se pueden generar correctamente porque no hay contexto de topic.

**Causa**: `generate-classes.ts` crea sesiones con campo `Teacher`, `Scheduled Date/Time`, `Status`, pero NUNCA asigna un `Curriculum Topic`. La asignacion de topics es un proceso separado que no existe automatizado.

**Fix requerido**: Al generar clases, tambien asignar topics secuencialmente:
1. Buscar los Curriculum Topics ordenados por `Order`
2. Asignar topic 1 a sesion 1, topic 2 a sesion 2, etc.
3. Si hay mas sesiones que topics, reciclar o dejar vacio las ultimas

---

## ALTOS (Degradan la experiencia significativamente)

### 5. Registro de profesor no tiene campo Status

**Archivo**: `pages/api/register/teacher.ts`

**Impacto**: Los profesores registrados no tienen lifecycle state. No se puede filtrar por activos/pendientes en el admin. El matchmaker no puede distinguir entre profesores aprobados y pendientes.

**Fix requerido**: Agregar campo Status a la tabla Teachers en Airtable, y setearlo a "Pending" en el registro. Requiere conocer el field ID de Airtable para ese campo.

---

### 6. No hay asignacion automatica de Student-Teacher

**Impacto**: Despues de registrar un alumno y un profesor con horarios e intereses compatibles, el admin debe ir manualmente a Airtable para crear el link Student-Teacher. No hay UI para esto en el admin panel (el Matchmaker solo muestra candidatos, no crea el link automaticamente).

**Fix requerido**: Agregar boton en el admin panel que, dado un alumno y un profesor, cree el record en Student-Teacher con Status=Active.

---

### 7. Dashboard del profesor muestra todas las sesiones como "Hoy"

**Archivo**: `pages/api/sessions.ts`

**Impacto**: Todas las sesiones futuras aparecen en la agenda del dia actual porque el filtro de fecha compara en UTC. Una sesion del 7 de abril a las 9am Colombia se guarda como 7 abril 14:00 UTC, pero el filtro de "hoy" en el servidor (UTC) puede incluirla incorrectamente.

**Relacionado con**: Issue #1 (Timezone)

---

### 8. No hay proteccion contra generacion duplicada de clases

**Archivo**: `pages/api/admin/generate-classes.ts`

**Impacto**: Si el admin clickea "Generar Clases" dos veces para el mismo alumno, se crean sesiones duplicadas. No hay verificacion de sesiones existentes.

**Fix requerido**: Antes de generar, verificar si ya existen sesiones futuras Scheduled para ese student+teacher. Si existen, preguntar o rechazar.

---

### 9. Registro de alumno: campo email no valida formato

**Archivos**: `pages/register/student.tsx`, `pages/api/register/student.ts`

**Impacto**: Se puede registrar con email invalido (ej: "asdf"). La API solo valida que `fullName` y `email` no esten vacios, pero no valida formato.

---

### 10. Availability grid: formato inconsistente entre registro y generate-classes

**Archivos**: 
- `pages/register/student.tsx` — guarda como JSON string de boolean[][]
- `pages/api/admin/generate-classes.ts:78` — parsea como boolean[][]
- `pages/admin.tsx:354-361` — parsea como string[] de "Day-Hour" tags

**Impacto**: Si un admin usa el matchmaker (que espera string[]) y luego genera clases (que espera boolean[][]), puede haber inconsistencia. El registro guarda boolean[][] pero otros flujos pueden guardar en formato diferente.

---

## MEDIOS (Funcionan pero con UX degradada)

### 11. AI Copilot Chat no verifica res.ok antes de parsear

**Archivo**: `pages/classroom.tsx:275` (parcialmente arreglado)

**Estado**: Ya arreglado en el ultimo commit, pendiente de verificar en produccion.

---

### 12. Session notes se pueden perder si la pagina navega antes de guardar

**Archivo**: `pages/classroom.tsx:341-360` (parcialmente arreglado)

**Estado**: `router.push` ahora tiene `await`, pero si el usuario cierra el tab, las notas se pierden.

---

### 13. Hardcoded `totalTopics: 58` en el student dashboard

**Archivos**: `pages/api/student/sessions.ts:93`, `pages/student.tsx:43`

**Impacto**: Todos los alumnos ven la barra de progreso sobre 58 temas sin importar su curriculo real. Un alumno de nivel B1 con 20 topics ve "3% completado" cuando en realidad completó 2 de 20 (10%).

**Fix requerido**: Contar los topics reales del curriculo del alumno dinamicamente.

---

### 14. Rate-teacher no persiste ratings

**Archivo**: `pages/api/student/rate-teacher.ts:9`

**Impacto**: El alumno califica al profesor, la UI muestra exito, pero el rating se pierde (solo `console.log`). No hay tabla de Reviews en Airtable.

---

### 15. Confirm-holiday no verifica que el usuario sea participante

**Archivo**: `pages/api/confirm-holiday.ts:7-8`

**Impacto**: Cualquier usuario con un sessionId puede confirmar festivos de cualquier sesion. El parametro `role` viene del cliente sin verificacion.

---

### 16. generatePin en admin/students.ts puede colisionar con PINs de profesores

**Archivo**: `pages/api/admin/students.ts:6-14`

**Impacto**: El PIN generado se verifica contra Students y Teachers, pero usa un bucle de solo 5 intentos. Con muchos usuarios, podria no encontrar un PIN unico.

---

### 17. Wizard de registro: boton "Atras" puede resetear el estado

**Archivos**: `pages/register/student.tsx`, `pages/register/teacher.tsx`

**Impacto**: En el testing con Playwright, el state del wizard se reseteo al interactuar con el grid de disponibilidad. Los clicks de JavaScript no triggerearon el state de React — solo clicks nativos del browser funcionan.

---

### 18. Campo "bio" en registro de profesor nunca se envia

**Archivo**: `pages/api/register/teacher.ts:10,33`

**Impacto**: El API destructura `bio` del body, pero el frontend teacher.tsx no tiene campo de bio. El field ID `fldQRe6IyWnpQhASO` siempre recibe `undefined`.

---

## BAJOS (Cosmeticos o edge cases)

### 19. Step indicator del wizard de profesor muestra 4 dots pero tiene 5 steps

**Archivo**: `pages/register/teacher.tsx:130,146`

**Impacto**: En la pantalla de exito (step 5), los dots muestran step 4 como activo, no step 5.

---

### 20. Holidays solo tiene datos de 2026

**Archivo**: `lib/holidays.ts`

**Impacto**: Si se generan clases para enero 2027 en adelante, los festivos no se detectan.

---

### 21. useRouter importado pero no usado en registration pages

**Archivos**: `pages/register/student.tsx:3`, `pages/register/teacher.tsx:3`

**Impacto**: Dead code. No hay redirect despues del registro exitoso.

---

### 22. No hay paginacion en las queries de Airtable

**Archivos**: Multiples endpoints

**Impacto**: Si hay >100 records en una tabla, solo se retornan los primeros 100. No afecta al MVP con pocos usuarios.

---

## Resumen de Prioridades

| Prioridad | Issues | Accion |
|-----------|--------|--------|
| CRITICO (bloquea) | #1 Timezone, #2 PIN alumno, #3 Interests IDs, #4 Topics no asignados | Arreglar antes de primer alumno real |
| ALTO (degrada) | #5-#10 | Arreglar en la primera semana |
| MEDIO (funciona mal) | #11-#18 | Arreglar iterativamente |
| BAJO (cosmetico) | #19-#22 | Backlog |
