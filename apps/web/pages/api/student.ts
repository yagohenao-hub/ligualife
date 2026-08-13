import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchAirtableRecord } from '@/lib/airtable'
import type { Student } from '@/types'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { id } = req.query as { id?: string }
  if (!id) return res.status(400).json({ error: 'id es requerido' })

  try {
    const record = await fetchAirtableRecord('Students', id)
    if (!record) return res.status(404).json({ error: 'Estudiante no encontrado' })

    const notes = record.fields['Notes'] as string | undefined

    // Interests is a linked-record field — Airtable returns record IDs.
    // Resolve them to readable names from the Interests table.
    const rawInterests = (record.fields['Interests'] as string[]) ?? []
    let interestNames: string[] = []
    if (rawInterests.length > 0 && rawInterests[0].startsWith('rec')) {
      const resolved = await Promise.all(
        rawInterests.map(async (recId) => {
          try {
            const linked = await fetchAirtableRecord('Interests', recId)
            return (linked?.fields['Name'] as string) ?? recId
          } catch {
            return recId
          }
        })
      )
      interestNames = resolved
    } else {
      interestNames = rawInterests
    }
    let interests = interestNames.join(', ') || undefined

    // Fallback: parse interests from Notes field (format: "INTERESTS: val1, val2, ...")
    if (!interests && notes) {
      const match = notes.match(/INTERESTS:\s*(.+)/i)
      if (match) interests = match[1].trim()
    }

    const student: Student = {
      id: record.id,
      name: record.fields['Full Name'] as string,
      level: (record.fields['Level'] as string) || undefined,
      vertical: ((record.fields['Vertical (Lookup)'] as string[]) ?? [])[0] || undefined,
      notes,
      interests,
      progressIds: (record.fields['Student Topic Progress'] as string[]) ?? [],
    }

    return res.status(200).json(student)
  } catch {
    return res.status(500).json({ error: 'Error al obtener estudiante' })
  }
}
