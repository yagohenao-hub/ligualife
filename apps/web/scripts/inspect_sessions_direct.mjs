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
  const monicaId = '23cf0a83-2436-4569-bfde-45c3f9ad23cf';
  const { data: participants, error: pErr } = await supabase
    .from('session_participants')
    .select('*')
    .eq('Student', monicaId);

  console.log('Participants error:', pErr);
  console.log('Participants:', participants);

  const { data: sessList } = await supabase
    .from('sessions')
    .select('*')
    .ilike('Session Name', '%monica%');
  console.log('Sessions by Monica name:', sessList);
}

main().catch(console.error);
