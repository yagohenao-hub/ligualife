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
  archetype?: 'situation' | 'spot_trap' | 'transform' | 'detective'
}

export interface AnsweredTriviaQuestion extends TriviaQuestion {
  selectedIndex: number
  isCorrect: boolean
  answeredAt: number
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
      archetype: 'spot_trap'
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
      archetype: 'situation'
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
      archetype: 'spot_trap'
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
      archetype: 'situation'
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
      archetype: 'spot_trap'
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
      archetype: 'detective'
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
      archetype: 'transform'
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
      archetype: 'situation'
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
      archetype: 'detective'
    }
  ],
  6: [
    {
      id: 'seed-6-1',
      topicOrder: 6,
      topicName: 'The Detective (Yes/No Questions)',
      question: 'Quieres confirmar si tu compañero vive cerca de la oficina. En inglés, ¿cómo se formula la pregunta?',
      options: [
        'You live near the office?',
        'Do you live near the office?',
        'Live you near the office?',
        'Are you live near the office?'
      ],
      correctIndex: 1,
      explanation: 'En inglés no basta con cambiar la entonación de la voz; para hacer una pregunta de sí o no en presente con verbos de acción debemos comenzar con "Do".',
      trapExplanation: 'En español preguntamos con la misma estructura de una afirmación: "¿Tú vives aquí?". En inglés el auxiliar "Do" al inicio es indispensable.',
      archetype: 'spot_trap'
    }
  ],
  7: [
    {
      id: 'seed-7-1',
      topicOrder: 7,
      topicName: 'Wh- Questions (Informativas)',
      question: 'Quieres saber a qué hora sale el vuelo de tu cliente. ¿Cuál es el orden natural en inglés?',
      options: [
        'What time leaves the flight?',
        'What time does the flight leave?',
        'What time the flight leaves?',
        'What time is leave the flight?'
      ],
      correctIndex: 1,
      explanation: 'Para preguntas informativas, primero va la palabra de pregunta (What time), seguida del auxiliar (does), luego el sujeto (the flight) y finalmente el verbo (leave).',
      trapExplanation: 'Traducir literalmente "¿A qué hora sale el vuelo?" hace que muchos olviden el auxiliar "does", lo cual suena cortado o incompleto en inglés.',
      archetype: 'situation'
    },
    {
      id: 'seed-7-2',
      topicOrder: 7,
      topicName: 'Wh- Questions (Informativas)',
      question: 'Identifica la pregunta que incluye correctamente el auxiliar de tiempo necesario:',
      options: [
        'Where you bought that camera?',
        'Where did you buy that camera?',
        'Where you did buy that camera?',
        'Where bought you that camera?'
      ],
      correctIndex: 1,
      explanation: 'La estructura correcta es: pregunta informativa (Where) + auxiliar de pasado (did) + persona (you) + verbo base (buy).',
      trapExplanation: 'Omitir "did" diciendo "Where you bought?" es un calco directo del español que debemos evitar.',
      archetype: 'spot_trap'
    }
  ]
}

// Generador inteligente de preguntas semilla para cualquiera de los 60 temas
export function getSeedQuestionsForTopic(
  topicOrder: number,
  topicName: string,
  ldsFormula?: string,
  commonMistake?: string,
  grammarFocus?: string
): TriviaQuestion[] {
  // Si ya tenemos preguntas curadas artesanales, devolverlas
  if (CURATED_TOPIC_SEEDS[topicOrder] && CURATED_TOPIC_SEEDS[topicOrder].length > 0) {
    return CURATED_TOPIC_SEEDS[topicOrder]
  }

  const trap = commonMistake || 'Traducción palabra por palabra del español'

  return [
    {
      id: `seed-${topicOrder}-a`,
      topicOrder,
      topicName,
      question: '¿Cuál de las siguientes opciones expresa una idea en inglés de la forma más natural y correcta?',
      options: [
        'Respetar el orden natural del inglés sin omitir el sujeto ni los auxiliares correspondientes.',
        'Omitir palabras clave para intentar hablar más rápido.',
        'Traducir palabra por palabra desde el español calcando el orden latino.',
        'Conjugarse tanto el auxiliar como el verbo de acción al mismo tiempo.'
      ],
      correctIndex: 0,
      explanation: 'En inglés es fundamental mantener una estructura clara y directa sin omitir los pronombres ni alterar la posición de los auxiliares.',
      trapExplanation: `Ten especial cuidado con: ${trap}.`,
      archetype: 'spot_trap'
    },
    {
      id: `seed-${topicOrder}-b`,
      topicOrder,
      topicName,
      question: '¿Cuál es la trampa más común que debes evitar para sonar natural al hablar en inglés?',
      options: [
        'Usar vocabulario formal en conversaciones casuales.',
        trap,
        'Pronunciar con claridad las consonantes finales.',
        'Hacer pausas breves para estructurar la idea antes de responder.'
      ],
      correctIndex: 1,
      explanation: `El error más común en este punto es precisamente: "${trap}". Evitarlo te da soltura inmediata.`,
      trapExplanation: 'Pensar la idea directamente en la lógica del inglés evita la interferencia del español.',
      archetype: 'spot_trap'
    },
    {
      id: `seed-${topicOrder}-c`,
      topicOrder,
      topicName,
      question: 'Para responder con seguridad y fluidez en una conversación real, ¿cuál es el mejor hábito?',
      options: [
        'Memorizar listas de verbos aisladas sin contexto.',
        'Responder conectando la idea directamente sin traducir palabra por palabra.',
        'Hablar siempre en oraciones de una sola palabra.',
        'Esperar a traducir mentalmente cada frase al español antes de decirla.'
      ],
      correctIndex: 1,
      explanation: 'Internalizar las estructuras de forma práctica y espontánea te permite comunicarte con fluidez real sin bloqueos mentales.',
      trapExplanation: 'La traducción simultánea mental es el principal causante de titubeos y errores sintácticos.',
      archetype: 'situation'
    }
  ]
}
