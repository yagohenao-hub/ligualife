# ✅ Checklist Maestra — Sprint de Lanzamiento MVP & Consolidación v1.0

**Inicio del Sprint:** 19 de noviembre de 2026  
**Hito Comercial (Flujo de Caja):** Lanzamiento campaña de diciembre → **Meta: 20 alumnos pagos (~$9.0M COP facturados / ~$2.2M COP libres)**  
**Hito Técnico Crítico:** **Semana del 15 de diciembre** (Visita de apoyo de Programador Senior → Cierre y despliegue de **LinguaLife v1.0**)

---

## 🗄️ BLOQUE 1: Base de Datos & Auditoría del Currículo (Supabase + Catálogos)

*Objetivo: Garantizar que no haya datos rotos, registros de prueba mezclados con alumnos reales, ni temas incompletos antes de recibir pagos.*

### 1.1 Limpieza y Salud de Supabase (PostgreSQL)
- [ ] Auditar las tablas activas en Supabase contra los esquemas ([schema_17_tables.sql](file:///c:/Users/Usuario/Documents/Antigravity/LinguaLife/apps/web/scripts/schema_17_tables.sql) y [vocabulary_schema.sql](file:///c:/Users/Usuario/Documents/Antigravity/LinguaLife/apps/web/scripts/vocabulary_schema.sql)):
  - `students`, `teachers`, `sessions`, `session_participants`
  - `curriculum_topics`, `student_topic_progress`, `topic_mastery`
  - `vocabulary_words`, `vocabulary_senses`, `student_vocabulary_progress`
  - `teacher_ratings`, `holidays`
- [ ] Depurar registros de prueba/basura (alumnos ficticios, sesiones huérfanas, tokens negativos o duplicados) y crear 1 usuario oficial `DEMO_STUDENT` + `DEMO_TEACHER` claramente marcados para pruebas.
- [ ] Verificar que los **PINs de acceso** de los estudiantes activos sean únicos y no existan colisiones en la tabla `students`.
- [ ] Revisar el adaptador [database.ts](file:///c:/Users/Usuario/Documents/Antigravity/LinguaLife/apps/web/lib/database.ts) para confirmar qué operaciones siguen tocando Airtable ([airtable.ts](file:///c:/Users/Usuario/Documents/Antigravity/LinguaLife/apps/web/lib/airtable.ts)) y documentarlas para migrarlas 100% a Supabase.
- [ ] Configurar/verificar **backups automáticos diarios** en el dashboard de Supabase y hacer un export manual SQL de respaldo antes de lanzar.

### 1.2 Revisión Exhaustiva de los 60 Temas del Currículo
- [ ] Auditar los **60 temas** en [curriculum-summary.ts](file:///c:/Users/Usuario/Documents/Antigravity/LinguaLife/apps/web/lib/curriculum-summary.ts) y en la tabla `curriculum_topics` de Supabase verificando para cada bloque (1–15, 16–30, 31–45, 46–60):
  - [ ] Títulos limpios en español/inglés (sin siglas internas expuestas como `(S+T+A)` o `LDS` en los textos visibles al alumno).
  - [ ] Nivel MCER (`A1` a `C2`) y fase (`Installer`, `Builder`, etc.) consistentes.
  - [ ] `concept` y `correctMethod` claros, cortos y sin errores tipográficos.
  - [ ] Mínimo 3–4 `examples` reales (`en` + `es`) por tema (clave porque alimentan el sintetizador de Trivia).
  - [ ] `commonMistake` completo (`wrong`, `correct`, `explanation`) en todos los temas (evitar placeholders como `"N/A"` o `"Traducir literalmente"` en temas troncales).
- [ ] Revisar el catálogo de lecturas cortas ([short-reading-seed.ts](file:///c:/Users/Usuario/Documents/Antigravity/LinguaLife/apps/web/lib/short-reading-seed.ts)) y validar que el fallback funcione para los 60 temas si Gemini demora.
- [ ] Revisar las diapositivas cacheadas (`cached_slides` en Supabase / `/api/slides-cache`) de los primeros 15 temas (los que verán los alumnos nuevos en diciembre) para asegurar que no haya HTML roto, tablas desbordadas ni errores ortográficos.

### 1.3 Revisión del Banco de Vocabulario Polisémico
- [ ] Auditar [vocabulary.ts](file:///c:/Users/Usuario/Documents/Antigravity/LinguaLife/apps/web/lib/vocabulary.ts) en sus 4 categorías (`time_words`, `prepositions_in_on_at`, `wh_words`, `cefr_general` niveles `A1`, `A2`, `B1`, `B2`, `C1`, `C2`).
- [ ] Verificar que en `cefr_general` cada nivel (`A1`–`C2`) devuelva palabras reales, con al menos 2 acepciones polisémicas, IPA correcto, ejemplos en inglés/español y lectura corta adaptada.
- [ ] Probar la sincronización del estado de cada palabra (`to_learn` → `passive` → `mastered`) contra `/api/student/vocabulary` para que no se pierda al cambiar de dispositivo.

---

## ⚙️ BLOQUE 2: Revisión Técnica End-to-End de Cada Parte del Producto (QA del MVP)

*Objetivo: Probar cada pantalla como un cliente real exigente en computador y en celular antes de meter tráfico pago.*

### 2.1 Landing Page & Accesos (`/`, `/login`, `/register/*`)
- [ ] Revisar la Landing Page ([index.tsx](file:///c:/Users/Usuario/Documents/Antigravity/LinguaLife/apps/web/pages/index.tsx)): propuesta de valor alineada con la campaña de diciembre, precios actualizados y botón directo al WhatsApp corporativo.
- [ ] Probar flujo de ingreso en `/login` (alumno por PIN, profesor, admin) verificando mensajes de error claros si el PIN es incorrecto.
- [ ] Verificar que las páginas legales ([terms.tsx](file:///c:/Users/Usuario/Documents/Antigravity/LinguaLife/apps/web/pages/terms.tsx) y [privacy.tsx](file:///c:/Users/Usuario/Documents/Antigravity/LinguaLife/apps/web/pages/privacy.tsx)) carguen correctamente y tengan texto real actualizado (no plantilla genérica).

### 2.2 Portal del Alumno (`/student` y `/student/vocabulary`) — Core MVP
- [ ] **Próximas Clases & Reagendamiento:**
  - Confirmar que solo se muestra la siguiente clase por defecto y que el botón `Ver todas (N)` despliega el resto correctamente.
  - Probar cancelar una clase con **más de 24h** de anticipación → confirmar que desaparece de la agenda y suma `+1 Token`.
  - Probar intentar cancelar con **menos de 24h** → confirmar que el sistema lo bloquea con mensaje claro.
- [ ] **Canje de Tokens:**
  - Abrir el modal de canje, ver disponibilidad real del profesor, agendar una hora libre y verificar que descuenta `-1 Token` y crea la sesión tanto en `/student` como en `/dashboard` del profesor sin duplicados.
- [ ] **Validación de los 4 Botones Core (en Temas Vistos y en Vocabulario):**
  - [ ] **1. Resumen:** Se lee bien en móvil sin desbordamiento horizontal; el contraste es claro.
  - [ ] **2. Repaso (15 retos):** Verificar que en `Fill the Pattern` el `[___]` **nunca** deje la solución escrita al lado; probar envío y verificación en los 15 ítems.
  - [ ] **3. Trivia Infinita:** Jugar una racha de **25+ preguntas seguidas** en un tema y en vocabulario → confirmar que **jamás se congela en la misma pregunta**, que el nivel escala (`Base` → `Ágil` → `Master`), que los sonidos suenan bien, que el confeti dispara en rachas de 5/10/15 y que el rango (`Bronze`–`Platinum`) se guarda en Supabase (`/api/student/topic-mastery`).
  - [ ] **4. Short Reading:** Probar las 3 velocidades de audio (`0.5x`, `0.75x`, `1.0x`), el botón `Ver ES / Ocultar ES` y la pregunta de comprensión.
- [ ] **Deep-links:** Confirmar que los 4 botones de Vocabulario en `/student` abren directamente cada modo (`?mode=resumen`, `repaso`, `trivia`, `reading`) en `/student/vocabulary`.

### 2.3 Portal del Profesor (`/dashboard` y `/classroom`)
- [ ] Iniciar sesión como profesor y revisar la vista de agenda semanal y lista de alumnos asignados.
- [ ] Entrar al aula (`/classroom`) para una clase programada:
  - Verificar carga de notas de la clase anterior (`/api/previous-notes`).
  - Verificar carga/generación de slides del tema (`/api/generate-slides`).
  - Guardar notas de sesión (`/api/session-notes`) y ejecutar **Finalizar Clase** (`/api/finalize-session`).
  - Confirmar que al instante el tema aparece como **Completado** en el portal del alumno con sus 4 botones desbloqueados.
- [ ] Probar la edición de horarios disponibles del profesor (`/api/teacher/availability`) y confirmar que se refleja de inmediato en el calendario de canje de tokens del alumno.

### 2.4 Panel de Administración (`/admin`)
- [ ] Probar el alta completa de un alumno nuevo (nombre, WhatsApp, PIN, profesor asignado, horario fijo, paquete de clases).
- [ ] Probar la generación automática de clases del mes (`/api/admin/generate-classes`) y la gestión de días festivos (`/api/confirm-holiday`).
- [ ] Verificar que las métricas de `/admin` (`/api/admin/metrics`) muestren conteo real de clases dictadas por profesor (clave para liquidar los $240.000 COP / mes [$30.000/h × 8 clases] por alumno sin errores).

### 2.5 WhatsApp Pocket Coach (`Evolution API` + `Railway` + `Gemini`)
- [ ] Configurar el **celular dedicado** con la SIM corporativa fija (WhatsApp Business instalado, cargador permanente, Wi-Fi estable, ahorro de batería desactivado).
- [ ] Vincular la instancia en **Evolution API (Railway)** y probar envío/recepción de mensajes durante 48 horas continuas sin desconexiones.
- [ ] Probar el flujo completo del alumno por WhatsApp:
  - Recepción del micro-reto diario (cron de las 8:00 AM).
  - Respuesta por **texto** → feedback cálido de Gemini en < 3 segundos.
  - Respuesta por **nota de voz** → transcripción/evaluación correcta.
- [ ] Verificar que si la instancia de WhatsApp se desconecta, llegue una alerta inmediata.

---

## 🛡️ BLOQUE 3: Puntos Ciegos Críticos (Lo que Suele Romper un MVP en Producción)

*Estos ítems son obligatorios para evitar sustos con clientes reales.*

- [ ] **Pruebas en Dispositivos Reales (iOS Safari + Android Chrome):**
  - Verificar que el audio de `sound-effects.ts` y `Web Speech API` funcione en iPhone (iOS bloquea audio si no se inicializa en un evento `click`/`touchstart`).
  - Verificar que el teclado del celular no tape el input ni el botón "Verificar" en el modal de Repaso.
- [ ] **Zonas Horarias (Timezones):**
  - Probar crear/reagendar una clase simulando un alumno en otro huso horario (ej. EE. UU. / España / México) vs. profesor en Colombia (`America/Bogota`, UTC-5) para evitar desfaces de 1 hora por horario de verano.
- [ ] **Control de Costos de IA (Gemini API):**
  - Configurar alertas de facturación (`Budget Alerts`) en Google Cloud Console a $10, $25 y $50 USD.
  - Verificar que `GEMINI_API_KEY` y llaves de Supabase solo existan en variables de entorno de Vercel (jamás expuestas con `NEXT_PUBLIC_`).
- [ ] **Monitoreo de Caídas (Uptime) y Errores:**
  - Conectar **UptimeRobot** o **BetterStack** (gratis) al endpoint `/api/health` y al servidor de Evolution API en Railway con alerta a Telegram/Email.
  - Verificar que `npm run build` / despliegue en Vercel pase limpio sin warnings críticos en producción.
- [ ] **Kit de Onboarding "Día 0" para Alumno Nuevo:**
  - Crear plantilla de mensaje de bienvenida de WhatsApp con: (1) Link al portal, (2) PIN personal, (3) Link fijo de videollamada, (4) Video Loom/Reels de 60 segundos explicando los 4 botones y cómo reagendar con tokens.
  - Crear protocolo de soporte rápido ("¿Qué pasa si se cae la videollamada?", "¿Qué pasa si el alumno olvida su PIN?").

---

## 👨‍💻 BLOQUE 4: Agenda Quirúrgica — Semana del 15 de Diciembre (Apoyo Técnico → v1.0)

*Objetivo: Aprovechar al 100% la semana de visita técnica en arquitectura, seguridad y escalabilidad — llegar el lunes 15 con todo preparado para cerrar la versión 1.0.*

### 4.1 Preparación Obligatoria (Antes del 14 de diciembre)
- [ ] Tener listos accesos temporales o de colaborador a: **GitHub**, **Vercel**, **Supabase**, **Railway** y **Google Cloud**.
- [ ] Tener documentado el archivo de **Bugs & Fricciones Reales** reportados por los primeros alumnos de diciembre (priorizados de P0 a P2).
- [ ] Tener a mano [ARQUITECTURA_CORE_4_BOTONES_Y_TRIVIA.md](file:///c:/Users/Usuario/Documents/Antigravity/LinguaLife/docs/ARQUITECTURA_CORE_4_BOTONES_Y_TRIVIA.md) para arrancar el lunes 15 con todo el mapa técnico claro.

### 4.2 Plan de Trabajo Día a Día para Constituir la Versión 1.0 (15 al 19 de Dic)
- [ ] **Día 1 (Lun 15 Dic) — Seguridad, Auth & Limpieza de Arquitectura:**
  - Auditar seguridad de endpoints (`/api/admin/*`, `/api/student/*`, `/api/teacher/*`): implementar sesiones firmadas (JWT/cookie HTTP-only) o validación real de rol para que nadie pueda acceder a `/admin` ni ver datos de otro `studentId`.
  - Activar y validar **Row-Level Security (RLS)** en Supabase donde corresponda.
  - Remover código muerto o dependencias legacy de Airtable que ya no se necesiten.
- [ ] **Día 2 (Mar 16 Dic) — Blindaje de Base de Datos & Consistencia de Agenda:**
  - Versionar migraciones SQL limpias en el repositorio (`supabase/migrations`).
  - Blindar transacciones críticas (cancelación + abono de token + canje de token) con constraints/locks en Postgres para evitar doble reserva (*race conditions*) o saldos de tokens inconsistentes.
  - Optimizar queries lentas e índices (`sessions.student_id`, `sessions.scheduled_at`, `topic_mastery`).
- [ ] **Día 3 (Mié 17 Dic) — Caché Compartido de IA en Servidor & Estabilidad Pocket Coach:**
  - Subir el banco de preguntas generadas por IA (Trivia y Short Reading) a una tabla de caché en **Supabase** (además de `localStorage`) → todos los alumnos comparten preguntas validadas y el costo de Gemini cae >80%.
  - Agregar **Rate Limiting** en todos los endpoints de IA (`/api/student/trivia-questions`, `generate-practice`, `generate-short-reading`, `ai-chat`).
  - Blindar el servicio de **Pocket Coach** (cola de reintentos si falla Evolution API, manejo de audios grandes y reconexión).
- [ ] **Día 4 (Jue 18 Dic) — Automatización de Pagos & Observabilidad:**
  - Implementar webhook de **Wompi / Stripe**: al confirmarse un pago, registrar transacción en Supabase y activar/renovar el paquete de clases del alumno.
  - Instalar **Sentry** (tracking de errores frontend/backend en tiempo real) y revisar rendimiento (Core Web Vitals / bundle size).
- [ ] **Día 5 (Vie 19 Dic) — QA Final, CI/CD & Tag Oficial `v1.0.0`:**
  - Ejecutar pruebas end-to-end de todos los flujos críticos (Registro → Pago → Agendamiento → Clase → 4 Botones → Pocket Coach).
  - Configurar rama `main` (producción) vs `develop` (pruebas) para no romper alumnos en vivo al subir cambios futuros.
  - Hacer release oficial **`v1.0.0`** y dejar una guía corta de operación/emergencias.

---

## 💰 BLOQUE 5: Campaña de Marketing de Diciembre, Ventas & Legal (Flujo de Caja Inmediato)

*Objetivo: Generar caja en diciembre (meta: 20 alumnos pagos) sin esperar al 15 de diciembre.*

### 5.1 Oferta Comercial & Empaquetamiento
- [ ] Congelar precios y paquetes oficiales de diciembre (basados en [CAMPAIGN_MARKETING_V1.md](file:///c:/Users/Usuario/Documents/Antigravity/LinguaLife/CAMPAIGN_MARKETING_V1.md)):
  - **Plan Regular:** 8 clases/mes + IA 24/7 → **$450.000 COP**.
  - **Plan Intensivo Receso:** 16 clases/mes + IA 24/7 → **$790.000 COP**.
  - **Super Intensivo / Sprint:** 24 clases → **$1.150.000 COP**.
- [ ] Definir la **Oferta de Reenganche y Referidos** para alumnos antiguos (ej. 10%–15% de descuento o 2 clases bono por traer un amigo que pague).
- [ ] Preparar los **3 assets visuales de cierre** para enviar por WhatsApp:
  1. Infografía PDF de 1 página ("Cómo funciona LinguaLife: Clases 1-a-1 + 4 Botones + Pocket Coach 24/7").
  2. Carrusel de 4–5 imágenes para WhatsApp mostrando capturas reales de la Trivia, el Repaso y el bot de WhatsApp.
  3. 2–3 testimonios cortos (video o captura de WhatsApp) de alumnos antiguos.

### 5.2 Activación de Pauta & Contenido (Meta Ads + Orgánico)
- [ ] Configurar/verificar **Meta Business Manager**, cuenta publicitaria, fanpage de Instagram/Facebook y tarjeta para pauta ($5 USD/día = ~$500.000 COP/mes).
- [ ] Grabar y editar **3 a 4 videos cortos (30–45 seg)** atacando los 3 Buying Personas:
  - *Ángulo 1 (Tech / Remoto):* "¿Entiendes el 80% pero te congelas en reuniones en inglés?"
  - *Ángulo 2 (Receso Diciembre):* "No esperes a enero para empezar de cero; aprovecha diciembre con entrenamiento intensivo."
  - *Ángulo 3 (Demo Pocket Coach):* Grabación de pantalla real mostrando cómo la IA en WhatsApp y la Trivia te corrigen al instante.
- [ ] Lanzar campaña en Meta Ads (Objetivo: **Mensajes a WhatsApp**) a más tardar la **primera semana de diciembre** (o última de noviembre) para aprovechar primas y vacaciones.
- [ ] Publicar al menos **3 Reels/TikToks orgánicos por semana** durante diciembre reciclando los mismos hooks.

### 5.3 Embudo de Ventas por WhatsApp & CRM
- [ ] Dejar escrito el **Guion de Venta Consultiva por WhatsApp** (cero clases diagnósticas gratis en Zoom):
  - Saludo + 3 preguntas de diagnóstico rápido (objetivo, nivel percibido, disponibilidad).
  - Envío de Hoja de Ruta personalizada + nota de voz cálida de 45 segundos + link de pago.
  - Secuencia de seguimiento para leads que dejan en visto (`Día 1`, `Día 3`, `Día 7`).
- [ ] Montar un **CRM ligero** (Google Sheets o Notion) con columnas: `Nombre | WhatsApp | Fuente (Ad/Orgánico) | Perfil | Estado (Nuevo / Contactado / Propuesta / Cerrado / Perdido) | Plan | Fecha de Pago | Profesor Asignado`.
- [ ] Revisar métricas cada 3 días: Costo por conversación (meta < $2.000 COP), tasa de cierre (meta 7–8%) y ajuste de anuncios ganadores.

### 5.4 Finanzas, Pagos & Legal Lean
- [ ] Activar cuenta y links de cobro en **Wompi** (PSE, Nequi, tarjetas COP) y/o **Stripe/PayPal** (para clientes en el exterior en USD).
- [ ] Crear una **hoja de control financiero mensual** que separe automáticamente por cada alumno pagado:
  - `$240.000 COP` → Reserva fija de honorarios del profesor ($30.000/h × 8 clases, intocable).
  - `$25.000 COP` → Fondo de reinversión en pauta/marketing.
  - `$15.000 COP` → Fondo de software/comisiones.
  - `$170.000 COP` → Utilidad neta libre de la sociedad (~$195.000 COP al renovar Mes 2+ sin CAC).
- [ ] Publicar textos definitivos en `/terms` y `/privacy` cubriendo:
  - Autorización de **Habeas Data** (tratamiento de teléfono, mensajes de WhatsApp y notas de voz).
  - Política clara de **reagendamiento con 24h previas vía tokens** y **no reembolso** una vez iniciado el periodo.
  - Propiedad intelectual del método y materiales.
- [ ] **Alineación Interna entre Socios (Mesa de Trabajo):**
  - Definir por escrito (acuerdo simple inicial antes de S.A.S.): responsabilidades y dedicación semanal, metas de diciembre-febrero y criterios de participación/reparto (incluyendo la futura rama editorial).

---

## 🗓️ BLOQUE 6: Hoja de Ruta Semanal (19 Nov → 20 Dic)

| Semana | Fechas | Foco Técnico / Producto | Foco Comercial / Negocio | Entregable Clave |
| :--- | :--- | :--- | :--- | :--- |
| **Sem. 1** | **19 – 24 Nov** | Limpieza Supabase + Auditoría de los primeros 20 temas del currículo + Celular dedicado Pocket Coach | Alineación de socios + Congelar oferta + Grabar 3 videos cortos + Activar Wompi | Base de datos limpia, Pocket Coach 24/7 y creativos listos |
| **Sem. 2** | **25 Nov – 1 Dic** | QA completo en móvil (iOS/Android) de los 4 botones, Tokens, `/dashboard` y `/admin` + Legal en `/terms` y `/privacy` | **Reenganche alumnos antiguos** + **Encender Meta Ads ($5/día)** + Iniciar CRM de WhatsApp | Primeros 5 alumnos cerrados + Pauta corriendo |
| **Sem. 3** | **2 – 13 Dic** | Auditoría temas 21–60 + Recopilar lista priorizada de bugs reales de alumnos nuevos + Preparar accesos para la semana técnica | Optimizar pauta + Seguimiento agresivo de leads de receso diciembre + Onboarding Día 0 | 12–15 alumnos activos + Backlog técnico listo |
| **Sem. 4** | **15 – 20 Dic** | **🔥 SPRINT v1.0 (Semana de Apoyo Senior):** Seguridad/Auth, RLS, Caché IA en Supabase, Webhooks de pago, Sentry y **Release `v1.0.0`** | Cierre de meta de **20 alumnos pagos** + Primer corte financiero real ($2.2M COP libres) | **LinguaLife v1.0 en producción** + Flujo de caja validado |
