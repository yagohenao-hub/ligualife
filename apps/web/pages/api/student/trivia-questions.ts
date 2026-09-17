import type { NextApiRequest, NextApiResponse } from 'next'
import { TriviaQuestion } from '@/lib/trivia-seed'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const {
    topicOrder = 1,
    topicName = 'The Universal Idea (S+T+A)',
    ldsFormula = 'Sujeto + Palabra de Tiempo + Acción (Base)',
    commonMistake = 'Omitir el sujeto o traducir palabra por palabra',
    grammarFocus = '',
    studentName = 'Estudiante',
    studentInterests = 'Tecnología, viajes, vida diaria',
    vertical = '',
    level = 'B1',
    difficultyLevel = 'basic',
    excludeContexts = []
  } = req.body as {
    topicOrder?: number
    topicName?: string
    ldsFormula?: string
    commonMistake?: string
    grammarFocus?: string
    studentName?: string
    studentInterests?: string
    vertical?: string
    level?: string
    difficultyLevel?: 'basic' | 'intermediate' | 'advanced'
    excludeContexts?: string[]
  }

  // Sanitizar el nombre del tema para eliminar cualquier sigla o paréntesis interno
  const cleanTopicName = (topicName || 'General English').replace(/\s*\([^)]*\)/g, '').trim()

  const difficultyPrompt = difficultyLevel === 'advanced'
    ? 'NIVEL DE DIFICULTAD: AVANZADO / ALTO DOMINIO. Diseña situaciones más retadoras, vocabulario más enriquecido, distractores muy sutiles de nivel nativo y matices comunicativos que exijan discernimiento fino.'
    : difficultyLevel === 'intermediate'
    ? 'NIVEL DE DIFICULTAD: INTERMEDIO. Frases naturales de longitud media, diálogos cotidianos y trampas habituales de hispanohablantes en conversación.'
    : 'NIVEL DE DIFICULTAD: FUNDAMENTAL / BÁSICO. Oraciones claras y directas para afianzar el reflejo comunicativo inicial.'

  const prompt = `
Actúa como Diseñador Pedagógico Senior en LinguaLife, una academia de inglés premium para hispanohablantes.
Tu misión es generar un lote de EXACTAMENTE 4 preguntas de trivia de opción múltiple ágil para un estudiante.

DATOS PEDAGÓGICOS DEL TEMA #${topicOrder}:
- Concepto Pedagógico: "${cleanTopicName}"
- Enfoque Clave: "${grammarFocus || cleanTopicName}"
- Error común a erradicar en hispanohablantes: "${commonMistake}"
- ${difficultyPrompt}

PERFIL DEL ESTUDIANTE:
- Nombre: ${studentName} | Nivel: ${level}
- Intereses / Hobbies: ${studentInterests}
- Sector / Carrera: ${vertical || 'General'}

DIRECTRIZ CRÍTICA DE REDACCIÓN Y TONO (IMPORTANTE):
1. PROHIBIDO mencionar títulos internos de lecciones (como "${cleanTopicName}" o siglas como "S+T+A", "LDS") dentro del texto de las preguntas. Las preguntas DEBEN ser situaciones de inglés real (diálogos, completar la frase, identificar la opción correcta o detectar la trampa). Jamás le preguntes al alumno qué dice un tema de la base de datos.
2. PROHIBIDO usar lenguaje matemático, algebraico o fórmulas como "S+T+A", "Sujeto + Verbo + Acción", o "Fórmula LDS". El alumno no conoce siglas internas ni busca lingüística teórica.
3. Las explicaciones deben ser NATURALES, CONVERSACIONALES, CLARAS Y CÁLIDAS en español:
   - Explica el POR QUÉ de la respuesta correcta de forma humana y práctica (ejemplo: "Al hablar del clima en inglés, siempre debemos incluir el pronombre 'It' porque nunca podemos dejar una frase sin sujeto...", o "Con modales como should, el verbo siempre va en su forma simple sin 'to'").
   - En la explicación de la trampa ("trapExplanation"), explica con amabilidad por qué un hispanohablante suele equivocarse o traducir literalmente del español.
4. Genera 4 preguntas VARIADAS y NO REPETITIVAS:
   - Pregunta 1 [Arquetipo: 'situation']: Mini-situación o diálogo realista conectado con los gustos del alumno (${studentInterests}).
   - Pregunta 2 [Arquetipo: 'spot_trap']: Detector de error latino ("Spot the Trap"). Cuál opción es la única correcta y libre de la interferencia del español.
   - Pregunta 3 [Arquetipo: 'transform']: Transformación ágil o cambio de intención comunicativa.
   - Pregunta 4 [Arquetipo: 'detective']: Pregunta inversa (Dada una respuesta en inglés, deducir la pregunta correcta).
5. CONTEXTOS / VERBOS A EVITAR REPETIR:
   ${excludeContexts.length > 0 ? excludeContexts.join(', ') : 'Ninguno por ahora. Varía ampliamente los verbos y escenarios.'}
6. CADA PREGUNTA DEBE TENER:
   - 4 opciones claras y concisas (A, B, C, D) en inglés.
   - 1 opción indiscutiblemente correcta (índice 0, 1, 2 o 3 aleatorizado).
   - 3 distractores altamente tentadores basados en errores que suelen cometer los hispanohablantes.

ENTREGA TU RESPUESTA EXCLUSIVAMENTE EN FORMATO JSON VÁLIDO (sin texto antes ni después, sin markdown):
{
  "questions": [
    {
      "id": "gen-${topicOrder}-1-${Date.now()}",
      "topicOrder": ${topicOrder},
      "topicName": "${cleanTopicName}",
      "question": "Enunciado de la situación práctica o diálogo en inglés...",
      "options": [
        "Opción A",
        "Opción B",
        "Opción C",
        "Opción D"
      ],
      "correctIndex": 1,
      "explanation": "Explicación humana y pedagógica de por qué esta es la opción correcta sin usar álgebra ni mencionar nombres de lecciones.",
      "trapExplanation": "Explicación amable de la trampa latina evitada.",
      "archetype": "situation"
    }
  ]
}
`

  try {
    const models = [
      'gemini-2.5-flash-lite',
      'gemini-3.1-flash-lite',
      'gemini-2.0-flash',
      'gemini-1.5-flash'
    ]

    let rawText = ''

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
                  temperature: 0.75,
                  maxOutputTokens: 2500
                }
              })
            }
          )

          if (geminiRes.ok) {
            const data = await geminiRes.json()
            rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
            if (rawText) break
          }
        } catch {}
      }
    }

    if (rawText) {
      const cleanJson = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim()
      const parsed = JSON.parse(cleanJson)
      if (Array.isArray(parsed.questions) && parsed.questions.length > 0) {
        return res.status(200).json({
          ok: true,
          questions: parsed.questions as TriviaQuestion[]
        })
      }
    }

    // Si la API falla o no hay key, devolver fallback de alta calidad SIN nombres internos
    const fallbackQuestion: TriviaQuestion = {
      id: `fallback-${topicOrder}-${Date.now()}`,
      topicOrder,
      topicName: cleanTopicName,
      question: '¿Cuál de las siguientes opciones expresa una idea en inglés de la forma más natural y correcta?',
      options: [
        'Respetar el orden natural del inglés sin omitir el pronombre ni los auxiliares',
        'Omitir los auxiliares para intentar sonar más rápido',
        'Traducir palabra por palabra calcando las frases del español',
        'Conjugarse tanto el auxiliar como el verbo de acción a la vez'
      ],
      correctIndex: 0,
      explanation: 'En inglés es fundamental mantener una estructura clara y directa sin omitir los pronombres ni alterar la posición de los auxiliares.',
      trapExplanation: `Ten cuidado con ${commonMistake}.`,
      archetype: 'spot_trap'
    }

    return res.status(200).json({
      ok: true,
      questions: [fallbackQuestion]
    })
  } catch (error: any) {
    return res.status(500).json({ error: 'Error al generar preguntas de trivia', detail: error.message })
  }
}
