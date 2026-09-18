import type { NextApiRequest, NextApiResponse } from 'next'
import { EvolutionAPI } from '@/lib/evolution'
import { fetchFromAirtable } from '@/lib/airtable'

export const DEFAULT_DEMO_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lingualife.vercel.app/student'

export function buildDemoMessage(targetName: string = 'Profesor', url: string = DEFAULT_DEMO_URL): string {
  const firstName = targetName.trim().split(/\s+/)[0] || 'Profesor'
  
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  try {
    const { phone, all, name, url } = req.body || req.query || {}
    const demoUrl = (url as string) || DEFAULT_DEMO_URL

    // Verificar estado de conexión de Evolution API (Pocket Coach)
    const conn = await EvolutionAPI.checkConnectionStatus()
    if (!conn.connected) {
      return res.status(503).json({
        success: false,
        error: `Instancia de Pocket Coach WhatsApp no conectada (${conn.state}). Revisa el QR de Evolution API.`
      })
    }

    const recipients: Array<{ name: string; phone: string }> = []

    if (phone) {
      // Envío a un número específico de prueba (ej: el profesor)
      recipients.push({
        name: (name as string) || 'Profesor',
        phone: String(phone)
      })
    } else if (all === 'true' || all === 'teachers') {
      // Despacho masivo a profesores
      const data = await fetchFromAirtable('Teachers', 'sort[0][field]=Name&sort[0][direction]=asc').catch(() => ({ records: [] }))
      const records = data.records || []
      
      records.forEach((r: any) => {
        const rawPhone = (r.fields['Phone'] || '').toString().trim()
        const teacherName = (r.fields['Name'] || r.fields['Full Name'] || 'Profesor').toString().trim()
        if (rawPhone && rawPhone.length >= 7) {
          recipients.push({ name: teacherName, phone: rawPhone })
        }
      })
    } else {
      return res.status(400).json({
        success: false,
        error: 'Debes especificar `phone` (ej: 573136522545) o `all=true` para envío masivo.'
      })
    }

    const results = []

    for (const recipient of recipients) {
      const msg = buildDemoMessage(recipient.name, demoUrl)
      console.log(`[Pocket Coach Demo Dispatch] Enviando a ${recipient.name} (${recipient.phone})...`)
      
      const evoRes = await EvolutionAPI.sendText(recipient.phone, msg).catch(err => ({
        success: false,
        error: String(err)
      }))

      results.push({
        name: recipient.name,
        phone: recipient.phone,
        response: evoRes
      })
    }

    return res.status(200).json({
      success: true,
      count: results.length,
      results
    })
  } catch (error: any) {
    console.error('[Pocket Coach Demo Dispatch Error]:', error)
    return res.status(500).json({
      success: false,
      error: error.message || 'Error interno al enviar mensajes de prueba'
    })
  }
}
