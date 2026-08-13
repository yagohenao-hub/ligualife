import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchFromAirtable, fetchAirtableRecord, patchAirtableRecord } from '@/lib/airtable'

// Example: /api/next-session?studentId=rec123&currentSessionId=rec456
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { studentId, currentSessionId } = req.query as { studentId?: string; currentSessionId?: string }
  if (!studentId || !currentSessionId) return res.status(400).json({ error: 'Faltan parámetros' })

  try {
    // We need to find the specific Session Participant records for this student where the Session is Scheduled
    // Since complex linked table filtering can be tricky, we'll fetch recently scheduled participants
    // and resolve their sessions, or just query Sessions IF it has a direct student link.
    // In our typical schema, Sessions links to Session Participants.
    
    // We'll fetch all 'Scheduled' sessions from Airtable and filter locally to ensure correctness.
    // NOTE: In production, a formula filtering `Status = 'Scheduled'` is preferred.
    const sessionsRes = await fetchFromAirtable(
      'Sessions',
      `filterByFormula=AND({Status}='Scheduled', RECORD_ID() != '${currentSessionId}')&sort[0][field]=Scheduled Date/Time&sort[0][direction]=asc`
    )

    let nextSession = null

    for (const record of sessionsRes.records || []) {
      const participantIds = record.fields['Session Participants'] as string[]
      if (!participantIds || participantIds.length === 0) continue
      
      // Check if this session involves our student
      let involvesStudent = false
      for (const pId of participantIds) {
        const participant = await fetchAirtableRecord('Session Participants', pId)
        const sId = (participant?.fields['Student'] as string[])?.[0]
        if (sId === studentId) {
          involvesStudent = true
          break
        }
      }

      if (involvesStudent) {
        const dateStr = record.fields['Scheduled Date/Time'] as string
        nextSession = {
          id: record.id,
          date: new Date(dateStr).toISOString(),
          formattedTime: new Date(dateStr).toLocaleString(),
        }
        break
      }
    }

    if (!nextSession) {
      return res.status(200).json({ nextSession: null })
    }

    return res.status(200).json({ nextSession })
  } catch (err: any) {
    return res.status(500).json({ error: 'Error', detail: err.message })
  }
}
