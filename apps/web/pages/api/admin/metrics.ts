import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchFromAirtable } from '@/lib/airtable'

const ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? 'LinguaAdmin2025'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers['x-admin-token']
  if (token !== ADMIN_TOKEN) return res.status(401).json({ error: 'No autorizado' })
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  try {
    // Fetch all students
    const studentsData = await fetchFromAirtable('Students', 'fields[]=Full%20Name&fields[]=Pocket%20Coach%20Status')
    const students: any[] = studentsData.records ?? []

    // Fetch all teachers
    const teachersData = await fetchFromAirtable('Teachers', 'fields[]=Name&fields[]=PIN')
    const teachers: any[] = teachersData.records ?? []

    // Fetch sessions in the next 7 days
    const now = new Date()
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    const formula = encodeURIComponent(
      `AND({Scheduled Date/Time} >= '${now.toISOString()}', {Scheduled Date/Time} <= '${nextWeek.toISOString()}', {Status} = 'Scheduled')`
    )
    const sessionsData = await fetchFromAirtable('Sessions', `filterByFormula=${formula}&fields[]=Session%20Name&fields[]=Status`)
    const upcomingSessions: any[] = sessionsData.records ?? []

    // Fetch sessions in current month where status = 'Done'
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const doneFormula = encodeURIComponent(
      `AND({Scheduled Date/Time} >= '${firstOfMonth}', {Status} = 'Done')`
    )
    const doneData = await fetchFromAirtable('Sessions', `filterByFormula=${doneFormula}&fields[]=Session%20Name`)
    const doneSessions: any[] = doneData.records ?? []

    // Count students with tokens
    const studentsWithTokensData = await fetchFromAirtable(
      'Students',
      `filterByFormula=${encodeURIComponent('{Tokens de Reposición} > 0')}&fields[]=Full%20Name`
    )

    // Fetch rescheduled sessions this month
    const rescheduledFormula = encodeURIComponent(
      `AND({Scheduled Date/Time} >= '${firstOfMonth}', OR({Status} = 'Rescheduled', {Status} = 'Canceled'))`
    )
    const rescheduledData = await fetchFromAirtable('Sessions', `filterByFormula=${rescheduledFormula}&fields[]=Session%20Name`)

    return res.status(200).json({
      totalStudents: students.length,
      totalTeachers: teachers.length,
      upcomingSessionsCount: upcomingSessions.length,
      doneSessionsThisMonth: doneSessions.length,
      studentsWithTokens: studentsWithTokensData.records?.length ?? 0,
      rescheduledThisMonth: rescheduledData.records?.length ?? 0,
    })
  } catch (err: any) {
    return res.status(500).json({ error: 'Error al cargar métricas', detail: err.message })
  }
}
