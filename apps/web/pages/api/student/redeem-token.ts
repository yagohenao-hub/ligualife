import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchAirtableRecord, patchAirtableRecord, createAirtableRecord } from '@/lib/airtable'
import { supabase } from '@/lib/supabaseClient'

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
    // 1. Fetch student data and check tokens + group partners
    const student = await fetchAirtableRecord('Students', studentId)
    if (!student) return res.status(404).json({ error: 'Estudiante no encontrado' })

    const tokens = parseInt(String(student?.fields?.['Tokens de Reposición'] ?? student?.fields?.['Tokens'] ?? 0), 10) || 0
    if (tokens <= 0) return res.status(400).json({ error: 'No tienes tokens de reposición disponibles' })

    const { data: stRows } = await supabase
      .from('student_teacher')
      .select('*')
      .ilike('Student', `%${studentId}%`)
      .eq('Status', 'Active')
      .order('created_at', { ascending: false })
      .limit(1)

    const stRecord = stRows?.[0]
    const rawStudents = stRecord?.Student
    const allStudentIds: string[] = rawStudents
      ? (Array.isArray(rawStudents) ? rawStudents : String(rawStudents).split(',').map((s: string) => s.trim()).filter(Boolean))
      : [studentId]
    const isGroup = allStudentIds.length > 1

    if (isGroup) {
      for (const sid of allStudentIds) {
        const s = await fetchAirtableRecord('Students', sid)
        const sTokens = parseInt(String(s?.fields?.['Tokens de Reposición'] ?? s?.fields?.['Tokens'] ?? 0), 10) || 0
        if (sTokens <= 0) {
          return res.status(400).json({ error: `El compañero ${s?.fields?.['Full Name'] ?? s?.fields?.['FullName'] ?? sid} no tiene tokens suficientes` })
        }
      }
    }

    // 2. Calculate session datetime
    let sessionDate: Date
    if (exactDate) {
      sessionDate = new Date(exactDate)
      const minTime = new Date(Date.now() + 24 * 60 * 60 * 1000)
      if (isNaN(sessionDate.getTime()) || sessionDate < minTime) {
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

    // 3. Verify teacher slot is enabled AND not already booked
    const teacher = await fetchAirtableRecord('Teachers', teacherId)
    if (!teacher) return res.status(404).json({ error: 'Profesor no encontrado' })

    const rawAvail = teacher?.fields?.['Availability'] as string | null
    let availability: boolean[][] = []
    if (rawAvail) { try { availability = JSON.parse(rawAvail) } catch {} }
    if (!availability?.[hourIndex]?.[dayIndex]) {
      return res.status(400).json({ error: 'Ese horario no está disponible en la agenda del profesor' })
    }

    const { data: teacherSessions } = await supabase
      .from('sessions')
      .select('id, "Scheduled Date/Time", "Is Holiday"')
      .eq('Teacher', teacherId)
      .eq('Status', 'Scheduled')

    const conflict = (teacherSessions || []).some((s: any) => {
      const isHol = s['Is Holiday'] === true || String(s['Is Holiday']).toLowerCase() === 'true'
      if (isHol) return false
      const diffMs = Math.abs(new Date(s['Scheduled Date/Time'] || 0).getTime() - sessionDate.getTime())
      return diffMs < 50 * 60 * 1000
    })
    if (conflict) {
      return res.status(409).json({ error: 'Ese horario ya está ocupado. Elige otro bloque disponible.' })
    }

    // 4. Determine next Curriculum Topic based on this student's existing sessions
    let topicId: string | null = null
    let topicLabel = 'Sesión Extra (Token)'

    const { data: studentLinks } = await supabase
      .from('session_participants')
      .select('Session')
      .ilike('Student', `%${studentId}%`)

    const studentSessIds = (studentLinks || []).map((r: any) => r.Session).filter(Boolean)
    if (studentSessIds.length > 0) {
      const { data: studentSessions } = await supabase
        .from('sessions')
        .select('id, "Curriculum Topic", "Status", "Scheduled Date/Time"')
        .in('id', studentSessIds)
        .in('Status', ['Scheduled', 'Seen'])

      const { data: allTopics } = await supabase
        .from('curriculum_topics')
        .select('id, "Topic Name", "Order", "Curriculum"')

      const generalTopics = (allTopics || [])
        .filter((t: any) => String(t.Curriculum || '').includes('General English Course') || !t.Curriculum)
        .sort((a: any, b: any) => parseInt(String(a.Order || '0'), 10) - parseInt(String(b.Order || '0'), 10))

      const topicById = new Map<string, any>(generalTopics.map((t: any) => [t.id, t]))
      let maxOrderSeenOrScheduled = 0

      for (const sess of (studentSessions || [])) {
        const rawCt = sess['Curriculum Topic']
        const ctId = Array.isArray(rawCt) ? rawCt[0] : rawCt
        if (!ctId) continue
        const found = topicById.get(ctId)
        if (found) {
          const ord = parseInt(String(found.Order || '0'), 10)
          if (ord > maxOrderSeenOrScheduled) maxOrderSeenOrScheduled = ord
        } else {
          const numMatch = String(ctId).match(/(\d+)$/)
          if (numMatch) {
            const ord = parseInt(numMatch[1], 10)
            if (ord > maxOrderSeenOrScheduled) maxOrderSeenOrScheduled = ord
          }
        }
      }

      const nextTopic = generalTopics.find((t: any) => parseInt(String(t.Order || '0'), 10) > maxOrderSeenOrScheduled)
      if (nextTopic) {
        topicId = nextTopic.id
        topicLabel = nextTopic['Topic Name'] || topicLabel
      }
    }

    // 5. Create new session
    const studentFirstName = String(student.fields['Full Name'] || student.fields['FullName'] || 'Estudiante').split(' ')[0]
    const newSession = await createAirtableRecord('Sessions', {
      'Session Name': `Reposición — ${studentFirstName} (${topicLabel})`,
      'Teacher': [teacherId],
      'Scheduled Date/Time': sessionDate.toISOString(),
      'Duration (minutes)': '60',
      'Location/Link': (teacher.fields['Meeting Link'] as string) || '',
      'Status': 'Scheduled',
      'Extraordinary Session (Token)': true,
      ...(topicId ? { 'Curriculum Topic': [topicId] } : {})
    })

    // 6. Create Session Participant junctions & deduct 1 token per participant
    for (const sid of allStudentIds) {
      await createAirtableRecord('Session Participants', {
        'Session': [newSession.id],
        'Student': [sid],
        'Attendance': 'Scheduled'
      })

      const s = await fetchAirtableRecord('Students', sid)
      const current = parseInt(String(s?.fields?.['Tokens de Reposición'] ?? s?.fields?.['Tokens'] ?? 0), 10) || 0
      await patchAirtableRecord('Students', sid, {
        'Tokens de Reposición': Math.max(0, current - 1),
      })
    }

    return res.status(200).json({
      ok: true,
      sessionId: newSession.id,
      date: sessionDate.toISOString(),
      remainingTokens: Math.max(0, tokens - 1)
    })
  } catch (err: any) {
    return res.status(500).json({ error: 'Error al redimir token', detail: err.message })
  }
}
