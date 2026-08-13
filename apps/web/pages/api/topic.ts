import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchAirtableRecord } from '@/lib/airtable'
import type { Topic } from '@/types'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { id } = req.query as { id?: string }
  if (!id) return res.status(400).json({ error: 'id es requerido' })

  try {
    const record = await fetchAirtableRecord('Curriculum Topics', id)
    if (!record) return res.status(404).json({ error: 'Tópico no encontrado' })

    const topic: Topic = {
      id: record.id,
      title: (record.fields['Topic Name'] ?? record.fields['Name'] ?? '') as string,
      description: (record.fields['Description'] ?? '') as string,
      level: (record.fields['Level'] ?? '') as string,
      order: record.fields['Order'] as number | undefined,
      ldsFormula: (record.fields['LDS_Formula'] ?? '') as string,
      aiContext: (record.fields['AI_Context'] ?? '') as string,
      fase: (record.fields['Fase'] ?? '') as string,
    }

    return res.status(200).json(topic)
  } catch {
    return res.status(500).json({ error: 'Error al obtener tópico' })
  }
}
