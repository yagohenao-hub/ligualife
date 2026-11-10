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
  const monicaId = '23cf0a83-2436-4569-bfde-45c3f9ad23cf';
  const camilaId = '7cc88332-5008-4dc6-89c8-20bc91ccd1c6';
  const miguelId = 'd2907d52-0af0-45cd-9916-3e7638c6428f';

  // 1. Fetch participants directly
  const { data: monParts } = await supabase
    .from('session_participants')
    .select('*')
    .eq('Student', monicaId);
  console.log('Monica session_participants raw:', monParts);

  const { data: camParts } = await supabase
    .from('session_participants')
    .select('*')
    .eq('Student', camilaId);
  console.log('Camila session_participants raw:', camParts);

  const { data: migParts } = await supabase
    .from('session_participants')
    .select('*')
    .eq('Student', miguelId);
  console.log('Miguel session_participants raw:', migParts);

  // 2. Fetch the sessions corresponding to Monica
  const sessionIds = (monParts || []).map(p => p.Session).filter(Boolean);
  console.log('Session IDs for Monica:', sessionIds);

  if (sessionIds.length > 0) {
    const { data: sessList } = await supabase
      .from('sessions')
      .select('id, "Scheduled Date/Time", Status, "Curriculum Topic", "Session Name"')
      .in('id', sessionIds);
    
    console.log('Sessions details for Monica:');
    sessList?.sort((a,b) => new Date(a['Scheduled Date/Time']||0) - new Date(b['Scheduled Date/Time']||0)).forEach(s => {
      console.log(`- ${s.id} | ${s['Scheduled Date/Time']} | Status: ${s.Status} | Topic: ${s['Curriculum Topic']} | Name: ${s['Session Name']}`);
    });
  }

  // 3. Inspect topic 6, 7, 8 in curriculum_topics
  const { data: topics } = await supabase
    .from('curriculum_topics')
    .select('*')
    .in('Order', ['6', '7', '8', '9', '10']);
  console.log('\nTopics 6-10 in curriculum_topics:', topics?.map(t => ({
    id: t.id,
    order: t.Order,
    name: t['Topic Name'],
    formula: t.LDS_Formula,
    context: t.AI_Context,
    description: t.Description
  })));
}

main().catch(console.error);

