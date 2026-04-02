import type { NextApiRequest, NextApiResponse } from 'next'

const BASE_ID = 'app9ZtojlxX5FoZ7y'
const TEACHERS_TABLE = 'tblqGY8vCmsFeld7G'
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })
  
  const { name, email, phone, bio, timezone, bankDetails, availability, interests } = req.body

  if (!name || !email) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  // Simple random PIN generation for onboarding
  const generatedPin = Math.floor(1000 + Math.random() * 9000).toString()

  try {
    const response = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TEACHERS_TABLE}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        records: [
          {
            fields: {
              "fldYW4Oh6dPrZh4wY": name,
              "fldwHO6pmhgSxhtMU": email,
              "fldmvzzWizaHinAMu": phone,
              "fldQRe6IyWnpQhASO": bio,
              "fldsq1cfz7OnxNfm9": timezone,
              "fld7vSUdd69zdl6yQ": availability,
              "fld9QkYJhY4df17Bb": bankDetails,
              "fldwAF9uwhjDUXoZj": interests, // array of names works with typecast: true
              "fldsCFNKymtmEbVDe": generatedPin
            }
          }
        ],
        typecast: true
      })
    })

    const data = await response.json()
    if (!response.ok) {
      console.error('Airtable Error:', data)
      return res.status(500).json({ error: 'No se pudo guardar la aplicación', details: data })
    }

    return res.status(200).json({ success: true, record: data.records[0] })
  } catch (error: any) {
    console.error('API Error:', error)
    return res.status(500).json({ error: 'Error del servidor' })
  }
}
