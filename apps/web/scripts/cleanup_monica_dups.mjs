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
  const mariaCamilaId = '7cc88332-5008-4dc6-89c8-20bc91ccd1c6';

  // 1. Get Maria Camila's session participants
  const { data: mcParts } = await supabase
    .from('session_participants')
    .select('*')
    .eq('Student', mariaCamilaId);

  const sharedSessionIds = (mcParts || []).map(p => p.Session);
  console.log('Shared session IDs for the group (count: ' + sharedSessionIds.length + '):', sharedSessionIds);

  // 2. Remove all Monica's participants that are NOT in the shared session IDs
  const { data: monicaParts } = await supabase
    .from('session_participants')
    .select('*')
    .eq('Student', monicaId);

  const orphanedSessionIds = [];
  for (const p of monicaParts || []) {
    if (!sharedSessionIds.includes(p.Session)) {
      orphanedSessionIds.push(p.Session);
      await supabase.from('session_participants').delete().eq('id', p.id);
    }
  }

  // Also remove duplicate participants if Monica is enrolled twice in the same session
  const seenSessions = new Set();
  const { data: remainingMonParts } = await supabase
    .from('session_participants')
    .select('*')
    .eq('Student', monicaId);

  for (const p of remainingMonParts || []) {
    if (seenSessions.has(p.Session)) {
      await supabase.from('session_participants').delete().eq('id', p.id);
    } else {
      seenSessions.add(p.Session);
    }
  }

  // Make sure Monica is enrolled in every shared session
  for (const sessId of sharedSessionIds) {
    if (!seenSessions.has(sessId)) {
      await supabase.from('session_participants').insert({
        Session: sessId,
        Student: monicaId,
        Attendance: 'Attended'
      });
    }
  }

  // Clean up old orphaned sessions
  if (orphanedSessionIds.length > 0) {
    await supabase.from('sessions').delete().in('id', orphanedSessionIds);
    console.log('Deleted orphaned sessions:', orphanedSessionIds.length);
  }

  console.log('Cleanup complete.');
}

main().catch(console.error);
