import type { NextApiRequest, NextApiResponse } from 'next'
import { findAirtableRecords, fetchAirtableRecord } from '@/lib/airtable'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Use admin token for security
  const ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? 'LinguaAdmin2025'
  const adminToken = req.headers['x-admin-token']
  if (adminToken !== ADMIN_TOKEN) {
    return res.status(401).json({ error: 'No autorizado' })
  }

  try {
    // 1. Fetch pending requests
    const records = await findAirtableRecords('Series Requests', '{Status} = "Pending"')
    
    // 2. Map and fetch student names
    const requests = await Promise.all(records.map(async (rec) => {
      const studentId = rec.fields['Student']?.[0]
      let studentName = 'Alumno desconocido'
      let whatsapp = ''
      
      if (studentId) {
        const studentRaw = await fetchAirtableRecord('Students', studentId)
        studentName = studentRaw?.fields?.['Full Name'] || 'Alumno'
        whatsapp = studentRaw?.fields?.['Phone'] || ''
      }

      return {
        id: rec.id,
        studentName,
        seriesName: rec.fields['Series Name'],
        status: rec.fields['Status'],
        whatsapp,
        date: rec.fields['Request Date']
      }
    }))

    return res.status(200).json({ requests })
  } catch (error: any) {
    console.error('Fetch Series Requests Error:', error)
    return res.status(500).json({ error: 'Error al cargar las solicitudes' })
  }
}
