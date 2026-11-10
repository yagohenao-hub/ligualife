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

async function checkSessions() {
  const monicaId = '23cf0a83-2436-4569-bfde-45c3f9ad23cf';
  const camilaId = '7cc88332-5008-4dc6-89c8-20bc91ccd1c6';
  const miguelId = 'd2907d52-0af0-45cd-9916-3e7638c6428f';

  // 1. Session participants for Monica
  const { data: monParts, error: mErr } = await supabase
    .from('session_participants')
    .select('*, Session(*)')
    .eq('Student', monicaId);

  if (mErr) console.error('mErr:', mErr);
  console.log('Monica session_participants count:', monParts?.length);
  const monSorted = (monParts || []).map(p => ({
    partId: p.id,
    sessId: p.Session?.id,
    name: p.Session?.['Session Name'],
    date: p.Session?.['Scheduled Date/Time'],
    status: p.Session?.Status,
    topic: p.Session?.['Curriculum Topic']
  })).sort((a,b) => new Date(a.date || 0) - new Date(b.date || 0));
  console.log('Monica sessions:', JSON.stringify(monSorted, null, 2));

  // 2. Session participants for Camila
  const { data: camParts, error: cErr } = await supabase
    .from('session_participants')
    .select('*, Session(*)')
    .eq('Student', camilaId);

  if (cErr) console.error('cErr:', cErr);
  console.log('\nCamila session_participants count:', camParts?.length);
  const camSorted = (camParts || []).map(p => ({
    partId: p.id,
    sessId: p.Session?.id,
    name: p.Session?.['Session Name'],
    date: p.Session?.['Scheduled Date/Time'],
    status: p.Session?.Status,
    topic: p.Session?.['Curriculum Topic']
  })).sort((a,b) => new Date(a.date || 0) - new Date(b.date || 0));
  console.log('Camila sessions:', JSON.stringify(camSorted, null, 2));

  // 3. Session participants for Miguel
  const { data: migParts, error: migErr } = await supabase
    .from('session_participants')
    .select('*, Session(*)')
    .eq('Student', miguelId);

  if (migErr) console.error('migErr:', migErr);
  console.log('\nMiguel session_participants count:', migParts?.length);

  // 4. Also check if there are sessions mentioning Miguel in Session Name or Notes
  const { data: migNamedSess } = await supabase
    .from('sessions')
    .select('*')
    .ilike('Session Name', '%Miguel%');
  console.log('Sessions with Miguel in name:', migNamedSess);
}

checkSessions().catch(console.error);
