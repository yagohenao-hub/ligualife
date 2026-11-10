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
  console.log('=== 1. MONICA TORRES ===');
  const { data: monica, error: mErr } = await supabase
    .from('students')
    .select('*')
    .or('full_name.ilike.%monica%,full_name.ilike.%torres%');
  console.log('Monica search:', JSON.stringify(monica, null, 2), mErr);

  console.log('=== 2. COLUMNS OF CURRICULUM_TOPICS ===');
  const { data: topics, error: tErr } = await supabase
    .from('curriculum_topics')
    .select('*')
    .limit(3);
  console.log('Topic sample:', JSON.stringify(topics, null, 2), tErr);

  console.log('=== 3. ALL CURRICULUM TOPICS (ORDERED) ===');
  const { data: allTopics, error: atErr } = await supabase
    .from('curriculum_topics')
    .select('"Order", Topic, "LDS Formula", "Common Mistake", "Topic Area", "Grammar Concept"')
    .order('Order', { ascending: true });
  console.log('All topics count:', allTopics?.length);
  console.log('Topics 1-15:', JSON.stringify(allTopics?.slice(0, 15), null, 2), atErr);

  console.log('=== 4. COLUMNS OF SESSIONS ===');
  const { data: sessions, error: sErr } = await supabase
    .from('sessions')
    .select('*')
    .limit(3);
  console.log('Sessions sample:', JSON.stringify(sessions, null, 2), sErr);

  console.log('=== 5. SESSIONS FOR SANTIAGO ===');
  const { data: santiagoSessions, error: ssErr } = await supabase
    .from('sessions')
    .select('*')
    .eq('Teacher', '20682d77-308a-45f6-895d-cb337faf7a3a')
    .limit(10);
  console.log('Santiago sessions count:', santiagoSessions?.length);
  console.log('Sample santiago sessions:', JSON.stringify(santiagoSessions?.slice(0, 3), null, 2), ssErr);
}

main().catch(console.error);
