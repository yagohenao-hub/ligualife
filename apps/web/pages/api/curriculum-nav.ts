import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchFromAirtable } from '@/lib/airtable'

export interface CurriculumNav {
  prev: { id: string; title: string; order: number } | null
  current: { id: string; title: string; order: number } | null
  next: { id: string; title: string; order: number } | null
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { topicId } = req.query as { topicId?: string }
  if (!topicId) return res.status(400).json({ error: 'topicId es requerido' })

  try {
    // Fetch the current topic to get its order number
    const currentData = await fetchFromAirtable(
      'Curriculum Topics',
      `filterByFormula=RECORD_ID()='${topicId}'&maxRecords=1`
    )
    const currentRecord = currentData.records?.[0]
    if (!currentRecord) return res.status(404).json({ error: 'Tópico no encontrado' })

    const currentOrder: number = currentRecord.fields['Order'] ?? 0
    const currentTitle: string =
      (currentRecord.fields['Topic Name'] ?? currentRecord.fields['Name'] ?? '') as string

    // Fetch adjacent topics by Order
    const prevOrder = currentOrder - 1
    const nextOrder = currentOrder + 1

    const [prevData, nextData] = await Promise.all([
      prevOrder > 0
        ? fetchFromAirtable(
            'Curriculum Topics',
            `filterByFormula={Order}=${prevOrder}&maxRecords=1`
          )
        : Promise.resolve({ records: [] }),
      fetchFromAirtable(
        'Curriculum Topics',
        `filterByFormula={Order}=${nextOrder}&maxRecords=1`
      ),
    ])

    const prevRecord = prevData.records?.[0] ?? null
    const nextRecord = nextData.records?.[0] ?? null

    const nav: CurriculumNav = {
      prev: prevRecord
        ? {
            id: prevRecord.id,
            title: (prevRecord.fields['Topic Name'] ?? prevRecord.fields['Name'] ?? '') as string,
            order: prevRecord.fields['Order'] as number,
          }
        : null,
      current: {
        id: currentRecord.id,
        title: currentTitle,
        order: currentOrder,
      },
      next: nextRecord
        ? {
            id: nextRecord.id,
            title: (nextRecord.fields['Topic Name'] ?? nextRecord.fields['Name'] ?? '') as string,
            order: nextRecord.fields['Order'] as number,
          }
        : null,
    }

    return res.status(200).json(nav)
  } catch (err: any) {
    return res.status(500).json({ error: 'Error al obtener navegación curricular', detail: err.message })
  }
}
