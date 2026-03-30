import type { NextApiRequest, NextApiResponse } from 'next'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { text, url, title } = req.body
  if (!text && !url) return res.status(400).json({ error: 'Falta el texto o URL del cuento' })

  try {
    let rawText = text
    if (url && !text) {
      const storyRes = await fetch(url)
      rawText = await storyRes.text()
    }

    // Truncate if too long (max 3 pages concept ~1200 words)
    const words = rawText.trim().split(/\s+/)
    if (words.length > 2000) {
        rawText = words.slice(0, 1500).join(' ') + ' [Story truncated for pedagogical exercise]'
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' })

const prompt = `Act as an expert English teacher specialized in B2 level pedagogical storybooks. 
Analyze the following short story: "${title || 'Untitled'}".

Text:
"""
${rawText}
"""

GOALS:
1. Fragment the English text into logical semantic chunks.
2. Provide high-quality translations. If this is a world-renowned classic, attempt to use its professional/historical standard Spanish translation (Latin American neutral preferred).
3. Ensure the Spanish is fluid and natural, avoiding robotic or word-for-word structures.
4. The goal is to provide a 'Native Natural' experience for the reader.
5. Create B2-level pedagogical keywords (verbs/nouns) for visual anchoring.

RESPONSE FORMAT (ONLY JSON):
{
  "title": "Title of the story",
  "mood": "Horror | Adventure | etc",
  "fragments": [
     { "en": "Logical fragment in English", "es": "Natural translation in Spanish" },
     ...
  ],
  "keywords": [
     { "word": "Word", "translation": "Spanish", "image_prompt": "Stylized AI prompt" },
     ...
  ]
}`

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()
    // Extract JSON from response text (Gemini sometimes adds ```json blocks)
    const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim()
    const data = JSON.parse(jsonStr)

    return res.status(200).json(data)
  } catch (error: any) {
    console.error('Story Process Error:', error)
    return res.status(500).json({ error: 'Error al procesar el cuento pedagógicamente' })
  }
}
