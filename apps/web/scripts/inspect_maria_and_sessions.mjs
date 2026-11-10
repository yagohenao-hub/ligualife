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
  // 1. Search for Maria Camila
  const { data: students } = await supabase
    .from('students')
    .select('*')
    .ilike('Full Name', '%maria%camila%');
  console.log('Search Maria Camila:', JSON.stringify(students, null, 2));

  if (!students || students.length === 0) {
    const { data: allRecent } = await supabase
      .from('students')
      .select('id, "Full Name", Email, Phone, created_at')
      .order('created_at', { ascending: false })
      .limit(10);
    console.log('Recent students:', JSON.stringify(allRecent, null, 2));
  }

  // 2. Fetch existing sessions for Monica
  const monicaId = '23cf0a83-2436-4569-bfde-45c3f9ad23cf';
  const { data: participants } = await supabase
    .from('session_participants')
    .select('*, Session(*)')
    .eq('Student', monicaId);

  console.log('Monica sessions count:', participants?.length);
  const sortedSessions = (participants || []).map(p => ({
    participantId: p.id,
    sessionId: p.Session?.id,
    sessionName: p.Session?.['Session Name'],
    date: p.Session?.['Scheduled Date/Time'],
    status: p.Session?.['Status'],
    topic: p.Session?.['Curriculum Topic']
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  console.log('Current Monica sessions:', JSON.stringify(sortedSessions, null, 2));
}

main().catch(console.error);
