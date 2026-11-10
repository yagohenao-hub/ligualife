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

async function checkTables() {
  const candidates = [
    'vocabulary_words', 'vocabulary', 'words', 'vocabulary_senses', 'vocabulary_items',
    'student_vocabulary_state', 'student_vocabulary', 'vocabulary_progress',
    'curriculum_topics', 'students', 'classes', 'sessions'
  ];
  for (const table of candidates) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.log(`Table ${table}: NOT FOUND or ERROR: ${error.message}`);
    } else {
      console.log(`Table ${table}: EXISTS! (found ${data?.length} rows in sample)`);
    }
  }
}

checkTables().catch(console.error);
