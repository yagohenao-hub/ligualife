import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const envContent = fs.readFileSync(path.resolve('apps/web/.env.local'), 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const idx = line.indexOf('=');
  if (idx > -1) {
    const k = line.slice(0, idx).trim();
    env[k] = line.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
  }
});

const url = env.NEXT_PUBLIC_SUPABASE_URL || 'https://swmklobpnrkjpfackboc.supabase.co';
const key = env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key, { auth: { persistSession: false } });

async function main() {
  const monicaId = '23cf0a83-2436-4569-bfde-45c3f9ad23cf';
  const mariaCamilaId = '7cc88332-5008-4dc6-89c8-20bc91ccd1c6';
  const miguelId = 'd2907d52-0af0-45cd-9916-3e7638c6428f';
  const santiagoTeacherId = '20682d77-308a-45f6-895d-cb337faf7a3a';

  console.log('=============================================================================');
  console.log('1. ACTUALIZAR CLASES 7 Y 8 DE MÓNICA Y CAMILA A "SEEN"');
  console.log('=============================================================================');

  // Sesión 7 (Viernes 30 de Octubre)
  const sess7Id = '01e4d2bd-0340-49fb-864d-1732a330559d';
  await supabase.from('sessions').update({
    Status: 'Seen',
    'Session Name': 'Clase 7: El Modo Condicional (Would & Hipótesis) — Mónica Torres & María Camila Moreno',
    'Curriculum Topic': 'recTopic7'
  }).eq('id', sess7Id);

  await supabase.from('session_participants').update({
    Attendance: 'Attended'
  }).eq('Session', sess7Id);

  // Sesión 8 (Miércoles 4 de Noviembre)
  const sess8Id = '6f444b30-fd11-4d0c-b1ca-f83ba4f5d734';
  await supabase.from('sessions').update({
    Status: 'Seen',
    'Session Name': 'Clase 8: El Gerundio (Convertir el Verbo en Cosa con -ING) [Cierre Mes 1] — Mónica Torres & María Camila Moreno',
    'Curriculum Topic': 'recTopic8'
  }).eq('id', sess8Id);

  await supabase.from('session_participants').update({
    Attendance: 'Attended'
  }).eq('Session', sess8Id);

  console.log('Clases 7 y 8 marcadas como Seen exitosamente.');

  console.log('=============================================================================');
  console.log('2. PROGRAMAR MES 2 PARA MÓNICA Y CAMILA (INICIA MAÑANA MIÉRCOLES 11 NOV)');
  console.log('=============================================================================');

  // Fechas del Mes 2 (Miércoles y Viernes a las 11:00 AM hora Colombia = 16:00 UTC)
  // Clase 9: Miércoles 11 Noviembre 2026
  // Clase 10: Viernes 13 Noviembre 2026
  // Clase 11: Miércoles 18 Noviembre 2026
  // Clase 12: Viernes 20 Noviembre 2026
  // Clase 13: Miércoles 25 Noviembre 2026
  // Clase 14: Viernes 27 Noviembre 2026
  // Clase 15: Miércoles 2 Diciembre 2026
  // Clase 16: Viernes 4 Diciembre 2026
  const girlsMonth2Dates = [
    { num: 9, date: '2026-11-11T16:00:00.000Z', topic: 'recTopic9', title: 'Clase 9: The Imperative Mode & Direct Actions — Mónica Torres & María Camila Moreno' },
    { num: 10, date: '2026-11-13T16:00:00.000Z', topic: 'recTopic10', title: 'Clase 10: Continuous Logic (-ing base) — Mónica Torres & María Camila Moreno' },
    { num: 11, date: '2026-11-18T16:00:00.000Z', topic: 'recTopic11', title: 'Clase 11: Zero Conditional (Universal Truths) — Mónica Torres & María Camila Moreno' },
    { num: 12, date: '2026-11-20T16:00:00.000Z', topic: 'recTopic12', title: 'Clase 12: First Conditional (Real Predictions) — Mónica Torres & María Camila Moreno' },
    { num: 13, date: '2026-11-25T16:00:00.000Z', topic: 'recTopic13', title: 'Clase 13: Second Conditional (Hypothetical Dreams) — Mónica Torres & María Camila Moreno' },
    { num: 14, date: '2026-11-27T16:00:00.000Z', topic: 'recTopic14', title: 'Clase 14: Third Conditional (Forensic Past) — Mónica Torres & María Camila Moreno' },
    { num: 15, date: '2026-12-02T16:00:00.000Z', topic: 'recTopic15', title: 'Clase 15: Mixed Conditionals — Mónica Torres & María Camila Moreno' },
    { num: 16, date: '2026-12-04T16:00:00.000Z', topic: 'recTopic16', title: 'Clase 16: Consolidation & Milestone Showcase [Cierre Mes 2] — Mónica Torres & María Camila Moreno' }
  ];

  for (const item of girlsMonth2Dates) {
    // Check if session already exists for this date and teacher
    const { data: existSess } = await supabase
      .from('sessions')
      .select('id')
      .eq('Teacher', santiagoTeacherId)
      .eq('Scheduled Date/Time', item.date);

    let sessionId;
    if (existSess && existSess.length > 0) {
      sessionId = existSess[0].id;
      await supabase.from('sessions').update({
        Status: 'Scheduled',
        'Session Name': item.title,
        'Curriculum Topic': item.topic
      }).eq('id', sessionId);
    } else {
      const { data: newSess, error: sErr } = await supabase.from('sessions').insert({
        Teacher: santiagoTeacherId,
        'Scheduled Date/Time': item.date,
        Status: 'Scheduled',
        'Session Name': item.title,
        'Curriculum Topic': item.topic
      }).select('id').single();

      if (sErr) console.error(`Error inserting session ${item.num}:`, sErr.message);
      sessionId = newSess?.id;
    }

    if (sessionId) {
      // Participant for Monica
      const { data: pMon } = await supabase
        .from('session_participants')
        .select('id')
        .eq('Session', sessionId)
        .eq('Student', monicaId);

      if (!pMon || pMon.length === 0) {
        await supabase.from('session_participants').insert({
          Session: sessionId,
          Student: monicaId,
          Attendance: 'Scheduled',
          'Curriculum Topic': item.topic
        });
      }

      // Participant for Camila
      const { data: pCam } = await supabase
        .from('session_participants')
        .select('id')
        .eq('Session', sessionId)
        .eq('Student', mariaCamilaId);

      if (!pCam || pCam.length === 0) {
        await supabase.from('session_participants').insert({
          Session: sessionId,
          Student: mariaCamilaId,
          Attendance: 'Scheduled',
          'Curriculum Topic': item.topic
        });
      }
    }
  }

  // Actualizar perfil de Mónica y Camila en students
  const girlsSharedNotes = 'Profesor: Santiago Henao | Horario: Miércoles y Viernes 11:00 AM | Clase compartida Mónica Torres & María Camila Moreno. Mes 1 completado con éxito (8 clases vistas: temas 1 al 8). Mes 2 pagado y activo (8 clases restantes) comenzando mañana Miércoles 11 de Noviembre a las 11:00 AM.';

  await supabase.from('students').update({
    Teacher: santiagoTeacherId,
    Status: 'Active',
    'Open to Group Classes': 'true',
    'Tokens de Reposición': '0',
    'Classes Remaining': '8',
    Notes: girlsSharedNotes
  }).eq('id', monicaId);

  await supabase.from('students').update({
    Teacher: santiagoTeacherId,
    Status: 'Active',
    'Open to Group Classes': 'true',
    'Tokens de Reposición': '0',
    'Classes Remaining': '8',
    Notes: girlsSharedNotes
  }).eq('id', mariaCamilaId);

  console.log('Mónica y Camila actualizadas con 8 clases del Mes 2 pagadas y programadas.');

  console.log('=============================================================================');
  console.log('3. CONFIGURAR A MIGUEL AGUILAR EN SUPABASE');
  console.log('=============================================================================');

  // 3.1 Normalizar nombre en students y asignar profesor + notas + horario
  const miguelNotes = 'Profesor: Santiago Henao | Horario: Martes y Jueves 6:30 PM | Clase individual. Mes 1 completado (8 clases) + 2 clases vistas del Mes 2 (10 clases vistas en total con 2 sesiones de refuerzo conversacional). Hoy clase 3 del Mes 2 (Martes 10 de Noviembre a las 6:30 PM).';

  await supabase.from('students').update({
    'Full Name': 'Miguel Aguilar',
    Teacher: santiagoTeacherId,
    Status: 'Active',
    'Tokens de Reposición': '0',
    'Classes Remaining': '6',
    Notes: miguelNotes
  }).eq('id', miguelId);

  // 3.2 Crear o actualizar vínculo en student_teacher
  const { data: migSt } = await supabase
    .from('student_teacher')
    .select('id')
    .eq('Student', miguelId)
    .eq('Teacher', santiagoTeacherId);

  if (!migSt || migSt.length === 0) {
    await supabase.from('student_teacher').insert({
      Student: miguelId,
      Teacher: santiagoTeacherId,
      Status: 'Active',
      'Start Date': '2026-09-29',
      Notes: 'Profesor asignado: Santiago Henao. Clase individual martes y jueves 6:30 PM.',
      'Recurrence Day': 'Mar,Jue',
      'Recurrence Time': '6:30 PM'
    });
    console.log('Inserted student_teacher link for Miguel Aguilar');
  } else {
    await supabase.from('student_teacher').update({
      Status: 'Active',
      'Start Date': '2026-09-29',
      Notes: 'Profesor asignado: Santiago Henao. Clase individual martes y jueves 6:30 PM.',
      'Recurrence Day': 'Mar,Jue',
      'Recurrence Time': '6:30 PM'
    }).eq('id', migSt[0].id);
    console.log('Updated student_teacher link for Miguel Aguilar');
  }

  // 3.3 Crear las sesiones de Miguel Aguilar
  // Horario: Martes y Jueves a las 6:30 PM Colombia = 23:30 UTC
  // Miguel lleva 1 semana más que las chicas.
  // Visto: 10 clases (8 de mes 1 + 2 de mes 2).
  // 2 clases fueron de pura práctica conversacional con Santiago.
  // Hoy es Martes 10 de Noviembre: Clase 11 (Clase 3 del Mes 2).
  const miguelSessionsPlan = [
    // --- MES 1 (8 Clases Vistas) ---
    { num: 1, date: '2026-10-06T23:30:00.000Z', status: 'Seen', topic: 'recTopic1', title: 'Clase 1: The Universal Idea (S+T+A) & Time Words — Miguel Aguilar' },
    { num: 2, date: '2026-10-08T23:30:00.000Z', status: 'Seen', topic: 'recTopic2', title: 'Clase 2: Time Words Mastery & Indefinite Pronouns — Miguel Aguilar' },
    { num: 3, date: '2026-10-13T23:30:00.000Z', status: 'Seen', topic: 'recTopic3', title: 'Clase 3: WH-Words (Questions & Relative Connectors) — Miguel Aguilar' },
    { num: 4, date: '2026-10-15T23:30:00.000Z', status: 'Seen', topic: 'recTopic4', title: 'Clase 4: Sign Law & Imperatives — Miguel Aguilar' },
    { num: 5, date: '2026-10-20T23:30:00.000Z', status: 'Seen', topic: 'recTopic4', title: 'Clase 5: Sesión de Práctica y Refuerzo Pedagógico 1 — Miguel Aguilar' },
    { num: 6, date: '2026-10-22T23:30:00.000Z', status: 'Seen', topic: 'recTopic5', title: 'Clase 6: Foundation Integration & Conversational Fluency — Miguel Aguilar' },
    { num: 7, date: '2026-10-27T23:30:00.000Z', status: 'Seen', topic: 'recTopic6', title: 'Clase 7: Prepositions (In, On, At) & Preposition Stranding — Miguel Aguilar' },
    { num: 8, date: '2026-10-29T23:30:00.000Z', status: 'Seen', topic: 'recTopic6', title: 'Clase 8: Sesión de Práctica y Refuerzo Pedagógico 2 [Cierre Mes 1] — Miguel Aguilar' },

    // --- MES 2 (Inició la semana pasada, 2 vistas + HOY Clase 3) ---
    { num: 9, date: '2026-11-03T23:30:00.000Z', status: 'Seen', topic: 'recTopic7', title: 'Clase 9: The Conditional Mode (Would & Cortesía) [Mes 2, Clase 1] — Miguel Aguilar' },
    { num: 10, date: '2026-11-05T23:30:00.000Z', status: 'Seen', topic: 'recTopic8', title: 'Clase 10: The Gerund (Verbo como cosa con -ING) [Mes 2, Clase 2] — Miguel Aguilar' },
    // HOY Martes 10 Noviembre a las 6:30 PM (23:30 UTC):
    { num: 11, date: '2026-11-10T23:30:00.000Z', status: 'Scheduled', topic: 'recTopic9', title: 'Clase 11: The Imperative Mode & Direct Actions [Mes 2, Clase 3] — Miguel Aguilar' },
    // Próximas programadas del Mes 2:
    { num: 12, date: '2026-11-12T23:30:00.000Z', status: 'Scheduled', topic: 'recTopic10', title: 'Clase 12: Continuous Logic (-ing base) [Mes 2, Clase 4] — Miguel Aguilar' },
    { num: 13, date: '2026-11-17T23:30:00.000Z', status: 'Scheduled', topic: 'recTopic11', title: 'Clase 13: Zero Conditional (Universal Truths) [Mes 2, Clase 5] — Miguel Aguilar' },
    { num: 14, date: '2026-11-19T23:30:00.000Z', status: 'Scheduled', topic: 'recTopic12', title: 'Clase 14: First Conditional (Real Predictions) [Mes 2, Clase 6] — Miguel Aguilar' },
    { num: 15, date: '2026-11-24T23:30:00.000Z', status: 'Scheduled', topic: 'recTopic13', title: 'Clase 15: Second Conditional (Hypothetical Dreams) [Mes 2, Clase 7] — Miguel Aguilar' },
    { num: 16, date: '2026-11-26T23:30:00.000Z', status: 'Scheduled', topic: 'recTopic14', title: 'Clase 16: Third Conditional & Review [Cierre Mes 2] — Miguel Aguilar' }
  ];

  for (const item of miguelSessionsPlan) {
    // Check if session exists
    const { data: existSess } = await supabase
      .from('sessions')
      .select('id')
      .eq('Teacher', santiagoTeacherId)
      .eq('Scheduled Date/Time', item.date);

    let sessionId;
    if (existSess && existSess.length > 0) {
      sessionId = existSess[0].id;
      await supabase.from('sessions').update({
        Status: item.status,
        'Session Name': item.title,
        'Curriculum Topic': item.topic
      }).eq('id', sessionId);
    } else {
      const { data: newSess, error: sErr } = await supabase.from('sessions').insert({
        Teacher: santiagoTeacherId,
        'Scheduled Date/Time': item.date,
        Status: item.status,
        'Session Name': item.title,
        'Curriculum Topic': item.topic
      }).select('id').single();

      if (sErr) console.error(`Error inserting session for Miguel (#${item.num}):`, sErr.message);
      sessionId = newSess?.id;
    }

    if (sessionId) {
      const { data: pMig } = await supabase
        .from('session_participants')
        .select('id')
        .eq('Session', sessionId)
        .eq('Student', miguelId);

      if (!pMig || pMig.length === 0) {
        await supabase.from('session_participants').insert({
          Session: sessionId,
          Student: miguelId,
          Attendance: item.status === 'Seen' ? 'Attended' : 'Scheduled',
          'Curriculum Topic': item.topic
        });
      } else {
        await supabase.from('session_participants').update({
          Attendance: item.status === 'Seen' ? 'Attended' : 'Scheduled',
          'Curriculum Topic': item.topic
        }).eq('id', pMig[0].id);
      }
    }
  }

  console.log('Miguel Aguilar configurado con sus 10 clases vistas y sus clases del Mes 2 programadas.');
  console.log('=== PROCESO COMPLETADO EXITOSAMENTE ===');
}

main().catch(console.error);

