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
  const { data: topics } = await supabase
    .from('curriculum_topics')
    .select('*')
    .eq('Curriculum', 'General English Course');

  const sorted = (topics || []).sort((a, b) => parseInt(a.Order, 10) - parseInt(b.Order, 10));

  sorted.slice(0, 10).forEach(t => {
    console.log(`\n=== ORDER: ${t.Order} | ID: ${t.id} ===`);
    console.log('Topic Name:', t['Topic Name']);
    console.log('LDS_Formula:', t.LDS_Formula);
    console.log('AI_Context:', t.AI_Context);
    console.log('Cached Slides Title Sample:', t['Cached Slides'] ? JSON.parse(t['Cached Slides'])[0]?.title : 'None');
  });
}

main().catch(console.error);
