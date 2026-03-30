import type { NextApiRequest, NextApiResponse } from 'next'
import { createAirtableRecord } from '@/lib/airtable'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const video = req.body 

  try {
    // STRICT SYNC with Airtable current schema
    const record = await createAirtableRecord('Video Bank', {
      'Title': video.title,
      'YouTube URL': video.url,
      'Thumbnail': video.thumbnail,
      // Match the new Easy/Medium/Hard UI
      'Level': video.level || 'Medium',
      // Default to General
      'Vertical': video.vertical || 'General',
      // 'Draft' is the only option in DB
      'Status': 'Draft'
    })
    
    return res.status(200).json({ ok: true, id: record.id })
  } catch (err: any) {
    console.error('Save error detailed:', err)
    return res.status(500).json({ 
      error: 'Error saving to Airtable', 
      detail: err.message
    })
  }
}
