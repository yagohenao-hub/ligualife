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

async function listAllTables() {
  // Let's test common tables from schema_17_tables.sql
  const candidates = [
    'students', 'teachers', 'courses', 'classes', 'sessions', 'session_participants',
    'curriculum_topics', 'curriculum', 'vocabulary', 'vocabulary_words', 'vocabulary_senses',
    'homeworks', 'submissions', 'payments', 'evaluations', 'materials', 'messages', 'tokens',
    'student_progress', 'attendance', 'notes', 'feedback'
  ];

  const found = [];
  for (const c of candidates) {
    const { data, error } = await supabase.from(c).select('*').limit(1);
    if (!error) {
      found.push(c);
    }
  }
  console.log('Existing tables in Supabase:', found);
}

listAllTables().catch(console.error);
