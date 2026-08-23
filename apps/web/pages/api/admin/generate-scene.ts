import type { NextApiRequest, NextApiResponse } from 'next'
import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = process.env.GEMINI_API_KEY || ''
const genAI = new GoogleGenerativeAI(apiKey)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { title, category, level, url, vocabInput } = req.body

  if (!title && !url && !vocabInput) {
    return res.status(400).json({ error: 'Proporciona un título, tema, lista de palabras o URL' })
  }

  try {
    let sourceContent = vocabInput || ''
    let extractedUrl = url || ''

    // If vocabInput or url looks like a URL, attempt to scrape / fetch text
    const urlMatch = (url || vocabInput || '').match(/https?:\/\/[^\s]+/)
    if (urlMatch) {
      extractedUrl = urlMatch[0]
      try {
        const response = await fetch(extractedUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        })
        if (response.ok) {
          const html = await response.text()
          // Strip HTML tags roughly to extract text
          sourceContent = html
            .replace(/<script\b[^<]*>([\s\S]*?)<\/script>/gi, '')
            .replace(/<style\b[^<]*>([\s\S]*?)<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .slice(0, 4000)
        }
      } catch (err) {
        console.warn('Could not fetch URL, proceeding with text:', err)
      }
    }

    const sceneTitle = title || (extractedUrl ? 'Vocabulario extraído de Web' : 'Escena Interactiva B2')
    const sceneCategory = category || 'General / Estilo de Vida'
    const sceneLevel = level || 'B2'

    let extractedHotspots: any[] = []

    if (apiKey) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' })
        const prompt = `Act as an expert English language teacher (CEFR level B2).
Target Topic/Scene: "${sceneTitle}"
Category: "${sceneCategory}"
Target Level: "${sceneLevel}"

Source Material / Context:
"""
${sourceContent || sceneTitle}
"""

GOALS:
1. Extract or generate 8 to 10 distinct, useful English action verbs or B2 vocabulary expressions relevant to this scene/topic.
2. For each word, create a natural, engaging English descriptive sentence in present continuous or active tense ("She is stretching on the mat...").
3. Provide a fluid, natural Spanish translation for each sentence.

RESPONSE FORMAT (Return ONLY raw JSON, no markdown formatting):
[
  {
    "verb": "Stretching",
    "sentence": "She is stretching her legs on the mat before starting her workout.",
    "translation": "Ella está estirando sus piernas en la colchoneta antes de empezar su entrenamiento.",
    "category": "${sceneCategory}",
    "level": "${sceneLevel}"
  }
]`

        const aiResult = await model.generateContent(prompt)
        const text = aiResult.response.text().replace(/```json/g, '').replace(/```/g, '').trim()
        extractedHotspots = JSON.parse(text)
      } catch (aiErr) {
        console.error('Gemini extraction failed, using fallback:', aiErr)
      }
    }

    // Fallback if AI or API key is not active
    if (!extractedHotspots || extractedHotspots.length === 0) {
      const wordsList = sourceContent.includes('http')
        ? ['Checking in', 'Lifting weights', 'Hydrating', 'Jogging', 'Stretching', 'Squatting', 'Breathing', 'Pacing']
        : sourceContent.split(',').map((s: string) => s.trim()).filter(Boolean)

      extractedHotspots = (wordsList.length > 0 ? wordsList : ['Action 1', 'Action 2', 'Action 3']).map((w: string, i: number) => ({
        verb: w.replace(/^https?:\/\/[^\s]+/, 'Vocabulary Action'),
        sentence: `The person is engaging in ${w.toLowerCase()} during the session.`,
        translation: `La persona está realizando la actividad de ${w.toLowerCase()} durante la sesión.`,
        category: sceneCategory,
        level: sceneLevel,
      }))
    }

    // Generate coordinates spreading hotspots dynamically across 1280x720 grid
    const hotspotsWithCoords = extractedHotspots.slice(0, 10).map((h, i) => {
      // Create a balanced spiral or grid coordinate pattern (x: 15% to 85%, y: 20% to 80%)
      const col = i % 4
      const row = Math.floor(i / 4)
      const x = Math.min(88, Math.max(12, 18 + col * 22 + (i % 2 === 0 ? 5 : -5)))
      const y = Math.min(82, Math.max(18, 22 + row * 26 + (col % 2 === 0 ? 6 : -4)))

      return {
        id: `h_ai_${Date.now()}_${i}`,
        x,
        y,
        verb: h.verb || `Action ${i+1}`,
        sentence: h.sentence || `He is practicing English in the ${sceneCategory.toLowerCase()} scene.`,
        translation: h.translation || `Él está practicando inglés en el escenario.`,
        level: h.level || sceneLevel,
        category: h.category || sceneCategory,
      }
    })

    // Construct AI Image Prompt & Pollinations URL
    const imagePrompt = `Isometric 2D vector illustration of a ${sceneTitle}, ${sceneCategory} environment, vibrant modern lighting, multiple detailed characters performing actions, 8k resolution, flat design, clean isometric perspective`
    const seed = Math.floor(Math.random() * 900000) + 100000
    const generatedImageSrc = `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}?width=1280&height=720&nologo=true&seed=${seed}`

    return res.status(200).json({
      success: true,
      scene: {
        id: `scene_ai_${Date.now()}`,
        title: sceneTitle,
        subtitle: `Explora el escenario de ${sceneTitle}. Haz clic en los personajes para descubrir su vocabulario.`,
        imageSrc: generatedImageSrc,
        totalVerbs: hotspotsWithCoords.length,
        hotspots: hotspotsWithCoords,
        createdAt: new Date().toISOString().split('T')[0],
      }
    })
  } catch (error: any) {
    console.error('Error generating scene:', error)
    return res.status(500).json({ error: error.message || 'Error al generar la escena con IA' })
  }
}
