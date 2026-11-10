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
  const { data: topics, error } = await supabase
    .from('curriculum_topics')
    .select('*')
    .eq('Curriculum', 'General English Course')
    .order('Order', { ascending: true })
    .limit(10);
  
  console.log('Topics error:', error);
  topics?.forEach(t => {
    console.log(`\n--- TOPIC #${t.Order}: ${t['Topic Name']} ---`);
    console.log('ID:', t.id);
    console.log('LDS_Formula:', t.LDS_Formula);
    console.log('AI_Context:', t.AI_Context);
    console.log('Fase:', t.Fase);
    console.log('Cached Warmup:', t['Cached Warmup'] ? 'YES' : 'NO');
    console.log('Cached Cooldown:', t['Cached Cooldown'] ? 'YES' : 'NO');
    console.log('Cached Slides:', t['Cached Slides'] ? 'YES' : 'NO');
  });
}

main().catch(console.error);
