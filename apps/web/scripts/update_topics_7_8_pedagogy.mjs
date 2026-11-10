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

const url = env.NEXT_PUBLIC_SUPABASE_URL || 'https://swmklobpnrkjpfackboc.supabase.co';
const key = env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key, { auth: { persistSession: false } });

// =============================================================================
// CONTENIDO PEDAGÓGICO DE TEMA 7: EL MODO CONDICIONAL (WOULD & HIPÓTESIS)
// =============================================================================
const TOPIC_7_SLIDES = [
  {
    title: '🎯 El Modo Condicional: El Poder de WOULD',
    content: `
      <div style="background: #0f172a; color: #f8fafc; padding: 24px; border-radius: 14px; font-family: system-ui, sans-serif; border: 1px solid rgba(255,255,255,0.08);">
        <span style="color: #60a5fa; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;">Metodología Santiago // Nivel A2-B1</span>
        <h2 style="color: #60a5fa; margin: 8px 0 14px; font-size: 22px;">El Modo Condicional: Transforma Cualquier Verbo en "-ría"</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1; margin-bottom: 16px;">
          En español conjugamos cada verbo por separado (<em>gustaría, viajaría, compraría, haría</em>). En inglés la mente anglosajona no altera el verbo: simplemente activa el operador <strong>WOULD</strong> y mantiene la acción en su forma base.
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
          <div style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); padding: 14px; border-radius: 10px;">
            <div style="color: #60a5fa; font-weight: 800; font-size: 13px;">🟡 Sujeto + 🔵 Would + 🔴 Acción</div>
            <div style="font-size: 15px; font-weight: 700; color: #ffffff; margin-top: 4px;">I would love to help you.</div>
            <div style="font-size: 12px; color: #94a3b8; margin-top: 2px;">Me encantaría ayudarte.</div>
          </div>
          <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); padding: 14px; border-radius: 10px;">
            <div style="color: #34d399; font-weight: 800; font-size: 13px;">Contracción Nativa: 'd</div>
            <div style="font-size: 15px; font-weight: 700; color: #ffffff; margin-top: 4px;">I'd like a cup of coffee.</div>
            <div style="font-size: 12px; color: #94a3b8; margin-top: 2px;">Me gustaría una taza de café.</div>
          </div>
        </div>

        <div style="background: rgba(0,0,0,0.3); padding: 12px 16px; border-radius: 8px; border-left: 4px solid #60a5fa; font-size: 13px; color: #93c5fd;">
          💡 <strong>Regla Inviolable:</strong> La "L" en <em>would</em> es completamente muda. Se pronuncia exactamente /wʊd/ (rimando con <em>good</em>).
        </div>
      </div>
    `
  },
  {
    title: '⚡ Cortesía Ejecutiva vs. Hipótesis Reales',
    content: `
      <div style="background: #0f172a; color: #f8fafc; padding: 24px; border-radius: 14px; font-family: system-ui, sans-serif; border: 1px solid rgba(255,255,255,0.08);">
        <span style="color: #fbbf24; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;">Doble Dimensión // Uso Real</span>
        <h2 style="color: #fbbf24; margin: 8px 0 14px; font-size: 20px;">1. Cortesía Ejecutiva | 2. El Puente de Hipótesis con IF</h2>

        <div style="margin-bottom: 16px;">
          <h4 style="color: #fcd34d; margin: 0 0 6px; font-size: 14px;">A) Peticiones & Ofertas de Alta Cortesía:</h4>
          <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #e2e8f0; line-height: 1.6;">
            <li><strong>Would you like to join us for lunch?</strong> (¿Te gustaría acompañarnos a almorzar?)</li>
            <li><strong>Would you mind sending me the report?</strong> (¿Te importaría enviarme el informe?)</li>
          </ul>
        </div>

        <div style="margin-bottom: 16px;">
          <h4 style="color: #fcd34d; margin: 0 0 6px; font-size: 14px;">B) Arquitectura de Hipótesis (If + Pasado → Would + Base):</h4>
          <p style="font-size: 13px; color: #cbd5e1; margin: 0 0 8px;">
            Cuando planteas un escenario imaginario en el presente, la condición con <em>IF</em> va en tiempo pasado para indicar distancia de la realidad:
          </p>
          <div style="background: rgba(251, 191, 36, 0.08); border: 1px solid rgba(251, 191, 36, 0.25); padding: 12px; border-radius: 8px; font-size: 14px; color: #ffffff;">
            <strong>If I had more time, I would travel around the world.</strong><br/>
            <span style="font-size: 12px; color: #fde68a;">(Si tuviera más tiempo, viajaría por todo el mundo.)</span>
          </div>
        </div>

        <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); padding: 10px 14px; border-radius: 8px; font-size: 12px; color: #fca5a5;">
          ⚠️ <strong>Trampa de Hispanohablante:</strong> PROHIBIDO poner <em>would</em> o <em>will</em> dentro de la cláusula con <em>If</em>. <br/>
          ❌ <em>If I will have time...</em> / ❌ <em>If I would have time...</em> → ✅ <em>If I had time...</em>
        </div>
      </div>
    `
  },
  {
    title: '🚀 Reto de Dominio: Conversación Fluida',
    content: `
      <div style="background: #0f172a; color: #f8fafc; padding: 24px; border-radius: 14px; font-family: system-ui, sans-serif; border: 1px solid rgba(255,255,255,0.08);">
        <span style="color: #34d399; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;">Aplicación Inmediata</span>
        <h2 style="color: #34d399; margin: 8px 0 14px; font-size: 20px;">Simulación y Micro-Práctica</h2>
        <p style="font-size: 14px; color: #cbd5e1; line-height: 1.6;">
          Responde en voz alta o escribe por WhatsApp a tu Pocket Coach:
        </p>
        <ol style="font-size: 13px; color: #e2e8f0; line-height: 1.8; padding-left: 20px;">
          <li>What <strong>would</strong> you do if you had next Friday completely free?</li>
          <li>Where <strong>would</strong> you like to travel next year?</li>
          <li>If you could master any skill overnight, what <strong>would</strong> it be?</li>
        </ol>
      </div>
    `
  }
];

