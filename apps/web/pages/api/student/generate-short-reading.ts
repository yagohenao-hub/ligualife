import type { NextApiRequest, NextApiResponse } from 'next'
import { getSeededShortReading, ShortReadingItem } from '@/lib/short-reading-seed'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { topicOrder, topicName, level, studentName, targetVocabulary, forceNew } = req.body as {
    topicOrder?: number
    topicName?: string
    level?: string
    studentName?: string
    targetVocabulary?: Array<{ word: string; translationEs: string }>
    forceNew?: boolean
  }

  if (!topicName && !topicOrder) {
    return res.status(400).json({ error: 'topicOrder o topicName son requeridos' })
  }

  const orderNum = Number(topicOrder) || 1
  const cleanTitle = (topicName || `Tema #${orderNum}`).replace(/\s*\([^)]*\)/g, '').trim()

  // 1. Si no se fuerza una generación nueva con IA, devolver la versión del inventario semilla (Costo $0, Inmediato)
  if (!forceNew) {
    const seeded = getSeededShortReading(orderNum, cleanTitle)
    if (seeded) {
      return res.status(200).json({ reading: seeded, fromInventory: true })
    }
  }

  // 2. Si no hay clave de Gemini, fallback seguro al inventario semilla
  if (!GEMINI_API_KEY) {
    const fallback = getSeededShortReading(orderNum, cleanTitle)
    return res.status(200).json({ reading: fallback, fromInventory: true, notice: 'Modo offline: sin API key configurada' })
  }

  // 3. Generación on-demand con IA (Gemini)
  const vocabInstruction = targetVocabulary && targetVocabulary.length > 0
    ? `INCORPORA DE FORMA NATURAL AL MENOS 2 DE ESTAS PALABRAS/FRASES DE VOCABULARIO: ${targetVocabulary.map(v => `"${v.word}" (${v.translationEs})`).join(', ')}.`
    : 'Incorpora 2 o 3 colocaciones o frases idiomáticas naturales en inglés.'

  const prompt = `
Eres un autor de literatura pedagógica de élite en LinguaLife. Escribe una micro-lectura ("Short Reading") para un estudiante hispanohablante.
REGLA DE ORO INVIOLABLE: La historia o texto DEBE TENER MENOS DE 100 PALABRAS (ideal entre 50 y 85 palabras). Sé breve, cinematográfico y natural.

ESTUDIANTE: ${studentName || 'Estudiante'} | NIVEL: ${level || 'B1'}
TEMA GRAMATICAL A APLICAR: "${cleanTitle}" (Tema #${orderNum}).
${vocabInstruction}

ENTREGA TU RESPUESTA EXCLUSIVAMENTE EN FORMATO JSON VÁLIDO (sin markdown ni texto extra):
{
  "id": "sr-gen-${orderNum}-${Date.now()}",
  "topicOrder": ${orderNum},
  "topicName": "${cleanTitle}",
  "title": "Título sugerente y elegante en inglés",
  "readingText": "Texto de la lectura en inglés de máximo 100 palabras.",
  "wordCount": 75,
  "focusGrammar": "${cleanTitle}",
  "highlightedVocab": [
    { "word": "palabra_del_texto", "meaningEs": "traducción o significado en español" },
    { "word": "segunda_palabra", "meaningEs": "traducción o significado en español" }
  ],
  "quickQuestion": {
    "question": "¿Pregunta breve de comprensión en español sobre el texto?",
    "options": ["Opción 1", "Opción 2", "Opción 3"],
    "correctIndex": 0,
    "explanationEs": "Breve explicación pedagógica de por qué esa es la respuesta correcta."
  }
}
`

  try {
    const models = ['gemini-2.5-flash-lite', 'gemini-2.0-flash', 'gemini-1.5-flash']
    let rawText = ''

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
                temperature: 0.4,
                maxOutputTokens: 600
              }
            })
          }
        )

        if (!geminiRes.ok) continue
        const data = await geminiRes.json()
        rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
        if (rawText) break
      } catch {
        continue
      }
    }

    if (!rawText) {
      // Fallback al inventario si Gemini falló
      const fallback = getSeededShortReading(orderNum, cleanTitle)
      return res.status(200).json({ reading: fallback, fromInventory: true, fallback: true })
    }

    const cleanJson = rawText
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim()

    const parsed: ShortReadingItem = JSON.parse(cleanJson)

    // Validar conteo de palabras en backend
    const words = parsed.readingText.trim().split(/\s+/).length
    parsed.wordCount = words

    return res.status(200).json({ reading: parsed, fromInventory: false })
  } catch (err: any) {
    console.error('[generate-short-reading] Error:', err)
    const fallback = getSeededShortReading(orderNum, cleanTitle)
    return res.status(200).json({ reading: fallback, fromInventory: true, errorFallback: true })
  }
}
