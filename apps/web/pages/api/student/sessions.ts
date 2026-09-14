import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchFromAirtable, fetchAirtableRecord, findAirtableRecords } from '@/lib/airtable'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { studentId } = req.query as { studentId?: string }
  if (!studentId) return res.status(400).json({ error: 'studentId es requerido' })

  try {
    // 1. Get Student record to find linked Session Participant record IDs
    const student = await fetchAirtableRecord('Students', studentId)
    if (!student) return res.status(404).json({ error: 'Estudiante no encontrado' })

    // 2. Extract Session Participant IDs for this student directly
    let participantRecords = await findAirtableRecords('Session Participants', `FIND('${studentId}')`)
    if (!participantRecords || participantRecords.length === 0) {
      const rawParticipants = (student.fields['Session Participants'] as string[]) ?? []
      const validIds = rawParticipants.filter(id => typeof id === 'string' && !id.includes('|'))
      if (validIds.length > 0) {
        const participantsFormula = `OR(${validIds.map(id => `RECORD_ID()='${id}'`).join(',')})`
        const pRes = await fetchFromAirtable('Session Participants', `filterByFormula=${encodeURIComponent(participantsFormula)}`)
        participantRecords = pRes.records ?? []
      }
    }

    const sessionIds = (participantRecords ?? [])
      .map((r: any) => ((r.fields['Session'] as string[]) ?? [])[0] ?? (r.fields['SessionId'] as string))
      .filter(Boolean)

    // Construct studentProfile for caller
    const rawTokens = student.fields['Tokens de Reposición'] ?? student.fields['Tokens']
    const rawClasses = student.fields['ClassesRemaining'] ?? student.fields['Classes Remaining']
    const teacherId = Array.isArray(student.fields['Teacher']) ? student.fields['Teacher'][0] : (student.fields['Teacher'] as string | null)
    let teacherName: string | null = null

    if (teacherId) {
      try {
        const teacherRec = await fetchAirtableRecord('Teachers', teacherId)
        if (teacherRec) {
          teacherName = (teacherRec.fields['Name'] || teacherRec.fields['Full Name']) as string
        }
      } catch {}
    }

    const studentProfile = {
      id: student.id,
      name: (student.fields['Full Name'] || student.fields['Name'] || student.fields['FullName'] || 'Estudiante') as string,
      email: (student.fields['Email'] as string) || '',
      tokens: typeof rawTokens === 'number' ? rawTokens : (parseInt(rawTokens, 10) || 0),
      classesRemaining: typeof rawClasses === 'number' ? rawClasses : (parseInt(rawClasses, 10) || 16),
      teacherId,
      teacherName
    }

    if (sessionIds.length === 0) {
      return res.status(200).json({ upcomingSessions: [], completedSessions: [], totalTopics: 60, studentProfile })
    }

    // 3. Fetch all sessions for these session IDs directly and filter in memory
    const sessionRecords = await Promise.all(
      sessionIds.map(id => fetchAirtableRecord('Sessions', id))
    )
    const validSessions = sessionRecords.filter(Boolean)

    const completed = validSessions
      .filter((s: any) => s.fields['Status'] === 'Seen')
      .sort((a: any, b: any) => new Date(a.fields['Scheduled Date/Time'] || 0).getTime() - new Date(b.fields['Scheduled Date/Time'] || 0).getTime())

    const upcoming = validSessions
      .filter((s: any) => s.fields['Status'] === 'Scheduled' || (s.fields['Status'] === 'Canceled' && s.fields['Is Holiday']))
      .sort((a: any, b: any) => new Date(a.fields['Scheduled Date/Time'] || 0).getTime() - new Date(b.fields['Scheduled Date/Time'] || 0).getTime())

    // Resolve topic details for sessions
    const resolveTopics = async (records: any[], isUpcoming = false) => {
      return Promise.all(records.map(async (r) => {
        const topicId = ((r.fields['Curriculum Topic'] as string[]) ?? [])[0] ?? null
        let topicName: string | null = null
        let cachedSlides: any[] | null = null
        let topicOrder: number | null = null
        
        if (topicId) {
          const topic = await fetchAirtableRecord('Curriculum Topics', topicId)
          topicOrder = topic?.fields?.['Order'] as number ?? null
          topicName = (topic?.fields?.['Topic Name'] || topic?.fields?.['Title']) as string ?? null

          if (!isUpcoming) {
            const rawCache = (topic?.fields?.['Cached Slides'] || topic?.fields?.['fldiMYojT06KFHPBj']) as string | undefined
            if (rawCache) {
              try { cachedSlides = JSON.parse(rawCache) } catch (e) {}
            }
            // Si el tema no tiene diapositivas precargadas en DB, generar slides interactivas estructuradas
            if (!cachedSlides && topic) {
              const formula = (topic.fields?.['LDS_Formula'] || topic.fields?.['LDSFormula'] || 'Subject + Time Word + Action') as string
              const context = (topic.fields?.['AI_Context'] || topic.fields?.['AIContext'] || 'Práctica conversacional y fluidez') as string
              const title = topicName || `Clase ${topicOrder || ''}`

              cachedSlides = [
                {
                  title: `🎯 ${title} — Concepto Clave`,
                  content: `<p>Bienvenido al material de <b>${title}</b>. En esta lección trabajamos la estructura del inglés natural:</p><p style="padding: 10px; background: rgba(124, 58, 237, 0.1); border-left: 4px solid #7c3aed; border-radius: 4px;"><b>Patrón Mental:</b> ${formula}</p>`
                },
                {
                  title: `⚡ Aplicación Práctica`,
                  content: `<p><b>Enfoque comunicativo:</b> ${context}</p><ul><li>Usa la <i>Palabra de Tiempo</i> correcta para situar el momento de la acción.</li><li>Mantén la estructura limpia sin traducciones literales desde el español.</li></ul>`
                },
                {
                  title: `🚀 Reto de Dominio`,
                  content: `<p>Practica armando 2 oraciones en voz alta o escríbeselas a tu <b>Pocket Coach</b> en WhatsApp para recibir feedback inmediato.</p>`
                }
              ]
            }
          }
        }

        return {
          id: r.id,
          date: r.fields['Scheduled Date/Time'],
          status: r.fields['Status'],
          topicId: topicId,
          topicOrder: topicOrder,
          topicName: topicName,
          cachedSlides: cachedSlides,
          isHoliday: !!r.fields['Is Holiday'],
          holidayConfirmedTeacher: !!r.fields['Holiday Confirmed (Teacher)'],
          holidayConfirmedStudent: !!r.fields['Holiday Confirmed (Student)']
        }
      }))
    }

    let [upcomingSessions, completedSessions] = await Promise.all([
      resolveTopics(upcoming, true),
      resolveTopics(completed, false),
    ])

    // ── Alumnos Antiguos: Habilitar los 60 temas completados con slides ──────
    const SENIOR_STUDENT_IDS = [
      '04ded1af-37a7-49ee-a976-307ee9509fa9', // Laura
      '27454176-ebd0-4628-8e4d-36fd262f54c5', // Paulina Uribe Giraldo
      '5f4e7cb9-050f-4c97-b53e-d6de66a9e9b0', // Romario
      '7c5250a8-c0a6-463b-8897-5471aa6dc721', // Yuliana Higuita Osorio
      'a16d8bc8-68d1-4d86-bc04-22388287ffb6', // Beatriz Orozco
      'ae949b77-bc5e-4e8e-aa14-5da184f9b551', // Lucia uribe giraldo
      'd1c9de5a-a225-4b2c-8ab6-7283dd6e0ecc', // Cristina Zabala
      'd9782e46-fbd3-4dc5-8f1b-12872550309b', // Nicolas Iván Polo Lara
      'f8227ed6-8e8a-4694-a70b-d1de3301734a', // Santiago (Santi.mon)
      'eaa81235-349d-410e-8860-1b536cd8b2f7', // Sebastian Vélez
      'recStudent1'                           // Mock / ID de prueba
    ]

    const isSeniorStudent = SENIOR_STUDENT_IDS.includes(studentId) || (student.fields['Notes'] || '').includes('SENIOR_STUDENT')

    if (isSeniorStudent) {
      try {
        const allTopics = await findAirtableRecords('Curriculum Topics', "NOT({Order} = '')")
        const generalTopics = allTopics
          .filter((t: any) => ((t.fields['Curriculum'] || '') as string).includes('General English Course'))
          .sort((a: any, b: any) => parseInt(a.fields['Order'] || '0', 10) - parseInt(b.fields['Order'] || '0', 10))

        if (generalTopics.length > 0) {
          completedSessions = generalTopics.map((t: any) => {
            let slides: any[] | null = null
            try {
              if (t.fields['Cached Slides']) slides = JSON.parse(t.fields['Cached Slides'])
            } catch {}

            return {
              id: `senior-${t.id}`,
              date: new Date().toISOString(),
              status: 'Seen',
              topicId: t.id,
              topicOrder: parseInt(t.fields['Order'] || '0', 10),
              topicName: t.fields['Topic Name'] || t.fields['Title'] || `Tema ${t.fields['Order']}`,
              cachedSlides: slides,
              isHoliday: false,
              holidayConfirmedTeacher: false,
              holidayConfirmedStudent: false
            }
          })
        }
      } catch (e) {
        console.error('Error inyectando temas antiguos:', e)
      }
    }

    // ── Parsear progreso de platinado desde Notes del estudiante ─────────────
    let masteryMap: Record<number, { tier: number; lastTrainedAt: string }> = {}
    const notesStr = (student.fields['Notes'] as string) || ''
    const marker = '=== MASTERY_PROGRESS_JSON ==='
    if (notesStr.includes(marker)) {
      try {
        masteryMap = JSON.parse(notesStr.split(marker)[1].trim())
      } catch {}
    }

    // ── Total topics in the database (General English Course: 60 temas) ─────
    let totalTopics = 60
    try {
      const curTopics = await findAirtableRecords('Curriculum Topics', `FIND('General English Course', {Curriculum}) > 0`)
      if (curTopics && curTopics.length > 0) {
        totalTopics = curTopics.length
      }
    } catch {}

    return res.status(200).json({ 
      upcomingSessions, 
      completedSessions,
      totalTopics,
      studentProfile,
      masteryMap
    })
  } catch (err: any) {
    return res.status(500).json({ error: 'Error al cargar sesiones', detail: err.message })
  }
}
