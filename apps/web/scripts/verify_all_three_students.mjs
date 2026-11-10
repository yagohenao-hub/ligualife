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

async function verifyAll() {
  const students = [
    { name: 'MÓNICA TORRES', id: '23cf0a83-2436-4569-bfde-45c3f9ad23cf' },
    { name: 'MARÍA CAMILA MORENO', id: '7cc88332-5008-4dc6-89c8-20bc91ccd1c6' },
    { name: 'MIGUEL AGUILAR', id: 'd2907d52-0af0-45cd-9916-3e7638c6428f' }
  ];

  for (const st of students) {
    console.log(`\n======================================================`);
    console.log(`VERIFICACIÓN: ${st.name} (${st.id})`);
    console.log(`======================================================`);

    const { data: stu } = await supabase.from('students').select('*').eq('id', st.id).single();
    console.log(`Student Record: PIN=${stu.PIN} | Status=${stu.Status} | ClassesRemaining=${stu['Classes Remaining']} | Tokens=${stu['Tokens de Reposición']}`);
    console.log(`Notes: ${stu.Notes}`);

    const { data: stLink } = await supabase.from('student_teacher').select('*').eq('Student', st.id);
    console.log(`Teacher Link: ${stLink?.map(l => `Teacher=${l.Teacher}, Days=${l['Recurrence Day']}, Time=${l['Recurrence Time']}`).join(' | ')}`);

    const { data: parts } = await supabase.from('session_participants').select('*').eq('Student', st.id);
    const sessionIds = (parts || []).map(p => p.Session);
    const { data: sessList } = await supabase.from('sessions').select('*').in('id', sessionIds);

    const completed = sessList?.filter(s => s.Status === 'Seen').sort((a,b) => new Date(a['Scheduled Date/Time']||0) - new Date(b['Scheduled Date/Time']||0));
    const upcoming = sessList?.filter(s => s.Status === 'Scheduled').sort((a,b) => new Date(a['Scheduled Date/Time']||0) - new Date(b['Scheduled Date/Time']||0));

    console.log(`Completed Sessions (${completed?.length}):`);
    completed?.forEach((s, idx) => {
      console.log(`  ${idx+1}. [${s['Scheduled Date/Time']}] Topic: ${s['Curriculum Topic']} | ${s['Session Name']}`);
    });

    console.log(`Upcoming Sessions (${upcoming?.length}):`);
    upcoming?.forEach((s, idx) => {
      console.log(`  ${idx+1}. [${s['Scheduled Date/Time']}] Topic: ${s['Curriculum Topic']} | ${s['Session Name']}`);
    });
  }
}

verifyAll().catch(console.error);

