import type { NextApiRequest, NextApiResponse } from 'next'
import { patchAirtableRecord, fetchAirtableRecord } from '@/lib/airtable'
import { supabase } from '@/lib/supabaseClient'

const parseBool = (val: any): boolean => val === true || String(val).toLowerCase() === 'true'

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
        // student: check directly via Supabase session_participants table first
        const { data: spMatches } = await supabase
          .from('session_participants')
          .select('id')
          .eq('Session', sessionId)
          .ilike('Student', `%${userId}%`)
          .limit(1)

        let isParticipant = (spMatches?.length ?? 0) > 0
        if (!isParticipant) {
          const participantIds = (session.fields['Session Participants'] as string[]) ?? []
          for (const pId of participantIds) {
            const p = await fetchAirtableRecord('Session Participants', pId)
            const sIds = (p?.fields['Student'] as string[]) ?? []
            if (sIds.includes(userId)) { isParticipant = true; break }
          }
        }
        if (!isParticipant) {
          return res.status(403).json({ error: 'No autorizado: no eres participante de esta sesión' })
        }
      }
    }
    // ──────────────────────────────────────────────────────────────────────────

    const update: any = {}
    if (role === 'teacher') {
      update['Holiday Confirmed (Teacher)'] = 'true'
    } else {
      update['Holiday Confirmed (Student)'] = 'true'
    }

    // Determine current states after update safely using parseBool
    const teacherConfirmed = role === 'teacher' ? true : parseBool(session.fields['Holiday Confirmed (Teacher)'])
    const studentConfirmed = role === 'student' ? true : parseBool(session.fields['Holiday Confirmed (Student)'])

    // If both have confirmed and session is a holiday, reactivate it to Scheduled
    if (teacherConfirmed && studentConfirmed && parseBool(session.fields['Is Holiday'])) {
      update['Status'] = 'Scheduled'
    }

    await patchAirtableRecord('Sessions', sessionId, update)

    return res.status(200).json({ ok: true, teacherConfirmed, studentConfirmed })
  } catch (err: any) {
    return res.status(500).json({ error: 'Error', detail: err.message })
  }
}
