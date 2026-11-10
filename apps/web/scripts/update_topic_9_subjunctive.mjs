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

const TOPIC_9_SLIDES = [
  {
    title: '🎯 The Subjunctive Logic: Recomendaciones y Demandas de Alto Nivel',
    content: `
      <div style="background: #0f172a; color: #f8fafc; padding: 24px; border-radius: 14px; font-family: system-ui, sans-serif; border: 1px solid rgba(255,255,255,0.08);">
        <span style="color: #f59e0b; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;">Metodología Santiago // Nivel B1-B2</span>
        <h2 style="color: #f59e0b; margin: 8px 0 14px; font-size: 22px;">El Modo Subjuntivo: Verbo Desnudo en su Estado Puro</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1; margin-bottom: 16px;">
          En español decimos <i>"Te sugiero que <b>vayas</b>"</i> o <i>"Recomiendo que él <b>esté</b> aquí"</i>. En inglés, cuando usamos verbos de recomendación, exigencia o necesidad imperiosa (<b>suggest, recommend, demand, insist, essential</b>), entramos en el <strong>Modo Subjuntivo</strong>.
        </p>
        <div style="background: rgba(245, 158, 11, 0.12); border-left: 4px solid #f59e0b; padding: 14px 18px; border-radius: 8px; margin: 16px 0;">
          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #fbbf24; font-weight: 700; margin-bottom: 4px;">Fórmula Maestra:</div>
          <div style="font-size: 16px; font-weight: 700; color: #fff;">[Suggest / Recommend / Demand / It is essential] + THAT + Persona + VERBO BASE (Sin -s, sin conjugar)</div>
        </div>
        <p style="font-size: 13px; color: #94a3b8; line-height: 1.5; margin-top: 12px;">
          💡 <b>La lógica anglosajona:</b> Como es una sugerencia o requerimiento (no un hecho real consumado), la acción no lleva carga de tiempo ni persona: el verbo permanece en su forma "desnuda".
        </p>
      </div>
    `
  },
  {
    title: '⚡ El Filtro Colombiano: Erradicar la Trampa de la "-S"',
    content: `
      <div style="background: #0f172a; color: #f8fafc; padding: 24px; border-radius: 14px; font-family: system-ui, sans-serif; border: 1px solid rgba(255,255,255,0.08);">
        <span style="color: #ef4444; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;">Alerta de Interferencia // Errores Típicos</span>
        <h2 style="color: #f8fafc; margin: 8px 0 16px; font-size: 20px;">En el Subjuntivo, la 3ra Persona va DESNUDA</h2>
        <div style="display: flex; flex-direction: column; gap: 12px; font-size: 14px;">
          <div style="background: rgba(239, 68, 68, 0.08); border-left: 4px solid #ef4444; padding: 12px 16px; border-radius: 6px;">
            <div style="color: #fca5a5; font-size: 12px; font-weight: 700;">❌ Trampa de He/She (Poner -S):</div>
            <div style="color: #e2e8f0; margin-top: 2px;">I suggest that he <b>goes</b> to the clinic.</div>
            <div style="color: #4ade80; font-weight: 700; margin-top: 6px;">✓ Inglés Nativo Correcto:</div>
            <div style="color: #f8fafc;">I suggest that he <b>go</b> to the clinic.</div>
          </div>
          <div style="background: rgba(239, 68, 68, 0.08); border-left: 4px solid #ef4444; padding: 12px 16px; border-radius: 6px;">
            <div style="color: #fca5a5; font-size: 12px; font-weight: 700;">❌ Trampa con el Verbo TO BE (Poner is/are):</div>
            <div style="color: #e2e8f0; margin-top: 2px;">It is essential that everyone <b>is</b> present.</div>
            <div style="color: #4ade80; font-weight: 700; margin-top: 6px;">✓ Inglés Nativo Correcto:</div>
            <div style="color: #f8fafc;">It is essential that everyone <b>be</b> present.</div>
          </div>
          <div style="background: rgba(239, 68, 68, 0.08); border-left: 4px solid #ef4444; padding: 12px 16px; border-radius: 6px;">
            <div style="color: #fca5a5; font-size: 12px; font-weight: 700;">❌ Trampa de Negación Subjuntiva (Usar doesn't):</div>
            <div style="color: #e2e8f0; margin-top: 2px;">I recommend that she <b>doesn't leave</b> yet.</div>
            <div style="color: #4ade80; font-weight: 700; margin-top: 6px;">✓ Inglés Nativo Correcto:</div>
            <div style="color: #f8fafc;">I recommend that she <b>not leave</b> yet.</div>
          </div>
        </div>
      </div>
    `
  },
  {
    title: '🚀 Chunks Ejecutivos y Práctica en Vivo',
    content: `
      <div style="background: #0f172a; color: #f8fafc; padding: 24px; border-radius: 14px; font-family: system-ui, sans-serif; border: 1px solid rgba(255,255,255,0.08);">
        <span style="color: #10b981; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;">Aplicación Inmediata</span>
        <h2 style="color: #10b981; margin: 8px 0 14px; font-size: 20px;">Power Chunks para Liderazgo y Trabajo</h2>
        <ul style="padding-left: 18px; font-size: 14px; line-height: 1.8; color: #cbd5e1;">
          <li><b>"I strongly recommend that he take charge of..."</b> (Recomiendo firmemente que él asuma el mando de...)</li>
          <li><b>"It is vital that the budget be approved today."</b> (Es vital que el presupuesto sea aprobado hoy.)</li>
          <li><b>"They insisted that we be on time."</b> (Insistieron en que estemos a tiempo.)</li>
          <li><b>"I propose that she lead this project."</b> (Propongo que ella lidere este proyecto.)</li>
        </ul>
        <div style="background: rgba(16, 185, 129, 0.1); border: 1px dashed #10b981; border-radius: 8px; padding: 14px; margin-top: 14px;">
          <div style="color: #34d399; font-weight: 700; font-size: 13px; margin-bottom: 4px;">🎯 Reto de la Clase:</div>
          <p style="font-size: 13px; color: #e2e8f0; margin: 0;">
            Imagina que estás asesorando a la junta directiva de tu empresa. Formula 2 recomendaciones estratégicas usando <b>"I suggest that the CEO..."</b> y <b>"It is crucial that our team..."</b>.
          </p>
        </div>
      </div>
    `
  }
];

