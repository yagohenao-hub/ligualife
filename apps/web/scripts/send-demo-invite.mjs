import fs from 'fs'
import path from 'path'

// Leer .env.local para obtener las credenciales de Evolution API
let evoUrl = 'https://evolution-api-production-0971.up.railway.app'
let evoKey = 'TuSuperSecretaGlobalApiKeyDeEvolution'
let evoInstance = 'PocketCoach'
let defaultSiteUrl = 'https://lingualife.vercel.app/student'

try {
  const envPath = path.join(process.cwd(), '.env.local')
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8')
    const matchUrl = content.match(/EVOLUTION_API_URL\s*=\s*(.*)/)
    const matchKey = content.match(/EVOLUTION_API_KEY\s*=\s*(.*)/)
    const matchInst = content.match(/EVOLUTION_INSTANCE\s*=\s*(.*)/)
    const matchSite = content.match(/NEXT_PUBLIC_SITE_URL\s*=\s*(.*)/)

    if (matchUrl) evoUrl = matchUrl[1].trim().replace(/['"]/g, '')
    if (matchKey) evoKey = matchKey[1].trim().replace(/['"]/g, '')
    if (matchInst) evoInstance = matchInst[1].trim().replace(/['"]/g, '')
    if (matchSite) defaultSiteUrl = matchSite[1].trim().replace(/['"]/g, '')
  }
} catch (err) {
  console.log('No se pudo leer .env.local, usando valores por defecto.')
}

// Extraer argumentos de la línea de comandos
const args = process.argv.slice(2)
let phoneArg = ''
let nameArg = 'Profesor'
let urlArg = defaultSiteUrl
let isAll = false

args.forEach(arg => {
  if (arg.startsWith('--phone=')) phoneArg = arg.replace('--phone=', '').trim()
  else if (arg.startsWith('--name=')) nameArg = arg.replace('--name=', '').trim()
  else if (arg.startsWith('--url=')) urlArg = arg.replace('--url=', '').trim()
  else if (arg === '--all') isAll = true
})

if (!phoneArg && !isAll) {
  console.log(`
📱 USO DEL SCRIPT DE POCKET COACH (INVITACIÓN DEMO):

  1. Enviar solo a tu profesor (por número de teléfono):
     node scripts/send-demo-invite.mjs --phone=573136522545 --name="NombreProfe"

  2. Enviar usando el servidor Next.js corriendo localmente:
     curl -X POST http://localhost:3000/api/pocket-coach/send-demo-invite -H "Content-Type: application/json" -d '{"phone":"573136522545", "name":"Jose"}'

  3. Enviar a todos los profesores cuando estés listo:
     node scripts/send-demo-invite.mjs --all
`)
  process.exit(0)
}

function buildMessage(name, url) {
  const firstName = name.trim().split(/\s+/)[0] || 'Profesor'
  return `¡Hola ${firstName}! 👋 Te invitamos a probar la nueva vista interactiva de estudiante en LinguaLife.

🔗 *Acceso de prueba:*
${url}

*Herramientas listas para testear:*
1. 📚 *Repaso de Temas & Guías Pedagógicas:* Haz clic en cualquier tema estudiado para ver la diapositiva del concepto clave y generar la guía con 3 actividades, pistas y soluciones explicadas.
2. 🎯 *Trivia Infinita por Tema:* Pon a prueba tu velocidad de respuesta tema por tema con explicaciones paso a paso.
3. 📺 *Solicitud de Actividades de Series:* Simula la solicitud de clases adaptadas con vocabulario real de series o películas.
4. ✨ *Novedades en Desarrollo:* Explora la sección de Próximamente con el preview de lecturas interactivas, flashcards 3D, escenarios 2D y videos nativos.

¡Quedamos atentos a cualquier duda o comentario que tengas! 🙌`
}

async function sendToPhone(phone, name) {
  const cleanPhone = phone.replace(/[^0-9]/g, '')
  if (!cleanPhone) {
    console.error(`❌ Teléfono inválido: ${phone}`)
    return
  }

  const text = buildMessage(name, urlArg)

  console.log(`🚀 Despachando invitacion por Pocket Coach a ${name} (${cleanPhone})...`)
  try {
    const res = await fetch(`${evoUrl}/message/sendText/${evoInstance}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': evoKey
      },
      body: JSON.stringify({
        number: cleanPhone,
        text: text,
        options: {
          delay: 1500,
          presence: 'composing'
        }
      })
    })

    const status = res.status
    const data = await res.json()
    if (res.ok) {
      console.log(`✅ ¡Mensaje enviado exitosamente a ${cleanPhone}! (Status ${status})`)
    } else {
      console.error(`❌ Error en respuesta de Evolution API (${status}):`, data)
    }
  } catch (err) {
    console.error(`❌ Error de conexión al enviar a ${cleanPhone}:`, err.message)
  }
}

async function main() {
  if (phoneArg) {
    await sendToPhone(phoneArg, nameArg)
  }
}

main()
