import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchFromAirtable, fetchAirtableRecord, findAirtableRecords } from '@/lib/airtable'
import { supabase } from '@/lib/supabaseClient'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { pin } = req.body as { pin?: string }
  if (!pin) return res.status(400).json({ error: 'PIN es requerido' })

  try {
    const cleanPin = pin.trim()
    const pinEscaped = cleanPin.replace(/'/g, '')

    // 1. Try Teachers (exact trimmed PIN verification)
    const teacherData = await fetchFromAirtable('Teachers', `filterByFormula=${encodeURIComponent(`{PIN} = '${pinEscaped}'`)}`)
    const matchedTeacher = (teacherData.records ?? []).find(
      (r: any) => String(r.fields?.['PIN'] ?? '').trim() === cleanPin
    )
    if (matchedTeacher) {
      return res.status(200).json({
        role: 'teacher',
        teacherId: matchedTeacher.id,
        name: (matchedTeacher.fields['Name'] ?? matchedTeacher.fields['Full Name'] ?? '') as string,
      })
    }

    // 2. Try Students (exact trimmed PIN verification)
    const studentData = await fetchFromAirtable('Students', `filterByFormula=${encodeURIComponent(`{PIN} = '${pinEscaped}'`)}`)
    const record = (studentData.records ?? []).find(
      (r: any) => String(r.fields?.['PIN'] ?? '').trim() === cleanPin
    )
    if (record) {
      // Resolve active teacher from Student-Teacher junction first, then Student links
      let teacherId: string | null = null
      let teacherName: string | null = null
      let teacherPhone: string | null = null

      const { data: stDirect } = await supabase
        .from('student_teacher')
        .select('*')
        .ilike('Student', `%${record.id}%`)
        .order('created_at', { ascending: false })

      const stRecords = (stDirect && stDirect.length > 0)
        ? stDirect.map((r: any) => ({ id: r.id, fields: r }))
        : await findAirtableRecords('Student-Teacher', `FIND('${record.id}', ARRAYJOIN({Student}, ',')) > 0`)

      for (const st of stRecords) {
        const status = (st?.fields?.['Status'] as string) ?? 'Active'
        if (status === 'Active') {
          const rawT = st.fields['Teacher']
          const tId = Array.isArray(rawT) ? rawT[0] : (typeof rawT === 'string' ? rawT.split(',')[0].trim() : null)
          if (tId) {
            const teacher = await fetchAirtableRecord('Teachers', tId)
            teacherId = tId
            teacherName = (teacher?.fields?.['Name'] ?? teacher?.fields?.['Full Name']) as string ?? null
            teacherPhone = teacher?.fields?.['Phone'] as string ?? null
            break
          }
        }
      }

      if (!teacherId) {
        const stLinks = (record.fields['Student-Teacher'] as string[]) ?? []
        for (const stId of stLinks) {
          const st = await fetchAirtableRecord('Student-Teacher', stId)
          if (st?.fields?.['Status'] === 'Active') {
            const tId = ((st.fields['Teacher'] as string[]) ?? [])[0]
            if (tId) {
              const teacher = await fetchAirtableRecord('Teachers', tId)
              teacherId = tId
              teacherName = (teacher?.fields?.['Name'] ?? teacher?.fields?.['Full Name']) as string ?? null
              teacherPhone = teacher?.fields?.['Phone'] as string ?? null
              break
            }
          }
        }
      }

      const rawTokens = record.fields['Tokens de Reposición'] ?? record.fields['Tokens'] ?? 0
      const parsedTokens = parseInt(String(rawTokens), 10)
      const rawClasses = record.fields['Classes Remaining'] ?? record.fields['ClassesRemaining'] ?? 0
      const parsedClasses = parseInt(String(rawClasses), 10)

      return res.status(200).json({
        role: 'student',
        id: record.id,
        name: (record.fields['Full Name'] ?? record.fields['FullName'] ?? record.fields['Name'] ?? '') as string,
        email: (record.fields['Email'] ?? '') as string,
        tokens: isNaN(parsedTokens) ? 0 : parsedTokens,
        classesRemaining: isNaN(parsedClasses) ? 0 : parsedClasses,
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
