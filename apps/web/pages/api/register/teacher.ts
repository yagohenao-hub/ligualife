import type { NextApiRequest, NextApiResponse } from 'next'

const BASE_ID = process.env.AIRTABLE_BASE_ID ?? 'app9ZtojlxX5FoZ7y'
const TEACHERS_TABLE = 'tblqGY8vCmsFeld7G'
const STUDENTS_TABLE = 'tblqzaBBn18txOyLu'
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY

// Optional: set to the Airtable field ID of an Attachment-type field named "SS Document"
// e.g. process.env.AIRTABLE_SS_FIELD_ID = 'fldXXXXXXXXXXXXXX'
const SS_DOCUMENT_FIELD_ID = process.env.AIRTABLE_SS_FIELD_ID || ''

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

// Returns YYYY-MM-DD for today + N days
function addDays(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })

  const {
    name, email, phone, timezone,
    bankDetails, availability, interests,
    ssDocumentData, ssDocumentName, ssDocumentType,
  } = req.body

  if (!name || !email || !phone) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  // 1. Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Formato de email inválido' })
  }

  // 2. Phone validation (only digits)
  const phoneDigits = phone.replace(/\s+/g, '').replace(/\+/g, '')
  if (!/^\d+$/.test(phoneDigits)) {
    return res.status(400).json({ error: 'El número de teléfono debe contener solo números' })
  }

  // 3. Name validation (at least two names)
  const nameParts = name.trim().split(/\s+/)
  if (nameParts.length < 2) {
    return res.status(400).json({ error: 'Por favor ingresa tu nombre completo (al menos dos nombres/apellidos)' })
  }

  // Generate unique 6-char PIN (checked against both Teachers and Students tables)
  let pin = ''
  for (let i = 0; i < 10; i++) {
    const candidate = generatePin(name)
    const checkTeachers = await fetchTable(TEACHERS_TABLE, `filterByFormula=${encodeURIComponent(`{PIN} = '${candidate}'`)}`)
    if (!checkTeachers.records?.length) {
      const checkStudents = await fetchTable(STUDENTS_TABLE, `filterByFormula=${encodeURIComponent(`{PIN} = '${candidate}'`)}`)
      if (!checkStudents.records?.length) { pin = candidate; break }
    }
  }
  if (!pin) return res.status(500).json({ error: 'No se pudo generar un PIN único. Intenta de nuevo.' })

  // SS expiry date: will be recalculated on activation, but pre-fill as today + 30 days
  const ssExpiryDate = addDays(30)
  const today = new Date().toISOString().split('T')[0]

  // Build the Airtable record fields (use field IDs for all known fields)
  const fields: Record<string, unknown> = {
    "fldYW4Oh6dPrZh4wY": name,
    "fldwHO6pmhgSxhtMU": email,
    "fldmvzzWizaHinAMu": phone,
    "fldsq1cfz7OnxNfm9": timezone,
    "fld7vSUdd69zdl6yQ": availability,
    "fld9QkYJhY4df17Bb": bankDetails,
    "fldwAF9uwhjDUXoZj": Array.isArray(interests) ? interests : [],
    "fldsCFNKymtmEbVDe": pin,
    "Status": "Pending",
    // SS fields: set via field names — require these fields to exist in the Airtable table.
    // If they don't exist yet, comment them out until they're created.
    "SS Expiry Date": ssExpiryDate,
    "SS Last Updated": today,
  }

  const postToAirtable = async (f: Record<string, unknown>) =>
    fetch(`https://api.airtable.com/v0/${BASE_ID}/${TEACHERS_TABLE}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ records: [{ fields: f }], typecast: true }),
    })

  try {
    let response = await postToAirtable(fields)
    let data = await response.json()

    // If Airtable rejects due to unknown SS fields, retry without them
    if (!response.ok) {
      const errMsg: string = data?.error?.message || ''
      if (errMsg.toLowerCase().includes('unknown field') || errMsg.toLowerCase().includes('field')) {
        console.warn('Retrying without SS date fields:', errMsg)
        const { 'SS Expiry Date': _a, 'SS Last Updated': _b, ...coreFields } = fields
        response = await postToAirtable(coreFields)
        data = await response.json()
      }
    }

    if (!response.ok) {
      console.error('Airtable Error:', JSON.stringify(data, null, 2))
      return res.status(500).json({ error: 'No se pudo guardar la aplicación', details: data })
    }

    const recordId: string = data.records[0]?.id

    // Upload SS document as Airtable attachment (requires an Attachment field + AIRTABLE_SS_FIELD_ID)
    if (ssDocumentData && ssDocumentName && ssDocumentType && SS_DOCUMENT_FIELD_ID && recordId) {
      try {
        const fileBuffer = Buffer.from(ssDocumentData, 'base64')
        const formData = new FormData()
        const blob = new Blob([fileBuffer], { type: ssDocumentType })
        formData.append('file', blob, ssDocumentName)
        formData.append('filename', ssDocumentName)
        formData.append('contentType', ssDocumentType)
        formData.append('fieldId', SS_DOCUMENT_FIELD_ID)

        const uploadRes = await fetch(
          `https://content.airtable.com/v0/${BASE_ID}/${recordId}/uploadAttachment`,
          {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` },
            body: formData,
          }
        )

        if (!uploadRes.ok) {
          const uploadErr = await uploadRes.text()
          console.error('SS attachment upload failed:', uploadErr)
          // Non-fatal: registration succeeds, document can be uploaded later from Studio
        }
      } catch (uploadError) {
        console.error('SS upload error:', uploadError)
        // Non-fatal
      }
    }

    return res.status(200).json({ success: true, record: data.records[0] })
  } catch (error: any) {
    console.error('API Error:', error)
    return res.status(500).json({ error: 'Error del servidor' })
  }
}
