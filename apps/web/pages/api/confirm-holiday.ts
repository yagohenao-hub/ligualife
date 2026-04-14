import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchFromAirtable, patchAirtableRecord, fetchAirtableRecord } from '@/lib/airtable'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { sessionId, role, userId } = req.body as {
    sessionId?: string
    role?: 'teacher' | 'student'
    userId?: string  // teacherId or studentId — used for authorization check
  }
  if (!sessionId || !role) return res.status(400).json({ error: 'Faltan parámetros' })

  try {
    const session = await fetchAirtableRecord('Sessions', sessionId)
    if (!session) return res.status(404).json({ error: 'Session not found' })

    // ── Authorization: verify the caller is actually a participant ─────────────
    if (userId) {
      if (role === 'teacher') {
        const sessionTeacherIds = (session.fields['Teacher'] as string[]) ?? []
        if (!sessionTeacherIds.includes(userId)) {
          return res.status(403).json({ error: 'No autorizado: no eres el profesor de esta sesión' })
        }
      } else {
        // student: check via Session Participants junction table
        const participantIds = (session.fields['Session Participants'] as string[]) ?? []
        let isParticipant = false
        for (const pId of participantIds) {
          const p = await fetchAirtableRecord('Session Participants', pId)
          const sIds = (p?.fields['Student'] as string[]) ?? []
          if (sIds.includes(userId)) { isParticipant = true; break }
        }
        if (!isParticipant) {
          return res.status(403).json({ error: 'No autorizado: no eres participante de esta sesión' })
        }
      }
    }
    // ──────────────────────────────────────────────────────────────────────────

    const update: any = {}
    if (role === 'teacher') {
      update['Holiday Confirmed (Teacher)'] = true
    } else {
      update['Holiday Confirmed (Student)'] = true
    }

    // Determine current states after update
    const teacherConfirmed = role === 'teacher' ? true : !!session.fields['Holiday Confirmed (Teacher)']
    const studentConfirmed = role === 'student' ? true : !!session.fields['Holiday Confirmed (Student)']

    // If both have confirmed and session is a holiday, reactivate it to Scheduled
    if (teacherConfirmed && studentConfirmed && !!session.fields['Is Holiday']) {
      update['Status'] = 'Scheduled'
    }

    await patchAirtableRecord('Sessions', sessionId, update)

    return res.status(200).json({ ok: true, teacherConfirmed, studentConfirmed })
  } catch (err: any) {
    return res.status(500).json({ error: 'Error', detail: err.message })
  }
}
