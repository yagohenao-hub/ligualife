import type { NextApiRequest, NextApiResponse } from 'next'
import { findAirtableRecords } from '@/lib/airtable'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' })
  
  try {
    const teachers = await findAirtableRecords('Teachers', '1=1')

    const HOURS_COUNT = 15 // 6am to 8pm
    const DAYS_COUNT = 7
    const globalAvail = Array.from({ length: HOURS_COUNT }, () => Array(DAYS_COUNT).fill(false))

    teachers.forEach((record: any) => {
      const availStr = record.fields?.Availability || record.fields?.['fld7vSUdd69zdl6yQ']
      if (availStr) {
        try {
          const grid = typeof availStr === 'string' ? JSON.parse(availStr) : availStr
          for (let r = 0; r < HOURS_COUNT; r++) {
            for (let c = 0; c < DAYS_COUNT; c++) {
              if (grid[r]?.[c]) globalAvail[r][c] = true
            }
          }
        } catch (e) {
          console.error("Error parsing teacher availability", e)
        }
      }
    })

    return res.status(200).json(globalAvail)
  } catch (error: any) {
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}
