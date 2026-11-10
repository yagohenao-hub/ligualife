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

async function checkTopic5() {
  const { data } = await supabase
    .from('curriculum_topics')
    .select('id, "Topic Name", "Order"')
    .in('Order', ['3', '4', '5', '6', '7', '8']);
  console.log('Topics 3-8:', data);
}

checkTopic5().catch(console.error);
