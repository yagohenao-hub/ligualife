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

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

async function main() {
  const { data: currs } = await supabase.from('curriculums').select('*');
  console.log('Curriculums:', currs);

  const { data: monCurr } = await supabase
    .from('student_curriculum')
    .select('*')
    .in('Student', ['23cf0a83-2436-4569-bfde-45c3f9ad23cf', '7cc88332-5008-4dc6-89c8-20bc91ccd1c6']);
  console.log('Student Curriculums for Monica/Camila:', monCurr);

  // Check how topics are queried by sessions
  const { data: top7 } = await supabase.from('curriculum_topics').select('*').eq('id', 'recTopic7');
  const { data: top8 } = await supabase.from('curriculum_topics').select('*').eq('id', 'recTopic8');
  console.log('recTopic7:', top7);
  console.log('recTopic8:', top8);
}

main().catch(console.error);

