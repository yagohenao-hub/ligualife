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
  const { data: st } = await supabase.from('student_teacher').select('*').limit(5);
  console.log('Sample student_teacher:', JSON.stringify(st, null, 2));

  const { data: sess } = await supabase.from('sessions').select('*').limit(3);
  console.log('Sample sessions:', JSON.stringify(sess, null, 2));

  const { data: sp } = await supabase.from('session_participants').select('*').limit(3);
  console.log('Sample session_participants:', JSON.stringify(sp, null, 2));
}

main().catch(console.error);
