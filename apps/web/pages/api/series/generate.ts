import type { NextApiRequest, NextApiResponse } from 'next'

// --- SRT PARSER UTILS ---
function parseSRT(srt: string) {
  const entries = srt.trim().split(/\n\s*\n/)
  return entries.map(entry => {
    const lines = entry.split('\n')
    if (lines.length < 2) return null
    const times = lines[1].split(' --> ')
    if (times.length < 2) return null
    
    return {
      start: timeToMs(times[0]),
      end: timeToMs(times[1]),
      text: lines.slice(2).join(' ').replace(/<[^>]*>/g, '').trim()
    }
  }).filter(e => e !== null)
}

function timeToMs(timeStr: string) {
  const t = timeStr.trim().replace(',', '.')
  const [h, m, s] = t.split(':')
  return (parseFloat(h) * 3600 + parseFloat(m) * 60 + parseFloat(s)) * 1000
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { srt, title } = req.body
  if (!srt) return res.status(400).json({ error: 'SRT content required' })

  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) throw new Error('GEMINI_API_KEY not found')

    // 1. Parse and Truncate logic
    const allSubs = parseSRT(srt)
    if (allSubs.length === 0) throw new Error('Invalid SRT format')

    const totalDuration = allSubs[allSubs.length - 1].end
    const q1Limit = totalDuration / 4
    const q2Limit = totalDuration / 2

    const blockA = allSubs.filter(s => s!.start <= q1Limit).map(s => s!.text).join(' ')
    const blockB = allSubs.filter(s => s!.start > q1Limit && s!.start <= q2Limit).map(s => s!.text).join(' ')
    const blockFullForContext = allSubs.map(s => s!.text).join(' ')

    // 2. Prepare Prompt
    const prompt = `
    INSTRUCCIONES MAESTRAS (Estructura ESL Series Activity):
    Eres un asistente experto en creación de materiales ESL. Vas a procesar los subtítulos de un episodio de la serie: ${title || 'Sin título'}.

    REGLAS DE TRUNCAMIENTO SOLICITADAS:
    - Fases 1 (Previewing) y 2 (Pronunciation): Deben basarse exclusivamente en el vocabulario y sucesos del primer cuarto del episodio (Q1).
    - Fase 3 (Listening): Debe basarse en el segundo cuarto del episodio (Q2), creando ejercicios de completar frases reales.
    - Fase 4 (Discussion): Basada en la trama general deducida de los subtítulos.

    CONTENIDO PROPORCIONADO:
    - BLOQUE A (Q1): ${blockA}
    - BLOQUE B (Q2): ${blockB}

    ESTRUCTURA DE SALIDA (EXCLUSIVA):
    🎯 Objective: Resumen pedagógico breve.
    🔹 1. Previewing: Vocabulary Focus: Tabla con (Palabra/Expresión, Traducción, Contexto, Ejemplo del profesor, Traducción ejemplo).
    🔹 2. Pronunciation Focus: Tabla con (Frase original, Traducción, Pronunciation Goal -ej. Connected Speech-, Practice Tip).
    🔹 3. While-viewing: Listening Comprehension: Mínimo 5 ejercicios basados en el Bloque B. 
       Para cada uno incluye: 
       1) La frase larga e identificable del episodio en inglés.
       2) Su traducción al español.
       3) La misma frase con espacios en blanco (____) para que el alumno complete.
    🔹 4. Post-viewing: Discussion and Reflection: 3 preguntas abiertas sobre la trama y temas del episodio.

    RESTRICCIONES:
    - Los títulos y emojis deben ser EXACTOS a la estructura.
    - Responde solo en Markdown.
    `

    // 3. Gemini Call - Using Gemini 2.5 Flash Lite as requested for speed and stability
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048
        }
      })
    })

    const data = await response.json()
    if (data.error) throw new Error(data.error.message)

    const resultMarkdown = data.candidates?.[0]?.content?.parts?.[0]?.text || "No se pudo generar el contenido."

    return res.status(200).json({ 
      markdown: resultMarkdown,
      stats: {
        totalDuration: Math.round(totalDuration / 1000),
        q1Limit: Math.round(q1Limit / 1000),
        q2Limit: Math.round(q2Limit / 1000)
      }
    })

  } catch (err: any) {
    console.error('Series API Error:', err)
    return res.status(500).json({ error: err.message })
  }
}
