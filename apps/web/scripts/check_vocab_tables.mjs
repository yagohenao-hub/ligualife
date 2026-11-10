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
  const tables = ['vocabulary_words', 'vocabulary_senses', 'vocabulary_relations', 'student_vocabulary_state', 'vocabulary_game_sessions'];
  for (const t of tables) {
    const { data, error } = await supabase.from(t).select('count', { count: 'exact', head: true });
    if (error) {
      console.log(`Table ${t}: NOT FOUND or ERROR (${error.message})`);
    } else {
      console.log(`Table ${t}: EXISTS!`);
    }
  }
}

main().catch(console.error);
