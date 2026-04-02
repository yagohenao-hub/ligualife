import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchFromAirtable, fetchAirtableRecord } from '@/lib/airtable'

export interface StudioStudent {
  id: string
  name: string
  level?: string
  vertical?: string
}

export interface StudioData {
  completedCount: number
  scheduledCount: number
  earnedCOP: number
  projectedCOP: number
  students: StudioStudent[]
  sessions: { id: string, date: string, isExtra: boolean, status: string }[]
}

const RATE_PER_CLASS = 30000

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { teacherName, teacherId } = req.query as { teacherName?: string, teacherId?: string }
  if (!teacherName || !teacherId) return res.status(400).json({ error: 'teacherName y teacherId son requeridos' })
  
  const teacherRec = await fetchAirtableRecord('Teachers', teacherId)

  try {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1
    const monthStart = `${year}-${String(month).padStart(2, '0')}-01`
    const nextMonth = month === 12 ? 1 : month + 1
    const nextYear = month === 12 ? year + 1 : year
    const monthEnd = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`

    // Get current week range (Monday to Sunday)
    const today = new Date()
    const day = today.getDay() // 0 is Sunday, 1 is Monday
    const diffToMon = day === 0 ? -6 : 1 - day
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() + diffToMon)
    weekStart.setHours(0,0,0,0)
    
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 7)

    const teacherFilter = `FIND('${teacherName}', ARRAYJOIN({Teacher}, ',')) > 0`
    
    // Month stats filter
    const monthFormula = `AND(${teacherFilter}, IS_AFTER({Scheduled Date/Time}, '${monthStart}'), IS_BEFORE({Scheduled Date/Time}, '${monthEnd}'))`
    
    // Week sessions filter for the calendar
    const weekFormula = `AND(${teacherFilter}, IS_AFTER({Scheduled Date/Time}, '${weekStart.toISOString()}'), IS_BEFORE({Scheduled Date/Time}, '${weekEnd.toISOString()}'))`

    const [monthData, weekData] = await Promise.all([
      fetchFromAirtable('Sessions', `filterByFormula=${encodeURIComponent(monthFormula)}&maxRecords=100`),
      fetchFromAirtable('Sessions', `filterByFormula=${encodeURIComponent(weekFormula)}&maxRecords=100`)
    ])

    const monthRecords = monthData.records || []
    const weekRecords = weekData.records || []

    let earnedCOP = 0
    let projectedCOP = 0
    let completedCount = 0
    let scheduledCount = 0

    for (const r of monthRecords) {
      const status = r.fields['Status']
      if (status !== 'Seen' && status !== 'Scheduled') continue

      const pIds = r.fields['Session Participants'] as string[] || []
      const participantCount = Math.max(1, pIds.length) 
      const extraParticipants = participantCount - 1

      // Base rate: 30,000 COP. Extra per additional student: 3,000 COP (40% of 60,000 / 8)
      const classValue = RATE_PER_CLASS + (extraParticipants * 3000)

      if (status === 'Seen') {
        completedCount++
        earnedCOP += classValue
        projectedCOP += classValue
      } else if (status === 'Scheduled') {
        scheduledCount++
        projectedCOP += classValue
      }
    }

    // Format week sessions for the calendar
    const sessionDetails = weekRecords.map((r: any) => ({
      id: r.id,
      date: r.fields['Scheduled Date/Time'],
      isExtra: !!r.fields['Extraordinary Session (Token)'],
      status: r.fields['Status'],
      isHoliday: !!r.fields['Is Holiday'],
      holidayConfirmedTeacher: !!r.fields['Holiday Confirmed (Teacher)'],
      holidayConfirmedStudent: !!r.fields['Holiday Confirmed (Student)']
    }))

    // Unique participant junction IDs for Mis Alumnos
    const participantIds = [
      ...new Set(
        monthRecords.flatMap((r: any) => (r.fields['Session Participants'] as string[]) ?? [])
      ),
    ]

    const studentIds = new Set<string>()
    await Promise.all(
      participantIds.map(async (pid) => {
        const p = await fetchAirtableRecord('Session Participants', pid as string)
        const sId = (p?.fields?.['Student'] as string[])?.[0]
        if (sId) studentIds.add(sId)
      })
    )

    const students = (
      await Promise.all(
        [...studentIds].map(async (sid) => {
          const s = await fetchAirtableRecord('Students', sid)
          if (!s) return null
          return {
            id: s.id,
            name: s.fields['Full Name'] as string,
            level: s.fields['Level'] as string,
            vertical: ((s.fields['Vertical (Lookup)'] as string[]) ?? [])[0] || undefined,
            tokens: (s.fields['Tokens de Reposición'] as number) ?? 0
          }
        })
      )
    ).filter(s => s !== null)

    const studioData: any = {
      completedCount,
      scheduledCount,
      earnedCOP,
      projectedCOP,
      students,
      sessions: sessionDetails,
      availability: teacherRec?.fields?.['Availability'] ?? null
    }

    return res.status(200).json(studioData)
  } catch (err: any) {
    return res.status(500).json({ error: 'Error al cargar studio', detail: err.message })
  }
}
