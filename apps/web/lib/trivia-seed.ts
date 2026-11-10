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
      archetype: 'spot_trap'
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
      archetype: 'spot_trap'
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
      archetype: 'situation'
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
      archetype: 'situation'
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
      archetype: 'spot_trap'
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
      archetype: 'spot_trap'
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
      archetype: 'situation'
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
      archetype: 'spot_trap'
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
      archetype: 'spot_trap'
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
      archetype: 'situation'
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
      archetype: 'spot_trap'
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
