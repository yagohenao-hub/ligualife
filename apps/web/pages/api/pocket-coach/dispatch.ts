import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { findAirtableRecords, fetchAirtableRecord, createAirtableRecord, patchAirtableRecord } from '@/lib/airtable';
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

    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });

    for (const student of students) {
      try {
        const studentId = student.id;
        const studentName = student.fields.FullName || student.fields.Name || student.fields['Full Name'] || 'Estudiante';
        const phone = student.fields.Phone;
        const interests = student.fields.Interests || '';

        console.log(`[Dispatch Check] Estudiante: "${studentName}", Phone: "${phone}", Status: "${student.fields.Status}"`);

        if (!phone) continue; // No phone, no WhatsApp message

        // Lista estática de habilidades B2 para intercalar (70% de probabilidad)
        const b2Skills = [
          { title: 'Reported Speech in Daily Life', formula: 'Subject + Said/Told + Backshifted Verb', context: 'Práctica de cómo reportar lo que otros dijeron en contextos casuales o de negocios.' },
          { title: 'Speculating about the Past (Modal Verbs)', formula: 'Subject + Must have / Could have + Past Participle', context: 'Práctica de deducir eventos pasados con modales de alta certeza.' },
          { title: 'Advanced Phrasal Verbs in Conversations', formula: 'Subject + Phrasal Verb (carry out, figure out, come up with) + Object', context: 'Uso natural de verbos frasales en el trabajo y viajes.' },
          { title: 'Second Conditionals for Hypotheses', formula: 'If + Subject + Past Simple, Subject + Would + Base Verb', context: 'Expresar situaciones hipotéticas del presente o futuro.' }
        ];

        let topicTitle = 'Inglés General B2';
        let ldsFormula = 'Sujeto + Palabra de Tiempo + Acción';
        let aiContext = 'Enfócate en fluidez y vocabulario real B2.';
        let topicId = '';

        // Decidir si usar B2 (70%) o Tema en progreso (30%)
        const useB2Skill = Math.random() < 0.7;

        const currentTopicId = ((student.fields['Current Topic'] as string[]) ?? [])[0];
        if (currentTopicId) {
          const topic = await fetchAirtableRecord('Curriculum Topics', currentTopicId);
          if (topic) {
            topicId = topic.id;
            if (!useB2Skill) {
              topicTitle = (topic.fields['Topic Name'] ?? topic.fields['Title'] ?? topicTitle) as string;
              ldsFormula = (topic.fields['LDS_Formula'] ?? topic.fields['LDSFormula'] ?? ldsFormula) as string;
              aiContext = (topic.fields['AI_Context'] ?? topic.fields['AIContext'] ?? aiContext) as string;
            }
          }
        }

        if (useB2Skill || !topicId) {
          const randomB2 = b2Skills[Math.floor(Math.random() * b2Skills.length)];
          topicTitle = randomB2.title;
          ldsFormula = randomB2.formula;
          aiContext = randomB2.context;
        }

        // 4. Generar el micro-reto con Gemini (con retry automático si hay spike 503)
        const prompt = buildDispatchPrompt(studentName, topicTitle, ldsFormula, aiContext, interests);
        let result;
        try {
          result = await model.generateContent(prompt);
        } catch (e: any) {
          if (e?.status === 503 || e?.message?.includes('503')) {
            console.log('🔄 Reintentando generación por spike 503...');
            await new Promise(r => setTimeout(r, 2000));
            result = await model.generateContent(prompt);
          } else {
            throw e;
          }
        }
        const challengeText = result.response.text();

        // 5. Enviar mensaje por Evolution API
        const evoRes = await EvolutionAPI.sendText(phone, challengeText);
        console.log(`[EvolutionAPI RESULT for ${studentName} (${phone})]:`, JSON.stringify(evoRes));

        // 6. Guardar la memoria efímera en memoria en lugar de escribir en la base de datos para el MVP
        const lastChallengeMap = (global as any).__lastChallengeMap || new Map<string, string>();
        (global as any).__lastChallengeMap = lastChallengeMap;
        const cleanDigits = phone.replace(/[^0-9]/g, '');
        const last10 = cleanDigits.slice(-10);
        
        lastChallengeMap.set(phone, `Reto enviado (${topicTitle}): ${challengeText.slice(0, 200)}...`);
        if (last10) {
          lastChallengeMap.set(last10, `Reto enviado (${topicTitle}): ${challengeText.slice(0, 200)}...`);
        }

        results.push({ student: studentName, status: 'sent' });
        
        // Pausa de 3 segundos para cumplir holgadamente con el Free Tier (15 RPM) sin agotar el timeout HTTP
        await new Promise(r => setTimeout(r, 3000));

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
