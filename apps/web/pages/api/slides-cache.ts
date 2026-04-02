import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchFromAirtable, fetchAirtableRecord, patchAirtableRecord } from '@/lib/airtable'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { topicId } = req.query as { topicId?: string }
  if (!topicId) return res.status(400).json({ error: 'topicId es requerido' })

  if (req.method === 'GET') {
    // Return cached assets for this topic
    try {
      const record = await fetchAirtableRecord('Curriculum Topics', topicId)
      if (!record) return res.status(404).json({ error: 'Tópico no encontrado' })

      let slides = null, warmup = null, cooldown = null
      try { slides = record.fields['Cached Slides'] ? JSON.parse(record.fields['Cached Slides'] as string) : null } catch {}
      try { warmup = record.fields['Cached Warmup'] ? JSON.parse(record.fields['Cached Warmup'] as string) : null } catch {}
      try { cooldown = record.fields['Cached Cooldown'] ? JSON.parse(record.fields['Cached Cooldown'] as string) : null } catch {}

      return res.status(200).json({ slides, warmup, cooldown })
    } catch (err: any) {
      return res.status(500).json({ error: 'Error al leer cache', detail: err.message })
    }
  }

  if (req.method === 'POST') {
    // Save assets to the Curriculum Topic record
    const { slides, warmup, cooldown } = req.body as { slides?: any[], warmup?: any, cooldown?: any }
    
    // We only update the fields that are provided
    const fieldsToUpdate: any = {}
    if (slides) fieldsToUpdate['Cached Slides'] = JSON.stringify(slides)
    if (warmup) fieldsToUpdate['Cached Warmup'] = JSON.stringify(warmup)
    if (cooldown) fieldsToUpdate['Cached Cooldown'] = JSON.stringify(cooldown)

    if (Object.keys(fieldsToUpdate).length === 0) {
      return res.status(400).json({ error: 'No hay datos para guardar' })
    }

    try {
      await patchAirtableRecord('Curriculum Topics', topicId, fieldsToUpdate)
      return res.status(200).json({ ok: true })
    } catch (err: any) {
      return res.status(500).json({ error: 'Error al guardar cache', detail: err.message })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
