import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { findAirtableRecords, createAirtableRecord } from '@/lib/airtable';
import { EvolutionAPI } from '@/lib/evolution';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  const authHeader = req.headers.authorization;
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const students = await findAirtableRecords('Students', "{Status} = 'Active'");
    const results = [];
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    for (const student of students) {
      try {
        const studentId = student.id;
        const studentName = student.fields.FullName || 'Estudiante';
        const phone = student.fields.Phone;

        if (!phone) continue;

        // Fetch Error Patterns from the last 7 days
        // Assuming 'Date' field exists in Error Patterns
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const dateStr = sevenDaysAgo.toISOString();

        const errorPatterns = await findAirtableRecords('Error Patterns', `AND(FIND('${studentId}', ARRAYJOIN({Student}, ',')) > 0, IS_AFTER({Date}, '${dateStr}'))`);
        
        if (errorPatterns.length === 0) continue;

        const patternsList = errorPatterns.map((ep: any) => ep.fields['Pattern Name']).join(', ');

        const prompt = `
Eres un profesor de inglés experto. 
El estudiante ${studentName} ha cometido los siguientes errores recurrentes esta semana en sus clases: ${patternsList}.
Genera un pequeño reporte semanal en Markdown que incluya:
1. Una nota de ánimo.
2. Una lista de vocabulario clave o reglas gramaticales para corregir esos errores específicos.
3. 2 ejercicios de traducción o completación enfocados en sus errores.

El texto será guardado para que el estudiante lo descargue como PDF de vocabulario semanal. Mantenlo profesional, estructurado con subtítulos y fácil de leer.
`;

        const result = await model.generateContent(prompt);
        const reportText = result.response.text();

        // Guardar como "Ejercicio" especial
        await createAirtableRecord('Exercises', {
          StudentId: [studentId],
          ExerciseContent: `# Reporte Semanal de Vocabulario\n\n${reportText}`,
          GeneratedAt: new Date().toISOString()
        });

        // Notificar por WhatsApp
        const msg = `¡Hola ${studentName}! 📄 Tu reporte y PDF de vocabulario semanal está listo basado en los errores de tus últimas clases. Entra a tu dashboard de LinguaLife para descargarlo y practicar. ¡Buen fin de semana!`;
        await EvolutionAPI.sendText(phone, msg);

        results.push({ student: studentName, status: 'sent' });
        await new Promise(r => setTimeout(r, 1500));

      } catch (studentError) {
        console.error(`Error en weekly report para ${student.id}:`, studentError);
        results.push({ student: student.id, status: 'error' });
      }
    }

    return res.status(200).json({ success: true, processed: results });
  } catch (error: any) {
    console.error('Error en weekly-report cron:', error);
    return res.status(500).json({ error: error.message });
  }
}
