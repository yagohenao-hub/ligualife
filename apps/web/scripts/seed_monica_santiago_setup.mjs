import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const envContent = fs.readFileSync(path.resolve('apps/web/.env.local'), 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const idx = line.indexOf('=');
  if (idx > -1) {
    const k = line.slice(0, idx).trim();
    const v = line.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
    env[k] = v;
  }
});

const url = env.NEXT_PUBLIC_SUPABASE_URL || 'https://swmklobpnrkjpfackboc.supabase.co';
const key = env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key, { auth: { persistSession: false } });

async function main() {
  const monicaId = '23cf0a83-2436-4569-bfde-45c3f9ad23cf';
  const santiagoTeacherId = '20682d77-308a-45f6-895d-cb337faf7a3a';

  console.log('--- 1. Actualizando Curriculum Topics 1 a 5 con la pedagogía exacta de Santiago ---');

  // Tema 1: Estructura Bandera de Colombia + 6 Palabras de Tiempo Iniciales (can, could, will, would, be, have)
  const topic1Slides = [
    {
      title: "🟡🔵🔴 La Estructura Universal: Bandera de Colombia",
      content: `<p>En inglés toda idea sólida sigue un orden inquebrantable de 3 bloques clave, tal como los colores de la <b>Bandera de Colombia</b>:</p>
      <div style="display:flex;gap:10px;margin:16px 0;align-items:center;flex-wrap:wrap;">
        <span style="background:rgba(234,179,8,0.2);border:2px solid #eab308;color:#fde047;padding:8px 14px;border-radius:10px;font-weight:800;font-size:1.05rem;">🟡 1. Persona (Sujeto)</span>
        <span style="font-size:1.2rem;font-weight:900;color:#94a3b8;">+</span>
        <span style="background:rgba(56,189,248,0.2);border:2px solid #38bdf8;color:#38bdf8;padding:8px 14px;border-radius:10px;font-weight:800;font-size:1.05rem;">🔵 2. Palabra de Tiempo</span>
        <span style="font-size:1.2rem;font-weight:900;color:#94a3b8;">+</span>
        <span style="background:rgba(239,68,68,0.2);border:2px solid #ef4444;color:#f87171;padding:8px 14px;border-radius:10px;font-weight:800;font-size:1.05rem;">🔴 3. Acción (Verbo Base)</span>
      </div>
      <p><b>Regla de oro:</b> A diferencia del español, en inglés <i>nunca</i> se omite la persona. No decimos <i>"is raining"</i> sino <b>"It is raining"</b>.</p>`
    },
    {
      title: "🔵 Las Primeras 6 Palabras del Tiempo",
      content: `<p>En esta primera etapa aprendimos las 6 palabras del tiempo fundamentales para situar la acción:</p>
      <ul>
        <li><b>CAN</b> (poder en presente): <i>I can help you.</i></li>
        <li><b>COULD</b> (podría / pude en pasado): <i>She could visit us.</i></li>
        <li><b>WILL</b> (futuro certero): <i>We will start today.</i></li>
        <li><b>WOULD</b> (condicional -ría): <i>They would love that.</i></li>
        <li><b>BE</b> (ser / estar): <i>I am ready / You are here.</i></li>
        <li><b>HAVE</b> (tener / haber): <i>We have time.</i></li>
      </ul>
      <p style="padding:10px;background:rgba(56,189,248,0.12);border-left:4px solid #38bdf8;border-radius:6px;">
        <b>Truco:</b> Tras una palabra de tiempo modal, la acción se mantiene en su forma más pura y sin conjugar.
      </p>`
    }
  ];

  await supabase.from('curriculum_topics').update({
    'Topic Name': 'The Universal Idea & First 6 Time Words',
    'LDS_Formula': '🟡 Persona + 🔵 Palabra de Tiempo (Can, Could, Will, Would, Be, Have) + 🔴 Acción',
    'AI_Context': 'Pedagogía Santiago Henao: Estructura Bandera de Colombia (Persona=Amarillo, Tiempo=Azul, Acción=Rojo). Foco en no omitir el sujeto y dominar las primeras 6 palabras de tiempo: can, could, will, would, be, have.',
    'Cached Slides': JSON.stringify(topic1Slides)
  }).eq('id', 'recTopic1');

  // Tema 2: Do/Did + Time Words Restantes + Indefinidos (every, any, no, some)
  const topic2Slides = [
    {
      title: "🔵 Completando las Palabras de Tiempo (Do, Did, Modales)",
      content: `<p>Ampliamos el repertorio con los comodines del tiempo:</p>
      <ul>
        <li><b>DO / DOES</b> (presente de rutina/énfasis) y <b>DID</b> (pasado certero).</li>
        <li><b>SHALL / SHOULD</b> (sugerencia / consejo moral).</li>
        <li><b>MUST</b> (obligación / certeza rotunda).</li>
        <li><b>MAY / MIGHT</b> (permiso formal y probabilidad remota).</li>
      </ul>`
    },
    {
      title: "🧩 El Cuadrante de Indefinidos: Every, Any, No, Some",
      content: `<p>Combinaciones lógicas para hablar de cosas, lugares y personas sin ambigüedad:</p>
      <table style="width:100%;border-collapse:collapse;margin-top:10px;font-size:0.9rem;">
        <thead>
          <tr style="background:rgba(255,255,255,0.08);color:#38bdf8;text-align:left;">
            <th style="padding:8px;border:1px solid rgba(255,255,255,0.15);">Base</th>
            <th style="padding:8px;border:1px solid rgba(255,255,255,0.15);">+ THING (Cosa)</th>
            <th style="padding:8px;border:1px solid rgba(255,255,255,0.15);">+ WHERE (Lugar)</th>
            <th style="padding:8px;border:1px solid rgba(255,255,255,0.15);">+ ONE/BODY (Persona)</th>
          </tr>
        </thead>
        <tbody>
          <tr><td style="padding:8px;border:1px solid rgba(255,255,255,0.1);"><b>SOME</b></td><td style="padding:8px;border:1px solid rgba(255,255,255,0.1);">Something</td><td style="padding:8px;border:1px solid rgba(255,255,255,0.1);">Somewhere</td><td style="padding:8px;border:1px solid rgba(255,255,255,0.1);">Someone</td></tr>
          <tr><td style="padding:8px;border:1px solid rgba(255,255,255,0.1);"><b>ANY</b></td><td style="padding:8px;border:1px solid rgba(255,255,255,0.1);">Anything</td><td style="padding:8px;border:1px solid rgba(255,255,255,0.1);">Anywhere</td><td style="padding:8px;border:1px solid rgba(255,255,255,0.1);">Anyone</td></tr>
          <tr><td style="padding:8px;border:1px solid rgba(255,255,255,0.1);"><b>EVERY</b></td><td style="padding:8px;border:1px solid rgba(255,255,255,0.1);">Everything</td><td style="padding:8px;border:1px solid rgba(255,255,255,0.1);">Everywhere</td><td style="padding:8px;border:1px solid rgba(255,255,255,0.1);">Everyone</td></tr>
          <tr><td style="padding:8px;border:1px solid rgba(255,255,255,0.1);"><b>NO</b></td><td style="padding:8px;border:1px solid rgba(255,255,255,0.1);">Nothing</td><td style="padding:8px;border:1px solid rgba(255,255,255,0.1);">Nowhere</td><td style="padding:8px;border:1px solid rgba(255,255,255,0.1);">No one</td></tr>
        </tbody>
      </table>`
    }
  ];

  await supabase.from('curriculum_topics').update({
    'Topic Name': 'Time Words Mastery & Indefinite Pronouns',
    'LDS_Formula': 'Do/Did + Shall/Should/Must/May/Might + [Some/Any/Every/No + thing/where/one]',
    'AI_Context': 'Pedagogía Santiago Henao: Completar palabras de tiempo (do, did, shall, should, must, may, might) y la matriz de pronombres indefinidos con every, any, no, some y sus sufijos -thing, -where, -one.',
    'Cached Slides': JSON.stringify(topic2Slides)
  }).eq('id', 'recTopic2');

  // Tema 3: WH-Words Duales: Preguntas vs Conectores Relativos Afirmativos
  const topic3Slides = [
    {
      title: "❓ Preguntas WH vs 🔗 Conectores WH Afirmativos",
      content: `<p>Las palabras <b>WH</b> (What, Where, When, Why, Who, How, Which) cumplen dos roles esenciales:</p>
      <div style="margin:14px 0;padding:12px;background:rgba(124,58,237,0.12);border-left:4px solid #7c3aed;border-radius:6px;">
        <h4 style="margin:0 0 6px 0;color:#c084fc;">1. Como Pregunta Directa (Inversión con Palabra de Tiempo)</h4>
        <p style="margin:0;"><b>WH + Tiempo + Sujeto + Acción?</b> → <i>"Where do you live?" / "What can she do?"</i></p>
      </div>
      <div style="margin:14px 0;padding:12px;background:rgba(16,185,129,0.12);border-left:4px solid #10b981;border-radius:6px;">
        <h4 style="margin:0 0 6px 0;color:#34d399;">2. Como Conector Afirmativo (Orden Directo de Bandera)</h4>
        <p style="margin:0;"><b>Sujeto + Acción + [WH + Sujeto + Tiempo + Acción]</b> → <i>"I know <b>where you live</b>." / "This is <b>what I want</b>."</i></p>
      </div>
      <p><b>Trampa común:</b> En la afirmación nunca invertimos el auxiliar (no decimos <i>"I know where do you live"</i> ❌ sino <i>"I know where you live"</i> ✅).</p>`
    }
  ];

  await supabase.from('curriculum_topics').update({
    'Topic Name': 'WH-Words: Questions & Relative Affirmations',
    'LDS_Formula': 'Pregunta: WH + Tiempo + Persona + Acción? | Afirmación: Persona + Acción + [WH + Persona + Tiempo + Acción]',
    'AI_Context': 'Pedagogía Santiago Henao: Popurrí de WH-words (what, where, when, why, who, how, which). Diferenciación clara entre preguntas directas (con inversión) y oraciones afirmativas relativas (orden natural de bandera sin inversión).',
    'Cached Slides': JSON.stringify(topic3Slides)
  }).eq('id', 'recTopic3');

  // Tema 4: Ley de Signos (Sin Doble Negación) + Modo Imperativo (Órdenes)
  const topic4Slides = [
    {
      title: "⚖️ La Ley de Signos en Inglés (Cero Doble Negación)",
      content: `<p>En español decimos comúnmente <i>"No sé nada"</i> o <i>"No vino nadie"</i>. En inglés rige la <b>Ley Matemática de Signos</b>:</p>
      <p style="padding:10px;background:rgba(239,68,68,0.12);border-left:4px solid #ef4444;border-radius:6px;">
        <b>Dos negativos dan un positivo:</b> Si dices <i>"I don't know nothing"</i>, matemáticamente estás diciendo que sí sabes algo.<br/>
        ✅ <b>Opción 1:</b> <i>"I don't know <b>anything</b>"</i> (Auxiliar Negativo + Indefinido Neutro Any).<br/>
        ✅ <b>Opción 2:</b> <i>"I know <b>nothing</b>"</i> (Verbo Afirmativo + Indefinido Negativo No).
      </p>`
    },
    {
      title: "📢 El Modo Imperativo (Órdenes e Instrucciones)",
      content: `<p>Cuando damos órdenes, instrucciones o comandos directos, eliminamos la persona y comenzamos directamente con la acción:</p>
      <ul>
        <li>✅ <b>Afirmativo:</b> <i>"Listen to me!" / "Open the door."</i></li>
        <li>🛑 <b>Negativo:</b> <i>"Don't worry." / "Don't touch that."</i></li>
      </ul>
      <p>Es la única estructura donde la Persona desaparece intencionalmente para dar una orden directa.</p>`
    }
  ];

  await supabase.from('curriculum_topics').update({
    'Topic Name': 'Sign Law (No Double Negatives) & Imperatives',
    'LDS_Formula': 'Negación: Sujeto + Tiempo+Not + Anything/Anywhere | Imperativo: Acción Base! / Don\'t + Acción Base!',
    'AI_Context': 'Pedagogía Santiago Henao: Ley de signos en inglés (prohibición de la doble negación española, uso de any vs no) y Modo Imperativo para órdenes directas afirmativas y negativas.',
    'Cached Slides': JSON.stringify(topic4Slides)
  }).eq('id', 'recTopic4');

  // Tema 5: Integración y Fluidez Conversacional (Los 4 Pilares)
  const topic5Slides = [
    {
      title: "🚀 Consolidación de los 4 Pilares de Fluidez",
      content: `<p>En esta sesión integramos con fluidez en tiempo real:</p>
      <ol>
        <li>🟡🔵🔴 La estructura de bandera (Persona + Tiempo + Acción).</li>
        <li>Las 12 palabras de tiempo y la matriz de indefinidos (some, any, no, every).</li>
        <li>Conexiones complejas con WH afirmadas.</li>
        <li>Negaciones perfectas sin trampas y comandos directos.</li>
      </ol>
      <p style="padding:10px;background:rgba(16,185,129,0.12);border-left:4px solid #10b981;border-radius:6px;">
        <b>Objetivo alcanzado:</b> El alumno ya cuenta con la arquitectura completa para formular cualquier pensamiento en inglés sin recurrir a la traducción literal.
      </p>`
    }
  ];

  await supabase.from('curriculum_topics').update({
    'Topic Name': 'Foundation Integration & Conversational Fluency',
    'LDS_Formula': 'Integración Fluida: Bandera Tricolor + Matriz de Tiempo + WH-Connectors + Negación/Imperativo',
    'AI_Context': 'Pedagogía Santiago Henao: Sesión 5 de consolidación práctica e integración conversacional de los 4 pilares fundamentales antes de avanzar a la clase 6.',
    'Cached Slides': JSON.stringify(topic5Slides)
  }).eq('id', 'recTopic5');

  console.log('--- 2. Vinculando a Mónica Torres con Santiago Henao en student_teacher ---');
  // Check if link already exists
  const { data: existingST } = await supabase
    .from('student_teacher')
    .select('id')
    .eq('Student', monicaId)
    .eq('Teacher', santiagoTeacherId);

  if (!existingST || existingST.length === 0) {
    const { error: insErr } = await supabase.from('student_teacher').insert({
      Student: monicaId,
      Teacher: santiagoTeacherId,
      Status: 'Active',
      'Start Date': '2026-10-01',
      'Notes': 'Profesor asignado: Santiago Henao. Clase compartida con compañera en el mismo horario.',
      'Recurrence Day': 'Mie,Vie',
      'Recurrence Time': '11:00 AM'
    });
    console.log('Inserted student_teacher:', insErr ? insErr.message : 'OK');
  } else {
    await supabase.from('student_teacher').update({
      Status: 'Active',
      'Start Date': '2026-10-01',
      'Notes': 'Profesor asignado: Santiago Henao. Clase compartida con compañera en el mismo horario.',
      'Recurrence Day': 'Mie,Vie',
      'Recurrence Time': '11:00 AM'
    }).eq('id', existingST[0].id);
    console.log('Updated existing student_teacher link');
  }

  console.log('--- 3. Actualizando datos de Mónica en students ---');
  // Update students row
  await supabase.from('students').update({
    Teacher: santiagoTeacherId,
    'Tokens de Reposición': '0',
    'Classes Remaining': '2', // 8 classes in month 1: 5 seen + 1 today = 6. 2 remaining next week to complete the month.
    'Notes': 'Profesor: Santiago Henao | Horario: Miércoles y Viernes 11:00 AM | Mes 1: 5 clases vistas, 6ta clase hoy, 2 clases restantes la próxima semana.'
  }).eq('id', monicaId);

  console.log('--- 4. Creando o actualizando las 8 sesiones del Ciclo Mes 1 (Clases 1 a 5 Seen, 6 Scheduled hoy, 7 y 8 Scheduled próxima semana) ---');

  // Dates:
  // Class 1: Wed Oct 7, 2026 at 11:00 AM COT (16:00 UTC) -> Seen, recTopic1
  // Class 2: Fri Oct 9, 2026 at 11:00 AM COT (16:00 UTC) -> Seen, recTopic2
  // Class 3: Wed Oct 14, 2026 at 11:00 AM COT (16:00 UTC) -> Seen, recTopic3
  // Class 4: Fri Oct 16, 2026 at 11:00 AM COT (16:00 UTC) -> Seen, recTopic4
  // Class 5: Wed Oct 21, 2026 at 11:00 AM COT (16:00 UTC) -> Seen, recTopic5
  // Class 6: Fri Oct 23, 2026 at 11:00 AM COT (16:00 UTC) -> Scheduled (HOY en media hora!)
  // Class 7: Wed Oct 28, 2026 at 11:00 AM COT (16:00 UTC) -> Scheduled (Próxima semana)
  // Class 8: Fri Oct 30, 2026 at 11:00 AM COT (16:00 UTC) -> Scheduled (Próxima semana - Fin de mes 1)

  const schedulePlan = [
    { num: 1, date: '2026-10-07T16:00:00.000Z', status: 'Seen', topic: 'recTopic1', name: 'Clase 1: Bandera de Colombia & Primeras 6 Palabras de Tiempo — Monica Torres' },
    { num: 2, date: '2026-10-09T16:00:00.000Z', status: 'Seen', topic: 'recTopic2', name: 'Clase 2: Palabras de Tiempo & Indefinidos — Monica Torres' },
    { num: 3, date: '2026-10-14T16:00:00.000Z', status: 'Seen', topic: 'recTopic3', name: 'Clase 3: WH Preguntas y Conectores — Monica Torres' },
    { num: 4, date: '2026-10-16T16:00:00.000Z', status: 'Seen', topic: 'recTopic4', name: 'Clase 4: Ley de Signos & Modo Imperativo — Monica Torres' },
    { num: 5, date: '2026-10-21T16:00:00.000Z', status: 'Seen', topic: 'recTopic5', name: 'Clase 5: Consolidación e Integración Fluida — Monica Torres' },
    { num: 6, date: '2026-10-23T16:00:00.000Z', status: 'Scheduled', topic: 'recTopic6', name: 'Clase 6: The Detective (Yes/No Questions) — Monica Torres' },
    { num: 7, date: '2026-10-28T16:00:00.000Z', status: 'Scheduled', topic: 'recTopic7', name: 'Clase 7: Wh- Questions Informativas — Monica Torres' },
    { num: 8, date: '2026-10-30T16:00:00.000Z', status: 'Scheduled', topic: 'recTopic8', name: 'Clase 8: Wh- Words Afirmativas — Monica Torres' },
  ];

  // Clean old Monica sessions if any exist
  const { data: oldP } = await supabase.from('session_participants').select('id, Session').eq('Student', monicaId);
  const oldSessionIds = (oldP || []).map(p => p.Session).filter(Boolean);
  if (oldSessionIds.length > 0) {
    await supabase.from('session_participants').delete().eq('Student', monicaId);
    await supabase.from('sessions').delete().in('id', oldSessionIds);
  }

  for (const item of schedulePlan) {
    const { data: sessRec, error: sessErr } = await supabase.from('sessions').insert({
      'Session Name': item.name,
      Teacher: santiagoTeacherId,
      'Curriculum Topic': item.topic,
      'Scheduled Date/Time': item.date,
      'Duration (minutes)': '60',
      'Location/Link': 'https://meet.google.com/yqm-edtu-veb',
      Status: item.status,
      'Notes (internal)': `Clase regular Miércoles y Viernes 11:00 AM con Santiago Henao.`
    }).select().single();

    if (sessErr || !sessRec) {
      console.error('Error creating session:', item.num, sessErr);
      continue;
    }

    // Insert participant
    await supabase.from('session_participants').insert({
      Session: sessRec.id,
      Student: monicaId,
      Attendance: item.status === 'Seen' ? 'Attended' : 'Scheduled',
      'Curriculum Topic': item.topic
    });

    console.log(`Clase ${item.num} creada (${item.status}) -> ${sessRec.id}`);
  }

  console.log('--- 5. Actualizando student_topic_progress para Temas 1 a 5 ---');
  // Clean existing topic progress for Monica
  await supabase.from('student_topic_progress').delete().eq('Student', monicaId);

  // Insert progress for topics 1 to 5 as Bronze or Silver tier to reflect mastery
  for (let t = 1; t <= 5; t++) {
    await supabase.from('student_topic_progress').insert({
      'Student + Topic': `${monicaId}-recTopic${t}`,
      Student: monicaId,
      'Curriculum Topic': String(t),
      Status: 'Bronze',
      'Completed At': '2026-10-21T17:00:00.000Z',
      Notes: 'Completado en clase presencial/en vivo con Santiago Henao'
    });
  }

  console.log('--- MIGRACIÓN Y REFINAMIENTO DE CURRICULUM COMPLETADOS CON ÉXITO ---');
}

main().catch(console.error);
