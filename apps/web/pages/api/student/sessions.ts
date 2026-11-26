import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchFromAirtable, fetchAirtableRecord } from '@/lib/airtable'
import { supabase } from '@/lib/supabaseClient'
import { getTopicSummary } from '@/lib/curriculum-summary'

const parseBool = (val: any): boolean => val === true || String(val).toLowerCase() === 'true'

const WEEKDAY_MAP: Record<number, string> = {
  0: 'Dom', 1: 'Lun', 2: 'Mar', 3: 'Mie', 4: 'Jue', 5: 'Vie', 6: 'Sab'
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { studentId } = req.query as { studentId?: string }
  if (!studentId) return res.status(400).json({ error: 'studentId es requerido' })

  try {
    // 1. Get Student record
    const student = await fetchAirtableRecord('Students', studentId)
    if (!student) return res.status(404).json({ error: 'Estudiante no encontrado' })

    // 2. Extract Session Participant records directly from Supabase (supports group IDs)
    const { data: spRows } = await supabase
      .from('session_participants')
      .select('id, "Session", "Student"')
      .ilike('Student', `%${studentId}%`)

    const sessionIds = Array.from(
      new Set((spRows || []).map((r: any) => r.Session).filter(Boolean))
    ) as string[]

    const rawTokens = student.fields['Tokens de Reposición'] ?? student.fields['Tokens'] ?? 0
    const parsedTokens = parseInt(String(rawTokens), 10)
    const rawClasses = student.fields['Classes Remaining'] ?? student.fields['ClassesRemaining']
    const parsedRawClasses = rawClasses !== undefined && rawClasses !== null && rawClasses !== ''
      ? parseInt(String(rawClasses), 10)
      : NaN

    let teacherId = Array.isArray(student.fields['Teacher']) ? student.fields['Teacher'][0] : (student.fields['Teacher'] as string | null)
    let teacherName: string | null = null
    let recurrenceDay: string | null = null
    let recurrenceTime: string | null = null

    try {
      const { data: stLinks } = await supabase
        .from('student_teacher')
        .select('*')
        .ilike('Student', `%${student.id}%`)
        .order('created_at', { ascending: false })

      const activeLink = (stLinks || []).find((r: any) => r.Status === 'Active') || stLinks?.[0]
      if (activeLink) {
        if (!teacherId && activeLink.Teacher) {
          teacherId = String(activeLink.Teacher).split(',')[0].trim()
        }
        recurrenceDay = activeLink['Recurrence Day'] || null
        recurrenceTime = activeLink['Recurrence Time'] || null
      }
    } catch (e) {
      console.warn('Error fetching student_teacher:', e)
    }

    if (teacherId) {
      try {
        const teacherRec = await fetchAirtableRecord('Teachers', teacherId)
        if (teacherRec) {
          teacherName = (teacherRec.fields['Name'] || teacherRec.fields['Full Name']) as string
        }
      } catch {}
    }

    const studentProfile: {
      id: string
      name: string
      email: string
      tokens: number
      classesRemaining: number
      teacherId: string | null
      teacherName: string | null
      recurrenceDay: string | null
      recurrenceTime: string | null
    } = {
      id: student.id,
      name: (student.fields['Full Name'] || student.fields['Name'] || student.fields['FullName'] || 'Estudiante') as string,
      email: (student.fields['Email'] as string) || '',
      tokens: isNaN(parsedTokens) ? 0 : parsedTokens,
      classesRemaining: isNaN(parsedRawClasses) ? 0 : Math.max(0, parsedRawClasses),
      teacherId,
      teacherName,
      recurrenceDay,
      recurrenceTime
    }

    // ── Alumnos Antiguos: Habilitar los 60 temas completados con slides ──────
    const SENIOR_STUDENT_IDS = [
      '04ded1af-37a7-49ee-a976-307ee9509fa9', // Laura
      'c8246f59-ab69-4b8c-9504-87f0db6cf8c5', // Laura Arango
      'd6545978-df2d-4991-8899-ebd53bbd22d9', // Andrés Restrepo Morales
      '27454176-ebd0-4628-8e4d-36fd262f54c5', // Paulina Uribe Giraldo
      '5f4e7cb9-050f-4c97-b53e-d6de66a9e9b0', // Romario
      '7c5250a8-c0a6-463b-8897-5471aa6dc721', // Yuliana Higuita Osorio
      'a16d8bc8-68d1-4d86-bc04-22388287ffb6', // Beatriz Orozco
      'ae949b77-bc5e-4e8e-aa14-5da184f9b551', // Lucia uribe giraldo
      'd1c9de5a-a225-4b2c-8ab6-7283dd6e0ecc', // Cristina Zabala
      'd9782e46-fbd3-4dc5-8f1b-12872550309b', // Nicolas Iván Polo Lara
      'f8227ed6-8e8a-4694-a70b-d1de3301734a', // Santiago
      'b1068664-4e67-4070-a564-8ac8a1f629bb', // Santiago Montes
      'eaa81235-349d-410e-8860-1b536cd8b2f7', // Sebastian Vélez
      '34dcce09-3593-497c-8366-cdd9c4d6385e', // Santiago Martinez
      '2ce10e96-f820-42ca-b30b-3ba99061c260', // Jose Yepes
      'bb02d2cb-710e-4bea-b657-099bb0bb211b', // Isabela Restrepo
      'recStudent1'                           // Mock / ID de prueba
    ]

    const isSeniorStudent = SENIOR_STUDENT_IDS.includes(studentId) || (student.fields['Notes'] || '').includes('SENIOR_STUDENT')

    if (sessionIds.length === 0 && !isSeniorStudent) {
      return res.status(200).json({ upcomingSessions: [], completedSessions: [], totalTopics: 60, studentProfile, masteryMap: {} })
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

    // Resolve topic details for sessions (supports DB IDs + 'recTopicN' / numeric Order fallback)
    const resolveTopics = async (records: any[], isUpcoming = false) => {
      return Promise.all(records.map(async (r) => {
        const topicId = ((r.fields['Curriculum Topic'] as string[]) ?? [])[0] ?? null
        let topicName: string | null = null
        let cachedSlides: any[] | null = null
        let topicOrder: number | null = null
        let topic: any = null

        if (topicId) {
          topic = await fetchAirtableRecord('Curriculum Topics', topicId)
          if (topic) {
            const rawOrd = topic.fields?.['Order']
            const parsedOrd = rawOrd !== undefined && rawOrd !== null ? parseInt(String(rawOrd), 10) : NaN
            topicOrder = isNaN(parsedOrd) ? null : parsedOrd
            topicName = (topic.fields?.['Topic Name'] || topic.fields?.['Title']) as string ?? null
          } else {
            // Fallback for legacy IDs such as 'recTopic7' or session names like 'Tema 7'
            const idNumMatch = String(topicId).match(/(\d+)$/)
            const nameNumMatch = String(r.fields['Session Name'] || '').match(/(?:Tema|Topic)\s*(\d+)/i)
            const inferredOrder = idNumMatch ? parseInt(idNumMatch[1], 10) : (nameNumMatch ? parseInt(nameNumMatch[1], 10) : null)
            if (inferredOrder && !isNaN(inferredOrder)) {
              topicOrder = inferredOrder
            }
          }
        }

        const localSummary = topicOrder ? getTopicSummary(topicOrder, topicName || undefined) : null
        if (!topicName && localSummary) {
          topicName = localSummary.title
        }

        if (!isUpcoming && (topic || localSummary)) {
          const rawCache = (topic?.fields?.['Cached Slides'] || topic?.fields?.['fldiMYojT06KFHPBj']) as string | undefined
          if (rawCache) {
            try { cachedSlides = JSON.parse(rawCache) } catch {}
          }
          if (!cachedSlides) {
            const formula = (topic?.fields?.['LDS_Formula'] || topic?.fields?.['LDSFormula'] || localSummary?.correctMethod || 'Subject + Time Word + Action') as string
            const context = (topic?.fields?.['AI_Context'] || topic?.fields?.['AIContext'] || localSummary?.concept || 'Práctica conversacional y fluidez') as string
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

        return {
          id: r.id,
          date: r.fields['Scheduled Date/Time'],
          status: r.fields['Status'],
          topicId: topicId,
          topicOrder: topicOrder,
          topicName: topicName,
          cachedSlides: cachedSlides,
          isHoliday: parseBool(r.fields['Is Holiday']),
          holidayConfirmedTeacher: parseBool(r.fields['Holiday Confirmed (Teacher)']),
          holidayConfirmedStudent: parseBool(r.fields['Holiday Confirmed (Student)'])
        }
      }))
    }

    let [upcomingSessions, completedSessions] = await Promise.all([
      resolveTopics(upcoming, true),
      resolveTopics(completed, false),
    ])

    // Sync classesRemaining & infer recurrenceDay/Time from active non-holiday scheduled sessions when missing
    const activeUpcoming = upcomingSessions.filter(s => s.status === 'Scheduled' && !s.isHoliday)
    if (activeUpcoming.length > 0) {
      studentProfile.classesRemaining = activeUpcoming.length

      if (!studentProfile.recurrenceDay) {
        const dayNames: string[] = []
        for (const s of activeUpcoming) {
          if (!s.date) continue
          const d = new Date(s.date)
          const bogotaStr = d.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'America/Bogota' })
          const mapEn: Record<string, string> = { Sun: 'Dom', Mon: 'Lun', Tue: 'Mar', Wed: 'Mie', Thu: 'Jue', Fri: 'Vie', Sat: 'Sab' }
          const esDay = mapEn[bogotaStr] || WEEKDAY_MAP[d.getDay()]
          if (esDay && !dayNames.includes(esDay)) dayNames.push(esDay)
        }
        if (dayNames.length > 0) studentProfile.recurrenceDay = dayNames.slice(0, 3).join(',')
      }

      if (!studentProfile.recurrenceTime && activeUpcoming[0]?.date) {
        studentProfile.recurrenceTime = new Date(activeUpcoming[0].date).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
          timeZone: 'America/Bogota'
        })
      }
    }

    if (isSeniorStudent) {
      // Los alumnos antiguos que ya cursaron todo el temario ven sus próximas clases como sesiones de práctica
      upcomingSessions = upcomingSessions.map(s => ({
        ...s,
        topicOrder: null,
        topicId: null as any,
        topicName: 'Sesión de práctica conversacional'
      }))

      try {
        const topicsRes = await fetchFromAirtable('Curriculum Topics', '')
        const allTopics = topicsRes.records || []
        const generalTopics = allTopics
          .filter((t: any) => ((t.fields['Curriculum'] || '') as string).includes('General English Course'))
          .sort((a: any, b: any) => parseInt(String(a.fields['Order'] || '0'), 10) - parseInt(String(b.fields['Order'] || '0'), 10))

        if (generalTopics.length > 0) {
          completedSessions = generalTopics.map((t: any) => {
            let slides: any[] | null = null
            try {
              if (t.fields['Cached Slides']) slides = JSON.parse(t.fields['Cached Slides'])
            } catch {}

            const rawOrder = parseInt(String(t.fields['Order'] || '0'), 10)
            const rawTitle = t.fields['Topic Name'] || t.fields['Title'] || `Tema ${t.fields['Order']}`

            return {
              id: `senior-${t.id}`,
              date: new Date().toISOString(),
              status: 'Seen',
              topicId: t.id,
              topicOrder: rawOrder,
              topicName: rawTitle,
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

    // ── Parsear progreso de platinado (dual-read: student_topic_progress + Notes fallback) ─────────────
    let masteryMap: Record<number, { tier: number; tierName?: string; streak?: number; lastTrainedAt: string }> = {}
    const notesStr = (student.fields['Notes'] as string) || ''
    const marker = '=== MASTERY_PROGRESS_JSON ==='
    if (notesStr.includes(marker)) {
      try {
        const afterMarker = notesStr.split(marker)[1]
        const jsonSegment = afterMarker.split('\n=== ')[0].trim()
        masteryMap = JSON.parse(jsonSegment)
      } catch {}
    }

    try {
      const { data: dbProgress } = await supabase
        .from('student_topic_progress')
        .select('*')
        .eq('Student', student.id)

        const TIER_MAP: Record<string, number> = {
          'Bronze': 1,
          'Silver': 2,
          'Gold': 3,
          'Diamond': 4,
          'Platinum': 5
        }
        const TIER_NAMES_REV: Record<number, string> = {
          1: 'Bronze',
          2: 'Silver',
          3: 'Gold',
          4: 'Diamond',
          5: 'Platinum'
        }
        for (const row of (dbProgress || [])) {
          const tNum = parseInt(row['Curriculum Topic'], 10)
          if (!isNaN(tNum)) {
            const status = row['Status'] || ''
            const calculatedTier = TIER_MAP[status] || 0
            let notesObj: any = {}
            try {
              notesObj = row['Notes'] ? JSON.parse(row['Notes']) : {}
            } catch {}

            const existing = masteryMap[tNum]
            const highestTier = Math.max(calculatedTier, notesObj.tier || 0, existing?.tier || 0)
            const highestStreak = Math.max(notesObj.streak || 0, existing?.streak || 0)
            const resolvedTierName = TIER_NAMES_REV[highestTier] || status || existing?.tierName || 'Unranked'

            masteryMap[tNum] = {
              tier: highestTier,
              tierName: resolvedTierName,
              streak: highestStreak,
              lastTrainedAt: row['Completed At'] || row['created_at'] || existing?.lastTrainedAt || ''
            }
          }
        }
    } catch (dbErr) {
      console.warn('Error leyendo student_topic_progress:', dbErr)
    }

    // ── Total topics oficial (General English Course: 60 temas) ─────────
    const totalTopics = 60

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
