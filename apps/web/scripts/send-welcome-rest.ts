import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

// Mock WebSocket for Node.js
if (typeof window === 'undefined' && !(global as any).WebSocket) {
  try {
    (global as any).WebSocket = require('ws')
  } catch {
    (global as any).WebSocket = class DummyWebSocket {}
  }
}

// 1. Cargar variables de entorno
const envPath = path.join(process.cwd(), '.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')
const envVars: Record<string, string> = {}
envContent.split('\n').forEach(line => {
  const [k, ...v] = line.split('=')
  if (k) envVars[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '')
})

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL || 'https://swmklobpnrkjpfackboc.supabase.co'
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } })

const evoUrl = envVars.EVOLUTION_API_URL || 'https://evolution-api-production-0971.up.railway.app'
const evoKey = envVars.EVOLUTION_API_KEY || 'TuSuperSecretaGlobalApiKeyDeEvolution'
const evoInstance = envVars.EVOLUTION_INSTANCE || 'PocketCoach'

// 2. IDs de "el resto" de alumnos
const REST_STUDENT_IDS = [
  '27454176-ebd0-4628-8e4d-36fd262f54c5', // Paulina Uribe Giraldo
  '5f4e7cb9-050f-4c97-b53e-d6de66a9e9b0', // Romario
  'b1068664-4e67-4070-a564-8ac8a1f629bb', // Santiago Montes (el verdadero Santiago Montes)
  '2ce10e96-f820-42ca-b30b-3ba99061c260', // Jose Yepes
  '7c5250a8-c0a6-463b-8897-5471aa6dc721', // Yuliana Higuita Osorio
  'd1c9de5a-a225-4b2c-8ab6-7283dd6e0ecc'  // Cristina Zabala
]

const SCHEDULE_MAP: Record<string, string> = {
  '27454176-ebd0-4628-8e4d-36fd262f54c5': 'tus próximas clases agendadas (Martes y Jueves 1:00 PM)',
  '5f4e7cb9-050f-4c97-b53e-d6de66a9e9b0': 'tus próximas clases agendadas (Miércoles 7:00 PM)',
  'b1068664-4e67-4070-a564-8ac8a1f629bb': 'tus próximas clases agendadas (Martes y Miércoles 7:00 AM)',
  '2ce10e96-f820-42ca-b30b-3ba99061c260': 'los temas y estructura de tu currículum',
  '7c5250a8-c0a6-463b-8897-5471aa6dc721': 'los temas y estructura de tu currículum',
  'd1c9de5a-a225-4b2c-8ab6-7283dd6e0ecc': 'los temas y estructura de tu currículum'
}

function sanitizePhone(phone: string): string {
  const raw = (phone || '').split('@')[0].split(':')[0]
  let digits = raw.replace(/[^0-9]/g, '')
  if (digits.length === 10 && digits.startsWith('3')) {
    digits = '57' + digits
  }
  return digits
}

function getFirstName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/)
  return parts[0] || fullName
}

function buildMessage(student: any): string {
  const name = getFirstName(student['Full Name'] || '')
  const pin = student['PIN'] || ''
  const scheduleText = SCHEDULE_MAP[student.id] || 'tus clases y temas vistos'

  return `¡Hola ${name}! 🚀

Bienvenido(a) a tu nuevo *Dashboard de Estudiante de LinguaLife*. Diseñamos este espacio para que lleves tu aprendizaje al siguiente nivel con una experiencia más interactiva, fluida y personalizada.

Desde tu panel ya puedes:
• Consultar ${scheduleText}
• Repasar cada tema con fichas esenciales y bloques de construcción del idioma
• Practicar con *Trivias Infinitas* y subir tus rangos de maestría (Bronce, Plata, Oro, Diamante y Maestro)
• Generar guías interactivas de práctica guiadas por IA

Muy pronto estaremos integrando nuevas funciones como *escenas conversacionales interactivas en video*, *banco multimedia* y *flashcards inteligentes*.

🔗 *Enlace de acceso:* https://lingualife.vercel.app/login
🔑 *Tu PIN de acceso:* ${pin}

*Por favor agrega este número a tus contactos para que no se caiga por "spam".*

¡Entra y empieza a explorar! Si tienes cualquier inquietud, aquí estamos.`
}

async function sendWhatsApp(phone: string, text: string): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const res = await fetch(`${evoUrl}/message/sendText/${evoInstance}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': evoKey
      },
      body: JSON.stringify({
        number: phone,
        text: text,
        options: {
          delay: 2500,
          presence: 'composing',
          linkPreview: false
        }
      })
    })

    if (!res.ok) {
      const err = await res.text()
      return { success: false, error: err }
    }

    const data = await res.json()
    return { success: true, data }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function run() {
  console.log('📡 Consultando los alumnos restantes en Supabase...')
  const { data: students, error: dbErr } = await supabase
    .from('students')
    .select('id, "Full Name", PIN, Phone, Status')
    .in('id', REST_STUDENT_IDS)

  if (dbErr || !students) {
    console.error('❌ Error consultando alumnos:', dbErr)
    return
  }

  console.log(`✅ Se encontraron ${students.length} alumnos para el envío restante.\n`)

  const results: any[] = []

  for (let i = 0; i < students.length; i++) {
    const s = students[i]
    const phone = sanitizePhone(s.Phone)
    const name = s['Full Name']
    const msg = buildMessage(s)

    console.log(`[${i + 1}/${students.length}] Enviando a ${name} (${phone})...`)

    if (!phone || phone.length < 10) {
      console.warn(`⚠️ Teléfono inválido para ${name}: "${s.Phone}". Se omite el envío.`)
      results.push({ name, phone, status: 'INVALID_PHONE' })
      continue
    }

    const res = await sendWhatsApp(phone, msg)
    if (res.success) {
      console.log(`  ✅ Entregado a ${name} (${phone})`)
      results.push({ name, phone, status: 'SENT', messageId: res.data?.key?.id })
    } else {
      console.error(`  ❌ Falló entrega a ${name} (${phone}):`, res.error)
      results.push({ name, phone, status: 'FAILED', error: res.error })
    }

    if (i < students.length - 1) {
      await sleep(3500)
    }
  }

  console.log('\n📊 RESUMEN FINAL:')
  console.table(results)
}

run()
