import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchFromAirtable, fetchAirtableRecord, patchAirtableRecord } from '@/lib/airtable'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { sessionId } = req.body as { sessionId?: string }
  if (!sessionId) return res.status(400).json({ error: 'sessionId es requerido' })

  try {
    // 1. Fetch current session
    const currentSession = await fetchAirtableRecord('Sessions', sessionId)
    if (!currentSession) return res.status(404).json({ error: 'Session not found' })

    const currentTopicIds = currentSession.fields['Curriculum Topic'] as string[]
    const currentTopicId = currentTopicIds?.[0]

    const participantIds = currentSession.fields['Session Participants'] as string[]
    let studentId = ''
    if (participantIds && participantIds[0]) {
      const participant = await fetchAirtableRecord('Session Participants', participantIds[0])
      studentId = (participant?.fields['Student'] as string[])?.[0] ?? ''
    }

    if (!studentId) return res.status(400).json({ error: 'Student not found in session' })

    // 2. Fetch all future scheduled sessions for cascading
    const futureSessionsRes = await fetchFromAirtable(
      'Sessions',
      `filterByFormula=AND({Status}='Scheduled', RECORD_ID() != '${sessionId}')&sort[0][field]=Scheduled Date/Time&sort[0][direction]=asc`
    )

    const futureSessionsForStudent = []
    for (const record of futureSessionsRes.records || []) {
      const pIds = record.fields['Session Participants'] as string[]
      if (!pIds) continue

      let isMatch = false
      for (const pId of pIds) {
        const pt = await fetchAirtableRecord('Session Participants', pId)
        if ((pt?.fields['Student'] as string[])?.[0] === studentId) {
          isMatch = true
          break
        }
      }
      if (isMatch) futureSessionsForStudent.push(record)
    }

    // 3. Cascade the topics down
    // The immediate next session gets the current session's topic (if any)
    // The next-next session gets the next session's original topic, etc.
    let rollingTopicId = currentTopicId

    // Only cascade if there was a topic assigned to the cancelled session
    if (rollingTopicId) {
      for (const futureSession of futureSessionsForStudent) {
        const originalFutureTopicId = (futureSession.fields['Curriculum Topic'] as string[])?.[0]
        
        // Update future session with the rolling topic
        await patchAirtableRecord('Sessions', futureSession.id, {
          'Curriculum Topic': [rollingTopicId]
        })

        // Prepare rolling topic for the next iteration (if original future topic existed)
        // If the future session had no topic, the cascade stops.
        if (!originalFutureTopicId) break
        rollingTopicId = originalFutureTopicId
      }
    }

    // 4. Mark current session as canceled
    await patchAirtableRecord('Sessions', sessionId, {
      'Status': 'Canceled'
    })

    // 5. Add +1 token to Student
    const student = await fetchAirtableRecord('Students', studentId)
    const currentTokens = (student?.fields['Tokens de Reposición'] as number) || 0
    await patchAirtableRecord('Students', studentId, {
      'Tokens de Reposición': currentTokens + 1
    })

    return res.status(200).json({ ok: true })
  } catch (err: any) {
    return res.status(500).json({ error: 'Error', detail: err.message })
  }
}
