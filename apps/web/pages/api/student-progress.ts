import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchAirtableRecord } from '@/lib/airtable'

export interface TopicProgress {
  topicId: string
  topicName: string
  status: 'Not started' | 'In progress' | 'Completed'
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  // Accept either a comma-separated list of progress record IDs or a studentId
  const { ids } = req.query as { ids?: string }
  if (!ids) return res.status(400).json({ error: 'ids es requerido' })

  const recordIds = ids.split(',').map(s => s.trim()).filter(Boolean)
  if (recordIds.length === 0) return res.status(200).json([])

  try {
    const progress = await Promise.all(
      recordIds.map(async (recordId) => {
        const r = await fetchAirtableRecord('Student Topic Progress', recordId)
        if (!r) return null
        const topicId = (r.fields['Curriculum Topic'] as string[])?.[0] ?? ''
        let topicName = topicId
        if (topicId) {
          const topicRecord = await fetchAirtableRecord('Curriculum Topics', topicId)
          topicName = (topicRecord?.fields?.['Topic Name'] ?? topicRecord?.fields?.['Name'] ?? topicId) as string
        }
        return {
          topicId,
          topicName,
          status: (r.fields['Status'] as TopicProgress['status']) ?? 'Not started',
        }
      })
    )

    return res.status(200).json(progress.filter((p): p is TopicProgress => p !== null))
  } catch (err: any) {
    return res.status(500).json({ error: 'Error al obtener progreso', detail: err.message })
  }
}
