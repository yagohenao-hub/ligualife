import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchFromAirtable, fetchAirtableRecord } from '@/lib/airtable'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { pin } = req.body as { pin?: string }
  if (!pin) return res.status(400).json({ error: 'PIN es requerido' })

  try {
    const pinStr = pin.trim()

    // 1. Try Teachers
    const teacherData = await fetchFromAirtable('Teachers', `filterByFormula=${encodeURIComponent(`{PIN} = '${pinStr}'`)}`)
    if (teacherData.records?.[0]) {
      const record = teacherData.records[0]
      return res.status(200).json({
        role: 'teacher',
        teacherId: record.id,
        name: (record.fields['Name'] ?? record.fields['Full Name'] ?? '') as string,
      })
    }

    // 2. Try Students
    const studentData = await fetchFromAirtable('Students', `filterByFormula=${encodeURIComponent(`{PIN} = '${pinStr}'`)}`)
    if (studentData.records?.[0]) {
      const record = studentData.records[0]
      
      // Resolve teacher (same logic as student/login)
      let teacherId: string | null = null
      let teacherName: string | null = null
      let teacherPhone: string | null = null

      const stLinks = (record.fields['Student-Teacher'] as string[]) ?? []
      for (const stId of stLinks) {
        const st = await fetchAirtableRecord('Student-Teacher', stId)
        if (st?.fields?.['Status'] === 'Active') {
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
        role: 'student',
        id: record.id,
        name: record.fields['Full Name'] as string,
        email: record.fields['Email'] as string,
        tokens: (record.fields['Tokens de Reposición'] as number) ?? 0,
        teacherId,
        teacherName,
        teacherPhone,
      })
    }

    return res.status(401).json({ error: 'PIN inválido' })
  } catch (err: any) {
    return res.status(500).json({ error: 'Error de servidor', detail: err.message })
  }
}
