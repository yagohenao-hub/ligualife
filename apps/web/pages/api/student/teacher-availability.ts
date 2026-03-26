import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchAirtableRecord, patchAirtableRecord, createAirtableRecord } from '@/lib/airtable'
import { fetchFromAirtable } from '@/lib/airtable'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { teacherId } = req.query as { teacherId?: string }
  if (!teacherId) return res.status(400).json({ error: 'teacherId es requerido' })

  try {
    const teacher = await fetchAirtableRecord('Teachers', teacherId)
    if (!teacher) return res.status(404).json({ error: 'Teacher not found' })

    const rawAvail = teacher.fields['Availability'] as string | null
    let availability: boolean[][] = []
    if (rawAvail) {
      try { availability = JSON.parse(rawAvail) } catch { availability = [] }
    }

    return res.status(200).json({ availability })
  } catch (err: any) {
    return res.status(500).json({ error: 'Error', detail: err.message })
  }
}
