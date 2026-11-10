import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const envContent = fs.readFileSync(path.resolve('apps/web/.env.local'), 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const idx = line.indexOf('=');
  if (idx > -1) {
    const k = line.slice(0, idx).trim();
    const v = line.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
    env[k] = v;
  }
});

const url = env.NEXT_PUBLIC_SUPABASE_URL || 'https://swmklobpnrkjpfackboc.supabase.co';
const key = env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key, { auth: { persistSession: false } });

// =============================================================================
// CATÁLOGO COMPLETO DE VOCABULARIO CURADO (CATEGORÍAS SANTIAGO & CEFR A1/A2)
// =============================================================================

export const VOCABULARY_SEED_DATA = [
  // ── 1. LAS 12 PALABRAS DEL TIEMPO (AUXILIARES & MODALES) ───────────────────
  {
    word: 'can',
    cefr_level: 'A1',
    part_of_speech: 'modal auxiliary',
    ipa: '/kæn/',
    thematic_cluster: 'time_words',
    senses: [
      {
        sense_index: 1,
        cefr_level_target: 'A1',
        definition_en: 'Expresses physical or mental ability in the present.',
        definitionEs: 'Poder hacer algo; capacidad o habilidad presente.',
        exampleSentenceEn: 'I can speak two languages fluently.',
        exampleSentenceEs: 'Puedo hablar dos idiomas con fluidez.',
        collocations: ['can speak', 'can do', 'can see']
      },
      {
        sense_index: 2,
        cefr_level_target: 'A1',
        definition_en: 'Used to ask for or give informal permission or make requests.',
        definitionEs: 'Pedir o dar permiso informal; hacer solicitudes cotidianas.',
        exampleSentenceEn: 'Can I ask you a quick question?',
        exampleSentenceEs: '¿Te puedo hacer una pregunta rápida?',
        collocations: ['can I help', 'can you tell me']
      }
    ],
    relations: [
      { targetWord: 'could', relationType: 'related', targetDefinitionEs: 'Forma en pasado o más formal/condicional de can' },
      { targetWord: 'be able to', relationType: 'synonym', targetDefinitionEs: 'Ser capaz de' }
    ]
  },
  {
    word: 'could',
    cefr_level: 'A1',
    part_of_speech: 'modal auxiliary',
    ipa: '/kʊd/',
    thematic_cluster: 'time_words',
    senses: [
      {
        sense_index: 1,
        cefr_level_target: 'A1',
        definition_en: 'Past ability of "can" (was able to).',
        definitionEs: 'Pude / Podía (capacidad o habilidad en pasado).',
        exampleSentenceEn: 'When I was younger, I could run ten miles easily.',
        exampleSentenceEs: 'Cuando era más joven, podía correr diez millas con facilidad.',
        collocations: ['could run', 'could swim', 'could hear']
      },
      {
        sense_index: 2,
        cefr_level_target: 'A2',
        definition_en: 'Polite request or hypothetical possibility (podría).',
        definitionEs: 'Petición cortés o posibilidad condicional (¿Podrías...?).',
        exampleSentenceEn: 'Could you send me the contract before noon?',
        exampleSentenceEs: '¿Podrías enviarme el contrato antes del mediodía?',
        collocations: ['could you please', 'could happen', 'could be']
      }
    ],
    relations: [
      { targetWord: 'can', relationType: 'related', targetDefinitionEs: 'Forma directa en presente' }
    ]
  },
  {
    word: 'will',
    cefr_level: 'A1',
    part_of_speech: 'modal auxiliary',
    ipa: '/wɪl/',
    thematic_cluster: 'time_words',
    senses: [
      {
        sense_index: 1,
        cefr_level_target: 'A1',
        definition_en: 'Indicates certain future action or instant decision.',
        definitionEs: 'Marca de tiempo futuro certero o decisión espontánea.',
        exampleSentenceEn: 'We will start the presentation at 11:00 AM.',
        exampleSentenceEs: 'Comenzaremos la presentación a las 11:00 AM.',
        collocations: ['will be', 'will do', 'will start']
      },
      {
        sense_index: 2,
        cefr_level_target: 'A2',
        definition_en: 'Expresses willingness, promise, or voluntary offer.',
        definitionEs: 'Expresar voluntad, promesa u ofrecimiento voluntario.',
        exampleSentenceEn: 'Don\'t worry, I will help you with the report.',
        exampleSentenceEs: 'No te preocupes, yo te ayudaré con el informe.',
        collocations: ['will help', 'will promise']
      }
    ],
    relations: [
      { targetWord: 'would', relationType: 'related', targetDefinitionEs: 'Forma condicional de will' }
    ]
  },
  {
    word: 'would',
    cefr_level: 'A1',
    part_of_speech: 'modal auxiliary',
    ipa: '/wʊd/',
    thematic_cluster: 'time_words',
    senses: [
      {
        sense_index: 1,
        cefr_level_target: 'A1',
        definition_en: 'Conditional auxiliary adding the suffix "-ría" to actions.',
        definitionEs: 'Auxiliar condicional (haría, gustaría, viajaría).',
        exampleSentenceEn: 'I would love to learn more about your project.',
        exampleSentenceEs: 'Me encantaría aprender más sobre tu proyecto.',
        collocations: ['would like', 'would love', 'would prefer']
      },
      {
        sense_index: 2,
        cefr_level_target: 'A2',
        definition_en: 'Polite offers or invitations.',
        definitionEs: 'Ofrecimiento o invitación formal cortés.',
        exampleSentenceEn: 'Would you like a cup of coffee?',
        exampleSentenceEs: '¿Te gustaría una taza de café?',
        collocations: ['would you like', 'would you mind']
      }
    ],
    relations: [
      { targetWord: 'will', relationType: 'related', targetDefinitionEs: 'Forma en futuro' }
    ]
  },
  {
    word: 'should',
    cefr_level: 'A1',
    part_of_speech: 'modal auxiliary',
    ipa: '/ʃʊd/',
    thematic_cluster: 'time_words',
    senses: [
      {
        sense_index: 1,
        cefr_level_target: 'A1',
        definition_en: 'Used to give advice, suggestions, or recommendations (deberías).',
        definitionEs: 'Dar consejos, sugerencias o recomendaciones (deberías).',
        exampleSentenceEn: 'You should rest before tomorrow\'s flight.',
        exampleSentenceEs: 'Deberías descansar antes del vuelo de mañana.',
        collocations: ['should go', 'should try', 'should know']
      },
      {
        sense_index: 2,
        cefr_level_target: 'A2',
        definition_en: 'Indicates reasonable expectation or probability.',
        definitionEs: 'Expectativa razonable o cálculo probable (debería llegar pronto).',
        exampleSentenceEn: 'The package should arrive by Thursday afternoon.',
        exampleSentenceEs: 'El paquete debería llegar para el jueves por la tarde.',
        collocations: ['should be ready', 'should arrive']
      }
    ],
    relations: [
      { targetWord: 'ought to', relationType: 'synonym', targetDefinitionEs: 'Deberías (equivalente formal)' },
      { targetWord: 'must', relationType: 'related', targetDefinitionEs: 'Obligación estricta' }
    ]
  },
  {
    word: 'must',
    cefr_level: 'A1',
    part_of_speech: 'modal auxiliary',
    ipa: '/mʌst/',
    thematic_cluster: 'time_words',
    senses: [
      {
        sense_index: 1,
        cefr_level_target: 'A1',
        definition_en: 'Expresses strong obligation or urgent necessity (debo/tienes que).',
        definitionEs: 'Obligación rotunda o necesidad inaplazable.',
        exampleSentenceEn: 'We must submit the proposal before 5:00 PM.',
        exampleSentenceEs: 'Debemos entregar la propuesta antes de las 5:00 PM.',
        collocations: ['must do', 'must see', 'must remember']
      },
      {
        sense_index: 2,
        cefr_level_target: 'A2',
        definition_en: 'Expresses logical certainty or high deduction (debe ser).',
        definitionEs: 'Certeza lógica o deducción evidente (tiene que ser verdad).',
        exampleSentenceEn: 'You worked all day, you must be exhausted!',
        exampleSentenceEs: 'Trabajaste todo el día, ¡debes estar agotado!',
        collocations: ['must be', 'must have']
      }
    ],
    relations: [
      { targetWord: 'have to', relationType: 'synonym', targetDefinitionEs: 'Tener que' }
    ]
  },
  {
    word: 'may',
    cefr_level: 'A2',
    part_of_speech: 'modal auxiliary',
    ipa: '/meɪ/',
    thematic_cluster: 'time_words',
    senses: [
      {
        sense_index: 1,
        cefr_level_target: 'A2',
        definition_en: 'Formal permission (¿Puedo entrar?).',
        definitionEs: 'Permiso formal respetuoso.',
        exampleSentenceEn: 'May I come in and sit down?',
        exampleSentenceEs: '¿Puedo pasar y sentarme?',
        collocations: ['may I ask', 'may I have', 'may come in']
      },
      {
        sense_index: 2,
        cefr_level_target: 'A2',
        definition_en: 'Moderate possibility of an event happening (puede que sí).',
        definitionEs: 'Posibilidad moderada de que algo ocurra (puede que).',
        exampleSentenceEn: 'It may rain later this evening.',
        exampleSentenceEs: 'Puede que llueva más tarde esta noche.',
        collocations: ['may be', 'may rain', 'may seem']
      }
    ],
    relations: [
      { targetWord: 'might', relationType: 'synonym', targetDefinitionEs: 'Podría (posibilidad más remota)' }
    ]
  },
  {
    word: 'might',
    cefr_level: 'A2',
    part_of_speech: 'modal auxiliary',
    ipa: '/maɪt/',
    thematic_cluster: 'time_words',
    senses: [
      {
        sense_index: 1,
        cefr_level_target: 'A2',
        definition_en: 'Expresses remote or tentative possibility (podría ser).',
        definitionEs: 'Posibilidad tentativa o remota (podría ocurrir).',
        exampleSentenceEn: 'They might join our video call if they finish early.',
        exampleSentenceEs: 'Ellos podrían unirse a nuestra videollamada si terminan temprano.',
        collocations: ['might be', 'might know', 'might have']
      }
    ],
    relations: [
      { targetWord: 'may', relationType: 'synonym', targetDefinitionEs: 'Puede que' }
    ]
  },
  {
    word: 'shall',
    cefr_level: 'A2',
    part_of_speech: 'modal auxiliary',
    ipa: '/ʃæl/',
    thematic_cluster: 'time_words',
    senses: [
      {
        sense_index: 1,
        cefr_level_target: 'A2',
        definition_en: 'Offers, suggestions, or polite questions with "I" and "we".',
        definitionEs: 'Ofrecimiento o sugerencia conjunta (¿Empezamos? / ¿Bailamos?).',
        exampleSentenceEn: 'Shall we begin today\'s lesson now?',
        exampleSentenceEs: '¿Empezamos la clase de hoy ahora?',
        collocations: ['shall we go', 'shall we start']
      }
    ],
    relations: [
      { targetWord: 'should', relationType: 'related', targetDefinitionEs: 'Forma habitual de consejo' }
    ]
  },
  {
    word: 'do',
    cefr_level: 'A1',
    part_of_speech: 'auxiliary & verb',
    ipa: '/duː/',
    thematic_cluster: 'time_words',
    senses: [
      {
        sense_index: 1,
        cefr_level_target: 'A1',
        definition_en: 'Time word auxiliary for present questions and negations.',
        definitionEs: 'Palabra de tiempo auxiliar para presente simple (preguntas y negación don\'t).',
        exampleSentenceEn: 'Do you study English on Wednesdays?',
        exampleSentenceEs: '¿Estudias inglés los miércoles?',
        collocations: ['do you know', 'do you want', 'do not']
      },
      {
        sense_index: 2,
        cefr_level_target: 'A1',
        definition_en: 'Action verb: to perform an activity or task.',
        definitionEs: 'Verbo de acción: hacer, ejecutar o realizar una tarea.',
        exampleSentenceEn: 'I always do my exercises in the morning.',
        exampleSentenceEs: 'Siempre hago mis ejercicios por la mañana.',
        collocations: ['do homework', 'do business', 'do your best']
      }
    ],
    relations: [
      { targetWord: 'did', relationType: 'related', targetDefinitionEs: 'Forma en pasado' },
      { targetWord: 'make', relationType: 'related', targetDefinitionEs: 'Hacer (crear o fabricar)' }
    ]
  },
  {
    word: 'did',
    cefr_level: 'A1',
    part_of_speech: 'auxiliary verb',
    ipa: '/dɪd/',
    thematic_cluster: 'time_words',
    senses: [
      {
        sense_index: 1,
        cefr_level_target: 'A1',
        definition_en: 'Time word auxiliary for past simple questions and negations.',
        definitionEs: 'Auxiliar de tiempo pasado (libera al verbo de acción a su forma base).',
        exampleSentenceEn: 'Did you see the latest class summary?',
        exampleSentenceEs: '¿Viste el último resumen de la clase?',
        collocations: ['did you know', 'did you see', 'did not']
      },
      {
        sense_index: 2,
        cefr_level_target: 'A2',
        definition_en: 'Emphatic past affirmative (afirmación contundente).',
        definitionEs: 'Énfasis afirmativo en pasado (¡Sí que lo hice!).',
        exampleSentenceEn: 'I did call you yesterday, but your phone was off!',
        exampleSentenceEs: '¡Sí que te llamé ayer, pero tu teléfono estaba apagado!',
        collocations: ['did find', 'did see']
      }
    ],
    relations: [
      { targetWord: 'do', relationType: 'related', targetDefinitionEs: 'Forma presente' }
    ]
  },
  {
    word: 'be',
    cefr_level: 'A1',
    part_of_speech: 'auxiliary & verb',
    ipa: '/biː/',
    thematic_cluster: 'time_words',
    senses: [
      {
        sense_index: 1,
        cefr_level_target: 'A1',
        definition_en: 'Expresses identity, state, condition, or existence (am, is, are).',
        definitionEs: 'Ser o estar: describe identidad, condición, profesión o ubicación.',
        exampleSentenceEn: 'We are ready for the presentation today.',
        exampleSentenceEs: 'Estamos listos para la presentación de hoy.',
        collocations: ['be ready', 'be careful', 'be happy']
      },
      {
        sense_index: 2,
        cefr_level_target: 'A1',
        definition_en: 'Auxiliary for continuous actions (am/is/are + -ing).',
        definitionEs: 'Auxiliar continuo para acciones que se desarrollan en el momento.',
        exampleSentenceEn: 'She is learning new vocabulary right now.',
        exampleSentenceEs: 'Ella está aprendiendo nuevo vocabulario ahora mismo.',
        collocations: ['is working', 'are going']
      }
    ],
    relations: [
      { targetWord: 'exist', relationType: 'synonym', targetDefinitionEs: 'Existir' }
    ]
  },
  {
    word: 'have',
    cefr_level: 'A1',
    part_of_speech: 'auxiliary & verb',
    ipa: '/hæv/',
    thematic_cluster: 'time_words',
    senses: [
      {
        sense_index: 1,
        cefr_level_target: 'A1',
        definition_en: 'Action verb of possession or experience (tener).',
        definitionEs: 'Tener: posesión, relación o experiencia.',
        exampleSentenceEn: 'We have class on Wednesdays and Fridays.',
        exampleSentenceEs: 'Tenemos clase los miércoles y viernes.',
        collocations: ['have time', 'have class', 'have a question']
      },
      {
        sense_index: 2,
        cefr_level_target: 'A2',
        definition_en: 'Auxiliary time word for perfect tenses (haber hecho).',
        definitionEs: 'Auxiliar de tiempo perfecto (haber: have seen, have studied).',
        exampleSentenceEn: 'They have seen six lessons this month.',
        exampleSentenceEs: 'Han visto seis lecciones este mes.',
        collocations: ['have seen', 'have done', 'have been']
      }
    ],
    relations: [
      { targetWord: 'own', relationType: 'synonym', targetDefinitionEs: 'Poseer' }
    ]
  },

  // ── 2. PREPOSICIONES CLAVE: IN, ON, AT ─────────────────────────────────────
  {
    word: 'in',
    cefr_level: 'A1',
    part_of_speech: 'preposition',
    ipa: '/ɪn/',
    thematic_cluster: 'prepositions_in_on_at',
    senses: [
      {
        sense_index: 1,
        cefr_level_target: 'A1',
        definition_en: 'Temporal: months, years, seasons, centuries, parts of the day.',
        definitionEs: 'Tiempo general: meses, años, estaciones y partes del día (in October, in 2026, in the morning).',
        exampleSentenceEn: 'We started our English course in October.',
        exampleSentenceEs: 'Comenzamos nuestro curso de inglés en octubre.',
        collocations: ['in the morning', 'in the afternoon', 'in October', 'in 2026']
      },
      {
        sense_index: 2,
        cefr_level_target: 'A1',
        definition_en: 'Spatial: inside enclosed spaces, cities, countries, or regions.',
        definitionEs: 'Espacio cerrado/general: dentro de un lugar, ciudades o países.',
        exampleSentenceEn: 'They live in Medellín, Colombia.',
        exampleSentenceEs: 'Ellas viven en Medellín, Colombia.',
        collocations: ['in the room', 'in the city', 'in Colombia']
      }
    ],
    relations: [
      { targetWord: 'inside', relationType: 'synonym', targetDefinitionEs: 'Adentro de' },
      { targetWord: 'out', relationType: 'antonym', targetDefinitionEs: 'Afuera' }
    ]
  },
  {
    word: 'on',
    cefr_level: 'A1',
    part_of_speech: 'preposition',
    ipa: '/ɒn/',
    thematic_cluster: 'prepositions_in_on_at',
    senses: [
      {
        sense_index: 1,
        cefr_level_target: 'A1',
        definition_en: 'Temporal: specific days of the week, dates, and special days.',
        definitionEs: 'Tiempo específico: días de la semana y fechas exactas con día.',
        exampleSentenceEn: 'Our regular classes are on Wednesdays and on Fridays.',
        exampleSentenceEs: 'Nuestras clases regulares son los miércoles y los viernes.',
        collocations: ['on Wednesday', 'on Friday', 'on October 30', 'on my birthday']
      },
      {
        sense_index: 2,
        cefr_level_target: 'A1',
        definition_en: 'Spatial: on a surface, streets, floors, or public transport.',
        definitionEs: 'Espacio superficial: sobre una superficie, calles o transporte público.',
        exampleSentenceEn: 'Leave the notebook on the table, please.',
        exampleSentenceEs: 'Deja el cuaderno sobre la mesa, por favor.',
        collocations: ['on the table', 'on the floor', 'on the bus', 'on the street']
      }
    ],
    relations: [
      { targetWord: 'off', relationType: 'antonym', targetDefinitionEs: 'Fuera de la superficie' }
    ]
  },
  {
    word: 'at',
    cefr_level: 'A1',
    part_of_speech: 'preposition',
    ipa: '/æt/',
    thematic_cluster: 'prepositions_in_on_at',
    senses: [
      {
        sense_index: 1,
        cefr_level_target: 'A1',
        definition_en: 'Temporal: precise hours, exact times of day, and key moments.',
        definitionEs: 'Tiempo puntual: horas exactas y momentos clave.',
        exampleSentenceEn: 'We have our live session at 11:00 AM sharp.',
        exampleSentenceEs: 'Tenemos nuestra sesión en vivo exactamente a las 11:00 AM.',
        collocations: ['at 11:00 AM', 'at noon', 'at night', 'at the moment']
      },
      {
        sense_index: 2,
        cefr_level_target: 'A1',
        definition_en: 'Spatial: specific points of location, addresses, and activity hubs.',
        definitionEs: 'Punto exacto o lugar de actividad (en casa, en la oficina, en la puerta).',
        exampleSentenceEn: 'She is working at the office today.',
        exampleSentenceEs: 'Ella está trabajando en la oficina hoy.',
        collocations: ['at home', 'at work', 'at school', 'at the door']
      }
    ],
    relations: [
      { targetWord: 'near', relationType: 'related', targetDefinitionEs: 'Cerca de' }
    ]
  },

  // ── 3. PALABRAS WH (PREGUNTAS & CONECTORES RELATIVOS) ───────────────────────
  {
    word: 'where',
    cefr_level: 'A1',
    part_of_speech: 'interrogative & connector',
    ipa: '/weər/',
    thematic_cluster: 'wh_words',
    senses: [
      {
        sense_index: 1,
        cefr_level_target: 'A1',
        definition_en: 'Direct question about place or location (con preposición al final si aplica).',
        definitionEs: 'Pregunta directa de lugar: ¿Dónde? / ¿Hacia dónde? / ¿De dónde?',
        exampleSentenceEn: 'Where are you from?',
        exampleSentenceEs: '¿De dónde eres? (La preposición from va al final).',
        collocations: ['where do you live', 'where are you from', 'where is']
      },
      {
        sense_index: 2,
        cefr_level_target: 'A1',
        definition_en: 'Affirmative relative connector (el lugar donde / a donde).',
        definitionEs: 'Conector afirmativo (donde / en donde) conservando orden directo sin invertir.',
        exampleSentenceEn: 'I know where they work.',
        exampleSentenceEs: 'Yo sé dónde trabajan ellos (orden natural, sin auxiliar intermedio).',
        collocations: ['I know where', 'the place where', 'tell me where']
      }
    ],
    relations: [
      { targetWord: 'somewhere', relationType: 'related', targetDefinitionEs: 'Algún lugar' },
      { targetWord: 'anywhere', relationType: 'related', targetDefinitionEs: 'Cualquier lugar' }
    ]
  },
  {
    word: 'what',
    cefr_level: 'A1',
    part_of_speech: 'interrogative & connector',
    ipa: '/wɒt/',
    thematic_cluster: 'wh_words',
    senses: [
      {
        sense_index: 1,
        cefr_level_target: 'A1',
        definition_en: 'Direct question about things, actions, or purposes.',
        definitionEs: 'Pregunta directa sobre objetos, acciones o motivos (¿Qué? / ¿Para qué?).',
        exampleSentenceEn: 'What is this tool for?',
        exampleSentenceEs: '¿Para qué sirve esta herramienta? (preposición for al final).',
        collocations: ['what is', 'what do you mean', 'what is this for']
      },
      {
        sense_index: 2,
        cefr_level_target: 'A1',
        definition_en: 'Affirmative connector meaning "the thing that" / "lo que".',
        definitionEs: 'Conector afirmativo: "lo que / aquello que".',
        exampleSentenceEn: 'This is what we need to focus on today.',
        exampleSentenceEs: 'Esto es en lo que debemos enfocarnos hoy.',
        collocations: ['this is what', 'what I mean', 'what you said']
      }
    ],
    relations: [
      { targetWord: 'which', relationType: 'related', targetDefinitionEs: 'Cuál (de una opción limitada)' }
    ]
  },
  {
    word: 'who',
    cefr_level: 'A1',
    part_of_speech: 'interrogative & connector',
    ipa: '/huː/',
    thematic_cluster: 'wh_words',
    senses: [
      {
        sense_index: 1,
        cefr_level_target: 'A1',
        definition_en: 'Direct question asking about people.',
        definitionEs: 'Pregunta directa sobre personas: ¿Quién? / ¿Con quién?',
        exampleSentenceEn: 'Who are you talking with on the phone?',
        exampleSentenceEs: '¿Con quién estás hablando por teléfono? (with al final).',
        collocations: ['who is', 'who are you talking with', 'who knows']
      },
      {
        sense_index: 2,
        cefr_level_target: 'A2',
        definition_en: 'Relative connector identifying a person (quien / que).',
        definitionEs: 'Conector relativo para personas (la persona que / quien).',
        exampleSentenceEn: 'She is the teacher who guided our first class.',
        exampleSentenceEs: 'Ella es la profesora que guió nuestra primera clase.',
        collocations: ['the person who', 'anyone who']
      }
    ],
    relations: [
      { targetWord: 'someone', relationType: 'related', targetDefinitionEs: 'Alguien' }
    ]
  },
  {
    word: 'when',
    cefr_level: 'A1',
    part_of_speech: 'interrogative & connector',
    ipa: '/wen/',
    thematic_cluster: 'wh_words',
    senses: [
      {
        sense_index: 1,
        cefr_level_target: 'A1',
        definition_en: 'Direct question asking about time.',
        definitionEs: 'Pregunta directa de tiempo: ¿Cuándo?',
        exampleSentenceEn: 'When does the next cycle begin?',
        exampleSentenceEs: '¿Cuándo comienza el próximo ciclo?',
        collocations: ['when do you', 'when is']
      },
      {
        sense_index: 2,
        cefr_level_target: 'A1',
        definition_en: 'Time connector meaning "at the time that" (cuando).',
        definitionEs: 'Conector temporal: cuando ocurre algo.',
        exampleSentenceEn: 'I feel confident when I practice speaking out loud.',
        exampleSentenceEs: 'Me siento segura cuando practico hablando en voz alta.',
        collocations: ['when I was', 'when you arrive']
      }
    ],
    relations: [
      { targetWord: 'while', relationType: 'related', targetDefinitionEs: 'Mientras' }
    ]
  },
  {
    word: 'why',
    cefr_level: 'A1',
    part_of_speech: 'interrogative & connector',
    ipa: '/waɪ/',
    thematic_cluster: 'wh_words',
    senses: [
      {
        sense_index: 1,
        cefr_level_target: 'A1',
        definition_en: 'Direct question asking for reason or purpose.',
        definitionEs: 'Pregunta directa de razón o causa: ¿Por qué?',
        exampleSentenceEn: 'Why is English structure different from Spanish?',
        exampleSentenceEs: '¿Por qué la estructura del inglés es diferente a la del español?',
        collocations: ['why do you', 'why is']
      },
      {
        sense_index: 2,
        cefr_level_target: 'A2',
        definition_en: 'Connector meaning "the reason for which" (la razón por la que).',
        definitionEs: 'Conector: la razón por la que.',
        exampleSentenceEn: 'That is why we practice with real situations.',
        exampleSentenceEs: 'Esa es la razón por la que practicamos con situaciones reales.',
        collocations: ['that is why', 'tell me why']
      }
    ],
    relations: [
      { targetWord: 'because', relationType: 'related', targetDefinitionEs: 'Porque (respuesta causal)' }
    ]
  },
  {
    word: 'how',
    cefr_level: 'A1',
    part_of_speech: 'interrogative & connector',
    ipa: '/haʊ/',
    thematic_cluster: 'wh_words',
    senses: [
      {
        sense_index: 1,
        cefr_level_target: 'A1',
        definition_en: 'Direct question about manner, method, condition, or amount.',
        definitionEs: 'Pregunta directa de modo, método o estado: ¿Cómo?',
        exampleSentenceEn: 'How do you pronounce this word correctly?',
        exampleSentenceEs: '¿Cómo pronuncias esta palabra correctamente?',
        collocations: ['how are you', 'how much', 'how many', 'how often']
      },
      {
        sense_index: 2,
        cefr_level_target: 'A2',
        definition_en: 'Connector expressing the manner in which something is done.',
        definitionEs: 'Conector: la manera o forma en la que se hace algo.',
        exampleSentenceEn: 'Show me how you organize your study notes.',
        exampleSentenceEs: 'Muéstrame cómo organizas tus notas de estudio.',
        collocations: ['know how to', 'show me how']
      }
    ],
    relations: [
      { targetWord: 'way', relationType: 'related', targetDefinitionEs: 'Forma / Manera' }
    ]
  },

  // ── 4. VOCABULARIO GENERAL CEFR A1 / A2 (POLISÉMICO CON RED SEMÁNTICA) ─────
  {
    word: 'run',
    cefr_level: 'A1',
    part_of_speech: 'verb',
    ipa: '/rʌn/',
    thematic_cluster: 'movement_and_business',
    senses: [
      {
        sense_index: 1,
        cefr_level_target: 'A1',
        definition_en: 'To move fast using legs.',
        definitionEs: 'Correr a gran velocidad con las piernas.',
        exampleSentenceEn: 'The children run in the park every morning.',
        exampleSentenceEs: 'Los niños corren en el parque cada mañana.',
        collocations: ['run fast', 'go for a run']
      },
      {
        sense_index: 2,
        cefr_level_target: 'A2',
        definition_en: 'To manage or operate a business, team, or project.',
        definitionEs: 'Administrar, operar o dirigir un negocio o proyecto.',
        exampleSentenceEn: 'She runs a design studio in Medellín.',
        exampleSentenceEs: 'Ella administra un estudio de diseño en Medellín.',
        collocations: ['run a business', 'run a company', 'run smoothly']
      }
    ],
    relations: [
      { targetWord: 'sprint', relationType: 'synonym', targetDefinitionEs: 'Pique corto de velocidad' },
      { targetWord: 'manage', relationType: 'synonym', targetDefinitionEs: 'Gestionar / Dirigir' },
      { targetWord: 'walk', relationType: 'antonym', targetDefinitionEs: 'Caminar' }
    ]
  },
  {
    word: 'book',
    cefr_level: 'A1',
    part_of_speech: 'noun & verb',
    ipa: '/bʊk/',
    thematic_cluster: 'objects_and_travel',
    senses: [
      {
        sense_index: 1,
        cefr_level_target: 'A1',
        definition_en: 'A written or printed work consisting of pages.',
        definitionEs: 'Libro: obra impresa o digital de páginas encuadernadas.',
        exampleSentenceEn: 'I read an interesting book about team leadership.',
        exampleSentenceEs: 'Leí un libro interesante sobre liderazgo de equipos.',
        collocations: ['read a book', 'open the book']
      },
      {
        sense_index: 2,
        cefr_level_target: 'A2',
        definition_en: 'To reserve a flight, room, table, or appointment.',
        definitionEs: 'Reservar un vuelo, habitación, mesa o cita.',
        exampleSentenceEn: 'We should book our hotel before the weekend.',
        exampleSentenceEs: 'Deberíamos reservar nuestro hotel antes del fin de semana.',
        collocations: ['book a flight', 'book a room', 'book in advance']
      }
    ],
    relations: [
      { targetWord: 'novel', relationType: 'synonym', targetDefinitionEs: 'Novela' },
      { targetWord: 'reserve', relationType: 'synonym', targetDefinitionEs: 'Reservar' },
      { targetWord: 'cancel', relationType: 'antonym', targetDefinitionEs: 'Cancelar' }
    ]
  },
  {
    word: 'right',
    cefr_level: 'A1',
    part_of_speech: 'adjective & noun',
    ipa: '/raɪt/',
    thematic_cluster: 'direction_and_truth',
    senses: [
      {
        sense_index: 1,
        cefr_level_target: 'A1',
        definition_en: 'Correct, accurate, or true.',
        definitionEs: 'Correcto, acertado o verdadero.',
        exampleSentenceEn: 'Your answer is completely right!',
        exampleSentenceEs: '¡Tu respuesta es completamente correcta!',
        collocations: ['you are right', 'right answer']
      },
      {
        sense_index: 2,
        cefr_level_target: 'A1',
        definition_en: 'Opposite of left (dirección derecha).',
        definitionEs: 'Lado derecho / hacia la derecha.',
        exampleSentenceEn: 'Turn right at the next traffic light.',
        exampleSentenceEs: 'Gira a la derecha en el próximo semáforo.',
        collocations: ['turn right', 'on the right']
      }
    ],
    relations: [
      { targetWord: 'correct', relationType: 'synonym', targetDefinitionEs: 'Correcto' },
      { targetWord: 'left', relationType: 'antonym', targetDefinitionEs: 'Izquierda' },
      { targetWord: 'wrong', relationType: 'antonym', targetDefinitionEs: 'Equivocado' }
    ]
  },
  {
    word: 'light',
    cefr_level: 'A1',
    part_of_speech: 'noun & adjective',
    ipa: '/laɪt/',
    thematic_cluster: 'optics_and_weight',
    senses: [
      {
        sense_index: 1,
        cefr_level_target: 'A1',
        definition_en: 'Natural or artificial brightness (luz).',
        definitionEs: 'Luz natural o eléctrica que permite ver.',
        exampleSentenceEn: 'Please turn on the light in the conference room.',
        exampleSentenceEs: 'Por favor enciende la luz en la sala de conferencias.',
        collocations: ['turn on the light', 'natural light']
      },
      {
        sense_index: 2,
        cefr_level_target: 'A2',
        definition_en: 'Not heavy; weighing very little (liviano / ligero).',
        definitionEs: 'Liviano, ligero; de poco peso.',
        exampleSentenceEn: 'This laptop is very light and easy to carry.',
        exampleSentenceEs: 'Este portátil es muy liviano y fácil de transportar.',
        collocations: ['light bag', 'light meal']
      }
    ],
    relations: [
      { targetWord: 'brightness', relationType: 'synonym', targetDefinitionEs: 'Brillo' },
      { targetWord: 'darkness', relationType: 'antonym', targetDefinitionEs: 'Oscuridad' },
      { targetWord: 'heavy', relationType: 'antonym', targetDefinitionEs: 'Pesado' }
    ]
  }
];

