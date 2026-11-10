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
  const { data: sessList } = await supabase
    .from('sessions')
    .select('id, "Session Name", "Scheduled Date/Time", "Curriculum Topic", Status')
    .ilike('Session Name', '%Camila%');

  console.log('Shared sessions:', sessList);

  for (const s of sessList || []) {
    if (s['Session Name'].includes('Clase 6') || s['Curriculum Topic'] === 'recTopic6') {
      await supabase.from('sessions').update({
        'Session Name': 'Clase 6: Preposiciones In/On/At & Preposiciones al Final — Mónica Torres & María Camila Moreno',
        'Curriculum Topic': 'recTopic6'
      }).eq('id', s.id);
      console.log('Updated session 6 title on id:', s.id);
    }
  }
}

main().catch(console.error);
