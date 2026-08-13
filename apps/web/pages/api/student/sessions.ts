import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchFromAirtable, fetchAirtableRecord } from '@/lib/airtable'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { studentId } = req.query as { studentId?: string }
  if (!studentId) return res.status(400).json({ error: 'studentId es requerido' })

  try {
    // 1. Get Student record to find linked Session Participant record IDs
    const student = await fetchAirtableRecord('Students', studentId)
    if (!student) return res.status(404).json({ error: 'Estudiante no encontrado' })

    // 2. Extract Session Participant IDs from the record
    // fldQX0rpUzjOm3YWb is "Session Participants"
    const participantIds = (student.fields['Session Participants'] as string[]) ?? []
    
    if (participantIds.length === 0) {
      return res.status(200).json({ upcomingSessions: [], completedSessions: [] })
    }

    // 3. Get the actual Session Participant records to find their linked Session IDs
    // Construct filter for junction table
    const participantsFormula = `OR(${participantIds.map(id => `RECORD_ID()='${id}'`).join(',')})`
    const participants = await fetchFromAirtable('Session Participants', `filterByFormula=${encodeURIComponent(participantsFormula)}`)

    const sessionIds = (participants.records ?? [])
      .map((r: any) => ((r.fields['Session'] as string[]) ?? [])[0])
      .filter(Boolean)

    if (sessionIds.length === 0) {
      return res.status(200).json({ upcomingSessions: [], completedSessions: [] })
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

    // Resolve topic details for completed sessions
    const resolveTopics = async (records: any[], isUpcoming = false) => {
      return Promise.all(records.map(async (r) => {
        const topicId = ((r.fields['Curriculum Topic'] as string[]) ?? [])[0] ?? null
        let topicName: string | null = null
        let cachedSlides: any[] | null = null
        let topicOrder: number | null = null
        
        if (topicId) {
          const topic = await fetchAirtableRecord('Curriculum Topics', topicId)
          topicOrder = topic?.fields?.['Order'] as number ?? null
          
          if (!isUpcoming) {
            topicName = topic?.fields?.['Topic Name'] as string ?? null
            
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
          topicName: isUpcoming ? null : topicName,
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
      totalTopics
    })
  } catch (err: any) {
    return res.status(500).json({ error: 'Error al cargar sesiones', detail: err.message })
  }
}
