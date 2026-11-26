import type { NextApiRequest, NextApiResponse } from 'next'
import { patchAirtableRecord } from '@/lib/airtable'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { teacherId, availability } = req.body as {
    teacherId?: string
    availability?: string // JSON-serialized boolean[][] or a formatted string
  }

  if (!teacherId || availability === undefined) {
    return res.status(400).json({ error: 'teacherId y availability son requeridos' })
  }

  try {
    const serialized = typeof availability === 'string' ? availability : JSON.stringify(availability)
    const updated = await patchAirtableRecord('Teachers', teacherId, {
      Availability: serialized,
    })

    if (!updated) {
      return res.status(404).json({ error: 'Profesor no encontrado' })
    }

    return res.status(200).json({ ok: true })
  } catch (err: any) {
    return res.status(500).json({ error: 'Error al guardar disponibilidad', detail: err.message })
  }
}
