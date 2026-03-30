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
    // 1. Fetch student data and check for group partners
    const student = await fetchAirtableRecord('Students', studentId)
    const tokens = (student?.fields?.['Tokens de Reposición'] as number) ?? 0
    if (tokens <= 0) return res.status(400).json({ error: 'No tienes tokens de reposición disponibles' })

    // Check if student belongs to a "Conocidos" group (Student-Teacher table with multiple students)
    const stFilter = encodeURIComponent(`FIND('${studentId}', ARRAYJOIN({Student}, ',')) > 0`)
    const stRes = await fetchFromAirtable('Student-Teacher', `filterByFormula=${stFilter}`)
    const stRecord = stRes.records?.[0]
    const allStudentIds = (stRecord?.fields?.['Student'] as string[]) || [studentId]
    const isGroup = allStudentIds.length > 1

    // If group, verify ALL have tokens (per User: "se les cobra a ambos")
    if (isGroup) {
      for (const sid of allStudentIds) {
        const s = await fetchAirtableRecord('Students', sid)
        if (((s?.fields?.['Tokens de Reposición'] as number) || 0) <= 0) {
          return res.status(400).json({ error: `El compañero ${s?.fields?.['Full Name']} no tiene tokens suficientes` })
        }
      }
    }

    // 2. Calculate session datetime
    let sessionDate: Date
    if (exactDate) {
      sessionDate = new Date(exactDate)
      const minTime = new Date(Date.now() + 24 * 60 * 60 * 1000)
      if (sessionDate < minTime) {
        return res.status(400).json({ error: 'La clase debe agendarse con al menos 24 horas de anticipación' })
      }
    } else {
      const now = new Date()
      const jsDay = dayIndex === 6 ? 0 : dayIndex + 1
      let daysAhead = jsDay - now.getDay()
      if (daysAhead <= 0) daysAhead += 7
      sessionDate = new Date(now)
      sessionDate.setDate(now.getDate() + daysAhead)
      sessionDate.setHours(HOURS_START + hourIndex, 0, 0, 0)
    }

    // 3. Verify slot is available
    const teacher = await fetchAirtableRecord('Teachers', teacherId)
    const rawAvail = teacher?.fields?.['Availability'] as string | null
    let availability: boolean[][] = []
    if (rawAvail) { try { availability = JSON.parse(rawAvail) } catch { } }
    if (!availability?.[hourIndex]?.[dayIndex]) {
      return res.status(400).json({ error: 'Ese horario no está disponible' })
    }

    // 4. Determine topic
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

    // 5. Create new session
    const newSession = await createAirtableRecord('Sessions', {
      'Teacher': [teacherId],
      'Scheduled Date/Time': sessionDate.toISOString(),
      'Status': 'Scheduled',
      'Extraordinary Session (Token)': true,
      ...(topicId ? { 'Curriculum Topic': [topicId] } : {}),
      ...(isGroup ? { 'Student-Teacher': [stRecord.id] } : {}) // Link to the enrollment unit
    })

    // 6. Create Session Participant junctions for ALL students
    for (const sid of allStudentIds) {
      await createAirtableRecord('Session Participants', {
        'Session': [newSession.id],
        'Student': [sid],
      })

      // 7. Deduct token from each student
      const s = await fetchAirtableRecord('Students', sid)
      const current = (s?.fields?.['Tokens de Reposición'] as number) || 0
      await patchAirtableRecord('Students', sid, {
        'Tokens de Reposición': current - 1,
      })
    }

    return res.status(200).json({
      ok: true,
      sessionId: newSession.id,
      date: sessionDate.toISOString(),
    })
  } catch (err: any) {
    return res.status(500).json({ error: 'Error al redimir token', detail: err.message })
  }
}
