export interface FlashcardItem {
  id: string
  word: string
  ipa?: string
  definitionEn: string
  translationEs: string
  definitionTranslationEs: string
  imageSrc: string
  hotspotCoordinates?: { x: number; y: number }
}

export interface FlashcardPack {
  id: string
  title: string
  subtitle: string
  category: string
  level: string
  sceneImageSrc?: string
  cards: FlashcardItem[]
  createdAt?: string
}

export const INITIAL_DRAW_PACK: FlashcardPack = {
  id: 'draw-family-pack',
  title: 'Familia Conceptual de "DRAW"',
  subtitle: 'Explora los múltiples significados, verbos derivados y colocaciones del verbo raíz "Draw" más allá de la traducción 1 a 1.',
  category: 'Polisemia & Morfología',
  level: 'B1-B2',
  sceneImageSrc: '/flashcards/draw_family_scene.png',
  createdAt: '2026-08-28',
  cards: [
    {
      id: 'draw-1',
      word: 'Draw',
      ipa: '/drɔː/',
      definitionEn: 'To make a picture with a pencil or to pull something gently towards you.',
      translationEs: 'Dibujar / Tirar de algo',
      definitionTranslationEs: 'Hacer una imagen con un lápiz o jalar algo suavemente hacia ti.',
      imageSrc: '/flashcards/draw.png',
      hotspotCoordinates: { x: 62, y: 15 }
    },
    {
      id: 'draw-2',
      word: 'Drawer',
      ipa: '/drɔːr/',
      definitionEn: 'A wooden box inside a desk or table that you pull out to store things.',
      translationEs: 'Cajón / Gaveta',
      definitionTranslationEs: 'Una caja de madera dentro de un escritorio o mesa que jalas para guardar cosas.',
      imageSrc: '/flashcards/drawer.png',
      hotspotCoordinates: { x: 31, y: 74 }
    },
    {
      id: 'draw-3',
      word: 'Withdraw',
      ipa: '/wɪðˈdrɔː/',
      definitionEn: 'To take money out of a bank account or to leave a place or competition.',
      translationEs: 'Retirar dinero / Salirse de un lugar',
      definitionTranslationEs: 'Sacar dinero de una cuenta bancaria o retirarse de un lugar o competencia.',
      imageSrc: '/flashcards/withdraw.png',
      hotspotCoordinates: { x: 49, y: 38 }
    },
    {
      id: 'draw-4',
      word: 'Drawback',
      ipa: '/ˈdrɔː.bæk/',
      definitionEn: 'A problem, bad feature, or disadvantage of a situation.',
      translationEs: 'Desventaja / Inconveniente',
      definitionTranslationEs: 'Un problema, característica mala o inconveniente de una situación.',
      imageSrc: '/flashcards/drawback.png',
      hotspotCoordinates: { x: 63, y: 64 }
    },
    {
      id: 'draw-5',
      word: 'Draw Attention',
      ipa: '/drɔː əˈten.ʃən/',
      definitionEn: 'To make people notice, look at, or listen to something.',
      translationEs: 'Llamar la atención / Atraer miradas',
      definitionTranslationEs: 'Hacer que las personas se den cuenta, miren o escuchen algo.',
      imageSrc: '/flashcards/draw_attention.png',
      hotspotCoordinates: { x: 88, y: 18 }
    },
    {
      id: 'draw-6',
      word: 'Draw a Conclusion',
      ipa: '/drɔː ə kənˈkluː.ʒən/',
      definitionEn: 'To make a final decision or opinion after studying facts.',
      translationEs: 'Sacar una conclusión',
      definitionTranslationEs: 'Llegar a una decisión u opinión final después de estudiar los hechos.',
      imageSrc: '/flashcards/draw_conclusion.png',
      hotspotCoordinates: { x: 65, y: 35 }
    },
    {
      id: 'draw-7',
      word: 'Redraft',
      ipa: '/ˌriːˈdrɑːft/',
      definitionEn: 'To write or draw a plan again to fix errors and make it better.',
      translationEs: 'Reescribir / Rehacer un borrador',
      definitionTranslationEs: 'Escribir o dibujar un plan otra vez para corregir errores y mejorarlo.',
      imageSrc: '/flashcards/redraft.png',
      hotspotCoordinates: { x: 88, y: 80 }
    },
    {
      id: 'draw-8',
      word: 'Draw a Tie',
      ipa: '/drɔː ə taɪ/',
      definitionEn: 'To finish a game or competition with equal points so no one wins.',
      translationEs: 'Empatar el partido / Quedar en empate',
      definitionTranslationEs: 'Terminar un juego o competencia con puntos iguales para que nadie gane.',
      imageSrc: '/flashcards/draw_tie.png',
      hotspotCoordinates: { x: 25, y: 18 }
    },
    {
      id: 'draw-9',
      word: 'Draw a Bath',
      ipa: '/drɔː ə bɑːθ/',
      definitionEn: 'To fill a bathtub with warm water for taking a bath.',
      translationEs: 'Llenar la tina / Preparar un baño de tina',
      definitionTranslationEs: 'Llenar una tina con agua tibia para tomar un baño.',
      imageSrc: '/flashcards/draw_bath.png',
      hotspotCoordinates: { x: 12, y: 45 }
    },
    {
      id: 'draw-10',
      word: 'Draw Blood',
      ipa: '/drɔː blʌd/',
      definitionEn: 'To make blood come out of the body with a needle or small cut.',
      translationEs: 'Sacar sangre / Extraer muestra de sangre',
      definitionTranslationEs: 'Hacer que salga sangre del cuerpo con una aguja o pequeño corte.',
      imageSrc: '/flashcards/draw_blood.png',
      hotspotCoordinates: { x: 42, y: 82 }
    },
    {
      id: 'draw-11',
      word: 'Draw a Blank',
      ipa: '/drɔː ə blæŋk/',
      definitionEn: 'To fail to remember an answer, name, or memory when asked.',
      translationEs: 'Quedarse en blanco / Olvidar la respuesta',
      definitionTranslationEs: 'No poder recordar una respuesta, nombre o recuerdo cuando te preguntan.',
      imageSrc: '/flashcards/draw_blank.png',
      hotspotCoordinates: { x: 80, y: 48 }
    },
    {
      id: 'draw-12',
      word: 'Overdraw',
      ipa: '/ˌoʊ.vɚˈdrɔː/',
      definitionEn: 'To spend more money than you actually have in your bank account.',
      translationEs: 'Sobregirar la cuenta / Girar en descubierto',
      definitionTranslationEs: 'Gastar más dinero del que realmente tienes en tu cuenta bancaria.',
      imageSrc: '/flashcards/overdraw.png',
      hotspotCoordinates: { x: 38, y: 15 }
    }
  ]
}

