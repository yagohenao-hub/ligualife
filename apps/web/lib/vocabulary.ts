// =============================================================================
// VOCABULARIO CEFR & RED SEMÁNTICA: MODELO DE DATOS, SERVICIOS & BANCO CURADO
// LinguaLife System
// =============================================================================

export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type TriageStatus = 'mastered' | 'to_learn' | 'passive' | 'unreviewed';
export type RelationType = 'synonym' | 'antonym' | 'related';
export type VocabCategory = 'time_words' | 'prepositions_in_on_at' | 'wh_words' | 'cefr_general';

export interface VocabularySense {
  id: string;
  wordId: string;
  word: string;
  senseIndex: number;
  cefrLevelTarget: CefrLevel;
  definitionEn: string;
  definitionEs: string;
  exampleSentenceEn: string;
  exampleSentenceEs: string;
  partOfSpeech: string;
  ipa?: string;
  collocations?: string[];
  notes?: string;
}

export interface VocabularyRelation {
  id: string;
  sourceSenseId: string;
  targetSenseId: string;
  targetWord: string;
  targetDefinitionEs: string;
  relationType: RelationType;
}

export interface VocabularyWordItem {
  id: string;
  word: string;
  cefrLevel: CefrLevel;
  partOfSpeech: string;
  ipa?: string;
  thematicCluster?: string;
  category: VocabCategory;
  senses: VocabularySense[];
  relations: VocabularyRelation[];
  triageStatus?: TriageStatus;
}

// -----------------------------------------------------------------------------
// BANCO MAESTRO DE VOCABULARIO CURADO (CATEGORÍAS DE SANTIAGO + CEFR POLISÉMICO)
// -----------------------------------------------------------------------------

