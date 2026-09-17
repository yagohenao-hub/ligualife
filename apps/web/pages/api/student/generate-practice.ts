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
      "instruction": "Completa el espacio [___] con la palabra o forma verbal precisa.",
      "items": [
        {
          "id": "1-1",
          "prompt": "She [___] to London every summer.",
          "hint": "Tercera persona singular",
          "solution": "goes",
          "explanation": "Regla de presente simple con He/She/It."
        },
        {
          "id": "1-2",
          "prompt": "We [___] working here since 2020.",
          "hint": "Acción continua iniciada en el pasado",
          "solution": "have been",
          "explanation": "Present Perfect Continuous para duraciones activas."
        },
        {
          "id": "1-3",
          "prompt": "Did you [___] him yesterday?",
          "hint": "El auxiliar ya absorbió el tiempo pasado",
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
          "hint": "En inglés no 'tienes' la edad, sino que 'eres'.",
          "solution": "I am 26 years old.",
          "explanation": "La edad se expresa con el verbo 'to be'."
        },
        {
          "id": "2-2",
          "prompt": "'I am agree with you.'",
          "hint": "'Agree' ya es un verbo por sí mismo.",
          "solution": "I agree with you.",
          "explanation": "No requiere auxiliar 'am'."
        },
        {
          "id": "2-3",
          "prompt": "'Explain me the problem.'",
          "hint": "'Explain' requiere la preposición 'to' ante la persona.",
          "solution": "Explain the problem to me. / Explain to me...",
          "explanation": "Doble objeto con 'to'."
        },
        {
          "id": "2-4",
          "prompt": "'I am looking forward to hear from you.'",
          "hint": "Después de 'look forward to' va gerundio.",
          "solution": "I am looking forward to hearing from you.",
          "explanation": "'To' funciona como preposición, requiere -ing."
        },
        {
          "id": "2-5",
          "prompt": "'People is very friendly.'",
          "hint": "'People' es plural en inglés.",
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
          "hint": "Usa 'as soon as'",
          "solution": "I'll call you as soon as I get home.",
          "explanation": "Futuro principal + presente en la cláusula temporal."
        },
        {
          "id": "3-2",
          "prompt": "Llevo tres horas esperándote.",
          "hint": "Present Perfect Continuous",
          "solution": "I've been waiting for you for three hours.",
          "explanation": "Uso de 'for' para periodos de tiempo."
        },
        {
          "id": "3-3",
          "prompt": "Deberías haberlo dicho antes.",
          "hint": "Modal de arrepentimiento en pasado",
          "solution": "You should have said it earlier.",
          "explanation": "'Should have + participio'."
        },
        {
          "id": "3-4",
          "prompt": "No tiene sentido discutir por esto.",
          "hint": "Expresión idiomática con 'point'",
          "solution": "There is no point in arguing about this.",
          "explanation": "'No point in + ing' es la forma más nativa."
        },
        {
          "id": "3-5",
          "prompt": "Avísame si cambias de opinión.",
          "hint": "Phrasal 'let me know'",
          "solution": "Let me know if you change your mind.",
          "explanation": "Frase idiomática estándar en inglés conversacional."
        }
      ]
    }
  ]
}
`;

  try {
    const models = ['gemini-2.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-3.5-flash-lite', 'gemini-2.0-flash', 'gemini-1.5-flash'];
    let rawText = '';

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

    if (!rawText) {
      return res.status(502).json({ error: 'No se pudo generar el documento de práctica en este momento' });
    }

    // Limpiar posibles fences de markdown
    const cleanJson = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
    const documentData = JSON.parse(cleanJson);

    return res.status(200).json(documentData);
  } catch (err: any) {
    return res.status(500).json({ error: 'Error al generar documento de práctica', detail: err.message });
  }
}
