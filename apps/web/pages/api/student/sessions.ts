import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchFromAirtable, fetchAirtableRecord, findAirtableRecords } from '@/lib/airtable'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { studentId } = req.query as { studentId?: string }
  if (!studentId) return res.status(400).json({ error: 'studentId es requerido' })

  try {
    // 1. Get Student record to find linked Session Participant record IDs
    const student = await fetchAirtableRecord('Students', studentId)
    if (!student) return res.status(404).json({ error: 'Estudiante no encontrado' })

    // 2. Extract Session Participant IDs for this student directly
    let participantRecords = await findAirtableRecords('Session Participants', `FIND('${studentId}')`)
    if (!participantRecords || participantRecords.length === 0) {
      const rawParticipants = (student.fields['Session Participants'] as string[]) ?? []
      const validIds = rawParticipants.filter(id => typeof id === 'string' && !id.includes('|'))
      if (validIds.length > 0) {
        const participantsFormula = `OR(${validIds.map(id => `RECORD_ID()='${id}'`).join(',')})`
        const pRes = await fetchFromAirtable('Session Participants', `filterByFormula=${encodeURIComponent(participantsFormula)}`)
        participantRecords = pRes.records ?? []
      }
    }

    const sessionIds = (participantRecords ?? [])
      .map((r: any) => ((r.fields['Session'] as string[]) ?? [])[0] ?? (r.fields['SessionId'] as string))
      .filter(Boolean)

    // Construct studentProfile for caller
    const rawTokens = student.fields['Tokens de Reposición'] ?? student.fields['Tokens']
    const rawClasses = student.fields['ClassesRemaining'] ?? student.fields['Classes Remaining']
    const teacherId = Array.isArray(student.fields['Teacher']) ? student.fields['Teacher'][0] : (student.fields['Teacher'] as string | null)
    let teacherName: string | null = null

    if (teacherId) {
      try {
        const teacherRec = await fetchAirtableRecord('Teachers', teacherId)
        if (teacherRec) {
          teacherName = (teacherRec.fields['Name'] || teacherRec.fields['Full Name']) as string
        }
      } catch {}
    }

    const studentProfile = {
      id: student.id,
      name: (student.fields['Full Name'] || student.fields['Name'] || student.fields['FullName'] || 'Estudiante') as string,
      email: (student.fields['Email'] as string) || '',
      tokens: typeof rawTokens === 'number' ? rawTokens : (parseInt(rawTokens, 10) || 0),
      classesRemaining: typeof rawClasses === 'number' ? rawClasses : (parseInt(rawClasses, 10) || 16),
      teacherId,
      teacherName
    }

    if (sessionIds.length === 0) {
      return res.status(200).json({ upcomingSessions: [], completedSessions: [], totalTopics: 60, studentProfile })
    }

    // 3. Fetch all sessions for these session IDs directly and filter in memory
    const sessionRecords = await Promise.all(
      sessionIds.map(id => fetchAirtableRecord('Sessions', id))
    )
    const validSessions = sessionRecords.filter(Boolean)

    const completed = validSessions
      .filter((s: any) => s.fields['Status'] === 'Seen')
      .sort((a: any, b: any) => new Date(a.fields['Scheduled Date/Time'] || 0).getTime() - new Date(b.fields['Scheduled Date/Time'] || 0).getTime())

    const upcoming = validSessions
      .filter((s: any) => s.fields['Status'] === 'Scheduled' || (s.fields['Status'] === 'Canceled' && s.fields['Is Holiday']))
      .sort((a: any, b: any) => new Date(a.fields['Scheduled Date/Time'] || 0).getTime() - new Date(b.fields['Scheduled Date/Time'] || 0).getTime())

    // Resolve topic details for sessions
    const resolveTopics = async (records: any[], isUpcoming = false) => {
      return Promise.all(records.map(async (r) => {
        const topicId = ((r.fields['Curriculum Topic'] as string[]) ?? [])[0] ?? null
        let topicName: string | null = null
        let cachedSlides: any[] | null = null
        let topicOrder: number | null = null
        
        if (topicId) {
          const topic = await fetchAirtableRecord('Curriculum Topics', topicId)
          topicOrder = topic?.fields?.['Order'] as number ?? null
          topicName = (topic?.fields?.['Topic Name'] || topic?.fields?.['Title']) as string ?? null

          if (!isUpcoming) {
            const rawCache = (topic?.fields?.['Cached Slides'] || topic?.fields?.['fldiMYojT06KFHPBj']) as string | undefined
            if (rawCache) {
              try { cachedSlides = JSON.parse(rawCache) } catch (e) {}
            }
          }
        }

        return {
          id: r.id,
          date: r.fields['Scheduled Date/Time'],
          status: r.fields['Status'],
          topicId: topicId,
          topicOrder: topicOrder,
          topicName: topicName,
          cachedSlides: cachedSlides,
          isHoliday: !!r.fields['Is Holiday'],
          holidayConfirmedTeacher: !!r.fields['Holiday Confirmed (Teacher)'],
          holidayConfirmedStudent: !!r.fields['Holiday Confirmed (Student)']
        }
      }))
    }

    const [upcomingSessions, completedSessions] = await Promise.all([
      resolveTopics(upcoming, true),
      resolveTopics(completed, false),
    ])

    // ── Dynamically count total topics from the student's goal curriculum ──────
    let totalTopics = 0
    try {
      const goalIds = (student.fields['Goal'] as string[]) ?? []
      const goalId = goalIds[0]
      if (goalId) {
        // Find curricula linked to this goal
        const curriculaRes = await fetchFromAirtable(
          'Curriculum Topics',
          `filterByFormula=${encodeURIComponent(`FIND('${goalId}', ARRAYJOIN({Goal (link)}, ',')) > 0`)}&fields[]=Order`
        )
        totalTopics = (curriculaRes.records ?? []).length
      }
    } catch {
      // non-fatal: fall back to completed + upcoming count
      totalTopics = upcomingSessions.length + completedSessions.length || 1
    }
    if (totalTopics === 0) totalTopics = upcomingSessions.length + completedSessions.length || 1
    // ───────────────────────────────────────────────────────────────────────────

    return res.status(200).json({ 
      upcomingSessions, 
      completedSessions,
      totalTopics,
      studentProfile
    })
  } catch (err: any) {
    return res.status(500).json({ error: 'Error al cargar sesiones', detail: err.message })
  }
}
