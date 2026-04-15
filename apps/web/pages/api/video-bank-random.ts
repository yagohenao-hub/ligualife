import type { NextApiRequest, NextApiResponse } from 'next'

// Fetches random videos from the Video Bank in Airtable.
// Base: app9ZtojlxX5FoZ7y (LinguaLife Academia)
// Table: tbliO1eKPR3KObP95 (Video Bank)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { level, limit = 5 } = req.query
  const baseId = process.env.AIRTABLE_BASE_ID ?? 'app9ZtojlxX5FoZ7y'
  const tableId = process.env.AIRTABLE_VIDEO_BANK_TABLE ?? 'tbliO1eKPR3KObP95'
  const apiKey = process.env.AIRTABLE_API_KEY

  if (!apiKey) return res.status(500).json({ error: 'Missing Airtable API Key in environment' })

  try {
    // We fetch a larger batch and pick random ones for better variety.
    // Filtering by student level if possible.
    let url = `https://api.airtable.com/v0/${baseId}/${tableId}?pageSize=100&fields[]=YouTube URL&fields[]=Title&fields[]=Level`
    
    // Simple filter logic for CEFR levels if provided
    if (level && typeof level === 'string') {
        const cefr = level.charAt(0).toUpperCase() // e.g. "B" from "B1" or "M" from "Medium"
        url += `&filterByFormula=SEARCH("${cefr}", {Level})`
    }
    
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` }
    })
    const data = await response.json()

    if (!response.ok) throw new Error(data.error?.message || 'Airtable Error')

    const records = data.records || []
    
    // Pick N random videos
    const shuffled = [...records].sort(() => 0.5 - Math.random())
    const selected = shuffled.slice(0, Number(limit)).map((r: any) => ({
      id: r.id,
      title: r.fields.Title,
      url: r.fields['YouTube URL'],
      level: r.fields.Level
    }))

    return res.status(200).json({ videos: selected })
  } catch (err: any) {
    console.error('Video Bank Random API Error:', err)
    return res.status(500).json({ error: 'Falla al cargar Video Bank', details: err.message })
  }
}
