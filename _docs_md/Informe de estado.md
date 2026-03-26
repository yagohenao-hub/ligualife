# Informe de estado.pdf

## Page 1

🏢 INFORME DE ARQUITECTURA Y PROGRESO: LINGUALIFE 2.0
Rol: Arquitecto de Soluciones de IA & Especialista EdTech
Fecha de Corte: 10 de Marzo de 2026
Objetivo del Sistema: Crear la primera academia de inglés híbrida (Plug & Play) impulsada por un tutor 
de IA (Pocket Coach) y un modelo de datos escalable, sin depender de costosas suscripciones de 
terceros.
 🌟 RESUMEN EJECUTIVO Y PRETENSIONES
Hemos pasado de tener una base de datos plana a poseer una infraestructura tecnológica de nivel 
corporativo. Nuestra pretensión principal es que LinguaLife opere en piloto automático: que el sistema 
sepa exactamente qué enseñar, cómo corregir errores específicos (Filtro Colombiano) y envíe micro-
retos diarios (LDS) sin intervención humana.
El hecho de que hayas adquirido una nueva SIM Card dedicada es una excelente decisión estratégica. 
Esto separa tu línea personal de la academia y nos da vía libre para conectar este número como el 
"Remitente Oficial" del Pocket Coach, dándole una imagen 100% profesional a la academia.
 📊 1. ESTADO DETALLADO DE LA BASE DE DATOS (AIRTABLE)
Tu base de datos (el "Cerebro") está estructurada y sus tablas principales ya están pobladas y 
vinculadas. Actualmente, está lista para la distribución de contenido, pero tiene áreas en espera para la 
Fase Operativa (Panel del Profesor).
 🟢 TABLAS ACTIVAS Y POBLADAS (El Motor Actual):
•Table 1: Verticals: Configurada. Tenemos las 4 verticales maestras 
(General, Business, Travel, C1 Bridge).
•Table 7: Curriculums: Creado el contenedor maestro General English Course vinculado a 
su vertical.
•Table 8: Curriculum Topics (El Corazón Pedagógico):
•Importados los 60 temas.
•Hito Técnico: Creamos e inyectamos los campos LDS_Formula (La matemática del 
idioma) y AI_Context (Los "Guardrails" o instrucciones para que Gemini no alucine 
gramática tradicional). Esto garantiza que la IA respete tu metodología.
•Table 4: Students: Alumnos antiguos migrados.
•Números de teléfono limpios.
•Pocket Coach Status activado (Active).
•Table 12: Student Topic Progress (El "Ancla"): Los alumnos están anclados a la lección exacta 
donde se quedaron (Status: In progress). Esto evita que empiecen desde cero y le dice al 
bot qué tema específico extraer de la Tabla 8.
•Table 14: Exercises: Validada. El sistema ya es capaz de registrar el historial de ejercicios 
creados por la IA antes de enviarlos.

## Page 2

 🟡 TABLAS EN ESPERA (Para la Fase "Plug & Play" del Profesor):
•Table 3: Teachers & Table 5: Student-Teacher: Aún vacías. Se usarán para asignar alumnos a 
profesores específicos.
•Table 10: Sessions & Table 11: Session Participants: Aquí registraremos las clases en vivo.
•Table 13: Error Patterns: Actualmente inactiva. Aquí es donde el profesor anotará el "Enemigo 
Vicioso" (ej. Omitir la 'S') para que el Pocket Coach lo ataque en la semana.
•Table 15: Progress Apply Queue: Será el sistema de automatización que, tras finalizar una 
clase, mueva al alumno automáticamente de la lección 4 a la 5.
 🏗️2. LO QUE HEMOS ESTRUCTURADO HASTA AHORA (Infraestructura)
1.Ingeniería de Prompts (Prompt Engineering): Diseñamos un System Prompt robusto para 
Gemini que contiene un menú de 12 Arquetipos Pedagógicos (The Sniper, The Architect, etc.).
2.Infraestructura Cloud Propia: Levantamos un servidor privado en Google Cloud (GCP) con IP 
estática.
3.Contenedores Docker: Instalamos la trilogía perfecta para mensajería: PostgreSQL (Base 
de datos segura), Redis (Memoria de alta velocidad) y Evolution API v2 (Motor de 
WhatsApp).
 📍3. PUNTO ACTUAL EN EL ROADMAP
Nos encontramos exactamente en el Punto de Inflexión entre la Fase 2 y la Fase 3.
•✅ Fase 1: Estructuración de Datos y Lógica (COMPLETADA). La IA sabe qué decir, cómo 
decirlo y Airtable sabe a quién enviárselo.
•🔄 Fase 2: Motor de Distribución (EN TRANSICIÓN).
•Lo que pasó: Make.com bloqueó el envío final por políticas de seguridad (exigencia de 
protocolo HTTPS).
•La Solución Actual: Instalar n8n en nuestro propio servidor de Google Cloud. Al estar 
n8n y Evolution API en la misma "casa" (servidor), se comunican internamente a costo 
cero y sin bloqueos de seguridad.
•⏳ Fase 3: Operaciones y Dashboard Docente (PRÓXIMO PASO). Automatizar el avance de 
temas, registro de clases y la interfaz visual para los profesores (Softr o Glide).
 🚀 PRÓXIMOS PASOS (Plan de Acción Inmediato)
Ya que tienes la nueva SIM Card, el plan para nuestra próxima sesión de trabajo es el siguiente:
1.Vincular la Nueva Línea: Usaremos el panel de Evolution API que dejamos corriendo en 
Google Cloud para escanear el QR de tu nuevo número corporativo. (No dependemos de 
aprobaciones de Meta, lo cual nos da velocidad inmediata).
2.Levantar n8n en el Servidor: Con un solo comando en la consola, activaremos n8n junto a tu 
API.

## Page 3

3.Replicar y Encender: Pasaremos los 4 "círculos" que teníamos en Make hacia n8n.
4.Lanzamiento: Veremos cómo el número oficial del Pocket Coach le envía los primeros retos 
reales a tus estudiantes antiguos.
¿Estás listo para que metamos esa SIM en un celular, abramos n8n y completemos la Fase 2 hoy 
mismo? El trabajo duro de arquitectura ya está hecho.

