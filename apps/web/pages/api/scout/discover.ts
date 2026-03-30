import type { NextApiRequest, NextApiResponse } from 'next'
import { discoverVideos } from '@/lib/scout'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { q, organic } = req.query as { q?: string, organic?: string }
  const isOrganic = organic === 'true'

  try {
    const { videos, debug } = await discoverVideos(q, isOrganic)
    return res.status(200).json({ videos, debug })
  } catch (err: any) {
    console.error('API Discovery Error:', err)
    return res.status(500).json({ 
      error: 'Error al descubrir videos', 
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
    })
  }
}