const TOPIC_7_WARMUP = {
  icebreaker: "If you won 5 million dollars today, what would be the very first thing you would buy?",
  spanglishPhrases: [
    "Me gustaría mucho ir, pero I would need to check my calendar primero.",
    "Si tuviera más tiempo libre, I would definitely study more English."
  ],
  bridgePhrase: "I would love to help you with that project as soon as possible."
};

const TOPIC_7_COOLDOWN = {
  idioms: [
    "In a heartbeat (Sin dudarlo ni un segundo / En un abrir y cerrar de ojos: 'I would do it in a heartbeat')",
    "Up in the air (En el aire / Sin confirmar todavía: 'Our plans are still up in the air')"
  ],
  tinyAction: "Escribe 2 deseos o hipótesis usando 'I would love to...' y compártelos en la plataforma.",
  tongueTwister: "How much wood would a woodchuck chuck if a woodchuck could chuck wood?"
};

// =============================================================================
// CONTENIDO PEDAGÓGICO DE TEMA 8: EL GERUNDIO (CONVERTIR EL VERBO EN COSA -ING)
// =============================================================================
const TOPIC_8_SLIDES = [
  {
    title: '🎯 El Gerundio: El Verbo Convertido en Cosa',
    content: `
      <div style="background: #0f172a; color: #f8fafc; padding: 24px; border-radius: 14px; font-family: system-ui, sans-serif; border: 1px solid rgba(255,255,255,0.08);">
        <span style="color: #a855f7; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;">Metodología Santiago // Nivel A2-B1</span>
        <h2 style="color: #c084fc; margin: 8px 0 14px; font-size: 22px;">El Gerundio: Cómo Convertir un Verbo en Sustantivo / Objeto</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1; margin-bottom: 16px;">
          En español usamos el infinitivo como sustantivo: decimos <em>"Fumar es dañino"</em> o <em>"Me gusta viajar"</em>. En inglés esa estructura no existe: para que un verbo actúe como concepto, actividad o sustantivo <strong>DEBE llevar -ING</strong>.
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
          <div style="background: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.3); padding: 14px; border-radius: 10px;">
            <div style="color: #c084fc; font-weight: 800; font-size: 13px;">El Verbo como Sujeto (La Cosa)</div>
            <div style="font-size: 15px; font-weight: 700; color: #ffffff; margin-top: 4px;">Swimming is great exercise.</div>
            <div style="font-size: 12px; color: #94a3b8; margin-top: 2px;">Nadar es un excelente ejercicio.</div>
          </div>
          <div style="background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.3); padding: 14px; border-radius: 10px;">
            <div style="color: #38bdf8; font-weight: 800; font-size: 13px;">Actividad Favorita u Objeto</div>
            <div style="font-size: 15px; font-weight: 700; color: #ffffff; margin-top: 4px;">I enjoy reading before bed.</div>
            <div style="font-size: 12px; color: #94a3b8; margin-top: 2px;">Disfruto la lectura / leer antes de dormir.</div>
          </div>
        </div>

        <div style="background: rgba(0,0,0,0.3); padding: 12px 16px; border-radius: 8px; border-left: 4px solid #a855f7; font-size: 13px; color: #e9d5ff;">
          💡 <strong>No confundir:</strong> Aquí el -ing NO significa "ando/endo" continuo (no hay verbo To Be). Funciona 100% como sustantivo / cosa.
        </div>
      </div>
    `
  },
  {
    title: '⚡ La Regla de Oro: Verbos Tras Preposición',
    content: `
      <div style="background: #0f172a; color: #f8fafc; padding: 24px; border-radius: 14px; font-family: system-ui, sans-serif; border: 1px solid rgba(255,255,255,0.08);">
        <span style="color: #f43f5e; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;">Regla Inviolable // Gramática Operativa</span>
        <h2 style="color: #fb7185; margin: 8px 0 14px; font-size: 20px;">Preposición + Verbo-ING (Siempre)</h2>
        <p style="font-size: 13px; color: #cbd5e1; margin-bottom: 14px;">
          En inglés, después de <strong>CUALQUIER preposición</strong> (<em>for, before, after, about, without, in, on, at, of</em>), todo verbo que le siga lleva obligatoriamente <strong>-ING</strong>.
        </p>

        <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px;">
          <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); padding: 10px 14px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 14px; color: #ffffff; font-weight: 600;">Thank you <strong>for coming</strong>!</span>
            <span style="font-size: 12px; color: #94a3b8;">Gracias por venir (for + coming).</span>
          </div>
          <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); padding: 10px 14px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 14px; color: #ffffff; font-weight: 600;">Check your mic <strong>before speaking</strong>.</span>
            <span style="font-size: 12px; color: #94a3b8;">Revisa tu micrófono antes de hablar.</span>
          </div>
          <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); padding: 10px 14px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 14px; color: #ffffff; font-weight: 600;">He left <strong>without saying</strong> goodbye.</span>
            <span style="font-size: 12px; color: #94a3b8;">Se fue sin despedirse (without + saying).</span>
          </div>
        </div>

        <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); padding: 10px 14px; border-radius: 8px; font-size: 12px; color: #fca5a5;">
          ❌ <em>Thank you for come...</em> / ❌ <em>Before to leave...</em> → ✅ <strong>Thank you for coming</strong> / <strong>Before leaving</strong>
        </div>
      </div>
    `
  },
  {
    title: '🚀 Reto de Dominio & Cierre del Mes 1',
    content: `
      <div style="background: #0f172a; color: #f8fafc; padding: 24px; border-radius: 14px; font-family: system-ui, sans-serif; border: 1px solid rgba(255,255,255,0.08);">
        <span style="color: #38bdf8; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;">Cierre Oficial Mes 1 // Hito de Fluidez</span>
        <h2 style="color: #38bdf8; margin: 8px 0 14px; font-size: 20px;">8 Lecciones Dominadas: La Base Sólida</h2>
        <p style="font-size: 14px; color: #cbd5e1; line-height: 1.6;">
          Has conquistado los 8 pilares del inglés comunicativo. Ahora combina el gerundio con las estructuras de las lecciones anteriores:
        </p>
        <ul style="font-size: 13px; color: #e2e8f0; line-height: 1.8; padding-left: 20px;">
          <li>I am really interested in <strong>improving</strong> my speaking skills.</li>
          <li>What is the best way of <strong>organizing</strong> your daily routine?</li>
          <li>After <strong>finishing</strong> the class, we will review the notes.</li>
        </ul>
      </div>
    `
  }
];

