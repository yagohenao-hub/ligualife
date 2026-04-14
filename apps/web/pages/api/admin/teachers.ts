import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchFromAirtable, createAirtableRecord, patchAirtableRecord } from '@/lib/airtable'

const ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? 'LinguaAdmin2025'
const TEACHER_STATUSES = ['Pending', 'Active', 'Paused', 'Inactive']

function generatePin(fullName: string): string {
  const letters = fullName.replace(/\s+/g, '').toUpperCase().slice(0, 2).padEnd(2, 'X')
  const numbers = Math.floor(1000 + Math.random() * 9000).toString()
  const pos = Math.floor(Math.random() * 3)
  const digits = numbers.split('')
  digits.splice(pos, 0, ...letters.split(''))
  return digits.slice(0, 6).join('')
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers['x-admin-token']
  if (token !== ADMIN_TOKEN) return res.status(401).json({ error: 'No autorizado' })

  try {
    if (req.method === 'GET') {
      const data = await fetchFromAirtable('Teachers', 'sort[0][field]=Name&sort[0][direction]=asc')
      const records = data.records ?? []

      const teachers = records.map((r: any) => ({
        id: r.id,
        name: (r.fields['Name'] ?? '') as string,
        email: (r.fields['Email'] ?? '') as string,
        phone: (r.fields['Phone'] ?? '') as string,
        timezone: (r.fields['Timezone'] ?? '') as string,
        pin: (r.fields['PIN'] ?? '') as string,
        bio: (r.fields['Bio'] ?? '') as string,
        meetingLink: (r.fields['Meeting Link'] ?? '') as string,
        specialty: (r.fields['Academic Interests'] ?? []) as string[],
        availability: (r.fields['Availability'] ?? '') as string,
        status: (r.fields['Status'] ?? 'Active') as string,
        studentCount: ((r.fields['Student-Teacher'] as string[]) ?? []).length,
      }))

      return res.status(200).json({ teachers })
    }

    if (req.method === 'POST') {
      const { name, email, phone, timezone, bio, meetingLink } = req.body as {
        name: string
        email: string
        phone?: string
        timezone?: string
        bio?: string
        meetingLink?: string
      }

      if (!name || !email) return res.status(400).json({ error: 'Nombre y email son requeridos' })

      // Generate unique 6-char PIN, checked against both tables
      let pin = ''
      for (let i = 0; i < 10; i++) {
        const candidate = generatePin(name)
        const check = await fetchFromAirtable('Teachers', `filterByFormula=${encodeURIComponent(`{PIN} = '${candidate}'`)}`)
        if (!check.records?.length) {
          const checkS = await fetchFromAirtable('Students', `filterByFormula=${encodeURIComponent(`{PIN} = '${candidate}'`)}`)
          if (!checkS.records?.length) { pin = candidate; break }
        }
      }
      if (!pin) return res.status(500).json({ error: 'No se pudo generar un PIN único. Intenta de nuevo.' })

      const fields: Record<string, any> = {
        'Name': name,
        'Email': email,
        'PIN': pin,
        'Status': 'Active', // Admin-created teachers start Active directly
      }
      if (phone) fields['Phone'] = phone
      if (timezone) fields['Timezone'] = timezone
      if (bio) fields['Bio'] = bio
      if (meetingLink) fields['Meeting Link'] = meetingLink

      const created = await createAirtableRecord('Teachers', fields)

      return res.status(201).json({ 
        id: created.id, 
        pin,
        message: `Profesor creado. PIN: ${pin}` 
      })
    }

    if (req.method === 'PATCH') {
      const { id, bio, phone, meetingLink, timezone, status } = req.body as {
        id: string
        bio?: string
        phone?: string
        meetingLink?: string
        timezone?: string
        status?: string
      }
      if (!id) return res.status(400).json({ error: 'id es requerido' })

      // Validate status if provided
      if (status && !TEACHER_STATUSES.includes(status)) {
        return res.status(400).json({ error: `Estado inválido. Opciones: ${TEACHER_STATUSES.join(', ')}` })
      }

      const fields: Record<string, any> = {}
      if (bio !== undefined) fields['Bio'] = bio
      if (phone !== undefined) fields['Phone'] = phone
      if (meetingLink !== undefined) fields['Meeting Link'] = meetingLink
      if (timezone !== undefined) fields['Timezone'] = timezone
      if (status !== undefined) fields['Status'] = status

      await patchAirtableRecord('Teachers', id, fields)
      return res.status(200).json({ ok: true })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err: any) {
    return res.status(500).json({ error: 'Error del servidor', detail: err.message })
  }
}
