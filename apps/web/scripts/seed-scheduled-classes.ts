import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Read .env.local
const envPath = path.join(process.cwd(), '.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')
const envVars: Record<string, string> = {}
envContent.split('\n').forEach(line => {
  const [k, ...v] = line.split('=')
  if (k) envVars[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '')
})

if (typeof window === 'undefined' && !(global as any).WebSocket) {
  try {
    (global as any).WebSocket = require('ws');
  } catch {
    (global as any).WebSocket = class DummyWebSocket {};
  }
}

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL || 'https://swmklobpnrkjpfackboc.supabase.co'
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3bWtsb2JwbnJranBmYWNrYm9jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzUwODcwOCwiZXhwIjoyMTAzMDg0NzA4fQ.6Wg17RIckj6OL0dYEqaKiIoS1MZncV-5daO_RnfNoK4'
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
})

const TEACHER_SANTIAGO_HENAO = '20682d77-308a-45f6-895d-cb337faf7a3a'

interface StudentConfig {
  id: string
  fullName: string
  pin: string
  recurrenceDay?: string
  recurrenceTime?: string
  sessions?: { dateISO: string; name: string; topicId?: string }[]
}

const STUDENTS: StudentConfig[] = [
  // 1. Paulina Uribe Giraldo & Lucia Uribe Giraldo (Martes y Jueves 1:00 PM - 2:00 PM)
  {
    id: '27454176-ebd0-4628-8e4d-36fd262f54c5',
    fullName: 'Paulina Uribe Giraldo',
    pin: '2PA217',
    recurrenceDay: 'Mar,Jue',
    recurrenceTime: '1:00 PM'
  },
  {
    id: 'ae949b77-bc5e-4e8e-aa14-5da184f9b551',
    fullName: 'Lucia uribe giraldo',
    pin: '4LU420',
    recurrenceDay: 'Mar,Jue',
    recurrenceTime: '1:00 PM'
  },
  // 2. Jose Yepes (Sin clases agendadas)
  {
    id: '2ce10e96-f820-42ca-b30b-3ba99061c260',
    fullName: 'Jose Yepes',
    pin: '1JO106',
    recurrenceDay: '',
    recurrenceTime: ''
  },
  // 3. Romario (Miércoles 7:00 PM)
  {
    id: '5f4e7cb9-050f-4c97-b53e-d6de66a9e9b0',
    fullName: 'Romario',
    pin: '7RO337',
    recurrenceDay: 'Mie',
    recurrenceTime: '7:00 PM',
    sessions: [
      { dateISO: '2026-09-23T19:00:00-05:00', name: 'Sesión LDS: Conversación & Fluidez', topicId: 'recTopic1' },
      { dateISO: '2026-09-30T19:00:00-05:00', name: 'Sesión LDS: The Time Words Logic', topicId: 'recTopic2' },
      { dateISO: '2026-10-07T19:00:00-05:00', name: 'Sesión LDS: The Present & Ghost Do', topicId: 'recTopic3' }
    ]
  },
  // 4. Yuliana Higuita, Nicolas Polo, Cristina Zabala (Grupo / Clases individuales sin horario fijo)
  {
    id: '7c5250a8-c0a6-463b-8897-5471aa6dc721',
    fullName: 'Yuliana Higuita Osorio',
    pin: '9YU019',
    recurrenceDay: '',
    recurrenceTime: ''
  },
  {
    id: 'd9782e46-fbd3-4dc5-8f1b-12872550309b',
    fullName: 'Nicolas Iván Polo Lara',
    pin: '4NI902',
    recurrenceDay: '',
    recurrenceTime: ''
  },
  {
    id: 'd1c9de5a-a225-4b2c-8ab6-7283dd6e0ecc',
    fullName: 'Cristina Zabala',
    pin: '2CR203',
    recurrenceDay: '',
    recurrenceTime: ''
  },
  // 5. Beatriz Orozco (Viernes 7:30 AM)
  {
    id: 'a16d8bc8-68d1-4d86-bc04-22388287ffb6',
    fullName: 'Beatriz Orozco',
    pin: '8BE831',
    recurrenceDay: 'Vie',
    recurrenceTime: '7:30 AM',
    sessions: [
      { dateISO: '2026-09-25T07:30:00-05:00', name: 'Sesión LDS: The Universal Idea', topicId: 'recTopic1' },
      { dateISO: '2026-10-02T07:30:00-05:00', name: 'Sesión LDS: The Time Words Logic', topicId: 'recTopic2' },
      { dateISO: '2026-10-09T07:30:00-05:00', name: 'Sesión LDS: The Present & Ghost Do', topicId: 'recTopic3' }
    ]
  },
  // 6. Santiago Montes (Martes y Miércoles 7:00 AM)
  {
    id: 'f8227ed6-8e8a-4694-a70b-d1de3301734a',
    fullName: 'Santiago',
    pin: '1SA296',
    recurrenceDay: 'Mar,Mie',
    recurrenceTime: '7:00 AM',
    sessions: [
      { dateISO: '2026-09-22T07:00:00-05:00', name: 'Sesión LDS: The Universal Idea', topicId: 'recTopic1' },
      { dateISO: '2026-09-23T07:00:00-05:00', name: 'Sesión LDS: The Time Words Logic', topicId: 'recTopic2' },
      { dateISO: '2026-09-29T07:00:00-05:00', name: 'Sesión LDS: The Present & Ghost Do', topicId: 'recTopic3' },
      { dateISO: '2026-09-30T07:00:00-05:00', name: 'Sesión LDS: Past Architecture', topicId: 'recTopic4' }
    ]
  }
]

