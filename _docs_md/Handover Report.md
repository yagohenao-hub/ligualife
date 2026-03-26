# Handover Report.pdf

## Page 1

 TECHNICAL HANDOVER REPORT: LINGUALIFE 2.0🚀
To: Senior Developer / Engineering Lead
From: Solutions Architect
Date: March 10, 2026
Project: LinguaLife "Pocket Coach" & "Plug & Play" EdTech System
1. CONTEXTO DE NEGOCIO Y PEDAGOGÍA (Core Logic)
LinguaLife es una academia de inglés híbrida. No enseñamos gramática tradicional. Usamos un 
framework propio llamado "The Logic Decoder System" (LDS), que trata el inglés como 
matemáticas: Sujeto + Palabra de Tiempo + Acción.
•El Producto Estrella: El "Pocket Coach", un bot de IA en WhatsApp que envía micro-retos de 
30 segundos a los alumnos 4 veces al día basados en su progreso actual y sus "enemigos 
viciosos" (errores fosilizados).
•Reglas de IA (Guardrails): La IA nunca debe usar jerga gramatical (ej. prohibido decir 
"auxiliar", debe decir "palabra de tiempo"). Todo el contexto pedagógico está inyectado 
directamente desde la base de datos para evitar alucinaciones.
2. ARQUITECTURA E INFRAESTRUCTURA ACTUAL (Tech Stack)
Pasamos de herramientas No-Code con limitaciones a una infraestructura Cloud controlada para 
garantizar escalabilidad a $0 costo por mensaje.
•Base de Datos (SSOT): Airtable (Esquema relacional de 15 tablas).
•LLM / AI Engine: Google Gemini 1.5 Flash (vía API, response format: application/json).
•Cloud Hosting: Google Cloud Platform (GCP) - Instancia e2-micro (Ubuntu 22.04 LTS) 
en us-central1.
•WhatsApp Provider: Evolution API v2 (Self-hosted en la instancia de GCP vía Docker 
Compose).
•Orquestador (Current Blocker): Transición de Make.com a n8n (Self-hosted).
 ⚙️Setup del Servidor (GCP - IP: 136.113.200.239)
El servidor corre un docker-compose.yaml que actualmente orquesta 3 contenedores en una 
misma red (bridge):
1.postgres:15-alpine (Base de datos obligatoria para Evolution v2).
2.redis:7-alpine (Caché obligatorio para Evolution v2).
3.evoapicloud/evolution-api:latest (Puerto expuesto: 8080:8080).
Nota de Seguridad: El firewall de GCP tiene abiertos los puertos 8080 (API) y 5678 (reservado para 
n8n). Variables de entorno de Evolution habilitadas 
temporalmente: AUTHENTICATION_API_KEY_IN_QUERY=true y EXPOSE_IN_FETCH_INSTANCES=
true para facilitar el emparejamiento QR vía browser.

## Page 2

