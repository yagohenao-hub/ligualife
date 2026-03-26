import type { NextApiRequest, NextApiResponse } from 'next'

const BASE_ID = process.env.AIRTABLE_BASE_ID!
const API_KEY = process.env.AIRTABLE_API_KEY!

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { teacherId, availability } = req.body as {
    teacherId?: string
    availability?: string // JSON-serialized boolean[][] or a formatted string
  }

  if (!teacherId || availability === undefined) {
    return res.status(400).json({ error: 'teacherId y availability son requeridos' })
  }

  try {
    const url = `https://api.airtable.com/v0/${BASE_ID}/Teachers/${teacherId}`
    const patchRes = await fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          Availability: availability,
        },
      }),
    })

    if (!patchRes.ok) {
      const err = await patchRes.json()
      return res.status(patchRes.status).json({ error: 'Airtable error', detail: err })
    }

    return res.status(200).json({ ok: true })
  } catch (err: any) {
    return res.status(500).json({ error: 'Error al guardar disponibilidad', detail: err.message })
  }
}
