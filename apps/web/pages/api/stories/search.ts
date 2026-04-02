import type { NextApiRequest, NextApiResponse } from 'next'
import { STORIES_LIBRARY, IndexedStory } from '../../../lib/stories-library'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { query, get_text, word_max, lang } = req.query
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  // 1. Text Proxy
  if (get_text) {
    try {
      const resp = await fetch(decodeURIComponent(get_text as string))
      return res.status(200).send(await resp.text())
    } catch (e) {
      return res.status(500).send("Error fetching text")
    }
  }

  // 2. Base Library
  let results: IndexedStory[] = [...STORIES_LIBRARY]

  // 3. Strict Filtering
  const currentMax = word_max ? parseInt(word_max as string) : 5000
  
  // LOG for debugging
  console.log(`Filtering for max: ${currentMax}, input word_max: ${word_max}`)

  results = results.filter(s => {
      const passesWords = s.wordCount <= currentMax
      const passesLang = !lang || lang === 'all' || s.language === lang
      const passesSearch = !query || s.title.toLowerCase().includes(query.toString().toLowerCase()) || s.author.toLowerCase().includes(query.toString().toLowerCase())
      return passesWords && passesLang && passesSearch
  })

  // Sort by wordCount (lowest first for easy selection)
  results.sort((a, b) => a.wordCount - b.wordCount)

  console.log(`API returning ${results.length} filtered results`)
  return res.status(200).json({ results })
}
