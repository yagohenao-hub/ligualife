# 🗺️ Roadmap de Pruebas Integrales LinguaLife 2.0

Esta guía contiene la hoja de ruta y lista de verificación paso a paso para probar **cada una de las funciones** de los apartados de **Alumno**, **Profesor**, **Classroom** y **Admin**, utilizando la herramienta del **Simulador de Clases**.

---

## 🚀 Preparación Inicial de Pruebas

1. Acceder al **Panel de Admin** (`/admin`) utilizando el token de acceso `LinguaAdmin2025`.
2. Ir a la pestaña **Alumnos**.
3. Seleccionar o crear un estudiante de prueba (ej. `Estudiante de Prueba`).
4. Hacer clic en el botón verde **`🧪 Simulador`** ubicado en la columna de Acciones del estudiante.

---

## 1. 👩‍🎓 Pruebas del Dashboard de Alumno (`/student`)

Para iniciar sesión como el estudiante de prueba:
* Abrir `/student` o presionar salir si ya hay una sesión activa.
* Ingresar el **PIN** del estudiante (visible en la tabla de Admin).

### Checklist de Funciones del Alumno:

- [ ] **1.1 Barra de Progreso General:**
  * Usar el Simulador en Admin -> `Establecer Posición en Clase #5`.
  * Recargar `/student`.
  * **Resultado Esperado:** La barra muestra `4 temas completados` y un cálculo de porcentaje acorde al total de temas (ej. ~7% de 58).
- [ ] **1.2 Avance Gradual 1 en 1:**
  * En Admin -> Presionar `+1 Avanzar Siguiente Clase →`.
  * Recargar `/student`.
  * **Resultado Esperado:** Se añade el nuevo tema a la lista de "Temas Completados" y la barra incrementa a 5 temas.
- [ ] **1.3 Visor de Materiales de Clase (Slides PDF):**
  * En la sección **Temas Completados**, hacer clic sobre cualquier chip de tema con icono de libro 📖.
  * **Resultado Esperado:** Se abre el modal con el material interactivo de la clase (slides), incluyendo el botón `⬇ PDF` para descargar el HTML/PDF generado.
- [ ] **1.4 Reagendamiento de Clase (Regla de 24 horas & Tokens):**
  * En **Próximas Clases**, presionar el botón `↺` (Reagendar).
  * Confirmar el aviso.
  * **Resultado Esperado:** La clase se remueve de próximas, se le otorga **1 Token de Reposición** y aparece en el contador de tokens.
- [ ] **1.5 Canje de Token por Clase Extra:**
  * En la sección **Tokens de Reposición**, presionar `Agendar Clase Extra →`.
  * **Resultado Esperado:** Se abre el calendario interactivo de 14 días con los espacios disponibles del profesor asignado. Seleccionar día y hora -> La clase se agenda y se descuenta 1 token.
- [ ] **1.6 Saldo de Clases Disponibles & Alerta de Renovación:**
  * Verificar que el cuadro de saldo de clases muestre las clases restantes.
  * Si el saldo es $\le 2$, debe aparecer la alerta de renovación ⚠️.
- [ ] **1.7 Solicitud de Actividad de Serie:**
  * Escribir el nombre de una serie (ej. *Stranger Things*) y hacer clic en `Solicitar`.
  * **Resultado Esperado:** Aparece la confirmación `✅ Solicitud enviada`. En Admin -> Visión General (Bandeja del Secretario), la solicitud aparece en la lista.
- [ ] **1.8 Calificación del Profesor:**
  * Presionar `⭐ Dejar una Calificación`.
  * Elegir 5 estrellas y enviar comentario.
  * **Resultado Esperado:** Alerta de `Gracias por tu feedback`.
- [ ] **1.9 Historial Pocket Coach:**
  * Verificar los micro-retos diarios enviados por WhatsApp guardados en el historial del alumno.

---

## 2. 👨‍🏫 Pruebas del Dashboard de Profesor (`/dashboard`)

Para ingresar como profesor:
* Iniciar sesión en `/login` con el **PIN** del profesor asignado (o desde el enlace de profesor).

### Checklist de Funciones del Profesor:

- [ ] **2.1 Pestaña Agenda (Clases del Día / Filtrado):**
  * Verificar la lista de sesiones agendadas para hoy.
  * Probar el filtro de clases buscando por nombre de alumno o fecha.
- [ ] **2.2 Lanzador al Virtual Classroom:**
  * Hacer clic en una tarjeta de sesión.
  * **Resultado Esperado:** Redirecciona directamente a la sala virtual `/classroom?sessionId=...`.
- [ ] **2.3 Reagendamiento desde Docente:**
  * En la tarjeta de la clase, hacer clic en `Reagendar`.
  * **Resultado Esperado:** Cancela la sesión y avanza la currícula a la siguiente lección agendada.
- [ ] **2.4 Confirmación de Clase en Día Festivo:**
  * Para clases agendadas en festivo, presionar `Confirmar festivo`.
  * **Resultado Esperado:** El estado de festivo cambia a confirmado por el docente.
- [ ] **2.5 Pestaña Mi Studio (Métricas de Ingresos & Proyección):**
  * Cambiar a la pestaña `Mi Studio`.
  * **Resultado Esperado:** Visualizar total de clases vistas ("Seen"), ingresos ganados en COP y proyección estimada al finalizar el mes.
