import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchFromAirtable, fetchAirtableRecord } from '@/lib/airtable'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email, pin } = req.body as { email?: string; pin?: string }
  if (!email || !pin) return res.status(400).json({ error: 'Email y PIN son requeridos' })

  try {
    const data = await fetchFromAirtable(
      'Students',
      `filterByFormula=${encodeURIComponent(`{Email} = '${email}'`)}`
    )

    const record = data.records?.[0]
    if (!record) return res.status(401).json({ error: 'Credenciales inválidas' })

    const storedPin = record.fields['PIN'] as string
    if (!storedPin || storedPin.trim() !== pin.trim()) {
      return res.status(401).json({ error: 'PIN incorrecto' })
    }

    // Resolve teacher via Student-Teacher junction or Student Curriculum
    let teacherId: string | null = null
    let teacherName: string | null = null
    let teacherPhone: string | null = null

    const stLinks = (record.fields['Student-Teacher'] as string[]) ?? []
    for (const stId of stLinks) {
      const st = await fetchAirtableRecord('Student-Teacher', stId)
      const status = st?.fields?.['Status'] as string
      if (status === 'Active') {
        const tId = ((st.fields['Teacher'] as string[]) ?? [])[0]
        if (tId) {
          const teacher = await fetchAirtableRecord('Teachers', tId)
          teacherId = tId
          teacherName = teacher?.fields?.['Name'] as string ?? null
          teacherPhone = teacher?.fields?.['Phone'] as string ?? null
          break
        }
      }
    }

    return res.status(200).json({
      id: record.id,
      name: record.fields['Full Name'] as string,
      email: record.fields['Email'] as string,
      tokens: (record.fields['Tokens de Reposición'] as number) ?? 0,
      teacherId,
      teacherName,
      teacherPhone,
    })
  } catch (err: any) {
    return res.status(500).json({ error: 'Error de servidor', detail: err.message })
  }
}
