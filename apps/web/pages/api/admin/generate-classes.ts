import type { NextApiRequest, NextApiResponse } from 'next'
import { isColombianHoliday } from '@/lib/holidays'
import { fetchFromAirtable } from '@/lib/airtable'

const BASE_ID = process.env.AIRTABLE_BASE_ID ?? 'app9ZtojlxX5FoZ7y'
const STUDENTS_TABLE = 'tblqzaBBn18txOyLu'
const TEACHERS_TABLE = 'tblqGY8vCmsFeld7G'
const SESSIONS_TABLE = 'tbliWEtFm3aJf8NQp'
const SESSION_PARTICIPANTS_TABLE = 'tblnSKiIdbb3gZxCu'
const STUDY_GROUPS_TABLE = 'tbloyDVuP8kDiPykS'
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const HOURS = ['6am', '7am', '8am', '9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm', '7pm', '8pm']

const ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? 'LinguaAdmin2025'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })

  if (req.headers['x-admin-token'] !== ADMIN_TOKEN) {
    return res.status(401).json({ error: 'No autorizado' })
  }

  const { studentId, groupId, teacherId, weeksToGenerate = 4, customAvailability } = req.body

  if (!studentId && !groupId) {
    return res.status(400).json({ error: 'Faltan parámetros requeridos: studentId o groupId' })
  }

  try {
    const reqOpts = { headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` } }
    
    let targetTeacherId = teacherId;
    let studentIds = studentId ? [studentId] : [];
    let availabilityGrid: boolean[][] | null = customAvailability || null;

    // 1. Fetch Group Info (if applicable)
    if (groupId) {
      const groupRes = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${STUDY_GROUPS_TABLE}/${groupId}`, reqOpts)
      const group = await groupRes.json()
      if (!group.fields) throw new Error('Grupo no encontrado')
      
      studentIds = group.fields['Students'] || []
      if (!targetTeacherId && group.fields['Primary Teacher']) {
        targetTeacherId = group.fields['Primary Teacher'][0]
      }
    }

    if (!targetTeacherId) {
      return res.status(400).json({ error: 'No se definió teacherId ni en la solicitud ni en el grupo.' })
    }

    // 2. Fetch Teacher info
    const teacherRes = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TEACHERS_TABLE}/${targetTeacherId}`, reqOpts)
    const teacher = await teacherRes.json()
    if (!teacher.fields) throw new Error('Profesor no encontrado en Airtable')

    // 3. Fallback to first student's availability if none provided
    if (!availabilityGrid && studentIds.length > 0) {
      const firstStudentRes = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${STUDENTS_TABLE}/${studentIds[0]}`, reqOpts)
      const firstStudent = await firstStudentRes.json()
      let availabilityStr = firstStudent.fields['Availability']
      
      if (!availabilityStr) {
        return res.status(400).json({ error: 'El estudiante principal no tiene horarios de Availability configurados.' })
      }
      try {
        availabilityGrid = JSON.parse(availabilityStr)
      } catch {
        return res.status(400).json({ error: 'El formato de Availability del estudiante es inválido.' })
      }
    }

    if (!availabilityGrid) {
      return res.status(400).json({ error: 'No se pudo resolver la disponibilidad.' })
    }

    // 4. Identify selected day/hour indices
    // days array corresponds to values 1(Mon) to 7(Sun), which in JS Date is 1..6, 0
    const scheduledSlots: { currDayOffset: number, hour: number }[] = []
    
    for (let row = 0; row < HOURS.length; row++) {
      for (let col = 0; col < DAYS.length; col++) {
        if (availabilityGrid[row][col]) {
          const jsDayMatch = col === 6 ? 0 : col + 1 // Convert Lun=0 to JS Mon=1, Sun=6 -> JS Sun=0
          const militaryHour = row + 6 // 6am starts at row 0
          scheduledSlots.push({ currDayOffset: jsDayMatch, hour: militaryHour })
        }
      }
    }

    if (scheduledSlots.length === 0) {
      return res.status(400).json({ error: 'El calendario solicitado está vacío.' })
    }

    // 5. Generate schedule dates for next N weeks (Colombia time = UTC-5)
    // Use UTC throughout and only apply offset when storing
    const COL_OFFSET_MS = 5 * 60 * 60 * 1000
    const nowInColombia = new Date(Date.now() - COL_OFFSET_MS) // "fake UTC" = Colombia time
    const today = new Date(nowInColombia)
    today.setUTCHours(0, 0, 0, 0)

    const generatedDates: { date: Date, isHoliday: boolean }[] = []
    
    // Fetch group type for special holiday handling
    let groupType: string | null = null
    if (groupId) {
      const groupRes = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${STUDY_GROUPS_TABLE}/${groupId}`, reqOpts)
      const groupData = await groupRes.json()
      groupType = groupData?.fields?.['Group Type']
    }

    for (let w = 0; w < weeksToGenerate; w++) {
      for (const slot of scheduledSlots) {
        // d operates in "fake UTC" where UTC values represent Colombia time
        const d = new Date(today)
        d.setUTCDate(today.getUTCDate() + (w * 7))

        let diff = slot.currDayOffset - d.getUTCDay()
        if (diff < 0) diff += 7

        d.setUTCDate(d.getUTCDate() + diff)
        d.setUTCHours(slot.hour, 0, 0, 0) // slot.hour is Colombia time (e.g., 14 = 2pm COT)

        // Convert to real UTC for storage: add 5h (Colombia = UTC-5)
        const utcDate = new Date(d.getTime() + COL_OFFSET_MS)

        if (d.getTime() > nowInColombia.getTime()) {
          // Use d (Colombia time) for holiday check
          const colDateStr = d.toISOString().slice(0, 10)
          const isHoliday = isColombianHoliday(colDateStr)
          // "Comunidad" (Desconocidos) skips holidays entirely per User instruction
          if (isHoliday && groupType === 'Community Group') {
            continue
          }
          generatedDates.push({ date: utcDate, isHoliday })
        }
      }
    }

    // 6. Insert into 'Sessions'
    const newSessions = generatedDates.map(item => {
      const fields: any = {
        "Teacher": [targetTeacherId],
        "Scheduled Date/Time": item.date.toISOString(),
        "Duration (minutes)": 45,
        "Status": item.isHoliday ? "Canceled" : "Scheduled",
        "Location/Link": teacher.fields['Meeting Link'] || "Link Pendiente",
        "Is Holiday": item.isHoliday
      }
      if (groupId) fields["Study Group"] = [groupId]
      return { fields }
    })

    // Batch insert sessions (10 at a time max)
    let createdSessions: any[] = []
    for (let i = 0; i < newSessions.length; i += 10) {
      const batch = newSessions.slice(i, i + 10)
      const batchRes = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${SESSIONS_TABLE}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ records: batch, typecast: true })
      })
      const batchData = await batchRes.json()
      if (!batchRes.ok) throw new Error(JSON.stringify(batchData))
      createdSessions = [...createdSessions, ...batchData.records]
    }

    // 6b. Assign Curriculum Topics to sessions sequentially
    const topicsData = await fetchFromAirtable('Curriculum Topics', 'sort[0][field]=Order&sort[0][direction]=asc')
    const topics: { id: string }[] = topicsData.records || []

    if (topics.length > 0) {
      // Sort sessions chronologically by scheduled date
      const sortedSessions = [...createdSessions].sort((a, b) => {
        const dateA = new Date(a.fields['Scheduled Date/Time']).getTime()
        const dateB = new Date(b.fields['Scheduled Date/Time']).getTime()
        return dateA - dateB
      })

      // Assign topics in order; stop if we run out of topics
      const updates: { id: string; fields: { 'Curriculum Topic': string[] } }[] = []
      for (let i = 0; i < sortedSessions.length && i < topics.length; i++) {
        updates.push({
          id: sortedSessions[i].id,
          fields: { 'Curriculum Topic': [topics[i].id] }
        })
      }

      // Batch-update in groups of 10
      for (let i = 0; i < updates.length; i += 10) {
        const batch = updates.slice(i, i + 10)
        const patchRes = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${SESSIONS_TABLE}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ records: batch, typecast: true })
        })
        if (!patchRes.ok) throw new Error(JSON.stringify(await patchRes.json()))
      }
    }

    // 7. Insert into 'Session Participants' mapping Students <-> Sessions
    const participantRecords: any[] = []
    
    // For each session created, create a participant record FOR EACH student in the group
    createdSessions.forEach(session => {
      studentIds.forEach(sId => {
        participantRecords.push({
          fields: {
            "Session": [session.id],
            "Student": [sId],
            "Attendance": "Scheduled"
          }
        })
      })
    })

    for (let i = 0; i < participantRecords.length; i += 10) {
      const batch = participantRecords.slice(i, i + 10)
      const batchRes = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${SESSION_PARTICIPANTS_TABLE}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ records: batch, typecast: true })
      })
      if (!batchRes.ok) throw new Error(JSON.stringify(await batchRes.json()))
    }

    // 8. Update Student Status to Active if not already (for all involved students)
    for (const sId of studentIds) {
      await fetch(`https://api.airtable.com/v0/${BASE_ID}/${STUDENTS_TABLE}/${sId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fields: { "Status": "Active" } })
      })
    }

    return res.status(200).json({ 
      success: true, 
      sessionsGenerated: createdSessions.length,
      participantsGenerated: participantRecords.length,
      message: `Se generaron ${createdSessions.length} clases y ${participantRecords.length} participaciones exitosamente.`
    })

  } catch (error: any) {
    console.error('API Error:', error)
    return res.status(500).json({ error: error.message || 'Error del servidor' })
  }
}
