import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
  realtime: { transport: ws }
});

function parseSlides(text) {
  const slides = [];
  const sections = text.split(/\[\[SLIDE_\d+:\s*(.*?)\]\]/);
  for (let i = 1; i < sections.length; i += 2) {
    const title = sections[i].trim();
    const content = sections[i + 1]?.split('[[')[0]?.trim() || '';
    slides.push({ title, content });
  }
  return slides;
}

function parseJsonSection(text, marker) {
  const parts = text.split(`[[${marker}]]`);
  if (parts.length < 2) return null;
  let rawJson = parts[1].split('[[')[0].trim();
  rawJson = rawJson.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '');
  try {
    return JSON.parse(rawJson);
  } catch (e) {
    return null;
  }
}

async function callGeminiWithFallback(prompt) {
  const models = ['gemini-3.1-flash-lite', 'gemini-3.5-flash-lite'];
  for (const model of models) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        }
      );
      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      }
    } catch (err) {
      console.warn(`Error con modelo ${model}:`, err.message);
    }
  }
  throw new Error('Todos los modelos fallaron');
}

async function generateAssetsForClass(topic, prevTopicName) {
  const prompt = `
You are an elite English coach generating dark-theme classroom slides and session assets for a language student.

STUDENT: Alumno | LEVEL: ${topic.Level || 'B1'} | VERTICAL: General
CURRENT TOPIC: ${topic['Topic Name']} | PREVIOUS TOPIC: ${prevTopicName || 'None'}
INTERESTS: Negocios, Tecnología, Liderazgo | LDS FORMULA: ${topic.LDS_Formula || 'Sujeto + Palabra de Tiempo + Acción'}
CONTEXT: ${topic.AI_Context || ''} | COMMON LATAM MISTAKE: ${topic.Common_Latam_Mistake || ''}

LATEST TECH NEWS (Context for Slide 4):
- OpenAI released GPT-5.4 with enhanced reasoning and agentic workflows.
- Anthropic released Claude 4.6 with superior system integration.
- NVIDIA announced revolutionary next-generation AI infrastructure.

YOUR OUTPUT MUST BE DIVIDED BY THESE EXACT MARKERS:

[[SLIDE_1: Logic Decoder]]
- Content: Intense focus on the LOGIC of the topic.
- High-impact explanation using the formula: ${topic.LDS_Formula || 'Sujeto + Palabra de Tiempo + Acción'}.
- Show how native speakers process this naturally without translating word by word.

[[SLIDE_2: Colombian Filter]]
- Content: The "Filtro Colombiano". Contrast 2-3 typical mistakes made by native Spanish speakers with the natural English version.
- Explicitly target this error: ${topic.Common_Latam_Mistake || 'traducción literal'}.
- Design: Show "✗ Error Común" vs "✓ En Inglés Real".

[[SLIDE_3: Real-Life Chunks]]
- Content: 4-5 high-utility language 'Chunks' (semi-fixed word combinations).
- Do NOT provide single isolated words. Provide ready-to-use practical expressions for work or daily life.

[[SLIDE_4: Conversation & News]]
- Content Part 1: 3 engaging conversation questions for the student using this topic.
- Content Part 2: A quick "Breaking News" prompt connecting the topic with innovation or career growth.

[[WARMUP_ASSETS]]
{
  "icebreaker": "A sharp, engaging question for today.",
  "spanglishPhrases": [
    "Frase en español con concepto clave en inglés.",
    "Frase en inglés con concepto clave en español."
  ],
  "bridgePhrase": "A single representative sentence in English showing '${topic['Topic Name']}'."
}

[[COOLDOWN_ASSETS]]
{
  "idioms": ["Idiom 1 related to topic", "Idiom 2 related to topic"],
  "tinyAction": "One micro-task for the student for the next 24 hours.",
  "tongueTwister": "A short phonetic drill or tongue twister for pronunciation clarity."
}

STRICT RULES FOR ALL HTML SLIDES:
- Use only inline styles with dark mode aesthetics.
- Background colors: rgba(255,255,255,0.03) for cards.
- Text colors: #e2e8f0 primary, #94a3b8 secondary.
- Accent: #f59e0b (amber) for highlights/titles.
- Border: 1px solid rgba(255,255,255,0.08).
- Border radius: 10px for cards, 6px for small elements.
- No external images or icons.

Output ONLY the marked blocks. No introduction or chat.
`;

  const rawText = await callGeminiWithFallback(prompt);
  const slides = parseSlides(rawText);
  const warmup = parseJsonSection(rawText, 'WARMUP_ASSETS');
  const cooldown = parseJsonSection(rawText, 'COOLDOWN_ASSETS');

  return { slides, warmup, cooldown };
}

