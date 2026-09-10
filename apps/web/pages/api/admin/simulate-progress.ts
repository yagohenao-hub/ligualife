import type { NextApiRequest, NextApiResponse } from 'next'
import { 
  fetchAirtableRecord, 
  createAirtableRecord, 
  patchAirtableRecord, 
  findAirtableRecords,
  deleteAirtableRecord
} from '@/lib/airtable'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const adminToken = req.headers['x-admin-token'] || req.query.token
  const isDev = process.env.NODE_ENV !== 'production'
  
  if (!isDev && adminToken !== 'LinguaAdmin2025') {
    return res.status(401).json({ error: 'No autorizado. Requiere token de admin.' })
  }

  const { 
    studentId, 
    action = 'advance_one',
    classNumber,
    count = '24', 
    classesRemaining = '16',
    teacherId: reqTeacherId,
    topicId: reqTopicId,
    scheduledDate,
    sessionId
  } = (req.method === 'POST' ? req.body : req.query) as any

  if (!studentId && action !== 'cancel_session') {
    return res.status(400).json({ error: 'studentId es requerido' })
  }

  try {
    // 1. Fetch Student Data
    const student = studentId ? await fetchAirtableRecord('Students', studentId) : null
    if (studentId && !student) {
      return res.status(404).json({ error: 'Estudiante no encontrado' })
    }

    const studentName = student?.fields?.['FullName'] || student?.fields?.['Full Name'] || 'Estudiante de Prueba'
    const teacherId = reqTeacherId || student?.fields?.['Teacher']?.[0] || 'recTestnj8qdi'

    // 2. Fetch Curriculum Topics
    const curriculumTopics = await findAirtableRecords('Curriculum Topics', '1=1')
    curriculumTopics.sort((a, b) => {
      const orderA = (a.fields['Order'] as number) || 0
      const orderB = (b.fields['Order'] as number) || 0
      return orderA - orderB
    })

    if (curriculumTopics.length === 0) {
      return res.status(404).json({ error: 'No se encontraron temas en el currículo' })
    }

    const cleanupStudentSessions = async (sid: string) => {
      try {
        const participants = await findAirtableRecords('Session Participants', `FIND('${sid}')`)
        for (const p of (participants || [])) {
          const sessId = Array.isArray(p.fields['Session']) ? p.fields['Session'][0] : p.fields['Session']
          if (sessId) {
            await deleteAirtableRecord('Sessions', sessId).catch(() => {})
          }
          await deleteAirtableRecord('Session Participants', p.id).catch(() => {})
        }
      } catch (e) {
        console.warn('Error al limpiar sesiones de estudiante:', e)
      }
    }

    // ----------------------------------------------------
    // ACTION: ADVANCE ONE CLASS (Avanzar 1 en 1)
    // ----------------------------------------------------
    if (action === 'advance_one') {
      // Find existing participant records for this student to calculate completed count
      const allParticipants = await findAirtableRecords('Session Participants', '1=1')
      const studentParticipants = allParticipants.filter(p => {
        const sid = Array.isArray(p.fields['Student']) ? p.fields['Student'][0] : p.fields['Student']
        return sid === studentId
      })

      const completedCount = studentParticipants.length
      const topicIndex = completedCount % curriculumTopics.length
      const topic = curriculumTopics[topicIndex]

      const sessionDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)

      // Create completed session
      const session = await createAirtableRecord('Sessions', {
        'Teacher': [teacherId],
        'Scheduled Date/Time': sessionDate.toISOString(),
        'Status': 'Seen',
        'Session Name': `Simulada: Clase ${completedCount + 1} — ${studentName}`,
        'Curriculum Topic': [topic.id]
      })

      await createAirtableRecord('Session Participants', {
        'Session': [session.id],
        'Student': [studentId]
      })

      // Move Current Topic to next
      const nextTopicIndex = (completedCount + 1) % curriculumTopics.length
      const nextTopic = curriculumTopics[nextTopicIndex]

      const currentRemaining = typeof student.fields['ClassesRemaining'] === 'number' 
        ? student.fields['ClassesRemaining'] 
        : parseInt(classesRemaining, 10)
      
      const newRemaining = Math.max(0, currentRemaining - 1)

      await patchAirtableRecord('Students', studentId, {
        'Current Topic': [nextTopic.id],
        'ClassesRemaining': newRemaining
      })

      return res.status(200).json({
        success: true,
        action: 'advance_one',
        message: `Se avanzó 1 clase exitosamente. Clase #${completedCount + 1} ("${topic.fields['Topic Name'] || topic.fields['Title']}") completada.`,
        student: studentName,
        completedClass: completedCount + 1,
        nextTopic: nextTopic.fields['Topic Name'] || nextTopic.fields['Title'],
        classesRemaining: newRemaining
      })
    }

    // ----------------------------------------------------
    // ACTION: SET CLASS NUMBER (Saltar a Clase N)
    // ----------------------------------------------------
    if (action === 'set_class') {
      const targetClassNum = parseInt(classNumber || count, 10)
      if (isNaN(targetClassNum) || targetClassNum < 1) {
        return res.status(400).json({ error: 'classNumber debe ser un número entero >= 1' })
      }

      await cleanupStudentSessions(studentId)

      const sessionsToCreate = targetClassNum - 1
      const createdSessions = []
      const now = new Date()

      for (let i = 0; i < sessionsToCreate; i++) {
        const sessionDate = new Date(now.getTime() - (sessionsToCreate - i) * 3 * 24 * 60 * 60 * 1000)
        const topicIndex = i % curriculumTopics.length
        const topic = curriculumTopics[topicIndex]

        const session = await createAirtableRecord('Sessions', {
          'Teacher': [teacherId],
          'Scheduled Date/Time': sessionDate.toISOString(),
          'Status': 'Seen',
          'Session Name': `Simulada: Clase ${i + 1} — ${studentName}`,
          'Curriculum Topic': [topic.id]
        })

        await createAirtableRecord('Session Participants', {
          'Session': [session.id],
          'Student': [studentId]
        })

        createdSessions.push({
          id: session.id,
          date: sessionDate.toLocaleDateString(),
          topic: topic.fields['Topic Name'] || topic.fields['Title']
        })
      }

      const currentTopicIndex = (targetClassNum - 1) % curriculumTopics.length
      const currentTopic = curriculumTopics[currentTopicIndex]

      // Schedule upcoming session for target class
      const upcomingDate = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)
      const upcomingSession = await createAirtableRecord('Sessions', {
        'Teacher': [teacherId],
        'Scheduled Date/Time': upcomingDate.toISOString(),
        'Status': 'Scheduled',
        'Session Name': `Clase ${targetClassNum}: ${currentTopic.fields['Topic Name'] || currentTopic.fields['Title']} — ${studentName}`,
        'Curriculum Topic': [currentTopic.id]
      })

      await createAirtableRecord('Session Participants', {
        'Session': [upcomingSession.id],
        'Student': [studentId]
      })

      await patchAirtableRecord('Students', studentId, {
        'Current Topic': [currentTopic.id],
        'ClassesRemaining': parseInt(classesRemaining, 10)
      })

      return res.status(200).json({
        success: true,
        action: 'set_class',
        message: `Se estableció la posición del alumno en la Clase #${targetClassNum}. Se simularon ${sessionsToCreate} clases anteriores vistas y la Clase #${targetClassNum} programada.`,
        student: studentName,
        currentClassNumber: targetClassNum,
        currentTopicAssigned: currentTopic.fields['Topic Name'] || currentTopic.fields['Title'],
        simulatedCount: sessionsToCreate
      })
    }

    // ----------------------------------------------------
    // ACTION: ASSIGN MANUAL CLASS (Asignación Manual)
    // ----------------------------------------------------
    if (action === 'assign_manual') {
      const topicIdToUse = reqTopicId || student?.fields?.['Current Topic']?.[0] || curriculumTopics[0].id
      const dateToUse = scheduledDate || new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
      const targetTopic = curriculumTopics.find(t => t.id === topicIdToUse) || curriculumTopics[0]

      const session = await createAirtableRecord('Sessions', {
        'Teacher': [teacherId],
        'Scheduled Date/Time': dateToUse,
        'Status': 'Scheduled',
        'Session Name': `Clase Manual: ${targetTopic.fields['Topic Name'] || targetTopic.fields['Title'] || 'Tema'} — ${studentName}`,
        'Curriculum Topic': [topicIdToUse]
      })

      await createAirtableRecord('Session Participants', {
        'Session': [session.id],
        'Student': [studentId]
      })

      // Deduct token/class
      const currentRemaining = typeof student.fields['ClassesRemaining'] === 'number' 
        ? student.fields['ClassesRemaining'] 
        : 16
      const newRemaining = Math.max(0, currentRemaining - 1)

      await patchAirtableRecord('Students', studentId, {
        'ClassesRemaining': newRemaining
      })

      return res.status(200).json({
        success: true,
        action: 'assign_manual',
        message: `🎉 Clase asignada manualmente para el ${new Date(dateToUse).toLocaleString('es-CO')}. Se consumió 1 crédito de clase.`,
        sessionId: session.id,
        scheduledDate: dateToUse,
        topic: targetTopic.fields['Topic Name'] || targetTopic.fields['Title'],
        classesRemaining: newRemaining
      })
    }

    // ----------------------------------------------------
    // ACTION: TEST CANCELLATION (Probar Cancelación)
    // ----------------------------------------------------
    if (action === 'test_cancel') {
      if (!sessionId) {
        // Find latest upcoming scheduled session for student
        const participants = await findAirtableRecords('Session Participants', '1=1')
        const studentParts = participants.filter(p => (Array.isArray(p.fields['Student']) ? p.fields['Student'][0] : p.fields['Student']) === studentId)
        if (studentParts.length === 0) {
          return res.status(404).json({ error: 'No se encontraron sesiones para cancelar en este estudiante' })
        }
        const lastPart = studentParts[studentParts.length - 1]
        const targetSessionId = Array.isArray(lastPart.fields['Session']) ? lastPart.fields['Session'][0] : lastPart.fields['Session']
        
        await patchAirtableRecord('Sessions', targetSessionId, { 'Status': 'Canceled' })

        // Check 24h rule
        const currentTokens = typeof student.fields['Tokens'] === 'number' ? student.fields['Tokens'] : 0
        const newTokens = currentTokens + 1

        await patchAirtableRecord('Students', studentId, { 'Tokens': newTokens })

        return res.status(200).json({
          success: true,
          action: 'test_cancel',
          message: '❌ Clase cancelada exitosamente. Se otorgó 1 token de reposición al estudiante.',
          refundTokenGiven: true,
          newTokens
        })
      } else {
        await patchAirtableRecord('Sessions', sessionId, { 'Status': 'Canceled' })
        return res.status(200).json({
          success: true,
          action: 'test_cancel',
          message: '❌ Sesión marcada como cancelada'
        })
      }
    }

    // ----------------------------------------------------
    // ACTION: RESET PROGRESS (Resetear a Clase 1)
    // ----------------------------------------------------
    if (action === 'reset') {
      await cleanupStudentSessions(studentId)

      const firstTopic = curriculumTopics[0]
      const upcomingDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
      const upcomingSession = await createAirtableRecord('Sessions', {
        'Teacher': [teacherId],
        'Scheduled Date/Time': upcomingDate.toISOString(),
        'Status': 'Scheduled',
        'Session Name': `Clase 1: ${firstTopic.fields['Topic Name'] || firstTopic.fields['Title']} — ${studentName}`,
        'Curriculum Topic': [firstTopic.id]
      })

      await createAirtableRecord('Session Participants', {
        'Session': [upcomingSession.id],
        'Student': [studentId]
      })

      await patchAirtableRecord('Students', studentId, {
        'Current Topic': [firstTopic.id],
        'ClassesRemaining': 16,
        'Tokens': 0
      })

      return res.status(200).json({
        success: true,
        action: 'reset',
        message: '↺ Avance del estudiante reseteado a la Clase 1 ("' + (firstTopic.fields['Topic Name'] || firstTopic.fields['Title']) + '"). Saldo de clases restaurado a 16.',
        student: studentName,
        classesRemaining: 16,
        tokens: 0
      })
    }

    return res.status(400).json({ error: `Acción desconocida: ${action}` })

  } catch (err: any) {
    console.error('Error en simulador de progreso:', err)
    return res.status(500).json({ error: 'Error interno en el simulador', detail: err.message })
  }
}

