import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchFromAirtable } from '@/lib/airtable'
import type { Exercise } from '@/types'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { studentId } = req.query as { studentId?: string }
  if (!studentId) return res.status(400).json({ error: 'studentId es requerido' })

  try {
    const formula = `FIND('${studentId}', ARRAYJOIN({Student}, ',')) > 0`
    const params = [
      `filterByFormula=${encodeURIComponent(formula)}`,
      `maxRecords=5`,
      `sort[0][field]=Generated At`,
      `sort[0][direction]=desc`,
    ].join('&')

    const data = await fetchFromAirtable('Exercises', params)

    const exercises: Exercise[] = (data.records || []).map((r: any) => ({
      id: r.id,
      studentId,
      generatedExample: (r.fields['Exercise Content'] ?? '') as string,
      date: (r.fields['Generated At'] ?? '') as string,
    }))

    return res.status(200).json(exercises)
  } catch {
    return res.status(500).json({ error: 'Error al obtener ejercicios' })
  }
}
