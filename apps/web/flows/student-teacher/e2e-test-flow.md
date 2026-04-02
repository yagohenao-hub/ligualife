# Flujo E2E: Registro Profesor + Alumno → Clase

Guia paso a paso para replicar el flujo completo de registro, activacion y primera clase entre un profesor y un alumno nuevo.

**URL**: https://lingualife.vercel.app
**Admin Token**: LinguaAdmin2025
**Tiempo estimado**: 10-15 minutos

---

## Paso 1: Registrar Profesor

1. Ir a `/register/teacher`
2. Llenar:
   - Nombre: `[nombre real del profesor]`
   - Email: `[email real]`
   - WhatsApp: `+57 [numero]`
   - Pais: Colombia
3. Click "Siguiente"
4. Seleccionar **al menos 3 intereses** (ej: Startups, AI & Tech, Programacion)
5. Click "Siguiente"
6. En el grid de disponibilidad, seleccionar bloques horarios (ej: Lun/Mar/Mie 9am-10am)
   - Los bloques con borde morado muestran donde hay demanda de alumnos
7. Click "Siguiente"
8. Llenar datos de pago:
   - Numero de Identificacion
   - Nombre del Banco
   - Tipo de Cuenta (Ahorros/Corriente)
   - Numero de Cuenta
9. Click "Finalizar Registro"
10. Debe aparecer: "Aplicacion Enviada!"

**Resultado en Airtable**: Nuevo record en tabla Teachers con PIN auto-generado (4 digitos)

---

## Paso 2: Registrar Alumno (matcheando con el profesor)

1. Ir a `/register/student`
2. Llenar:
   - Nombre: `[nombre del alumno]`
   - Email: `[email real]`
   - WhatsApp: `+57 [numero]`
   - Rango de edad: Jovenes/Adultos (14+)
3. Click "Siguiente"
4. Seleccionar objetivo (ej: Business)
5. Click "Siguiente"
6. Seleccionar **al menos 5 intereses** — incluir los mismos que el profesor para matchear
7. Click "Siguiente"
8. En el grid de disponibilidad:
   - Los bloques con borde verde indican donde HAY profesores disponibles
   - Seleccionar los **mismos horarios** que el profesor registro
9. Opcionalmente activar "Voy a tomar clases grupales"
10. Click "Finalizar Registro"
11. Debe aparecer: "Registro Exitoso!"

**Resultado en Airtable**: Nuevo record en tabla Students con Status=Pending, SIN PIN

---

## Paso 3: Activar en Admin

1. Ir a `/admin`, ingresar token `LinguaAdmin2025`
2. Tab "Alumnos" → buscar al alumno nuevo (Status=Pending)
3. Cambiar Status a "Active"
4. Asignar tokens (minimo 1)
5. **MANUAL EN AIRTABLE**: Ir a la tabla Students, buscar al alumno, y:
   - Asignar un PIN unico (4-6 caracteres, verificar que no exista ya)
   - Verificar que el campo Availability tenga datos (JSON boolean[][])
6. Tab "Profesores" → verificar que el profesor aparece
7. **MANUAL EN AIRTABLE**: Ir a tabla Student-Teacher, crear record:
   - Student: [link al alumno]
   - Teacher: [link al profesor]
   - Status: Active

---

## Paso 4: Generar Clases

Desde el admin panel:
1. Seleccionar al alumno
2. Click "Generar Clases"
3. Parametros:
   - Semanas: 4 (recomendado)
   - Profesor: el que se asigno
4. Confirmar

**O via API** (mas rapido):
```
POST /api/admin/generate-classes
Headers: { x-admin-token: LinguaAdmin2025 }
Body: {
  "studentId": "[id del alumno]",
  "teacherId": "[id del profesor]",
  "weeksToGenerate": 4
}
```

**Resultado**: N sesiones creadas en tabla Sessions + Session Participants

---

## Paso 5: Login Profesor

1. Ir a `/`
2. Ingresar el PIN del profesor (ver en Airtable, campo PIN de Teachers)
3. Debe redirigir a `/dashboard`
4. Verificar: ve sesiones del alumno con nombre, fecha y hora

---

## Paso 6: Entrar a Clase (Profesor)

1. En el dashboard, click en una sesion del dia
2. Debe ir a `/classroom?sessionId=recXXX`
3. Verificar:
   - Nombre del alumno correcto
   - Vertical (del goal seleccionado)
   - Intereses (deben mostrar nombres, NO record IDs)
   - Malla curricular (si hay topics asignados)
4. Click "Generar Slides" si no hay cache
5. Verificar que aparecen 4 slides + warmup + cooldown
6. Click "Iniciar Clase" → timer arranca

---

## Paso 7: Login Alumno

1. Limpiar sessionStorage del navegador
2. Ir a `/`
3. Ingresar el PIN del alumno
4. Debe redirigir a `/student`
5. Verificar:
   - Nombre correcto
   - Profesor asignado correcto
   - Tokens correctos
   - Sesiones proximas con fechas y horas **en hora Colombia** (no UTC)
   - Barra de progreso

---

## Problemas Conocidos (a verificar en cada prueba)

| # | Problema | Donde se ve | Severidad |
|---|----------|-------------|-----------|
| 1 | Horas en UTC, no Colombia | Student dashboard, fechas de sesion | CRITICO |
| 2 | Alumno no recibe PIN al registrarse | Registro alumno | CRITICO |
| 3 | Intereses muestran record IDs | Classroom sidebar | ALTO |
| 4 | Sesiones sin topic asignado | Classroom, dashboard | ALTO |
| 5 | No hay Status lifecycle para profesores | Admin panel | MEDIO |
| 6 | No hay feedback de error visual en registro teacher si falla | Paso 4 del wizard | MEDIO |
| 7 | Clases duplicadas si se genera 2 veces | Admin | MEDIO |
