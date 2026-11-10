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
  console.log('--- 1. BUSCAR ESTUDIANTE MONICA ---');
  const { data: monica, error: mErr } = await supabase.from('students').select('*').ilike('full_name', '%monica%');
  console.log('Mónica:', monica, mErr);

  console.log('--- 2. BUSCAR TODOS LOS ESTUDIANTES RECIENTES O CON TORRES ---');
  const { data: allStudents } = await supabase.from('students').select('id, full_name, email, pin, tokens, sessions_completed, status, created_at').order('created_at', { ascending: false }).limit(10);
  console.log('Estudiantes recientes:', allStudents);

  console.log('--- 3. BUSCAR PROFESORES (SANTIAGO) ---');
  const { data: teachers, error: tErr } = await supabase.from('teachers').select('*');
  console.log('Profesores:', teachers, tErr);

  console.log('--- 4. BUSCAR GRUPOS / STUDY GROUPS ---');
  const { data: groups, error: gErr } = await supabase.from('study_groups').select('*');
  console.log('Grupos de estudio:', groups, gErr);

  console.log('--- 5. BUSCAR RELACIÓN STUDENT_TEACHER ---');
  const { data: stRel, error: stErr } = await supabase.from('student_teacher').select('*');
  console.log('Student-Teacher relations:', stRel, stErr);

  console.log('--- 6. BUSCAR TEMAS DEL CURRICULUM ---');
  const { data: topics, error: topErr } = await supabase.from('curriculum_topics').select('id, order, name, lds_formula, common_mistake').order('order', { ascending: true }).limit(20);
  console.log('Primeros 20 temas de curriculum:', topics, topErr);

  console.log('--- 7. BUSCAR SESIONES REGISTRADAS ---');
  const { data: sessions, error: sessErr } = await supabase.from('sessions').select('*').order('date', { ascending: false }).limit(10);
  console.log('Últimas sesiones:', sessions, sessErr);
}

main().catch(console.error);
