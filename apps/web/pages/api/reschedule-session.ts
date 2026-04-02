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

    const participantIds = currentSession.fields['Session Participants'] as string[] || []
    const groupIds = currentSession.fields['Study Group'] as string[]
    const groupId = groupIds?.[0]

    // Determine group type
    let groupType: string | null = null
    if (groupId) {
      const groupRecord = await fetchAirtableRecord('Study Groups', groupId)
      groupType = groupRecord?.fields['Group Type'] as string
    }

    // Determine the target for future cascading
    // If there is a group, we filter future sessions for that group.
    // If not, we filter future sessions for the primary student.
    let studentId = ''
    if (!groupId && participantIds.length > 0) {
      const participant = await fetchAirtableRecord('Session Participants', participantIds[0])
      studentId = (participant?.fields['Student'] as string[])?.[0] ?? ''
    }

    if (!groupId && !studentId) {
      return res.status(400).json({ error: 'No se encontraron alumnos ni grupos en esta sesión' })
    }

    // 2. Fetch all future scheduled sessions for cascading
    const futureSessionsRes = await fetchFromAirtable(
      'Sessions',
      `filterByFormula=AND({Status}='Scheduled', RECORD_ID() != '${sessionId}')&sort[0][field]=Scheduled Date/Time&sort[0][direction]=asc`
    )

    const futureSessionsToCascade = []
    for (const record of futureSessionsRes.records || []) {
      if (groupId) {
        // Cascade for the group
        const recGroup = (record.fields['Study Group'] as string[])?.[0]
        if (recGroup === groupId) {
          futureSessionsToCascade.push(record)
        }
      } else {
        // Cascade for the individual student
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
        if (isMatch) futureSessionsToCascade.push(record)
      }
    }

    // 3. Cascade the topics down
    let rollingTopicId = currentTopicId

    if (rollingTopicId) {
      for (const futureSession of futureSessionsToCascade) {
        const originalFutureTopicId = (futureSession.fields['Curriculum Topic'] as string[])?.[0]
        
        await patchAirtableRecord('Sessions', futureSession.id, {
          'Curriculum Topic': [rollingTopicId]
        })

        if (!originalFutureTopicId) break
        rollingTopicId = originalFutureTopicId
      }
    }

    // 4. Mark current session as canceled
    await patchAirtableRecord('Sessions', sessionId, {
      'Status': 'Canceled'
    })

    // 5. Refund Tokens (Private Groups or Individuals)
    const shouldRefundTokens = groupType !== 'Community'

    if (shouldRefundTokens) {
      // Keep track of who received a refund to avoid double charging
      const refundedStudents = new Set<string>()

      for (const pId of participantIds) {
        const participant = await fetchAirtableRecord('Session Participants', pId)
        const sId = (participant?.fields['Student'] as string[])?.[0]
        
        if (sId && !refundedStudents.has(sId)) {
          refundedStudents.add(sId)
          const student = await fetchAirtableRecord('Students', sId)
          const currentTokens = (student?.fields['Tokens de Reposición'] as number) || 0
          await patchAirtableRecord('Students', sId, {
            'Tokens de Reposición': currentTokens + 1
          })
        }
      }
    }

    return res.status(200).json({ ok: true, msg: shouldRefundTokens ? 'Cancelado y tokens reembolsados' : 'Cancelado (Comunidad sin reembolso)' })
  } catch (err: any) {
    return res.status(500).json({ error: 'Error', detail: err.message })
  }
}
