# 🚀 LinguaLife — Ideas y Módulos a Futuro (Post-Lanzamiento MVP)

**Fecha:** Noviembre 2026  
**Contexto:** Para el lanzamiento del MVP enfocado, decidimos simplificar el Dashboard del Alumno (`/student`) en su núcleo de alto rendimiento:
1. **Progreso, Horario, Clases y Tokens** (con vista limpia de la siguiente clase y toggle para desplegar/reagendar clases futuras).
2. **Repaso de Temas Vistos** con sus 4 modalidades esenciales:
   - 📖 **Resumen** (Diapositiva del concepto esencial).
   - ⚡ **Repaso** (Gimnasio mental interactivo de 15 ejercicios).
   - 🔥 **Trivia** (Desafío de velocidad y opción múltiple).
   - 🎧 **Short Reading** (Micro-lectura contextual con audio nativo).
3. **Práctica de Vocabulario** con acceso directo a sus 4 modalidades correspondientes en `/student/vocabulary`.

---

## 📦 Banco de Ideas & Módulos para Fases Posteriores

### 1. 🎴 Flashcards Conceptuales 3D & Mazos Temáticos
- **Estado:** Código y vistas listas en `/student/flashcards` y `lib/flashcards.ts` (120 cartas, 8 decks temáticos).
- **Funcionalidad:** Tarjetas interactivas 3D con audio nativo, transcripción IPA y giros visuales sin traducción literal.
- **Razón de aplazamiento:** Enfocar primero la gimnasia activa del estudiante en los 4 botones de práctica (Resumen, Repaso, Trivia, Reading) de temas y vocabulario CEFR.
- **Activación futura:** Reincorporar como sección complementaria de estudio autónomo en biblioteca de recursos.

### 2. 📺 Actividad de Serie & Cine Personalizada
- **Estado:** Componente de solicitud desarrollado (`/api/student/series-request`).
- **Funcionalidad:** Los alumnos escriben la serie de Netflix/HBO que están viendo y el equipo/IA les genera una guía pedagógica con vocabulario y expresiones auténticas del show.
- **Activación futura:** Lanzar como campaña de fidelización o beneficio premium ("LinguaLife Binge-Watching").

### 3. 🗺️ Interactive Scene Explorer (Escenarios 2D)
- **Estado:** Prototipo en `/student/interactive-scene`.
- **Funcionalidad:** Escenarios ilustrados (oficina, aeropuerto, restaurante) donde el alumno toca objetos y personas para escuchar diálogos y colocaciones situacionales.
- **Activación futura:** Fase 2 de contenido multimedia inmersivo para niveles A1-B1.

### 4. 🎬 Banco de Videos Nativos Sincronizados
- **Funcionalidad:** Clips de charlas TED, series y entrevistas cortas con transcripción sincronizada palabra por palabra y clic para guardar en vocabulario.
- **Activación futura:** Integración con la red semántica de vocabulario.

### 5. 🏆 Sistema Gamificado de Logros, Medallas & Rachas Sociales
- **Funcionalidad:** Insignias por racha en WhatsApp Pocket Coach, medallas por platinar temas en el Gimnasio Mental y tabla de clasificación comunitaria.
- **Activación futura:** Cuando el volumen de estudiantes activos supere los 50 alumnos simultáneos.

### 6. 🎙️ Simulador de Entrevistas y Speaking TOEFL / IELTS
- **Funcionalidad:** Grabación de audio con cronómetro estricto (Listen & Repeat + Interview) con retroalimentación automática de pronunciación y reducción Schwa (`/wəz/`).
- **Activación futura:** Especialización para el paquete intensivo C1 de certificación.

