import type { NextApiRequest, NextApiResponse } from 'next'
import {
  TriviaQuestion,
  TriviaDifficulty,
  TriviaArchetype,
  getSeedQuestionsForTopic,
  getSeedQuestionsForVocabulary,
  buildBalancedOptions
} from '@/lib/trivia-seed'
import { getTopicSummary } from '@/lib/curriculum-summary'
import { VocabCategory, CefrLevel, getVocabularyByCategory } from '@/lib/vocabulary'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const {
    contextType = 'topic',
    topicOrder = 1,
    topicName = 'The Universal Idea',
    ldsFormula,
    commonMistake,
    grammarFocus = '',
    vocabCategory = 'time_words',
    cefrLevel = 'A1',
    studentName = 'Estudiante',
    studentInterests = 'Tecnología, negocios, viajes, cultura',
    vertical = '',
    level = 'B1',
    difficultyLevel = 'basic',
    excludeContexts = []
  } = req.body as {
    contextType?: 'topic' | 'vocabulary'
    topicOrder?: number
    topicName?: string
    ldsFormula?: string
    commonMistake?: string
    grammarFocus?: string
    vocabCategory?: VocabCategory
    cefrLevel?: CefrLevel
    studentName?: string
    studentInterests?: string
    vertical?: string
    level?: string
    difficultyLevel?: TriviaDifficulty
    excludeContexts?: string[]
  }

  const cleanTopicName = (topicName || 'General English').replace(/\s*\([^)]*\)/g, '').trim()
  const summary = getTopicSummary(topicOrder, cleanTopicName)
  const effectiveFormula = ldsFormula || summary.correctMethod
  const effectiveMistake = commonMistake || summary.commonMistake.explanation

  const difficultyPrompt =
    difficultyLevel === 'advanced'
      ? 'NIVEL DE DIFICULTAD: AVANZADO / MASTER (Nivel 3). Diseña situaciones ejecutivas o cotidianas más retadoras, distractores muy sutiles de interferencia hispana y contrastes de matiz nativo.'
      : difficultyLevel === 'intermediate'
      ? 'NIVEL DE DIFICULTAD: INTERMEDIO / ÁGIL (Nivel 2). Frases naturales de longitud media, diálogos dinámicos y trampas habituales de hispanohablantes en conversación.'
      : 'NIVEL DE DIFICULTAD: FUNDAMENTAL / BASE (Nivel 1). Oraciones claras, directas y memorables para automatizar el reflejo comunicativo inicial.'

  let contextBlock = ''
  if (contextType === 'vocabulary') {
    const vocabWords = getVocabularyByCategory(vocabCategory, cefrLevel, false)
    const wordsDigest = vocabWords
      .slice(0, 8)
      .map(
        w =>
          `- "${w.word}" (${w.partOfSpeech}): ${w.senses
            .map(s => `[Acepción #${s.senseIndex} ${s.cefrLevelTarget}: ${s.definitionEs} | Ej: "${s.exampleSentenceEn}"]`)
            .join(' ')}`
      )
      .join('\n')

    contextBlock = `
CONTEXTO DE GIMNASIO DE VOCABULARIO Y POLISEMIA:
- Categoría: "${vocabCategory}" | Nivel MCER: "${cefrLevel}"
- Palabras y Acepciones Objetivo:
${wordsDigest}
`
  } else {
    const examplesDigest = summary.examples
      .map(e => `- "${e.en}" (${e.es})`)
      .join('\n')
    contextBlock = `
DATOS PEDAGÓGICOS DEL TEMA #${topicOrder}:
- Concepto Pedagógico: "${summary.title || cleanTopicName}"
- Arquitectura / Método: "${effectiveFormula}"
- Error común a erradicar en hispanohablantes: "${effectiveMistake}" (Incorrecto: "${summary.commonMistake.wrong}" -> Correcto: "${summary.commonMistake.correct}")
- Ejemplos modelo del tema:
${examplesDigest}
`
  }

  const prompt = `
Actúa como Diseñador Pedagógico Senior en LinguaLife, academia de inglés neuromotor para hispanohablantes.
Genera un lote de EXACTAMENTE 5 preguntas de trivia de opción múltiple ágiles, adictivas y variadas.

${contextBlock}
- ${difficultyPrompt}

PERFIL DEL ESTUDIANTE:
- Nombre: ${studentName} | Nivel: ${level}
- Intereses: ${studentInterests} | Sector: ${vertical || 'General'}

REGLAS DE ORO INQUEBRANTABLES:
1. PROHIBIDO mencionar títulos internos de lecciones o siglas ("S+T+A", "LDS") en la pregunta. Todas las preguntas deben ser retos prácticos de inglés real.
2. Genera 5 preguntas de ARQUETIPOS DIFERENTES para mantener alta la dopamina del estudiante:
   - Pregunta 1 [archetype: "situation"]: Mini-situación práctica o diálogo realista donde debe elegir la frase exacta en inglés.
   - Pregunta 2 [archetype: "spot_trap"]: Detector de trampa hispana ("Spot the Trap"). Tres opciones tienen errores típicos de traducción literal y una es 100% natural.
   - Pregunta 3 [archetype: "cloze"]: Completar el eslabón faltante "[ ___ ]" dentro de una oración clave en inglés.
   - Pregunta 4 [archetype: "transform"]: Contraste de significado, polisemia o cambio de intención comunicativa.
   - Pregunta 5 [archetype: "detective"]: Reto inverso (cómo expresar una idea específica en inglés o deducir la pregunta exacta).
3. NO REPITAS NINGUNA DE ESTAS PREGUNTAS PREVIAS:
   ${excludeContexts.length > 0 ? excludeContexts.slice(-15).join(' | ') : 'Ninguna previa.'}
4. CADA PREGUNTA DEBE TENER:
   - "options": Array de exactamente 4 strings cortos y claros.
   - "correctIndex": Número entero (0, 1, 2 o 3) indicando la opción correcta.
   - "explanation": Explicación cálida, clara y directa en español de por qué esa opción es la correcta.
   - "trapExplanation": Qué trampa mental del español se evitó.
   - "difficulty": "${difficultyLevel}"

RESPONDE EXCLUSIVAMENTE CON UN OBJETO JSON VÁLIDO:
{
  "questions": [
    {
      "id": "ai-${topicOrder}-1",
      "topicOrder": ${topicOrder},
      "topicName": "${cleanTopicName}",
      "question": "Texto de la pregunta...",
      "contextScenario": "Pista breve o contexto...",
      "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
      "correctIndex": 0,
      "explanation": "Explicación clara...",
      "trapExplanation": "Trampa evitada...",
      "archetype": "situation",
      "difficulty": "${difficultyLevel}"
    }
  ]
}
`

  const models = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.0-flash']
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
                temperature: 0.8,
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
      } catch {
        // Intentar con el siguiente modelo disponible
      }
    }
  }

  if (rawText) {
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/)
      const cleanJson = jsonMatch ? jsonMatch[0] : rawText.trim()
      const parsed = JSON.parse(cleanJson)

      if (Array.isArray(parsed.questions) && parsed.questions.length > 0) {
        const now = Date.now()
        const sanitizedQuestions: TriviaQuestion[] = parsed.questions
          .filter(
            (q: any) =>
              q &&
              typeof q.question === 'string' &&
              Array.isArray(q.options) &&
              q.options.length >= 2
          )
          .map((q: any, idx: number) => {
            const rawCorrectIdx =
              typeof q.correctIndex === 'number' && q.correctIndex >= 0 && q.correctIndex < q.options.length
                ? q.correctIndex
                : 0
            const correctText = String(q.options[rawCorrectIdx] || q.options[0])
            const distractors = q.options
              .filter((_: any, i: number) => i !== rawCorrectIdx)
              .map((o: any) => String(o))

            const { options, correctIndex } = buildBalancedOptions(
              correctText,
              distractors,
              now + idx
            )

            return {
              id: `ai-${contextType}-${topicOrder}-${now}-${idx}`,
              topicOrder,
              topicName: cleanTopicName,
              question: q.question.trim(),
              contextScenario: q.contextScenario || undefined,
              options,
              correctIndex,
              explanation: q.explanation || 'Estructura natural del inglés verificada.',
              ldsFormula: effectiveFormula,
              trapExplanation: q.trapExplanation || effectiveMistake,
              archetype: (q.archetype as TriviaArchetype) || 'situation',
              difficulty: (q.difficulty as TriviaDifficulty) || difficultyLevel,
              contextSource: contextType
            }
          })

        if (sanitizedQuestions.length > 0) {
          return res.status(200).json({
            ok: true,
            source: 'ai',
            questions: sanitizedQuestions
          })
        }
      }
    } catch {
      // Si el JSON de la IA vino truncado, caemos suavemente al sintetizador determinístico
    }
  }

  // Fallback determinístico rico (10-20 preguntas dinámicas por tema o por categoría de vocabulario)
  const seeds =
    contextType === 'vocabulary'
      ? getSeedQuestionsForVocabulary(vocabCategory, cefrLevel)
      : getSeedQuestionsForTopic(topicOrder, cleanTopicName, effectiveFormula, effectiveMistake, grammarFocus)

  const excludeSet = new Set(excludeContexts.map(c => c.trim().toLowerCase()))
  const unseenSeeds = seeds.filter(s => !excludeSet.has(s.question.trim().toLowerCase()))
  const poolToUse = unseenSeeds.length > 0 ? unseenSeeds : seeds

  const fallbackQuestions = poolToUse.slice(0, 6).map((s, idx) => ({
    ...s,
    id: `synth-fallback-${topicOrder}-${idx}-${Date.now()}`,
    difficulty: s.difficulty || difficultyLevel
  }))

  return res.status(200).json({
    ok: true,
    source: 'synthesizer',
    questions: fallbackQuestions
  })
}