export const VOCABULARY_MASTER_DATA: VocabularyWordItem[] = [
  // ── 1. LAS 12-13 PALABRAS DEL TIEMPO (AUXILIARES & VERBOS MODALES) ─────────
  {
    id: 'vw-can',
    word: 'can',
    cefrLevel: 'A1',
    partOfSpeech: 'modal auxiliary',
    ipa: '/kæn/',
    category: 'time_words',
    thematicCluster: 'Abilities & Permissions',
    senses: [
      {
        id: 'vs-can-1',
        wordId: 'vw-can',
        word: 'can',
        senseIndex: 1,
        cefrLevelTarget: 'A1',
        partOfSpeech: 'modal auxiliary',
        ipa: '/kæn/',
        definitionEn: 'Expresses physical or mental ability in the present.',
        definitionEs: 'Poder hacer algo; capacidad o habilidad en presente.',
        exampleSentenceEn: 'I can speak two languages fluently.',
        exampleSentenceEs: 'Puedo hablar dos idiomas con fluidez.',
        collocations: ['can speak', 'can do', 'can see'],
        notes: 'El verbo principal siempre va en su forma base (sin "to" ni "-s").'
      },
      {
        id: 'vs-can-2',
        wordId: 'vw-can',
        word: 'can',
        senseIndex: 2,
        cefrLevelTarget: 'A1',
        partOfSpeech: 'modal auxiliary',
        ipa: '/kæn/',
        definitionEn: 'Used to ask for or give informal permission or make requests.',
        definitionEs: 'Pedir o dar permiso informal; hacer solicitudes cotidianas.',
        exampleSentenceEn: 'Can I ask you a quick question?',
        exampleSentenceEs: '¿Te puedo hacer una pregunta rápida?',
        collocations: ['can I help', 'can you tell me'],
        notes: 'En preguntas invierte la posición: Can + Sujeto + Acción.'
      }
    ],
    relations: [
      { id: 'vr-can-could', sourceSenseId: 'vs-can-1', targetSenseId: 'vs-could-1', targetWord: 'could', targetDefinitionEs: 'Forma en pasado o más formal de can', relationType: 'related' },
      { id: 'vr-can-able', sourceSenseId: 'vs-can-1', targetSenseId: 'vs-able-1', targetWord: 'be able to', targetDefinitionEs: 'Ser capaz de', relationType: 'synonym' }
    ]
  },
  {
    id: 'vw-could',
    word: 'could',
    cefrLevel: 'A1',
    partOfSpeech: 'modal auxiliary',
    ipa: '/kʊd/',
    category: 'time_words',
    thematicCluster: 'Past Abilities & Courtesy',
    senses: [
      {
        id: 'vs-could-1',
        wordId: 'vw-could',
        word: 'could',
        senseIndex: 1,
        cefrLevelTarget: 'A1',
        partOfSpeech: 'modal auxiliary',
        ipa: '/kʊd/',
        definitionEn: 'Past ability of "can" (was able to).',
        definitionEs: 'Pude / Podía (capacidad o habilidad en pasado).',
        exampleSentenceEn: 'When I was younger, I could run ten miles easily.',
        exampleSentenceEs: 'Cuando era más joven, podía correr diez millas con facilidad.',
        collocations: ['could run', 'could swim', 'could hear'],
        notes: 'La "l" es muda: se pronuncia exactamente /kʊd/.'
      },
      {
        id: 'vs-could-2',
        wordId: 'vw-could',
        word: 'could',
        senseIndex: 2,
        cefrLevelTarget: 'A2',
        partOfSpeech: 'modal auxiliary',
        ipa: '/kʊd/',
        definitionEn: 'Polite request or conditional possibility (podría).',
        definitionEs: 'Petición cortés o posibilidad condicional (¿Podrías...?).',
        exampleSentenceEn: 'Could you send me the contract before noon?',
        exampleSentenceEs: '¿Podrías enviarme el contrato antes del mediodía?',
        collocations: ['could you please', 'could happen', 'could be'],
        notes: 'Es la versión educada y profesional de "can".'
      }
    ],
    relations: [
      { id: 'vr-could-can', sourceSenseId: 'vs-could-1', targetSenseId: 'vs-can-1', targetWord: 'can', targetDefinitionEs: 'Forma presente directa', relationType: 'related' }
    ]
  },
  {
    id: 'vw-will',
    word: 'will',
    cefrLevel: 'A1',
    partOfSpeech: 'modal auxiliary',
    ipa: '/wɪl/',
    category: 'time_words',
    thematicCluster: 'Certain Future & Decisions',
    senses: [
      {
        id: 'vs-will-1',
        wordId: 'vw-will',
        word: 'will',
        senseIndex: 1,
        cefrLevelTarget: 'A1',
        partOfSpeech: 'modal auxiliary',
        ipa: '/wɪl/',
        definitionEn: 'Indicates certain future action or instant spontaneous decision.',
        definitionEs: 'Marca de tiempo futuro certero o decisión espontánea al hablar.',
        exampleSentenceEn: 'We will start the presentation at 11:00 AM.',
        exampleSentenceEs: 'Comenzaremos la presentación a las 11:00 AM.',
        collocations: ['will be', 'will do', 'will start'],
        notes: 'Se contrae habitualmente como \'ll (I\'ll, we\'ll, they\'ll).'
      },
      {
        id: 'vs-will-2',
        wordId: 'vw-will',
        word: 'will',
        senseIndex: 2,
        cefrLevelTarget: 'A2',
        partOfSpeech: 'modal auxiliary',
        ipa: '/wɪl/',
        definitionEn: 'Expresses willingness, promise, or voluntary offer.',
        definitionEs: 'Expresar voluntad, promesa u ofrecimiento voluntario.',
        exampleSentenceEn: 'Don\'t worry, I will help you with the report.',
        exampleSentenceEs: 'No te preocupes, yo te ayudaré con el informe.',
        collocations: ['will help', 'will promise'],
        notes: 'En negación es "won\'t" (/woʊnt/).'
      }
    ],
    relations: [
      { id: 'vr-will-would', sourceSenseId: 'vs-will-1', targetSenseId: 'vs-would-1', targetWord: 'would', targetDefinitionEs: 'Forma condicional de will', relationType: 'related' }
    ]
  },
  {
    id: 'vw-would',
    word: 'would',
    cefrLevel: 'A1',
    partOfSpeech: 'modal auxiliary',
    ipa: '/wʊd/',
    category: 'time_words',
    thematicCluster: 'Conditionals & Polite Offers',
    senses: [
      {
        id: 'vs-would-1',
        wordId: 'vw-would',
        word: 'would',
        senseIndex: 1,
        cefrLevelTarget: 'A1',
        partOfSpeech: 'modal auxiliary',
        ipa: '/wʊd/',
        definitionEn: 'Conditional auxiliary adding the suffix "-ría" to actions.',
        definitionEs: 'Auxiliar condicional (haría, gustaría, viajaría).',
        exampleSentenceEn: 'I would love to learn more about your project.',
        exampleSentenceEs: 'Me encantaría aprender más sobre tu proyecto.',
        collocations: ['would like', 'would love', 'would prefer'],
        notes: 'La "l" es muda. Se contrae habitualmente como \'d (I\'d like).'
      },
      {
        id: 'vs-would-2',
        wordId: 'vw-would',
        word: 'would',
        senseIndex: 2,
        cefrLevelTarget: 'A2',
        partOfSpeech: 'modal auxiliary',
        ipa: '/wʊd/',
        definitionEn: 'Polite offers, invitations or hypothetical scenarios.',
        definitionEs: 'Ofrecimiento o invitación formal cortés (¿Te gustaría...?).',
        exampleSentenceEn: 'Would you like a cup of coffee?',
        exampleSentenceEs: '¿Te gustaría una taza de café?',
        collocations: ['would you like', 'would you mind'],
        notes: 'La respuesta natural afirmativa es: "I would love to".'
      }
    ],
    relations: [
      { id: 'vr-would-will', sourceSenseId: 'vs-would-1', targetSenseId: 'vs-will-1', targetWord: 'will', targetDefinitionEs: 'Forma de futuro real', relationType: 'related' }
    ]
  },
  {
    id: 'vw-should',
    word: 'should',
    cefrLevel: 'A1',
    partOfSpeech: 'modal auxiliary',
    ipa: '/ʃʊd/',
    category: 'time_words',
    thematicCluster: 'Advice & Recommendations',
    senses: [
      {
        id: 'vs-should-1',
        wordId: 'vw-should',
        word: 'should',
        senseIndex: 1,
        cefrLevelTarget: 'A1',
        partOfSpeech: 'modal auxiliary',
        ipa: '/ʃʊd/',
        definitionEn: 'Used to give advice, suggestions, or recommendations (deberías).',
        definitionEs: 'Dar consejos, sugerencias o recomendaciones (deberías).',
        exampleSentenceEn: 'You should rest before tomorrow\'s flight.',
        exampleSentenceEs: 'Deberías descansar antes del vuelo de mañana.',
        collocations: ['should go', 'should try', 'should know'],
        notes: 'No expresa obligación estricta, sino recomendación amistosa.'
      },
      {
        id: 'vs-should-2',
        wordId: 'vw-should',
        word: 'should',
        senseIndex: 2,
        cefrLevelTarget: 'A2',
        partOfSpeech: 'modal auxiliary',
        ipa: '/ʃʊd/',
        definitionEn: 'Indicates reasonable expectation or probability.',
        definitionEs: 'Expectativa razonable o cálculo probable (debería llegar pronto).',
        exampleSentenceEn: 'The package should arrive by Thursday afternoon.',
        exampleSentenceEs: 'El paquete debería llegar para el jueves por la tarde.',
        collocations: ['should be ready', 'should arrive'],
        notes: 'En negación es "shouldn\'t" (/ˈʃʊd.ənt/).'
      }
    ],
    relations: [
      { id: 'vr-should-ought', sourceSenseId: 'vs-should-1', targetSenseId: 'vs-ought-1', targetWord: 'ought to', targetDefinitionEs: 'Deberías (equivalente formal)', relationType: 'synonym' }
    ]
  },
  {
    id: 'vw-must',
    word: 'must',
    cefrLevel: 'A1',
    partOfSpeech: 'modal auxiliary',
    ipa: '/mʌst/',
    category: 'time_words',
    thematicCluster: 'Necessity & Logical Deduction',
    senses: [
      {
        id: 'vs-must-1',
        wordId: 'vw-must',
        word: 'must',
        senseIndex: 1,
        cefrLevelTarget: 'A1',
        partOfSpeech: 'modal auxiliary',
        ipa: '/mʌst/',
        definitionEn: 'Expresses strong obligation or urgent necessity (debo/tienes que).',
        definitionEs: 'Obligación rotunda o necesidad inaplazable impuesta internamente.',
        exampleSentenceEn: 'We must submit the proposal before 5:00 PM.',
        exampleSentenceEs: 'Debemos entregar la propuesta antes de las 5:00 PM.',
        collocations: ['must do', 'must see', 'must remember'],
        notes: 'Para el pasado de obligación se utiliza "had to".'
      },
      {
        id: 'vs-must-2',
        wordId: 'vw-must',
        word: 'must',
        senseIndex: 2,
        cefrLevelTarget: 'A2',
        partOfSpeech: 'modal auxiliary',
        ipa: '/mʌst/',
        definitionEn: 'Expresses logical certainty or high deduction (debe ser).',
        definitionEs: 'Certeza lógica o deducción evidente (tiene que ser verdad).',
        exampleSentenceEn: 'You worked all day, you must be exhausted!',
        exampleSentenceEs: 'Trabajaste todo el día, ¡debes estar agotado!',
        collocations: ['must be', 'must have'],
        notes: 'Expresa 95% de certeza sobre un hecho presente.'
      }
    ],
    relations: [
      { id: 'vr-must-have-to', sourceSenseId: 'vs-must-1', targetSenseId: 'vs-have-to-1', targetWord: 'have to', targetDefinitionEs: 'Tener que (obligación externa)', relationType: 'synonym' }
    ]
  },
  {
    id: 'vw-may',
    word: 'may',
    cefrLevel: 'A1',
    partOfSpeech: 'modal auxiliary',
    ipa: '/meɪ/',
    category: 'time_words',
    thematicCluster: 'Formal Permission & Possibility',
    senses: [
      {
        id: 'vs-may-1',
        wordId: 'vw-may',
        word: 'may',
        senseIndex: 1,
        cefrLevelTarget: 'A1',
        partOfSpeech: 'modal auxiliary',
        ipa: '/meɪ/',
        definitionEn: 'Polite or formal permission (¿Puedo...?).',
        definitionEs: 'Permiso formal o de cortesía profesional (¿Me permite...?).',
        exampleSentenceEn: 'May I come in?',
        exampleSentenceEs: '¿Puedo pasar? / ¿Me permite entrar?',
        collocations: ['may I ask', 'may I help you'],
        notes: 'Mucho más elegante y formal que "can".'
      },
      {
        id: 'vs-may-2',
        wordId: 'vw-may',
        word: 'may',
        senseIndex: 2,
        cefrLevelTarget: 'A2',
        partOfSpeech: 'modal auxiliary',
        ipa: '/meɪ/',
        definitionEn: 'Expresses factual possibility (puede que / es posible que).',
        definitionEs: 'Posibilidad real o cálculo probable (puede que ocurra).',
        exampleSentenceEn: 'It may rain this evening, bring an umbrella.',
        exampleSentenceEs: 'Puede que llueva esta tarde, lleva una sombrilla.',
        collocations: ['may be', 'may rain', 'may seem'],
        notes: 'Equivale a un 50% de probabilidad.'
      }
    ],
    relations: [
      { id: 'vr-may-might', sourceSenseId: 'vs-may-2', targetSenseId: 'vs-might-1', targetWord: 'might', targetDefinitionEs: 'Posibilidad más remota', relationType: 'related' }
    ]
  },
  {
    id: 'vw-might',
    word: 'might',
    cefrLevel: 'A1',
    partOfSpeech: 'modal auxiliary',
    ipa: '/maɪt/',
    category: 'time_words',
    thematicCluster: 'Remote Possibility',
    senses: [
      {
        id: 'vs-might-1',
        wordId: 'vw-might',
        word: 'might',
        senseIndex: 1,
        cefrLevelTarget: 'A1',
        partOfSpeech: 'modal auxiliary',
        ipa: '/maɪt/',
        definitionEn: 'Expresses remote or tentative possibility (podría ser que / quizás).',
        definitionEs: 'Posibilidad remota o incierta (tal vez / podría suceder).',
        exampleSentenceEn: 'We might visit the museum if we finish early.',
        exampleSentenceEs: 'Quizás visitemos el museo si terminamos temprano.',
        collocations: ['might be', 'might know', 'might need'],
        notes: 'Indica una probabilidad menor (~30%) comparada con "may".'
      },
      {
        id: 'vs-might-2',
        wordId: 'vw-might',
        word: 'might',
        senseIndex: 2,
        cefrLevelTarget: 'A2',
        partOfSpeech: 'modal auxiliary',
        ipa: '/maɪt/',
        definitionEn: 'Tentative suggestions or hesitant proposals.',
        definitionEs: 'Sugerencia tímida o propuesta de tanteo suave.',
        exampleSentenceEn: 'You might want to check the numbers again.',
        exampleSentenceEs: 'Quizás quieras revisar los números de nuevo.',
        collocations: ['might want to', 'might as well'],
        notes: 'Fórmula muy diplomática en correos corporativos.'
      }
    ],
    relations: [
      { id: 'vr-might-may', sourceSenseId: 'vs-might-1', targetSenseId: 'vs-may-2', targetWord: 'may', targetDefinitionEs: 'Posibilidad con mayor certeza', relationType: 'related' }
    ]
  },
  {
    id: 'vw-shall',
    word: 'shall',
    cefrLevel: 'A1',
    partOfSpeech: 'modal auxiliary',
    ipa: '/ʃæl/',
    category: 'time_words',
    thematicCluster: 'Offers & Formal Decisions',
    senses: [
      {
        id: 'vs-shall-1',
        wordId: 'vw-shall',
        word: 'shall',
        senseIndex: 1,
        cefrLevelTarget: 'A1',
        partOfSpeech: 'modal auxiliary',
        ipa: '/ʃæl/',
        definitionEn: 'Used with "I" and "we" to make polite suggestions or offers (¿Vamos...?).',
        definitionEs: 'Propuesta conjunta cordial o pregunta de sugerencia (¿Empezamos?).',
        exampleSentenceEn: 'Shall we start the meeting now?',
        exampleSentenceEs: '¿Comenzamos la reunión ahora?',
        collocations: ['shall we go', 'shall we begin', 'shall I help'],
        notes: 'Uso característico en primera persona (I / We).'
      },
      {
        id: 'vs-shall-2',
        wordId: 'vw-shall',
        word: 'shall',
        senseIndex: 2,
        cefrLevelTarget: 'A2',
        partOfSpeech: 'modal auxiliary',
        ipa: '/ʃæl/',
        definitionEn: 'Expresses formal determination, solemn promise, or legal clause.',
        definitionEs: 'Determinación solemne o compromiso contractual formal.',
        exampleSentenceEn: 'We shall overcome any obstacle together.',
        exampleSentenceEs: 'Superaremos cualquier obstáculo juntos.',
        collocations: ['we shall see', 'shall not'],
        notes: 'Muy común en leyes, contratos y discursos ceremoniales.'
      }
    ],
    relations: [
      { id: 'vr-shall-should', sourceSenseId: 'vs-shall-1', targetSenseId: 'vs-should-1', targetWord: 'should', targetDefinitionEs: 'Deberías / Deberíamos', relationType: 'related' }
    ]
  },
  {
    id: 'vw-do',
    word: 'do',
    cefrLevel: 'A1',
    partOfSpeech: 'auxiliary / verb',
    ipa: '/duː/',
    category: 'time_words',
    thematicCluster: 'Universal Present Auxiliary',
    senses: [
      {
        id: 'vs-do-1',
        wordId: 'vw-do',
        word: 'do',
        senseIndex: 1,
        cefrLevelTarget: 'A1',
        partOfSpeech: 'auxiliary verb',
        ipa: '/duː/',
        definitionEn: 'Universal auxiliary for questions and negatives in present simple.',
        definitionEs: 'Auxiliar del presente simple para preguntar y negar (I/you/we/they).',
        exampleSentenceEn: 'Do you live in this city?',
        exampleSentenceEs: '¿Vives en esta ciudad? (Do activa la pregunta en presente).',
        collocations: ['do you know', 'I don\'t think', 'do they have'],
        notes: 'En español no se traduce, actúa como interruptor de tiempo presente.'
      },
      {
        id: 'vs-do-2',
        wordId: 'vw-do',
        word: 'do',
        senseIndex: 2,
        cefrLevelTarget: 'A1',
        partOfSpeech: 'verb',
        ipa: '/duː/',
        definitionEn: 'Perform an action, task, or activity.',
        definitionEs: 'Hacer o ejecutar una actividad, tarea o trabajo.',
        exampleSentenceEn: 'I do my exercises every morning.',
        exampleSentenceEs: 'Hago mis ejercicios cada mañana.',
        collocations: ['do homework', 'do exercise', 'do business'],
        notes: 'Se usa para tareas y procesos sin producto físico (vs. "make").'
      }
    ],
    relations: [
      { id: 'vr-do-did', sourceSenseId: 'vs-do-1', targetSenseId: 'vs-did-1', targetWord: 'did', targetDefinitionEs: 'Forma en pasado simple', relationType: 'related' }
    ]
  },
  {
    id: 'vw-did',
    word: 'did',
    cefrLevel: 'A1',
    partOfSpeech: 'auxiliary / verb',
    ipa: '/dɪd/',
    category: 'time_words',
    thematicCluster: 'Universal Past Auxiliary',
    senses: [
      {
        id: 'vs-did-1',
        wordId: 'vw-did',
        word: 'did',
        senseIndex: 1,
        cefrLevelTarget: 'A1',
        partOfSpeech: 'auxiliary verb',
        ipa: '/dɪd/',
        definitionEn: 'Universal auxiliary for questions and negatives in past simple.',
        definitionEs: 'Auxiliar del pasado simple para preguntar y negar para todas las personas.',
        exampleSentenceEn: 'Did you finish the assignment yesterday?',
        exampleSentenceEs: '¿Terminaste la tarea ayer? (Did absorbe el pasado; finish queda base).',
        collocations: ['did you see', 'I didn\'t know', 'did it work'],
        notes: 'Regla de oro: Did absorbe el tiempo pasado, por lo que el verbo va en forma base.'
      },
      {
        id: 'vs-did-2',
        wordId: 'vw-did',
        word: 'did',
        senseIndex: 2,
        cefrLevelTarget: 'A1',
        partOfSpeech: 'verb',
        ipa: '/dɪd/',
        definitionEn: 'Past tense of the main action "to do".',
        definitionEs: 'Hizo / Hice / Hicimos (acción completada en pasado).',
        exampleSentenceEn: 'She did a fantastic job on the report.',
        exampleSentenceEs: 'Ella hizo un trabajo fantástico en el informe.',
        collocations: ['did my best', 'did well'],
        notes: 'Como verbo principal no requiere otro auxiliar detrás de él.'
      }
    ],
    relations: [
      { id: 'vr-did-do', sourceSenseId: 'vs-did-1', targetSenseId: 'vs-do-1', targetWord: 'do', targetDefinitionEs: 'Forma presente', relationType: 'related' }
    ]
  },
  {
    id: 'vw-be',
    word: 'be',
    cefrLevel: 'A1',
    partOfSpeech: 'auxiliary / linking verb',
    ipa: '/biː/',
    category: 'time_words',
    thematicCluster: 'State, Identity & Continuous Anchor',
    senses: [
      {
        id: 'vs-be-1',
        wordId: 'vw-be',
        word: 'be',
        senseIndex: 1,
        cefrLevelTarget: 'A1',
        partOfSpeech: 'linking verb',
        ipa: '/biː/',
        definitionEn: 'Indicates identity, state, location, or characteristics (am/is/are/was/were).',
        definitionEs: 'Ser o estar: define identidad, ubicación o estado.',
        exampleSentenceEn: 'They are ready for the presentation.',
        exampleSentenceEs: 'Ellos están listos para la presentación.',
        collocations: ['be ready', 'be happy', 'be late'],
        notes: 'Es el único verbo que cambia de forma sin auxiliar para preguntar y negar.'
      },
      {
        id: 'vs-be-2',
        wordId: 'vw-be',
        word: 'be',
        senseIndex: 2,
        cefrLevelTarget: 'A1',
        partOfSpeech: 'auxiliary verb',
        ipa: '/biː/',
        definitionEn: 'Continuous aspect auxiliary (be + verb-ing) or passive anchor.',
        definitionEs: 'Auxiliar del modo continuo (estar haciendo algo con -ing).',
        exampleSentenceEn: 'We are working on the new strategy right now.',
        exampleSentenceEs: 'Estamos trabajando en la nueva estrategia ahora mismo.',
        collocations: ['be doing', 'be going to'],
        notes: 'Ancla imprescindible antes de cualquier acción en -ing.'
      }
    ],
    relations: [
      { id: 'vr-be-exist', sourceSenseId: 'vs-be-1', targetSenseId: 'vs-exist-1', targetWord: 'exist', targetDefinitionEs: 'Existir', relationType: 'related' }
    ]
  },
  {
    id: 'vw-have',
    word: 'have',
    cefrLevel: 'A1',
    partOfSpeech: 'auxiliary / verb',
    ipa: '/hæv/',
    category: 'time_words',
    thematicCluster: 'Perfect Aspect & Possession',
    senses: [
      {
        id: 'vs-have-1',
        wordId: 'vw-have',
        word: 'have',
        senseIndex: 1,
        cefrLevelTarget: 'A1',
        partOfSpeech: 'verb',
        ipa: '/hæv/',
        definitionEn: 'Expresses possession, ownership, or relationship.',
        definitionEs: 'Tener: posesión, pertenencia o vínculo personal.',
        exampleSentenceEn: 'I have all the notes you sent me.',
        exampleSentenceEs: 'Tengo todas las notas que me enviaste.',
        collocations: ['have time', 'have a question', 'have experience'],
        notes: 'En tercera persona presente cambia a "has".'
      },
      {
        id: 'vs-have-2',
        wordId: 'vw-have',
        word: 'have',
        senseIndex: 2,
        cefrLevelTarget: 'A2',
        partOfSpeech: 'auxiliary verb',
        ipa: '/hæv/',
        definitionEn: 'Auxiliary for perfect tenses (have + participle: he/has/hemos hecho).',
        definitionEs: 'Auxiliar de tiempos compuestos (haber hecho algo: he visto, has ido).',
        exampleSentenceEn: 'I have lived in this neighborhood for three years.',
        exampleSentenceEs: 'He vivido en este vecindario durante tres años.',
        collocations: ['have seen', 'have done', 'have been'],
        notes: 'Conecta el pasado con el momento presente.'
      }
    ],
    relations: [
      { id: 'vr-have-possess', sourceSenseId: 'vs-have-1', targetSenseId: 'vs-possess-1', targetWord: 'possess', targetDefinitionEs: 'Poseer', relationType: 'synonym' }
    ]
  },

  // ── 2. PREPOSICIONES CLAVE: IN, ON, AT ─────────────────────────────────────
  {
    id: 'vw-in',
    word: 'in',
    cefrLevel: 'A1',
    partOfSpeech: 'preposition',
    ipa: '/ɪn/',
    category: 'prepositions_in_on_at',
    thematicCluster: 'Spatial Enclosures & Broad Time',
    senses: [
      {
        id: 'vs-in-1',
        wordId: 'vw-in',
        word: 'in',
        senseIndex: 1,
        cefrLevelTarget: 'A1',
        partOfSpeech: 'preposition',
        ipa: '/ɪn/',
        definitionEn: 'Enclosed spaces, containers, 3D areas, cities, and countries.',
        definitionEs: 'Dentro de un espacio cerrado, contenedor, ciudad o país.',
        exampleSentenceEn: 'The keys are in my jacket pocket.',
        exampleSentenceEs: 'Las llaves están dentro del bolsillo de mi chaqueta.',
        collocations: ['in the room', 'in Colombia', 'in the box'],
        notes: 'Regla del cono: "in" representa el nivel más amplio y envolvente.'
      },
      {
        id: 'vs-in-2',
        wordId: 'vw-in',
        word: 'in',
        senseIndex: 2,
        cefrLevelTarget: 'A1',
        partOfSpeech: 'preposition',
        ipa: '/ɪn/',
        definitionEn: 'Broad time periods: months, years, seasons, decades, parts of the day.',
        definitionEs: 'Tiempo amplio: meses, años, estaciones, partes del día (in the morning).',
        exampleSentenceEn: 'The course starts in November.',
        exampleSentenceEs: 'El curso comienza en noviembre.',
        collocations: ['in the morning', 'in 2026', 'in summer'],
        notes: 'Excepción clave: at night (no "in night").'
      }
    ],
    relations: [
      { id: 'vr-in-inside', sourceSenseId: 'vs-in-1', targetSenseId: 'vs-inside-1', targetWord: 'inside', targetDefinitionEs: 'En el interior de', relationType: 'synonym' }
    ]
  },
  {
    id: 'vw-on',
    word: 'on',
    cefrLevel: 'A1',
    partOfSpeech: 'preposition',
    ipa: '/ɒn/',
    category: 'prepositions_in_on_at',
    thematicCluster: 'Surfaces & Specific Days',
    senses: [
      {
        id: 'vs-on-1',
        wordId: 'vw-on',
        word: 'on',
        senseIndex: 1,
        cefrLevelTarget: 'A1',
        partOfSpeech: 'preposition',
        ipa: '/ɒn/',
        definitionEn: 'Position touching a surface, streets, avenues, and public transport with a floor.',
        definitionEs: 'Sobre una superficie con contacto, calles, avenidas y transporte colectivo.',
        exampleSentenceEn: 'Put the documents on the desk.',
        exampleSentenceEs: 'Pon los documentos sobre el escritorio.',
        collocations: ['on the table', 'on the street', 'on the bus'],
        notes: 'En medios donde puedes estar de pie o caminar se usa "on" (on the train, on the plane).'
      },
      {
        id: 'vs-on-2',
        wordId: 'vw-on',
        word: 'on',
        senseIndex: 2,
        cefrLevelTarget: 'A1',
        partOfSpeech: 'preposition',
        ipa: '/ɒn/',
        definitionEn: 'Specific days of the week, dates, and named holidays.',
        definitionEs: 'Días de la semana y fechas específicas del calendario.',
        exampleSentenceEn: 'We have our live class on Wednesday and Friday.',
        exampleSentenceEs: 'Tenemos nuestra clase en vivo los miércoles y viernes.',
        collocations: ['on Monday', 'on October 30th', 'on my birthday'],
        notes: 'Siempre que haya un día involucrado, la preposición es "on".'
      }
    ],
    relations: [
      { id: 'vr-on-upon', sourceSenseId: 'vs-on-1', targetSenseId: 'vs-upon-1', targetWord: 'upon', targetDefinitionEs: 'Encima de (literario)', relationType: 'synonym' }
    ]
  },
  {
    id: 'vw-at',
    word: 'at',
    cefrLevel: 'A1',
    partOfSpeech: 'preposition',
    ipa: '/æt/',
    category: 'prepositions_in_on_at',
    thematicCluster: 'Exact Points & Clock Time',
    senses: [
      {
        id: 'vs-at-1',
        wordId: 'vw-at',
        word: 'at',
        senseIndex: 1,
        cefrLevelTarget: 'A1',
        partOfSpeech: 'preposition',
        ipa: '/æt/',
        definitionEn: 'Exact pinpoint location, addresses with numbers, or functional places.',
        definitionEs: 'Punto exacto en el mapa, dirección con número o lugar funcional.',
        exampleSentenceEn: 'I will meet you at the entrance of the building.',
        exampleSentenceEs: 'Te veré exactamente en la entrada del edificio.',
        collocations: ['at home', 'at work', 'at the airport'],
        notes: 'No denota estar encerrado en 3D sino estar en el punto de encuentro.'
      },
      {
        id: 'vs-at-2',
        wordId: 'vw-at',
        word: 'at',
        senseIndex: 2,
        cefrLevelTarget: 'A1',
        partOfSpeech: 'preposition',
        ipa: '/æt/',
        definitionEn: 'Precise clock time, moments, and specific festivals.',
        definitionEs: 'Hora exacta del reloj y momentos puntuales.',
        exampleSentenceEn: 'The class starts promptly at 11:00 AM.',
        exampleSentenceEs: 'La clase comienza puntualmente a las 11:00 AM.',
        collocations: ['at 11:00 AM', 'at noon', 'at midnight', 'at night'],
        notes: 'Para las horas del reloj se usa estrictamente "at".'
      }
    ],
    relations: [
      { id: 'vr-at-exact', sourceSenseId: 'vs-at-1', targetSenseId: 'vs-exact-1', targetWord: 'by', targetDefinitionEs: 'Junto a / Para tal hora', relationType: 'related' }
    ]
  },

  // ── 3. PREGUNTAS Y CONECTORES: WH-WORDS ───────────────────────────────────
  {
    id: 'vw-where',
    word: 'where',
    cefrLevel: 'A1',
    partOfSpeech: 'interrogative & connector',
    ipa: '/weər/',
    category: 'wh_words',
    thematicCluster: 'Places & Directions',
    senses: [
      {
        id: 'vs-where-1',
        wordId: 'vw-where',
        word: 'where',
        senseIndex: 1,
        cefrLevelTarget: 'A1',
        partOfSpeech: 'interrogative',
        ipa: '/weər/',
        definitionEn: 'Direct question about place or location (preposition stranding at the end).',
        definitionEs: 'Pregunta directa de lugar: ¿Dónde? / ¿Hacia dónde? / ¿De dónde?',
        exampleSentenceEn: 'Where are you from?',
        exampleSentenceEs: '¿De dónde eres? (La preposición from va al final de la pregunta).',
        collocations: ['where do you live', 'where are you from', 'where is'],
        notes: 'Preposition Stranding: la preposición va al final natural de la frase.'
      },
      {
        id: 'vs-where-2',
        wordId: 'vw-where',
        word: 'where',
        senseIndex: 2,
        cefrLevelTarget: 'A1',
        partOfSpeech: 'relative connector',
        ipa: '/weər/',
        definitionEn: 'Affirmative relative connector (el lugar donde / a donde).',
        definitionEs: 'Conector afirmativo (donde / en donde) conservando orden directo sin invertir.',
        exampleSentenceEn: 'I know where they work.',
        exampleSentenceEs: 'Yo sé dónde trabajan ellos (orden directo sujeto + verbo, sin invertir).',
        collocations: ['I know where', 'the place where', 'tell me where'],
        notes: 'En oraciones afirmativas NUNCA se usa "do/did" como auxiliar.'
      }
    ],
    relations: [
      { id: 'vr-where-somewhere', sourceSenseId: 'vs-where-1', targetSenseId: 'vs-somewhere-1', targetWord: 'somewhere', targetDefinitionEs: 'Algún lugar', relationType: 'related' }
    ]
  },
  {
    id: 'vw-what',
    word: 'what',
    cefrLevel: 'A1',
    partOfSpeech: 'interrogative & connector',
    ipa: '/wɒt/',
    category: 'wh_words',
    thematicCluster: 'Things, Purposes & Actions',
    senses: [
      {
        id: 'vs-what-1',
        wordId: 'vw-what',
        word: 'what',
        senseIndex: 1,
        cefrLevelTarget: 'A1',
        partOfSpeech: 'interrogative',
        ipa: '/wɒt/',
        definitionEn: 'Direct question about things, actions, or purposes.',
        definitionEs: 'Pregunta directa sobre objetos, acciones o motivos (¿Qué? / ¿Para qué?).',
        exampleSentenceEn: 'What is this tool for?',
        exampleSentenceEs: '¿Para qué sirve esta herramienta? (preposición for al final).',
        collocations: ['what is', 'what do you mean', 'what is this for'],
        notes: 'What ... for? equivale a "¿Para qué?".'
      },
      {
        id: 'vs-what-2',
        wordId: 'vw-what',
        word: 'what',
        senseIndex: 2,
        cefrLevelTarget: 'A1',
        partOfSpeech: 'relative connector',
        ipa: '/wɒt/',
        definitionEn: 'Affirmative connector meaning "the thing that" / "lo que".',
        definitionEs: 'Conector afirmativo: "lo que / aquello que".',
        exampleSentenceEn: 'This is what we need to focus on today.',
        exampleSentenceEs: 'Esto es en lo que debemos enfocarnos hoy.',
        collocations: ['this is what', 'what I mean', 'what you said'],
        notes: 'Conector fundamental para estructurar argumentos.'
      }
    ],
    relations: [
      { id: 'vr-what-which', sourceSenseId: 'vs-what-1', targetSenseId: 'vs-which-1', targetWord: 'which', targetDefinitionEs: 'Cuál (entre opciones limitadas)', relationType: 'related' }
    ]
  },
  {
    id: 'vw-who',
    word: 'who',
    cefrLevel: 'A1',
    partOfSpeech: 'interrogative & connector',
    ipa: '/huː/',
    category: 'wh_words',
    thematicCluster: 'People & Identities',
    senses: [
      {
        id: 'vs-who-1',
        wordId: 'vw-who',
        word: 'who',
        senseIndex: 1,
        cefrLevelTarget: 'A1',
        partOfSpeech: 'interrogative',
        ipa: '/huː/',
        definitionEn: 'Direct question asking about people.',
        definitionEs: 'Pregunta directa sobre personas: ¿Quién? / ¿Con quién?',
        exampleSentenceEn: 'Who are you talking with on the phone?',
        exampleSentenceEs: '¿Con quién estás hablando por teléfono? (with al final).',
        collocations: ['who is', 'who are you talking with', 'who knows'],
        notes: 'Who ... with? = "¿Con quién?".'
      },
      {
        id: 'vs-who-2',
        wordId: 'vw-who',
        word: 'who',
        senseIndex: 2,
        cefrLevelTarget: 'A2',
        partOfSpeech: 'relative connector',
        ipa: '/huː/',
        definitionEn: 'Relative connector identifying a person (quien / la persona que).',
        definitionEs: 'Conector relativo para personas (la persona que / quien).',
        exampleSentenceEn: 'Santiago is the teacher who guides our English sessions.',
        exampleSentenceEs: 'Santiago es el profesor que guía nuestras sesiones de inglés.',
        collocations: ['the person who', 'anyone who'],
        notes: 'Se refiere exclusivamente a seres humanos.'
      }
    ],
    relations: [
      { id: 'vr-who-someone', sourceSenseId: 'vs-who-1', targetSenseId: 'vs-someone-1', targetWord: 'someone', targetDefinitionEs: 'Alguien', relationType: 'related' }
    ]
  },
  {
    id: 'vw-when',
    word: 'when',
    cefrLevel: 'A1',
    partOfSpeech: 'interrogative & connector',
    ipa: '/wen/',
    category: 'wh_words',
    thematicCluster: 'Moments & Temporal Points',
    senses: [
      {
        id: 'vs-when-1',
        wordId: 'vw-when',
        word: 'when',
        senseIndex: 1,
        cefrLevelTarget: 'A1',
        partOfSpeech: 'interrogative',
        ipa: '/wen/',
        definitionEn: 'Direct question asking about time or moments.',
        definitionEs: 'Pregunta directa de tiempo: ¿Cuándo?',
        exampleSentenceEn: 'When does the next cycle begin?',
        exampleSentenceEs: '¿Cuándo comienza el próximo ciclo?',
        collocations: ['when do you', 'when is the class'],
        notes: 'Requiere auxiliar en preguntas directas.'
      },
      {
        id: 'vs-when-2',
        wordId: 'vw-when',
        word: 'when',
        senseIndex: 2,
        cefrLevelTarget: 'A1',
        partOfSpeech: 'connector',
        ipa: '/wen/',
        definitionEn: 'Temporal connector (cuando ocurra / en el momento en que).',
        definitionEs: 'Conector temporal (cuando pase algo / al momento de).',
        exampleSentenceEn: 'Call me when you finish the review.',
        exampleSentenceEs: 'Llámame cuando termines la revisión.',
        collocations: ['when you are ready', 'when I arrive'],
        notes: 'No lleva "will" después de "when" en cláusulas de tiempo futuro.'
      }
    ],
    relations: [
      { id: 'vr-when-whenever', sourceSenseId: 'vs-when-1', targetSenseId: 'vs-whenever-1', targetWord: 'whenever', targetDefinitionEs: 'Cuando sea / En cualquier momento', relationType: 'related' }
    ]
  },
  {
    id: 'vw-why',
    word: 'why',
    cefrLevel: 'A1',
    partOfSpeech: 'interrogative & connector',
    ipa: '/waɪ/',
    category: 'wh_words',
    thematicCluster: 'Reasons & Motivations',
    senses: [
      {
        id: 'vs-why-1',
        wordId: 'vw-why',
        word: 'why',
        senseIndex: 1,
        cefrLevelTarget: 'A1',
        partOfSpeech: 'interrogative',
        ipa: '/waɪ/',
        definitionEn: 'Direct question asking for reason or purpose (¿Por qué?).',
        definitionEs: 'Pregunta directa de causa o razón: ¿Por qué?',
        exampleSentenceEn: 'Why did you choose LinguaLife?',
        exampleSentenceEs: '¿Por qué elegiste LinguaLife?',
        collocations: ['why do you', 'why did', 'why is'],
        notes: 'Se responde típicamente con "Because" + oración completa.'
      },
      {
        id: 'vs-why-2',
        wordId: 'vw-why',
        word: 'why',
        senseIndex: 2,
        cefrLevelTarget: 'A1',
        partOfSpeech: 'relative connector',
        ipa: '/waɪ/',
        definitionEn: 'Connector explaining the reason why something happens.',
        definitionEs: 'Conector explicativo: "la razón por la cual / por lo que".',
        exampleSentenceEn: 'That is why we practice speaking in every session.',
        exampleSentenceEs: 'Por eso es que practicamos conversación en cada sesión.',
        collocations: ['that is why', 'the reason why'],
        notes: '"That is why" equivale a nuestro "Por eso...".'
      }
    ],
    relations: [
      { id: 'vr-why-because', sourceSenseId: 'vs-why-1', targetSenseId: 'vs-because-1', targetWord: 'because', targetDefinitionEs: 'Porque (respuesta)', relationType: 'related' }
    ]
  },
  {
    id: 'vw-how',
    word: 'how',
    cefrLevel: 'A1',
    partOfSpeech: 'interrogative & connector',
    ipa: '/haʊ/',
    category: 'wh_words',
    thematicCluster: 'Manner, Methods & Measurement',
    senses: [
      {
        id: 'vs-how-1',
        wordId: 'vw-how',
        word: 'how',
        senseIndex: 1,
        cefrLevelTarget: 'A1',
        partOfSpeech: 'interrogative',
        ipa: '/haʊ/',
        definitionEn: 'Direct question asking about manner, method, state, or quantity.',
        definitionEs: 'Pregunta directa sobre modo, método, estado o cantidad (¿Cómo? / ¿Qué tal?).',
        exampleSentenceEn: 'How do you say this in English?',
        exampleSentenceEs: '¿Cómo se dice esto en inglés?',
        collocations: ['how are you', 'how much', 'how many', 'how long'],
        notes: 'Combina con adjetivos para medir (how long, how often, how much).'
      },
      {
        id: 'vs-how-2',
        wordId: 'vw-how',
        word: 'how',
        senseIndex: 2,
        cefrLevelTarget: 'A1',
        partOfSpeech: 'connector',
        ipa: '/haʊ/',
        definitionEn: 'Connector explaining the way something is done (la manera en que).',
        definitionEs: 'Conector de modo: "la manera en que / cómo se hace algo".',
        exampleSentenceEn: 'Let me show you how it works.',
        exampleSentenceEs: 'Déjame mostrarte cómo funciona.',
        collocations: ['show me how', 'how it works'],
        notes: 'No requiere inversión auxiliar en modo afirmativo.'
      }
    ],
    relations: [
      { id: 'vr-how-way', sourceSenseId: 'vs-how-2', targetSenseId: 'vs-way-1', targetWord: 'the way', targetDefinitionEs: 'La forma o modo', relationType: 'synonym' }
    ]
  },
  {
    id: 'vw-which',
    word: 'which',
    cefrLevel: 'A1',
    partOfSpeech: 'interrogative & connector',
    ipa: '/wɪtʃ/',
    category: 'wh_words',
    thematicCluster: 'Options & Selective Choice',
    senses: [
      {
        id: 'vs-which-1',
        wordId: 'vw-which',
        word: 'which',
        senseIndex: 1,
        cefrLevelTarget: 'A1',
        partOfSpeech: 'interrogative',
        ipa: '/wɪtʃ/',
        definitionEn: 'Direct question choosing between a limited, specific set of options.',
        definitionEs: 'Pregunta selectiva entre opciones concretas limitadas: ¿Cuál? / ¿Cuáles?',
        exampleSentenceEn: 'Which option do you prefer: Wednesday or Friday?',
        exampleSentenceEs: '¿Cuál opción prefieres: miércoles o viernes?',
        collocations: ['which one', 'which of these', 'which do you prefer'],
        notes: 'Se usa cuando las alternativas están a la vista (vs. "what" para infinito).'
      },
      {
        id: 'vs-which-2',
        wordId: 'vw-which',
        word: 'which',
        senseIndex: 2,
        cefrLevelTarget: 'A2',
        partOfSpeech: 'relative connector',
        ipa: '/wɪtʃ/',
        definitionEn: 'Relative pronoun referring to things or entire previous clauses (el cual / lo cual).',
        definitionEs: 'Conector relativo para cosas o situaciones previas (lo cual / que).',
        exampleSentenceEn: 'We practice twice a week, which guarantees fast progress.',
        exampleSentenceEs: 'Practicamos dos veces por semana, lo cual garantiza un progreso rápido.',
        collocations: ['which means', 'which is why'],
        notes: 'Precedido por coma para añadir información explicativa.'
      }
    ],
    relations: [
      { id: 'vr-which-what', sourceSenseId: 'vs-which-1', targetSenseId: 'vs-what-1', targetWord: 'what', targetDefinitionEs: 'Qué (opciones ilimitadas)', relationType: 'related' }
    ]
  },

  // ── 4. VOCABULARIO GENERAL CEFR (MODELO EN ESPIRAL POLISÉMICO A1 - C2) ─────
  {
    id: 'vw-run',
    word: 'run',
    cefrLevel: 'A1',
    partOfSpeech: 'verb',
    ipa: '/rʌn/',
    category: 'cefr_general',
    thematicCluster: 'Movement & Management',
    senses: [
      {
        id: 'vs-run-1',
        wordId: 'vw-run',
        word: 'run',
        senseIndex: 1,
        cefrLevelTarget: 'A1',
        partOfSpeech: 'verb',
        ipa: '/rʌn/',
        definitionEn: 'To move fast using your legs, moving faster than walking.',
        definitionEs: 'Correr o desplazarse a gran velocidad con las piernas.',
        exampleSentenceEn: 'The children run in the park every morning.',
        exampleSentenceEs: 'Los niños corren en el parque cada mañana.',
        collocations: ['run fast', 'go for a run']
      },
      {
        id: 'vs-run-2',
        wordId: 'vw-run',
        word: 'run',
        senseIndex: 2,
        cefrLevelTarget: 'A2',
        partOfSpeech: 'verb',
        ipa: '/rʌn/',
        definitionEn: 'To be in charge of, operate, or manage a business or project.',
        definitionEs: 'Administrar, dirigir o gestionar un negocio u operación.',
        exampleSentenceEn: 'She runs a small family restaurant in the city center.',
        exampleSentenceEs: 'Ella administra un pequeño restaurante familiar en el centro.',
        collocations: ['run a business', 'run a company', 'run smoothly']
      }
    ],
    relations: [
      { id: 'vr-run-sprint', sourceSenseId: 'vs-run-1', targetSenseId: 'vs-sprint-1', targetWord: 'sprint', targetDefinitionEs: 'Pique corto a máxima velocidad', relationType: 'synonym' },
      { id: 'vr-run-manage', sourceSenseId: 'vs-run-2', targetSenseId: 'vs-manage-1', targetWord: 'manage', targetDefinitionEs: 'Gestionar o administrar', relationType: 'synonym' },
      { id: 'vr-run-walk', sourceSenseId: 'vs-run-1', targetSenseId: 'vs-walk-1', targetWord: 'walk', targetDefinitionEs: 'Caminar a paso normal', relationType: 'antonym' }
    ]
  },
  {
    id: 'vw-book',
    word: 'book',
    cefrLevel: 'A1',
    partOfSpeech: 'noun / verb',
    ipa: '/bʊk/',
    category: 'cefr_general',
    thematicCluster: 'Education & Reservations',
    senses: [
      {
        id: 'vs-book-1',
        wordId: 'vw-book',
        word: 'book',
        senseIndex: 1,
        cefrLevelTarget: 'A1',
        partOfSpeech: 'noun',
        ipa: '/bʊk/',
        definitionEn: 'A written or printed work consisting of pages bound together.',
        definitionEs: 'Libro físico o digital con páginas y contenido.',
        exampleSentenceEn: 'I am reading an interesting book about habits.',
        exampleSentenceEs: 'Estoy leyendo un libro interesante sobre hábitos.',
        collocations: ['read a book', 'open the book']
      },
      {
        id: 'vs-book-2',
        wordId: 'vw-book',
        word: 'book',
        senseIndex: 2,
        cefrLevelTarget: 'A2',
        partOfSpeech: 'verb',
        ipa: '/bʊk/',
        definitionEn: 'To reserve accommodation, a place, flight, or table in advance.',
        definitionEs: 'Reservar un hotel, vuelo o mesa con anticipación.',
        exampleSentenceEn: 'We should book our flight tickets this week.',
        exampleSentenceEs: 'Deberíamos reservar nuestros tiquetes de vuelo esta semana.',
        collocations: ['book a flight', 'book a room', 'fully booked']
      }
    ],
    relations: [
      { id: 'vr-book-reserve', sourceSenseId: 'vs-book-2', targetSenseId: 'vs-reserve-1', targetWord: 'reserve', targetDefinitionEs: 'Reservar', relationType: 'synonym' },
      { id: 'vr-book-cancel', sourceSenseId: 'vs-book-2', targetSenseId: 'vs-cancel-1', targetWord: 'cancel', targetDefinitionEs: 'Cancelar', relationType: 'antonym' }
    ]
  },
  {
    id: 'vw-right',
    word: 'right',
    cefrLevel: 'A1',
    partOfSpeech: 'adjective / adverb / noun',
    ipa: '/raɪt/',
    category: 'cefr_general',
    thematicCluster: 'Accuracy, Directions & Law',
    senses: [
      {
        id: 'vs-right-1',
        wordId: 'vw-right',
        word: 'right',
        senseIndex: 1,
        cefrLevelTarget: 'A1',
        partOfSpeech: 'adjective',
        ipa: '/raɪt/',
        definitionEn: 'Correct, accurate, or true; not mistaken.',
        definitionEs: 'Correcto, acertado o con la razón.',
        exampleSentenceEn: 'Your answer is completely right, well done!',
        exampleSentenceEs: 'Tu respuesta es completamente correcta, ¡bien hecho!',
        collocations: ['right answer', 'you are right']
      },
      {
        id: 'vs-right-2',
        wordId: 'vw-right',
        word: 'right',
        senseIndex: 2,
        cefrLevelTarget: 'A1',
        partOfSpeech: 'noun / adverb',
        ipa: '/raɪt/',
        definitionEn: 'Opposite of left; direction or side.',
        definitionEs: 'Derecha: dirección o lado opuesto a la izquierda.',
        exampleSentenceEn: 'Turn right at the traffic lights.',
        exampleSentenceEs: 'Gira a la derecha en el semáforo.',
        collocations: ['turn right', 'on the right']
      }
    ],
    relations: [
      { id: 'vr-right-correct', sourceSenseId: 'vs-right-1', targetSenseId: 'vs-correct-1', targetWord: 'correct', targetDefinitionEs: 'Correcto', relationType: 'synonym' },
      { id: 'vr-right-wrong', sourceSenseId: 'vs-right-1', targetSenseId: 'vs-wrong-1', targetWord: 'wrong', targetDefinitionEs: 'Equivocado o erróneo', relationType: 'antonym' },
      { id: 'vr-right-left', sourceSenseId: 'vs-right-2', targetSenseId: 'vs-left-1', targetWord: 'left', targetDefinitionEs: 'Izquierda', relationType: 'antonym' }
    ]
  },
  {
    id: 'vw-light',
    word: 'light',
    cefrLevel: 'A1',
    partOfSpeech: 'noun / adjective',
    ipa: '/laɪt/',
    category: 'cefr_general',
    thematicCluster: 'Illumination & Weight',
    senses: [
      {
        id: 'vs-light-1',
        wordId: 'vw-light',
        word: 'light',
        senseIndex: 1,
        cefrLevelTarget: 'A1',
        partOfSpeech: 'noun',
        ipa: '/laɪt/',
        definitionEn: 'The natural agent that stimulates sight and makes things visible.',
        definitionEs: 'Luz o iluminación que permite ver las cosas.',
        exampleSentenceEn: 'Please turn on the light in the kitchen.',
        exampleSentenceEs: 'Por favor enciende la luz de la cocina.',
        collocations: ['bright light', 'turn on the light']
      },
      {
        id: 'vs-light-2',
        wordId: 'vw-light',
        word: 'light',
        senseIndex: 2,
        cefrLevelTarget: 'A2',
        partOfSpeech: 'adjective',
        ipa: '/laɪt/',
        definitionEn: 'Of little weight; not heavy; easy to lift or carry.',
        definitionEs: 'Ligero, liviano o de poco peso.',
        exampleSentenceEn: 'My backpack is very light today because I have no books.',
        exampleSentenceEs: 'Mi mochila está muy liviana hoy porque no tengo libros.',
        collocations: ['light bag', 'light meal']
      }
    ],
    relations: [
      { id: 'vr-light-dark', sourceSenseId: 'vs-light-1', targetSenseId: 'vs-dark-1', targetWord: 'darkness', targetDefinitionEs: 'Oscuridad', relationType: 'antonym' },
      { id: 'vr-light-heavy', sourceSenseId: 'vs-light-2', targetSenseId: 'vs-heavy-1', targetWord: 'heavy', targetDefinitionEs: 'Pesado o difícil de cargar', relationType: 'antonym' }
    ]
  },
  {
    id: 'vw-kind',
    word: 'kind',
    cefrLevel: 'A1',
    partOfSpeech: 'adjective / noun',
    ipa: '/kaɪnd/',
    category: 'cefr_general',
    thematicCluster: 'Personality & Classification',
    senses: [
      {
        id: 'vs-kind-1',
        wordId: 'vw-kind',
        word: 'kind',
        senseIndex: 1,
        cefrLevelTarget: 'A1',
        partOfSpeech: 'adjective',
        ipa: '/kaɪnd/',
        definitionEn: 'Helpful, friendly, and caring towards other people.',
        definitionEs: 'Amable, cariñoso y considerado con los demás.',
        exampleSentenceEn: 'Thank you for helping me, you are very kind.',
        exampleSentenceEs: 'Gracias por ayudarme, eres muy amable.',
        collocations: ['kind person', 'kind words']
      },
      {
        id: 'vs-kind-2',
        wordId: 'vw-kind',
        word: 'kind',
        senseIndex: 2,
        cefrLevelTarget: 'A2',
        partOfSpeech: 'noun',
        ipa: '/kaɪnd/',
        definitionEn: 'A group with similar characteristics; a type, category, or sort.',
        definitionEs: 'Tipo, clase, especie o variedad de cosas.',
        exampleSentenceEn: 'What kind of music do you like to listen to?',
        exampleSentenceEs: '¿Qué tipo de música te gusta escuchar?',
        collocations: ['all kinds of', 'what kind of']
      }
    ],
    relations: [
      { id: 'vr-kind-friendly', sourceSenseId: 'vs-kind-1', targetSenseId: 'vs-friendly-1', targetWord: 'friendly', targetDefinitionEs: 'Amigable y cordial', relationType: 'synonym' },
      { id: 'vr-kind-cruel', sourceSenseId: 'vs-kind-1', targetSenseId: 'vs-cruel-1', targetWord: 'mean', targetDefinitionEs: 'Malo o antipático', relationType: 'antonym' },
      { id: 'vr-kind-type', sourceSenseId: 'vs-kind-2', targetSenseId: 'vs-type-1', targetWord: 'type', targetDefinitionEs: 'Tipo o categoría', relationType: 'synonym' }
    ]
  },
  {
    id: 'vw-safe',
    word: 'safe',
    cefrLevel: 'A1',
    partOfSpeech: 'adjective / noun',
    ipa: '/seɪf/',
    category: 'cefr_general',
    thematicCluster: 'Security & Objects',
    senses: [
      {
        id: 'vs-safe-1',
        wordId: 'vw-safe',
        word: 'safe',
        senseIndex: 1,
        cefrLevelTarget: 'A1',
        partOfSpeech: 'adjective',
        ipa: '/seɪf/',
        definitionEn: 'Protected from danger, harm, or risk.',
        definitionEs: 'Seguro, protegido o libre de peligro.',
        exampleSentenceEn: 'It is important to feel safe in your neighborhood.',
        exampleSentenceEs: 'Es importante sentirse seguro en tu barrio.',
        collocations: ['safe and sound', 'stay safe']
      },
      {
        id: 'vs-safe-2',
        wordId: 'vw-safe',
        word: 'safe',
        senseIndex: 2,
        cefrLevelTarget: 'A2',
        partOfSpeech: 'noun',
        ipa: '/seɪf/',
        definitionEn: 'A strong lockable metal box or cabinet for storing valuables.',
        definitionEs: 'Caja fuerte metálica de seguridad.',
        exampleSentenceEn: 'The hotel room has a digital safe for your passport.',
        exampleSentenceEs: 'La habitación de hotel tiene una caja fuerte para tu pasaporte.',
        collocations: ['hotel safe', 'lock in the safe']
      }
    ],
    relations: [
      { id: 'vr-safe-secure', sourceSenseId: 'vs-safe-1', targetSenseId: 'vs-secure-1', targetWord: 'secure', targetDefinitionEs: 'Protegido y resguardado', relationType: 'synonym' },
      { id: 'vr-safe-dangerous', sourceSenseId: 'vs-safe-1', targetSenseId: 'vs-dangerous-1', targetWord: 'dangerous', targetDefinitionEs: 'Peligroso o riesgoso', relationType: 'antonym' }
    ]
  },
  {
    id: 'vw-cool',
    word: 'cool',
    cefrLevel: 'A1',
    partOfSpeech: 'adjective',
    ipa: '/kuːl/',
    category: 'cefr_general',
    thematicCluster: 'Weather & Slang',
    senses: [
      {
        id: 'vs-cool-1',
        wordId: 'vw-cool',
        word: 'cool',
        senseIndex: 1,
        cefrLevelTarget: 'A1',
        partOfSpeech: 'adjective',
        ipa: '/kuːl/',
        definitionEn: 'Of or at a fairly low temperature; pleasantly cold.',
        definitionEs: 'Fresco, temperatura agradable y refrescante.',
        exampleSentenceEn: 'A cool breeze came through the window.',
        exampleSentenceEs: 'Una brisa fresca entró por la ventana.',
        collocations: ['cool breeze', 'cool water']
      },
      {
        id: 'vs-cool-2',
        wordId: 'vw-cool',
        word: 'cool',
        senseIndex: 2,
        cefrLevelTarget: 'A2',
        partOfSpeech: 'adjective',
        ipa: '/kuːl/',
        definitionEn: 'Fashionably attractive, stylish, calm, or impressive.',
        definitionEs: 'Genial, chévere, elegante o con estilo.',
        exampleSentenceEn: 'Those sunglasses look really cool on you.',
        exampleSentenceEs: 'Esas gafas de sol se te ven muy geniales.',
        collocations: ['cool jacket', 'keep cool']
      }
    ],
    relations: [
      { id: 'vr-cool-warm', sourceSenseId: 'vs-cool-1', targetSenseId: 'vs-warm-1', targetWord: 'warm', targetDefinitionEs: 'Cálido o tibio', relationType: 'antonym' },
      { id: 'vr-cool-awesome', sourceSenseId: 'vs-cool-2', targetSenseId: 'vs-awesome-1', targetWord: 'awesome', targetDefinitionEs: 'Increíble o fascinante', relationType: 'synonym' }
    ]
  },

  // ── NIVEL A2: EXPANSIÓN COTIDIANA Y LABORAL ────────────────────────────────
  {
    id: 'vw-point',
    word: 'point',
    cefrLevel: 'A2',
    partOfSpeech: 'noun / verb',
    ipa: '/pɔɪnt/',
    category: 'cefr_general',
    thematicCluster: 'Arguments & Direction',
    senses: [
      {
        id: 'vs-point-1',
        wordId: 'vw-point',
        word: 'point',
        senseIndex: 1,
        cefrLevelTarget: 'A2',
        partOfSpeech: 'noun',
        ipa: '/pɔɪnt/',
        definitionEn: 'The main idea, purpose, or essential argument of a discussion.',
        definitionEs: 'El punto clave, propósito o argumento central de una conversación.',
        exampleSentenceEn: 'You made a very good point during the team meeting.',
        exampleSentenceEs: 'planteaste un muy buen punto durante la reunión del equipo.',
        collocations: ['good point', 'get to the point', 'there is no point in'],
        notes: '"There is no point in + ING" significa "No tiene sentido hacer algo".'
      },
      {
        id: 'vs-point-2',
        wordId: 'vw-point',
        word: 'point',
        senseIndex: 2,
        cefrLevelTarget: 'B1',
        partOfSpeech: 'verb',
        ipa: '/pɔɪnt/',
        definitionEn: 'To direct someone’s attention toward something (often with "out").',
        definitionEs: 'Señalar, indicar o hacer notar un detalle o error (point out).',
        exampleSentenceEn: 'The mistake was pointed out immediately by the analyst.',
        exampleSentenceEs: 'El error fue señalado de inmediato por el analista.',
        collocations: ['point out', 'point at', 'point toward']
      }
    ],
    relations: [
      { id: 'vr-point-purpose', sourceSenseId: 'vs-point-1', targetSenseId: 'vs-purpose-1', targetWord: 'purpose', targetDefinitionEs: 'Propósito o sentido', relationType: 'synonym' },
      { id: 'vr-point-highlight', sourceSenseId: 'vs-point-2', targetSenseId: 'vs-highlight-1', targetWord: 'highlight', targetDefinitionEs: 'Resaltar o destacar', relationType: 'synonym' }
    ]
  },
  {
    id: 'vw-mind',
    word: 'mind',
    cefrLevel: 'A2',
    partOfSpeech: 'noun / verb',
    ipa: '/maɪnd/',
    category: 'cefr_general',
    thematicCluster: 'Cognition & Courtesy',
    senses: [
      {
        id: 'vs-mind-1',
        wordId: 'vw-mind',
        word: 'mind',
        senseIndex: 1,
        cefrLevelTarget: 'A2',
        partOfSpeech: 'noun',
        ipa: '/maɪnd/',
        definitionEn: 'The faculty of consciousness, thought, and decision-making.',
        definitionEs: 'La mente, el pensamiento o la opinión.',
        exampleSentenceEn: 'Let me know if you change your mind about the proposal.',
        exampleSentenceEs: 'Avísame si cambias de opinión sobre la propuesta.',
        collocations: ['change your mind', 'keep in mind', 'make up your mind']
      },
      {
        id: 'vs-mind-2',
        wordId: 'vw-mind',
        word: 'mind',
        senseIndex: 2,
        cefrLevelTarget: 'A2',
        partOfSpeech: 'verb',
        ipa: '/maɪnd/',
        definitionEn: 'To feel annoyed, bothered, or object to something.',
        definitionEs: 'Importar, incomodar o molestar (usado en preguntas de cortesía).',
        exampleSentenceEn: 'Would you mind sending me the document again?',
        exampleSentenceEs: '¿Te importaría enviarme el documento de nuevo?',
        collocations: ['would you mind + ING', 'never mind', 'I don\'t mind'],
        notes: 'Después del verbo "mind" SIEMPRE usamos gerundio (-ING): "Would you mind waiting?".'
      }
    ],
    relations: [
      { id: 'vr-mind-care', sourceSenseId: 'vs-mind-2', targetSenseId: 'vs-bother-1', targetWord: 'bother', targetDefinitionEs: 'Incomodar o molestar', relationType: 'synonym' }
    ]
  },

  // ── NIVEL B1: TRANSICIÓN PROFESIONAL Y POLISEMIA FUNCIONAL ─────────────────
  {
    id: 'vw-address',
    word: 'address',
    cefrLevel: 'B1',
    partOfSpeech: 'noun / verb',
    ipa: '/əˈdres/',
    category: 'cefr_general',
    thematicCluster: 'Location & Problem Solving',
    senses: [
      {
        id: 'vs-address-1',
        wordId: 'vw-address',
        word: 'address',
        senseIndex: 1,
        cefrLevelTarget: 'A1',
        partOfSpeech: 'noun',
        ipa: '/ˈædres/',
        definitionEn: 'The details of the place where someone lives or works.',
        definitionEs: 'Dirección física o de correo electrónico.',
        exampleSentenceEn: 'Please confirm your shipping address before Friday.',
        exampleSentenceEs: 'Por favor confirma tu dirección de envío antes del viernes.',
        collocations: ['email address', 'home address']
      },
      {
        id: 'vs-address-2',
        wordId: 'vw-address',
        word: 'address',
        senseIndex: 2,
        cefrLevelTarget: 'B1',
        partOfSpeech: 'verb',
        ipa: '/əˈdres/',
        definitionEn: 'To deal with, tackle, or give attention to a problem or issue.',
        definitionEs: 'Abordar, atender o encargarse de un problema o situación.',
        exampleSentenceEn: 'We need to address the client’s concerns immediately.',
        exampleSentenceEs: 'Necesitamos abordar las inquietudes del cliente de inmediato.',
        collocations: ['address an issue', 'address a problem', 'address concerns'],
        notes: 'Clave en inglés de negocios para reemplazar el básico "talk about a problem".'
      }
    ],
    relations: [
      { id: 'vr-address-tackle', sourceSenseId: 'vs-address-2', targetSenseId: 'vs-tackle-1', targetWord: 'tackle', targetDefinitionEs: 'Enfrentar o abordar un problema', relationType: 'synonym' },
      { id: 'vr-address-ignore', sourceSenseId: 'vs-address-2', targetSenseId: 'vs-ignore-1', targetWord: 'ignore', targetDefinitionEs: 'Ignorar o pasar por alto', relationType: 'antonym' }
    ]
  },
  {
    id: 'vw-issue',
    word: 'issue',
    cefrLevel: 'B1',
    partOfSpeech: 'noun / verb',
    ipa: '/ˈɪʃuː/',
    category: 'cefr_general',
    thematicCluster: 'Business & Operations',
    senses: [
      {
        id: 'vs-issue-1',
        wordId: 'vw-issue',
        word: 'issue',
        senseIndex: 1,
        cefrLevelTarget: 'B1',
        partOfSpeech: 'noun',
        ipa: '/ˈɪʃuː/',
        definitionEn: 'An important topic for debate, or a delicate problem/difficulty.',
        definitionEs: 'Asunto importante, inconveniente técnico o tema delicado.',
        exampleSentenceEn: 'The technical issue is currently being sorted out.',
        exampleSentenceEs: 'El inconveniente técnico ya está siendo solucionado.',
        collocations: ['sort out an issue', 'raise an issue', 'key issue'],
        notes: 'Suena mucho más diplomático y profesional que decir "problem".'
      },
      {
        id: 'vs-issue-2',
        wordId: 'vw-issue',
        word: 'issue',
        senseIndex: 2,
        cefrLevelTarget: 'B2',
        partOfSpeech: 'verb',
        ipa: '/ˈɪʃuː/',
        definitionEn: 'To officially supply, emit, or distribute a document, refund, or statement.',
        definitionEs: 'Emitir o expedir oficialmente (una factura, reembolso, comunicado o pasaporte).',
        exampleSentenceEn: 'The finance department will issue a full refund tomorrow.',
        exampleSentenceEs: 'El departamento de finanzas emitirá un reembolso completo mañana.',
        collocations: ['issue a refund', 'issue an invoice', 'issue a statement']
      }
    ],
    relations: [
      { id: 'vr-issue-matter', sourceSenseId: 'vs-issue-1', targetSenseId: 'vs-matter-1', targetWord: 'matter', targetDefinitionEs: 'Asunto o cuestión', relationType: 'synonym' },
      { id: 'vr-issue-emit', sourceSenseId: 'vs-issue-2', targetSenseId: 'vs-emit-1', targetWord: 'grant', targetDefinitionEs: 'Otorgar o expedir', relationType: 'synonym' }
    ]
  },
  {
    id: 'vw-figure',
    word: 'figure',
    cefrLevel: 'B1',
    partOfSpeech: 'noun / phrasal verb',
    ipa: '/ˈfɪɡjər/',
    category: 'cefr_general',
    thematicCluster: 'Metrics & Deduction',
    senses: [
      {
        id: 'vs-figure-1',
        wordId: 'vw-figure',
        word: 'figure',
        senseIndex: 1,
        cefrLevelTarget: 'B1',
        partOfSpeech: 'noun',
        ipa: '/ˈfɪɡjər/',
        definitionEn: 'A number, especially an official statistic or financial amount.',
        definitionEs: 'Cifra, dato numérico o estadística financiera.',
        exampleSentenceEn: 'The sales figures for this quarter exceeded our expectations.',
        exampleSentenceEs: 'Las cifras de ventas de este trimestre superaron nuestras expectativas.',
        collocations: ['sales figures', 'six-figure salary', 'official figures']
      },
      {
        id: 'vs-figure-2',
        wordId: 'vw-figure',
        word: 'figure',
        senseIndex: 2,
        cefrLevelTarget: 'B1',
        partOfSpeech: 'phrasal verb',
        ipa: '/ˈfɪɡjər/',
        definitionEn: 'To understand, solve, or find the answer to something (figure out).',
        definitionEs: 'Descifrar, entender o encontrarle la vuelta a un problema (figure out).',
        exampleSentenceEn: 'We need to figure out why the server crashed.',
        exampleSentenceEs: 'Necesitamos descifrar por qué se cayó el servidor.',
        collocations: ['figure out how', 'figure it out']
      }
    ],
    relations: [
      { id: 'vr-figure-solve', sourceSenseId: 'vs-figure-2', targetSenseId: 'vs-solve-1', targetWord: 'work out', targetDefinitionEs: 'Resolver o deducir', relationType: 'synonym' }
    ]
  },
  {
    id: 'vw-board',
    word: 'board',
    cefrLevel: 'B1',
    partOfSpeech: 'noun / verb',
    ipa: '/bɔːrd/',
    category: 'cefr_general',
    thematicCluster: 'Travel & Corporate Governance',
    senses: [
      {
        id: 'vs-board-1',
        wordId: 'vw-board',
        word: 'board',
        senseIndex: 1,
        cefrLevelTarget: 'B1',
        partOfSpeech: 'verb',
        ipa: '/bɔːrd/',
        definitionEn: 'To get on or enter a plane, ship, or train.',
        definitionEs: 'Abordar o embarcar en un avión, tren o barco.',
        exampleSentenceEn: 'Passengers are now invited to board the flight at Gate 12.',
        exampleSentenceEs: 'Se invita a los pasajeros a abordar el vuelo en la Puerta 12.',
        collocations: ['board a flight', 'boarding pass', 'on board']
      },
      {
        id: 'vs-board-2',
        wordId: 'vw-board',
        word: 'board',
        senseIndex: 2,
        cefrLevelTarget: 'B2',
        partOfSpeech: 'noun',
        ipa: '/bɔːrd/',
        definitionEn: 'The group of people who control and direct a company (Board of Directors).',
        definitionEs: 'Junta directiva o consejo de administración de una empresa.',
        exampleSentenceEn: 'The proposal was approved by the board of directors.',
        exampleSentenceEs: 'La propuesta fue aprobada por la junta directiva.',
        collocations: ['board of directors', 'across the board', 'on board with the idea']
      }
    ],
    relations: [
      { id: 'vr-board-committee', sourceSenseId: 'vs-board-2', targetSenseId: 'vs-committee-1', targetWord: 'committee', targetDefinitionEs: 'Comité o consejo', relationType: 'synonym' }
    ]
  },

  // ── NIVEL B2: INGLÉS CORPORATIVO Y FLUIDEZ EJECUTIVA ───────────────────────
  {
    id: 'vw-drive',
    word: 'drive',
    cefrLevel: 'B2',
    partOfSpeech: 'verb / noun',
    ipa: '/draɪv/',
    category: 'cefr_general',
    thematicCluster: 'Leadership & Momentum',
    senses: [
      {
        id: 'vs-drive-1',
        wordId: 'vw-drive',
        word: 'drive',
        senseIndex: 1,
        cefrLevelTarget: 'A1',
        partOfSpeech: 'verb',
        ipa: '/draɪv/',
        definitionEn: 'To operate and control the direction and speed of a motor vehicle.',
        definitionEs: 'Conducir o manejar un vehículo.',
        exampleSentenceEn: 'He drives to the office every Wednesday.',
        exampleSentenceEs: 'Él conduce a la oficina todos los miércoles.',
        collocations: ['drive a car', 'drive home']
      },
      {
        id: 'vs-drive-2',
        wordId: 'vw-drive',
        word: 'drive',
        senseIndex: 2,
        cefrLevelTarget: 'B2',
        partOfSpeech: 'verb / noun',
        ipa: '/draɪv/',
        definitionEn: 'To propel, motivate, or cause a process/metric to grow; strong inner determination.',
        definitionEs: 'Impulsar resultados o crecimiento; empuje y determinación personal.',
        exampleSentenceEn: 'Innovation is what drives our company’s long-term growth.',
        exampleSentenceEs: 'La innovación es lo que impulsa el crecimiento a largo plazo de nuestra empresa.',
        collocations: ['drive growth', 'drive results', 'strong drive to succeed']
      }
    ],
    relations: [
      { id: 'vr-drive-propel', sourceSenseId: 'vs-drive-2', targetSenseId: 'vs-propel-1', targetWord: 'fuel', targetDefinitionEs: 'Impulsar o alimentar', relationType: 'synonym' }
    ]
  },
  {
    id: 'vw-account',
    word: 'account',
    cefrLevel: 'B2',
    partOfSpeech: 'noun / phrasal verb',
    ipa: '/əˈkaʊnt/',
    category: 'cefr_general',
    thematicCluster: 'Finance & Explanation',
    senses: [
      {
        id: 'vs-account-1',
        wordId: 'vw-account',
        word: 'account',
        senseIndex: 1,
        cefrLevelTarget: 'B1',
        partOfSpeech: 'noun',
        ipa: '/əˈkaʊnt/',
        definitionEn: 'An arrangement with a bank or platform; or a detailed report/description of an event.',
        definitionEs: 'Cuenta bancaria/digital; o bien un relato/versión detallada de un hecho.',
        exampleSentenceEn: 'She gave an accurate account of what happened in the negotiation.',
        exampleSentenceEs: 'Ella dio un relato preciso de lo que ocurrió en la negociación.',
        collocations: ['bank account', 'take into account', 'on account of']
      },
      {
        id: 'vs-account-2',
        wordId: 'vw-account',
        word: 'account',
        senseIndex: 2,
        cefrLevelTarget: 'B2',
        partOfSpeech: 'phrasal verb',
        ipa: '/əˈkaʊnt/',
        definitionEn: 'To form a specific proportion/percentage of a total, or to explain the reason for something (account for).',
        definitionEs: 'Representar un porcentaje del total, o justificar/explicar la causa de algo (account for).',
        exampleSentenceEn: 'Remote clients account for 65% of our annual revenue.',
        exampleSentenceEs: 'Los clientes remotos representan el 65% de nuestros ingresos anuales.',
        collocations: ['account for', 'hold someone accountable'],
        notes: 'Esencial para gráficos, reportes ejecutivos y el examen TOEFL.'
      }
    ],
    relations: [
      { id: 'vr-account-represent', sourceSenseId: 'vs-account-2', targetSenseId: 'vs-represent-1', targetWord: 'Make up', targetDefinitionEs: 'Constituir o representar una parte', relationType: 'synonym' }
    ]
  },
  {
    id: 'vw-ground',
    word: 'ground',
    cefrLevel: 'B2',
    partOfSpeech: 'noun / verb',
    ipa: '/ɡraʊnd/',
    category: 'cefr_general',
    thematicCluster: 'Foundation & Justification',
    senses: [
      {
        id: 'vs-ground-1',
        wordId: 'vw-ground',
        word: 'ground',
        senseIndex: 1,
        cefrLevelTarget: 'A2',
        partOfSpeech: 'noun',
        ipa: '/ɡraʊnd/',
        definitionEn: 'The solid surface of the earth.',
        definitionEs: 'El suelo o la tierra firme.',
        exampleSentenceEn: 'The autumn leaves fell softly to the ground.',
        exampleSentenceEs: 'Las hojas de otoño cayeron suavemente al suelo.',
        collocations: ['on the ground', 'from the ground up']
      },
      {
        id: 'vs-ground-2',
        wordId: 'vw-ground',
        word: 'ground',
        senseIndex: 2,
        cefrLevelTarget: 'B2',
        partOfSpeech: 'noun (often plural: grounds)',
        ipa: '/ɡraʊnd/',
        definitionEn: 'Solid reasons, basis, or justification for a belief, action, or legal decision.',
        definitionEs: 'Fundamento, base sólida, motivo justificado o terreno común.',
        exampleSentenceEn: 'We finally found common ground during the contract negotiation.',
        exampleSentenceEs: 'Finalmente encontramos un punto en común durante la negociación del contrato.',
        collocations: ['common ground', 'on the grounds that', 'gain ground']
      }
    ],
    relations: [
      { id: 'vr-ground-basis', sourceSenseId: 'vs-ground-2', targetSenseId: 'vs-basis-1', targetWord: 'foundation', targetDefinitionEs: 'Base o fundamento', relationType: 'synonym' }
    ]
  },

  // ── NIVEL C1: DOMINIO EJECUTIVO, DIPLOMACIA Y TOEFL ────────────────────────
  {
    id: 'vw-yield',
    word: 'yield',
    cefrLevel: 'C1',
    partOfSpeech: 'verb / noun',
    ipa: '/jiːld/',
    category: 'cefr_general',
    thematicCluster: 'Returns & Negotiation',
    senses: [
      {
        id: 'vs-yield-1',
        wordId: 'vw-yield',
        word: 'yield',
        senseIndex: 1,
        cefrLevelTarget: 'C1',
        partOfSpeech: 'verb / noun',
        ipa: '/jiːld/',
        definitionEn: 'To produce or provide a positive result, profit, or data output.',
        definitionEs: 'Producir, arrojar resultados o generar un rendimiento financiero.',
        exampleSentenceEn: 'The new marketing strategy yielded impressive results in the first month.',
        exampleSentenceEs: 'La nueva estrategia de marketing arrojó resultados impresionantes en el primer mes.',
        collocations: ['yield results', 'high-yield investment']
      },
      {
        id: 'vs-yield-2',
        wordId: 'vw-yield',
        word: 'yield',
        senseIndex: 2,
        cefrLevelTarget: 'C1',
        partOfSpeech: 'verb',
        ipa: '/jiːld/',
        definitionEn: 'To give way to arguments, pressure, or traffic; to surrender control.',
        definitionEs: 'Ceder el paso o ceder ante la presión en una negociación.',
        exampleSentenceEn: 'Neither side was willing to yield during the boardroom debate.',
        exampleSentenceEs: 'Ninguna de las partes estuvo dispuesta a ceder durante el debate de junta.',
        collocations: ['yield to pressure', 'yield the floor']
      }
    ],
    relations: [
      { id: 'vr-yield-produce', sourceSenseId: 'vs-yield-1', targetSenseId: 'vs-produce-1', targetWord: 'generate', targetDefinitionEs: 'Generar o producir', relationType: 'synonym' },
      { id: 'vr-yield-relent', sourceSenseId: 'vs-yield-2', targetSenseId: 'vs-relent-1', targetWord: 'give in', targetDefinitionEs: 'Ceder', relationType: 'synonym' }
    ]
  },
  {
    id: 'vw-leverage',
    word: 'leverage',
    cefrLevel: 'C1',
    partOfSpeech: 'noun / verb',
    ipa: '/ˈlevərɪdʒ/',
    category: 'cefr_general',
    thematicCluster: 'Strategy & Influence',
    senses: [
      {
        id: 'vs-leverage-1',
        wordId: 'vw-leverage',
        word: 'leverage',
        senseIndex: 1,
        cefrLevelTarget: 'C1',
        partOfSpeech: 'verb',
        ipa: '/ˈlevərɪdʒ/',
        definitionEn: 'To use an existing resource, technology, or advantage to maximum effect.',
        definitionEs: 'Apalancar, aprovechar estratégicamente un recurso o ventaja al máximo.',
        exampleSentenceEn: 'We must leverage artificial intelligence to automate repetitive tasks.',
        exampleSentenceEs: 'Debemos aprovechar estratégicamente la IA para automatizar tareas repetitivas.',
        collocations: ['leverage technology', 'leverage our network']
      },
      {
        id: 'vs-leverage-2',
        wordId: 'vw-leverage',
        word: 'leverage',
        senseIndex: 2,
        cefrLevelTarget: 'C1',
        partOfSpeech: 'noun',
        ipa: '/ˈlevərɪdʒ/',
        definitionEn: 'Power or strategic advantage to influence people and get results in a negotiation.',
        definitionEs: 'Poder de negociación, ventaja estratégica o influencia.',
        exampleSentenceEn: 'Having two competing offers gives you strong leverage in salary talks.',
        exampleSentenceEs: 'Tener dos ofertas competidoras te da un fuerte poder de negociación salarial.',
        collocations: ['bargaining leverage', 'gain leverage']
      }
    ],
    relations: [
      { id: 'vr-leverage-harness', sourceSenseId: 'vs-leverage-1', targetSenseId: 'vs-harness-1', targetWord: 'capitalize on', targetDefinitionEs: 'Capitalizar o sacar partido', relationType: 'synonym' }
    ]
  },
  {
    id: 'vw-sound',
    word: 'sound',
    cefrLevel: 'C1',
    partOfSpeech: 'noun / verb / adjective',
    ipa: '/saʊnd/',
    category: 'cefr_general',
    thematicCluster: 'Perception & Judgment',
    senses: [
      {
        id: 'vs-sound-1',
        wordId: 'vw-sound',
        word: 'sound',
        senseIndex: 1,
        cefrLevelTarget: 'A2',
        partOfSpeech: 'noun / verb',
        ipa: '/saʊnd/',
        definitionEn: 'Vibrations that travel through the air and can be heard; to convey an impression.',
        definitionEs: 'Sonido; o sonar de cierta manera ("That sounds great").',
        exampleSentenceEn: 'Your proposal sounds very promising.',
        exampleSentenceEs: 'Tu propuesta suena muy prometedora.',
        collocations: ['sounds good', 'sound like']
      },
      {
        id: 'vs-sound-2',
        wordId: 'vw-sound',
        word: 'sound',
        senseIndex: 2,
        cefrLevelTarget: 'C1',
        partOfSpeech: 'adjective',
        ipa: '/saʊnd/',
        definitionEn: 'Financially solid, logically reliable, sensible, and well-founded.',
        definitionEs: 'Sólido, sensato, bien fundamentado o financieramente estable.',
        exampleSentenceEn: 'She always provides sound financial advice to the executive committee.',
        exampleSentenceEs: 'Ella siempre brinda asesoría financiera sólida y sensata al comité ejecutivo.',
        collocations: ['sound advice', 'sound judgment', 'financially sound'],
        notes: 'Trampa clásica C1: "sound advice" NO es "consejo ruidoso", sino "consejo sensato/sólido".'
      }
    ],
    relations: [
      { id: 'vr-sound-solid', sourceSenseId: 'vs-sound-2', targetSenseId: 'vs-solid-1', targetWord: 'reliable', targetDefinitionEs: 'Confiable y sólido', relationType: 'synonym' },
      { id: 'vr-sound-flawed', sourceSenseId: 'vs-sound-2', targetSenseId: 'vs-flawed-1', targetWord: 'flawed', targetDefinitionEs: 'Defectuoso o mal fundamentado', relationType: 'antonym' }
    ]
  },

  // ── NIVEL C2: MAESTRÍA NATIVA Y MATICES ACADÉMICOS / LITERARIOS ────────────
  {
    id: 'vw-harbor',
    word: 'harbor',
    cefrLevel: 'C2',
    partOfSpeech: 'noun / verb',
    ipa: '/ˈhɑːrbər/',
    category: 'cefr_general',
    thematicCluster: 'Maritime & Psychology',
    senses: [
      {
        id: 'vs-harbor-1',
        wordId: 'vw-harbor',
        word: 'harbor',
        senseIndex: 1,
        cefrLevelTarget: 'B1',
        partOfSpeech: 'noun',
        ipa: '/ˈhɑːrbər/',
        definitionEn: 'A sheltered port on the coast where ships can moor safely.',
        definitionEs: 'Puerto marítimo o bahía resguardada para embarcaciones.',
        exampleSentenceEn: 'Several boats were anchored in the quiet harbor.',
        exampleSentenceEs: 'Varios barcos estaban anclados en el tranquilo puerto.',
        collocations: ['safe harbor', 'pearl harbor']
      },
      {
        id: 'vs-harbor-2',
        wordId: 'vw-harbor',
        word: 'harbor',
        senseIndex: 2,
        cefrLevelTarget: 'C2',
        partOfSpeech: 'verb',
        ipa: '/ˈhɑːrbər/',
        definitionEn: 'To keep a thought, doubt, grudge, or secret emotion in one’s mind over a long period.',
        definitionEs: 'Albergar o guardar en secreto un pensamiento, duda, sospecha o resentimiento.',
        exampleSentenceEn: 'Despite the agreement, several investors still harbor doubts about the merger.',
        exampleSentenceEs: 'A pesar del acuerdo, varios inversionistas aún albergan dudas sobre la fusión.',
        collocations: ['harbor doubts', 'harbor resentment', 'harbor illusions']
      }
    ],
    relations: [
      { id: 'vr-harbor-foster', sourceSenseId: 'vs-harbor-2', targetSenseId: 'vs-foster-1', targetWord: 'hold onto', targetDefinitionEs: 'Mantener o guardar internamente', relationType: 'synonym' }
    ]
  },
  {
    id: 'vw-weather',
    word: 'weather',
    cefrLevel: 'C2',
    partOfSpeech: 'noun / verb',
    ipa: '/ˈweðər/',
    category: 'cefr_general',
    thematicCluster: 'Climate & Resilience',
    senses: [
      {
        id: 'vs-weather-1',
        wordId: 'vw-weather',
        word: 'weather',
        senseIndex: 1,
        cefrLevelTarget: 'A1',
        partOfSpeech: 'noun',
        ipa: '/ˈweðər/',
        definitionEn: 'The state of the atmosphere with respect to heat, cold, wind, or rain.',
        definitionEs: 'El clima o estado atmosférico.',
        exampleSentenceEn: 'The weather in Medellín is pleasant all year round.',
        exampleSentenceEs: 'El clima en Medellín es agradable todo el año.',
        collocations: ['cold weather', 'under the weather']
      },
      {
        id: 'vs-weather-2',
        wordId: 'vw-weather',
        word: 'weather',
        senseIndex: 2,
        cefrLevelTarget: 'C2',
        partOfSpeech: 'verb',
        ipa: '/ˈweðər/',
        definitionEn: 'To come safely through a crisis, recession, or difficult period.',
        definitionEs: 'Capear el temporal, resistir o superar con éxito una crisis difícil.',
        exampleSentenceEn: 'Thanks to its cash reserves, the startup weathered the economic downturn.',
        exampleSentenceEs: 'Gracias a sus reservas de caja, la startup logró sortear la recesión económica.',
        collocations: ['weather the storm', 'weather a crisis']
      }
    ],
    relations: [
      { id: 'vr-weather-withstand', sourceSenseId: 'vs-weather-2', targetSenseId: 'vs-withstand-1', targetWord: 'withstand', targetDefinitionEs: 'Resistir o soportar con éxito', relationType: 'synonym' }
    ]
  },
  {
    id: 'vw-stem',
    word: 'stem',
    cefrLevel: 'C2',
    partOfSpeech: 'noun / verb',
    ipa: '/stem/',
    category: 'cefr_general',
    thematicCluster: 'Causality & Control',
    senses: [
      {
        id: 'vs-stem-1',
        wordId: 'vw-stem',
        word: 'stem',
        senseIndex: 1,
        cefrLevelTarget: 'C1',
        partOfSpeech: 'phrasal verb (stem from)',
        ipa: '/stem/',
        definitionEn: 'To originate in or be caused by something (stem from).',
        definitionEs: 'Originarse en, derivarse de o tener su raíz en algo (stem from).',
        exampleSentenceEn: 'Most communication errors stem from translating literally from Spanish.',
        exampleSentenceEs: 'La mayoría de los errores de comunicación se derivan de traducir literalmente del español.',
        collocations: ['stem from', 'root and stem']
      },
      {
        id: 'vs-stem-2',
        wordId: 'vw-stem',
        word: 'stem',
        senseIndex: 2,
        cefrLevelTarget: 'C2',
        partOfSpeech: 'verb',
        ipa: '/stem/',
        definitionEn: 'To stop, restrict, or contain the flow or spread of something undesirable.',
        definitionEs: 'Frenar, contener o detener el avance de una tendencia negativa.',
        exampleSentenceEn: 'The central bank raised interest rates to stem inflation.',
        exampleSentenceEs: 'El banco central subió las tasas de interés para contener la inflación.',
        collocations: ['stem the tide', 'stem the flow', 'stem inflation']
      }
    ],
    relations: [
      { id: 'vr-stem-curb', sourceSenseId: 'vs-stem-2', targetSenseId: 'vs-curb-1', targetWord: 'curb', targetDefinitionEs: 'Frenar o contener', relationType: 'synonym' }
    ]
  }
];

