import type { NextApiRequest, NextApiResponse } from 'next'
import { isColombianHoliday } from '@/lib/holidays'
import { fetchFromAirtable, fetchAirtableRecord, createAirtableRecord, patchAirtableRecord } from '@/lib/airtable'

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
    let targetTeacherId = teacherId
    let studentIds: string[] = studentId ? [studentId] : []
    let availabilityGrid: boolean[][] | null = customAvailability || null
    let groupType: string | null = null

    // 1. Fetch Group Info from Supabase (if applicable)
    if (groupId) {
      const group = await fetchAirtableRecord('Study Groups', groupId)
      if (!group?.fields) throw new Error('Grupo no encontrado en Supabase')

      const rawStudents = group.fields['Students']
      studentIds = Array.isArray(rawStudents)
        ? rawStudents
        : String(rawStudents || '').split(',').map((s: string) => s.trim()).filter(Boolean)

      if (!targetTeacherId && group.fields['Primary Teacher']) {
        targetTeacherId = Array.isArray(group.fields['Primary Teacher'])
          ? group.fields['Primary Teacher'][0]
          : String(group.fields['Primary Teacher']).split(',')[0].trim()
      }
      groupType = (group.fields['Group Type'] as string) || null
    }

    if (!targetTeacherId) {
      return res.status(400).json({ error: 'No se definió teacherId ni en la solicitud ni en el grupo.' })
    }

    // 2. Fetch Teacher info from Supabase
    const teacher = await fetchAirtableRecord('Teachers', targetTeacherId)
    if (!teacher?.fields) throw new Error('Profesor no encontrado en Supabase')

    // 3. Fallback to first student's availability if none provided
    if (!availabilityGrid && studentIds.length > 0) {
      const firstStudent = await fetchAirtableRecord('Students', studentIds[0])
      const availabilityStr = firstStudent?.fields?.['Availability']

      if (!availabilityStr) {
        return res.status(400).json({ error: 'El estudiante principal no tiene horarios de Availability configurados.' })
      }
      try {
        availabilityGrid = typeof availabilityStr === 'string' ? JSON.parse(availabilityStr) : availabilityStr
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

    // 6. Sort Curriculum Topics numerically (General English Course) BEFORE assigning
    const topicsData = await fetchFromAirtable('Curriculum Topics', '')
    const allTopics: any[] = topicsData.records || []
    const topics = allTopics
      .filter((t: any) => String(t.fields?.['Curriculum'] || '').includes('General English Course') || !t.fields?.['Curriculum'])
      .sort((a: any, b: any) => parseInt(String(a.fields?.['Order'] || '9999'), 10) - parseInt(String(b.fields?.['Order'] || '9999'), 10))

    // Sort generatedDates chronologically so Topic 1 -> Class 1, Topic 2 -> Class 2, etc.
    generatedDates.sort((a, b) => a.date.getTime() - b.date.getTime())

    // Batch insert sessions
    let createdSessions: any[] = []
    let topicIdx = 0
    for (const item of generatedDates) {
      const assignedTopic = !item.isHoliday && topicIdx < topics.length ? topics[topicIdx++] : null
      const fields: any = {
        "Session Name": assignedTopic ? `Tema ${assignedTopic.fields?.['Order'] || topicIdx}: ${assignedTopic.fields?.['Topic Name'] || 'Clase'}` : 'Sesión LinguaLife',
        "Teacher": [targetTeacherId],
        "Scheduled Date/Time": item.date.toISOString(),
        "Duration (minutes)": 60,
        "Status": item.isHoliday ? "Canceled" : "Scheduled",
        "Location/Link": teacher.fields['Meeting Link'] || "Link Pendiente",
        "Is Holiday": item.isHoliday
      }
      if (assignedTopic) fields["Curriculum Topic"] = [assignedTopic.id]
      if (groupId) fields["Study Group"] = [groupId]

      try {
        const record = await createAirtableRecord('Sessions', fields)
        createdSessions.push(record)
      } catch (e) {
        console.error('Error creating session record:', e)
      }
    }

    // 7. Insert into 'Session Participants' mapping Students <-> Sessions
    for (const session of createdSessions) {
      for (const sId of studentIds) {
        try {
          await createAirtableRecord('Session Participants', {
            "Session": [session.id],
            "Student": [sId],
            "Attendance": "Scheduled"
          })
        } catch (e) {
          console.error('Error creating participant record:', e)
        }
      }
    }

    // 8. Update Student Status to Active if not already (for all involved students)
    for (const sId of studentIds) {
      await patchAirtableRecord('Students', sId, { 'Status': 'Active' })
    }

    const totalParticipants = createdSessions.length * studentIds.length

    return res.status(200).json({ 
      success: true, 
      sessionsGenerated: createdSessions.length,
      participantsGenerated: totalParticipants,
      message: `Se generaron ${createdSessions.length} clases y ${totalParticipants} participaciones exitosamente.`
    })

  } catch (error: any) {
    console.error('API Error:', error)
    return res.status(500).json({ error: error.message || 'Error del servidor' })
  }
}
