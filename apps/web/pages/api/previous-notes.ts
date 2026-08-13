import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchFromAirtable, fetchAirtableRecord } from '@/lib/airtable'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { studentId } = req.query as { studentId?: string }
  if (!studentId) return res.status(400).json({ error: 'studentId es requerido' })

  try {
    // 1. Get all session participants for the student
    const participantsData = await fetchFromAirtable(
      'Session Participants',
      `filterByFormula=NOT({Teacher Observations}='')&maxRecords=10` // Will filter locally by student since FIND on array can be tricky without exact syntax
    )

    let latestNotes = null
    let latestDate = 0

    // Filter down to the student and find the most recent session
    for (const record of participantsData.records || []) {
      const studentArr = record.fields['Student'] as string[] | string
      const isMatch = Array.isArray(studentArr) 
        ? studentArr.includes(studentId)
        : studentArr === studentId
      if (!isMatch) continue

      const notes = record.fields['Teacher Observations'] as string
      if (!notes) continue

      // Get the session to find its date
      const sessionIds = record.fields['Session'] as string[]
      if (sessionIds && sessionIds[0]) {
        const session = await fetchAirtableRecord('Sessions', sessionIds[0])
        const dateStr = session?.fields['Scheduled Date/Time'] as string
        if (dateStr) {
          const timestamp = new Date(dateStr).getTime()
          if (timestamp > latestDate) {
            latestDate = timestamp
            latestNotes = {
              date: dateStr,
              notes: notes,
              sessionName: session?.fields['Session Name'] as string ?? 'Clase Anterior',
            }
          }
        }
      }
    }

    return res.status(200).json({ previousNotes: latestNotes })
  } catch (err: any) {
    return res.status(500).json({ error: 'Error', detail: err.message })
  }
}
