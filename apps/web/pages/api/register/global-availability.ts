import type { NextApiRequest, NextApiResponse } from 'next'

const BASE_ID = process.env.AIRTABLE_BASE_ID ?? 'app9ZtojlxX5FoZ7y'
const TEACHERS_TABLE = 'tblqGY8vCmsFeld7G'
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' })
  
  try {
    const response = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TEACHERS_TABLE}?fields[]=Availability`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`
      }
    })

    const data = await response.json()
    if (!response.ok) {
      return res.status(500).json({ error: 'Failed to fetch teachers' })
    }

    const HOURS_COUNT = 15 // 6am to 8pm
    const DAYS_COUNT = 7
    const globalAvail = Array.from({ length: HOURS_COUNT }, () => Array(DAYS_COUNT).fill(false))

    data.records.forEach((record: any) => {
      const availStr = record.fields.Availability
      if (availStr) {
        try {
          const grid = JSON.parse(availStr)
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
