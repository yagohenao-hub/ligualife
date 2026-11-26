import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchAirtableRecord } from '@/lib/airtable'
import { supabase } from '@/lib/supabaseClient'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { teacherId } = req.query as { teacherId?: string }
  if (!teacherId) return res.status(400).json({ error: 'teacherId es requerido' })

  try {
    const teacher = await fetchAirtableRecord('Teachers', teacherId)
    if (!teacher) return res.status(404).json({ error: 'Teacher not found' })

    const rawAvail = teacher.fields['Availability'] as string | null
    let availability: boolean[][] = []
    if (rawAvail) {
      try { availability = JSON.parse(rawAvail) } catch { availability = [] }
    }

    // Fetch already booked future sessions for this teacher to prevent double-booking
    const nowThreshold = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { data: bookedRows } = await supabase
      .from('sessions')
      .select('id, "Scheduled Date/Time", "Is Holiday"')
      .eq('Teacher', teacherId)
      .eq('Status', 'Scheduled')
      .gte('Scheduled Date/Time', nowThreshold)

    const bookedDates = (bookedRows || [])
      .filter((r: any) => !(r['Is Holiday'] === true || String(r['Is Holiday']).toLowerCase() === 'true'))
      .map((r: any) => r['Scheduled Date/Time'])
      .filter(Boolean)

    return res.status(200).json({ availability, bookedDates })
  } catch (err: any) {
    return res.status(500).json({ error: 'Error', detail: err.message })
  }
}
