import { fetchAirtableRecord, createAirtableRecord, findAirtableRecords } from './airtable'

// Heuristics for "educational content" - ONLY used in Strict Mode
const EDUCATIONAL_KEYWORDS = [
  'lesson', 'grammar', 'vocabulary', 'learn english', 'teacher', 'tutorial', 
  'study with me', 'how to speak', 'pronunciation guide', 'english class',
  'explaining', 'tips for', 'tricks for', 'idiom', 'phrasal verb', 'esl',
  'teaching', 'course', 'academy', 'education', 'practice english', 'learning english'
]

export interface ScoutVideo {
  id: string
  title: string
  url: string
  thumbnail: string
  duration: number
  isNative: boolean
}

/**
 * Searches YouTube for Shorts and filters them based on criteria.
 */
export async function discoverVideos(query: string = '', organic = false, attempt = 1): Promise<{ videos: ScoutVideo[], debug: string[] }> {
  const isQueryRandom = !query.trim()
  const baseQuery = query.trim() || getRandomNativeTopic()
  
  // Broader search to ensure results
  const searchTerms = isQueryRandom ? baseQuery : `${baseQuery} clips shorts`
  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchTerms)}&sp=EgIQAQ%3D%3D` 
  
  const debug: string[] = [`Searching "${searchTerms}" (Att ${attempt})`]

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 6000) // 6s per burst

    const res = await fetch(searchUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
      signal: controller.signal
    })
    const html = await res.text()
    clearTimeout(timeoutId)
    
    const videoDataMap = new Map<string, { duration: number, title: string }>()
    const idPattern = /"videoId":"([a-zA-Z0-9_-]{11})"/g
    let match;
    
    while ((match = idPattern.exec(html)) !== null) {
      if (videoDataMap.size >= 150) break;
      const id = match[1]
      if (videoDataMap.has(id)) continue;

      const region = html.substring(match.index, match.index + 1500)
      let duration = 0
      const lengthSecondsMatch = region.match(/"lengthSeconds":"(\d+)"/)
      const simpleTextMatch = region.match(/"simpleText":"(\d+):(\d+)"/)
      const labelMatch = region.match(/"label":"[^"]*?(\d+)\s*(second|minute|segundo|minuto)s?/)

      if (lengthSecondsMatch) duration = parseInt(lengthSecondsMatch[1])
      else if (simpleTextMatch) duration = parseInt(simpleTextMatch[1]) * 60 + parseInt(simpleTextMatch[2])
      else if (labelMatch) {
         duration = parseInt(labelMatch[1])
         if (labelMatch[2].startsWith('min')) duration *= 60
      }

      const tMatch = region.match(/"title":\{"runs":\[\{"text":"([^"]+)"\}\]/) || region.match(/"title":\{"simpleText":"([^"]+)"\}/)
      let title = tMatch ? tMatch[1] : 'Untitled'

      videoDataMap.set(id, { duration, title })
    }

    const uniqueIds = Array.from(videoDataMap.keys())
    const results: ScoutVideo[] = []
    
    // Efficiently check Airtable for existing videos (all at once)
    const existingRecords = await findAirtableRecords('Video Bank', `OR(${uniqueIds.map(id => `SEARCH("${id}", {YouTube URL})`).join(',')})`)
    const existingIds = new Set(existingRecords.map(r => {
      const url = r.fields['YouTube URL'] || ''
      return url.split('v=')[1]?.split('&')[0] || url.split('be/')[1] || ''
    }))

    for (const id of uniqueIds) {
      if (results.length >= 40) break; // Increased batch size
      if (existingIds.has(id)) continue; // Skip if already in bank

      const data = videoDataMap.get(id)!
      const isEnglish = !/[^\x00-\x7F]/.test(data.title)
      const isEduc = !organic && EDUCATIONAL_KEYWORDS.some(k => data.title.toLowerCase().includes(k))

      if (data.duration > 0 && data.duration <= 70 && !isEduc && isEnglish) {
        results.push({
          id, title: data.title,
          url: `https://youtu.be/${id}`,
          thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
          duration: data.duration,
          isNative: true
        })
      }
    }

    // Try again if empty
    if (results.length === 0 && attempt < 5 && isQueryRandom) {
      debug.push(`Retry...`)
      const next = await discoverVideos('', organic, attempt + 1)
      return { videos: next.videos, debug: [...debug, ...next.debug] }
    }

    return { videos: results, debug: [`${results.length} found`, ...debug] }
  } catch (error: any) {
    debug.push(`Error: ${error.message}`)
    return (attempt < 5 && isQueryRandom) ? discoverVideos('', organic, attempt + 1) : { videos: [], debug }
  }
}

function getRandomNativeTopic() {
  const topics = [
    'wait till the end hilarious shorts',
    'POV nyc life rapid interview',
    'funny tiktok story shorts',
    'viral storytime native speakers',
    'daily vlog NYC shorts no music',
    'surprising street food nyc shorts',
    'awkward social situation native clip',
    'NYC cafe conversation snippets',
    'fast english native speech clips',
    'hilarious roommate story shorts',
    'unexpected travel moments nyc shorts',
    'funny branding fails marketing shorts',
    'nyc fashion street interview native',
    'working in nyc office vlog shorts',
    'crazy nyc subway moments viral shorts'
  ]
  return topics[Math.floor(Math.random() * topics.length)]
}
