import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchFromAirtable, fetchAirtableRecord } from '@/lib/airtable'
import { supabase } from '@/lib/supabaseClient'
import type { Session } from '@/types'

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const parseBool = (val: any): boolean => val === true || String(val).toLowerCase() === 'true'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { teacherId, teacherName, date } = req.query as { teacherId?: string; teacherName?: string; date?: string }

  if ((!teacherId && !teacherName) || !date) {
    return res.status(400).json({ error: 'teacherId/teacherName y date son requeridos' })
  }
  if (!ISO_DATE_RE.test(date)) {
    return res.status(400).json({ error: 'date debe tener formato YYYY-MM-DD' })
  }

  try {
    const sanitizedDate = date.replace(/[^0-9-]/g, '')

    const teacherFilter = teacherId
      ? `FIND('${teacherId}', ARRAYJOIN({Teacher}, ',')) > 0`
      : teacherName
        ? `FIND('${teacherName}', ARRAYJOIN({Teacher}, ',')) > 0`
        : ''

    const params = [
      teacherFilter ? `filterByFormula=${encodeURIComponent(teacherFilter)}` : '',
      `sort[0][field]=Scheduled Date/Time`,
      `sort[0][direction]=asc`,
    ].filter(Boolean).join('&')

    const data = await fetchFromAirtable('Sessions', params)
    const dayRecords = (data.records || []).filter((r: any) => {
      const dt = r.fields['Scheduled Date/Time']
      if (!dt) return false
      const bogotaDay = new Date(dt).toLocaleDateString('en-CA', { timeZone: 'America/Bogota' })
      if (bogotaDay !== sanitizedDate) return false
      const st = r.fields['Status']
      return st === 'Scheduled' || (st === 'Canceled' && parseBool(r.fields['Is Holiday']))
    })

    // Resolve participant junction → student name for each session
    const sessions: Session[] = await Promise.all(
      dayRecords.map(async (r: any) => {
        let studentName = ''
        let resolvedStudentId = ''

        try {
          const { data: spRows } = await supabase
            .from('session_participants')
            .select('Student')
            .eq('Session', r.id)
            .limit(1)
          const rawS = spRows?.[0]?.Student
          resolvedStudentId = rawS ? String(rawS).split(',')[0].trim() : ''

          if (!resolvedStudentId) {
            const participantId = (r.fields['Session Participants'] as string[])?.[0] ?? ''
            if (participantId) {
              const participant = await fetchAirtableRecord('Session Participants', participantId)
              resolvedStudentId = (participant?.fields?.['Student'] as string[])?.[0] ?? ''
            }
          }

          if (resolvedStudentId) {
            const student = await fetchAirtableRecord('Students', resolvedStudentId)
            studentName = (student?.fields?.['Full Name'] ?? student?.fields?.['Name'] ?? '') as string
          }
        } catch {
          // Silently fail — session still shows
        }

        const scheduledDT = r.fields['Scheduled Date/Time']
        const timeStr = scheduledDT
          ? new Date(scheduledDT).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'America/Bogota' })
          : ''

        let topicName = ''
        const topicIds = (r.fields['Curriculum Topic'] as string[]) ?? []
        const topicId = topicIds[0] ?? ''

        if (topicId) {
          try {
            const topic = await fetchAirtableRecord('Curriculum Topics', topicId)
            topicName = (topic?.fields?.['Topic Name'] ?? topic?.fields?.['Title'] ?? topic?.fields?.['Name'] ?? '') as string
          } catch (e) {
            console.error('[sessions] topic error:', topicId, e)
          }
        }

        return {
          id: r.id,
          teacherId: (teacherId ?? '') as string,
          studentId: resolvedStudentId,
          topicId: (r.fields['Curriculum Topic'] as string[])?.[0] ?? null,
          date: date as string,
          time: timeStr,
          status: r.fields['Status'] as string,
          sessionName: studentName || (r.fields['Session Name'] as string) || 'Sesión',
          topicName: topicName || null,
          isHoliday: parseBool(r.fields['Is Holiday']),
          holidayConfirmedTeacher: parseBool(r.fields['Holiday Confirmed (Teacher)']),
          holidayConfirmedStudent: parseBool(r.fields['Holiday Confirmed (Student)'])
        } satisfies Session
      })
    )

    return res.status(200).json(sessions)
  } catch (err: any) {
    console.error('[sessions] error:', err.message)
    return res.status(500).json({ error: 'Error al obtener sesiones', detail: err.message })
  }
}