- [ ] **2.6 Alumnos con Tokens Pendientes:**
  * Revisar el cuadro de alumnos con tokens pendientes de reagendamiento.
- [ ] **2.7 Alerta y Gestión de Seguridad Social (SS):**
  * Presionar el botón `📄 Actualizar SS`.
  * Pegar un enlace de Google Drive y seleccionar fecha de vencimiento.
  * **Resultado Esperado:** Se actualiza la fecha, la alerta cambia de color (Verde = OK, Amarillo = Próxima a vencer, Rojo = Vencida) y en Admin aparece actualizada.
- [ ] **2.8 Matriz Interactiva de Disponibilidad Semanal:**
  * Hacer clic y arrastrar sobre las celdas de la grilla de disponibilidad (Lunes a Domingo, 6am a 8pm).
  * Presionar `Guardar Disponibilidad`.
  * **Resultado Esperado:** El cálculo de proyección de ingresos se actualiza dinámicamente según las horas abiertas.

---

## 3. 🏫 Pruebas del Classroom / Aula Virtual (`/classroom`)

Acceder abriendo una sesión desde el Dashboard de Profesor o ingresando la URL de una sesión.

### Checklist de Funciones del Classroom:

- [ ] **3.1 Enlace a Reunión (Google Meet):**
  * Verificar que el botón `Unirse a Reunión` redirija al enlace configurado del profesor.
- [ ] **3.2 Botones de Control de Clase (Iniciar / Finalizar):**
  * Presionar `Iniciar Clase`.
  * **Resultado Esperado:** El temporizador de fase inicia el conteo progresivo.
- [ ] **3.3 Navegador de Malla Curricular (Sidebar):**
  * Revisar la barra lateral con la lección anterior (`#Anterior`), la lección actual (`#Hoy`) y la siguiente lección (`#Siguiente`).
  * Consultar la sección `Notas Previas` para ver los comentarios dejados en la última clase.
- [ ] **3.4 Fase 1: Warm-up (7 minutos):**
  * Verificar el **Icebreaker** (pregunta contextual del alumno).
  * Verificar las tarjetas de **Spanglish Translation** (frases de traducción).
  * Verificar la frase puente **Observation Bridge**.
  * Probar las sugerencias del **Video Bank** (miniaturas de videos de YouTube con enlace externo).
- [ ] **3.5 Fase 2: Core (45 minutos - Interactive Slides):**
  * Cambiar a la pestaña `Core`.
  * Si no hay slides, presionar `Generar Slides`.
  * **Resultado Esperado:** La IA de Gemini genera la presentación en vivo según la vertical e intereses del alumno.
  * Navegar entre diapositivas con `←` y `→`.
  * Presionar `⬇ PDF` para descargar las diapositivas como documento HTML/PDF.
- [ ] **3.6 Copilot de IA en Vivo para el Profesor:**
  * Abrir el panel de chat de IA Copilot en la esquina inferior.
  * Hacer una pregunta pedagógica (ej. *"¿Cómo le explico los condicionales en inglés de negocios?"*).
  * **Resultado Esperado:** La IA responde en contexto al estudiante y al tema de la clase.
- [ ] **3.7 Fase 3: Download (8 minutos) & Finalizar Clase:**
  * Cambiar a la pestaña `Download`.
  * Revisar la sección de **Idioms / Cultural Byte**.
  * Presionar `Finalizar Clase`.
  * **Resultado Esperado:** La sesión se marca como completada (`Seen`), se guardan las notas del profesor y redirige al Dashboard.

---

## 4. 🛡️ Pruebas del Panel de Admin (`/admin`)

### Checklist de Funciones de Admin:

- [ ] **4.1 Métricas Generales & Bandeja de Pendientes:**
  * Revisar los 6 indicadores clave (Alumnos, Profesores, Clases Semana, Clases Mes, Alumnos con Tokens, Reagendadas).
  * Revisar la **Bandeja de Pendientes del Secretario** (Filtros por Profesores pendientes, Alumnos sin profesor, Alertas de SS y Solicitudes de Series).
- [ ] **4.2 Directorio de Alumnos:**
  * Crear un alumno nuevo -> Verificar la alerta con el PIN autogenerado de 6 caracteres.
  * Cambiar estado de alumno (Active, Paused, Inactive, Blocked).
  * Ajustar saldo de tokens con los botones `+` y `−`.
- [ ] **4.3 Directorio de Profesores:**
  * Crear un profesor nuevo -> Verificar PIN.
  * Revisar insignias de estado de Seguridad Social.
- [ ] **4.4 Agenda & Clases Activas (Grupos 1-a-1, Parejas y Familias):**
  * Hacer clic en `🔗 + Asignar Clase / Pareja / Familia`.
  * Seleccionar 1 o hasta 3 alumnos, elegir profesor compatible por algoritmo de afinidad, seleccionar días y horas de recurrencia.
  * **Resultado Esperado:** El grupo o clase 1-a-1 queda creado en el sistema.
- [ ] **4.5 Simulador de Clases & Pruebas en Admin:**
  * Abrir el modal `🧪 Simulador` en cualquier estudiante.
  * Probar **Avanzar 1 Clase**.
  * Probar **Establecer Clase #N**.
  * Probar **Agendar Clase Manual**.
  * Probar **Simular Cancelación (Regla 24h)**.
  * Probar **Resetear a Clase 1**.
