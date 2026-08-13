import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchFromAirtable, deleteAirtableRecord, patchAirtableRecord } from '@/lib/airtable'

const ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? 'LinguaAdmin2025'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers['x-admin-token']
  if (token !== ADMIN_TOKEN) return res.status(401).json({ error: 'No autorizado' })

  try {
    if (req.method === 'GET') {
      // 1. Fetch Student-Teacher assignments (Groups of acquaintances)
      const stData = await fetchFromAirtable('Student-Teacher')
      const stRecords = stData.records ?? []
      
      // Filter for records with more than 1 student (Acquaintance groups) OR explicit groups
      // Actually, let's just return all and let the frontend decide, 
      // but showing any ST with multiple students as a group.
      
      // 2. Fetch "Matchmaker" Groups
      const groupData = await fetchFromAirtable('Study Groups')
      const groupRecords = groupData.records ?? []

      // Map to a unified format for Group Management
      const acquaintanceGroups = stRecords
        .filter((r: any) => (r.fields['Student']?.length ?? 0) > 1)
        .map((r: any) => ({
            id: r.id,
            type: 'conocidos',
            studentIds: r.fields['Student'] ?? [],
            teacherId: r.fields['Teacher']?.[0] ?? '',
            status: r.fields['Status'] ?? 'Active',
            notes: r.fields['Notes'] ?? '',
            days: r.fields['Recurrence Day'] ?? [],
            time: r.fields['Recurrence Time'] ?? ''
        }))

      const matchmakerGroups = groupRecords.map((r: any) => ({
          id: r.id,
          type: 'matchmaker',
          studentIds: r.fields['Students'] ?? [],
          teacherId: r.fields['Primary Teacher']?.[0] ?? '',
          status: r.fields['Status'] ?? 'Active',
          name: r.fields['Group Name'] ?? 'Grupo Matchmaker',
          level: r.fields['Level'] ?? '',
          topic: r.fields['Topic'] ?? ''
      }))

      return res.status(200).json({ 
          acquaintanceGroups, 
          matchmakerGroups 
      })
    }

    if (req.method === 'DELETE') {
        const { id, type, studentId } = req.query as { id: string, type: string, studentId?: string }
        if (!id || !type) return res.status(400).json({ error: 'id y type son requeridos' })

        if (studentId) {
            // Unlink a specific student from a group
            if (type === 'conocidos') {
                const record = await fetchFromAirtable('Student-Teacher', `filterByFormula=RECORD_ID()='${id}'`)
                if (record.records?.length) {
                    const currentStudents = record.records[0].fields['Student'] ?? []
                    const newStudents = currentStudents.filter((s: string) => s !== studentId)
                    if (newStudents.length === 0) {
                        await deleteAirtableRecord('Student-Teacher', id)
                    } else {
                        await patchAirtableRecord('Student-Teacher', id, { 'Student': newStudents })
                    }
                }
            } else {
                // Matchmaker group
                const record = await fetchFromAirtable('Study Groups', `filterByFormula=RECORD_ID()='${id}'`)
                if (record.records?.length) {
                    const currentStudents = record.records[0].fields['Students'] ?? []
                    const newStudents = currentStudents.filter((s: string) => s !== studentId)
                    if (newStudents.length === 0) {
                        await deleteAirtableRecord('Study Groups', id)
                    } else {
                        await patchAirtableRecord('Study Groups', id, { 'Students': newStudents })
                    }
                }
            }
            return res.status(200).json({ ok: true, message: 'Alumno desvinculado' })
        } else {
            // Delete entire group
            if (type === 'conocidos') {
                await deleteAirtableRecord('Student-Teacher', id)
            } else {
                await deleteAirtableRecord('Study Groups', id)
            }
            return res.status(200).json({ ok: true, message: 'Grupo eliminado' })
        }
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err: any) {
    return res.status(500).json({ error: 'Error en gestión de grupos', detail: err.message })
  }
}
