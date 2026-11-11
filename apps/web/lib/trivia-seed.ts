import { getTopicSummary } from './curriculum-summary'
import {
  VocabCategory,
  CefrLevel,
  VocabularyWordItem,
  getVocabularyByCategory
} from './vocabulary'

export type TriviaDifficulty = 'basic' | 'intermediate' | 'advanced'
export type TriviaArchetype = 'situation' | 'spot_trap' | 'transform' | 'detective' | 'cloze'

export interface TriviaQuestion {
  id: string
  topicOrder: number
  topicName: string
  question: string
  contextScenario?: string
  options: string[]
  correctIndex: number
  explanation: string
  ldsFormula?: string
  trapExplanation: string
  archetype?: TriviaArchetype
  difficulty?: TriviaDifficulty
  contextSource?: 'topic' | 'vocabulary'
}

export interface AnsweredTriviaQuestion extends TriviaQuestion {
  selectedIndex: number
  isCorrect: boolean
  answeredAt: number
}

/**
 * Distribuye la respuesta correcta en una posición balanceada (0..3) sin repetir siempre el mismo índice.
 */
export function buildBalancedOptions(
  correctOption: string,
  distractors: string[],
  seedNumber: number
): { options: string[]; correctIndex: number } {
  const cleanCorrect = correctOption.trim()
  const uniqueDistractors = Array.from(
    new Set(distractors.map(d => d.trim()).filter(d => d && d.toLowerCase() !== cleanCorrect.toLowerCase()))
  ).slice(0, 3)

  const fallbackDistractors = [
    'Using literal word-for-word translation from Spanish.',
    'Omitting the subject and auxiliary verb in the clause.',
    'Adding "to" directly after a modal auxiliary verb.'
  ]
  while (uniqueDistractors.length < 3) {
    const candidate = fallbackDistractors[uniqueDistractors.length]
    if (!uniqueDistractors.includes(candidate) && candidate !== cleanCorrect) {
      uniqueDistractors.push(candidate)
    } else {
      uniqueDistractors.push(`Alternative structure #${uniqueDistractors.length + 1}`)
    }
  }

  const targetIndex = Math.abs(seedNumber) % 4
  const options: string[] = []
  let distractorCursor = 0

  for (let i = 0; i < 4; i++) {
    if (i === targetIndex) {
      options.push(cleanCorrect)
    } else {
      options.push(uniqueDistractors[distractorCursor++] || '')
    }
  }

  return { options, correctIndex: targetIndex }
}

/**
 * Genera variaciones creíbles de error (distractores hispanohablantes) a partir de una oración en inglés.
 */
function synthesizeEnglishDistractors(correctSentence: string, wrongExample?: string): string[] {
  const distractors: string[] = []
  const clean = correctSentence.trim()

  if (wrongExample && wrongExample.trim() && wrongExample.trim().toLowerCase() !== clean.toLowerCase()) {
    const firstWrong = wrongExample.split('/')[0].replace(/❌/g, '').trim()
    if (firstWrong.length > 3) {
      distractors.push(firstWrong.endsWith('.') || firstWrong.endsWith('?') ? firstWrong : `${firstWrong}.`)
    }
  }

  // Variación 1: insertar "to" tras modales comunes o alterar el auxiliar
  if (/\b(can|could|will|would|should|must|might|may)\s+([a-z]+)/i.test(clean)) {
    distractors.push(clean.replace(/\b(can|could|will|would|should|must|might|may)\s+([a-z]+)/i, '$1 to $2'))
    distractors.push(clean.replace(/\b(can|could|will|would|should|must|might|may)\s+([a-z]+)/i, 'is $1 $2ing'))
  }

  // Variación 2: preguntas con Do / Does / Did -> doble conjugación o sin inversión
  if (/^Does\s+(\w+)\s+([a-z]+)/i.test(clean)) {
    distractors.push(clean.replace(/^Does\s+(\w+)\s+([a-z]+)/i, 'Does $1 $2s'))
    distractors.push(clean.replace(/^Does\s+(\w+)\s+([a-z]+)/i, 'Is $1 $2'))
  } else if (/^Did\s+(\w+)\s+([a-z]+)/i.test(clean)) {
    distractors.push(clean.replace(/^Did\s+(\w+)\s+([a-z]+)/i, 'Did $1 $2ed'))
    distractors.push(clean.replace(/^Did\s+(\w+)\s+([a-z]+)/i, 'Do $1 $2ed'))
  }

  // Variación 3: preposiciones comunes
  if (/\b(in|on|at|for|with|about|from)\b/i.test(clean)) {
    const swapped = clean.replace(/\b(in|on|at)\b/i, match => {
      const lower = match.toLowerCase()
      if (lower === 'in') return 'on'
      if (lower === 'on') return 'at'
      return 'in'
    })
    if (swapped !== clean) distractors.push(swapped)
  }

  // Variación 4: omitir sujeto inicial o alterar verbo
  const words = clean.split(' ')
  if (words.length >= 4) {
    // Omitir pronombre inicial si empieza por I / We / It / They / You / He / She
    if (/^(I|We|It|They|You|He|She)$/i.test(words[0])) {
      const withoutSubject = words.slice(1).join(' ')
      distractors.push(withoutSubject.charAt(0).toUpperCase() + withoutSubject.slice(1))
    }
    // Duplicar "to" o cambiar orden
    const swappedOrder = [words[0], words[2], words[1], ...words.slice(3)].join(' ')
    if (swappedOrder !== clean) {
      distractors.push(swappedOrder)
    }
  }

  return distractors
}

