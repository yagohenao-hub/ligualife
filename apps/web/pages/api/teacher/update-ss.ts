import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchFromAirtable, patchAirtableRecord } from '@/lib/airtable'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { teacherId, ssDocumentUrl, ssExpiryDate } = req.body

  if (!teacherId) {
    return res.status(400).json({ error: 'teacherId es requerido' })
  }

  if (!ssDocumentUrl && !ssExpiryDate) {
    return res.status(400).json({ error: 'Se requiere al menos ssDocumentUrl o ssExpiryDate' })
  }

  try {
    const fields: Record<string, any> = {}

    if (ssDocumentUrl) {
      fields['SS Document URL'] = ssDocumentUrl
    }

    if (ssExpiryDate) {
      // ssExpiryDate should be 'YYYY-MM-DD'
      fields['SS Expiry Date'] = ssExpiryDate
    }

    // Always record when it was last updated
    fields['SS Last Updated'] = new Date().toISOString().split('T')[0]

    await patchAirtableRecord('Teachers', teacherId, fields)

    return res.status(200).json({ ok: true, message: 'Seguridad Social actualizada correctamente' })
  } catch (err: any) {
    console.error('[update-ss] Error:', err.message)
    return res.status(500).json({ error: 'No se pudo actualizar la Seguridad Social', detail: err.message })
  }
}
