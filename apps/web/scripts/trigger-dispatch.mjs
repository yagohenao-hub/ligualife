import fs from 'fs'
import path from 'path'

// Cargar variables de entorno locales si existen
let cronSecret = ''
try {
  const envPath = path.join(process.cwd(), '.env.local')
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8')
    const match = envContent.match(/CRON_SECRET\s*=\s*(.*)/)
    if (match) {
      cronSecret = match[1].trim().replace(/['"]/g, '')
    }
  }
} catch (err) {
  console.log('No se pudo leer .env.local, procediendo sin token.')
}

const targetUrl = 'http://localhost:3000/api/pocket-coach/dispatch'
console.log(`🚀 Iniciando trigger manual de Retos Diarios en: ${targetUrl}...`)

async function trigger() {
  try {
    const headers = {
      'Content-Type': 'application/json'
    }
    if (cronSecret) {
      headers['Authorization'] = `Bearer ${cronSecret}`
      console.log(`🔑 Usando CRON_SECRET de .env.local`)
    }

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers
    })

    const status = response.status
    const text = await response.text()

    console.log(`\n📬 Respuesta del Servidor [Status ${status}]:`)
    try {
      console.log(JSON.stringify(JSON.parse(text), null, 2))
    } catch {
      console.log(text)
    }
  } catch (error) {
    console.error('❌ Error enviando la solicitud:', error.message)
    console.log('Asegúrate de que el servidor Next.js esté corriendo localmente (npm run dev) en el puerto 3000.')
  }
}

trigger()
