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

    // 2. Extract Session Participant IDs or find via junction
    let participantIds = (student.fields['Session Participants'] as string[]) ?? []
    let participantRecords = []

    if (participantIds.length > 0) {
      const participantsFormula = `OR(${participantIds.map(id => `RECORD_ID()='${id}'`).join(',')})`
      const pRes = await fetchFromAirtable('Session Participants', `filterByFormula=${encodeURIComponent(participantsFormula)}`)
      participantRecords = pRes.records ?? []
    } else {
      participantRecords = await findAirtableRecords('Session Participants', `FIND('${studentId}', ARRAYJOIN({Student}, ',')) > 0`)
    }

    const sessionIds = participantRecords
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

    // 3. Construct filter for Sessions table using the found IDs
    const idsFilter = `OR(${sessionIds.map((id: string) => `RECORD_ID()='${id}'`).join(',')})`
    const now = new Date().toISOString()
    
    const upcomingFilter = encodeURIComponent(`AND(${idsFilter}, OR({Status} = 'Scheduled', AND({Status} = 'Canceled', {Is Holiday})), IS_AFTER({Scheduled Date/Time}, '${now}'))`)
    const seenFilter = encodeURIComponent(`AND(${idsFilter}, {Status} = 'Seen')`)

    const [upcoming, completed] = await Promise.all([
      fetchFromAirtable('Sessions', `filterByFormula=${upcomingFilter}&sort[0][field]=Scheduled%20Date%2FTime&sort[0][direction]=asc&maxRecords=10`),
      fetchFromAirtable('Sessions', `filterByFormula=${seenFilter}&sort[0][field]=Scheduled%20Date%2FTime&sort[0][direction]=asc&maxRecords=50`)
    ])

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
      resolveTopics(upcoming.records ?? [], true),
      resolveTopics(completed.records ?? [], false),
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