async function run() {
  console.log('🚀 Iniciando pre-generación de diapositivas para las 60 clases...');

  const csvPath = path.join(process.cwd(), 'curriculum_60_clases.csv');
  const content = fs.readFileSync(csvPath, 'utf8');
  const records = parse(content, { columns: true, skip_empty_lines: true, trim: true });

  // Obtener mapeo de UUIDs originales para guardar en ambos (recTopic y UUID)
  const { data: nonRecs } = await supabase
    .from('curriculum_topics')
    .select('id, Order')
    .not('id', 'ilike', 'recTopic%');

  const uuidMap = {};
  if (nonRecs) {
    nonRecs.forEach(t => {
      const o = parseInt(t.Order);
      if (!isNaN(o) && o >= 1 && o <= 60 && !uuidMap[o]) {
        uuidMap[o] = t.id;
      }
    });
  }

  // Comprobar cuáles ya tienen slides generados para no gastar cuota
  const { data: existingRecs } = await supabase
    .from('curriculum_topics')
    .select('id, Order, \"Cached Slides\"')
    .ilike('id', 'recTopic%')
    .not('Cached Slides', 'is', null);

  const doneOrders = new Set();
  if (existingRecs) {
    existingRecs.forEach(r => {
      try {
        const parsed = JSON.parse(r['Cached Slides']);
        if (Array.isArray(parsed) && parsed.length >= 4) {
          doneOrders.add(parseInt(r.Order));
        }
      } catch {}
    });
  }

  console.log(`📊 Clases ya generadas: ${doneOrders.size} de 60.`);

  for (let i = 0; i < records.length; i++) {
    const topic = records[i];
    const order = parseInt(topic.Order);
    const prevTopicName = i > 0 ? records[i - 1]['Topic Name'] : 'None';

    if (doneOrders.has(order)) {
      console.log(`⏩ Clase #${order}: ${topic['Topic Name']} ya tiene slides. Saltando...`);
      continue;
    }

    console.log(`\n⏳ Generando Clase #${order}/60: ${topic['Topic Name']}...`);
    try {
      const startTime = Date.now();
      const assets = await generateAssetsForClass(topic, prevTopicName);

      if (!assets.slides || assets.slides.length === 0) {
        console.warn(`⚠️ No se pudieron parsear slides para Clase #${order}`);
        continue;
      }

      const updatePayload = {
        'Cached Slides': JSON.stringify(assets.slides),
        'Cached Warmup': assets.warmup ? JSON.stringify(assets.warmup) : null,
        'Cached Cooldown': assets.cooldown ? JSON.stringify(assets.cooldown) : null
      };

      // Guardar en recTopicX
      const recId = `recTopic${order}`;
      await supabase.from('curriculum_topics').update(updatePayload).eq('id', recId);

      // Guardar también en el UUID original si existe
      const uuid = uuidMap[order];
      if (uuid) {
        await supabase.from('curriculum_topics').update(updatePayload).eq('id', uuid);
      }

      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`✅ Clase #${order} guardada con éxito (${assets.slides.length} slides, Warmup & Cooldown) [${duration}s]`);

      // Pequeña pausa para evitar rate limiting de Gemini
      await new Promise(r => setTimeout(r, 1200));

    } catch (err) {
      console.error(`❌ Error en Clase #${order}:`, err.message);
      await new Promise(r => setTimeout(r, 3000));
    }
  }

  console.log('\n🎉 ¡Proceso de pre-generación completado para todo el currículum!');
}

run().catch(console.error);
