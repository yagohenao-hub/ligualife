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
  
  // 1. student_teacher relation
  const { data: stM } = await supabase.from('student_teacher').select('*').eq('Student', monicaId);
  console.log('Monica student_teacher:', stM);

  // 2. sessions
  const { data: sessM } = await supabase.from('sessions').select('*').ilike('Session Name', '%monica%');
  console.log('Monica sessions by name:', sessM);

  // 3. session_participants
  const { data: spM } = await supabase.from('session_participants').select('*').eq('Student', monicaId);
  console.log('Monica session_participants:', spM);

  // 4. student_topic_progress
  const { data: stpM } = await supabase.from('student_topic_progress').select('*').eq('Student', monicaId);
  console.log('Monica topic progress:', stpM);

  // 5. student_curriculum
  const { data: scM } = await supabase.from('student_curriculum').select('*').eq('Student', monicaId);
  console.log('Monica student_curriculum:', scM);

  // 6. Check teacher Santiago details
  const { data: santi } = await supabase.from('teachers').select('*').ilike('Name', '%santiago%');
  console.log('Santiago teacher:', santi);
}

main().catch(console.error);
