import type { NextApiRequest, NextApiResponse } from 'next'

const BASE_ID = process.env.AIRTABLE_BASE_ID ?? 'app9ZtojlxX5FoZ7y'
const TEACHERS_TABLE = 'tblqGY8vCmsFeld7G'
const STUDENTS_TABLE = 'tblqzaBBn18txOyLu'
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' })
  
  try {
    // 1. Fetch Teachers (Active for shadowing, or just all for general distribution)
    const teachRes = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TEACHERS_TABLE}?fields[]=Availability`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` }
    })
    const teachData = await teachRes.json()

    // 2. Fetch Students (Pending for unmet demand shadowing)
    const studRes = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${STUDENTS_TABLE}?fields[]=Availability&filterByFormula={Status}='Pending'`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` }
    })
    const studData = await studRes.json()

    if (!teachRes.ok || !studRes.ok) throw new Error('Airtable Error')

    const HOURS_COUNT = 15
    const DAYS_COUNT = 7
    const teachersCover = Array.from({ length: HOURS_COUNT }, () => Array(DAYS_COUNT).fill(0))
    const studentDemand = Array.from({ length: HOURS_COUNT }, () => Array(DAYS_COUNT).fill(0))

    teachData.records?.forEach((rec: any) => {
      const g = parseGrid(rec.fields.Availability)
      if (g) increment(teachersCover, g)
    })

    studData.records?.forEach((rec: any) => {
      const g = parseGrid(rec.fields.Availability)
      if (g) increment(studentDemand, g)
    })

    return res.status(200).json({ teachersCover, studentDemand })
  } catch (error: any) {
    return res.status(500).json({ error: error.message })
  }
}

function parseGrid(s: string) {
  try { return JSON.parse(s) } 
  catch(e) { return null }
}

function increment(base: number[][], grid: boolean[][]) {
  for(let r=0; r<15; r++) {
    for(let c=0; c<7; c++) {
      if(grid[r]?.[c]) base[r][c] += 1
    }
  }
}
