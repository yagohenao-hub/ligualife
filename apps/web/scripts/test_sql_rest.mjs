import fs from 'fs';
import path from 'path';

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

async function testSqlRest() {
  // Test pg/query or similar endpoint
  try {
    const res = await fetch(`${url}/rest/v1/rpc`, {
      method: 'GET',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`
      }
    });
    console.log('GET /rest/v1/rpc status:', res.status, await res.text());
  } catch (e) {
    console.log('Error calling /rpc:', e.message);
  }

  // Let's test if there is any other schema or table
  try {
    const res = await fetch(`${url}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`
      }
    });
    console.log('GET /rest/v1/ status:', res.status);
    const text = await res.text();
    console.log('OpenAPI definitions found:', text.slice(0, 300));
  } catch (e) {
    console.log('Error OpenAPI:', e.message);
  }
}

testSqlRest().catch(console.error);
