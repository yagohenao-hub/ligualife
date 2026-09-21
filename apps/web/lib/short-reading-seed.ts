export interface ShortReadingItem {
  id: string
  topicOrder: number
  topicName: string
  title: string
  readingText: string
  wordCount: number
  focusGrammar: string
  highlightedVocab: Array<{
    word: string
    meaningEs: string
  }>
  quickQuestion: {
    question: string
    options: string[]
    correctIndex: number
    explanationEs: string
  }
}

export const SEEDED_SHORT_READINGS: Record<number, ShortReadingItem> = {
  1: {
    id: 'sr-topic-1',
    topicOrder: 1,
    topicName: 'Present Simple & Daily Routines',
    title: 'The Morning Blueprint',
    readingText: 'Every morning at dawn, Sofia wakes up before her alarm rings. She prepares black coffee and sketches her daily schedule in a notebook. While sipping coffee, she draws inspiration from the silent street outside. She never skips breakfast because energy matters. At eight, she walks to her design studio. "A steady routine keeps my mind clear," Sofia always says with a smile.',
    wordCount: 65,
    focusGrammar: 'Present Simple (Third Person -s & Frequency Adverbs)',
    highlightedVocab: [
      { word: 'sketches', meaningEs: 'dibuja / hace un bosquejo' },
      { word: 'draws inspiration', meaningEs: 'se inspira / toma inspiración' },
      { word: 'steady', meaningEs: 'constante / firme' }
    ],
    quickQuestion: {
      question: '¿Por qué Sofía nunca se salta el desayuno?',
      options: [
        'Porque no tiene tiempo de almorzar.',
        'Porque considera que la energía es importante.',
        'Porque su estudio queda muy lejos.'
      ],
      correctIndex: 1,
      explanationEs: 'El texto dice textualmente: "She never skips breakfast because energy matters."'
    }
  },
  2: {
    id: 'sr-topic-2',
    topicOrder: 2,
    topicName: 'Past Simple: Regular & Irregular',
    title: 'A Detour in Lisbon',
    readingText: 'Last summer, Mateo traveled to Lisbon with only a small backpack. Yesterday, he found an old journal from that trip. He smiled when he read about the afternoon he got lost in Alfama. He asked an elderly baker for directions, but the man smiled and withdrew a handwritten map from his pocket. That small gesture saved his entire afternoon and turned into an unforgettable memory.',
    wordCount: 67,
    focusGrammar: 'Past Simple (traveled, found, withdrew, saved)',
    highlightedVocab: [
      { word: 'withdrew', meaningEs: 'sacó / extrajo (pasado de withdraw)' },
      { word: 'gesture', meaningEs: 'gesto' },
      { word: 'unforgettable', meaningEs: 'inolvidable' }
    ],
    quickQuestion: {
      question: '¿Qué hizo el panadero cuando Mateo le pidió direcciones?',
      options: [
        'Sacó un mapa hecho a mano de su bolsillo.',
        'Le dijo que tomara un tranvía.',
        'No le prestó atención.'
      ],
      correctIndex: 0,
      explanationEs: 'El texto menciona: "...the man smiled and withdrew a handwritten map from his pocket."'
    }
  },
  3: {
    id: 'sr-topic-3',
    topicOrder: 3,
    topicName: 'Present Continuous for Current Actions',
    title: 'Late Night at the Airport',
    readingText: 'Right now, Lucas is sitting at terminal four. Flight attendants are announcing final boarding calls while travelers are rushing past. Outside, heavy rain is falling on the tarmac. Lucas is currently drafting a message to his partner: "My plane is leaving soon. I am counting the hours until I see you." Every moment feels electric as the adventure begins.',
    wordCount: 61,
    focusGrammar: 'Present Continuous (is sitting, are announcing, is falling)',
    highlightedVocab: [
      { word: 'drafting', meaningEs: 'redactando / escribiendo un borrador' },
      { word: 'tarmac', meaningEs: 'pista de despegue/aterrizaje' },
      { word: 'rushing', meaningEs: 'apresurándose' }
    ],
    quickQuestion: {
      question: '¿Qué está haciendo Lucas en este momento en la terminal?',
      options: [
        'Comprando un café.',
        'Redactando un mensaje para su pareja.',
        'Buscando su pasaporte extraviado.'
      ],
      correctIndex: 1,
      explanationEs: 'El texto indica: "Lucas is currently drafting a message to his partner..."'
    }
  },
  4: {
    id: 'sr-topic-4',
    topicOrder: 4,
    topicName: 'Present Perfect vs Past Simple',
    title: 'The Silent Milestone',
    readingText: 'Elena has lived in three different countries, but she has never felt as grounded as she does today. In 2021, she moved to Montreal without speaking French. She struggled at first, but she persisted. Over the past five years, she has launched her own agency and has mentored dozens of students. "I have made mistakes," she admitted, "but each one taught me resilience."',
    wordCount: 66,
    focusGrammar: 'Present Perfect (has lived, has launched) vs Past Simple (moved, struggled)',
    highlightedVocab: [
      { word: 'grounded', meaningEs: 'centrada / con los pies en la tierra' },
      { word: 'persisted', meaningEs: 'persistió / perseveró' },
      { word: 'resilience', meaningEs: 'resiliencia / capacidad de superación' }
    ],
    quickQuestion: {
      question: '¿Cuál es la diferencia entre su llegada a Montreal y sus logros recientes?',
      options: [
        'Montreal ocurrió en un año puntual del pasado (2021), mientras que su agencia y mentorías son experiencias acumuladas hasta el presente.',
        'No hay diferencia, todo ocurrió en el mismo año.',
        'Elena aún no ha logrado fundar su agencia.'
      ],
      correctIndex: 0,
      explanationEs: 'El texto contrasta el tiempo cerrado en 2021 (Past Simple) con la trayectoria abierta hasta hoy (Present Perfect).'
    }
  },
  5: {
    id: 'sr-topic-5',
    topicOrder: 5,
    topicName: 'Modal Verbs of Obligation & Advice',
    title: 'A Medic\'s Rule',
    readingText: 'In emergency medicine, doctors must make critical decisions in seconds. You should never rush without checking vitals first. Nurses have to coordinate like clockwork. Dr. Thorne explains: "You must remain calm even when alarms sound. You ought to trust your training, but you have to communicate clearly with your team." Clear words save lives.',
    wordCount: 56,
    focusGrammar: 'Modals (must, should, have to, ought to)',
    highlightedVocab: [
      { word: 'vitals', meaningEs: 'signos vitales' },
      { word: 'like clockwork', meaningEs: 'con precisión milimétrica / como reloj' },
      { word: 'ought to', meaningEs: 'deberías (similar a should)' }
    ],
    quickQuestion: {
      question: 'Según el Dr. Thorne, ¿qué deben hacer los médicos ante una alarma?',
      options: [
        'Evacuar el edificio inmediatamente.',
        'Mantener la calma y comunicarse con claridad.',
        'Esperar la orden del director del hospital.'
      ],
      correctIndex: 1,
      explanationEs: '"You must remain calm even when alarms sound... you have to communicate clearly with your team."'
    }
  }
}