// Banco semilla con preguntas curadas de alta fidelidad para temas clave
export const CURATED_TOPIC_SEEDS: Record<number, TriviaQuestion[]> = {
  1: [
    {
      id: 'seed-1-1',
      topicOrder: 1,
      topicName: 'The Universal Idea',
      question: 'Elige la oración que está correctamente expresada en inglés sin omitir ningún componente:',
      options: [
        'Is raining a lot today.',
        'It is raining a lot today.',
        'Can to rain this afternoon.',
        'Rains strongly right now.'
      ],
      correctIndex: 1,
      explanation: 'En inglés el sujeto siempre debe estar presente. Al hablar del clima o situaciones impersonales usamos "It" (por ejemplo: "It is raining").',
      trapExplanation: 'En español solemos decir "Está lloviendo" omitiendo el sujeto, pero en inglés nunca se puede iniciar una frase directamente con el verbo sin un sujeto.',
      archetype: 'spot_trap',
      difficulty: 'basic'
    },
    {
      id: 'seed-1-2',
      topicOrder: 1,
      topicName: 'The Universal Idea',
      question: 'Carlos quiere confirmar que terminará el reporte mañana. ¿Cuál es la forma correcta con el modal Will?',
      options: [
        'I will to finish the report tomorrow.',
        'I finish will the report tomorrow.',
        'I will finish the report tomorrow.',
        'Will finish the report tomorrow.'
      ],
      correctIndex: 2,
      explanation: 'Para expresar futuro con Will, decimos quién lo hace (I), el auxiliar de futuro (will) y la acción directa sin conectores extra (finish).',
      trapExplanation: 'El error común es agregar un "to" innecesario tras el auxiliar ("will to finish") o cambiar el orden de las palabras.',
      archetype: 'situation',
      difficulty: 'basic'
    },
    {
      id: 'seed-1-3',
      topicOrder: 1,
      topicName: 'The Universal Idea',
      question: '¿Por qué la frase "Can do it now" es incorrecta en inglés?',
      options: [
        'Porque le falta la palabra "to" después de can.',
        'Porque le falta decir claramente quién puede hacerlo antes de can.',
        'Porque "do" debe ir obligatoriamente en pasado.',
        'Porque "can" no puede usarse en tiempo presente.'
      ],
      correctIndex: 1,
      explanation: 'En inglés siempre debemos especificar quién realiza la acción; por ejemplo: "I can do it" o "You can do it".',
      trapExplanation: 'En Latinoamérica solemos decir "¿Puedes hacerlo? Sí, puedo hacer", pero en inglés omitir el pronombre hace que la frase quede incompleta.',
      archetype: 'spot_trap',
      difficulty: 'intermediate'
    }
  ],
  2: [
    {
      id: 'seed-2-1',
      topicOrder: 2,
      topicName: 'The Time Words Logic',
      question: 'Tu colega te pide un consejo para una presentación crucial. ¿Cómo se lo formulas correctamente con Should?',
      options: [
        'You should to practice more.',
        'You should practicing more.',
        'You should practice more.',
        'You should practiced more.'
      ],
      correctIndex: 2,
      explanation: 'Después de modales de consejo o posibilidad como Should, Must o Could, el verbo de acción siempre va en su forma base directa, sin "to" ni terminaciones extra.',
      trapExplanation: 'La trampa habitual es traducir "deberías de practicar" agregando "to" ("should to practice"), lo cual no se usa en inglés.',
      archetype: 'situation',
      difficulty: 'basic'
    },
    {
      id: 'seed-2-2',
      topicOrder: 2,
      topicName: 'The Time Words Logic',
      question: 'Identifica cuál de las siguientes opciones comete un error al usar palabras de tiempo:',
      options: [
        'She must be at the office by now.',
        'We could solve the problem together.',
        'He might to call us later tonight.',
        'They can handle the new project.'
      ],
      correctIndex: 2,
      explanation: '"He might to call" contiene un error porque después de might nunca se coloca "to". Lo correcto y natural es "He might call".',
      trapExplanation: 'Nunca interpongas "to" entre un auxiliar modal y el verbo de acción.',
      archetype: 'spot_trap',
      difficulty: 'intermediate'
    }
  ],
  3: [
    {
      id: 'seed-3-1',
      topicOrder: 3,
      topicName: 'The Present & The Ghost Do',
      question: '¿Cuál es la forma correcta de hacer una pregunta sobre las rutinas de trabajo de David?',
      options: [
        'Does David works on Saturdays?',
        'Does David work on Saturdays?',
        'Do David work on Saturdays?',
        'Is David work on Saturdays?'
      ],
      correctIndex: 1,
      explanation: 'Al usar "Does" al inicio de la pregunta, este auxiliar ya indica la tercera persona (he/David). Por eso el verbo principal queda en su forma normal ("work") sin "s".',
      trapExplanation: 'Ponerle "s" tanto al auxiliar como al verbo ("Does he works?") es una de las trampas más repetidas al hablar.',
      archetype: 'detective',
      difficulty: 'basic'
    },
    {
      id: 'seed-3-2',
      topicOrder: 3,
      topicName: 'The Present & The Ghost Do',
      question: 'En la afirmación "She manages the design team", ¿por qué el verbo lleva la terminación "-s"?',
      options: [
        'Porque es plural.',
        'Porque en presente afirmativo con He, She o It, el verbo adopta la marca de tercera persona.',
        'Porque reemplaza al verbo To Be.',
        'Es opcional y solo se usa en lenguaje formal.'
      ],
      correctIndex: 1,
      explanation: 'En las afirmaciones en presente con ella (she), él (he) o eso (it), el verbo siempre recibe la terminación -s o -es para concordar naturalmente.',
      trapExplanation: 'Muchos hispanohablantes olvidan colocar la "-s" al hablar de una tercera persona ("She manage").',
      archetype: 'transform',
      difficulty: 'intermediate'
    }
  ],
  4: [
    {
      id: 'seed-4-1',
      topicOrder: 4,
      topicName: 'The Past & The Ghost Did',
      question: 'Quieres aclarar que no asististe a la reunión de ayer. ¿Cuál es la forma correcta?',
      options: [
        'I didn\'t went to the meeting yesterday.',
        'I didn\'t go to the meeting yesterday.',
        'I no went to the meeting yesterday.',
        'I not did go to the meeting yesterday.'
      ],
      correctIndex: 1,
      explanation: 'El auxiliar "didn\'t" ya expresa que la acción ocurrió en pasado. Por lo tanto, el verbo que le sigue vuelve a su forma base: "didn\'t go".',
      trapExplanation: 'Poner el verbo en pasado junto con didn\'t ("didn\'t went") es el error más común.',
      archetype: 'situation',
      difficulty: 'basic'
    },
    {
      id: 'seed-4-2',
      topicOrder: 4,
      topicName: 'The Past & The Ghost Did',
      question: 'Si la respuesta de tu colega fue: "Yes, we signed the contract this morning", ¿cuál fue tu pregunta exacta?',
      options: [
        'Did you signed the contract this morning?',
        'Did you sign the contract this morning?',
        'Do you signed the contract this morning?',
        'Were you sign the contract this morning?'
      ],
      correctIndex: 1,
      explanation: 'Para preguntar en pasado se coloca "Did" al inicio y el verbo principal permanece en forma simple ("sign").',
      trapExplanation: 'Nunca conjugues el verbo en pasado ("signed") cuando la pregunta ya comienza con "Did".',
      archetype: 'detective',
      difficulty: 'intermediate'
    }
  ],
  6: [
    {
      id: 'seed-6-1',
      topicOrder: 6,
      topicName: 'Prepositions (In, On, At) & Preposition Stranding',
      question: 'Quieres preguntar en inglés "¿De dónde eres?". ¿Cuál es la forma nativa correcta?',
      options: [
        'From where are you?',
        'Where are you from?',
        'Where from you are?',
        'From where you are?'
      ],
      correctIndex: 1,
      explanation: 'En inglés rige la regla de Preposition Stranding: la preposición "from" salta al final de la pregunta: "Where are you from?". Decir "From where are you?" suena antinatural.',
      trapExplanation: 'En español ponemos la preposición al principio ("¿De dónde...?"). En inglés casi siempre va al final.',
      archetype: 'spot_trap',
      difficulty: 'basic'
    },
    {
      id: 'seed-6-2',
      topicOrder: 6,
      topicName: 'Prepositions (In, On, At) & Preposition Stranding',
      question: 'Quieres decir "Nuestra clase es el viernes a las 11:00 AM". ¿Cuáles preposiciones corresponden?',
      options: [
        'Our class is in Friday on 11:00 AM.',
        'Our class is on Friday at 11:00 AM.',
        'Our class is at Friday in 11:00 AM.',
        'Our class is on Friday in 11:00 AM.'
      ],
      correctIndex: 1,
      explanation: 'Para días de la semana usamos ON (on Friday), y para horas exactas y específicas usamos AT (at 11:00 AM).',
      trapExplanation: 'En español decimos "en viernes a las 11", pero en inglés cada nivel de tiempo tiene su preposición: ON para días, AT para horas.',
      archetype: 'spot_trap',
      difficulty: 'intermediate'
    },
    {
      id: 'seed-6-3',
      topicOrder: 6,
      topicName: 'Prepositions (In, On, At) & Preposition Stranding',
      question: '¿Cómo expresas naturalmente "Esta es la empresa para la que trabajo"?',
      options: [
        'This is the company for which I work.',
        'This is the company I work for.',
        'This is the company that I work in for.',
        'This is the company for I work.'
      ],
      correctIndex: 1,
      explanation: 'En inglés conversacional natural omitimos "en la que/para la que" y dejamos la preposición al final de la frase: "This is the company I work for."',
      trapExplanation: 'Traducir "para la que" como "for which" es gramaticalmente posible pero suena sumamente rígido o arcaico en el día a día.',
      archetype: 'situation',
      difficulty: 'advanced'
    }
  ],
  7: [
    {
      id: 'seed-7-1',
      topicOrder: 7,
      topicName: 'The Conditional Mode & Would Architecture',
      question: 'Quieres invitar a un socio a almorzar con el tono más natural y cortés. ¿Cuál eliges?',
      options: [
        'Would you like to join us for lunch?',
        'Do you will join us for lunch?',
        'Would you to join us for lunch?',
        'Will you like to joining us for lunch?'
      ],
      correctIndex: 0,
      explanation: '"Would you like to..." es la fórmula universal de cortesía ejecutiva para invitar o proponer algo cordialmente.',
      trapExplanation: 'Nunca agregues "to" directamente después de would ("would to join" es incorrecto) ni mezcles will con do.',
      archetype: 'situation',
      difficulty: 'basic'
    },
    {
      id: 'seed-7-2',
      topicOrder: 7,
      topicName: 'The Conditional Mode & Would Architecture',
      question: 'Elige la oración que plantea correctamente una situación hipotética con IF y WOULD:',
      options: [
        'If I will have time, I would travel more.',
        'If I had more time, I would travel more.',
        'If I would have time, I traveled more.',
        'If I have more time, I would to travel more.'
      ],
      correctIndex: 1,
      explanation: 'La regla de oro de la hipótesis condicional es: If + Pasado Simple (had), Sujeto + Would + Verbo Base (would travel).',
      trapExplanation: 'En español decimos "Si tuviera tiempo, viajaría", pero en inglés nunca se pone will o would dentro de la cláusula con if.',
      archetype: 'spot_trap',
      difficulty: 'intermediate'
    },
    {
      id: 'seed-7-3',
      topicOrder: 7,
      topicName: 'The Conditional Mode & Would Architecture',
      question: '¿Cómo se pronuncia correctamente la palabra WOULD en inglés?',
      options: [
        'Se pronuncia exactamente /wʊld/, sonando la letra L fuertemente.',
        'Se pronuncia /wʊd/, donde la letra L es completamente muda.',
        'Se pronuncia /waʊld/ como en la palabra wild.',
        'Se pronuncia /wʊlt/ terminando en t.'
      ],
      correctIndex: 1,
      explanation: 'En would, could y should la "L" es muda: se pronuncia exactamente /wʊd/, rimando con "good".',
      trapExplanation: 'Pronunciar la L es una de las marcas fonéticas más típicas de interferencia del español que Santiago entrena a corregir.',
      archetype: 'spot_trap',
      difficulty: 'advanced'
    }
  ],
  8: [
    {
      id: 'seed-8-1',
      topicOrder: 8,
      topicName: 'The Gerund: Turning Verbs into Things (-ING Architecture)',
      question: 'Quieres agradecerle a un colega por haber asistido a tu presentación. ¿Cómo lo dices de forma correcta?',
      options: [
        'Thank you for to come.',
        'Thank you for coming.',
        'Thank you for come.',
        'Thank you to coming.'
      ],
      correctIndex: 1,
      explanation: 'Regla de oro inviolable: Después de CUALQUIER preposición (for, before, after, about, without, in, on, at), el verbo que le sigue DEBE llevar -ING: "Thank you for coming".',
      trapExplanation: 'En español decimos "gracias por venir" usando el infinitivo, pero en inglés decir "for come" o "for to come" es un error grave de interferencia.',
      archetype: 'situation',
      difficulty: 'basic'
    },
    {
      id: 'seed-8-2',
      topicOrder: 8,
      topicName: 'The Gerund: Turning Verbs into Things (-ING Architecture)',
      question: '¿Cuál de las siguientes oraciones utiliza correctamente el verbo convertido en cosa/sujeto con -ING?',
      options: [
        'To learn English is nice, but learning takes time.',
        'Learn English every day is very important.',
        'Learning English opens doors to global opportunities.',
        'For to learn English opens doors.'
      ],
      correctIndex: 2,
      explanation: 'Cuando una acción es el sujeto o la "cosa" principal de la oración, el verbo se sustantiva con -ING: "Learning English opens doors".',
      trapExplanation: 'Comenzar una frase con el verbo en forma base ("Learn English is important" ❌) es un error muy común de hispanohablantes.',
      archetype: 'spot_trap',
      difficulty: 'intermediate'
    },
    {
      id: 'seed-8-3',
      topicOrder: 8,
      topicName: 'The Gerund: Turning Verbs into Things (-ING Architecture)',
      question: 'Identifica la frase que aplica correctamente la regla de preposición + verbo:',
      options: [
        'She left the meeting without to say goodbye.',
        'She left the meeting without say goodbye.',
        'She left the meeting without saying goodbye.',
        'She left the meeting without said goodbye.'
      ],
      correctIndex: 2,
      explanation: '"Without" es una preposición, por lo que el verbo "say" se convierte obligatoriamente en "saying": "without saying goodbye".',
      trapExplanation: 'No uses infinitivo con "to" ni forma base tras preposiciones como without, before, after o for.',
      archetype: 'spot_trap',
      difficulty: 'advanced'
    }
  ],
  9: [
    {
      id: 'seed-9-1',
      topicOrder: 9,
      topicName: 'The Subjunctive Mode',
      question: 'Tu jefe te pide consejo sobre un colaborador. ¿Cómo formulas una recomendación formal y correcta en inglés?',
      options: [
        'I recommend that he attends the strategic session.',
        'I recommend that he attend the strategic session.',
        'I recommend him that he is attending the session.',
        'I recommend that he to attend the strategic session.'
      ],
      correctIndex: 1,
      explanation: 'En el Modo Subjuntivo con "suggest", "recommend" o "demand", el verbo que sigue a THAT permanece en su FORMA BASE PURA ("naked verb") sin agregar la -S de 3ra persona: "I recommend that he attend".',
      trapExplanation: 'En presente simple normal dirías "he attends", pero la cláusula subjuntiva congela el verbo en su forma base.',
      archetype: 'situation',
      difficulty: 'basic'
    },
    {
      id: 'seed-9-2',
      topicOrder: 9,
      topicName: 'The Subjunctive Mode',
      question: '¿Cuál de las siguientes oraciones aplica de manera impecable el modo subjuntivo con una estructura impersonal?',
      options: [
        'It is essential that everyone is informed immediately.',
        'It is essential that everyone be informed immediately.',
        'It is essential that everyone was informed immediately.',
        'It is essential that everyone to be informed immediately.'
      ],
      correctIndex: 1,
      explanation: 'Con expresiones de urgencia/necesidad ("It is essential/crucial/vital that..."), el verbo "to be" se mantiene en su forma infinitiva base "BE": "It is essential that everyone be informed".',
      trapExplanation: 'El instinto nos lleva a decir "everyone is", pero en inglés profesional el subjuntivo exige "be".',
      archetype: 'spot_trap',
      difficulty: 'intermediate'
    },
    {
      id: 'seed-9-3',
      topicOrder: 9,
      topicName: 'The Subjunctive Mode',
      question: '¿Cómo se niega correctamente una recomendación dentro del modo subjuntivo?',
      options: [
        'She suggested that we don\'t sign the agreement yet.',
        'She suggested that we not sign the agreement yet.',
        'She suggested that we didn\'t sign the agreement yet.',
        'She suggested that we won\'t sign the agreement yet.'
      ],
      correctIndex: 1,
      explanation: 'En el modo subjuntivo la negación NO usa auxiliares (don\'t, doesn\'t): simplemente se coloca "NOT" directamente antes de la acción base: "She suggested that we not sign".',
      trapExplanation: 'Usar "don\'t" o "doesn\'t" es un error muy habitual. En inglés culto se dice simplemente "that [sujeto] not [verbo]".',
      archetype: 'spot_trap',
      difficulty: 'advanced'
    }
  ]
}

