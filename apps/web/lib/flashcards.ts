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

export const FALSE_FRIENDS_PACK: FlashcardPack = {
  id: 'false-friends-pack',
  title: 'Falsos Cognados & Trampas Latinas',
  subtitle: 'Palabras que parecen sonar como algo conocido en español pero tienen un significado completamente distinto. Evita errores graves en conversaciones reales.',
  category: 'Vocabulario Crítico & Trampas',
  level: 'A2-B2',
  createdAt: '2026-09-23',
  cards: [
    {
      id: 'ff-1',
      word: 'Actually',
      ipa: '/ˈæk.tʃu.ə.li/',
      definitionEn: 'In fact or in reality; used to correct a mistake or provide an accurate fact.',
      translationEs: 'En realidad / De hecho (¡NO actualmente!)',
      definitionTranslationEs: 'En verdad o realidad; se usa para corregir un dato o aclarar lo que realmente es.',
      imageSrc: '/flashcards/actually.png'
    },
    {
      id: 'ff-2',
      word: 'Eventually',
      ipa: '/ɪˈven.tʃu.ə.li/',
      definitionEn: 'In the end, especially after a long time, delay, or series of difficulties.',
      translationEs: 'A la larga / Al final / Con el tiempo (¡NO eventualmente!)',
      definitionTranslationEs: 'Al final de cuentas, especialmente después de mucho tiempo, espera o esfuerzo.',
      imageSrc: '/flashcards/eventually.png'
    },
    {
      id: 'ff-3',
      word: 'Realize',
      ipa: '/ˈriː.ə.laɪz/',
      definitionEn: 'To suddenly become aware of, understand, or notice a fact or situation.',
      translationEs: 'Darse cuenta / Caer en cuenta (¡NO realizar una tarea!)',
      definitionTranslationEs: 'Entender o hacerse consciente de pronto de un hecho o situación.',
      imageSrc: '/flashcards/realize.png'
    },
    {
      id: 'ff-4',
      word: 'Notice',
      ipa: '/ˈnoʊ.tɪs/',
      definitionEn: 'To perceive, see, or become aware of something using your senses.',
      translationEs: 'Notar / Fijarse / Darse cuenta (¡Avisar es "warn" o "let know"!)',
      definitionTranslationEs: 'Percibir o percatarse de algo con la vista u otro sentido.',
      imageSrc: '/flashcards/notice.png'
    },
    {
      id: 'ff-5',
      word: 'Attend',
      ipa: '/əˈtend/',
      definitionEn: 'To go to or be present at an event, class, meeting, or conference.',
      translationEs: 'Asistir / Ir a un evento (¡Atender a un cliente es "serve" o "help"!)',
      definitionTranslationEs: 'Hacerse presente físicamente o en línea en una reunión o clase.',
      imageSrc: '/flashcards/attend.png'
    },
    {
      id: 'ff-6',
      word: 'Support',
      ipa: '/səˈpɔːrt/',
      definitionEn: 'To help, encourage, or give financial, emotional, or technical backing.',
      translationEs: 'Apoyar / Respaldar (¡Aguantar o tolerar a alguien es "stand" o "tolerate"!)',
      definitionTranslationEs: 'Brindar respaldo moral, económico o práctico a una persona o causa.',
      imageSrc: '/flashcards/support.png'
    },
    {
      id: 'ff-7',
      word: 'Compromise',
      ipa: '/ˈkɑːm.prə.maɪz/',
      definitionEn: 'An agreement reached where both sides give up some demands to meet in the middle.',
      translationEs: 'Llegar a un acuerdo mutuo / Ceder (¡Un compromiso u obligación es "commitment"!)',
      definitionTranslationEs: 'Llegar a un punto medio donde ambas partes ceden para solucionar una diferencia.',
      imageSrc: '/flashcards/compromise.png'
    },
    {
      id: 'ff-8',
      word: 'Sensible',
      ipa: '/ˈsen.sə.bəl/',
      definitionEn: 'Having or showing good judgment, practical wisdom, and common sense.',
      translationEs: 'Sensato / Prudente / Con juicio (¡Sensible de sentimientos es "sensitive"!)',
      definitionTranslationEs: 'Tener y actuar con sentido común, buen juicio y prudencia.',
      imageSrc: '/flashcards/sensible.png'
    }
  ]
}

