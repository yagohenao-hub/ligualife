import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { findAirtableRecords, fetchAirtableRecord, patchAirtableRecord } from '@/lib/airtable';
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

    // Cache en memoria para contador de mensajes diarios anti-abuso por teléfono
    const todayStr = new Date().toISOString().split('T')[0];
    const userDailyCounts = (global as any).__userDailyCounts || new Map<string, { date: string; count: number }>();
    (global as any).__userDailyCounts = userDailyCounts;

    const userUsage = userDailyCounts.get(phone);
    if (userUsage && userUsage.date === todayStr && userUsage.count >= 10) {
      console.log(`[Anti-Abuso] Límite diario alcanzado para ${phone}`);
      const limitMsg = `⚠️ ¡Has alcanzado el límite de 10 consultas diarias con tu Pocket Coach! Volveremos a practicar mañana para asimilar lo aprendido. 🚀`;
      await EvolutionAPI.sendText(phone, limitMsg);
      return res.status(200).json({ status: 'Límite diario alcanzado' });
    }

    // 1. Buscar al estudiante en Airtable usando los últimos 10 dígitos del número
    const cleanDigits = phone.replace(/[^0-9]/g, '');
    const last10 = cleanDigits.slice(-10);
    
    let studentName = 'Estudiante';
    let studentId = '';
    let adminSupportActive = false;
    let lastChallengeContext = '';
    let currentTopicTitle = 'Inglés General';
    let ldsFormula = 'Sujeto + Palabra de Tiempo + Acción';

    if (last10) {
      const students = await findAirtableRecords('Students', `FIND('${last10}', {Phone}) > 0`);
      if (students.length > 0) {
        const studentRec = students[0];
        studentName = studentRec.fields.FullName || 'Estudiante';
        studentId = studentRec.id;
        adminSupportActive = Boolean(studentRec.fields.Admin_Support_Active);
        lastChallengeContext = (studentRec.fields.Last_Challenge_Context as string) || '';

        // Verificar Current Topic mediante Puntero Único
        const currentTopicId = ((studentRec.fields['Current Topic'] as string[]) ?? [])[0];
        if (currentTopicId) {
          const topic = await fetchAirtableRecord('Curriculum Topics', currentTopicId);
          if (topic) {
            currentTopicTitle = (topic.fields['Topic Name'] ?? topic.fields['Title'] ?? currentTopicTitle) as string;
            ldsFormula = (topic.fields['LDS_Formula'] ?? topic.fields['LDSFormula'] ?? ldsFormula) as string;
          }
        }
      } else {
        console.log(`Número ${phone} no registrado en Airtable. Usando perfil por defecto ('${studentName}').`);
      }
    }

    // Si el soporte humano está activo (Handoff manual), el bot no responde
    if (adminSupportActive) {
      console.log(`[Handoff Activo] Pocket Coach pausado para ${phone} por atención de la Secretaría.`);
      return res.status(200).json({ status: 'Pausado por soporte humano activo' });
    }

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
      const handoffMessage = `¡Hola! He notado que escribes sobre un tema administrativo o de pagos/horarios. 📱\n\nTu asesor se pondrá en contacto contigo a la brevedad en este mismo chat para atenderte personalmente.`;
      
      if (studentId) {
        await patchAirtableRecord('Students', studentId, { Admin_Support_Active: true }).catch(() => {});
      }
      
      await EvolutionAPI.sendText(phone, handoffMessage);
      return res.status(200).json({ status: 'Handoff humano activado por palabra clave' });
    }

    // Actualizar contador diario anti-abuso
    const currentCount = (userUsage && userUsage.date === todayStr) ? userUsage.count + 1 : 1;
    userDailyCounts.set(phone, { date: todayStr, count: currentCount });

    // 3. Generar la respuesta usando Gemini (con memoria efímera del último reto)
    const chatHistory = lastChallengeContext ? `ÚLTIMO RETO ENVIADO HACE POCO:\n"${lastChallengeContext}"` : ""; 
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
