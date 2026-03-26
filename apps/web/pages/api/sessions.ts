import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchFromAirtable, fetchAirtableRecord } from '@/lib/airtable'
import type { Session } from '@/types'

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/

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
    const teacherFilter = teacherName
      ? `FIND('${teacherName}', ARRAYJOIN({Teacher}, ',')) > 0`
      : teacherId
        ? `FIND('${teacherId}', ARRAYJOIN({Teacher}, ',')) > 0`
        : ''
    const formula = teacherFilter
      ? `AND(${teacherFilter}, {Status} = 'Scheduled')`
      : `{Status} = 'Scheduled'`
    const params = [
      `filterByFormula=${encodeURIComponent(formula)}`,
      `sort[0][field]=Scheduled Date/Time`,
      `sort[0][direction]=asc`,
    ].join('&')

    const data = await fetchFromAirtable('Sessions', params)
    console.log('[sessions] formula:', formula, '| records returned:', data.records?.length ?? 0)

    // Resolve participant junction → student name for each session
    const sessions: Session[] = await Promise.all(
      (data.records || []).map(async (r: any) => {
        const participantId = (r.fields['Session Participants'] as string[])?.[0] ?? ''
        let studentName = ''
        let resolvedStudentId = ''

        if (participantId) {
          try {
            const participant = await fetchAirtableRecord('Session Participants', participantId)
            resolvedStudentId = (participant?.fields?.['Student'] as string[])?.[0] ?? ''
            if (resolvedStudentId) {
              const student = await fetchAirtableRecord('Students', resolvedStudentId)
              studentName = (student?.fields?.['Full Name'] as string) ?? ''
            }
          } catch {
            // Silently fail — session still shows
          }
        }

        const scheduledDT = r.fields['Scheduled Date/Time']
        const timeStr = scheduledDT
          ? new Date(scheduledDT).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : ''

        let topicName = ''
        const topicIds = (r.fields['Curriculum Topic'] as string[]) ?? []
        const topicId = topicIds[0] ?? ''
        
        if (topicId) {
          try {
            const topic = await fetchAirtableRecord('Curriculum Topics', topicId)
            // Using 'Topic Name' which is the explicit field name in curriculum-nav.ts
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
        } satisfies Session
      })
    )

    return res.status(200).json(sessions)
  } catch (err: any) {
    console.error('[sessions] error:', err.message)
    return res.status(500).json({ error: 'Error al obtener sesiones', detail: err.message })
  }
}
