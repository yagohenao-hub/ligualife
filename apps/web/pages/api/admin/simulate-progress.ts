import type { NextApiRequest, NextApiResponse } from 'next'
import { 
  fetchAirtableRecord, 
  createAirtableRecord, 
  patchAirtableRecord, 
  findAirtableRecords 
} from '@/lib/airtable'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Solo permitir en desarrollo o si se conoce el token del admin
  // (Para simplificar, permitimos peticiones GET/POST para que puedan ejecutarlo desde el navegador pegando la URL)
  const { studentId, count = '24', classesRemaining = '16' } = req.query as { 
    studentId?: string
    count?: string
    classesRemaining?: string
  }

  if (!studentId) {
    return res.status(400).json({ error: 'studentId es requerido como query parameter' })
  }

  const sessionsCount = parseInt(count, 10)
  const remaining = parseInt(classesRemaining, 10)

  try {
    // 1. Obtener datos del estudiante
    const student = await fetchAirtableRecord('Students', studentId)
    if (!student) {
      return res.status(404).json({ error: 'Estudiante no encontrado en la base de datos' })
    }

    const teacherId = student.fields['Teacher']?.[0] || 'recTestnj8qdi' // Fallback a docente de pruebas si no tiene
    const studentName = student.fields['FullName'] || 'Estudiante de Prueba'

    // 2. Obtener los temas del currículo ordenados
    const curriculumTopics = await findAirtableRecords('Curriculum Topics', '1=1')
    // Ordenar los temas según su campo 'Order'
    curriculumTopics.sort((a, b) => {
      const orderA = (a.fields['Order'] as number) || 0
      const orderB = (b.fields['Order'] as number) || 0
      return orderA - orderB
    })

    if (curriculumTopics.length === 0) {
      return res.status(404).json({ error: 'No se encontraron temas en Curriculum Topics para asignar' })
    }

    const createdSessions = []
    const now = new Date()

    // 3. Generar las N sesiones en el pasado
    for (let i = 0; i < sessionsCount; i++) {
      // Espaciar las clases 3 días hacia atrás por cada sesión
      const sessionDate = new Date(now.getTime() - (sessionsCount - i) * 3 * 24 * 60 * 60 * 1000)
      
      // Asignar tema secuencial
      const topicIndex = i % curriculumTopics.length
      const topic = curriculumTopics[topicIndex]

      // Crear Sesión en estado 'Seen' (Completada)
      const session = await createAirtableRecord('Sessions', {
        'Teacher': [teacherId],
        'Scheduled Date/Time': sessionDate.toISOString(),
        'Status': 'Seen',
        'Session Name': `Simulada: Clase ${i + 1} — ${studentName}`,
        'Curriculum Topic': [topic.id]
      })

      // Crear participante (Junction table)
      await createAirtableRecord('Session Participants', {
        'Session': [session.id],
        'Student': [studentId]
      })

      createdSessions.push({
        id: session.id,
        date: sessionDate.toLocaleDateString(),
        topic: topic.fields['Topic Name'] || topic.fields['Title'] || 'Tema sin título'
      })
    }

    // 4. Actualizar puntero del Current Topic del estudiante al tema del próximo orden
    const nextTopicIndex = sessionsCount % curriculumTopics.length
    const nextTopic = curriculumTopics[nextTopicIndex]
    
    await patchAirtableRecord('Students', studentId, {
      'Current Topic': [nextTopic.id],
      'ClassesRemaining': remaining,
      'Tokens': remaining // Actualizar clases y tokens restantes para que el alumno pueda seguir agendando
    })

    return res.status(200).json({
      success: true,
      message: `Se simularon exitosamente ${sessionsCount} clases en el pasado (~${Math.round(sessionsCount / 8)} meses de progreso a 2 clases/semana).`,
      student: studentName,
      classesRemainingSetTo: remaining,
      nextTopicAssigned: nextTopic.fields['Topic Name'] || nextTopic.fields['Title'],
      simulatedSessions: createdSessions
    })

  } catch (err: any) {
    console.error('Error al simular progreso:', err)
    return res.status(500).json({ error: 'Error interno del servidor', detail: err.message })
  }
}
