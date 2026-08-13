import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { findAirtableRecords, fetchAirtableRecord } from '@/lib/airtable';
import { EvolutionAPI } from '@/lib/evolution';
import { buildConversationalPrompt } from '@/lib/pocket-coach/prompt-engine';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const payload = req.body;

    // Verificar si el payload es el evento de mensajes de Evolution API
    if (payload.event !== 'messages.upsert' && !payload.messages) {
      return res.status(200).json({ status: 'Ignorado - No es un mensaje nuevo' });
    }

    // Adaptarse a los diferentes formatos de payload de evolution api v2
    const messageData = payload.data?.message || payload.messages?.[0];
    const key = payload.data?.key || messageData?.key;
    
    if (!messageData || !key) {
      return res.status(200).json({ status: 'Ignorado - Formato desconocido' });
    }

    if (key.fromMe) {
      return res.status(200).json({ status: 'Ignorado - Mensaje propio' });
    }

    // Extraer texto (conversation o extendedTextMessage)
    const textContent = messageData.message?.conversation || 
                        messageData.message?.extendedTextMessage?.text || 
                        messageData.text || '';
                        
    if (!textContent.trim()) {
      return res.status(200).json({ status: 'Ignorado - Sin texto' });
    }

    const remoteJid = key.remoteJid;
    // Extraer el número (quitar @s.whatsapp.net)
    const phone = remoteJid.split('@')[0];

    // -------------------------------------------------------------
    // DETECCIÓN AUTOMÁTICA DE INTENCIÓN ADMINISTRATIVA / HUMAN HANDOFF
    // -------------------------------------------------------------
    const lowerText = textContent.toLowerCase();
    const adminKeywords = [
      'pago', 'pagos', 'comprobante', 'transferencia', 'nequi', 'bancolombia', 'daviplata',
      'factura', 'recibo', 'horario', 'horarios', 'cancelar', 'agendar', 'asesor', 
      'humano', 'persona', 'precio', 'costo', 'suscripcion', 'cuenta', 'consecutivo'
    ];

    const isAdministrativeIntent = adminKeywords.some(keyword => lowerText.includes(keyword));

    if (isAdministrativeIntent) {
      console.log(`Mensaje administrativo detectado para ${phone}: "${textContent}"`);
      const handoffMessage = `¡Hola! He notado que escribes sobre un tema administrativo o de pagos/horarios. 📱\n\nTu asesor se pondrá en contacto contigo a la brevedad para atenderte personalmente.`;
      
      await EvolutionAPI.sendText(remoteJid, handoffMessage);
      return res.status(200).json({ status: 'Handoff humano activado por palabra clave' });
    }

    // 1. Buscar al estudiante en Airtable usando el número
    // (Asegurar formato, buscando si el teléfono contiene este número)
    const students = await findAirtableRecords('Students', `FIND('${phone}', {Phone}) > 0`);
    
    if (students.length === 0) {
      console.log('Mensaje recibido de número no registrado:', phone);
      return res.status(200).json({ status: 'Usuario no registrado' });
    }

    const student = students[0];
    const studentName = student.fields.FullName || 'Estudiante';
    const studentId = student.id;

    // 2. Buscar tema en progreso
    let currentTopicTitle = 'Inglés General';
    let ldsFormula = 'Sujeto + Palabra de Tiempo + Acción';

    const progresses = await findAirtableRecords('StudentTopicProgress', `AND({StudentId} = '${studentId}', {Status} = 'In progress')`);
    
    if (progresses.length > 0) {
      const topicId = progresses[0].fields.TopicId?.[0];
      if (topicId) {
        const topic = await fetchAirtableRecord('CurriculumTopics', topicId);
        if (topic) {
          currentTopicTitle = topic.fields.Title || currentTopicTitle;
          ldsFormula = topic.fields.LDSFormula || ldsFormula;
        }
      }
    }

    // TODO: Recuperar el historial de chat de una base de datos o Redis si se desea contexto largo.
    // Por ahora lo pasamos vacío, Gemini responderá al mensaje actual.
    const chatHistory = ""; 

    // 3. Generar la respuesta usando Gemini
    const prompt = buildConversationalPrompt(studentName, textContent, chatHistory, currentTopicTitle, ldsFormula);
    
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const aiResponseText = result.response.text();

    // 4. Enviar la respuesta por WhatsApp
    await EvolutionAPI.sendText(remoteJid, aiResponseText);

    return res.status(200).json({ success: true, message: 'Respuesta enviada' });

  } catch (error: any) {
    console.error('Error procesando el webhook de WhatsApp:', error);
    return res.status(500).json({ error: error.message });
  }
}
