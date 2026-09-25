import type { NextApiRequest, NextApiResponse } from 'next';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { studentName, topicName, ldsFormula, level, commonMistake } = req.body as {
    studentName?: string;
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
    const models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-flash-8b', 'gemini-2.5-flash', 'gemini-1.5-pro'];
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
        const cleanJson = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
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

    // Respaldo pedagógico garantizado de alta calidad si la API externa no responde
    const cleanTopic = (topicName || 'Gramática & Fluidez').replace(/\s*\([^)]*\)/g, '').trim();
    const fallbackDoc = {
      documentTitle: `Guía Pedagógica: ${cleanTopic}`,
      topicName: cleanTopic,
      activities: [
        {
          id: 1,
          title: 'Actividad 1: Fill the Pattern (Completar la Estructura)',
          instruction: 'Completa el espacio [___] aplicando la forma correcta del patrón estudiado.',
          items: [
            {
              id: '1-1',
              prompt: `When communicating clearly in English, you [___] remember the core subject.`,
              hint: 'Verbo modal de recomendación (deberías)',
              solution: 'should',
              explanation: 'Uso de "should" para expresar recomendación natural.'
            },
            {
              id: '1-2',
              prompt: `She [___] to improve her daily speaking confidence since last month.`,
              hint: 'Presente perfecto continuo con She',
              solution: 'has been trying',
              explanation: 'Acción que comenzó en el pasado y sigue vigente hoy.'
            },
            {
              id: '1-3',
              prompt: `Did you [___] about the main takeaway in our last session?`,
              hint: 'Forma base del verbo tras el auxiliar Did',
              solution: 'think',
              explanation: 'Con el auxiliar en pasado "Did", el verbo principal se mantiene en forma base.'
            },
            {
              id: '1-4',
              prompt: `If we practice consistently every day, we [___] achieve native flow.`,
              hint: 'Primer condicional (futuro)',
              solution: 'will',
              explanation: 'Cláusula condicional presente + resultado futuro con will.'
            },
            {
              id: '1-5',
              prompt: `They [___] ready for the presentation before the call started.`,
              hint: 'Pasado del verbo To Be en plural',
              solution: 'were',
              explanation: 'Concordancia en pasado para They (were).'
            }
          ]
        },
        {
          id: 2,
          title: 'Actividad 2: Spot the Latin Trap (Corregir Vicios de Traducción)',
          instruction: 'Identifica el error típico de traducir palabra por palabra y cámbialo por inglés nativo.',
          items: [
            {
              id: '2-1',
              prompt: `"I am agree with your perspective."`,
              hint: '"Agree" ya es un verbo de acción.',
              solution: 'I agree with your perspective.',
              explanation: 'En inglés nunca se dice "am agree", se conjuga directamente "I agree".'
            },
            {
              id: '2-2',
              prompt: `"I have 28 years old."`,
              hint: 'En inglés no "tienes" la edad, sino que la "eres".',
              solution: 'I am 28 years old.',
              explanation: 'La edad siempre se formula con el verbo To Be.'
            },
            {
              id: '2-3',
              prompt: `"Explain me how this works."`,
              hint: 'El verbo "explain" requiere preposición "to" ante la persona.',
              solution: 'Explain to me how this works. / Explain how this works to me.',
              explanation: '"Explain" no acepta objeto indirecto pegado sin preposición.'
            },
            {
              id: '2-4',
              prompt: `"People is very supportive here."`,
              hint: '"People" es un sustantivo plural.',
              solution: 'People are very supportive here.',
              explanation: 'Requiere verbo en plural "are".'
            },
            {
              id: '2-5',
              prompt: `"I look forward to hear your thoughts."`,
              hint: 'Tras la preposición de "look forward to", el verbo va en -ing.',
              solution: 'I look forward to hearing your thoughts.',
              explanation: '"To" actúa como preposición fija, exigiendo forma gerundio -ing.'
            }
          ]
        },
        {
          id: 3,
          title: 'Actividad 3: Reverse Sprint (Traducción Ágil & Natural)',
          instruction: 'Pasa la idea del español al inglés más fluido sin rodeos literales.',
          items: [
            {
              id: '3-1',
              prompt: 'Te confirmo los detalles en cuanto me confirmen a mí.',
              hint: 'Usa "as soon as"',
              solution: "I'll confirm the details as soon as they confirm with me.",
              explanation: 'Futuro principal + presente en la oración subordinada con "as soon as".'
            },
            {
              id: '3-2',
              prompt: 'Llevamos semanas trabajando en este objetivo.',
              hint: 'Present Perfect Continuous con "for"',
              solution: "We've been working on this goal for weeks.",
              explanation: 'Uso de "for" para expresar duración acumulada.'
            },
            {
              id: '3-3',
              prompt: 'Deberías haberme avisado antes.',
              hint: 'Modal de arrepentimiento "should have"',
              solution: 'You should have let me know earlier.',
              explanation: '"Should have + participio" expresa reproche o acción no realizada.'
            },
            {
              id: '3-4',
              prompt: 'No vale la pena preocuparse por pequeñeces.',
              hint: 'Expresión idiomática con "worth"',
              solution: "It's not worth worrying about small details.",
              explanation: '"Worth + -ing" es la expresión idiomática nativa.'
            },
            {
              id: '3-5',
              prompt: 'Avísame si necesitas cualquier cosa adicional.',
              hint: 'Phrasal idiomático con "let me know"',
              solution: 'Let me know if you need anything else.',
              explanation: 'Fórmula de cierre estándar y profesional en conversaciones reales.'
            }
          ]
        }
      ]
    };

    return res.status(200).json(fallbackDoc);
  } catch (err: any) {
    return res.status(200).json({
      documentTitle: `Guía de Maestría: ${topicName || 'Tema'}`,
      topicName: topicName || 'Tema',
      activities: [
        {
          id: 1,
          title: 'Actividad 1: Fill the Pattern',
          instruction: 'Completa con la forma adecuada.',
          items: [
            { id: '1-1', prompt: 'I [___] ready for the test.', hint: 'Verbo to be', solution: 'am', explanation: 'Concordancia con I.' }
          ]
        }
      ]
    });
  }
}
