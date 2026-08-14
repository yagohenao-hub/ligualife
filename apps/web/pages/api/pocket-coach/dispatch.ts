import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { findAirtableRecords, fetchAirtableRecord, createAirtableRecord } from '@/lib/airtable';
import { EvolutionAPI } from '@/lib/evolution';
import { buildDispatchPrompt } from '@/lib/pocket-coach/prompt-engine';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Asegurar que sea POST y (opcionalmente) verificar un API Key de cron job para seguridad
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  const authHeader = req.headers.authorization;
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // 1. Obtener estudiantes activos para Pocket Coach
    const students = await findAirtableRecords('Students', "{Status} = 'Active'");
    const results = [];

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    for (const student of students) {
      try {
        const studentId = student.id;
        const studentName = student.fields.FullName || 'Estudiante';
        const phone = student.fields.Phone;
        const interests = student.fields.Interests || '';

        if (!phone) continue; // No phone, no WhatsApp message

        // 2. Obtener el progreso del estudiante (Tema en curso)
        const progresses = await findAirtableRecords('StudentTopicProgress', `AND({StudentId} = '${studentId}', {Status} = 'In progress')`);
        if (progresses.length === 0) continue; // No topic in progress

        const topicId = progresses[0].fields.TopicId?.[0]; // Airtable linked record returns array
        if (!topicId) continue;

        // 3. Obtener los detalles del tema
        const topic = await fetchAirtableRecord('CurriculumTopics', topicId);
        if (!topic) continue;

        const topicTitle = topic.fields.Title;
        const ldsFormula = topic.fields.LDSFormula;
        const aiContext = topic.fields.AIContext;

        // 4. Generar el micro-reto con Gemini
        const prompt = buildDispatchPrompt(studentName, topicTitle, ldsFormula, aiContext, interests);
        const result = await model.generateContent(prompt);
        const challengeText = result.response.text();

        // 5. Enviar mensaje por Evolution API
        await EvolutionAPI.sendText(phone, challengeText);

        // 6. Registrar el ejercicio enviado en Airtable
        await createAirtableRecord('Exercises', {
          StudentId: [studentId],
          TopicId: [topicId],
          ExerciseContent: challengeText,
          GeneratedAt: new Date().toISOString()
        });

        results.push({ student: studentName, status: 'sent' });
        
        // Pausa breve para evitar Rate Limits (1.5 segundos)
        await new Promise(r => setTimeout(r, 1500));

      } catch (studentError) {
        console.error(`Error procesando estudiante ${student.id}:`, studentError);
        results.push({ student: student.id, status: 'error' });
      }
    }

    return res.status(200).json({ success: true, processed: results });
  } catch (error: any) {
    console.error('Error en el cron del Pocket Coach:', error);
    return res.status(500).json({ error: error.message });
  }
}
