import type { NextApiRequest, NextApiResponse } from 'next'

const BASE_ID = 'app9ZtojlxX5FoZ7y'
const STUDENTS_TABLE = 'tblqzaBBn18txOyLu'
const TEACHERS_TABLE = 'tblqGY8vCmsFeld7G'
const SESSIONS_TABLE = 'tbliWEtFm3aJf8NQp'
const SESSION_PARTICIPANTS_TABLE = 'tblnSKiIdbb3gZxCu'
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const HOURS = ['6am', '7am', '8am', '9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm', '7pm', '8pm']

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })
  
  const { studentId, teacherId, weeksToGenerate = 4 } = req.body

  if (!studentId || !teacherId) {
    return res.status(400).json({ error: 'Faltan parámetros requeridos: studentId, teacherId' })
  }

  try {
    // 1. Fetch Student & Teacher info
    const reqOpts = { headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` } }
    const [studentRes, teacherRes] = await Promise.all([
      fetch(`https://api.airtable.com/v0/${BASE_ID}/${STUDENTS_TABLE}/${studentId}`, reqOpts),
      fetch(`https://api.airtable.com/v0/${BASE_ID}/${TEACHERS_TABLE}/${teacherId}`, reqOpts)
    ])

    const student = await studentRes.json()
    const teacher = await teacherRes.json()

    if (!student.fields || !teacher.fields) {
      throw new Error('Estudiante o Profesor no encontrado en Airtable')
    }

    // Attempt to parse student availability
    let availabilityStr = student.fields['Availability']
    if (!availabilityStr) {
      return res.status(400).json({ error: 'El estudiante no tiene horarios de Availability configurados.' })
    }

    let availabilityGrid: boolean[][]
    try {
      availabilityGrid = JSON.parse(availabilityStr)
    } catch {
      return res.status(400).json({ error: 'El formato de Availability del estudiante es inválido.' })
    }

    // 2. Identify selected day/hour indices
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
      return res.status(400).json({ error: 'El calendario del estudiante está vacío.' })
    }

    // 3. Generate schedule dates for next N weeks
    const today = new Date()
    today.setHours(0,0,0,0) // Normalize

    const generatedDates: Date[] = []

    for (let w = 0; w < weeksToGenerate; w++) {
      for (const slot of scheduledSlots) {
        const d = new Date(today)
        // Jump weeks
        d.setDate(today.getDate() + (w * 7)) 
        
        // Find the next correct day of the week (JavaScript getDay: 0=Sun, 1=Mon... 6=Sat)
        // slot.currDayOffset is 1..6 (Mon..Sat) or 0 (Sun)
        let diff = slot.currDayOffset - d.getDay()
        if (diff < 0) diff += 7 // Always look forward in the current week window
        
        d.setDate(d.getDate() + diff)
        
        // Build timestamp
        d.setHours(slot.hour, 0, 0, 0)
        
        // Prevent scheduling classes in the past if generating for week 0
        if (d.getTime() > new Date().getTime()) {
          generatedDates.push(d)
        }
      }
    }

    // 4. Insert into 'Sessions'
    const newSessions = generatedDates.map(date => ({
      fields: {
        "Teacher": [teacherId],
        "Scheduled Date/Time": date.toISOString(),
        "Duration (minutes)": 45,
        "Status": "Scheduled",
        "Location/Link": teacher.fields['Meeting Link'] || "Link Pendiente"
      }
    }))

    // Batch insert sessions (10 at a time max per Airtable API limits)
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

    // 5. Insert into 'Session Participants' mapping Students <-> Sessions
    const participantRecords = createdSessions.map(session => ({
      fields: {
        "Session": [session.id],
        "Student": [studentId],
        "Attendance": "Scheduled"
      }
    }))

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

    // Optional: Update Student Status to Active if not already
    await fetch(`https://api.airtable.com/v0/${BASE_ID}/${STUDENTS_TABLE}/${studentId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          "Status": "Active"
        }
      })
    })

    return res.status(200).json({ 
      success: true, 
      generated: createdSessions.length,
      message: `Se generaron ${createdSessions.length} clases exitosamente para las próximas ${weeksToGenerate} semanas.`
    })

  } catch (error: any) {
    console.error('API Error:', error)
    return res.status(500).json({ error: error.message || 'Error del servidor' })
  }
}
