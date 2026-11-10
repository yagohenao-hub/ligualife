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
  console.log('--- 1. Actualizando Topic 6 en curriculum_topics ---');

  const topic6Slides = [
    {
      title: "📍🕒 El Triángulo de Preposiciones: IN, ON, AT",
      content: `<p>En inglés, <b>IN</b>, <b>ON</b> y <b>AT</b> se organizan como una pirámide de lo general a lo específico:</p>
      <table style="width:100%;border-collapse:collapse;margin:12px 0;font-size:0.9rem;">
        <thead>
          <tr style="background:rgba(255,255,255,0.08);color:#38bdf8;text-align:left;">
            <th style="padding:8px;border:1px solid rgba(255,255,255,0.15);">Preposición</th>
            <th style="padding:8px;border:1px solid rgba(255,255,255,0.15);">Uso Temporal 🕒</th>
            <th style="padding:8px;border:1px solid rgba(255,255,255,0.15);">Uso Espacial / Físico 📍</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding:8px;border:1px solid rgba(255,255,255,0.1);font-weight:700;color:#fde047;">IN (General / Contenedor)</td>
            <td style="padding:8px;border:1px solid rgba(255,255,255,0.1);">Meses, años, partes del día: <i>in July, in 2026, in the morning</i></td>
            <td style="padding:8px;border:1px solid rgba(255,255,255,0.1);">Ciudades, países, espacios cerrados: <i>in Medellín, in Colombia, in the room</i></td>
          </tr>
          <tr>
            <td style="padding:8px;border:1px solid rgba(255,255,255,0.1);font-weight:700;color:#38bdf8;">ON (Específico / Superficie)</td>
            <td style="padding:8px;border:1px solid rgba(255,255,255,0.1);">Días, fechas exactas: <i>on Wednesday, on Friday, on October 30</i></td>
            <td style="padding:8px;border:1px solid rgba(255,255,255,0.1);">Superficies, calles, transporte público: <i>on the table, on the floor, on the bus</i></td>
          </tr>
          <tr>
            <td style="padding:8px;border:1px solid rgba(255,255,255,0.1);font-weight:700;color:#f87171;">AT (Puntual / Preciso)</td>
            <td style="padding:8px;border:1px solid rgba(255,255,255,0.1);">Horas exactas, momentos clave: <i>at 11:00 AM, at noon, at night</i></td>
            <td style="padding:8px;border:1px solid rgba(255,255,255,0.1);">Puntos de referencia y actividad: <i>at home, at the office, at school, at the door</i></td>
          </tr>
        </tbody>
      </table>`
    },
    {
      title: "🎯 Preposiciones al Final (Preposition Stranding)",
      content: `<p>En español colocamos la preposición al principio: <i>¿De dónde eres?</i>, <i>¿Con quién hablas?</i>, <i>¿Para qué sirve?</i>. En inglés rige la regla natural de <b>mover la preposición al final absoluto</b>:</p>
      <div style="display:flex;flex-direction:column;gap:10px;margin:14px 0;">
        <div style="padding:10px;background:rgba(56,189,248,0.12);border-left:4px solid #38bdf8;border-radius:6px;">
          <b>Preguntas Directas:</b>
          <ul style="margin:6px 0 0 16px;padding:0;">
            <li>¿De dónde eres? → <b>Where are you from?</b> (No <i>From where are you?</i> ❌)</li>
            <li>¿Con quién estás hablando? → <b>Who are you talking with/to?</b></li>
            <li>¿Para qué es esto? → <b>What is this for?</b></li>
          </ul>
        </div>
        <div style="padding:10px;background:rgba(16,185,129,0.12);border-left:4px solid #10b981;border-radius:6px;">
          <b>Construcciones Relativas ("en la que", "con la que"):</b>
          <p style="margin:4px 0 0 0;">En lugar de frases acartonadas como <i>in which</i>, el inglés une directo y remata con la preposición:</p>
          <ul style="margin:6px 0 0 16px;padding:0;">
            <li>Esta es la escuela <i>en la que</i> estudié → <b>This is the school I studied at.</b></li>
            <li>La empresa <i>para la que</i> trabajo → <b>The company I work for.</b></li>
          </ul>
        </div>
      </div>`
    }
  ];

  await supabase.from('curriculum_topics').update({
    'Topic Name': 'Prepositions (In, On, At) & Preposition Stranding',
    'LDS_Formula': 'In/On/At (Tiempo & Lugar) + [WH- + Auxiliar + Sujeto + Verbo + Preposición?]',
    'AI_Context': 'Pedagogía Santiago Henao: Preposiciones básicas IN, ON, AT (temporal y física) y la regla de preposición al final en preguntas (Where... from?, Who... with?, What... for?) y oraciones relativas descriptivas (This is the school I studied at).',
    'Cached Slides': JSON.stringify(topic6Slides)
  }).eq('id', 'recTopic6');

  console.log('Updated recTopic6 in curriculum_topics');

  console.log('--- 2. Actualizando nombre de la sesión del miércoles 28 de octubre ---');
  // Update session 6 (Wednesday Oct 28)
  const { data: sess6 } = await supabase
    .from('sessions')
    .select('id')
    .eq('Scheduled Date/Time', '2026-10-28T16:00:00.000Z')
    .neq('Status', 'Canceled');

  for (const s of sess6 || []) {
    await supabase.from('sessions').update({
      'Session Name': 'Clase 6: Preposiciones In/On/At & Preposiciones al Final — Mónica Torres & María Camila Moreno',
      'Curriculum Topic': 'recTopic6'
    }).eq('id', s.id);
    console.log(`Updated session name for Class 6 -> ${s.id}`);
  }

  console.log('--- FIN ACTUALIZACIÓN TOPIC 6 ---');
}

main().catch(console.error);
