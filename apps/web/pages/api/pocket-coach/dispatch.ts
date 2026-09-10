import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { findAirtableRecords, fetchAirtableRecord, patchAirtableRecord } from '@/lib/airtable';
import { EvolutionAPI } from '@/lib/evolution';
import { buildDispatchPrompt } from '@/lib/pocket-coach/prompt-engine';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const config = {
  maxDuration: 60, // Permitir hasta 60s en Vercel Pro/Hobby cuando sea soportado
};

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
    // 0. Verificar el estado de conexión de WhatsApp antes de iniciar el ciclo
    const conn = await EvolutionAPI.checkConnectionStatus();
    if (!conn.connected) {
      console.warn('[Dispatch] WhatsApp no está conectado (estado:', conn.state, '). Abortando despacho para proteger reputación.');
      return res.status(503).json({
        success: false,
        error: `Instancia de WhatsApp no conectada (${conn.state}). Escanee el QR para reconectar.`,
      });
    }

    // 1. Obtener estudiantes que tengan Status = Active Y Pocket Coach Status = Active
    const allStudents = await findAirtableRecords('Students', "{Status} = 'Active'");
    
    // Filtrado estricto por Pocket Coach Status
    const activeStudents = allStudents.filter(student => {
      const pcStatus = (student.fields['Pocket Coach Status'] || '').toString().trim().toLowerCase();
      const status = (student.fields.Status || '').toString().trim().toLowerCase();
      const phone = (student.fields.Phone || '').toString().trim();
      return status === 'active' && pcStatus === 'active' && phone.length >= 7;
    });

    console.log(`[Dispatch] Estudiantes listos para Pocket Coach: ${activeStudents.length} de ${allStudents.length}`);

    if (activeStudents.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No hay estudiantes con Pocket Coach Status = Active para despachar.',
        processed: []
      });
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-3.5-flash',
      generationConfig: {
        temperature: 0.85,
        topP: 0.95,
      }
    });

    const results = [];

    // Banco variado de temas ejecutivos B1-C1
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
      { title: 'Clarifying & Asking for Reassurance', formula: 'Subject + Make sure that / Double check if + Subject + Action', context: 'Confirmar detalles críticos antes de un lanzamiento.' },
      { title: 'Making Hypotheses (Second Conditional)', formula: 'If + Subject + Past Simple, Subject + Would + Base Action', context: 'Escenarios hipotéticos del presente o futuro.' },
      { title: 'Degree Modifiers for Precision', formula: 'Subject + Is slightly / Significantly / Considerably + Adjective', context: 'Matizar la magnitud de métricas, costos o avances.' },
      { title: 'Cause & Effect Connectors', formula: 'Due to / As a result of + Noun, Subject + Action', context: 'Explicar razones detrás de resultados o retrasos.' }
    ];

    for (let i = 0; i < activeStudents.length; i++) {
      const student = activeStudents[i];
      try {
        const studentId = student.id;
        const studentName = student.fields.FullName || student.fields.Name || student.fields['Full Name'] || 'Estudiante';
        const phone = student.fields.Phone;
        const interests = student.fields.Interests || '';

        let topicTitle = 'Inglés Práctico B2';
        let ldsFormula = 'Sujeto + Palabra de Tiempo + Acción';
        let aiContext = 'Enfócate en fluidez y vocabulario real B2.';

        // Decidir si usar B2 (70%) o Tema del currículo en progreso (30%)
        const useB2Skill = Math.random() < 0.7;
        const currentTopicId = ((student.fields['Current Topic'] as string[]) ?? [])[0] || student.fields['Current Topic (Bot)'];
        
        if (currentTopicId && !useB2Skill) {
          const topic = await fetchAirtableRecord('Curriculum Topics', currentTopicId).catch(() => null);
          if (topic) {
            topicTitle = (topic.fields['Topic Name'] ?? topic.fields['Title'] ?? topicTitle) as string;
            ldsFormula = (topic.fields['LDS_Formula'] ?? topic.fields['LDSFormula'] ?? ldsFormula) as string;
            aiContext = (topic.fields['AI_Context'] ?? topic.fields['AIContext'] ?? aiContext) as string;
          }
        }

        if (useB2Skill || !currentTopicId) {
          const randomB2 = b2Skills[Math.floor(Math.random() * b2Skills.length)];
          topicTitle = randomB2.title;
          ldsFormula = randomB2.formula;
          aiContext = randomB2.context;
        }

        // Generar el micro-reto en formato estructurado (sin revelar la respuesta en el mensaje al alumno)
        const prompt = buildDispatchPrompt(studentName, topicTitle, ldsFormula, aiContext, interests);
        let geminiResult: any;
        let attempts = 0;
        let currentModel = model;

        while (attempts < 3) {
          try {
            attempts++;
            geminiResult = await currentModel.generateContent(prompt);
            break;
          } catch (e: any) {
            console.warn(`[Gemini Attempt ${attempts} Failed]:`, e?.message || e);
            if (attempts < 3) {
              await new Promise(r => setTimeout(r, attempts * 2000));
              if (attempts === 2) {
                currentModel = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
              }
            } else {
              throw e;
            }
          }
        }

        const messageToSend = geminiResult.response.text().trim();

        // Enviar el micro-drop autocontenido con simulación humana
        const evoRes = await EvolutionAPI.sendText(phone, messageToSend);
        console.log(`[Dispatch] Micro-drop enviado a ${studentName} (${phone}):`, evoRes?.key?.id || 'OK');

        // Registrar el último envío en Notes para historial
        const notesContent = `[LAST_DROP]: ${topicTitle} | ${new Date().toISOString()}`;
        await patchAirtableRecord('Students', studentId, {
          Notes: notesContent
        }).catch(err => console.warn(`[Dispatch] No se pudo guardar contexto en Notes de ${studentId}:`, err.message));

        results.push({ student: studentName, phone, status: 'sent' });

        // JITTER HUMANO: Pausa variable entre 4 y 8 segundos entre envíos para simular actividad humana
        if (i < activeStudents.length - 1) {
          const jitterDelay = 4000 + Math.floor(Math.random() * 4000);
          await new Promise(r => setTimeout(r, jitterDelay));
        }

      } catch (studentError: any) {
        console.error(`Error procesando estudiante ${student.id}:`, studentError.message);
        results.push({ student: student.id, status: 'error', error: studentError.message });
      }
    }

    return res.status(200).json({ success: true, processed: results });
  } catch (error: any) {
    console.error('Error en el cron del Pocket Coach:', error);
    return res.status(500).json({ error: error.message });
  }
}