export function getSeededShortReading(topicOrder: number, topicName?: string): ShortReadingItem | null {
  if (SEEDED_SHORT_READINGS[topicOrder]) {
    return SEEDED_SHORT_READINGS[topicOrder]
  }

  // Generar una lectura de respaldo sintética y limpia si no está en las primeras 5
  return {
    id: `sr-topic-${topicOrder}`,
    topicOrder,
    topicName: topicName || `Tema #${topicOrder}`,
    title: `Spotlight on ${topicName || 'Language Mastery'}`,
    readingText: `Language mastery comes from daily micro-habits. When you study English, you must practice speaking out loud. Yesterday is gone, but today offers a fresh opportunity. Focus on one structure at a time, listen carefully to native rhythms, and apply new vocabulary immediately. Small steps taken every day create massive fluency over time.`,
    wordCount: 55,
    focusGrammar: topicName || 'Active Communication & Syntax',
    highlightedVocab: [
      { word: 'micro-habits', meaningEs: 'micro-hábitos diarios' },
      { word: 'rhythms', meaningEs: 'ritmos naturales' },
      { word: 'massive', meaningEs: 'sólido / de gran escala' }
    ],
    quickQuestion: {
      question: '¿Cuál es la clave según el texto para construir fluidez?',
      options: [
        'Memorizar listas extensas de gramática.',
        'Dar pasos pequeños y constantes todos los días.',
        'Estudiar únicamente una vez por semana.'
      ],
      correctIndex: 1,
      explanationEs: 'El texto enfatiza: "Small steps taken every day create massive fluency over time."'
    }
  }
}
