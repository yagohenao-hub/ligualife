import type { NextApiRequest, NextApiResponse } from 'next'
import { findAirtableRecords, fetchAirtableRecord } from '@/lib/airtable'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { studentId } = req.query as { studentId?: string }
  if (!studentId) return res.status(400).json({ error: 'studentId es requerido' })

  try {
    const exercises = await findAirtableRecords('Exercises', `FIND('${studentId}', ARRAYJOIN({StudentId}, ',')) > 0`);
    
    const formattedExercises = await Promise.all(exercises.map(async (ex) => {
      let topicName = 'Práctica General';
      const topicIds = ex.fields['TopicId'];
      if (topicIds && topicIds.length > 0) {
        const topic = await fetchAirtableRecord('CurriculumTopics', topicIds[0]);
        if (topic) {
          topicName = topic.fields['Title'] || topicName;
        }
      }

      return {
        id: ex.id,
        content: ex.fields['ExerciseContent'] || '',
        date: ex.fields['GeneratedAt'] || ex.createdTime,
        topicName
      };
    }));

    // Sort by date descending
    formattedExercises.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return res.status(200).json({ exercises: formattedExercises })
  } catch (err: any) {
    return res.status(500).json({ error: 'Error al cargar ejercicios', detail: err.message })
  }
}