// -----------------------------------------------------------------------------
// LOCAL STATE STORAGE & HELPERS
// -----------------------------------------------------------------------------

const STORAGE_KEY = 'lingualife_student_vocab_state_v2';

export function getLocalStudentState(): Record<string, TriageStatus> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

export function saveLocalStudentWordState(senseId: string, status: TriageStatus) {
  if (typeof window === 'undefined') return;
  try {
    const current = getLocalStudentState();
    current[senseId] = status;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch (e) {
    console.error('Error saving local vocab state', e);
  }
}

// Compatibilidad con código anterior que llamaba PILOT_VOCABULARY_DATA
export const PILOT_VOCABULARY_DATA: VocabularyWordItem[] = VOCABULARY_MASTER_DATA;

// Filtrado principal por categoría (conservando todas las acepciones polisémicas de cada palabra)
export function getVocabularyByCategory(
  category: VocabCategory,
  level: CefrLevel = 'A1',
  includePreviousPending: boolean = false
): VocabularyWordItem[] {
  const localStates = getLocalStudentState();
  const levelOrder: CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const currentIndex = levelOrder.indexOf(level);

  return VOCABULARY_MASTER_DATA.filter(item => {
    if (item.category !== category) return false;
    if (category !== 'cefr_general') return true;

    // Para cefr_general, incluir palabras cuyo nivel principal o alguna de sus acepciones coincida con el nivel seleccionado
    const matchesCurrentLevel = item.cefrLevel === level || item.senses.some(s => s.cefrLevelTarget === level);
    if (matchesCurrentLevel) return true;

    if (includePreviousPending) {
      const itemLevelIdx = levelOrder.indexOf(item.cefrLevel);
      if (itemLevelIdx < currentIndex) {
        const primarySense = item.senses[0];
        const state = (primarySense && localStates[primarySense.id]) || 'unreviewed';
        return state === 'to_learn' || state === 'passive' || state === 'unreviewed';
      }
    }
    return false;
  }).map(item => {
    const primarySense = item.senses[0];
    const triageStatus = (localStates[primarySense?.id] as TriageStatus) || 'unreviewed';

    return {
      ...item,
      // Mantenemos todas las acepciones de la palabra para que el Resumen y la Trivia muestren el contraste polisémico completo
      senses: item.senses,
      triageStatus
    };
  });
}

export function getVocabularyForLevel(
  level: CefrLevel,
  includePreviousPending: boolean = false
): VocabularyWordItem[] {
  return getVocabularyByCategory('cefr_general', level, includePreviousPending);
}

// -----------------------------------------------------------------------------
// CONTENIDO CURADO PARA LOS 4 MODOS DE ESTUDIO DE CADA CATEGORÍA
// -----------------------------------------------------------------------------

export interface VocabShortReading {
  title: string;
  storyEn: string;
  storyEs: string;
  wordCount: number;
  highlightWords: string[];
  comprehensionQuestion: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export const VOCAB_SHORT_READINGS: Record<VocabCategory, VocabShortReading> = {
  time_words: {
    title: 'The Blueprint of Tomorrow',
    storyEn: 'I can see the opportunity ahead. When we began, I could only imagine this moment. Tomorrow, we will present our findings. Would you join our team? You should believe in your skills because you must lead this transition. Santiago said we might expand next quarter, and we shall succeed together.',
    storyEs: 'Puedo ver la oportunidad adelante. Cuando comenzamos, solo podía imaginar este momento. Mañana presentaremos nuestros hallazgos. ¿Te unirías a nuestro equipo? Deberías creer en tus habilidades porque debes liderar esta transición. Santiago dijo que quizás nos expandamos el próximo trimestre, y triunfaremos juntos.',
    wordCount: 56,
    highlightWords: ['can', 'could', 'will', 'would', 'should', 'must', 'might', 'shall'],
    comprehensionQuestion: {
      question: 'Which Time Word expresses the speaker\'s recommendation to trust in skills?',
      options: ['will', 'should', 'could', 'must'],
      correctIndex: 1,
      explanation: '"Should" se utiliza para dar recomendaciones o consejos amistosos.'
    }
  },
  prepositions_in_on_at: {
    title: 'A Friday at 11:00 AM',
    storyEn: 'Mónica and Camila study in Colombia. On Wednesday and on Friday, they meet at 11:00 AM for their live session. Their notebooks are on the table, and all their goals are in their minds. Santiago waits for them at the digital room, ready to explore what they are looking for.',
    storyEs: 'Mónica y Camila estudian en Colombia. El miércoles y el viernes se reúnen a las 11:00 AM para su sesión en vivo. Sus cuadernos están sobre la mesa y todos sus objetivos están en sus mentes. Santiago las espera en la sala digital, listo para explorar lo que están buscando.',
    wordCount: 52,
    highlightWords: ['in', 'on', 'at'],
    comprehensionQuestion: {
      question: 'Why does the text use "on" before Wednesday and Friday?',
      options: [
        'Because they are exact clock times',
        'Because "on" is strictly required before specific days of the week',
        'Because they are enclosed 3D spaces',
        'Because it indicates direction'
      ],
      correctIndex: 1,
      explanation: 'La regla inviolable indica que todos los días de la semana van precedidos por la preposición "on".'
    }
  },
  wh_words: {
    title: 'The Natural Curiosity',
    storyEn: 'Where are you from, and what are you looking for? That is why we ask questions. Who is the person you want to become? When you understand how English operates from the inside, you discover which path leads to true fluency. Tell me what you think, and I will show you where to begin.',
    storyEs: '¿De dónde eres y qué estás buscando? Por eso es que hacemos preguntas. ¿Quién es la persona en la que te quieres convertir? Cuando entiendes cómo opera el inglés desde adentro, descubres qué camino conduce a la verdadera fluidez. Dime qué piensas y te mostraré por dónde empezar.',
    wordCount: 61,
    highlightWords: ['where', 'what', 'why', 'who', 'when', 'how', 'which'],
    comprehensionQuestion: {
      question: 'In the question "Where are you from?", where is the preposition placed?',
      options: [
        'At the very beginning before where',
        'Directly before the subject you',
        'At the end of the sentence (Preposition Stranding)',
        'It is omitted entirely'
      ],
      correctIndex: 2,
      explanation: 'En inglés comunicativo natural, la preposición va al final de la pregunta ("Preposition Stranding").'
    }
  },
  cefr_general: {
    title: 'The Rhythm of the City',
    storyEn: 'She runs a vibrant bookstore in the historical district. Every morning, customers book their favorite tables by the window. The natural light fills the space with a warm glow. A kind barista offers a cool lemonade. Here, every visitor feels safe and inspired.',
    storyEs: 'Ella administra una vibrante librería en el distrito histórico. Cada mañana, los clientes reservan sus mesas favoritas junto a la ventana. La luz natural llena el espacio con un brillo cálido. Un amable barista ofrece una limonada fresca. Aquí, cada visitante se siente seguro e inspirado.',
    wordCount: 51,
    highlightWords: ['runs', 'book', 'light', 'kind', 'cool', 'safe'],
    comprehensionQuestion: {
      question: 'What is the meaning of "runs" in the sentence "She runs a vibrant bookstore"?',
      options: [
        'To sprint physically with legs',
        'To operate, manage, or direct a business',
        'To pour liquid into a cup',
        'To read a book quickly'
      ],
      correctIndex: 1,
      explanation: 'En su segunda acepción A2, "run" significa administrar, operar o gestionar un negocio.'
    }
  }
};

// -----------------------------------------------------------------------------
// GIMNASIO MENTAL DE 15 EJERCICIOS PARA CADA CATEGORÍA
// -----------------------------------------------------------------------------

export interface VocabMentalGymExercise {
  id: number;
  type: 'fill' | 'trap' | 'reverse';
  instruction: string;
  promptText: string;
  hint: string;
  solution: string;
  explanation: string;
}

export const VOCAB_MENTAL_GYM: Record<VocabCategory, VocabMentalGymExercise[]> = {
  time_words: [
    { id: 1, type: 'fill', instruction: 'Completa con el modal de habilidad presente adecuado:', promptText: 'I [___] understand English when people speak clearly.', hint: 'Habilidad presente', solution: 'can', explanation: 'Se utiliza "can" para habilidad en presente.' },
    { id: 2, type: 'fill', instruction: 'Completa con el modal de futuro certero:', promptText: 'We [___] send the summary right after the class.', hint: 'Futuro certero', solution: 'will', explanation: '"Will" marca decisión y certeza futura.' },
    { id: 3, type: 'fill', instruction: 'Completa con la forma condicional de cortesía:', promptText: 'She [___] love to join our conversation club.', hint: 'Condicional (-ría)', solution: 'would', explanation: '"Would" añade la terminación -ría a la acción.' },
    { id: 4, type: 'fill', instruction: 'Completa con el modal de consejo o recomendación:', promptText: 'You [___] review the flashcards before sleeping.', hint: 'Consejo / sugerencia', solution: 'should', explanation: '"Should" expresa recomendación constructiva.' },
    { id: 5, type: 'fill', instruction: 'Completa con el modal de necesidad u obligación lógica:', promptText: 'We [___] arrive on time for the live session.', hint: 'Obligación', solution: 'must', explanation: '"Must" denota obligación o necesidad inaplazable.' },
    { id: 6, type: 'trap', instruction: 'Detecta y corrige el error común de hispanohablantes:', promptText: 'Incorrecto: "I can to speak English."', hint: 'Sin "to" tras modales', solution: 'I can speak English', explanation: 'Los verbos modales se conectan directamente con la forma base del verbo, NUNCA llevan "to".' },
    { id: 7, type: 'trap', instruction: 'Corrige la doble marca de pasado:', promptText: 'Incorrecto: "Did you saw the presentation?"', hint: 'Did absorbe el pasado', solution: 'Did you see the presentation?', explanation: 'Como "Did" ya absorbió el tiempo pasado, el verbo debe permanecer en forma base "see".' },
    { id: 8, type: 'trap', instruction: 'Corrige el uso incorrecto de tercera persona:', promptText: 'Incorrecto: "He cans speak French."', hint: 'Modales invariables', solution: 'He can speak French', explanation: 'Los modales jamás llevan "-s" de tercera persona.' },
    { id: 9, type: 'trap', instruction: 'Corrige la negación incorrecta con will:', promptText: 'Incorrecto: "I will not to go tomorrow."', hint: 'Sin "to"', solution: 'I will not go tomorrow', explanation: 'No se usa infinitivo con "to" después de modales auxiliares.' },
    { id: 10, type: 'trap', instruction: 'Corrige la pregunta sin invertir auxiliar:', promptText: 'Incorrecto: "You would like some coffee?"', hint: 'Invertir en pregunta', solution: 'Would you like some coffee?', explanation: 'En preguntas, el auxiliar modal pasa al inicio antes del sujeto.' },
    { id: 11, type: 'reverse', instruction: 'Traduce al inglés con el modal exacto:', promptText: '¿Podrías enviarme el correo hoy?', hint: 'Petición cortés', solution: 'Could you send me the email today?', explanation: '"Could you...?" es la fórmula universal de cortesía.' },
    { id: 12, type: 'reverse', instruction: 'Traduce al inglés con el auxiliar de pasado:', promptText: '¿Practicaste conversación ayer?', hint: 'Pregunta en pasado', solution: 'Did you practice conversation yesterday?', explanation: '"Did you practice..." coloca el verbo en base y el tiempo en did.' },
    { id: 13, type: 'reverse', instruction: 'Traduce al inglés con el modal de posibilidad remota:', promptText: 'Quizás llueva más tarde.', hint: 'Posibilidad remota', solution: 'It might rain later.', explanation: '"Might" expresa posibilidad tentativa o remota.' },
    { id: 14, type: 'reverse', instruction: 'Traduce al inglés con sugerencia formal:', promptText: '¿Comenzamos la reunión?', hint: 'Sugerencia con Shall', solution: 'Shall we start the meeting?', explanation: '"Shall we start...?" es la invitación colaborativa formal.' },
    { id: 15, type: 'reverse', instruction: 'Traduce al inglés con deducción lógica:', promptText: 'Debes estar muy cansado.', hint: 'Certeza lógica', solution: 'You must be very tired.', explanation: '"Must be" expresa deducción lógica evidente.' }
  ],
  prepositions_in_on_at: [
    { id: 1, type: 'fill', instruction: 'Completa con la preposición de hora exacta:', promptText: 'Our live class starts [___] 11:00 AM.', hint: 'Hora de reloj', solution: 'at', explanation: 'Las horas del reloj siempre llevan estrictamente "at".' },
    { id: 2, type: 'fill', instruction: 'Completa con la preposición de día de la semana:', promptText: 'We practice conversation [___] Wednesday and Friday.', hint: 'Días de semana', solution: 'on', explanation: 'Los días específicos del calendario llevan siempre "on".' },
    { id: 3, type: 'fill', instruction: 'Completa con la preposición de mes o país:', promptText: 'Santiago lives [___] Colombia.', hint: 'País o ciudad', solution: 'in', explanation: 'Los países, ciudades y espacios amplios llevan "in".' },
    { id: 4, type: 'fill', instruction: 'Completa con la preposición de superficie:', promptText: 'Leave the notebook [___] the table, please.', hint: 'Superficie de contacto', solution: 'on', explanation: 'El contacto sobre una superficie requiere "on".' },
    { id: 5, type: 'fill', instruction: 'Completa con la preposición de punto exacto:', promptText: 'I will wait for you [___] the entrance.', hint: 'Punto de encuentro', solution: 'at', explanation: 'El punto de encuentro funcional utiliza "at".' },
    { id: 6, type: 'trap', instruction: 'Corrige el error típico con días de semana:', promptText: 'Incorrecto: "I have class in Monday."', hint: 'Día = ON', solution: 'I have class on Monday.', explanation: 'En español decimos "en lunes", pero en inglés es estrictamente "on Monday".' },
    { id: 7, type: 'trap', instruction: 'Corrige el error con las horas del reloj:', promptText: 'Incorrecto: "The meeting is on 3:00 PM."', hint: 'Hora = AT', solution: 'The meeting is at 3:00 PM.', explanation: 'Las horas precisas jamás llevan "on", siempre llevan "at".' },
    { id: 8, type: 'trap', instruction: 'Corrige la preposición con partes del día:', promptText: 'Incorrecto: "I study at the morning."', hint: 'Partes del día = IN THE', solution: 'I study in the morning.', explanation: 'Se dice "in the morning", "in the afternoon", "in the evening" (pero "at night").' },
    { id: 9, type: 'trap', instruction: 'Corrige la preposición con medios de transporte con pasillo:', promptText: 'Incorrecto: "I am in the bus right now."', hint: 'Transporte público = ON', solution: 'I am on the bus right now.', explanation: 'En transporte colectivo donde puedes estar de pie se usa "on the bus/train/plane".' },
    { id: 10, type: 'trap', instruction: 'Corrige la ubicación de la preposición en preguntas:', promptText: 'Incorrecto: "About what are you talking?"', hint: 'Preposition Stranding al final', solution: 'What are you talking about?', explanation: 'En inglés natural la preposición va al final de la pregunta ("Preposition Stranding").' },
    { id: 11, type: 'reverse', instruction: 'Traduce al inglés aplicando preposition stranding:', promptText: '¿En qué estás pensando?', hint: 'Preposición about al final', solution: 'What are you thinking about?', explanation: 'El orden comunicativo es: What + are you thinking + about?' },
    { id: 12, type: 'reverse', instruction: 'Traduce al inglés con preposición de noche:', promptText: 'Ella suele leer por la noche.', hint: 'Noche puntual', solution: 'She usually reads at night.', explanation: 'La noche puntual se expresa con "at night".' },
    { id: 13, type: 'reverse', instruction: 'Traduce al inglés con fecha exacta:', promptText: 'La reunión es el 15 de marzo.', hint: 'Fecha completa = ON', solution: 'The meeting is on March 15th.', explanation: 'Cuando hay un día específico del mes, la preposición es "on".' },
    { id: 14, type: 'reverse', instruction: 'Traduce al inglés con espacio contenedor:', promptText: 'Mis llaves están en mi bolsillo.', hint: 'Dentro de un contenedor', solution: 'My keys are in my pocket.', explanation: 'Dentro de un objeto o contenedor cerrado se usa "in".' },
    { id: 15, type: 'reverse', instruction: 'Traduce al inglés con lugar funcional:', promptText: 'Él está en el trabajo ahora mismo.', hint: 'Lugar funcional = AT', solution: 'He is at work right now.', explanation: '"At work", "at home", "at school" son fórmulas fijas con "at".' }
  ],
  wh_words: [
    { id: 1, type: 'fill', instruction: 'Completa la pregunta directa de procedencia:', promptText: '[___] are you from?', hint: 'Lugar', solution: 'Where', explanation: '"Where" pregunta por origen y ubicación.' },
    { id: 2, type: 'fill', instruction: 'Completa la pregunta directa sobre propósito:', promptText: '[___] is this tool for?', hint: 'Objeto / Propósito', solution: 'What', explanation: '"What ... for?" pregunta "¿Para qué?".' },
    { id: 3, type: 'fill', instruction: 'Completa la pregunta de persona:', promptText: '[___] is your English teacher?', hint: 'Persona', solution: 'Who', explanation: '"Who" se refiere a personas.' },
    { id: 4, type: 'fill', instruction: 'Completa la pregunta selectiva entre dos alternativas:', promptText: '[___] day suits you best: Wednesday or Friday?', hint: 'Elección selectiva', solution: 'Which', explanation: '"Which" se utiliza para elegir entre opciones delimitadas.' },
    { id: 5, type: 'fill', instruction: 'Completa el conector de causa en oración afirmativa:', promptText: 'That is [___] we need to practice daily.', hint: 'Causa / Razón', solution: 'why', explanation: '"That is why" significa "Por esa razón / Por eso".' },
    { id: 6, type: 'trap', instruction: 'Corrige la inversión incorrecta en oración afirmativa con conector:', promptText: 'Incorrecto: "I know where do you live."', hint: 'Sin auxiliar en afirmativa', solution: 'I know where you live.', explanation: 'Cuando una WH actúa como conector afirmativo, no se usa auxiliar "do" ni se invierte el orden.' },
    { id: 7, type: 'trap', instruction: 'Corrige la traducción literal de con quién:', promptText: 'Incorrecto: "With who are you going?"', hint: 'Preposición al final', solution: 'Who are you going with?', explanation: 'En conversación natural la preposición va al final: "Who are you going with?".' },
    { id: 8, type: 'trap', instruction: 'Corrige el uso de "what" en opciones cerradas:', promptText: 'Incorrecto: "What color do you prefer: red or blue?"', hint: 'Opciones limitadas = WHICH', solution: 'Which color do you prefer: red or blue?', explanation: 'Al haber opciones explícitas cerradas se debe usar "Which".' },
    { id: 9, type: 'trap', instruction: 'Corrige el tiempo futuro tras conector temporal:', promptText: 'Incorrecto: "I will call you when I will arrive."', hint: 'Sin will tras when', solution: 'I will call you when I arrive.', explanation: 'Después de "when" temporal no se repite "will", se usa presente simple.' },
    { id: 10, type: 'trap', instruction: 'Corrige la confusión entre why y because:', promptText: 'Incorrecto: "Why I was tired, I went to sleep."', hint: 'Respuesta / causa = BECAUSE', solution: 'Because I was tired, I went to sleep.', explanation: '"Why" es la pregunta, "Because" es la explicación.' },
    { id: 11, type: 'reverse', instruction: 'Traduce al inglés con conector afirmativo:', promptText: 'Esto es en lo que debemos enfocarnos.', hint: 'Conector what', solution: 'This is what we must focus on.', explanation: '"What" como conector traduce "lo que / aquello que".' },
    { id: 12, type: 'reverse', instruction: 'Traduce al inglés con preposition stranding:', promptText: '¿De qué están hablando ellos?', hint: 'About al final', solution: 'What are they talking about?', explanation: 'What + are they talking + about?' },
    { id: 13, type: 'reverse', instruction: 'Traduce al inglés con pregunta de manera:', promptText: '¿Cómo funciona esta plataforma?', hint: 'Pregunta en presente', solution: 'How does this platform work?', explanation: 'How + does (auxiliar) + this platform + work?' },
    { id: 14, type: 'reverse', instruction: 'Traduce al inglés con conector relativo de persona:', promptText: 'Conocí a la persona que diseñó el curso.', hint: 'Conector who', solution: 'I met the person who designed the course.', explanation: '"Who" conecta a la persona con la acción que realizó.' },
    { id: 15, type: 'reverse', instruction: 'Traduce al inglés con pregunta de tiempo:', promptText: '¿Cuándo termina nuestra clase?', hint: 'Pregunta de tiempo', solution: 'When does our class end?', explanation: 'When + does + our class + end?' }
  ],
  cefr_general: [
    { id: 1, type: 'fill', instruction: 'Completa con la acepción A2 de gestionar/administrar:', promptText: 'She [___] a small software company with her brother.', hint: 'Administrar un negocio', solution: 'runs', explanation: 'En A2, "run" significa administrar o dirigir una empresa.' },
    { id: 2, type: 'fill', instruction: 'Completa con la acepción A2 de reservar con anticipación:', promptText: 'Remember to [___] the hotel room before Friday.', hint: 'Reservar', solution: 'book', explanation: 'Como verbo, "book" significa hacer una reserva.' },
    { id: 3, type: 'fill', instruction: 'Completa con la acepción de peso ligero:', promptText: 'This laptop is very [___] and easy to travel with.', hint: 'Poco peso', solution: 'light', explanation: '"Light" como adjetivo significa liviano o ligero.' },
    { id: 4, type: 'fill', instruction: 'Completa con la acepción de tener la razón / acertado:', promptText: 'You are completely [___] about this decision.', hint: 'Correcto / Con razón', solution: 'right', explanation: '"You are right" significa "Tienes la razón".' },
    { id: 5, type: 'fill', instruction: 'Completa con la acepción de caja fuerte:', promptText: 'Store your passport and jewelry inside the hotel [___].', hint: 'Caja fuerte', solution: 'safe', explanation: '"Safe" como sustantivo es una caja fuerte.' },
    { id: 6, type: 'trap', instruction: 'Corrige la confusión polisémica de book:', promptText: 'Incorrecto: "I need to make a book for the restaurant."', hint: 'Verbo directo: book a table', solution: 'I need to book a table at the restaurant.', explanation: 'Se utiliza directamente el verbo "to book a table".' },
    { id: 7, type: 'trap', instruction: 'Corrige la confusión entre right (derecha/correcto) y write (escribir):', promptText: 'Incorrecto: "Please right your name on the paper."', hint: 'Escribir = WRITE', solution: 'Please write your name on the paper.', explanation: '"Write" es escribir; "right" es correcto o derecha.' },
    { id: 8, type: 'trap', instruction: 'Corrige el uso de run en tercera persona:', promptText: 'Incorrecto: "My father run a design studio."', hint: 'Tercera persona lleva -s', solution: 'My father runs a design studio.', explanation: 'En presente afirmativo la tercera persona singular requiere "-s" ("runs").' },
    { id: 9, type: 'trap', instruction: 'Corrige el uso del adjetivo light vs luminous:', promptText: 'Incorrecto: "This bag is very illuminous, it only weighs 1kg."', hint: 'Liviano = LIGHT', solution: 'This bag is very light, it only weighs 1kg.', explanation: 'Para peso físico de objetos se emplea "light".' },
    { id: 10, type: 'trap', instruction: 'Corrige la expresión de tener la razón:', promptText: 'Incorrecto: "You have the right."', hint: 'Tener razón = YOU ARE RIGHT', solution: 'You are right.', explanation: 'En inglés se dice "You are right" (tú estás en lo correcto), no "you have the right" (que significa tener un derecho legal).' },
    { id: 11, type: 'reverse', instruction: 'Traduce al inglés con la acepción A2 de dirigir:', promptText: '¿Quién administra este proyecto?', hint: 'Verbo run', solution: 'Who runs this project?', explanation: '"Who runs this project?" utiliza run en sentido gerencial.' },
    { id: 12, type: 'reverse', instruction: 'Traduce al inglés con reserva:', promptText: '¿Ya reservaste los tiquetes?', hint: 'Verbo book en pasado', solution: 'Did you already book the tickets?', explanation: '"Did you book the tickets?" utiliza book como reservar.' },
    { id: 13, type: 'reverse', instruction: 'Traduce al inglés con tipo / clase:', promptText: '¿Qué tipo de proyectos gestionas?', hint: 'Sustantivo kind', solution: 'What kind of projects do you manage?', explanation: '"What kind of..." expresa variedad o clase de cosas.' },
    { id: 14, type: 'reverse', instruction: 'Traduce al inglés con caja fuerte:', promptText: 'Deja los documentos en la caja fuerte.', hint: 'Sustantivo safe', solution: 'Leave the documents in the safe.', explanation: '"In the safe" hace referencia a la caja fuerte.' },
    { id: 15, type: 'reverse', instruction: 'Traduce al inglés con genial / chévere:', promptText: 'Esa chaqueta se ve muy genial.', hint: 'Adjetivo cool', solution: 'That jacket looks really cool.', explanation: '"Cool" en sentido coloquial A2 es genial o atractivo.' }
  ]
};

// -----------------------------------------------------------------------------
// LECTURAS CORTAS Y GIMNASIO MENTAL ADAPTATIVOS POR NIVEL MCER (A1 - C2)
// -----------------------------------------------------------------------------

export const CEFR_LEVEL_SHORT_READINGS: Record<CefrLevel, VocabShortReading> = {
  A1: VOCAB_SHORT_READINGS.cefr_general,
  A2: {
    title: 'Making Up Your Mind',
    storyEn: 'She runs a growing studio and raised a good point during the morning call. At first, the client wanted to book a session for Friday, but later changed his mind. Would you mind pointing out the key details on the light screen so everyone feels safe with the plan?',
    storyEs: 'Ella dirige un estudio en crecimiento y planteó un buen punto durante la llamada matutina. Al principio, el cliente quería reservar una sesión para el viernes, pero luego cambió de opinión. ¿Te importaría señalar los detalles clave en la pantalla luminosa para que todos se sientan seguros con el plan?',
    wordCount: 51,
    highlightWords: ['runs', 'point', 'book', 'mind', 'pointing out', 'light', 'safe'],
    comprehensionQuestion: {
      question: 'In "Would you mind pointing out the key details?", what grammatical form must follow the verb "mind"?',
      options: [
        'An infinitive with to (to point)',
        'A gerund ending in -ING (pointing)',
        'A past participle (pointed)',
        'A modal verb (can point)'
      ],
      correctIndex: 1,
      explanation: 'Después del verbo "mind" ("Would you mind...?") SIEMPRE usamos gerundio (-ING): "Would you mind pointing out...?".'
    }
  },
  B1: {
    title: 'Addressing the Issue on Board',
    storyEn: 'Before we board the evening flight, we must address a delicate technical issue with the client. Looking at the latest sales figures, we need to figure out why deliveries slowed down. Fortunately, the board of directors will issue an official statement tomorrow morning.',
    storyEs: 'Antes de abordar el vuelo nocturno, debemos atender un delicado inconveniente técnico con el cliente. Al observar las últimas cifras de ventas, necesitamos descifrar por qué se desaceleraron las entregas. Afortunadamente, la junta directiva emitirá un comunicado oficial mañana por la mañana.',
    wordCount: 44,
    highlightWords: ['board', 'address', 'issue', 'figures', 'figure out'],
    comprehensionQuestion: {
      question: 'What is the difference between "address an issue" and "issue a statement" in this B1 executive passage?',
      options: [
        'Both mean to write a physical home address',
        '"Address" (verb) means to deal with a problem, while "issue" (verb) means to officially emit a statement',
        '"Address" is a noun and "issue" is an adjective',
        'Both mean to board an airplane'
      ],
      correctIndex: 1,
      explanation: 'En nivel B1/B2 ejecutivo, "to address an issue" es abordar un problema, mientras que "to issue a statement/refund" es emitir oficialmente un comunicado o reembolso.'
    }
  },
  B2: {
    title: 'Finding Common Ground',
    storyEn: 'Innovation is what drives our international expansion. Today, enterprise clients account for seventy percent of our revenue. When we reviewed the financial account of the quarter, both teams found common ground and built a strategy from the ground up.',
    storyEs: 'La innovación es lo que impulsa nuestra expansión internacional. Hoy en día, los clientes corporativos representan el setenta por ciento de nuestros ingresos. Cuando revisamos el informe financiero del trimestre, ambos equipos encontraron un punto en común y construyeron una estrategia desde cero.',
    wordCount: 40,
    highlightWords: ['drives', 'account for', 'account', 'common ground', 'ground'],
    comprehensionQuestion: {
      question: 'What does the phrasal verb "account for" mean in "enterprise clients account for 70% of our revenue"?',
      options: [
        'To open a savings bank account',
        'To represent or form a specific proportion of a total',
        'To drive a vehicle to the office',
        'To touch the physical ground'
      ],
      correctIndex: 1,
      explanation: '"Account for" en contextos ejecutivos y TOEFL significa representar o constituir un porcentaje específico del total.'
    }
  },
  C1: {
    title: 'Sound Judgment & Strategic Leverage',
    storyEn: 'Your proposal sounds promising, and it rests on financially sound advice. If we leverage our proprietary technology, the campaign will yield high returns this quarter. Even under pressure, a prepared negotiator knows when to hold bargaining leverage and when not to yield.',
    storyEs: 'Tu propuesta suena prometedora y se apoya en una asesoría financieramente sólida. Si apalancamos nuestra tecnología propia, la campaña arrojará altos rendimientos este trimestre. Incluso bajo presión, un negociador preparado sabe cuándo mantener su poder de negociación y cuándo no ceder.',
    wordCount: 43,
    highlightWords: ['sounds', 'sound', 'leverage', 'yield'],
    comprehensionQuestion: {
      question: 'In C1 English, what does the adjective "sound" mean in "financially sound advice"?',
      options: [
        'Loud and noisy',
        'Solid, reliable, sensible, and well-founded',
        'Uncertain and risky',
        'Related to music production'
      ],
      correctIndex: 1,
      explanation: 'Como adjetivo C1, "sound" ("sound advice", "sound judgment") significa sólido, sensato y bien fundamentado.'
    }
  },
  C2: {
    title: 'Weathering the Storm',
    storyEn: 'While ships rested in the quiet harbor, a few board members still harbored doubts about the global recession. Most operational bottlenecks stem from outdated workflows. However, by acting decisively to stem the outflow of capital, the firm weathered the economic storm.',
    storyEs: 'Mientras los barcos descansaban en el puerto tranquilo, algunos miembros de la junta aún albergaban dudas sobre la recesión global. La mayoría de los cuellos de botella operativos se derivan de flujos obsoletos. Sin embargo, al actuar con decisión para contener la fuga de capital, la firma logró capear la tormenta económica.',
    wordCount: 42,
    highlightWords: ['harbor', 'harbored', 'stem from', 'stem', 'weathered'],
    comprehensionQuestion: {
      question: 'Contrast "stem from" vs. "stem (transitive)" in the C2 passage:',
      options: [
        'Both refer to flowers and plants',
        '"Stem from" means to originate in/be caused by, whereas "to stem (outflow/inflation)" means to stop or contain an undesirable flow',
        'Both mean to predict the weather',
        '"Stem" means to harbor a ship in port'
      ],
      correctIndex: 1,
      explanation: '"Stem from" indica origen o causa ("derivarse de"), mientras que el verbo transitivo C2 "to stem (inflation/the tide)" significa frenar o contener un flujo negativo.'
    }
  }
};

export function getVocabShortReadingByLevel(
  category: VocabCategory,
  level: CefrLevel = 'A1'
): VocabShortReading {
  if (category === 'cefr_general') {
    return CEFR_LEVEL_SHORT_READINGS[level] || VOCAB_SHORT_READINGS.cefr_general;
  }
  return VOCAB_SHORT_READINGS[category];
}

export function getVocabMentalGymExercises(
  category: VocabCategory,
  level: CefrLevel = 'A1',
  words?: VocabularyWordItem[]
): VocabMentalGymExercise[] {
  if (category !== 'cefr_general' || level === 'A1') {
    return VOCAB_MENTAL_GYM[category];
  }

  const targetWords = words && words.length > 0 ? words : getVocabularyByCategory('cefr_general', level, false);
  if (targetWords.length === 0) return VOCAB_MENTAL_GYM.cefr_general;

  const exercises: VocabMentalGymExercise[] = [];
  let idCounter = 1;

  // Bloque 1: 5 ejercicios de completación contextual (fill) basados en las acepciones del nivel
  const allSenses = targetWords.flatMap(w => w.senses);
  for (let i = 0; i < 5; i++) {
    const sense = allSenses[i % allSenses.length];
    const regex = new RegExp(`\\b${sense.word}(s|ed|ing)?\\b`, 'i');
    const blankedSentence = regex.test(sense.exampleSentenceEn)
      ? sense.exampleSentenceEn.replace(regex, '[___]')
      : `${sense.exampleSentenceEn} ([___])`;

    exercises.push({
      id: idCounter++,
      type: 'fill',
      instruction: `Completa con el término exacto (${sense.partOfSpeech} — ${sense.definitionEs}):`,
      promptText: blankedSentence,
      hint: `${sense.definitionEs} (${sense.collocations?.[0] || sense.word})`,
      solution: sense.word,
      explanation: `En este contexto (${sense.cefrLevelTarget}), "${sense.word}" significa: ${sense.definitionEs}. Ejemplo completo: "${sense.exampleSentenceEn}".`
    });
  }

  // Bloque 2: 5 ejercicios de detección de trampa / contraste polisémico (trap)
  for (let i = 0; i < 5; i++) {
    const wordItem = targetWords[i % targetWords.length];
    const sense1 = wordItem.senses[0];
    const sense2 = wordItem.senses[1] || wordItem.senses[0];
    exercises.push({
      id: idCounter++,
      type: 'trap',
      instruction: `Domina la segunda acepción (${sense2.cefrLevelTarget}) de "${wordItem.word.toUpperCase()}":`,
      promptText: `Acepción 1 (${sense1.cefrLevelTarget}): "${sense1.definitionEs}". ¿Cómo usas "${wordItem.word}" con el sentido de "${sense2.definitionEs}"?`,
      hint: sense2.collocations?.join(' / ') || sense2.definitionEs,
      solution: sense2.exampleSentenceEn,
      explanation: `${sense2.notes || `En nivel ${sense2.cefrLevelTarget}, "${wordItem.word}" (${sense2.partOfSpeech}) significa "${sense2.definitionEs}".`}`
    });
  }

  // Bloque 3: 5 ejercicios de producción inversa Español -> Inglés (reverse)
  for (let i = 0; i < 5; i++) {
    const sense = allSenses[(i + 1) % allSenses.length];
    exercises.push({
      id: idCounter++,
      type: 'reverse',
      instruction: `Traduce al inglés aplicando "${sense.word}" (${sense.cefrLevelTarget}):`,
      promptText: sense.exampleSentenceEs,
      hint: `Usa "${sense.word}" (${sense.collocations?.[0] || sense.partOfSpeech})`,
      solution: sense.exampleSentenceEn,
      explanation: `Traducción natural: "${sense.exampleSentenceEn}" (${sense.definitionEs}).`
    });
  }

  return exercises;
}

