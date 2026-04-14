import type { NextApiRequest, NextApiResponse } from 'next'

const BASE_ID = 'app9ZtojlxX5FoZ7y'
const STUDENTS_TABLE = 'tblqzaBBn18txOyLu'
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY

function generatePin(fullName: string): string {
  const letters = fullName.replace(/\s+/g, '').toUpperCase().slice(0, 2).padEnd(2, 'X')
  const numbers = Math.floor(1000 + Math.random() * 9000).toString()
  const pos = Math.floor(Math.random() * 3)
  const digits = numbers.split('')
  digits.splice(pos, 0, ...letters.split(''))
  return digits.slice(0, 6).join('')
}

async function fetchTable(table: string, params: string) {
  const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(table)}?${params}`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
  })
  if (!res.ok) throw new Error(`Airtable error: ${res.status}`)
  return res.json()
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })

  const { fullName, email, phone, ageRange, goalId, interests, availability, openToGroups, timezone } = req.body

  if (!fullName || !email) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Formato de email inválido' })
  }

  try {
    // Generate unique PIN (checked against Students AND Teachers, retry up to 10 times)
    let pin = ''
    for (let i = 0; i < 10; i++) {
      const candidate = generatePin(fullName)
      const checkStudents = await fetchTable('Students', `filterByFormula=${encodeURIComponent(`{PIN} = '${candidate}'`)}`)
      if (!checkStudents.records?.length) {
        const checkTeachers = await fetchTable('Teachers', `filterByFormula=${encodeURIComponent(`{PIN} = '${candidate}'`)}`)
        if (!checkTeachers.records?.length) { pin = candidate; break }
      }
    }
    if (!pin) {
      return res.status(500).json({ error: 'No se pudo generar un PIN único. Intenta de nuevo.' })
    }

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
              "flddBUJK1K42KKsJv": openToGroups,
              "fldsq1cfz7OnxNfm9": timezone || 'America/Bogota',
              "PIN": pin
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

    return res.status(200).json({ success: true, pin, record: data.records[0] })
  } catch (error: any) {
    console.error('API Error:', error)
    return res.status(500).json({ error: 'Error del servidor' })
  }
}
