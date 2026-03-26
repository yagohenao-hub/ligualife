import type { NextApiRequest, NextApiResponse } from 'next'
import { patchAirtableRecord } from '@/lib/airtable'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { participantId, notes } = req.body as { participantId?: string; notes?: string }
  if (!participantId) return res.status(400).json({ error: 'participantId es requerido' })

  try {
    await patchAirtableRecord('Session Participants', participantId, {
      'Teacher Observations': notes || '',
    })
    return res.status(200).json({ ok: true })
  } catch (err: any) {
    return res.status(500).json({ error: 'Error al reportar notas', detail: err.message })
  }
}
