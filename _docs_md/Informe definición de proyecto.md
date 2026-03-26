# Informe definición de proyecto.pdf

## Page 1

Informe de Definición de Proyecto: LinguaLife
Visión: Academia de inglés híbrida que combina la calidez del coaching 1-1 con la velocidad y 
personalización de la Inteligencia Artificial.
1. Modelo de Negocio (Lean Canvas Resumido)
• Segmento Clave: Universitarios de nivel socioeconómico medio-alto (con "huecos" 
horarios) y profesionales con urgencia de resultados.
• Propuesta de Valor: Dominio del idioma en 6 meses mediante un método de "Micro-
learning" diario + sesiones privadas potenciadas por IA.
• Precio MVP: $450.000 COP / mes (8 clases 1-1 + acceso total a IA).
• Estructura de Costos: Modelo "Asset Light" (pago a profesores por hora, tecnología 
escalable y marketing digital).
2. El Ecosistema Tecnológico (Arquitectura)
El sistema operará como un triángulo conectado mediante automatizaciones (n8n/Make):
1. Cerebro (Airtable): Base de datos relacional con perfiles, currículum y logs de clases.
2. Interfaz Docente (Softr/Glide): El panel "Plug & Play" con timers y recursos.
3. Chatbot AI (WhatsApp/Telegram + OpenAI): El tutor de bolsillo que personaliza la 
práctica diaria.
3. Especificaciones del Panel "Plug & Play" (Dashboard 
Docente)
Este es el centro operativo del profesor. Se estructura en una sola vista con los siguientes módulos:
A. Cabecera de Conexión Inmediata
• Identidad: Nombre, Foto, Intereses y Curso (Business, Standard, Travel, C1).
• Logística: Número de clase, título del tema y botón directo de Zoom/Google Meet.
B. Microestructura de Clase con Timers (Fases Dinámicas)
Cada fase incluye un cronómetro visual para asegurar el cumplimiento del tiempo:
1. Warm-up (Calentamiento):
• Recurso IA: Frases o ejercicios generados automáticamente basados en los errores de 
la práctica diaria con el chatbot o la clase anterior.

## Page 2

2. The Core (Contenido Curricular):
• Recurso Pedagógico: Acceso al material del pensum, guías de enseñanza y ejemplos 
claros del tema gramatical/funcional.
3. Conversation Stage (Activación):
• Personalización: Preguntas generadas por IA que cruzan el tema del día con los 
intereses del alumno y sus áreas de mejora.
4. Feedback & Wrap-up:
• Cierre de la sesión y resumen de logros.
C. Gestión y Alimentación de Datos
• Cuadro de Observaciones: Espacio para que el profesor anote errores clave o debilidades. 
Nota: Estos datos viajan al Chatbot para la práctica semanal.
• Sistema de Status (Etiquetas): Botones de acción rápida para marcar la clase como:
•  Vista (Dispara el resumen al alumno).✅
•  Reagendar.⏳
•  Cancelada (Gestión de pago a profesor).❌
4. El Ciclo de Aprendizaje LinguaLife
1. Clase 1-1: El profesor usa el panel, enseña y deja notas de errores.
2. Sincronización: El sistema actualiza el perfil del alumno en segundos.
3. Práctica IA: Durante la semana, el chatbot envía retos cortos de 2 min enfocados 
exactamente en lo que el profesor anotó.
4. Evolución: El alumno llega a la siguiente clase habiendo reforzado sus debilidades, 
permitiendo al profesor avanzar más rápido.
5. Próximos Pasos Técnicos
Para materializar esto, el flujo de trabajo será:
1. Estructura de Datos: Crear tablas de Alumnos, Profesores, Cursos y Clases.
2. Configuración de n8n: Conectar Airtable con OpenAI para que "lea" las notas y "escriba" 
los ejercicios.
3. Diseño de Interfaz: Montar el panel visual con los botones y timers.

