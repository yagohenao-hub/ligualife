import type { NextApiRequest, NextApiResponse } from 'next'
import { findAirtableRecords } from '@/lib/airtable'

const ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? 'LinguaAdmin2025'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' })
  
  if (req.headers['x-admin-token'] !== ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const records = await findAirtableRecords('Students', `{Status} = 'Pending'`)

    const candidates = records.map((r: any) => ({
      id: r.id,
      name: r.fields['Full Name'] || r.fields['FullName'] || r.fields['Name'] || 'Sin nombre',
      email: r.fields['Email'] || '',
      ageRange: r.fields['Age Range'] || '14+',
      vertical: 'General',
      needs: r.fields['Notes'] || 'No especificado',
      hasAvailability: !!r.fields['Availability']
    }))

    return res.status(200).json({ success: true, candidates })
  } catch (error: any) {
    console.error('Matchmaker API Error:', error)
    return res.status(500).json({ error: 'Server error' })
  }
}
