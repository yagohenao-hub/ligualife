import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchFromAirtable, createAirtableRecord, patchAirtableRecord, fetchAirtableRecord } from '@/lib/airtable'

const ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? 'LinguaAdmin2025'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers['x-admin-token']
  if (token !== ADMIN_TOKEN) return res.status(401).json({ error: 'No autorizado' })

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { studentIds, teacherId, notes, days, time } = req.body as {
    studentIds: string[]
    teacherId: string
    notes?: string
    days?: string[]
    time?: string
  }

  if (!studentIds || studentIds.length === 0) {
    return res.status(400).json({ error: 'Se requiere al menos un alumno' })
  }
  if (studentIds.length > 3) {
    return res.status(400).json({ error: 'El límite para grupos de conocidos es de 3 personas' })
  }
  if (!teacherId) {
    return res.status(400).json({ error: 'Se requiere un profesor para la vinculación' })
  }

  try {
    const fields: Record<string, any> = {
      'Student': studentIds,
      'Teacher': [teacherId],
      'Status': 'Active',
      'Start Date': new Date().toISOString().split('T')[0],
      'Notes': notes || `Vínculo de grupo (conocidos). ${studentIds.length} personas.`,
      'Recurrence Day': days || [],
      'Recurrence Time': time || ''
    }

    const created = await createAirtableRecord('Student-Teacher', fields)

    return res.status(200).json({ 
      ok: true, 
      id: created.id,
      message: 'Grupo vinculado exitosamente' 
    })
  } catch (err: any) {
    return res.status(500).json({ error: 'Error al vincular grupo', detail: err.message })
  }
}
