import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchFromAirtable } from '@/lib/airtable'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const status = {
    env: {
      hasAirtableKey: !!process.env.AIRTABLE_API_KEY,
      hasAirtableBase: !!process.env.AIRTABLE_BASE_ID,
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      hasEvolutionUrl: !!process.env.EVOLUTION_API_URL,
      nodeVersion: process.version,
    },
    airtableConnection: 'Unknown',
    databaseMode: 'Mock JSON File',
    error: null as string | null
  }

  if (process.env.AIRTABLE_API_KEY && process.env.AIRTABLE_BASE_ID) {
    status.databaseMode = 'Production Airtable API'
    try {
      // Intentar una consulta simple a Curriculum Topics para verificar conectividad real
      const res = await fetch(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Curriculum%20Topics?maxRecords=1`, {
        headers: { Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}` }
      })
      if (res.ok) {
        status.airtableConnection = 'Success (Connected to Airtable Base)'
      } else {
        const errText = await res.text()
        status.airtableConnection = 'Failed (Airtable API returned error)'
        status.error = errText
      }
    } catch (e: any) {
      status.airtableConnection = 'Failed (Network error)'
      status.error = e.message
    }
  } else {
    status.airtableConnection = 'Not Attempted (Using Mock Store)'
  }

  const isConfiguredCorrectly = status.env.hasAirtableKey && status.env.hasAirtableBase && status.airtableConnection.includes('Success')

  return res.status(isConfiguredCorrectly ? 200 : 500).json({
    status: isConfiguredCorrectly ? 'GREEN' : 'RED_WARNING',
    ...status
  })
}
