import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { findAirtableRecords, fetchAirtableRecord, createAirtableRecord, patchAirtableRecord } from '@/lib/airtable';
import { EvolutionAPI } from '@/lib/evolution';
import { buildDispatchPrompt } from '@/lib/pocket-coach/prompt-engine';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Vercel Crons envían peticiones GET por defecto; los triggers manuales envían POST
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const authHeader = req.headers.authorization;
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // 1. Obtener estudiantes activos para Pocket Coach
    const students = await findAirtableRecords('Students', "{Status} = 'Active'");
    const results = [];

    const model = genAI.getGenerativeModel({
      model: 'gemini-3.5-flash',
      generationConfig: {
        temperature: 0.95,
        topP: 0.95,
      }
    });

    for (const student of students) {
      try {
        const studentId = student.id;
        const studentName = student.fields.FullName || student.fields.Name || student.fields['Full Name'] || 'Estudiante';
        const phone = student.fields.Phone;
        const interests = student.fields.Interests || '';

        console.log(`[Dispatch Check] Estudiante: "${studentName}", Phone: "${phone}", Status: "${student.fields.Status}"`);

        if (!phone) continue; // No phone, no WhatsApp message

        // Banco extendido de 20+ habilidades B1-C1 para máxima variedad
        const b2Skills = [
          { title: 'Softening & Politeness in Business', formula: 'Subject + Could / Would mind + Verb-ing', context: 'Pedir favores o solicitar cambios de forma diplomática en el trabajo.' },
          { title: 'Phrasal Verbs for Tech & Projects', formula: 'Subject + Phrasal Verb (roll out, iron out, scale up, wind down) + Object', context: 'Vocabulario ágil en lanzamientos y proyectos de software/negocio.' },
          { title: 'Past Speculation & High Certainty', formula: 'Subject + Must have / Can\'t have + Action (Past Participle)', context: 'Concluir lo que ocurrió en un evento pasado con seguridad.' },
          { title: 'Reporting Key Decisions & Feedback', formula: 'Subject + Mentioned / Pointed out that + Past Action', context: 'Resumir acuerdos y feedback de reuniones importantes.' },
          { title: 'Expressing Contrast & Trade-offs', formula: 'Although / Even though + Subject + Action, Subject + Action', context: 'Conectar dos ideas opuestas con fluidez y sofisticación.' },
          { title: 'Indirect Questions for Executive Tact', formula: 'Could you tell me if / Do you know when + Subject + Time Word + Action', context: 'Preguntas indirectas para sonar ultra educado con clientes y directivos.' },
          { title: 'Giving Recommendations & Advice', formula: 'Subject + Had better / Ought to + Action', context: 'Sugerir pasos estratégicos con impacto y urgencia.' },
          { title: 'First Conditional for Business Scenarios', formula: 'If + Subject + Present Simple, Subject + Will + Action', context: 'Plantear compromisos reales y consecuencias futuras.' },
          { title: 'Passive Voice for Formal Updates', formula: 'Subject + Is/Was + Action (Past Participle) + by...', context: 'Enfocarse en el resultado o producto en lugar de quién hizo la tarea.' },
          { title: 'Idioms for Decision Making', formula: 'Subject + Idiom (call the shots, bite the bullet, hit the mark) + Object', context: 'Expresiones idiomáticas comunes en entornos corporativos.' },
          { title: 'Third Conditionals for Past Regrets', formula: 'If + Subject + Had + Action, Subject + Would have + Action', context: 'Analizar escenarios del pasado que pudieron ser diferentes.' },
          { title: 'Expressing Purpose & Intent', formula: 'Subject + Action + In order to / So as to + Base Action', context: 'Explicar el objetivo de una decisión o estrategia.' },
          { title: 'Emphasizing Action Speed & Urgency', formula: 'As soon as / The moment + Subject + Action', context: 'Coordinar entregables rápidos con el equipo.' },
          { title: 'Past Habits vs Present States', formula: 'Subject + Used to / Would + Action', context: 'Comparar cómo se hacían las cosas antes frente al presente.' },
          { title: 'Clarifying & Asking for Reassurance', formula: 'Subject + Make sure that / Double check if + Subject + Action', context: 'Confirmar detalles críticos antes de un lanzamiento.' },
          { title: 'Expressing Partial Agreement & Negotiation', formula: 'I see your point, but / To some extent + Subject + Action', context: 'Negociar objeciones manteniendo una relación positiva.' },
          { title: 'Making Hypotheses (Second Conditional)', formula: 'If + Subject + Past Simple, Subject + Would + Base Action', context: 'Escenarios hipotéticos del presente o futuro.' },
          { title: 'Phrasal Verbs for Daily Communication', formula: 'Subject + Phrasal Verb (pick up, catch up, follow up, break down) + Object', context: 'Seguimiento de tareas cotidianas y llamadas breves.' },
          { title: 'Degree Modifiers for Precision', formula: 'Subject + Is slightly / Significantly / Considerably + Adjective', context: 'Matizar la magnitud de métricas, costos o avances.' },
          { title: 'Cause & Effect Connectors', formula: 'Due to / As a result of + Noun, Subject + Action', context: 'Explicar razones detrás de resultados o retrasos.' }
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

        // 4. Generar el micro-reto con Gemini (con retry de hasta 3 intentos y fallback de modelo)
        const prompt = buildDispatchPrompt(studentName, topicTitle, ldsFormula, aiContext, interests);
        let result: any;
        let attempts = 0;
        let currentModel = model;
        while (attempts < 3) {
          try {
            attempts++;
            result = await currentModel.generateContent(prompt);
            break;
          } catch (e: any) {
            console.warn(`[Gemini Attempt ${attempts} Failed]:`, e?.message || e);
            if (attempts < 3) {
              await new Promise(r => setTimeout(r, attempts * 2500));
              if (attempts === 2) {
                // Cambiar a modelo de respaldo si gemini-3.5-flash está saturado
                currentModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
              }
            } else {
              throw e;
            }
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
