import type { NextApiRequest, NextApiResponse } from 'next'

const BASE_ID = 'app9ZtojlxX5FoZ7y'
const TEACHERS_TABLE = 'tblqGY8vCmsFeld7G'
const STUDENTS_TABLE = 'tblqzaBBn18txOyLu'
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY

async function fetchTable(table: string, params: string) {
  const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(table)}?${params}`
  const res = await fetch(url, { headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` } })
  if (!res.ok) throw new Error(`Airtable error: ${res.status}`)
  return res.json()
}

// Generates a 6-char PIN (2 letters from name + 4 digits), checked for uniqueness
function generatePin(fullName: string): string {
  const letters = fullName.replace(/\s+/g, '').toUpperCase().slice(0, 2).padEnd(2, 'X')
  const numbers = Math.floor(1000 + Math.random() * 9000).toString()
  const pos = Math.floor(Math.random() * 3)
  const digits = numbers.split('')
  digits.splice(pos, 0, ...letters.split(''))
  return digits.slice(0, 6).join('')
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })
  
  const { name, email, phone, timezone, bankDetails, availability, interests } = req.body

  if (!name || !email) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  // Generate unique 6-char PIN (checked against both Teachers and Students tables)
  let pin = ''
  for (let i = 0; i < 10; i++) {
    const candidate = generatePin(name)
    const checkTeachers = await fetchTable('Teachers', `filterByFormula=${encodeURIComponent(`{PIN} = '${candidate}'`)}`)
    if (!checkTeachers.records?.length) {
      const checkStudents = await fetchTable('Students', `filterByFormula=${encodeURIComponent(`{PIN} = '${candidate}'`)}`)
      if (!checkStudents.records?.length) { pin = candidate; break }
    }
  }
  if (!pin) return res.status(500).json({ error: 'No se pudo generar un PIN único. Intenta de nuevo.' })

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
              "fldsq1cfz7OnxNfm9": timezone,
              "fld7vSUdd69zdl6yQ": availability,
              "fld9QkYJhY4df17Bb": bankDetails,
              "fldwAF9uwhjDUXoZj": interests,
              "fldsCFNKymtmEbVDe": pin,
              // Status field — set to Pending on self-registration
              "fldStatus": "Pending"
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
