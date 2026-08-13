# Plan de Implementación: Reconstrucción y Lanzamiento de LinguaLife 2.0

Este plan detalla el roadmap y las decisiones de arquitectura para reactivar y lanzar LinguaLife 2.0. El objetivo es estructurar un sistema altamente estable y escalable (para +20 profesores y +400 alumnos) con costos de infraestructura cercanos a $0, utilizando servicios eficientes y automatizaciones robustas.

---

## 🧐 User Review Required

### Decisiones de Arquitectura y Servidor
Para dar soporte a **20 profesores y 400 alumnos** de manera concurrente e ininterrumpida, la actual instancia de Google Cloud (`e2-micro` con 1 GB RAM) se queda extremadamente corta. La base de datos de n8n, el motor de WhatsApp de Evolution API, Postgres y Redis consumen fácilmente más de 1.5 GB de RAM.
* **Propuesta recomendada:** Migrar toda la infraestructura autohospedada (n8n, Evolution API, Postgres, Redis) a **Oracle Cloud Always Free Tier** (instancia Ampere A1: 4 vCPUs ARM, 24 GB RAM, 200 GB SSD) sin costo mensual. Esto asegura que el servidor no colapse por falta de memoria.

---

## 🎯 Open Questions (Grill-Me)

> [!IMPORTANT]
> Por favor responde a las siguientes preguntas para ajustar los detalles técnicos del plan y alinearnos con tu visión de lanzamiento inmediato:

1. **¿Migramos a Oracle Cloud o nos mantenemos en GCP?**
   * ¿Prefieres que hagamos la migración a la capa gratuita de Oracle Cloud (4 vCPUs, 24 GB RAM) para tener holgura técnica, o prefieres optimizar GCP (`e2-micro`) con un archivo SWAP sabiendo que el procesador estará muy limitado?
2. **¿Existe algún respaldo de los flujos de n8n o Make?**
   * ¿Los escenarios/flujos del Pocket Coach (lectura de Airtable, inyección a Gemini, y envío por Evolution API) se perdieron del todo o tienes algún archivo `.json` de exportación de n8n/Make en tu correo o computadora?
3. **¿Cómo se construirá el Dashboard del Profesor?**
   * La especificación técnica menciona el *Plug & Play Dashboard*. ¿Queremos programarlo a medida dentro del proyecto de Next.js (`apps/web`) o prefieres usar una plataforma No-Code conectada a Airtable (como Glide o Softr) para el MVP/lanzamiento a corto plazo?
4. **Estado de Airtable:**
   * ¿Tu base de datos de Airtable actual tiene las 15 tablas activas con la currícula de los 60 temas cargados, o necesitas que preparemos scripts para poblar los temas iniciales?
5. **Configuración de Variables de Entorno:**
   * ¿Tienes a la mano las API Keys necesarias (`AIRTABLE_API_KEY`, `AIRTABLE_BASE_ID`, `GEMINI_API_KEY`) para configurarlas en el nuevo entorno de desarrollo?

---

## 🛠️ Proposed Changes

A continuación se listan las tareas iniciales sobre el repositorio local y la infraestructura:

### [Infraestructura & Servidor]

#### [NEW] [docker-compose.yml](file:///media/xao/CCF89F8FF89F7684/Documentos/Antigravity/LinguaLife/docker-compose.yml)
* Crear un archivo de orquestación centralizado para la máquina virtual que incluya:
  * **PostgreSQL 15-alpine** (base de datos para Evolution API y n8n).
  * **Redis 7-alpine** (caché para Evolution API).
  * **Evolution API v2** (motor de WhatsApp).
  * **n8n** (automatizaciones).
  * **Cloudflare Tunnel / Caddy** (para habilitar certificados SSL `https://` automáticos de forma gratuita y evitar bloqueos de webhook).

### [Aplicación Web (`apps/web`)]

#### [MODIFY] [environment-variables](file:///media/xao/CCF89F8FF89F7684/Documentos/Antigravity/LinguaLife/apps/web/.env.example)
* Generar una plantilla de variables de entorno para que puedas configurar tus credenciales de Airtable y Gemini de forma segura.

---

## 🧪 Verification Plan

### Pruebas de Sistema
1. **Despliegue del Servidor:** Verificar que todos los contenedores Docker inicien correctamente y se comuniquen en la red interna de Docker.
2. **Emparejamiento de WhatsApp:** Conectar la nueva línea telefónica corporativa escaneando el código QR generado por Evolution API.
3. **Flujo de Envío (End-to-End):** Validar en n8n la lectura de un estudiante de prueba en Airtable, la generación del micro-reto con Gemini AI, el registro en la tabla de ejercicios de Airtable y el envío del mensaje de WhatsApp.