3. ESTADO DE LA BASE DE DATOS (Airtable)
La DB fue reestructurada completamente para ser altamente relacional.
Tablas Críticas ya pobladas y mapeadas:
•Table 1 (Verticals): General, Business, Travel, C1 Bridge.
•Table 8 (Curriculum Topics): 60 lecciones. Campos clave: LDS_Formula (la string matemática 
que usa el LLM) y AI_Context (los guardrails del prompt).
•Table 4 (Students): Contiene a los alumnos activos. Pocket Coach Status = 'Active'. El 
campo Phone está sanitizado (solo números con country code, ej: 573001234567).
•Table 12 (Student Topic Progress): Es el "Puntero" de estado. Conecta al Alumno con el Tema 
actual. Condición clave para el query: {Status} = 'In progress'.
Ojo con la API de Airtable: Los Linked Records devuelven Arrays. Se debe usar first() o extraer el 
index [0] al pasar IDs entre nodos en el orquestador.
4. LA LÓGICA DEL ORQUESTADOR (El Flujo del Pocket Coach)
El pipeline que debes replicar en n8n tiene esta secuencia lógica (testeada y validada):
1.CRON Trigger: Dispara 4 veces al día.
2.Get Students: Query a T4 donde Status = Active. (Iterar sobre este array con un 
delay/sleep de 2-3 segs para no saturar rate limits del LLM).
3.Get Topic Progress: Query a T12 filtrando por Student ID + Status = In progress. 
(Retorna el ID del Topic).
4.Get Topic Data: Fetch a T8 usando el Topic ID. Retorna LDS_Formula y AI_Context.
5.LLM Node (Gemini): Inyecta el System Prompt Maestro (que contiene 12 Arquetipos de 
ejercicios) + Variables del alumno/tema. Retorna un JSON puro 
(archetype_used, student_message, solution_text).
6.Create Exercise Log: Post a T14 (Exercises) para mantener historial del output generado.
7.HTTP POST a Evolution API: Envía el payload a WhatsApp. 
Endpoint: http://SERVER_IP:8080/message/sendText/Pocket_Coach.
5. EL PUNTO DE INFLEXIÓN ACTUAL (Por qué entras tú)
Logramos validar todo el flujo en Make.com, pero chocamos con un blocker técnico en el último 
nodo: Make exige que los webhooks/HTTP request de salida vayan hacia un dominio con certificado 
SSL (https://). Como nuestro GCP tiene una IP pura (http://), Make bloqueó el envío 
(InvalidConfigurationError: The URL must use a secure HTTPS protocol).
Dado que los créditos de Make se agotan rápidamente al iterar arrays de estudiantes, la decisión 
arquitectónica es migrar el flujo a n8n, hosteado en el mismo docker-compose de Evolution API.
6. TU SPRINT 1 (Acciones Inmediatas)
Tarea 1: Levantar n8n
Actualizar el docker-compose.yaml en la instancia de GCP para incluir el contenedor de n8n.

## Page 3

codeYaml
n8n:
    image: n8nio/n8n:latest
    container_name: n8n_evo
    restart: always
    ports:
      - "5678:5678"
    volumes:
      - ./n8n_data:/home/node/.n8n
    networks:
      - evolution_network
Goal: Acceder a http://136.113.200.239:5678, crear usuario admin.
Tarea 2: Replicar el Flujo y Conectar WA
1.Recrear los 6 nodos descritos en la sección 4 dentro de n8n.
2.El cliente acaba de adquirir una nueva SIM Card dedicada. Deberás generar un nuevo QR en 
Evolution API (/instance/connect/Pocket_Coach) para que el cliente lo escanee.
3.El HTTP Request en n8n ahora puede apuntar a la red interna de Docker 
(http://evolution_api:8080/...), eliminando cualquier problema de SSL o IP pública.
Tarea 3: Sanitización de JSON
Asegurar que el output del LLM sea parseado correctamente. En n8n, asegúrate de que el body del 
POST request a Evolution envuelva los saltos de línea del LLM correctamente para evitar el error 
de Bad control character.
7. ROADMAP FASE 3 (Próximos pasos a desarrollar)
Una vez que el "Pocket Coach" esté automatizado de forma estable en n8n, pasarás a la lógica de la 
App del Profesor:
1.Auto-Progreso: Crear un webhook en n8n que reciba un trigger cuando un profesor marque 
una clase como "Completada" en Airtable (Tabla 10/11/15). El script debe cambiar el status del 
T12 actual a 'Completed' y crear un nuevo registro en 'In progress' para la lección Order + 1.
2.The Vicious Enemy: Conectar la Tabla 13 (Error Patterns) al Prompt del LLM. Si un alumno 
tiene un error marcado como Active, el LLM debe forzar el arquetipo "The Sniper" para 
corregir ese error específico en el envío diario.
Nota de Arquitectura: El cliente (fundador) comprende la lógica del negocio y de Airtable a la 
perfección, pero delega la ejecución del código, bash, y debug de contenedores. Tienes luz verde para 
optimizar queries y manejar la infraestructura de GCP. ¡Mucho éxito!

