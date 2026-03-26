import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchFromAirtable, fetchAirtableRecord, patchAirtableRecord, createAirtableRecord } from '@/lib/airtable'

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const HOURS_START = 6 // 6am

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { studentId, teacherId, dayIndex, hourIndex, exactDate } = req.body as {
    studentId?: string
    teacherId?: string
    dayIndex?: number
    hourIndex?: number
    exactDate?: string
  }

  if (!studentId || !teacherId || dayIndex == null || hourIndex == null) {
    return res.status(400).json({ error: 'Faltan parámetros' })
  }

  try {
    // 1. Verify student has tokens
    const student = await fetchAirtableRecord('Students', studentId)
    const tokens = (student?.fields?.['Tokens de Reposición'] as number) ?? 0
    if (tokens <= 0) return res.status(400).json({ error: 'No tienes tokens de reposición disponibles' })

    // 2. Calculate session datetime
    let sessionDate: Date
    if (exactDate) {
      // Use the exact date selected in the calendar
      sessionDate = new Date(exactDate)
      // Enforce 24h minimum from now
      const minTime = new Date(Date.now() + 24 * 60 * 60 * 1000)
      if (sessionDate < minTime) {
        return res.status(400).json({ error: 'La clase debe agendarse con al menos 24 horas de anticipación' })
      }
    } else {
      // Legacy: Calculate next occurrence of the weekday
      const now = new Date()
      const jsDay = dayIndex === 6 ? 0 : dayIndex + 1
      let daysAhead = jsDay - now.getDay()
      if (daysAhead <= 0) daysAhead += 7
      sessionDate = new Date(now)
      sessionDate.setDate(now.getDate() + daysAhead)
      sessionDate.setHours(HOURS_START + hourIndex, 0, 0, 0)
    }

    // 3. Verify slot is available (check the teacher availability grid)
    const teacher = await fetchAirtableRecord('Teachers', teacherId)
    const rawAvail = teacher?.fields?.['Availability'] as string | null
    let availability: boolean[][] = []
    if (rawAvail) { try { availability = JSON.parse(rawAvail) } catch { } }
    if (!availability?.[hourIndex]?.[dayIndex]) {
      return res.status(400).json({ error: 'Ese horario no está disponible' })
    }

    // 4. Determine topic to assign (cascade: find next scheduled session topic, assign next one)
    // Find the student's future scheduled sessions to cascade the topic
    const futureFilter = encodeURIComponent(
      `AND(FIND('${studentId}', ARRAYJOIN({Participants (link)}, ',')) > 0, {Status}='Scheduled')`
    )
    const futureSessions = await fetchFromAirtable(
      'Sessions',
      `filterByFormula=${futureFilter}&sort[0][field]=Scheduled%20Date%2FTime&sort[0][direction]=asc&maxRecords=1`
    )

    let topicId: string | null = null
    const lastFuture = futureSessions.records?.[futureSessions.records.length - 1]
    if (lastFuture) {
      // Get the topic AFTER the last scheduled session's topic
      const lastTopicId = ((lastFuture.fields['Curriculum Topic'] as string[]) ?? [])[0]
      if (lastTopicId) {
        const lastTopic = await fetchAirtableRecord('Curriculum Topics', lastTopicId)
        const curriculumIds = (lastTopic?.fields?.['Curriculum'] as string[]) ?? []
        const order = lastTopic?.fields?.['Order'] as number
        if (curriculumIds[0] && order != null) {
          const nextTopicsRes = await fetchFromAirtable(
            'Curriculum Topics',
            `filterByFormula=${encodeURIComponent(`AND(FIND('${curriculumIds[0]}', ARRAYJOIN({Curriculum}, ',')), {Order} > ${order})`)}&sort[0][field]=Order&sort[0][direction]=asc&maxRecords=1`
          )
          topicId = nextTopicsRes.records?.[0]?.id ?? null
        }
      }
    }

    // 5. Create new session in Airtable
    const newSession = await createAirtableRecord('Sessions', {
      'Teacher': [teacherId],
      'Scheduled Date/Time': sessionDate.toISOString(),
      'Status': 'Scheduled',
      'Extraordinary Session (Token)': true,
      ...(topicId ? { 'Curriculum Topic': [topicId] } : {}),
    })

    // 6. Create Session Participant junction
    await createAirtableRecord('Session Participants', {
      'Session': [newSession.id],
      'Student': [studentId],
    })

    // 7. Deduct 1 token from student
    await patchAirtableRecord('Students', studentId, {
      'Tokens de Reposición': tokens - 1,
    })

    return res.status(200).json({
      ok: true,
      sessionId: newSession.id,
      date: sessionDate.toISOString(),
    })
  } catch (err: any) {
    return res.status(500).json({ error: 'Error al redimir token', detail: err.message })
  }
}
