import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchAirtableRecord } from '@/lib/airtable'
import type { Session } from '@/types'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { id } = req.query as { id?: string }
  if (!id) return res.status(400).json({ error: 'id es requerido' })

  try {
    const record = await fetchAirtableRecord('Sessions', id)
    if (!record) return res.status(404).json({ error: 'Sesión no encontrada' })

    // Session Participants is a junction table — resolve the actual Student ID
    const participantId = (record.fields['Session Participants'] as string[])?.[0]
    let studentId = ''
    if (participantId) {
      const participant = await fetchAirtableRecord('Session Participants', participantId)
      studentId = (participant?.fields['Student'] as string[])?.[0] ?? ''
    }

    const teacherId = (record.fields['Teacher'] as string[])?.[0] ?? ''

    // Get teacher personal link if session link is empty
    let meetingLink = (record.fields['Location/Link'] as string) ?? ''
    if (!meetingLink && teacherId) {
      const teacher = await fetchAirtableRecord('Teachers', teacherId)
      meetingLink = (teacher?.fields['Meeting Link'] as string) ?? ''
    }

    const session = {
      id: record.id,
      teacherId,
      studentId,
      participantId: participantId ?? '',
      topicId: (record.fields['Curriculum Topic'] as string[])?.[0] ?? null,
      date: record.fields['Scheduled Date/Time']
        ? new Date(record.fields['Scheduled Date/Time']).toISOString().slice(0, 10)
        : '',
      time: record.fields['Scheduled Date/Time']
        ? new Date(record.fields['Scheduled Date/Time']).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '',
      status: record.fields['Status'] as string,
      sessionName: record.fields['Session Name'] as string ?? '',
      meetingLink,
    }

    return res.status(200).json(session)
  } catch {
    return res.status(500).json({ error: 'Error al obtener sesión' })
  }
}