const TOPIC_9_WARMUP = {
  questions: [
    "If your company were launching a major new initiative tomorrow, what would you suggest that your CEO do first?",
    "When you give advice to a friend, do you prefer to say 'You should...' or 'I recommend that you...'?"
  ],
  thoughtStarter: "Think about professional power dynamics. How does the subjunctive mode elevate formal leadership language?"
};

const TOPIC_9_COOLDOWN = {
  idioms: [
    "To call the shots (Tomar las decisiones / Estar al mando)",
    "By the book (Siguiendo estrictamente las reglas)"
  ],
  tinyAction: "Escribe 2 recomendaciones ejecutivas en el chat usando 'I suggest that he [verbo desnudo]' y 'It is essential that we [verbo desnudo]'.",
  tongueTwister: "She suggested that six slick slim saplings sprout swiftly."
};

async function updateTopic9AndSessions() {
  console.log('--- 1. Actualizando recTopic9 en curriculum_topics ---');
  const { data: updatedTopic, error: tErr } = await supabase
    .from('curriculum_topics')
    .update({
      'Topic Name': 'The Subjunctive Mode',
      'Order': 9,
      'LDS_Formula': 'Suggest / Recommend / Demand / It is essential that + Sujeto + Verbo Base (Naked Verb)',
      'AI_Context': 'Pedagogía Santiago Henao: El Modo Subjuntivo en inglés. Recomendaciones formales, sugerencias profesionales e instrucciones de alto impacto donde el verbo se mantiene en forma base pura sin importar el sujeto ni agregar -s en 3ra persona. Erradicación del error "I suggest that he goes".',
      'Description': 'Aprende a formular recomendaciones ejecutivas y demandas profesionales usando el modo subjuntivo con verbo en forma base pura.',
      'Level': 'B1 - Intermediate',
      'Fase': 'Builder',
      'Cached Slides': JSON.stringify(TOPIC_9_SLIDES),
      'Cached Warmup': JSON.stringify(TOPIC_9_WARMUP),
      'Cached Cooldown': JSON.stringify(TOPIC_9_COOLDOWN)
    })
    .eq('id', 'recTopic9')
    .select();

  if (tErr) {
    console.error('Error actualizando recTopic9:', tErr);
  } else {
    console.log('recTopic9 actualizado con éxito a The Subjunctive Mode:', updatedTopic[0]?.['Topic Name']);
  }

  console.log('\n--- 2. Verificando próximas sesiones ---');
  const sessionsToUpdate = [
    '532be773-a290-40e1-890e-a9f8616a4822', // Mónica y Camila
    '3715f666-6bb6-4f28-b9c1-fab1b1fde2b4'  // Miguel Aguilar
  ];

  const { data: updatedSessions, error: sErr } = await supabase
    .from('sessions')
    .update({
      'Curriculum Topic': ['recTopic9']
    })
    .in('id', sessionsToUpdate)
    .select();

  if (sErr) {
    console.error('Error actualizando sesiones:', sErr);
  } else {
    console.log(`Sesiones actualizadas (${updatedSessions?.length}):`);
    updatedSessions.forEach(s => {
      console.log(`ID: ${s.id} | Date: ${s['Scheduled Date/Time']} | Topic: ${JSON.stringify(s['Curriculum Topic'])}`);
    });
  }

  // Actualizar también session_participants para coherencia
  await supabase
    .from('session_participants')
    .update({ 'Curriculum Topic': 'recTopic9' })
    .in('Session', sessionsToUpdate);

  console.log('session_participants actualizados con recTopic9.');
}

updateTopic9AndSessions();
