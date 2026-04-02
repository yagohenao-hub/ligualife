import type { NextApiRequest, NextApiResponse } from 'next'
import { createAirtableRecord, findAirtableRecords } from '@/lib/airtable'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { studentId, seriesName } = req.body
  if (!studentId || !seriesName) return res.status(400).json({ error: 'Missing data' })

  try {
    // 1. Check if the student has already requested in the last 7 days
    const lastWeek = new Date()
    lastWeek.setDate(lastWeek.getDate() - 7)
    const lastWeekIso = lastWeek.toISOString().split('T')[0]

    // Formula: AND({Student ID} = 'sid', IS_AFTER({Request Date}, 'lastWeekIso'))
    // Note: This assumes the field 'Student' in Airtable corresponds to the ID string or is linked.
    // If it's a linked field, we might need a specific filter.
    const formula = `AND({Student ID} = '${studentId}', IS_AFTER({Request Date}, '${lastWeekIso}'))`
    
    // Safety check: if the table doesn't exist yet, this will fail. 
    // I'll use 'Series Requests' as the table name.
    const existing = await findAirtableRecords('Series Requests', formula)

    if (existing.length > 0) {
      return res.status(429).json({ error: 'Límite alcanzado: Solo puedes hacer 1 solicitud por semana.' })
    }

    // 2. Create the request
    await createAirtableRecord('Series Requests', {
      'Student': [studentId], // Linked field
      'Student ID': studentId, // For filtering logic
      'Series Name': seriesName,
      'Status': 'Pending',
      'Request Date': new Date().toISOString()
    })

    return res.status(200).json({ success: true })
  } catch (error: any) {
    console.error('Series Request Error:', error)
    return res.status(500).json({ error: 'Error al procesar la solicitud. Asegúrate de que la tabla "Series Requests" existe en Airtable.' })
  }
}
