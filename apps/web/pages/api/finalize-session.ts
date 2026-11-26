import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchAirtableRecord, patchAirtableRecord, findAirtableRecords, createAirtableRecord } from '@/lib/airtable'
import { EvolutionAPI } from '@/lib/evolution'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { sessionId, studentId, participantId, notes, errorTags } = req.body

  if (!sessionId || !studentId) {
    return res.status(400).json({ error: 'sessionId y studentId son requeridos' })
  }

  try {
    // 1. Mark Session as Seen
    await patchAirtableRecord('Sessions', sessionId, {
      Status: 'Seen'
    })

    // 2. Deduct 1 credit from Classes Remaining safely
    const student = await fetchAirtableRecord('Students', studentId)
    if (student) {
      const rawRem = student.fields['Classes Remaining'] ?? student.fields['ClassesRemaining'] ?? 0
      const currentRemaining = parseInt(String(rawRem), 10) || 0
      const newRemaining = Math.max(0, currentRemaining - 1)
      await patchAirtableRecord('Students', studentId, {
        'Classes Remaining': newRemaining
      })

      // Avanzar el puntero de Current Topic al siguiente tema (Order + 1)
      const currentTopicId = ((student.fields['Current Topic'] as string[]) ?? [])[0]
        || (student.fields['Current Topic (Bot)'] as string | undefined)
      if (currentTopicId) {
        const currentTopicRec = await fetchAirtableRecord('Curriculum Topics', currentTopicId)
        if (currentTopicRec) {
          const currentOrder = parseInt(String(currentTopicRec.fields['Order'] ?? '1'), 10) || 1
          const nextTopics = await findAirtableRecords('Curriculum Topics', `{Order} = ${currentOrder + 1}`)
          if (nextTopics.length > 0) {
            await patchAirtableRecord('Students', studentId, {
              'Current Topic': [nextTopics[0].id]
            }).catch(err => console.error('Error al avanzar el Current Topic:', err))
          }
        }
      }

      // Enviar alerta de clases bajas
      if (newRemaining <= 2 && student.fields['Phone']) {
        const phone = student.fields['Phone'] as string
        const msg = `⚠️ ¡Hola ${student.fields['Full Name'] || student.fields['FullName'] || 'Estudiante'}! Te quedan ${newRemaining} clases en tu paquete de LinguaLife. Recuerda renovar pronto para no perder el ritmo. Comunícate con nosotros para más detalles.`
        await EvolutionAPI.sendText(phone, msg).catch(err => console.error('Error enviando alerta de clases bajas:', err))
      }
    }

    // 3. Update Participant notes
    if (participantId && notes) {
      await patchAirtableRecord('Session Participants', participantId, {
        'Teacher Observations': notes
      })
    }

    // 4. Register Error Patterns in Supabase
    if (errorTags && Array.isArray(errorTags) && errorTags.length > 0) {
      for (const tag of errorTags) {
        await createAirtableRecord('Error Patterns', {
          'Error Pattern': tag,
          'Category': 'Class Observation',
          'Active?': 'true',
          'Session Participants': participantId || '',
          'Description': `Student: ${studentId} | Session: ${sessionId} | ${new Date().toISOString()}`
        }).catch(err => console.error('Failed to create Error Pattern:', err))
      }
    }

    return res.status(200).json({ success: true })
  } catch (err: any) {
    console.error('Finalize session error:', err)
    return res.status(500).json({ error: 'Error interno', detail: err.message })
  }
}