/**
 * Generador dinámico de preguntas semilla para CUALQUIERA de los 60 temas del currículo.
 * Bebe directamente de `CURRICULUM_SUMMARY_CATALOG` (ejemplos reales, fórmula LDS, error común wrong vs correct)
 * para garantizar 10-14 preguntas dinámicas y variadas desde el segundo cero, sin preguntas genéricas vacías.
 */
export function getSeedQuestionsForTopic(
  topicOrder: number,
  topicName: string,
  ldsFormula?: string,
  commonMistake?: string,
  grammarFocus?: string
): TriviaQuestion[] {
  const summary = getTopicSummary(topicOrder, topicName)
  const curated = CURATED_TOPIC_SEEDS[topicOrder] ? [...CURATED_TOPIC_SEEDS[topicOrder]] : []
  const synthesized: TriviaQuestion[] = []

  const formulaText = ldsFormula || summary.correctMethod
  const mistakeExplanation = commonMistake || summary.commonMistake.explanation
  const wrongRaw = summary.commonMistake.wrong
  const correctRaw = summary.commonMistake.correct

  // 1. Arquetipo SPOT_TRAP: Contraste directo entre el error común (wrong) y la forma nativa (correct)
  if (wrongRaw && correctRaw) {
    const cleanCorrect = correctRaw.split('/')[0].replace(/✅/g, '').trim()
    const cleanWrong = wrongRaw.split('/')[0].replace(/❌/g, '').trim()
    const distractors = synthesizeEnglishDistractors(cleanCorrect, cleanWrong)
    const { options, correctIndex } = buildBalancedOptions(cleanCorrect, [cleanWrong, ...distractors], topicOrder + 1)

    synthesized.push({
      id: `synth-${topicOrder}-trap-1`,
      topicOrder,
      topicName: summary.title || topicName,
      question: `Evita la trampa hispanohablante en "${summary.title}": ¿Cuál de estas opciones es la única 100% natural en inglés?`,
      contextScenario: `Trampa frecuente: "${cleanWrong}" ❌`,
      options,
      correctIndex,
      explanation: `${mistakeExplanation} La estructura correcta es: "${cleanCorrect}".`,
      ldsFormula: formulaText,
      trapExplanation: `Nunca digas "${cleanWrong}". Recuerda: ${formulaText}.`,
      archetype: 'spot_trap',
      difficulty: 'basic',
      contextSource: 'topic'
    })
  }

  // 2. Por cada ejemplo del catálogo del tema (usualmente 4 ejemplos), generamos 2 arquetipos distintos:
  //    a) Producción Inversa / Situación (Español -> Inglés)
  //    b) Cloze / Completar pieza clave de la oración en inglés
  summary.examples.forEach((ex, idx) => {
    const cleanEs = ex.es.replace(/\s*\([^)]*\)/g, '').trim()
    const cleanEn = ex.en.trim()

    // 2a. Situación comunicativa / Reverse Sprint
    const distractors = synthesizeEnglishDistractors(cleanEn, wrongRaw)
    const { options: sitOptions, correctIndex: sitCorrectIdx } = buildBalancedOptions(
      cleanEn,
      distractors,
      topicOrder * 10 + idx
    )

    const difficulties: TriviaDifficulty[] = ['basic', 'intermediate', 'advanced']
    const difficulty = difficulties[idx % difficulties.length]

    synthesized.push({
      id: `synth-${topicOrder}-sit-${idx + 1}`,
      topicOrder,
      topicName: summary.title || topicName,
      question: `¿Cómo expresas en inglés natural: "${cleanEs}"?`,
      contextScenario: `Aplica la estructura de ${summary.title}`,
      options: sitOptions,
      correctIndex: sitCorrectIdx,
      explanation: `La expresión exacta es "${cleanEn}". ${ex.es}`,
      ldsFormula: formulaText,
      trapExplanation: mistakeExplanation,
      archetype: idx % 2 === 0 ? 'situation' : 'transform',
      difficulty,
      contextSource: 'topic'
    })

    // 2b. Cloze quirúrgico: ocultar una palabra funcional o verbo clave de la oración
    const tokens = cleanEn.replace(/[.?!]+$/, '').split(/\s+/)
    if (tokens.length >= 4) {
      // Elegir un token funcional (posición 1 o 2 usualmente es el auxiliar, conector o verbo)
      const targetTokenIdx = Math.min(idx + 1, tokens.length - 2)
      const targetWord = tokens[targetTokenIdx].replace(/[.,;?!]/g, '')
      if (targetWord && targetWord.length >= 2) {
        const clozeSentence = tokens
          .map((t, i) => (i === targetTokenIdx ? '[ ___ ]' : t))
          .join(' ') + (cleanEn.endsWith('?') ? '?' : '.')

        const wordDistractors = [
          targetWord.toLowerCase() === 'to' ? 'for' : `to ${targetWord.toLowerCase()}`,
          targetWord.endsWith('ing') ? targetWord.replace(/ing$/, '') : `${targetWord}ing`,
          targetWord.endsWith('s') ? targetWord.replace(/s$/, '') : `${targetWord}s`,
          'did',
          'being',
          'for'
        ].filter(d => d.toLowerCase() !== targetWord.toLowerCase())

        const { options: clozeOptions, correctIndex: clozeCorrectIdx } = buildBalancedOptions(
          targetWord,
          wordDistractors,
          topicOrder * 20 + idx + 3
        )

        synthesized.push({
          id: `synth-${topicOrder}-cloze-${idx + 1}`,
          topicOrder,
          topicName: summary.title || topicName,
          question: `Completa el eslabón exacto en la oración: "${clozeSentence}"`,
          contextScenario: `Significado: "${cleanEs}"`,
          options: clozeOptions,
          correctIndex: clozeCorrectIdx,
          explanation: `La pieza correcta es "${targetWord}" para formar: "${cleanEn}".`,
          ldsFormula: formulaText,
          trapExplanation: mistakeExplanation,
          archetype: 'cloze',
          difficulty: idx >= 2 ? 'advanced' : 'intermediate',
          contextSource: 'topic'
        })
      }
    }
  })

  // 3. Arquetipo DETECTIVE: Identificar la regla / arquitectura correcta del tema
  const otherTopics = [
    topicOrder > 1 ? getTopicSummary(topicOrder - 1) : getTopicSummary(2),
    getTopicSummary(((topicOrder + 3) % 60) + 1),
    getTopicSummary(((topicOrder + 7) % 60) + 1)
  ]
  const otherCorrectExamples = otherTopics
    .map(t => t.commonMistake?.wrong?.split('/')[0]?.replace(/❌/g, '').trim())
    .filter((x): x is string => Boolean(x && x.length > 4))

  if (summary.examples[0]) {
    const { options: detOptions, correctIndex: detCorrectIdx } = buildBalancedOptions(
      summary.examples[0].en,
      [
        ...(wrongRaw ? [wrongRaw.split('/')[0].replace(/❌/g, '').trim()] : []),
        ...otherCorrectExamples,
        ...synthesizeEnglishDistractors(summary.examples[0].en)
      ],
      topicOrder + 7
    )

    synthesized.push({
      id: `synth-${topicOrder}-detective-1`,
      topicOrder,
      topicName: summary.title || topicName,
      question: `Modo Detective (${summary.level}): Tres de estas frases tienen interferencia del español. ¿Cuál es la única impecable?`,
      contextScenario: `Fórmula clave: ${formulaText}`,
      options: detOptions,
      correctIndex: detCorrectIdx,
      explanation: `"${summary.examples[0].en}" respeta íntegramente la arquitectura del inglés: ${formulaText}.`,
      ldsFormula: formulaText,
      trapExplanation: mistakeExplanation,
      archetype: 'detective',
      difficulty: 'advanced',
      contextSource: 'topic'
    })
  }

  // Combinar curadas + sintetizadas sin duplicar preguntas
  const combined = [...curated, ...synthesized]
  const seen = new Set<string>()
  return combined.filter(q => {
    const key = q.question.trim().toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/**
 * Generador dinámico de preguntas de Trivia Infinita para el Gimnasio de Vocabulario.
 * Bebe directamente de la categoría (`VocabCategory`), nivel MCER (`CefrLevel`) y palabras activas (`VocabularyWordItem[]`).
 */
export function getSeedQuestionsForVocabulary(
  category: VocabCategory,
  level: CefrLevel = 'A1',
  providedWords?: VocabularyWordItem[]
): TriviaQuestion[] {
  const words =
    providedWords && providedWords.length > 0
      ? providedWords
      : getVocabularyByCategory(category, level, false)

  const categoryLabels: Record<VocabCategory, string> = {
    time_words: 'Las 13 Palabras del Tiempo',
    prepositions_in_on_at: 'Preposiciones IN / ON / AT',
    wh_words: 'Palabras WH (Preguntas vs. Conectores)',
    cefr_general: `Vocabulario Polisémico MCER (${level})`
  }

  const topicName = categoryLabels[category]
  const questions: TriviaQuestion[] = []
  let seedIdx = 1

  // Recorremos cada palabra y sus acepciones para construir retos de los 5 arquetipos
  words.forEach((wordItem, wIdx) => {
    const senses = wordItem.senses
    const otherWords = words.filter(w => w.id !== wordItem.id)

    senses.forEach((sense, sIdx) => {
      // 1. Arquetipo CLOZE: Completar la oración en inglés con la palabra exacta
      const regex = new RegExp(`\\b${sense.word}(s|ed|ing)?\\b`, 'i')
      if (regex.test(sense.exampleSentenceEn)) {
        const matchedForm = sense.exampleSentenceEn.match(regex)?.[0] || sense.word
        const clozeSentence = sense.exampleSentenceEn.replace(regex, '[ ___ ]')
        const distractorWords = otherWords
          .map(ow => ow.word)
          .filter(w => w.toLowerCase() !== matchedForm.toLowerCase())

        const { options, correctIndex } = buildBalancedOptions(
          matchedForm,
          distractorWords.length >= 3 ? distractorWords : ['make', 'do', 'take', 'get'],
          seedIdx++
        )

        questions.push({
          id: `vocab-${category}-${level}-${sense.id}-cloze`,
          topicOrder: 100 + wIdx,
          topicName,
          question: `Completa la frase con la palabra precisa: "${clozeSentence}"`,
          contextScenario: `Pista en español: "${sense.exampleSentenceEs}"`,
          options,
          correctIndex,
          explanation: `"${matchedForm}" (${sense.partOfSpeech}) significa aquí: ${sense.definitionEs}. Oración completa: "${sense.exampleSentenceEn}".`,
          ldsFormula: sense.collocations?.join(' • ') || `${sense.word} (${sense.partOfSpeech})`,
          trapExplanation: sense.notes || `Recuerda asociar "${sense.word}" con el contexto: ${sense.definitionEs}.`,
          archetype: 'cloze',
          difficulty: sIdx === 0 ? 'basic' : 'intermediate',
          contextSource: 'vocabulary'
        })
      }

      // 2. Arquetipo SITUATION / TRANSFORM: Contraste de Acepción Polisémica
      const otherSenseDefs = [
        ...senses.filter(s => s.id !== sense.id).map(s => s.definitionEs),
        ...otherWords.flatMap(ow => ow.senses.map(s => s.definitionEs))
      ]

      const { options: defOptions, correctIndex: defCorrectIdx } = buildBalancedOptions(
        sense.definitionEs,
        otherSenseDefs,
        seedIdx++
      )

      questions.push({
        id: `vocab-${category}-${level}-${sense.id}-sense`,
        topicOrder: 100 + wIdx,
        topicName,
        question: `En la oración "${sense.exampleSentenceEn}", ¿qué significa exactamente "${sense.word.toUpperCase()}" (${sense.partOfSpeech})?`,
        contextScenario: `Acepción #${sense.senseIndex} • Nivel ${sense.cefrLevelTarget}`,
        options: defOptions,
        correctIndex: defCorrectIdx,
        explanation: `En este contexto (${sense.partOfSpeech}), "${sense.word}" significa: "${sense.definitionEs}". (${sense.exampleSentenceEs})`,
        ldsFormula: sense.collocations?.join(' • ') || `${sense.word} — ${sense.partOfSpeech}`,
        trapExplanation:
          senses.length > 1
            ? `¡Ojo con la polisemia! "${wordItem.word}" tiene ${senses.length} usos distintos (${senses.map(s => `#${s.senseIndex}: ${s.definitionEs}`).join(' vs. ')}).`
            : sense.notes || 'Observa siempre la función de la palabra dentro de la oración.',
        archetype: sIdx === 0 ? 'situation' : 'transform',
        difficulty: sIdx === 0 ? 'basic' : 'advanced',
        contextSource: 'vocabulary'
      })

      // 3. Arquetipo DETECTIVE / SPOT_TRAP: Producción inversa desde el español
      const englishDistractors = synthesizeEnglishDistractors(sense.exampleSentenceEn)
      const otherEnglishSentences = otherWords
        .map(ow => ow.senses[0]?.exampleSentenceEn)
        .filter((s): s is string => Boolean(s))

      const { options: revOptions, correctIndex: revCorrectIdx } = buildBalancedOptions(
        sense.exampleSentenceEn,
        [...englishDistractors, ...otherEnglishSentences],
        seedIdx++
      )

      questions.push({
        id: `vocab-${category}-${level}-${sense.id}-reverse`,
        topicOrder: 100 + wIdx,
        topicName,
        question: `¿Cómo expresas en inglés natural: "${sense.exampleSentenceEs}" usando "${sense.word}"?`,
        contextScenario: sense.notes ? `Nota clave: ${sense.notes}` : `Colocación: ${sense.collocations?.[0] || sense.word}`,
        options: revOptions,
        correctIndex: revCorrectIdx,
        explanation: `La estructura correcta es: "${sense.exampleSentenceEn}".`,
        ldsFormula: sense.collocations?.join(' • ') || sense.word,
        trapExplanation: sense.notes || `Evita traducir literalmente palabra por palabra desde el español.`,
        archetype: 'detective',
        difficulty: sIdx === 0 ? 'intermediate' : 'advanced',
        contextSource: 'vocabulary'
      })
    })
  })

  // Eliminamos posibles duplicados y retornamos el banco rico
  const seen = new Set<string>()
  return questions.filter(q => {
    const key = q.question.trim().toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
