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

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function checkCurriculumTopics() {
  const { data, error } = await supabase
    .from('curriculum_topics')
    .select('id, "Topic Name", "Order", "Level", "Fase"')
    .order('Order', { ascending: true })
    .limit(20);
  console.log('Sample topics in DB:', data);
}

checkCurriculumTopics().catch(console.error);
