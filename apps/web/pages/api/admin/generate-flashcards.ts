import type { NextApiRequest, NextApiResponse } from 'next'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { FlashcardPack, FlashcardItem } from '@/lib/flashcards'

const apiKey = process.env.GEMINI_API_KEY || ''
const genAI = new GoogleGenerativeAI(apiKey)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { title, topic, url, vocabInput, category, level } = req.body

  if (!title && !topic && !url && !vocabInput) {
    return res.status(400).json({ error: 'Proporciona un título, tema o URL para generar el pack' })
  }

  try {
    let sourceContent = vocabInput || ''
    let extractedUrl = url || ''

    if (url || (vocabInput && vocabInput.includes('http'))) {
      extractedUrl = url || vocabInput
      try {
        const response = await fetch(extractedUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        })
        if (response.ok) {
          const html = await response.text()
          sourceContent = html
            .replace(/<script\b[^<]*>([\s\S]*?)<\/script>/gi, '')
            .replace(/<style\b[^<]*>([\s\S]*?)<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .slice(0, 4000)
        }
      } catch (err) {
        console.warn('Scraper fetch error:', err)
      }
    }

    const packTitle = title || topic || 'Pack Conceptual B2'
    const packCategory = category || 'Polisemia & Morfología'
    const packLevel = level || 'B1-B2'

    let generatedCards: any[] = []

    if (apiKey) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' })
        const prompt = `Act as an expert linguistic curriculum designer.
Target Topic/Root Word: "${packTitle}"
Category: "${packCategory}"
Level: "${packLevel}"

Context/Source Text:
"""
${sourceContent || packTitle}
"""

TASK:
Generate 6 to 8 deep, conceptual English vocabulary flashcard items focusing on polysemy, derived words, phrasal verbs, or idioms related to "${packTitle}". Avoid 1-to-1 simple translations.

For each item, provide:
1. "word": English word or phrase (e.g. "Drawback")
2. "ipa": International Phonetic Alphabet pronunciation (e.g. "/ˈdrɔː.bæk/")
3. "definitionEn": A VERY short, simple English definition using basic A1-A2 vocabulary (e.g. "A bad feature or problem of something.")
4. "translationEs": Spanish translation of the word (e.g. "Desventaja / Inconveniente")
5. "definitionTranslationEs": Spanish translation of the definition.

RETURN ONLY RAW JSON ARRAY (No Markdown formatting):
[
  {
    "word": "Drawback",
    "ipa": "/ˈdrɔː.bæk/",
    "definitionEn": "A problem or bad feature of a situation.",
    "translationEs": "Desventaja / Inconveniente",
    "definitionTranslationEs": "Un problema o mala característica de una situación."
  }
]`

        const aiResult = await model.generateContent(prompt)
        const rawText = aiResult.response.text().replace(/```json/g, '').replace(/```/g, '').trim()
        generatedCards = JSON.parse(rawText)
      } catch (aiErr) {
        console.error('Gemini flashcard generation error:', aiErr)
      }
    }

    if (!generatedCards || generatedCards.length === 0) {
      generatedCards = [
        {
          word: 'Draw',
          ipa: '/drɔː/',
          definitionEn: 'To make a picture with a pencil or pull something.',
          translationEs: 'Dibujar / Tirar de algo',
          definitionTranslationEs: 'Hacer una imagen con lápiz o tirar de algo.'
        },
        {
          word: 'Drawer',
          ipa: '/drɔːr/',
          definitionEn: 'A box inside a desk that you pull open.',
          translationEs: 'Cajón / Gaveta',
          definitionTranslationEs: 'Una caja dentro de un escritorio que abres jalando.'
        }
      ]
    }

    const formattedCards: FlashcardItem[] = generatedCards.map((c: any, index: number) => ({
      id: `card_${Date.now()}_${index}`,
      word: c.word,
      ipa: c.ipa || '',
      definitionEn: c.definitionEn,
      translationEs: c.translationEs,
      definitionTranslationEs: c.definitionTranslationEs,
      imageSrc: `/flashcards/draw.png`, // Default image fallback
      hotspotCoordinates: { x: 15 + (index * 12) % 70, y: 25 + (index * 10) % 65 }
    }))

    const newPack: FlashcardPack = {
      id: `pack_${Date.now()}`,
      title: packTitle,
      subtitle: `Pack conceptual de ${packTitle} generado con IA.`,
      category: packCategory,
      level: packLevel,
      sceneImageSrc: '/flashcards/draw_family_scene.png',
      cards: formattedCards,
      createdAt: new Date().toISOString().split('T')[0]
    }

    return res.status(200).json({ success: true, pack: newPack })
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Error al generar pack de tarjetas' })
  }
}
