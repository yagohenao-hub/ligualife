import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';
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
  const { data: dbTopics } = await supabase
    .from('curriculum_topics')
    .select('*')
    .eq('Curriculum', 'General English Course');

  const sortedTopics = [...(dbTopics || [])].sort((a, b) => parseInt(a.Order, 10) - parseInt(b.Order, 10));

  // 1. DATASET: Pensum Original (Antes de las modificaciones)
  const originalCatalog = [
    {
      order: 1,
      title: 'The Universal Idea',
      formula: 'Sujeto + Palabra de Tiempo + Acción (Base)',
      context: 'La idea atómica. Todo pensamiento en inglés requiere Sujeto explícito + Palabra de Tiempo + Acción Base. Foco en no omitir el pronombre.',
      fase: 'Installer',
      level: 'A1 - Beginner',
      slidesTopic: 'Bloques de Construcción universales del inglés',
      ejemplo: 'I will finish the report / She can help you / It is raining'
    },
    {
      order: 2,
      title: 'The Time Words Logic',
      formula: 'Sujeto + Modal (Should/Must/May/Might/Could) + Verbo Base',
      context: 'Modales como palabras de tiempo directas. Expresar consejos, obligaciones y posibilidades manteniendo los verbos en su forma base.',
      fase: 'Installer',
      level: 'A1 - Beginner',
      slidesTopic: 'Modales directos y eliminación del "to"',
      ejemplo: 'You should rest / We must submit the proposal / They might join later'
    },
    {
      order: 3,
      title: 'The Present & The Ghost Do',
      formula: 'Do/Does + Acción Base | He/She/It + Verbo(-s)',
      context: 'La excepción del presente simple: Do se oculta en afirmación pero altera la 3ra persona con -s, y reaparece en negación y pregunta.',
      fase: 'Installer',
      level: 'A1 - Beginner',
      slidesTopic: 'Rutinas, hábitos diarios y el Do fantasma',
      ejemplo: 'He lives in Medellín / Do you have the contract? / She doesn\'t drink coffee'
    },
    {
      order: 4,
      title: 'The Past & The Ghost Did',
      formula: 'Did + Acción Base | Afirmación: Verbo(-ed/irregular)',
      context: 'La excepción del pasado: Did se oculta en afirmación transformando el verbo, pero reaparece en negación y pregunta liberando al verbo.',
      fase: 'Installer',
      level: 'A2 - Elementary',
      slidesTopic: 'Narración de anécdotas pasadas y control del verbo base con Did',
      ejemplo: 'We launched the product / Did you receive the email? / I didn\'t see it'
    },
    {
      order: 5,
      title: 'Negative Architecture',
      formula: 'Sujeto + Palabra de Tiempo + Not + Acción Base',
      context: 'Arquitectura universal de la negación: se niega pegando Not a la palabra de tiempo (Don\'t, Didn\'t, Won\'t, Can\'t, Shouldn\'t).',
      fase: 'Installer',
      level: 'A2 - Elementary',
      slidesTopic: 'Desacuerdos y preferencias negativas expresadas con naturalidad',
      ejemplo: 'I don\'t agree / She won\'t come / We shouldn\'t take risks'
    },
    {
      order: 6,
      title: 'The Detective (Yes/No Questions)',
      formula: 'Palabra de Tiempo + Sujeto + Acción Base?',
      context: 'Inversión interrogativa: Mover la palabra de tiempo al inicio para interrogar con precisión y seguridad.',
      fase: 'Installer',
      level: 'A2 - Elementary',
      slidesTopic: 'Preguntas de confirmación directa de sí o no',
      ejemplo: 'Are you ready? / Can you send me the deck? / Did they approve the budget?'
    }
  ];

  // 2. DATASET: Metodología Santiago en Vivo (Mónica & María Camila)
  const santiagoLiveCatalog = [
    {
      order: 1,
      title: 'The Universal Idea & First 6 Time Words',
      formula: '🟡 Persona + 🔵 Palabra de Tiempo (Can, Could, Will, Would, Be, Have) + 🔴 Acción Base',
      context: 'Metodología Bandera de Colombia (Amarillo=Persona, Azul=Tiempo, Rojo=Acción). Se imparten de inmediato las primeras 6 palabras de tiempo esenciales. El verbo nunca cambia tras un modal.',
      fase: 'Installer',
      level: 'A1 - Beginner',
      innovacion: 'Anclaje visual con colores patrios (Amarillo/Azul/Rojo) + batería inicial de 6 palabras de tiempo para hablar desde el minuto 1.',
      ejemplo: 'I can finish today (🟡+🔵+🔴) / She will call you / It is raining (sujeto nunca tácito)'
    },
    {
      order: 2,
      title: 'Time Words Mastery & Indefinite Pronouns',
      formula: 'Do/Did + Shall/Should/Must/May/Might + [Some/Any/Every/No + thing/where/one]',
      context: 'Completitud de las 12 palabras de tiempo (Do, Did, Shall, Should, Must, May, Might) y cuadrante de pronombres indefinidos con sufijos.',
      fase: 'Installer',
      level: 'A1 - Beginner',
      innovacion: 'Enlace directo entre el dominio auxiliar y la matriz de pronombres indefinidos (something, anywhere, everyone, nobody) para eliminar ambigüedad.',
      ejemplo: 'You should tell someone / We did find everything / They might go somewhere'
    },
    {
      order: 3,
      title: 'WH-Words: Questions & Relative Affirmations',
      formula: 'Pregunta: WH + Tiempo + Persona + Acción? | Afirmación: Persona + Acción + [WH + Persona + Tiempo + Acción]',
      context: 'Popurrí completo de WH-words (What, Where, When, Why, Who, How, Which). Diferenciación tajante entre inversión de pregunta y orden directo de bandera en afirmación.',
      fase: 'Installer',
      level: 'A1 - Beginner',
      innovacion: 'Enseñar simultáneamente la pregunta y la respuesta compuesta relativa para evitar el error habitual ("I know where do you live" ❌ vs "I know where you live" ✅).',
      ejemplo: 'Where do you live? ↔ I know where you live / What can we do? ↔ This is what we can do'
    },
    {
      order: 4,
      title: 'Sign Law (No Double Negatives) & Imperatives',
      formula: 'Negación: Sujeto + Tiempo+Not + Anything/Anywhere | Imperativo: Acción Base! / Don\'t + Acción Base!',
      context: 'Ley matemática de signos (+ - = -, erradicación total de la doble negación española) y Modo Imperativo para órdenes/instrucciones directas sin persona.',
      fase: 'Installer',
      level: 'A2 - Elementary',
      innovacion: 'Enfoque matemático riguroso para erradicar "I don\'t know nothing" sustituyéndolo con "I don\'t know anything" o "I know nothing", más órdenes directas de supervivencia.',
      ejemplo: 'I don\'t know anything / She said nothing / Listen carefully and don\'t worry!'
    },
    {
      order: 5,
      title: 'Foundation Integration & Conversational Fluency',
      formula: 'Integración Fluida: Bandera Tricolor + Matriz de Tiempo + WH-Connectors + Negación/Imperativo',
      context: 'Sesión integradora y práctica de los 4 pilares en conversación real antes de abrir nuevas estructuras complejas.',
      fase: 'Installer',
      level: 'A2 - Elementary',
      innovacion: 'Hito pedagógico de consolidación: fluidez en tiempo real sin traducir palabra por palabra.',
      ejemplo: 'I can explain what we should do, but don\'t tell anyone yet.'
    },
    {
      order: 6,
      title: 'Prepositions (In, On, At) & Preposition Stranding',
      formula: 'In/On/At (Tiempo & Lugar) + [WH- + Auxiliar + Sujeto + Acción + Preposición?] + [Relativa: Objeto + Preposición]',
      context: 'El triángulo de preposiciones básicas (IN general, ON específico/superficie, AT puntual) + Preposition Stranding (preposición al final de preguntas y relativas "en la que").',
      fase: 'Installer',
      level: 'A2 - Elementary',
      innovacion: 'Resuelve dos de los dolores de cabeza más grandes del hispanohablante: saber cuándo usar in/on/at y naturalizar que en inglés la preposición va al final.',
      ejemplo: 'Where are you from? / Who are you talking with? / What is this for? / This is the school I studied at.'
    },
    {
      order: 7,
      title: 'The Conditional Mode & Would Architecture',
      formula: 'Sujeto + Would + Acción Base | If + Pasado Simple, Sujeto + Would + Acción Base',
      context: 'El modo condicional como transformación mental directa (añade la terminación "-ría" a cualquier verbo). Arquitectura de cortesía profesional ("Would you like...", "I would love to...") e hipótesis condicionales directas del presente y futuro ("If I had time, I would travel").',
      fase: 'Installer',
      level: 'A2 - Elementary',
      innovacion: 'En lugar de dispersar condicionales teóricos a lo largo de 5 temas distantes, Santiago entrega el Modo Condicional y el operador WOULD como herramienta directa de cortesía e imaginación en el primer mes.',
      ejemplo: 'Would you like to join us for lunch? / I would love to / If I had more time, I would study English every day.'
    },
    {
      order: 8,
      title: 'The Gerund: Turning Verbs into Things (-ING Architecture)',
      formula: '[Verbo + -ing] como Sujeto / Objeto / tras Preposición: Preposición + Verbo-ing',
      context: 'Convertir el verbo en cosa/sustantivo por medio de -ing. En español el infinitivo actúa como cosa ("Fumar es malo", "Me gusta leer"), pero en inglés el verbo DEBE sustantivarse con -ing ("Smoking is bad", "I enjoy reading"). Regla de oro inviolable: Después de CUALQUIER preposición (before, after, for, about, in, on, at, without), el verbo siguiente SIEMPRE lleva -ing. Cierre oficial del Mes 1.',
      fase: 'Installer',
      level: 'A2 - Elementary',
      innovacion: 'Desmitificar el -ING (que tradicionalmente solo se enseñaba como gerundio continuo "ando/endo") para convertirlo en la herramienta clave de sustantivación y uso natural post-preposicional.',
      ejemplo: 'Thank you for coming / Before leaving, check your bag / Learning English is exciting / She left without saying goodbye.'
    },
    {
      order: 9,
      title: 'The Subjunctive Mode',
      formula: '[Suggest / Recommend / Demand / It is essential] + that + Sujeto + Verbo Base (Naked Verb)',
      context: 'El Modo Subjuntivo en inglés: recomendaciones formales, sugerencias profesionales e instrucciones de alto impacto donde el verbo se mantiene en forma base pura sin importar el sujeto ni agregar -s en 3ra persona ("I suggest that he go", "It is vital that everyone be on time"). Inicio del Mes 2.',
      fase: 'Builder',
      level: 'B1 - Intermediate',
      innovacion: 'El pensum original repetía de forma redundante "The Imperative Mode" (que Santiago ya había integrado desde la clase 4 con la Ley de Signos). En la metodología en vivo, Santiago avanza al alumno de inmediato al "Subjunctive Mode" para abrir el Mes 2 con alta sofisticación ejecutiva.',
      ejemplo: 'I recommend that he attend the meeting / It is essential that the budget be approved / She suggested that we not sign yet.'
    }
  ];

  // 3. COMPARATIVA Y CONTRASTE LADO A LADO
  const contrastData = [
    {
      Tema: 'Tema 1',
      Pensum_Original: 'The Universal Idea — Enfoque teórico en Sujeto + Tiempo + Verbo Base.',
      Metodologia_Santiago: 'The Universal Idea & First 6 Time Words — Metáfora visual Bandera de Colombia (🟡🔵🔴) + 6 palabras de tiempo iniciales (can, could, will, would, be, have).',
      Diferencia_Pedagogica: 'El original solo daba la fórmula abstracta. La metodología Santiago entrega colores mnemotécnicos y vocabulario funcional inmediato para armar oraciones reales desde la primera clase.',
      Recomendacion_Evolucion: 'Adoptar el modelo de Bandera de Colombia como estándar oficial de LinguaLife por su efectividad mnemotécnica comprobada.'
    },
    {
      Tema: 'Tema 2',
      Pensum_Original: 'The Time Words Logic — Modales Should, Must, May, Might, Could.',
      Metodologia_Santiago: 'Time Words Mastery & Indefinite Pronouns — Completitud de 12 auxiliares (Do, Did, Modales) + Matriz lógica de indefinidos (Every, Any, No, Some + thing/where/one).',
      Diferencia_Pedagogica: 'El original aislaba los modales. La metodología Santiago une la temporalidad completa con los pronombres indefinidos, permitiendo expresar situaciones complejas rápidamente.',
      Recomendacion_Evolucion: 'Integrar la matriz de indefinidos en la fase Installer temprana, acelera la riqueza expresiva del alumno.'
    },
    {
      Tema: 'Tema 3',
      Pensum_Original: 'The Present & The Ghost Do — Excepción del presente simple y terminación -s.',
      Metodologia_Santiago: 'WH-Words: Questions & Relative Affirmations — Doble función de WH (Preguntas directas con inversión vs Conectores afirmativos sin inversión).',
      Diferencia_Pedagogica: 'Santiago priorizó dar capacidad de interrogación y conexión conversacional antes de entrar en las reglas de 3ra persona singular.',
      Recomendacion_Evolucion: 'La alternancia pedagógica es más comunicativa: primero conectar ideas (WH) y luego pulir detalles morfológicos de 3ra persona.'
    },
    {
      Tema: 'Tema 4',
      Pensum_Original: 'The Past & The Ghost Did — Excepción del pasado y anécdotas.',
      Metodologia_Santiago: 'Sign Law (No Double Negatives) & Imperatives — Ley matemática de signos (erradicar doble negación) + Modo Imperativo.',
      Diferencia_Pedagogica: 'Santiago atacó de raíz el error fósil número 1 del hispanohablante ("I don\'t know nothing") y dio herramientas de comandos directos para el día a día.',
      Recomendacion_Evolucion: 'La ley de signos debe enseñarse explícitamente en el primer mes para evitar la fosilización de errores en niveles avanzados.'
    },
    {
      Tema: 'Tema 5',
      Pensum_Original: 'Negative Architecture — Estructura general de la negación con Not.',
      Metodologia_Santiago: 'Foundation Integration & Conversational Fluency — Consolidación práctica de los 4 pilares en conversación fluida.',
      Diferencia_Pedagogica: 'El original repetía negación teórica. Santiago dedicó la clase 5 a una parada de consolidación e integración de fluidez conversacional.',
      Recomendacion_Evolucion: 'Incluir paradas de integración cada 5 clases en el pensum maestro aumenta la retención y la confianza del estudiante.'
    },
    {
      Tema: 'Tema 6',
      Pensum_Original: 'The Detective (Yes/No Questions) — Preguntas de sí o no con inversión.',
      Metodologia_Santiago: 'Prepositions (In, On, At) & Preposition Stranding — Triángulo temporal/espacial + Preposición al final en preguntas ("Where... from?") y relativas ("The school I studied at").',
      Diferencia_Pedagogica: 'Santiago resolvió en vivo la gran necesidad de ubicación témporo-espacial y desarmó la interferencia del español en preguntas con preposición.',
      Recomendacion_Evolucion: 'Adelantar Preposition Stranding a la fase Installer elimina de inmediato el sonido "spanglish" de las preguntas cotidianas.'
    },
    {
      Tema: 'Tema 7',
      Pensum_Original: 'Wh- Questions (Informativas) — Preguntas abiertas con Wh- y auxiliares.',
      Metodologia_Santiago: 'The Conditional Mode & Would Architecture — Operador WOULD para cortesía ejecutiva e hipótesis reales con IF.',
      Diferencia_Pedagogica: 'Las preguntas WH ya se habían consolidado en el tema 3. Santiago aprovechó la clase 7 para introducir el modo condicional completo (Would), permitiendo peticiones formales y escenarios hipotéticos.',
      Recomendacion_Evolucion: 'Mover el modo condicional al final del Mes 1 eleva el registro conversacional del estudiante y le permite expresarse con elegancia profesional.'
    },
    {
      Tema: 'Tema 8',
      Pensum_Original: 'Wh- Words Afirmativas (Conectores) — Oraciones complejas con conectores Wh.',
      Metodologia_Santiago: 'The Gerund: Turning Verbs into Things (-ING Architecture) — El verbo como sustantivo/cosa y la regla de oro: después de preposición siempre va -ING.',
      Diferencia_Pedagogica: 'Los conectores WH ya se habían integrado en la clase 3. La clase 8 culmina el Mes 1 con la conversión de verbos en cosas (-ing) y la regla de verbos post-preposicionales ("Thank you for coming").',
      Recomendacion_Evolucion: 'Establecer la regla de preposición + ING en el tema 8 cierra el Mes 1 con una base sintáctica impecable, evitando que el alumno traduzca infinitivos literales del español.'
    },
    {
      Tema: 'Tema 9',
      Pensum_Original: 'The Imperative Mode — Órdenes directas, instrucciones y Don\'t + verbo.',
      Metodologia_Santiago: 'The Subjunctive Mode — Modo Subjuntivo: verbo en forma base desnuda sin -S con verbos de sugerencia/demanda (Suggest, Recommend, Demand, Essential that).',
      Diferencia_Pedagogica: 'El pensum original repetía de forma redundante el modo imperativo (que Santiago ya había enseñado en la clase 4 con la Ley de Signos). En vivo, Santiago avanza al alumno al Modo Subjuntivo para iniciar el Mes 2 con alta sofisticación ejecutiva.',
      Recomendacion_Evolucion: 'Eliminar la redundancia del Imperativo en el Tema 9 y oficializar el Subjunctive Mode como inicio de la fase Builder / Mes 2.'
    }
  ];

  // Construir filas completas para Hoja 1 (Pensum Original 60 Temas)
  const sheet1Rows = sortedTopics.map(t => {
    const orderNum = parseInt(t.Order, 10);
    const orig = originalCatalog.find(o => o.order === orderNum);
    return {
      'Orden': orderNum,
      'Nombre del Tema': orig ? orig.title : t['Topic Name'],
      'Fase': t.Fase || (orig ? orig.fase : 'Installer'),
      'Nivel CEFR': t.Level || (orig ? orig.level : 'A1 - Beginner'),
      'Fórmula Estructural (LDS)': orig ? orig.formula : t.LDS_Formula,
      'Contexto Pedagógico / AI': orig ? orig.context : t.AI_Context,
      'Ejemplos Clave': orig ? orig.ejemplo : '',
      'Notas del Pensum': orderNum <= 6 ? 'Versión Original antes de la experiencia con Mónica y María Camila' : 'Contenido estándar del pensum'
    };
  });

  // Construir filas para Hoja 2 (Metodología Santiago en Vivo)
  const sheet2Rows = sortedTopics.map(t => {
    const orderNum = parseInt(t.Order, 10);
    const live = santiagoLiveCatalog.find(l => l.order === orderNum);
    return {
      'Orden': orderNum,
      'Nombre del Tema (Metodología en Vivo)': live ? live.title : t['Topic Name'],
      'Fase': t.Fase || (live ? live.fase : 'Installer'),
      'Nivel CEFR': t.Level || (live ? live.level : 'A1 - Beginner'),
      'Fórmula Aplicada': live ? live.formula : t.LDS_Formula,
      'Enfoque Pedagógico Santiago': live ? live.context : t.AI_Context,
      'Innovación Metodológica': live ? live.innovacion : 'Continuidad pedagógica proyectada',
      'Ejemplos Reales de Clase': live ? live.ejemplo : '',
      'Estado con Alumnas': orderNum <= 8 ? '✅ Visto en clase (Mes 1 completado: Mónica, Camila, Miguel)' : (orderNum === 9 ? '🚀 Inicio Mes 2 (Mañana Miércoles 11 Nov)' : 'Próximos temas del pensum')
    };
  });

  // Asegurar directorios de destino
  const dirCurriculum = path.resolve('curriculum_versions');
  const dirPublic = path.resolve('apps/web/public/curriculum');
  if (!fs.existsSync(dirCurriculum)) fs.mkdirSync(dirCurriculum, { recursive: true });
  if (!fs.existsSync(dirPublic)) fs.mkdirSync(dirPublic, { recursive: true });

  // ── ARCHIVO 1: Pensum Original Standalone ─────────────────────────────
  const wbOriginal = XLSX.utils.book_new();
  const wsOriginal = XLSX.utils.json_to_sheet(sheet1Rows);
  XLSX.utils.book_append_sheet(wbOriginal, wsOriginal, 'Pensum_Original_60_Temas');
  
  const pathOriginal1 = path.join(dirCurriculum, 'Curriculum_General_Pensum_Original.xlsx');
  const pathOriginal2 = path.join(dirPublic, 'Curriculum_General_Pensum_Original.xlsx');
  XLSX.writeFile(wbOriginal, pathOriginal1);
  XLSX.writeFile(wbOriginal, pathOriginal2);
  console.log('Generated:', pathOriginal1);

  // ── ARCHIVO 2: Metodología Santiago en Vivo Standalone ────────────────
  const wbLive = XLSX.utils.book_new();
  const wsLive = XLSX.utils.json_to_sheet(sheet2Rows);
  XLSX.utils.book_append_sheet(wbLive, wsLive, 'Metodologia_Santiago_EnVivo');

  const pathLive1 = path.join(dirCurriculum, 'Curriculum_Metodologia_Santiago_EnVivo.xlsx');
  const pathLive2 = path.join(dirPublic, 'Curriculum_Metodologia_Santiago_EnVivo.xlsx');
  XLSX.writeFile(wbLive, pathLive1);
  XLSX.writeFile(wbLive, pathLive2);
  console.log('Generated:', pathLive1);

  // ── ARCHIVO 3: Libro Maestro Comparativo (3 Hojas) ───────────────────
  const wbMaster = XLSX.utils.book_new();
  const wsMasterOriginal = XLSX.utils.json_to_sheet(sheet1Rows);
  const wsMasterLive = XLSX.utils.json_to_sheet(sheet2Rows);
  const wsMasterContrast = XLSX.utils.json_to_sheet(contrastData);

  XLSX.utils.book_append_sheet(wbMaster, wsMasterOriginal, '1_Pensum_Original');
  XLSX.utils.book_append_sheet(wbMaster, wsMasterLive, '2_Metodologia_Santiago');
  XLSX.utils.book_append_sheet(wbMaster, wsMasterContrast, '3_Contraste_Y_Evolucion');

  const pathMaster1 = path.join(dirCurriculum, 'Curriculum_Comparativa_Y_Evolucion_LinguaLife.xlsx');
  const pathMaster2 = path.join(dirPublic, 'Curriculum_Comparativa_Y_Evolucion_LinguaLife.xlsx');
  XLSX.writeFile(wbMaster, pathMaster1);
  XLSX.writeFile(wbMaster, pathMaster2);
  console.log('Generated Master Workbook:', pathMaster1);

  // También generar versiones CSV para máxima compatibilidad
  const csvOriginal = XLSX.utils.sheet_to_csv(wsOriginal);
  const csvLive = XLSX.utils.sheet_to_csv(wsLive);
  const csvContrast = XLSX.utils.sheet_to_csv(wsMasterContrast);

  fs.writeFileSync(path.join(dirCurriculum, 'Curriculum_General_Pensum_Original.csv'), csvOriginal, 'utf8');
  fs.writeFileSync(path.join(dirCurriculum, 'Curriculum_Metodologia_Santiago_EnVivo.csv'), csvLive, 'utf8');
  fs.writeFileSync(path.join(dirCurriculum, 'Curriculum_Contraste_Y_Evolucion.csv'), csvContrast, 'utf8');

  console.log('All files generated successfully.');
}

main().catch(console.error);