const TOPIC_8_WARMUP = {
  icebreaker: "What is an activity you love doing that makes you completely lose track of time?",
  spanglishPhrases: [
    "Thank you for escuchar mi presentación sobre el nuevo proyecto.",
    "Before de empezar la reunión, let's make sure everyone can hear me."
  ],
  bridgePhrase: "Thank you for joining today's session and for dedicating time to your English."
};

const TOPIC_8_COOLDOWN = {
  idioms: [
    "To take some doing (Costar esfuerzo y dedicación: 'Mastering English takes some doing, but it's worth it')",
    "Actions speak louder than words (Los hechos valen más que las palabras)"
  ],
  tinyAction: "Escribe 2 frases de agradecimiento profesional usando 'Thank you for + verbo-ING' en tu chat de práctica.",
  tongueTwister: "Singing songs softly soothes soulful spirits seeking serenity."
};

async function updateTopics() {
  console.log('=== ACTUALIZANDO TEMA 7 Y TEMA 8 EN SUPABASE (CURRICULUM_TOPICS) ===');

  // 1. Update recTopic7
  const { error: err7 } = await supabase
    .from('curriculum_topics')
    .update({
      'Topic Name': 'The Conditional Mode & Would Architecture',
      'LDS_Formula': 'Sujeto + Would + Acción Base | If + Pasado Simple, Sujeto + Would + Acción Base',
      'AI_Context': 'Pedagogía Santiago Henao: El modo condicional como transformación mental directa (añade la terminación "-ría" a cualquier verbo). Arquitectura de cortesía profesional ("Would you like...", "I would love to...") e hipótesis condicionales directas del presente y futuro ("If I had time, I would travel"). Foco en erradicar rodeos y no usar "will" en la condición if.',
      'Description': 'Domina el modo condicional: transforma cualquier acción con would para expresar cortesía, deseos e hipótesis con fluidez y naturalidad.',
      'Level': 'A2 - Elementary',
      'Fase': 'Installer',
      'Cached Slides': JSON.stringify(TOPIC_7_SLIDES),
      'Cached Warmup': JSON.stringify(TOPIC_7_WARMUP),
      'Cached Cooldown': JSON.stringify(TOPIC_7_COOLDOWN)
    })
    .eq('id', 'recTopic7');

  console.log('Update recTopic7 result:', err7 ? err7.message : 'SUCCESS (Topic 7 updated to The Conditional Mode)');

  // 2. Update recTopic8
  const { error: err8 } = await supabase
    .from('curriculum_topics')
    .update({
      'Topic Name': 'The Gerund: Turning Verbs into Things (-ING Architecture)',
      'LDS_Formula': '[Verbo + -ing] como Sujeto / Objeto / tras Preposición: Preposición + Verbo-ing',
      'AI_Context': 'Pedagogía Santiago Henao: Convertir el verbo en cosa/sustantivo por medio de -ing. En español el infinitivo actúa como cosa ("Fumar es malo", "Me gusta leer"), pero en inglés el verbo DEBE sustantivarse con -ing ("Smoking is bad", "I enjoy reading"). Regla de oro inviolable: Después de CUALQUIER preposición (before, after, for, about, in, on, at, without), el verbo siguiente SIEMPRE lleva -ing ("Thank you for coming", "Before leaving"). Cierre maestro del Mes 1.',
      'Description': 'Aprende a transformar cualquier verbo en un sustantivo o concepto con -ing y aplica la regla de oro de verbos después de preposiciones.',
      'Level': 'A2 - Elementary',
      'Fase': 'Installer',
      'Cached Slides': JSON.stringify(TOPIC_8_SLIDES),
      'Cached Warmup': JSON.stringify(TOPIC_8_WARMUP),
      'Cached Cooldown': JSON.stringify(TOPIC_8_COOLDOWN)
    })
    .eq('id', 'recTopic8');

  console.log('Update recTopic8 result:', err8 ? err8.message : 'SUCCESS (Topic 8 updated to The Gerund -ING)');
}

updateTopics().catch(console.error);

