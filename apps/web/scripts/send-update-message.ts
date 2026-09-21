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

// 1. Cargar variables de entorno de .env.local
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

// Estudiantes a los que enviar el mensaje
// Se obtendrán todos los estudiantes cuyo status sea "Active" en la base de datos
// O si prefieres los mismos de la prueba anterior, puedes volver a usar sus IDs,
// pero el código abajo hará una consulta por Status = 'Active' (ajusta según necesites).

function sanitizePhone(phone: string): string {
  const raw = (phone || '').split('@')[0].split(':')[0]
  let digits = raw.replace(/[^0-9]/g, '')
  // Ensure country code 57 for Colombia if 10 digits
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

  return `¡Hola ${name}! 🚀

Te escribimos para contarte que actualizamos tu *Dashboard de Estudiante de LinguaLife*.

Ahora en cada uno de tus temas cuentas con:
• *Resumen*: Diapositiva rápida con lo clave del tema.
• *Estudiar con IA*: Tutor interactivo para resolver cualquier duda.
• *Trivia*: Preguntas dinámicas para ganar puntos y subir de rango.
• *Short Reading*: Lecturas cortas de 100 palabras con audio para entrenar tu oído.

¡Pruébalas y dinos qué te pareció!

Además, recuerda que ya puedes empezar a probar el Coach en WhatsApp: puedes chatear o mandarle audios de voz para conversar o pedirle que te explique cosas.
(ténganle un poquito de paciencia que lo estamos puliendo). 

Gracias!!!`
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
  console.log('📡 Consultando datos de alumnos activos en Supabase...')
  // Obtener estudiantes activos. Si quieres restringirlo a una lista de IDs como la última vez,
  // cambia esto por .in('id', [ 'ID_1', 'ID_2' ])
  const { data: students, error: dbErr } = await supabase
    .from('students')
    .select('id, "Full Name", PIN, Phone, Status')
    .eq('Status', 'Active')

  if (dbErr || !students) {
    console.error('❌ Error consultando alumnos:', dbErr)
    return
  }

  console.log(`✅ Se encontraron ${students.length} alumnos activos para envío.\n`)

  const results: any[] = []

  for (let i = 0; i < students.length; i++) {
    const s = students[i]
    const phone = sanitizePhone(s.Phone)
    const name = s['Full Name']
    const msg = buildMessage(s)

    console.log(`[${i + 1}/${students.length}] Enviando mensaje a ${name} (${phone})...`)

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

    // Delay humanizado entre envíos (3.5 segundos)
    if (i < students.length - 1) {
      await sleep(3500)
    }
  }

  console.log('\n📊 RESUMEN FINAL DEL DESPLIEGUE:')
  console.table(results)
}

run()
