import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchFromAirtable, fetchAirtableRecord, patchAirtableRecord } from '@/lib/airtable'
import { notifyReschedule } from '@/lib/notify'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { sessionId, studentId: bodyStudentId, canceledBy = 'student' } = req.body as {
    sessionId?: string
    studentId?: string
    canceledBy?: 'student' | 'teacher'
  }
  if (!sessionId) return res.status(400).json({ error: 'sessionId es requerido' })

  try {
    // 1. Fetch current session
    const currentSession = await fetchAirtableRecord('Sessions', sessionId)
    if (!currentSession) return res.status(404).json({ error: 'Session not found' })

    const sessionDate = currentSession.fields['Scheduled Date/Time'] as string

    // 2h validation: only valid if class is more than 2 hours away
    if (sessionDate) {
      const hoursUntil = (new Date(sessionDate).getTime() - Date.now()) / (1000 * 60 * 60)
      if (hoursUntil < 2) {
        return res.status(400).json({
          error: 'No puedes reagendar con menos de 2 horas de anticipación.'
        })
      }
    }

    const currentTopicIds = currentSession.fields['Curriculum Topic'] as string[]
    const currentTopicId = currentTopicIds?.[0]

    const participantIds = currentSession.fields['Session Participants'] as string[]
    let studentId = bodyStudentId ?? ''
    let studentName = ''
    if (!studentId && participantIds?.[0]) {
      const participant = await fetchAirtableRecord('Session Participants', participantIds[0])
      studentId = (participant?.fields['Student'] as string[])?.[0] ?? ''
    }

    if (!studentId) return res.status(400).json({ error: 'Student not found in session' })

    const student = await fetchAirtableRecord('Students', studentId)
    studentName = student?.fields?.['Full Name'] as string ?? ''

    // Resolve teacher for notifications
    const teacherId = ((currentSession.fields['Teacher'] as string[]) ?? [])[0]
    let teacherName: string | null = null
    let teacherPhone: string | null = null
    let teacherEmail: string | null = null
    if (teacherId) {
      const teacher = await fetchAirtableRecord('Teachers', teacherId)
      teacherName = teacher?.fields?.['Name'] as string ?? null
      teacherPhone = teacher?.fields?.['Phone'] as string ?? null
      teacherEmail = teacher?.fields?.['Email'] as string ?? null
    }

    // 3. Fetch all future scheduled sessions for student (cascade)
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
          isMatch = true; break
        }
      }
      if (isMatch) futureSessionsForStudent.push(record)
    }

    // 4. Cascade topics down
    let rollingTopicId = currentTopicId
    if (rollingTopicId) {
      for (const futureSession of futureSessionsForStudent) {
        const originalFutureTopicId = (futureSession.fields['Curriculum Topic'] as string[])?.[0]
        await patchAirtableRecord('Sessions', futureSession.id, { 'Curriculum Topic': [rollingTopicId] })
        if (!originalFutureTopicId) break
        rollingTopicId = originalFutureTopicId
      }
    }

    // 5. Cancel session + add token
    const [, ,] = await Promise.all([
      patchAirtableRecord('Sessions', sessionId, { 'Status': 'Canceled' }),
      patchAirtableRecord('Students', studentId, {
        'Tokens de Reposición': ((student?.fields?.['Tokens de Reposición'] as number) || 0) + 1
      }),
      notifyReschedule({
        studentName,
        teacherName,
        teacherPhone,
        teacherEmail,
        sessionDate: new Date(sessionDate).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' }),
        canceledBy,
      })
    ])

    return res.status(200).json({ ok: true })
  } catch (err: any) {
    return res.status(500).json({ error: 'Error', detail: err.message })
  }
}
