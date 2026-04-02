import type { NextApiRequest, NextApiResponse } from 'next'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!

export interface Slide {
  title: string
  content: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { studentName, level, vertical, interests, topicName, ldsFormula, aiContext, previousTopic } = req.body as {
    studentName?: string
    level?: string
    vertical?: string
    interests?: string
    topicName?: string
    ldsFormula?: string
    aiContext?: string
    previousTopic?: string
  }

  if (!topicName) return res.status(400).json({ error: 'topicName es requerido' })

  const prompt = `
You are an elite English coach generating dark-theme classroom slides and session assets for a language student.

STUDENT: ${studentName || 'Alumno'} | LEVEL: ${level || 'B2'} | VERTICAL: ${vertical || 'General'}
CURRENT TOPIC: ${topicName} | PREVIOUS TOPIC: ${previousTopic || 'None'}
INTERESTS: ${interests || 'General'} | LDS FORMULA: ${ldsFormula || 'S + T + A'}
CONTEXT: ${aiContext || ''}

LATEST TECH NEWS (Context for Slide 4):
- OpenAI released GPT-5.4 & Pro with computer-use capabilities.
- Anthropic released Claude 4.6 with fine-tuned coding/reasoning.
- NVIDIA announced Vera Rubin (H300 GPUs) for trillion-parameter models.

YOUR OUTPUT MUST BE DIVIDED BY THESE EXACT MARKERS:

[[SLIDE_1: Logic Decoder]]
- Content: Intense focus on the LOGIC of the topic.
- High-impact explanation using the LDS Formula: ${ldsFormula}.

[[SLIDE_2: Colombian Filter]]
- Content: The "Filtro Colombiano". Identify 3 common errors Colombians make with this specific topic (e.g. literal translations from Spanish).
- Design: Show "✗ Common Error" vs "✓ LDS Version (Natural English)". Use local Colombian context (cities, food, work situations).

[[SLIDE_3: Real-Life Chunks]]
- Content: 4-6 language 'Chunks' (blocks of words that go together). 
- Do NOT provide just single words. Provide ready-to-use semi-fixed expressions.

[[SLIDE_4: Conversation & News]]
- Content Part 1 (Prompting): Provide 3-4 open questions the teacher should ask to stimulate conversation using the topic.
- Content Part 2 (Current News): A segment titled "LDS Breaking News" discussing a recent development (e.g. GPT-5.4 or Claude 4.6) and asking how it affects their field (${vertical}).

[[WARMUP_ASSETS]]
{
  "icebreaker": "A specific question for ${new Date().toLocaleDateString()} if there is a holiday or special event, otherwise a light general question.",
  "spanglishPhrases": [
    "3 phrases in Spanish where the target keyword/concept from '${previousTopic}' is in English (Example: 'Anoche *I went* al cine')",
    "3 phrases in English where the target keyword/concept from '${previousTopic}' is in Spanish (Example: 'Last night I *fui* to the theater')"
  ],
  "bridgePhrase": "A single representative sentence in English using '${topicName}' to ask 'What do you notice here?'"
}

[[COOLDOWN_ASSETS]]
{
  "idioms": ["Idiom 1 related to topic", "Idiom 2 related to topic"],
  "tinyAction": "One micro-task for the next 24 hours.",
  "tongueTwister": "A 30-second phonetic drill or tongue twister for a difficult sound in the lesson."
}

STRICT RULES FOR ALL HTML SLIDES:
- Use only inline styles.
- Professional, premium typography (font-family: inherit).
- Background colors: rgba(255,255,255,0.03) for cards.
- Text colors: #e2e8f0 primary, #94a3b8 secondary.
- Accent: #f59e0b (amber) for highlights/titles.
- Border: 1px solid rgba(255,255,255,0.08).
- Border radius: 10px for cards, 6px for small elements.
- No external images or icons.

Output ONLY the marked blocks. No introduction or follow-up text.
`

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    )

    if (!geminiRes.ok) {
      const err = await geminiRes.json()
      return res.status(502).json({ error: 'Gemini error', detail: err })
    }

    const geminiData = await geminiRes.json()
    const rawText: string = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

    const slides = parseSlides(rawText)
    const warmup = parseJsonSection(rawText, 'WARMUP_ASSETS')
    const cooldown = parseJsonSection(rawText, 'COOLDOWN_ASSETS')

    return res.status(200).json({ slides, warmup, cooldown, rawText })
  } catch (err: any) {
    return res.status(500).json({ error: 'Error generando slides', detail: err.message })
  }
}

function parseSlides(text: string): Slide[] {
  const slides: Slide[] = []
  const sections = text.split(/\[\[SLIDE_\d+:\s*(.*?)\]\]/)

  for (let i = 1; i < sections.length; i += 2) {
    const title = sections[i].trim()
    const content = sections[i + 1]?.split('[[')[0]?.trim() || ''
    slides.push({ title, content })
  }
  return slides
}

function parseJsonSection(text: string, marker: string): any {
  const parts = text.split(`[[${marker}]]`)
  if (parts.length < 2) return null
  let rawJson = parts[1].split('[[')[0].trim()
  // Strip markdown code fences that Gemini sometimes wraps JSON in
  rawJson = rawJson.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '')
  try {
    return JSON.parse(rawJson)
  } catch (e) {
    console.error(`Error parsing ${marker}`, e)
    return null
  }
}
