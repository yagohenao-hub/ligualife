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

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key, { auth: { persistSession: false } });

async function testRpc() {
  const rpcs = ['exec_sql', 'execute_sql', 'sql', 'run_sql'];
  for (const rpc of rpcs) {
    const { data, error } = await supabase.rpc(rpc, { query: 'SELECT 1;' });
    console.log(`RPC ${rpc}:`, error ? error.message : 'SUCCESS', data);
  }
}

testRpc().catch(console.error);
