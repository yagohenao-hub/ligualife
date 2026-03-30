import type { NextApiRequest, NextApiResponse } from 'next'

const BASE_ID = 'app9ZtojlxX5FoZ7y'
const STUDENTS_TABLE = 'tblqzaBBn18txOyLu'
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY
const ADMIN_TOKEN = 'LinguaAdmin2025'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' })
  
  if (req.headers['x-admin-token'] !== ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    // Only fetch students open to groups and with 'Pending' status (or any if we want to expand)
    const formula = `AND({Open to Group Classes} = 1, {Status} = 'Pending')`
    const url = `https://api.airtable.com/v0/${BASE_ID}/${STUDENTS_TABLE}?filterByFormula=${encodeURIComponent(formula)}`
    
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` }
    })

    if (!response.ok) throw new Error('Airtable fetch failed')
    
    const data = await response.json()

    // Map the records to a cleaner interface
    const candidates = data.records.map((r: any) => ({
      id: r.id,
      name: r.fields['Full Name'] || 'Sin nombre',
      email: r.fields['Email'] || '',
      ageRange: r.fields['Age Range'] || '14+',
      vertical: r.fields['Verticals'] ? 'General' : '', // Simplified mapping
      needs: r.fields['Notes'] || 'No especificado',
      hasAvailability: !!r.fields['Availability']
    }))

    return res.status(200).json({ success: true, candidates })
  } catch (error: any) {
    console.error('Matchmaker API Error:', error)
    return res.status(500).json({ error: 'Server error' })
  }
}
