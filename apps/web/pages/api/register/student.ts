import type { NextApiRequest, NextApiResponse } from 'next'

const BASE_ID = 'app9ZtojlxX5FoZ7y'
const STUDENTS_TABLE = 'tblqzaBBn18txOyLu'
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })
  
  const { fullName, email, phone, ageRange, goalId, interests, availability, openToGroups } = req.body

  if (!fullName || !email) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    const response = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${STUDENTS_TABLE}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        records: [
          {
            fields: {
              "fldbdDNucZwILRMwO": fullName,
              "fldxAsAn6aQDHRR9U": email,
              "fldu8P3X4o9P4V9dn": phone,
              "fld1Vi2ti4xdraYyo": ageRange,
              "fld6HZD7X8hzgGCUX": goalId ? [goalId] : [],
              "fldTfNhYtykGeDx1x": interests,
              "fldmPdharKvZzqsMq": availability,
              "fldXUKKO28Wr1dN76": "Pending",
              "fldHBsqpAjtOv9sBk": `Registration Goal ID: ${goalId}`,
              "flddBUJK1K42KKsJv": openToGroups
            }
          }
        ],
        typecast: true
      })
    })

    const data = await response.json()
    if (!response.ok) {
      console.error('Airtable Error:', data)
      return res.status(500).json({ error: 'No se pudo guardar la información en la base de datos', details: data })
    }

    return res.status(200).json({ success: true, record: data.records[0] })
  } catch (error: any) {
    console.error('API Error:', error)
    return res.status(500).json({ error: 'Error del servidor' })
  }
}
