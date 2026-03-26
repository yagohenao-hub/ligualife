import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchFromAirtable } from '@/lib/airtable'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { pin } = req.body as { pin?: string }
  if (!pin) {
    return res.status(400).json({ error: 'pin es requerido' })
  }

  try {
    const formula = `{PIN} = '${pin}'`
    const data = await fetchFromAirtable('Teachers', `filterByFormula=${encodeURIComponent(formula)}`)

    if (!data.records || data.records.length === 0) {
      return res.status(401).json({ error: 'PIN inválido' })
    }

    const record = data.records[0]
    return res.status(200).json({
      teacherId: record.id,
      name: (record.fields['Name'] ?? record.fields['Full Name'] ?? '') as string,
    })
  } catch {
    return res.status(500).json({ error: 'Error al validar PIN' })
  }
}
