import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchAirtableRecord, patchAirtableRecord } from '@/lib/airtable'
import { supabase } from '@/lib/supabaseClient'
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
    // 1. Fetch current session & guard against duplicate cancellations
    const currentSession = await fetchAirtableRecord('Sessions', sessionId)
    if (!currentSession) return res.status(404).json({ error: 'Session not found' })
    if (currentSession.fields['Status'] !== 'Scheduled') {
      return res.status(400).json({ error: 'Esta clase ya no se encuentra programada.' })
    }

    const sessionDate = currentSession.fields['Scheduled Date/Time'] as string

    // 2. Enforce 24-hour policy for students
    if (sessionDate && canceledBy === 'student') {
      const hoursUntil = (new Date(sessionDate).getTime() - Date.now()) / (1000 * 60 * 60)
      if (hoursUntil < 24) {
        return res.status(400).json({
          error: 'No puedes reagendar con menos de 24 horas de anticipación.'
        })
      }
    }

    const currentTopicIds = currentSession.fields['Curriculum Topic'] as string[]
    const currentTopicId = currentTopicIds?.[0]

    // Resolve studentId cleanly from body or Supabase session_participants
    let studentId = bodyStudentId ?? ''
    if (!studentId) {
      const { data: spRows } = await supabase
        .from('session_participants')
        .select('Student')
        .eq('Session', sessionId)
        .limit(1)
      const rawStudent = spRows?.[0]?.Student
      studentId = Array.isArray(rawStudent) ? rawStudent[0] : (String(rawStudent || '').split(',')[0].trim())
    }

    if (!studentId) return res.status(400).json({ error: 'Student not found in session' })

    const student = await fetchAirtableRecord('Students', studentId)
    const studentName = (student?.fields?.['Full Name'] as string) ?? ''

    // Resolve teacher for notifications
    const teacherId = ((currentSession.fields['Teacher'] as string[]) ?? [])[0]
    let teacherName: string | null = null
    let teacherPhone: string | null = null
    let teacherEmail: string | null = null
    if (teacherId) {
      const teacher = await fetchAirtableRecord('Teachers', teacherId)
      teacherName = (teacher?.fields?.['Name'] as string) ?? null
      teacherPhone = (teacher?.fields?.['Phone'] as string) ?? null
      teacherEmail = (teacher?.fields?.['Email'] as string) ?? null
    }

    // 3. Fetch all future scheduled sessions for this student via Supabase session_participants
    const { data: participantLinks } = await supabase
      .from('session_participants')
      .select('Session')
      .ilike('Student', `%${studentId}%`)

    const studentSessionIds = Array.from(
      new Set((participantLinks || []).map((r: any) => r.Session).filter((id: string) => id && id !== sessionId))
    )

    let futureSessionsForStudent: any[] = []
    if (studentSessionIds.length > 0) {
      const { data: candidateSessions } = await supabase
        .from('sessions')
        .select('*')
        .in('id', studentSessionIds)
        .eq('Status', 'Scheduled')

      const canceledTs = sessionDate ? new Date(sessionDate).getTime() : 0
      futureSessionsForStudent = (candidateSessions || [])
        .filter((s: any) => {
          const isHoliday = s['Is Holiday'] === true || String(s['Is Holiday']).toLowerCase() === 'true'
          const ts = new Date(s['Scheduled Date/Time'] || 0).getTime()
          return !isHoliday && ts >= canceledTs
        })
        .sort((a: any, b: any) => new Date(a['Scheduled Date/Time'] || 0).getTime() - new Date(b['Scheduled Date/Time'] || 0).getTime())
        .map((s: any) => ({ id: s.id, fields: s }))
    }

    // 4. Cascade curriculum topics forward so no seen topic is skipped
    let rollingTopicId = currentTopicId
    if (rollingTopicId && futureSessionsForStudent.length > 0) {
      for (const futureSession of futureSessionsForStudent) {
        const rawFutureTopic = futureSession.fields['Curriculum Topic']
        const originalFutureTopicId = Array.isArray(rawFutureTopic) ? rawFutureTopic[0] : rawFutureTopic
        await patchAirtableRecord('Sessions', futureSession.id, { 'Curriculum Topic': [rollingTopicId] })
        if (!originalFutureTopicId) break
        rollingTopicId = originalFutureTopicId
      }
    }

    // 5. Cancel session + safely increment integer Tokens de Reposición
    const currentTokens = parseInt(String(student?.fields?.['Tokens de Reposición'] ?? student?.fields?.['Tokens'] ?? 0), 10) || 0
    await Promise.all([
      patchAirtableRecord('Sessions', sessionId, {
        'Status': 'Canceled',
        'Canceled Reason': canceledBy === 'teacher' ? 'Canceled by teacher' : 'Rescheduled by student (+24h)'
      }),
      patchAirtableRecord('Students', studentId, {
        'Tokens de Reposición': currentTokens + 1
      }),
      notifyReschedule({
        studentName,
        teacherName,
        teacherPhone,
        teacherEmail,
        sessionDate: sessionDate
          ? new Date(sessionDate).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Bogota' })
          : 'Por definir',
        canceledBy,
      })
    ])

    return res.status(200).json({ ok: true, newTokens: currentTokens + 1 })
  } catch (err: any) {
    return res.status(500).json({ error: 'Error', detail: err.message })
  }
}
