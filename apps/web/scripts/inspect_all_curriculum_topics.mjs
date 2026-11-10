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

  console.log('Count of topics:', topics?.length);
  if (topics && topics.length > 0) {
    console.log('Columns in curriculum_topics:', Object.keys(topics[0]));
    const sorted = [...topics].sort((a,b) => parseInt(a.Order, 10) - parseInt(b.Order, 10));
    console.log('First 10 topics:');
    sorted.slice(0, 10).forEach(t => {
      console.log(`[#${t.Order}] ${t['Topic Name']} | Formula: ${t.LDS_Formula}`);
    });
  }
}

main().catch(console.error);
