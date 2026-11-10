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
  console.log('=== BUSCAR MONICA Y ALUMNOS ===');
  // Inspect students table columns and search for Monica
  const { data: students, error: sErr } = await supabase.from('students').select('*');
  console.log('Total students:', students?.length, sErr);

  const monicaList = students?.filter(s => {
    const name = (s.Name || s.full_name || s['Full Name'] || '').toLowerCase();
    const email = (s.Email || s.email || '').toLowerCase();
    return name.includes('monica') || name.includes('mónica') || name.includes('torres') || email.includes('monica');
  });
  console.log('Mónica Torres encontrada(s):', JSON.stringify(monicaList, null, 2));

  // Let's print all student names to see who might be the second student
  console.log('Todos los alumnos:');
  students?.forEach(s => {
    console.log(`- ID: ${s.id} | Name: ${s.Name || s.full_name || s['Full Name']} | Email: ${s.Email || s.email} | PIN: ${s.PIN || s.pin} | Status: ${s.Status || s.status}`);
  });

  // Let's check curriculum_topics: get all topics for the primary curriculum (Core LDS or Foundation)
  const { data: topics, error: tErr } = await supabase
    .from('curriculum_topics')
    .select('*')
    .order('Order', { ascending: true });
  console.log('\n=== CURRICULUM TOPICS ===');
  console.log('Total curriculum topics:', topics?.length);
  topics?.slice(0, 15).forEach(t => {
    console.log(`Order: ${t.Order} | Topic: ${t['Topic Name'] || t.name} | Curriculum: ${t.Curriculum} | Formula: ${t.LDS_Formula} | Fase: ${t.Fase}`);
  });
}

main().catch(console.error);
