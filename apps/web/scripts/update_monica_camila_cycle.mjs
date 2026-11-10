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
  const mariaCamilaId = '7cc88332-5008-4dc6-89c8-20bc91ccd1c6';
  const santiagoTeacherId = '20682d77-308a-45f6-895d-cb337faf7a3a';

  console.log('=== 1. VINCULANDO A MARÍA CAMILA MORENO CON SANTIAGO HENAO ===');
  // Check if Maria Camila already has student_teacher link
  const { data: mcSt } = await supabase
    .from('student_teacher')
    .select('id')
    .eq('Student', mariaCamilaId)
    .eq('Teacher', santiagoTeacherId);

  if (!mcSt || mcSt.length === 0) {
    const { error: insErr } = await supabase.from('student_teacher').insert({
      Student: mariaCamilaId,
      Teacher: santiagoTeacherId,
      Status: 'Active',
      'Start Date': '2026-10-01',
      Notes: 'Profesor asignado: Santiago Henao. Clase grupal compartida con Mónica Torres.',
      'Recurrence Day': 'Mie,Vie',
      'Recurrence Time': '11:00 AM'
    });
    console.log('Inserted student_teacher for Maria Camila:', insErr ? insErr.message : 'OK');
  } else {
    await supabase.from('student_teacher').update({
      Status: 'Active',
      'Start Date': '2026-10-01',
      Notes: 'Profesor asignado: Santiago Henao. Clase grupal compartida con Mónica Torres.',
      'Recurrence Day': 'Mie,Vie',
      'Recurrence Time': '11:00 AM'
    }).eq('id', mcSt[0].id);
    console.log('Updated student_teacher for Maria Camila');
  }

  // Also update Monica's student_teacher notes to reference Maria Camila
  const { data: monSt } = await supabase
    .from('student_teacher')
    .select('id')
    .eq('Student', monicaId)
    .eq('Teacher', santiagoTeacherId);

  if (monSt && monSt.length > 0) {
    await supabase.from('student_teacher').update({
      Notes: 'Profesor asignado: Santiago Henao. Clase grupal compartida con María Camila Moreno.',
      'Recurrence Day': 'Mie,Vie',
      'Recurrence Time': '11:00 AM'
    }).eq('id', monSt[0].id);
    console.log('Updated student_teacher for Monica');
  }

  console.log('=== 2. ACTUALIZANDO PERFILES EN STUDENTS ===');
  const sharedNotes = 'Profesor: Santiago Henao | Horario: Miércoles y Viernes 11:00 AM | Clase compartida Mónica Torres & María Camila Moreno. Mes 1: 6 clases vistas, 7ma clase hoy viernes 30 de octubre, 8va clase el próximo miércoles 4 de noviembre para cierre de mes.';

  await supabase.from('students').update({
    Teacher: santiagoTeacherId,
    Status: 'Active',
    'Open to Group Classes': 'true',
    'Tokens de Reposición': '0',
    'Classes Remaining': '2',
    Notes: sharedNotes
  }).eq('id', monicaId);
  console.log('Updated Monica in students');

  await supabase.from('students').update({
    Teacher: santiagoTeacherId,
    Status: 'Active',
    'Open to Group Classes': 'true',
    'Tokens de Reposición': '0',
    'Classes Remaining': '2',
    Notes: sharedNotes
  }).eq('id', mariaCamilaId);
  console.log('Updated Maria Camila in students');

  console.log('=== 3. AJUSTANDO SESIONES SEGÚN EL RECORRIDO REAL ===');

  // Cancel Friday Oct 23 session if it exists
  const { data: oct23Sess } = await supabase
    .from('sessions')
    .select('id')
    .eq('Scheduled Date/Time', '2026-10-23T16:00:00.000Z');

  for (const s of oct23Sess || []) {
    await supabase.from('sessions').update({
      Status: 'Canceled',
      'Canceled Reason': 'Reprogramada de común acuerdo para el miércoles 28 de octubre',
      'Notes (internal)': 'Clase 6 cancelada el 23 de oct y repuesta el miércoles 28 de oct con Mónica y María Camila.'
    }).eq('id', s.id);
    console.log(`Canceled session on Oct 23 -> ${s.id}`);
  }

  // Define the exact schedule of the 8 classes of Month 1
  const fullSessions = [
    {
      num: 1,
      name: 'Clase 1: Bandera de Colombia & Primeras 6 Palabras de Tiempo — Mónica Torres & María Camila Moreno',
      topic: 'recTopic1',
      date: '2026-10-07T16:00:00.000Z',
      status: 'Seen'
    },
    {
      num: 2,
      name: 'Clase 2: Palabras de Tiempo & Indefinidos — Mónica Torres & María Camila Moreno',
      topic: 'recTopic2',
      date: '2026-10-09T16:00:00.000Z',
      status: 'Seen'
    },
    {
      num: 3,
      name: 'Clase 3: WH Preguntas y Conectores — Mónica Torres & María Camila Moreno',
      topic: 'recTopic3',
      date: '2026-10-14T16:00:00.000Z',
      status: 'Seen'
    },
    {
      num: 4,
      name: 'Clase 4: Ley de Signos & Modo Imperativo — Mónica Torres & María Camila Moreno',
      topic: 'recTopic4',
      date: '2026-10-16T16:00:00.000Z',
      status: 'Seen'
    },
    {
      num: 5,
      name: 'Clase 5: Consolidación e Integración Fluida — Mónica Torres & María Camila Moreno',
      topic: 'recTopic5',
      date: '2026-10-21T16:00:00.000Z',
      status: 'Seen'
    },
    {
      num: 6,
      name: 'Clase 6: The Detective (Yes/No Questions) — Mónica Torres & María Camila Moreno',
      topic: 'recTopic6',
      date: '2026-10-28T16:00:00.000Z',
      status: 'Seen'
    },
    {
      num: 7,
      name: 'Clase 7: Wh- Questions Informativas — Mónica Torres & María Camila Moreno',
      topic: 'recTopic7',
      date: '2026-10-30T16:00:00.000Z',
      status: 'Scheduled'
    },
    {
      num: 8,
      name: 'Clase 8: Wh- Words Afirmativas (Cierre Mes 1) — Mónica Torres & María Camila Moreno',
      topic: 'recTopic8',
      date: '2026-11-04T16:00:00.000Z',
      status: 'Scheduled'
    }
  ];

  for (const sPlan of fullSessions) {
    // Check if session with this date and topic exists (excluding canceled ones)
    const { data: existing } = await supabase
      .from('sessions')
      .select('id, Status')
      .eq('Scheduled Date/Time', sPlan.date)
      .neq('Status', 'Canceled');

    let sessId;
    if (existing && existing.length > 0) {
      sessId = existing[0].id;
      await supabase.from('sessions').update({
        'Session Name': sPlan.name,
        Teacher: santiagoTeacherId,
        'Curriculum Topic': sPlan.topic,
        Status: sPlan.status,
        'Duration (minutes)': '60',
        'Location/Link': 'https://meet.google.com/yqm-edtu-veb',
        'Notes (internal)': 'Clase regular Miércoles y Viernes 11:00 AM con Santiago Henao (Mónica y María Camila).'
      }).eq('id', sessId);
      console.log(`Updated Session ${sPlan.num} (${sPlan.status}) -> ${sessId}`);
    } else {
      const { data: created, error: crErr } = await supabase.from('sessions').insert({
        'Session Name': sPlan.name,
        Teacher: santiagoTeacherId,
        'Curriculum Topic': sPlan.topic,
        'Scheduled Date/Time': sPlan.date,
        Status: sPlan.status,
        'Duration (minutes)': '60',
        'Location/Link': 'https://meet.google.com/yqm-edtu-veb',
        'Notes (internal)': 'Clase regular Miércoles y Viernes 11:00 AM con Santiago Henao (Mónica y María Camila).'
      }).select().single();

      if (crErr || !created) {
        console.error('Error creating session:', crErr);
        continue;
      }
      sessId = created.id;
      console.log(`Created Session ${sPlan.num} (${sPlan.status}) -> ${sessId}`);
    }

    // Enroll BOTH Monica and Maria Camila
    for (const studentId of [monicaId, mariaCamilaId]) {
      const { data: pExist } = await supabase
        .from('session_participants')
        .select('id')
        .eq('Session', sessId)
        .eq('Student', studentId);

      if (!pExist || pExist.length === 0) {
        await supabase.from('session_participants').insert({
          Session: sessId,
          Student: studentId,
          Attendance: sPlan.status === 'Seen' ? 'Attended' : 'Scheduled',
          'Curriculum Topic': sPlan.topic
        });
        console.log(`  Enrolled student ${studentId.slice(0, 8)} in session ${sPlan.num}`);
      } else {
        await supabase.from('session_participants').update({
          Attendance: sPlan.status === 'Seen' ? 'Attended' : 'Scheduled',
          'Curriculum Topic': sPlan.topic
        }).eq('id', pExist[0].id);
      }
    }
  }

  console.log('=== 4. ACTUALIZANDO PROGRESO DE TEMAS (TEMAS 1 A 6 VISTOS) ===');
  // For both Monica and Maria Camila, topics 1 to 6 are completed ('Bronze' tier)
  for (const studentId of [monicaId, mariaCamilaId]) {
    // Delete old topic progress to avoid duplicates
    await supabase.from('student_topic_progress').delete().eq('Student', studentId);

    for (let t = 1; t <= 6; t++) {
      await supabase.from('student_topic_progress').insert({
        'Student + Topic': `${studentId}-recTopic${t}`,
        Student: studentId,
        'Curriculum Topic': String(t),
        Status: 'Bronze',
        'Completed At': t === 6 ? '2026-10-28T17:00:00.000Z' : '2026-10-21T17:00:00.000Z',
        Notes: 'Completado en clase en vivo con Santiago Henao'
      });
    }
    console.log(`Updated topics 1-6 progress for student ${studentId.slice(0, 8)}`);
  }

  console.log('=== ACTUALIZACIÓN COMPLETA CON ÉXITO ===');
}

main().catch(console.error);
