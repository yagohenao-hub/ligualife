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
Eres un entrenador pedagógico de élite en LinguaLife creando 3 tarjetas de práctica ágiles y de alto impacto para un estudiante hispanohablante.

ESTUDIANTE: ${studentName || 'Estudiante'} | NIVEL: ${level || 'B1'}
TEMA DE CLASE: ${topicName} | FÓRMULA LÓGICA: ${ldsFormula || 'Sujeto + Palabra de Tiempo + Acción'}
ERROR TÍPICO DE HISPANOHABLANTE A CORREGIR: ${commonMistake || 'Traducción literal desde el español'}

GENERA EXACTAMENTE 3 ENFOQUES DE PRÁCTICA:
1. "Fill the Pattern": Completar el espacio en blanco aplicando la Palabra de Tiempo correcta.
2. "Spot the Colombian Trap": Una oración común dicha por hispanohablantes con un error sutil. El alumno debe identificarlo.
3. "Reverse Sprint": Traducir una idea corta del español al inglés natural sin rodeos.

ENTREGA TU RESPUESTA EXCLUSIVAMENTE EN FORMATO JSON VÁLIDO (sin bloques de markdown ni texto adicional):
[
  {
    "id": 1,
    "type": "Fill the Pattern",
    "prompt": "Oración en inglés con [___] para completar.",
    "hint": "Pista breve basada en la fórmula",
    "solution": "Respuesta correcta",
    "explanation": "Por qué es la opción natural en 1 frase."
  },
  {
    "id": 2,
    "type": "Spot the Colombian Trap",
    "prompt": "Oración incorrecta típica (ej: 'I have 25 years')",
    "hint": "Cuidado con la traducción literal",
    "solution": "Corrección en inglés nativo",
    "explanation": "Explicación breve de la trampa mental."
  },
  {
    "id": 3,
    "type": "Reverse Sprint",
    "prompt": "Frase en español para traducir ágilmente",
    "hint": "Usa la Palabra de Tiempo directamente",
    "solution": "Traducción natural al inglés",
    "explanation": "Fórmula aplicada de forma limpia."
  }
]
`;

  try {
    const models = ['gemini-3.1-flash-lite', 'gemini-3.5-flash-lite'];
    let rawText = '';

    for (const model of models) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
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
      return res.status(502).json({ error: 'No se pudo generar práctica en este momento' });
    }

    // Limpiar posibles fences de markdown
    const cleanJson = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
    const cards = JSON.parse(cleanJson);

    return res.status(200).json({ cards });
  } catch (err: any) {
    return res.status(500).json({ error: 'Error al generar tarjetas de práctica', detail: err.message });
  }
}