export const BUILTIN_FLASHCARD_PACKS: FlashcardPack[] = [INITIAL_DRAW_PACK]

const STORAGE_KEY = 'lingualife_flashcard_packs_v1'

export function getAllFlashcardPacks(): FlashcardPack[] {
  if (typeof window === 'undefined') return BUILTIN_FLASHCARD_PACKS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return BUILTIN_FLASHCARD_PACKS
    const customPacks: FlashcardPack[] = JSON.parse(raw)
    
    const map = new Map<string, FlashcardPack>()
    BUILTIN_FLASHCARD_PACKS.forEach(p => map.set(p.id, p))
    customPacks.forEach(p => map.set(p.id, p))
    return Array.from(map.values())
  } catch {
    return BUILTIN_FLASHCARD_PACKS
  }
}

export async function fetchFlashcardPacksFromServer(): Promise<FlashcardPack[]> {
  const local = getAllFlashcardPacks()
  if (typeof window === 'undefined') return local

  try {
    const res = await fetch('/api/admin/flashcards')
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data.packs)) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data.packs))
        } catch {}
        return data.packs
      }
    }
  } catch (err) {
    console.warn('[Flashcards] Sync error:', err)
  }
  return local
}

export function saveFlashcardPack(pack: FlashcardPack): FlashcardPack {
  const packs = getAllFlashcardPacks()
  const index = packs.findIndex(p => p.id === pack.id)
  
  if (index >= 0) {
    packs[index] = pack
  } else {
    packs.push(pack)
  }

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(packs))
      fetch('/api/admin/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pack)
      }).catch(() => {})
    } catch {}
  }
  return pack
}

export async function saveFlashcardPackAsync(pack: FlashcardPack): Promise<FlashcardPack> {
  saveFlashcardPack(pack)
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch('/api/admin/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pack)
      })
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data.packs)) {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data.packs))
          } catch {}
        }
      }
    } catch (e) {
      console.warn('[saveFlashcardPackAsync warning]:', e)
    }
  }
  return pack
}

export function deleteFlashcardPack(packId: string): void {
  const packs = getAllFlashcardPacks().filter(p => p.id !== packId)
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(packs))
      fetch(`/api/admin/flashcards?id=${encodeURIComponent(packId)}`, {
        method: 'DELETE'
      }).catch(() => {})
    } catch {}
  }
}