async function seed() {
  console.log('--- POBLANDO VOCABULARIO EN SUPABASE ---');

  for (const item of VOCABULARY_SEED_DATA) {
    // 1. Insert or update word in vocabulary_words
    const { data: wordRec, error: wErr } = await supabase
      .from('vocabulary_words')
      .upsert({
        word: item.word,
        cefr_level: item.cefr_level,
        part_of_speech: item.part_of_speech,
        ipa: item.ipa,
        thematic_cluster: item.thematic_cluster
      }, { onConflict: 'word,cefr_level' })
      .select('id')
      .single();

    if (wErr || !wordRec) {
      console.error(`Error with word ${item.word}:`, wErr?.message);
      continue;
    }

    const wordId = wordRec.id;

    // 2. Insert or update senses
    const senseIdMap = {};
    for (const s of item.senses) {
      const { data: senseRec, error: sErr } = await supabase
        .from('vocabulary_senses')
        .upsert({
          word_id: wordId,
          sense_index: s.sense_index,
          cefr_level_target: s.cefr_level_target,
          definition_en: s.definition_en,
          definition_es: s.definitionEs,
          example_sentence_en: s.exampleSentenceEn,
          example_sentence_es: s.exampleSentenceEs,
          collocations: s.collocations || []
        }, { onConflict: 'word_id,sense_index' })
        .select('id')
        .single();

      if (sErr || !senseRec) {
        console.error(`  Error sense ${s.sense_index} of ${item.word}:`, sErr?.message);
        continue;
      }
      senseIdMap[s.sense_index] = senseRec.id;
    }

    console.log(`Word "${item.word}" (${item.thematic_cluster}) seeded with ${item.senses.length} senses.`);
  }

  console.log('--- SEED COMPLETADO EXITOSAMENTE ---');
}

seed().catch(console.error);
