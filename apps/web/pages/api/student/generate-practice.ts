import type { NextApiRequest, NextApiResponse } from 'next';
import { getTopicSummary } from '@/lib/curriculum-summary';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

function buildTopicPracticeFallback(topicOrder: number | undefined, topicName: string, ldsFormula?: string, commonMistake?: string) {
  const orderNum = Number(topicOrder) || 1;
  const cleanTopic = (topicName || 'Gramática & Fluidez').replace(/\s*\([^)]*\)/g, '').trim();
  const summary = getTopicSummary(orderNum, cleanTopic);
  const examples = summary.examples && summary.examples.length > 0 ? summary.examples : [];
  const mistake = summary.commonMistake;

  const maskExample = (sentence: string, idx: number) => {
    const words = sentence.trim().split(/\s+/);
    const candidates = words
      .map((w, i) => ({ raw: w, clean: w.replace(/[.,!?;:'"()]/g, ''), i }))
      .filter(c => c.i > 0 && c.clean.length >= 3);
    const pick = candidates[Math.min(candidates.length - 1, idx % Math.max(1, candidates.length))] || { raw: words[0] || 'it', clean: words[0] || 'it', i: 0 };
    const maskedWords = words.map((w, i) => (i === pick.i ? w.replace(pick.clean, '[___]') : w));
    return {
      prompt: maskedWords.join(' '),
      solution: pick.clean,
      hint: `Palabra clave (${pick.clean.length} letras)`,
      explanation: `Patrón de "${cleanTopic}": ${summary.correctMethod}`
    };
  };

  const baseSentences = [
    ...examples.map(e => e.en),
    ...(ldsFormula ? [`Notice how "${summary.structureBlocks?.[0] || cleanTopic}" shapes natural English flow.`] : []),
    `In everyday conversations, mastering ${cleanTopic} helps you express ideas accurately.`,
    `Try building your own real-life sentence following: ${summary.correctMethod}.`
  ];

  const fillItems = Array.from({ length: 5 }, (_, idx) => {
    const src = baseSentences[idx % baseSentences.length];
    const masked = maskExample(src, idx + 1);
    return {
      id: `1-${idx + 1}`,
      prompt: masked.prompt,
      hint: masked.hint,
      solution: masked.solution,
      explanation: masked.explanation
    };
  });

  const trapWrong = mistake?.wrong && !mistake.wrong.includes('Traducir literalmente')
    ? mistake.wrong
    : `Literal Spanish structure when applying ${cleanTopic}`;
  const trapCorrect = mistake?.correct && !mistake.correct.includes('Usar la estructura nativa')
    ? mistake.correct
    : (examples[0]?.en || summary.correctMethod);

  const trapItems = [
    {
      id: '2-1',
      prompt: `"${trapWrong}"`,
      hint: 'Aplica el filtro del tema actual',
      solution: trapCorrect,
      explanation: mistake?.explanation || commonMistake || `Recuerda: ${summary.concept}`
    },
    ...(examples[0] ? [{
      id: '2-2',
      prompt: `¿Cómo evitas sonar literal al expresar "${examples[0].es}"?`,
      hint: summary.structureBlocks?.[0] || 'Orden natural',
      solution: examples[0].en,
      explanation: summary.concept
    }] : []),
    ...(examples[1] ? [{
      id: '2-3',
      prompt: `Corrige la tendencia de traducir palabra por palabra: "${examples[1].es}"`,
      hint: summary.structureBlocks?.[1] || 'Bloque correcto',
      solution: examples[1].en,
      explanation: summary.correctMethod
    }] : []),
    {
      id: '2-4',
      prompt: `"I am agree to practice ${cleanTopic} every day."`,
      hint: 'Sin verbo to be con agree',
      solution: `I agree to practice ${cleanTopic} every day.`,
      explanation: 'En inglés "agree" es verbo directo, nunca va acompañado de "am/is/are".'
    },
    {
      id: '2-5',
      prompt: `"Explain me how ${cleanTopic} works in conversation."`,
      hint: '"Explain" exige preposición "to"',
      solution: `Explain to me how ${cleanTopic} works in conversation.`,
      explanation: 'Siempre di "explain to me", nunca "explain me".'
    }
  ].slice(0, 5);

  const sprintItems = [
    ...examples.slice(0, 3).map((ex, i) => ({
      id: `3-${i + 1}`,
      prompt: ex.es,
      hint: `Aplica ${summary.structureBlocks?.[0] || cleanTopic}`,
      solution: ex.en,
      explanation: `${summary.concept}`
    })),
    {
      id: '3-4',
      prompt: `Quiero usar ${cleanTopic} con más seguridad en mis reuniones.`,
      hint: 'Usa "more confidently"',
      solution: `I want to use ${cleanTopic} more confidently in my meetings.`,
      explanation: `Práctica enfocada en ${cleanTopic} (${summary.level}).`
    },
    {
      id: '3-5',
      prompt: 'Avísame si podemos repasar este patrón otra vez mañana.',
      hint: 'Usa "Let me know if..."',
      solution: 'Let me know if we can review this pattern again tomorrow.',
      explanation: 'Fórmula natural para coordinar seguimiento en inglés.'
    }
  ].slice(0, 5);

  return {
    documentTitle: `Guía de Maestría #${orderNum}: ${cleanTopic}`,
    topicName: cleanTopic,
    activities: [
      {
        id: 1,
        title: `Actividad 1: Fill the Pattern (${cleanTopic})`,
        instruction: 'Completa el espacio [___] con la palabra precisa que mantiene el patrón natural.',
        items: fillItems
      },
      {
        id: 2,
        title: 'Actividad 2: Spot the Colombian Trap',
        instruction: 'Detecta la trampa de traducción literal y transfórmala al inglés nativo.',
        items: trapItems
      },
      {
        id: 3,
        title: 'Actividad 3: Reverse Sprint',
        instruction: `Traduce del español al inglés aplicando: ${summary.correctMethod}`,
        items: sprintItems
      }
    ]
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { studentName, topicOrder, topicName, ldsFormula, level, commonMistake } = req.body as {
    studentName?: string;
    topicOrder?: number;
    topicName?: string;
    ldsFormula?: string;
    level?: string;
    commonMistake?: string;
  };

  if (!topicName) return res.status(400).json({ error: 'topicName es requerido' });

  const prompt = `
Eres un diseñador pedagógico de élite en LinguaLife. Genera un documento estructurado de estudio y práctica intensiva para un estudiante hispanohablante.
MANTÉN CADA ÍTEM CORTO, DIRECTO Y CONCISO.

ESTUDIANTE: ${studentName || 'Estudiante'} | NIVEL: ${level || 'B1'}
TEMA: ${topicName} | FÓRMULA LÓGICA: ${ldsFormula || 'Sujeto + Palabra de Tiempo + Acción'}
ERROR FRECUENTE A EVITAR: ${commonMistake || 'Traducción literal palabra por palabra'}

REGLAS CRÍTICAS PARA "Fill the Pattern":
1. El símbolo [___] SUSTITUYE y REEMPLAZA por completo a la palabra que es la solución.
2. PROHIBIDO TERMINANTEMENTE dejar la palabra de la solución escrita después del [___].
   - INCORRECTO: "She [___] usually eats lunch at noon." (la palabra "usually" está revelada en la frase)
   - CORRECTO: "She [___] eats lunch at noon." (la solución es "usually")
   - INCORRECTO: "They [___] arrived yesterday." (la solución "arrived" está revelada)
   - CORRECTO: "They [___] yesterday." (la solución es "arrived")
3. Las pistas ("hint") deben ser de MÁXIMO 3 PALABRAS y SOLO dar una guía general, NUNCA revelar la respuesta.

GENERA EXACTAMENTE 3 ACTIVIDADES DE REPASO, CADA UNA CON EXACTAMENTE 5 PUNTOS (15 ÍTEMS EN TOTAL):
1. Actividad 1: "Fill the Pattern" (Completar con la estructura o palabra de tiempo adecuada) - 5 ítems numerados.
2. Actividad 2: "Spot the Colombian Trap" (Detectar y corregir un error común de hispanohablantes) - 5 ítems numerados.
3. Actividad 3: "Reverse Sprint" (Traducción ágil y natural del español al inglés) - 5 ítems numerados.

ENTREGA TU RESPUESTA EXCLUSIVAMENTE EN FORMATO JSON VÁLIDO (sin bloques de código markdown ni texto antes o después):
{
  "documentTitle": "Guía de Maestría: ${topicName}",
  "topicName": "${topicName}",
  "activities": [
    {
      "id": 1,
      "title": "Actividad 1: Fill the Pattern",
      "instruction": "Deduce la palabra o forma precisa que completa la frase.",
      "items": [
        {
          "id": "1-1",
          "prompt": "She [___] to London every summer.",
          "hint": "Tercera persona",
          "solution": "goes",
          "explanation": "Regla de presente simple con He/She/It."
        },
        {
          "id": "1-2",
          "prompt": "We [___] working here since 2020.",
          "hint": "Acción continua",
          "solution": "have been",
          "explanation": "Present Perfect Continuous para duraciones activas."
        },
        {
          "id": "1-3",
          "prompt": "Did you [___] him yesterday?",
          "hint": "Forma base",
          "solution": "call",
          "explanation": "Con 'Did' el verbo principal va en forma base."
        },
        {
          "id": "1-4",
          "prompt": "By next year, I [___] graduated.",
          "hint": "Futuro terminado",
          "solution": "will have",
          "explanation": "Future Perfect para metas concluidas."
        },
        {
          "id": "1-5",
          "prompt": "They [___] arrive on time if traffic is bad.",
          "hint": "Negación condicional",
          "solution": "won't",
          "explanation": "Primer condicional (will not/won't)."
        }
      ]
    },
    {
      "id": 2,
      "title": "Actividad 2: Spot the Colombian Trap",
      "instruction": "Identifica el error típico de traducción literal y fíjate en cómo lo dice un nativo.",
      "items": [
        {
          "id": "2-1",
          "prompt": "'I have 26 years old.'",
          "hint": "Uso de edad",
          "solution": "I am 26 years old.",
          "explanation": "La edad se expresa con el verbo 'to be'."
        },
        {
          "id": "2-2",
          "prompt": "'I am agree with you.'",
          "hint": "Verbo propio",
          "solution": "I agree with you.",
          "explanation": "No requiere auxiliar 'am'."
        },
        {
          "id": "2-3",
          "prompt": "'Explain me the problem.'",
          "hint": "Requiere preposición",
          "solution": "Explain the problem to me. / Explain to me...",
          "explanation": "Doble objeto con 'to'."
        },
        {
          "id": "2-4",
          "prompt": "'I am looking forward to hear from you.'",
          "hint": "Preposición fija",
          "solution": "I am looking forward to hearing from you.",
          "explanation": "'To' funciona como preposición, requiere -ing."
        },
        {
          "id": "2-5",
          "prompt": "'People is very friendly.'",
          "hint": "Sustantivo plural",
          "solution": "People are very friendly.",
          "explanation": "Concordancia en plural."
        }
      ]
    },
    {
      "id": 3,
      "title": "Actividad 3: Reverse Sprint",
      "instruction": "Traduce con agilidad la idea directamente al inglés más limpio y natural.",
      "items": [
        {
          "id": "3-1",
          "prompt": "Te llamo tan pronto como llegue a casa.",
          "hint": "As soon as",
          "solution": "I'll call you as soon as I get home.",
          "explanation": "Futuro principal + presente en la cláusula temporal."
        },
        {
          "id": "3-2",
          "prompt": "Llevo tres horas esperándote.",
          "hint": "Duración de tiempo",
          "solution": "I've been waiting for you for three hours.",
          "explanation": "Uso de 'for' para periodos de tiempo."
        },
        {
          "id": "3-3",
          "prompt": "Deberías haberlo dicho antes.",
          "hint": "Modal de reproche",
          "solution": "You should have said it earlier.",
          "explanation": "'Should have + participio'."
        },
        {
          "id": "3-4",
          "prompt": "No tiene sentido discutir por esto.",
          "hint": "Sin sentido",
          "solution": "There is no point in arguing about this.",
          "explanation": "'No point in + ing' es la forma más nativa."
        },
        {
          "id": "3-5",
          "prompt": "Avísame si cambias de opinión.",
          "hint": "Let me know",
          "solution": "Let me know if you change your mind.",
          "explanation": "Frase idiomática estándar en inglés conversacional."
        }
      ]
    }
  ]
}
`;

  try {
    const models = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.0-flash'];
    let rawText = '';

    if (GEMINI_API_KEY) {
      for (const model of models) {
        try {
          const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                  temperature: 0.3,
                  maxOutputTokens: 2500
                }
              })
            }
          );

          if (geminiRes.ok) {
            const data = await geminiRes.json();
            rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            if (rawText) break;
          }
        } catch {}
      }
    }

    if (rawText) {
      try {
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        const cleanJson = jsonMatch ? jsonMatch[0] : rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
        const documentData = JSON.parse(cleanJson);
        if (documentData && Array.isArray(documentData.activities)) {
          // Sanitizar rigurosamente para evitar que la palabra de la solución quede repetida tras [___]
          documentData.activities.forEach((act: any) => {
            if (Array.isArray(act.items)) {
              act.items.forEach((item: any) => {
                if (item && item.prompt && item.solution) {
                  let p = item.prompt;
                  const sol = item.solution.trim();
                  const solWords = sol.split(/\s+/);
                  for (const w of solWords) {
                    if (w.length > 1) {
                      const re = new RegExp(`\\[___\\]\\s+${w}\\b`, 'gi');
                      p = p.replace(re, '[___]');
                    }
                  }
                  const fullRe = new RegExp(`\\[___\\]\\s+${sol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
                  p = p.replace(fullRe, '[___]');
                  item.prompt = p;
                }
              });
            }
          });
          return res.status(200).json(documentData);
        }
      } catch (parseErr) {
        console.warn('Gemini practice JSON parse failed:', parseErr);
      }
    }

    // Respaldo pedagógico específico del tema si la API externa no responde
    const fallbackDoc = buildTopicPracticeFallback(topicOrder, topicName, ldsFormula, commonMistake);
    return res.status(200).json(fallbackDoc);
  } catch (err: any) {
    const safeDoc = buildTopicPracticeFallback(topicOrder, topicName || 'Tema', ldsFormula, commonMistake);
    return res.status(200).json(safeDoc);
  }
}