export const LOGICAL_CONNECTORS_PACK: FlashcardPack = {
  id: 'logical-connectors-pack',
  title: 'Conectores Lógicos & Conversational Grease',
  subtitle: 'Conectores y frases de transición indispensables para enlazar ideas con elegancia, sonar fluido y no parecer un robot en llamadas.',
  category: 'Fluidez & Transiciones',
  level: 'B1-C1',
  createdAt: '2026-09-23',
  cards: [
    {
      id: 'lc-1',
      word: 'To be fair...',
      ipa: '/tuː bi feər/',
      definitionEn: 'Used to introduce an honest, balanced point or acknowledge merit to the other side.',
      translationEs: 'Siendo justos... / Para ser honestos...',
      definitionTranslationEs: 'Se usa para agregar un punto razonable o concederle la razón a la otra parte.',
      imageSrc: '/flashcards/to_be_fair.png'
    },
    {
      id: 'lc-2',
      word: 'At the end of the day...',
      ipa: '/æt ði end əv ðə deɪ/',
      definitionEn: 'Used to summarize the most fundamental, decisive truth after weighing all factors.',
      translationEs: 'A fin de cuentas... / En resumidas cuentas...',
      definitionTranslationEs: 'Destaca lo más determinante o elemental cuando se analiza todo en conjunto.',
      imageSrc: '/flashcards/at_the_end_of_the_day.png'
    },
    {
      id: 'lc-3',
      word: 'It turns out that...',
      ipa: '/ɪt tɜːrnz aʊt ðæt/',
      definitionEn: 'Used when sharing a surprising discovery, fact, or unexpected outcome.',
      translationEs: 'Resulta que... / Al final resultó que...',
      definitionTranslationEs: 'Usado para narrar un desenlace imprevisto o una verdad que salió a la luz.',
      imageSrc: '/flashcards/it_turns_out.png'
    },
    {
      id: 'lc-4',
      word: 'Speaking of which...',
      ipa: '/ˈspiː.kɪŋ əv wɪtʃ/',
      definitionEn: 'Used to smoothly transition to a related topic that was just brought up in conversation.',
      translationEs: 'Hablando de eso... / A propósito de lo que dijiste...',
      definitionTranslationEs: 'Enlaza con naturalidad hacia un asunto relacionado que se acaba de nombrar.',
      imageSrc: '/flashcards/speaking_of_which.png'
    },
    {
      id: 'lc-5',
      word: 'Off the top of my head...',
      ipa: '/ɔːf ðə tɑːp əv maɪ hed/',
      definitionEn: 'Said when guessing or recalling from immediate memory without verifying precise figures.',
      translationEs: 'Así de memoria... / Sin mirar los datos exactos...',
      definitionTranslationEs: 'Dicho al hacer una estimación rápida sin consultar registros ni notas.',
      imageSrc: '/flashcards/off_the_top_of_my_head.png'
    },
    {
      id: 'lc-6',
      word: 'As a matter of fact...',
      ipa: '/æz ə ˈmæt̬.ɚ əv fækt/',
      definitionEn: 'Used to reinforce a statement with emphasizing truth or specific factual detail.',
      translationEs: 'De hecho... / Es más...',
      definitionTranslationEs: 'Aporta convicción y precisión sobre lo que se está discutiendo.',
      imageSrc: '/flashcards/as_a_matter_of_fact.png'
    },
    {
      id: 'lc-7',
      word: 'In the meantime...',
      ipa: '/ɪn ðə ˈmiːn.taɪm/',
      definitionEn: 'During the interval between two events or while another process finishes.',
      translationEs: 'Mientras tanto... / Entretanto...',
      definitionTranslationEs: 'Durante el lapso previo a que algo ocurra o mientras se completa otra tarea.',
      imageSrc: '/flashcards/in_the_meantime.png'
    },
    {
      id: 'lc-8',
      word: 'On the other hand...',
      ipa: '/ɑːn ði ˈʌð.ɚ hænd/',
      definitionEn: 'Used to present a contrasting, opposite, or alternative point of view.',
      translationEs: 'Por otro lado... / Por otra parte...',
      definitionTranslationEs: 'Presenta un contrapunto o punto de vista que contrasta con el anterior.',
      imageSrc: '/flashcards/on_the_other_hand.png'
    }
  ]
}

