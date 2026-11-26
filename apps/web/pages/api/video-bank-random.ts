import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchFromAirtable } from '@/lib/airtable'

// Fetches random videos from the Video Bank in Supabase (via database adapter).
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { level, limit = 5 } = req.query

  try {
    const data = await fetchFromAirtable('Video Bank', '')
    let records = (data.records || []).filter((r: any) => !r.fields?.Status || r.fields.Status === 'Active')

    if (level && typeof level === 'string') {
      const cefr = level.charAt(0).toUpperCase()
      const byLevel = records.filter((r: any) => String(r.fields?.Level || '').toUpperCase().includes(cefr))
      if (byLevel.length > 0) records = byLevel
    }

    const shuffled = [...records].sort(() => 0.5 - Math.random())
    const selected = shuffled.slice(0, Number(limit) || 5).map((r: any) => ({
      id: r.id,
      title: r.fields?.Title || 'Video LinguaLife',
      url: r.fields?.['YouTube URL'] || '',
      level: r.fields?.Level || ''
    })).filter((v: any) => v.url)

    return res.status(200).json({ videos: selected })
  } catch (err: any) {
    console.error('Video Bank Random API Error:', err)
    return res.status(500).json({ error: 'Falla al cargar Video Bank', details: err.message })
  }
}
