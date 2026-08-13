# Especificación de Requerimientos Funcionales y Objetivos Técnicos.pdf

## Page 1

PARA: Director de Desarrollo & Producto
DE: CTO & Arquitecto de Sistemas (LinguaLife)
ASUNTO: Especificación de Requerimientos Funcionales y Objetivos Técnicos del Ecosistema 
LinguaLife.
1. VISIÓN EJECUTIVA
El objetivo técnico de LinguaLife no es crear una escuela online, sino construir un Motor de Aprendizaje 
Híbrido. Buscamos un sistema donde la intervención humana se limite estrictamente a la enseñanza 
(Profesor) y a la negociación/venta (Secretario), mientras que la logística, la generación de contenido y 
el seguimiento pedagógico sean operados por una arquitectura de software autónoma.
A continuación, se detallan los 4 Pilares Funcionales que el equipo de desarrollo debe implementar.
2. PILAR I: EL MOTOR CURRICULAR INTELIGENTE (The Logic Core)
Necesitamos una base de datos relacional compleja que actúe como el cerebro del sistema, capaz de 
gestionar dependencias pedagógicas y rutas de aprendizaje dinámicas.
Funcionalidades Requeridas:
•Curriculum Modular y Jerárquico: El sistema debe soportar una malla curricular que no sea 
lineal. Debe manejar "Fases Troncales" (Core) obligatorias y permitir ramificaciones 
automáticas hacia "Verticales Especializadas" (Business, Travel, Mastery) según el perfil del 
usuario.
•Algoritmo de Navegación (Next-Class Logic): El sistema debe calcular automáticamente cuál 
es la siguiente sesión para cada alumno basándose en:
1.Historial de clases completadas (Prerrequisitos).
2.Vertical asignada.
3.Desempeño en sesiones anteriores.
•Inyección de Contenido Dinámico: La base de datos no debe guardar "clases estáticas" (PDFs 
fijos). Debe almacenar "Metadatos de la Clase" (Fórmula gramatical, Contexto del tema) que 
permitan a una IA generar ejercicios frescos y personalizados en tiempo real.
3. PILAR II: INTERFAZ DOCENTE "COPILOTO" (The Plug & Play Dashboard)
El profesor no debe planificar clases. El sistema debe entregarle una interfaz de ejecución en tiempo 
real que reduzca su carga cognitiva y garantice la estandarización del método LDS.
Funcionalidades Requeridas:
•Despliegue de Contexto Inmediato: Al iniciar sesión, el profesor debe ver únicamente sus 
clases del día, ordenadas cronológicamente. Al entrar a una clase, debe tener acceso 
inmediato a:
•Perfil del Alumno (Intereses, Nivel, Debilidades).
•Historial de Errores Recientes (para personalizar el calentamiento).

## Page 2

•UX Guiada por Fases (Timeline): La interfaz debe segmentar la hora de clase en bloques 
visuales claros (Warm-up, Core, Conversation) con cronómetros integrados que cambien de 
estado/color para asegurar el ritmo de la sesión.
•Herramienta de Feedback Estructurado: Debemos eliminar las notas en papel. El sistema 
debe proveer selectores rápidos (Tags) para registrar errores específicos (ej: "Pronunciación", 
"Omisión de Sujeto") y un campo para notas cualitativas. Estos datos deben alimentar 
inmediatamente al motor de IA.
4. PILAR III: EL TUTOR DE BOLSILLO (The AI Reinforcement Engine)
Este es el producto estrella para el alumno. Un sistema de mensajería (WhatsApp/Telegram) que actúa 
como un entrenador personal 24/7, desacoplado de la clase en vivo pero sincronizado con ella.
Funcionalidades Requeridas:
•Generación de Contenido Contextual (RAG - Retrieval Augmented Generation): El bot no es 
un chat genérico. Debe generar micro-retos basándose en la intersección de tres variables:
1.La Regla Gramatical de la última clase vista.
2.Los Intereses Personales del alumno (ej: Tenis, Finanzas).
3.El Rol Pedagógico asignado (Coach estricto, Amigo viajero, etc.).
•Sistema de "Cola de Envíos" (Queue Dispatcher): Para evitar la saturación y respetar los 
horarios del alumno, el sistema no debe enviar mensajes en ráfaga. Debe generar el contenido 
por adelantado, almacenarlo en una cola de espera y liberarlo en ventanas de tiempo 
específicas (ej: 8:00, 12:00, 16:00).
•Memoria de Errores (Loop de Corrección): Si el profesor marcó "Error en Pasado Simple" en la 
clase de ayer, el sistema debe priorizar ejercicios de ese tema hoy.
5. PILAR IV: ORQUESTACIÓN OPERATIVA (The Admin Automation)
El backend administrativo debe gestionar el ciclo de vida del usuario minimizando el error humano.
Funcionalidades Requeridas:
•Onboarding Híbrido: El sistema debe permitir la entrada manual de datos por parte de un 
humano (venta), pero una vez activado el usuario, debe disparar automáticamente la creación 
de credenciales, la asignación de la primera clase y la notificación al profesor.
•Gestión de Parrilla Horaria (Slots): El sistema debe ser capaz de mapear horarios complejos 
(ej: Martes 20:00 y Jueves 07:00) y proyectar disponibilidad futura.
•Sistema de Alertas Tempranas: Debe existir una lógica que monitoree el saldo de clases 
pagadas vs. clases consumidas y genere alertas al equipo de ventas antes de que el saldo 
llegue a cero.
6. REQUISITOS NO FUNCIONALES (Calidad del Sistema)
•Latencia Baja en IA: La generación de ejercicios debe ocurrir de forma asíncrona (previa al 
envío) para que el alumno no espere.

## Page 3

•Integridad de Datos: Debe existir una "Fuente Única de la Verdad". Los estados del alumno 
(Activo/Pausado) deben propagarse instantáneamente a todos los módulos (Clases, IA, 
Facturación).
•Escalabilidad: La arquitectura debe soportar pasar de 50 a 500 alumnos sin requerir 
reingeniería de la base de datos central.
CONCLUSIÓN PARA EL EQUIPO:
Estamos construyendo un sistema donde la Pedagogía dicta la Tecnología. Cada línea de código o 
automatización debe servir al propósito de reducir la fricción operativa y maximizar la personalización 
del aprendizaje.

