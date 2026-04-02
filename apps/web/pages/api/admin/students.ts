import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchFromAirtable, createAirtableRecord, patchAirtableRecord } from '@/lib/airtable'

const ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? 'LinguaAdmin2025'

function generatePin(fullName: string): string {
  const letters = fullName.replace(/\s+/g, '').toUpperCase().slice(0, 2).padEnd(2, 'X')
  const numbers = Math.floor(1000 + Math.random() * 9000).toString()
  // Shuffle letters within the number string
  const pos = Math.floor(Math.random() * 3) // 0, 1, or 2
  const digits = numbers.split('')
  digits.splice(pos, 0, ...letters.split(''))
  return digits.slice(0, 6).join('')
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers['x-admin-token']
  if (token !== ADMIN_TOKEN) return res.status(401).json({ error: 'No autorizado' })

  try {
    if (req.method === 'GET') {
        const studentsData = await fetchFromAirtable('Students', 'sort[0][field]=Full%20Name&sort[0][direction]=asc')
      const records = studentsData.records ?? []

      const students = records.map((r: any) => ({
        id: r.id,
        name: (r.fields['Full Name'] ?? '') as string,
        email: (r.fields['Email'] ?? '') as string,
        phone: (r.fields['Phone'] ?? '') as string,
        timezone: (r.fields['Timezone'] ?? '') as string,
        tokens: (r.fields['Tokens de Reposición'] ?? 0) as number,
        pin: (r.fields['PIN'] ?? '') as string,
        status: (r.fields['Status'] ?? 'Active') as string,
        notes: (r.fields['Notes'] ?? '') as string,
        interests: (r.fields['Interests'] ?? []) as string[],
        availability: (r.fields['Availability'] ?? '') as string,
      }))

      return res.status(200).json({ students })
    }

    if (req.method === 'POST') {
      const { name, email, phone, timezone, tokens, notes } = req.body as {
        name: string
        email: string
        phone?: string
        timezone?: string
        tokens?: number
        notes?: string
      }

      if (!name || !email) return res.status(400).json({ error: 'Nombre y email son requeridos' })

      // Check PIN uniqueness - retry up to 5 times
      let pin = ''
      for (let i = 0; i < 5; i++) {
        const candidate = generatePin(name)
        const check = await fetchFromAirtable('Students', `filterByFormula=${encodeURIComponent(`{PIN} = '${candidate}'`)}`)
        if (!check.records?.length) {
          // Also check teachers
          const checkT = await fetchFromAirtable('Teachers', `filterByFormula=${encodeURIComponent(`{PIN} = '${candidate}'`)}`)
          if (!checkT.records?.length) { pin = candidate; break }
        }
      }
      if (!pin) return res.status(500).json({ error: 'No se pudo generar un PIN único. Intenta de nuevo.' })

      const fields: Record<string, any> = {
        'Full Name': name,
        'Email': email,
        'PIN': pin,
        'Tokens de Reposición': tokens ?? 0,
        'Status': 'Active',
      }
      if (phone) fields['Phone'] = phone
      if (timezone) fields['Timezone'] = timezone
      if (notes) fields['Notes'] = notes

      const created = await createAirtableRecord('Students', fields)

      return res.status(201).json({ 
        id: created.id, 
        pin,
        message: `Alumno creado. PIN: ${pin}` 
      })
    }

    if (req.method === 'PATCH') {
      const { id, status, tokens, notes } = req.body as {
        id: string
        status?: string
        tokens?: number
        notes?: string
      }
      if (!id) return res.status(400).json({ error: 'id es requerido' })

      const fields: Record<string, any> = {}
      if (status !== undefined) fields['Status'] = status
      if (tokens !== undefined) fields['Tokens de Reposición'] = tokens
      if (notes !== undefined) fields['Notes'] = notes

      await patchAirtableRecord('Students', id, fields)
      return res.status(200).json({ ok: true })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err: any) {
    return res.status(500).json({ error: 'Error del servidor', detail: err.message })
  }
}
