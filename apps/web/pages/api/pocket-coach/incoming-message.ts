import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { findAirtableRecords, fetchAirtableRecord, patchAirtableRecord } from '@/lib/airtable';
import { EvolutionAPI } from '@/lib/evolution';
import { buildConversationalPrompt } from '@/lib/pocket-coach/prompt-engine';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Cache en memoria para deduplicar mensajes por key.id y evitar respuestas dobles
const processedMessageIds = new Set<string>();

// Cache en memoria para historial multi-turn reciente (phone -> [{ role, text, time }])
const threadCache = (global as any).__chatThreads || new Map<string, Array<{ role: 'user' | 'model'; text: string; time: number }>>();
(global as any).__chatThreads = threadCache;

// Cache de cooldown anti-flood por teléfono (phone -> timestamp del último mensaje procesado)
const lastMessageTimeByPhone = (global as any).__lastMsgTime || new Map<string, number>();
(global as any).__lastMsgTime = lastMessageTimeByPhone;

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

    // Ignorar mensajes enviados por el propio bot
    if (key.fromMe) {
      return res.status(200).json({ status: 'Ignorado - Mensaje propio' });
    }

    // -------------------------------------------------------------
    // BLINDAJE 1: FILTRO DE GRUPOS, BROADCASTS Y NEWSLETTERS
    // Responder en grupos de WhatsApp es la causa #1 de baneo por spam en Baileys
    // -------------------------------------------------------------
    const remoteJid = (key.remoteJid || payload.data?.remoteJid || '').toLowerCase();
    if (remoteJid.endsWith('@g.us') || remoteJid.includes('broadcast') || remoteJid.includes('newsletter') || remoteJid.includes('@call')) {
      console.log(`[Anti-Spam Shield] Ignorado mensaje grupal/broadcast: ${remoteJid}`);
      return res.status(200).json({ status: 'Ignorado - Chat no individual' });
    }

    // Deduplicación de mensajes por ID único para evitar ráfagas duplicadas
    if (key.id) {
      if (processedMessageIds.has(key.id)) {
        console.log(`[Deduplicación] Mensaje repetido omitido: ${key.id}`);
        return res.status(200).json({ status: 'Ignorado - Mensaje duplicado' });
      }
      processedMessageIds.add(key.id);
      setTimeout(() => processedMessageIds.delete(key.id), 120000); // 2 minutos de expiración
    }

    // Extraer texto (conversation, extendedTextMessage, imagen/documento o mensaje de audio)
    const isAudio = Boolean(messageData.audioMessage || messageData.message?.audioMessage);
    const isImage = Boolean(messageData.imageMessage || messageData.message?.imageMessage || messageData.documentMessage || messageData.message?.documentMessage);
    let textContent = messageData.conversation || 
                      messageData.extendedTextMessage?.text || 
                      messageData.message?.conversation || 
                      messageData.message?.extendedTextMessage?.text || 
                      messageData.imageMessage?.caption ||
                      messageData.message?.imageMessage?.caption ||
                      messageData.documentMessage?.caption ||
                      messageData.message?.documentMessage?.caption ||
                      messageData.text || '';
                      
    if (isAudio && !textContent.trim()) {
      textContent = '[Nota de Voz / Audio del estudiante]';
    } else if (isImage && !textContent.trim()) {
      textContent = 'comprobante de pago enviado';
    }

    if (!textContent.trim()) {
      return res.status(200).json({ status: 'Ignorado - Sin contenido analizable' });
    }

    // Extraer el JID real (Soporte para privacidad WhatsApp LID)
    const targetJid = key.remoteJidAlt || payload.data?.remoteJidAlt || key.remoteJid || '';
    const phone = targetJid.split('@')[0].split(':')[0];
    const cleanDigits = phone.replace(/[^0-9]/g, '');
    const last10 = cleanDigits.slice(-10);

    // -------------------------------------------------------------
    // BLINDAJE 2: ANTI-FLOOD DEBOUNCE (Evitar bucles o spam de usuarios/bots)
    // -------------------------------------------------------------
    const now = Date.now();
    const lastTime = lastMessageTimeByPhone.get(cleanDigits) || 0;
    if (now - lastTime < 2000) {
      console.log(`[Anti-Flood] Mensaje demasiado rápido de ${cleanDigits} (<2s). Descartando para proteger WhatsApp.`);
      return res.status(200).json({ status: 'Ignorado por ráfaga rápida (debounce)' });
    }
    lastMessageTimeByPhone.set(cleanDigits, now);

    // -------------------------------------------------------------
    // 1. Identificación del Estudiante & Solución Definitiva al nombre "Mock"
    // -------------------------------------------------------------
    const pushName = payload.data?.pushName || payload.messages?.[0]?.pushName || messageData?.pushName || '';
    let studentName = 'Estudiante';
    let studentId = '';
    let studentRec: any = null;
    let currentTopicTitle = 'Inglés General y Negocios';
    let ldsFormula = 'Sujeto + Palabra de Tiempo + Acción';

    if (last10) {
      const students = await findAirtableRecords('Students', `FIND('${last10}', {Phone}) > 0`).catch(() => []);
      if (students.length > 0) {
        studentRec = students[0];
        const rawDbName = (studentRec.fields.FullName || studentRec.fields['Full Name'] || studentRec.fields.Name || '').trim();
        
        // Si el nombre en la BD es una prueba/mock, usar el pushName real de WhatsApp
        if (rawDbName && !rawDbName.toLowerCase().startsWith('mock') && !rawDbName.toLowerCase().startsWith('dummy')) {
          studentName = rawDbName;
        } else if (pushName) {
          studentName = pushName;
        }

        studentId = studentRec.id;

        const currentTopicId = ((studentRec.fields['Current Topic'] as string[]) ?? [])[0] || studentRec.fields['Current Topic (Bot)'];
        if (currentTopicId) {
          const topic = await fetchAirtableRecord('Curriculum Topics', currentTopicId).catch(() => null);
          if (topic) {
            currentTopicTitle = (topic.fields['Topic Name'] ?? topic.fields['Title'] ?? currentTopicTitle) as string;
            ldsFormula = (topic.fields['LDS_Formula'] ?? topic.fields['LDSFormula'] ?? ldsFormula) as string;
          }
        }
      } else if (pushName) {
        studentName = pushName;
      }
    } else if (pushName) {
      studentName = pushName;
    }

    // Extraer solo el primer nombre de pila para mayor naturalidad (ej: "Santiago M Henao" -> "Santiago")
    const cleanFirstName = studentName.trim().split(' ')[0] || 'Estudiante';

    const cleanInput = textContent.trim().toLowerCase();

    // -------------------------------------------------------------
    // 2. SISTEMA DE OPT-OUT Y REACTIVACIÓN (BLINDAJE ANTI-SPAM)
    // -------------------------------------------------------------
    const optOutKeywords = ['stop', 'pausar', 'pausa', 'cancelar', 'no mas', 'no más', 'silencio', 'desactivar', 'detener'];
    if (optOutKeywords.includes(cleanInput)) {
      if (studentId) {
        await patchAirtableRecord('Students', studentId, {
          'Pocket Coach Status': 'Paused'
        }).catch(() => {});
      }
      const pauseMsg = `⏸️ *Pocket Coach pausado.* He suspendido el envío de tus micro-retos diarios.\n\nSi en algún momento deseas reanudarlos, simplemente escríbeme *ACTIVAR* en este chat. ¡Muchos éxitos en tu aprendizaje!`;
      await EvolutionAPI.sendText(phone, pauseMsg);
      return res.status(200).json({ status: 'Opt-out procesado exitosamente' });
    }

    const optInKeywords = ['activar', 'start', 'continuar', 'reanudar', 'comenzar', 'iniciar', 'reactivar'];
    if (optInKeywords.includes(cleanInput)) {
      if (studentId) {
        await patchAirtableRecord('Students', studentId, {
          'Pocket Coach Status': 'Active'
        }).catch(() => {});
      }
      const activateMsg = `🚀 *¡Pocket Coach reactivado!* Qué alegría tenerte de vuelta, ${cleanFirstName}.\n\nEstaré enviándote tus micro-retos pedagógicos en los horarios habituales. ¿Listo para acelerar tu inglés?`;
      await EvolutionAPI.sendText(phone, activateMsg);
      return res.status(200).json({ status: 'Opt-in reactivado exitosamente' });
    }

    // -------------------------------------------------------------
    // 3. HUMAN HANDOFF & DETECCIÓN ADMINISTRATIVA
    // -------------------------------------------------------------
    const adminKeywords = [
      'pago', 'pagos', 'comprobante', 'transferencia', 'nequi', 'bancolombia', 'daviplata',
      'factura', 'recibo', 'horario', 'horarios', 'cancelar clase', 'agendar', 'asesor', 
      'humano', 'persona', 'precio', 'costo', 'suscripcion', 'cuenta', 'hablar con asesor'
    ];

    if (adminKeywords.some(keyword => cleanInput.includes(keyword))) {
      console.log(`[Handoff Humano] Intención administrativa detectada para ${phone}: "${textContent}"`);
      const handoffMessage = `¡Hola, ${cleanFirstName}! He recibido tu consulta sobre temas administrativos o de horarios/pagos. 📱\n\nTu asesor se pondrá en contacto contigo muy pronto por este mismo medio para colaborarte directamente.`;
      await EvolutionAPI.sendText(phone, handoffMessage);
      return res.status(200).json({ status: 'Handoff humano activado' });
    }

    // -------------------------------------------------------------
    // 4. HISTORIAL DE CONVERSACIÓN COMPACTO & EFICIENTE (MEMORIA RECIENTE)
    // Reducido a 4 turnos y truncado a 140 chars para max performance y ahorro de tokens
    // -------------------------------------------------------------
    let thread = threadCache.get(cleanDigits) || [];
    
    // Manejo de expiración en memoria caché (más de 90 minutos de inactividad -> reseteo natural)
    if (thread.length > 0 && now - thread[thread.length - 1].time > 90 * 60 * 1000) {
      thread = [];
    }

    // Compactar historial: tomar últimos 4 mensajes y truncar texto a 140 chars
    const compactHistory = thread.slice(-4).map((m: { role: 'user' | 'model'; text: string }) => {
      const author = m.role === 'user' ? cleanFirstName : 'Coach';
      const safeText = (m.text || '').replace(/\s+/g, ' ').slice(0, 140);
      return `${author}: "${safeText}"`;
    }).join('\n');

    console.log(`[Pocket Coach] Conversando con ${cleanFirstName} (${phone}). Mensajes previos en hilo: ${thread.length}`);

    // Construir prompt conversacional refinado
    const conversationalPrompt = buildConversationalPrompt(
      cleanFirstName,
      textContent,
      compactHistory,
      currentTopicTitle,
      ldsFormula
    );

    // CASCADA DE MODELOS ULTRA LIVIANOS Y ECONÓMICOS
    // Prioridad: gemini-3.1-flash-lite -> gemini-3.5-flash-lite -> gemini-flash-lite-latest -> gemini-3.5-flash
    const liteModelCandidates = [
      'gemini-3.1-flash-lite',
      'gemini-3.5-flash-lite',
      'gemini-flash-lite-latest',
      'gemini-3.5-flash'
    ];

    let aiResponseText = '';
    let usedModel = '';

    for (const modelName of liteModelCandidates) {
      try {
        const selectedModel = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            temperature: 0.75,
            topP: 0.95,
            maxOutputTokens: 250,
          }
        });
        const result = await selectedModel.generateContent(conversationalPrompt);
        aiResponseText = result.response.text().trim();
        usedModel = modelName;
        break;
      } catch (genErr: any) {
        console.warn(`[Pocket Coach] Falló modelo ${modelName}:`, genErr?.message || genErr);
      }
    }

    if (!aiResponseText) {
      throw new Error('No se pudo generar respuesta con ninguno de los modelos de IA livianos.');
    }

    console.log(`[Pocket Coach] Respuesta generada con modelo económico [${usedModel}]`);

    // Enviar respuesta por WhatsApp con simulación de escritura humana
    await EvolutionAPI.sendText(phone, aiResponseText);

    // Actualizar historial en memoria volátil (mantener últimos 4 mensajes con texto recortado)
    // Cero escrituras en la base de datos para no gastar I/O ni sobreescribir notas
    const truncatedInput = textContent.slice(0, 140);
    const truncatedAi = aiResponseText.slice(0, 140);
    thread.push({ role: 'user', text: truncatedInput, time: now });
    thread.push({ role: 'model', text: truncatedAi, time: Date.now() });
    if (thread.length > 4) thread = thread.slice(-4);
    threadCache.set(cleanDigits, thread);

    return res.status(200).json({ success: true, mode: 'conversational', model: usedModel });

  } catch (error: any) {
    console.error('Error procesando el webhook de WhatsApp:', error);
    return res.status(500).json({ error: error.message });
  }
}
