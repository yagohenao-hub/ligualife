import { getAllFlashcardPacks, FlashcardPack } from './flashcards'

export interface BridgeVocabularyItem {
  word: string
  translationEs: string
  contextUsage?: string
  source: 'flashcard' | 'scene' | 'curriculum'
}

/**
 * Mapeo temático o contextual para enlazar temas del currículum con
 * paquetes de flashcards y escenas interactivas.
 * Permite alimentar las lecturas cortas (Short Readings) con el vocabulario clave.
 */
const TOPIC_KEYWORD_MAP: Record<number, string[]> = {
  1: ['greeting', 'introduce', 'draw', 'routine'],
  2: ['routine', 'daily', 'draw out', 'habit'],
  3: ['travel', 'direction', 'sketch', 'place'],
  4: ['past', 'yesterday', 'withdrew', 'happened'],
  5: ['experience', 'already', 'drawn into', 'never'],
  6: ['plan', 'future', 'draw up', 'predict'],
  7: ['obligation', 'must', 'have to', 'draw the line'],
  8: ['hypothetical', 'if', 'imagine', 'could'],
}

/**
 * Obtiene vocabulario objetivo relevante para un tema específico,
 * extrayéndolo de las flashcards y escenas interactivas existentes.
 */
export function getTopicBridgeVocabulary(topicOrder?: number, topicName?: string): BridgeVocabularyItem[] {
  const vocab: BridgeVocabularyItem[] = []
  const seen = new Set<string>()

  // 1. Extraer de paquetes de flashcards
  try {
    const packs: FlashcardPack[] = getAllFlashcardPacks()
    for (const pack of packs) {
      for (const card of pack.cards) {
        if (!seen.has(card.word.toLowerCase())) {
          seen.add(card.word.toLowerCase())
          vocab.push({
            word: card.word,
            translationEs: card.translationEs,
            contextUsage: card.definitionEn,
            source: 'flashcard'
          })
        }
      }
    }
  } catch (err) {
    console.warn('[vocabulary-bridge] Error cargando flashcards:', err)
  }

  // 2. Filtrado pedagógico si hay orden de tema
  if (topicOrder && TOPIC_KEYWORD_MAP[topicOrder]) {
    const keywords = TOPIC_KEYWORD_MAP[topicOrder]
    const prioritized = vocab.filter(v => 
      keywords.some(k => v.word.toLowerCase().includes(k) || v.translationEs.toLowerCase().includes(k))
    )
    if (prioritized.length > 0) {
      return prioritized.slice(0, 5)
    }
  }

  // Si no hay mapeo específico o devuelve pocas, retornar una muestra de alta frecuencia
  return vocab.slice(0, 4)
}
