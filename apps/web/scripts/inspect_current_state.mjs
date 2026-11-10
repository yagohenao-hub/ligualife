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

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key, { auth: { persistSession: false } });

async function inspect() {
  console.log('=== 1. BUSCANDO A MIGUEL AGUILAR ===');
  const { data: miguel, error: mErr } = await supabase
    .from('students')
    .select('*')
    .ilike('Full Name', '%Miguel%');
  console.log('Miguel students result:', miguel, mErr?.message);

  console.log('=== 2. ESTUDIANTES MÓNICA Y CAMILA ===');
  const { data: girls, error: gErr } = await supabase
    .from('students')
    .select('*')
    .in('id', ['23cf0a83-2436-4569-bfde-45c3f9ad23cf', '7cc88332-5008-4dc6-89c8-20bc91ccd1c6']);
  console.log('Girls result:', girls?.map(g => ({
    id: g.id,
    name: g['Full Name'],
    pin: g['PIN'],
    status: g['Status'],
    tokens: g['Tokens de Reposición'],
    classes_remaining: g['Classes Remaining'],
    notes: g['Notes'],
    current_topic: g['Current Topic (Bot)']
  })), gErr?.message);

  console.log('=== 3. SANTIAGO HENAO (TEACHER) ===');
  const { data: teacher } = await supabase
    .from('teachers')
    .select('*')
    .eq('id', '20682d77-308a-45f6-895d-cb337faf7a3a');
  console.log('Teacher Santiago:', teacher);

  console.log('=== 4. STUDENT_TEACHER RELATIONS ===');
  const { data: stRel } = await supabase
    .from('student_teacher')
    .select('*');
  console.log('Student-Teacher relations:', stRel);

  console.log('=== 5. TOPICS 6, 7, 8, 9, 10, 11 EN CURRICULUM_TOPICS ===');
  const { data: topics } = await supabase
    .from('curriculum_topics')
    .select('id, "Topic Name", "Order", "Level", "Fase", "LDS_Formula", "Description"')
    .order('Order', { ascending: true });
  console.log('All Topics Count:', topics?.length);
  topics?.filter(t => [1,2,3,4,5,6,7,8,9,10,11,12].includes(Number(t.Order))).forEach(t => {
    console.log(`Topic #${t.Order} (${t.id}): ${t['Topic Name']} | Level: ${t.Level}`);
  });
}

inspect().catch(console.error);