// Group sessions for Paulina and Lucía
const PAULINA_LUCIA_SESSIONS = [
  { dateISO: '2026-09-22T13:00:00-05:00', name: 'Sesión LDS: The Universal Idea', topicId: 'recTopic1' },
  { dateISO: '2026-09-24T13:00:00-05:00', name: 'Sesión LDS: The Time Words Logic', topicId: 'recTopic2' },
  { dateISO: '2026-09-29T13:00:00-05:00', name: 'Sesión LDS: The Present & Ghost Do', topicId: 'recTopic3' },
  { dateISO: '2026-10-01T13:00:00-05:00', name: 'Sesión LDS: Past Architecture', topicId: 'recTopic4' }
]

async function run() {
  console.log('🚀 Iniciando activación de alumnos y generación de clases agendadas...')

  for (const s of STUDENTS) {
    // 1. Activar estudiante en students table
    const { error: updErr } = await supabase
      .from('students')
      .update({
        Status: 'Active'
      })
      .eq('id', s.id)

    if (updErr) {
      console.error(`Error actualizando alumno ${s.fullName}:`, updErr.message)
    } else {
      console.log(`✅ Alumno activado: ${s.fullName} (${s.pin})`)
    }

    // 2. Crear o actualizar vínculo en student_teacher con Santiago Henao
    const { data: existingST } = await supabase
      .from('student_teacher')
      .select('id')
      .eq('Student', s.id)

    if (existingST && existingST.length > 0) {
      await supabase
        .from('student_teacher')
        .update({
          Teacher: TEACHER_SANTIAGO_HENAO,
          Status: 'Active',
          'Recurrence Day': s.recurrenceDay || '',
          'Recurrence Time': s.recurrenceTime || '',
          Notes: 'Profesor asignado: Santiago Henao'
        })
        .eq('id', existingST[0].id)
    } else {
      await supabase
        .from('student_teacher')
        .insert([{
          Student: s.id,
          Teacher: TEACHER_SANTIAGO_HENAO,
          Status: 'Active',
          'Start Date': '2026-09-19',
          'Recurrence Day': s.recurrenceDay || '',
          'Recurrence Time': s.recurrenceTime || '',
          Notes: 'Profesor asignado: Santiago Henao'
        }])
    }
  }

  // 3. Crear clases de Paulina y Lucía
  const paulinaId = '27454176-ebd0-4628-8e4d-36fd262f54c5'
  const luciaId = 'ae949b77-bc5e-4e8e-aa14-5da184f9b551'

  for (const sess of PAULINA_LUCIA_SESSIONS) {
    const { data: newSess, error: sErr } = await supabase
      .from('sessions')
      .insert([{
        'Session Name': `${sess.name} (Paulina & Lucía)`,
        Teacher: TEACHER_SANTIAGO_HENAO,
        'Curriculum Topic': sess.topicId || 'recTopic1',
        'Scheduled Date/Time': new Date(sess.dateISO).toISOString(),
        'Duration (minutes)': 60,
        Status: 'Scheduled'
      }])
      .select()
      .single()

    if (sErr || !newSess) {
      console.error('Error creando sesión Paulina & Lucía:', sErr?.message)
      continue
    }

    // Link both Paulina & Lucía in session_participants
    await supabase.from('session_participants').insert([
      { Session: newSess.id, Student: paulinaId },
      { Session: newSess.id, Student: luciaId }
    ])
    console.log(`📅 Clase agendada creada: ${sess.name} para Paulina & Lucía el ${sess.dateISO}`)
  }

  // 4. Crear clases individuales para Romario, Beatriz y Santiago Montes
  for (const s of STUDENTS) {
    if (!s.sessions || s.sessions.length === 0) continue

    for (const sess of s.sessions) {
      const { data: newSess, error: sErr } = await supabase
        .from('sessions')
        .insert([{
          'Session Name': `${sess.name} (${s.fullName})`,
          Teacher: TEACHER_SANTIAGO_HENAO,
          'Curriculum Topic': sess.topicId || 'recTopic1',
          'Scheduled Date/Time': new Date(sess.dateISO).toISOString(),
          'Duration (minutes)': 60,
          Status: 'Scheduled'
        }])
        .select()
        .single()

      if (sErr || !newSess) {
        console.error(`Error creando sesión para ${s.fullName}:`, sErr?.message)
        continue
      }

      await supabase.from('session_participants').insert([{
        Session: newSess.id,
        Student: s.id
      }])
      console.log(`📅 Clase agendada creada: ${sess.name} para ${s.fullName} el ${sess.dateISO}`)
    }
  }

  console.log('✨ ¡Base de datos preparada y clases agendadas con éxito!')
}

run().catch(console.error)