export const GYM_FITNESS_PACK: FlashcardPack = {
  id: 'gym-fitness-pack',
  title: 'Vocabulario de Gimnasio & Fitness',
  subtitle: 'Vocabulario práctico, verbos de acción y expresiones de entrenamiento para desenvolverte con total confianza en cualquier gimnasio del mundo.',
  category: 'Vida Diaria & Situacional',
  level: 'A2-B2',
  sceneImageSrc: '/interactive_gym_scene.png',
  createdAt: '2026-09-23',
  cards: [
    {
      id: 'gym-1',
      word: 'Warm up',
      ipa: '/wɔːrm ʌp/',
      definitionEn: 'To prepare the body for physical activity with light cardio and dynamic movement.',
      translationEs: 'Calentar antes de entrenar',
      definitionTranslationEs: 'Preparar el cuerpo y articulaciones con movimientos suaves antes del ejercicio intenso.',
      imageSrc: '/flashcards/gym_warmup.png',
      hotspotCoordinates: { x: 22, y: 72 }
    },
    {
      id: 'gym-2',
      word: 'Dumbbell',
      ipa: '/ˈdʌm.bel/',
      definitionEn: 'A short bar with a weight at each end, used in pairs for weight training.',
      translationEs: 'Mancuerna',
      definitionTranslationEs: 'Barra corta con peso en los extremos para entrenamiento muscular individual.',
      imageSrc: '/flashcards/gym_dumbbell.png',
      hotspotCoordinates: { x: 42, y: 68 }
    },
    {
      id: 'gym-3',
      word: 'Barbell',
      ipa: '/ˈbɑːr.bel/',
      definitionEn: 'A long metal bar to which heavy iron weight plates are attached for bench press or squats.',
      translationEs: 'Barra olímpica de pesas',
      definitionTranslationEs: 'Barra larga de metal donde se colocan discos de peso para sentadillas o press banca.',
      imageSrc: '/flashcards/gym_barbell.png',
      hotspotCoordinates: { x: 60, y: 62 }
    },
    {
      id: 'gym-4',
      word: 'Treadmill',
      ipa: '/ˈtred.mɪl/',
      definitionEn: 'An exercise machine with a continuous moving belt for running or walking in place.',
      translationEs: 'Caminadora / Cinta eléctrica',
      definitionTranslationEs: 'Máquina de cardio con banda continua para correr o caminar sin desplazarse.',
      imageSrc: '/flashcards/gym_treadmill.png',
      hotspotCoordinates: { x: 16, y: 48 }
    },
    {
      id: 'gym-5',
      word: 'Can you spot me?',
      ipa: '/kæn juː spɑːt miː/',
      definitionEn: 'A request asking someone to watch and assist you during a heavy lift for safety.',
      translationEs: '¿Me puedes ayudar / cuidar en esta serie?',
      definitionTranslationEs: 'Pedirle a otra persona que esté atenta para ayudarte si no puedes levantar el peso.',
      imageSrc: '/flashcards/gym_spot_me.png',
      hotspotCoordinates: { x: 74, y: 52 }
    },
    {
      id: 'gym-6',
      word: 'Reps and Sets',
      ipa: '/reps ænd sets/',
      definitionEn: 'Reps are the repetitions of an exercise; sets are the cycles of those repetitions.',
      translationEs: 'Repeticiones y Series',
      definitionTranslationEs: 'Repeticiones de un mismo movimiento agrupadas en ciclos o bloques de trabajo.',
      imageSrc: '/flashcards/gym_reps_sets.png',
      hotspotCoordinates: { x: 50, y: 38 }
    },
    {
      id: 'gym-7',
      word: 'Can I work in with you?',
      ipa: '/kæn aɪ wɜːrk ɪn/',
      definitionEn: 'Polite phrase to ask someone if you can share a machine and take turns between sets.',
      translationEs: '¿Podemos alternar turnos en la máquina?',
      definitionTranslationEs: 'Pregunta educada para compartir el equipo usando los descansos de la otra persona.',
      imageSrc: '/flashcards/gym_work_in.png',
      hotspotCoordinates: { x: 82, y: 64 }
    },
    {
      id: 'gym-8',
      word: 'Muscle Soreness',
      ipa: '/ˈmʌs.əl ˈsɔːr.nəs/',
      definitionEn: 'The dull, aching pain felt in muscles 24 to 48 hours after strenuous unaccustomed exercise.',
      translationEs: 'Dolor muscular post-entreno / Estar adolorido',
      definitionTranslationEs: 'Sensación de fatiga y dolor en las fibras musculares tras un entrenamiento exigente.',
      imageSrc: '/flashcards/gym_soreness.png',
      hotspotCoordinates: { x: 34, y: 32 }
    }
  ]
}

export const BUILTIN_FLASHCARD_PACKS: FlashcardPack[] = [
  FALSE_FRIENDS_PACK,
  LOGICAL_CONNECTORS_PACK,
  GYM_FITNESS_PACK,
  INITIAL_DRAW_PACK
]

const STORAGE_KEY = 'lingualife_flashcard_packs_v2'

export function getAllFlashcardPacks(): FlashcardPack[] {
  if (typeof window === 'undefined') return BUILTIN_FLASHCARD_PACKS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return BUILTIN_FLASHCARD_PACKS
    const customPacks: FlashcardPack[] = JSON.parse(raw)
    
    const map = new Map<string, FlashcardPack>()
    customPacks.forEach(p => map.set(p.id, p))
    // BUILTIN packs take priority to guarantee latest images and card data
    BUILTIN_FLASHCARD_PACKS.forEach(p => map.set(p.id, p))
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
