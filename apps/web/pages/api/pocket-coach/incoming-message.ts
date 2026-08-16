import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { findAirtableRecords, fetchAirtableRecord } from '@/lib/airtable';
import { EvolutionAPI } from '@/lib/evolution';
import { buildConversationalPrompt } from '@/lib/pocket-coach/prompt-engine';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Cache en memoria para deduplicar mensajes por key.id y evitar respuestas dobles
const processedMessageIds = new Set<string>();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const payload = req.body;
    console.log('📥 WEBHOOK POCKET COACH RECIBIDO:', JSON.stringify(payload, null, 2));

    // Verificar si el payload contiene un mensaje de Evolution API v2
    const eventName = (payload.event || '').toLowerCase();
    const isMessageEvent = eventName.includes('messages.upsert') || eventName.includes('messages_upsert') || Boolean(payload.messages) || Boolean(payload.data?.message);

    if (!isMessageEvent) {
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

    // Deduplicación de mensajes para prevenir respuestas dobles
    if (key.id) {
      if (processedMessageIds.has(key.id)) {
        console.log(`[Deduplicación] Mensaje repetido omitido: ${key.id}`);
        return res.status(200).json({ status: 'Ignorado - Mensaje duplicado' });
      }
      processedMessageIds.add(key.id);
      setTimeout(() => processedMessageIds.delete(key.id), 120000); // 2 minutos de expiración
    }

    // Extraer texto (conversation o extendedTextMessage de Evolution API v2)
    const textContent = messageData.conversation || 
                        messageData.extendedTextMessage?.text || 
                        messageData.message?.conversation || 
                        messageData.message?.extendedTextMessage?.text || 
                        messageData.text || '';
                        
    if (!textContent.trim()) {
      return res.status(200).json({ status: 'Ignorado v2.0 - Sin texto' });
    }

    // Extraer el JID real (Soporte para privacidad WhatsApp LID: si remoteJid es @lid, usar remoteJidAlt)
    const targetJid = key.remoteJidAlt || payload.data?.remoteJidAlt || key.remoteJid || '';
    const remoteJid = key.remoteJid;
    // Extraer el número limpio (quitar sufijos de grupo/dispositivo como :14@s.whatsapp.net)
    const phone = targetJid.split('@')[0].split(':')[0];

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
      
      await EvolutionAPI.sendText(phone, handoffMessage);
      return res.status(200).json({ status: 'Handoff humano activado por palabra clave' });
    }

    // 1. Buscar al estudiante en Airtable usando los últimos 10 dígitos del número
    const cleanDigits = phone.replace(/[^0-9]/g, '');
    const last10 = cleanDigits.slice(-10);
    
    let studentName = 'Estudiante';
    let studentId = '';

    if (last10) {
      const students = await findAirtableRecords('Students', `FIND('${last10}', {Phone}) > 0`);
      if (students.length > 0) {
        studentName = students[0].fields.FullName || 'Estudiante';
        studentId = students[0].id;
      } else {
        console.log(`Número ${phone} no registrado en Airtable. Usando perfil por defecto ('${studentName}').`);
      }
    }

    // 2. Buscar tema en progreso
    let currentTopicTitle = 'Inglés General';
    let ldsFormula = 'Sujeto + Palabra de Tiempo + Acción';

    if (studentId) {
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
    await EvolutionAPI.sendText(phone, aiResponseText);

    return res.status(200).json({ success: true, message: 'Respuesta enviada' });

  } catch (error: any) {
    console.error('Error procesando el webhook de WhatsApp:', error);
    return res.status(500).json({ error: error.message });
  }
}
