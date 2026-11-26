import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchFromAirtable, fetchAirtableRecord, findAirtableRecords } from '@/lib/airtable'
import { supabase } from '@/lib/supabaseClient'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email, pin } = req.body as { email?: string; pin?: string }
  if (!email || !pin) return res.status(400).json({ error: 'Email y PIN son requeridos' })

  try {
    const cleanEmail = email.trim()
    const data = await fetchFromAirtable(
      'Students',
      `filterByFormula=${encodeURIComponent(`{Email} = '${cleanEmail}'`)}`
    )

    const record = data.records?.[0]
    if (!record) return res.status(401).json({ error: 'Credenciales inválidas' })

    const storedPin = String(record.fields['PIN'] ?? '')
    if (!storedPin || storedPin.trim() !== pin.trim()) {
      return res.status(401).json({ error: 'PIN incorrecto' })
    }

    // Resolve teacher via Supabase Student-Teacher junction (supports group comma-separated Student IDs)
    let teacherId: string | null = null
    let teacherName: string | null = null
    let teacherPhone: string | null = null

    const { data: stDirect } = await supabase
      .from('student_teacher')
      .select('*')
      .ilike('Student', `%${record.id}%`)
      .order('created_at', { ascending: false })

    let stRecords: any[] = (stDirect && stDirect.length > 0)
      ? stDirect.map((r: any) => ({ id: r.id, fields: r }))
      : []

    if (stRecords.length === 0) {
      const stLinks = (record.fields['Student-Teacher'] as string[]) ?? []
      if (stLinks.length > 0) {
        for (const stId of stLinks) {
          const st = await fetchAirtableRecord('Student-Teacher', stId)
          if (st) stRecords.push(st)
        }
      } else {
        stRecords = await findAirtableRecords('Student-Teacher', `FIND('${record.id}', ARRAYJOIN({Student}, ',')) > 0`)
      }
    }

    for (const st of stRecords) {
      const status = (st?.fields?.['Status'] as string) ?? 'Active'
      if (status === 'Active') {
        const rawT = st.fields['Teacher']
        const tId = Array.isArray(rawT) ? rawT[0] : (typeof rawT === 'string' ? rawT.split(',')[0].trim() : null)
        if (tId) {
          const teacher = await fetchAirtableRecord('Teachers', tId)
          teacherId = tId
          teacherName = (teacher?.fields?.['Name'] ?? teacher?.fields?.['FullName'] ?? teacher?.fields?.['Full Name']) as string ?? null
          teacherPhone = teacher?.fields?.['Phone'] as string ?? null
          break
        }
      }
    }

    const rawTokens = record.fields['Tokens de Reposición'] ?? record.fields['Tokens'] ?? 0
    const parsedTokens = parseInt(String(rawTokens), 10)
    const rawClasses = record.fields['Classes Remaining'] ?? record.fields['ClassesRemaining'] ?? 0
    const parsedClasses = parseInt(String(rawClasses), 10)

    return res.status(200).json({
      id: record.id,
      name: (record.fields['Full Name'] ?? record.fields['FullName'] ?? record.fields['Name'] ?? '') as string,
      email: (record.fields['Email'] ?? '') as string,
      tokens: isNaN(parsedTokens) ? 0 : parsedTokens,
      classesRemaining: isNaN(parsedClasses) ? 0 : parsedClasses,
      teacherId,
      teacherName,
      teacherPhone,
    })
  } catch (err: any) {
    return res.status(500).json({ error: 'Error de servidor', detail: err.message })
  }
}
