import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchAirtableRecord, patchAirtableRecord } from '@/lib/airtable'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { sessionId, role } = req.body as { sessionId?: string, role?: 'teacher' | 'student' }
  if (!sessionId || !role) return res.status(400).json({ error: 'Faltan parámetros' })

  try {
    const session = await fetchAirtableRecord('Sessions', sessionId)
    if (!session) return res.status(404).json({ error: 'Session not found' })

    const update: any = {}
    if (role === 'teacher') {
      update['Holiday Confirmed (Teacher)'] = true
    } else {
      update['Holiday Confirmed (Student)'] = true
    }

    // Determine current states
    let teacherConfirmed = role === 'teacher' ? true : !!session.fields['Holiday Confirmed (Teacher)']
    let studentConfirmed = role === 'student' ? true : !!session.fields['Holiday Confirmed (Student)']

    // Check group type (Private Group logic: 1 student enough)
    let isPrivateGroup = false
    const groupIds = (session.fields['Study Group'] as string[]) || []
    if (groupIds[0]) {
      const group = await fetchAirtableRecord('Study Groups', groupIds[0])
      if (group?.fields?.['Group Type'] === 'Private Group') {
        isPrivateGroup = true
      }
    }

    // If both confirmed (for groups, 1 student is enough which is true since we have 1 flag), 
    // and it was a holiday, set to Scheduled
    // NOTE: For Private Groups, the logic "one student confirms for all" 
    // is already naturally handled because there is only ONE 'Holiday Confirmed (Student)' field in the Session record.
    if (teacherConfirmed && studentConfirmed && !!session.fields['Is Holiday']) {
      update['Status'] = 'Scheduled'
    }

    await patchAirtableRecord('Sessions', sessionId, update)

    return res.status(200).json({ ok: true, teacherConfirmed, studentConfirmed })
  } catch (err: any) {
    return res.status(500).json({ error: 'Error', detail: err.message })
  }
}
