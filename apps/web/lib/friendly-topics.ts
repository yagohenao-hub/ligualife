/**
 * friendly-topics.ts
 * Nombres intuitivos, directos y pedagógicamente claros para los 60 temas de LinguaLife.
 * Reemplaza nombres crípticos o metafóricos ("The Universal Idea", "Negative Architecture")
 * por títulos transparentes de lo que el alumno realmente va a aprender.
 */

export const FRIENDLY_TOPIC_NAMES: Record<number, { title: string; subtitle: string }> = {
  1: {
    title: 'Palabras de tiempo / Time Words (Estructura Base)',
    subtitle: 'La regla dorada: Quién + Cuándo + Qué hace (Sujeto + Tiempo + Acción)'
  },
  2: {
    title: 'Verbos Modales (Can, Must, Should, Might)',
    subtitle: 'Expresar consejos, obligaciones y posibilidades sin alterar el verbo'
  },
  3: {
    title: 'Presente Simple (Rutinas y Regla de la -S)',
    subtitle: 'Cómo hablar de hábitos diarios y la terminación en He, She, It'
  },
  4: {
    title: 'Pasado Simple (Acciones Pasadas y Uso de Did)',
    subtitle: 'Cómo narrar hechos ocurridos y preguntar en pasado sin complicarte'
  },
  5: {
    title: 'Cómo Negar en Inglés (Don\'t, Doesn\'t, Didn\'t, Won\'t)',
    subtitle: 'La arquitectura universal para decir que no en cualquier tiempo'
  },
  6: {
    title: 'Preguntas de Sí o No (Inversión Básica)',
    subtitle: 'Aprende a formular preguntas directas invirtiendo la palabra de tiempo'
  },
  7: {
    title: 'Preguntas Abiertas (What, Where, When, Why, How)',
    subtitle: 'Cómo recolectar información detallada combinando Wh- con palabras de tiempo'
  },
  8: {
    title: 'Verbo To Be (Ser y Estar: Am, Is, Are)',
    subtitle: 'Describir estados, identidades y lugares sin confundirlo con verbos de acción'
  },
  9: {
    title: 'Pasado del Verbo To Be (Was y Were)',
    subtitle: 'Cómo describir estados, lugares y situaciones pasadas'
  },
  10: {
    title: 'Futuro con Will vs Going to',
    subtitle: 'Decisiones espontáneas vs planes estructurados con fecha'
  },
  11: {
    title: 'Presente Continuo (Acciones en este Instante)',
    subtitle: 'Lo que está ocurriendo ahora mismo: Verbo To Be + terminación -ing'
  },
  12: {
    title: 'Pasado Continuo (Interrupciones y Escenarios Pasados)',
    subtitle: 'Lo que estabas haciendo cuando ocurrió otra acción: Was/Were + -ing'
  },
  13: {
    title: 'Futuro Continuo (Acciones en Progreso Futuro)',
    subtitle: 'Estaré trabajando a esa hora: Will be + -ing'
  },
  14: {
    title: 'Presente Perfecto (Experiencias y Acciones con Impacto Hoy)',
    subtitle: 'Lo que has hecho a lo largo de tu vida: Have/Has + Participio'
  },
  15: {
    title: 'Pasado Perfecto (El Pasado del Pasado)',
    subtitle: 'Lo que ya había sucedido antes de otro momento: Had + Participio'
  },
  16: {
    title: 'Futuro Perfecto (Metas Cumplidas para una Fecha)',
    subtitle: 'Para el próximo mes ya habré terminado: Will have + Participio'
  },
  17: {
    title: 'Tiempos Perfectos Continuos (Duración y Continuidad)',
    subtitle: 'He estado esperando por 2 horas: Have been + -ing'
  },
  18: {
    title: 'Pronombres de Objeto (Me, Him, Her, Us, Them)',
    subtitle: 'Quién recibe la acción sin confundirlo con el sujeto'
  },
  19: {
    title: 'Posesivos Reales (My, Mine, Her, Hers y el \'S)',
    subtitle: 'De quién es cada cosa de manera clara y natural'
  },
  20: {
    title: 'Demostrativos y Ubicación (This, That, These, Those)',
    subtitle: 'Señalar objetos y personas cerca o lejos en singular y plural'
  },
  21: {
    title: 'Preposiciones de Tiempo y Lugar (In, On, At)',
    subtitle: 'Domina cuándo usar In, On o At en fechas, horas y espacios físicos'
  },
  22: {
    title: 'Adjetivos Comparativos y Superlativos',
    subtitle: 'Comparar opciones, precios y ventajas de forma precisa'
  },
  23: {
    title: 'Cuantificadores (Much, Many, A lot, Few, Little)',
    subtitle: 'Expresar cantidades en sustantivos contables e incontables'
  },
  24: {
    title: 'Artículos A, An y The (Cuándo usarlos y cuándo omitirlos)',
    subtitle: 'Evita los errores típicos del español al usar o ignorar "the"'
  },
  25: {
    title: 'Verbos con Gerundio vs Infinitivo (Like doing vs Want to do)',
    subtitle: 'Reglas para saber cuándo poner -ing o "to" tras otro verbo'
  },
  26: {
    title: 'Voz Pasiva en Presente y Pasado (El Enfoque en el Resultado)',
    subtitle: 'Cuando el resultado importa más que quién hizo la acción'
  },
  27: {
    title: 'Condicional Cero y Primero (Causa-Efecto y Posibilidades Reales)',
    subtitle: 'Si estudias, apruebas (If + presente, futuro simple)'
  },
  28: {
    title: 'Segundo Condicional (Situaciones Hipotéticas)',
    subtitle: 'Qué harías si tuvieras más tiempo o presupuesto: If + pasado, would'
  },
  29: {
    title: 'Tercer Condicional (Lamentaciones y Pasados Alternativos)',
    subtitle: 'Si hubiera sabido, habría actuado diferente: If had done, would have'
  },
  30: {
    title: 'Modales de Deducción (Must be, Can\'t be, Might be)',
    subtitle: 'Calcular qué tan seguro estás de algo en tiempo real'
  },
  31: {
    title: 'Modales en Pasado (Should have, Could have, Would have)',
    subtitle: 'Deberías haber venido, podrías haber ganado: Reflexión crítica'
  },
  32: {
    title: 'Phrasal Verbs de Movimiento y Dirección (Out, In, Off, On)',
    subtitle: 'Comprende la lógica espacial detrás de los verbos compuestos'
  },
  33: {
    title: 'Phrasal Verbs Laborales y de Productividad (Wrap up, Follow up)',
    subtitle: 'Los verbos más usados en videollamadas, proyectos y oficina remota'
  },
  34: {
    title: 'Phrasal Verbs Separables vs Inseparables',
    subtitle: 'Dónde colocar el objeto: Turn it off vs Look after someone'
  },
  35: {
    title: 'Estilo Indirecto / Reported Speech',
    subtitle: 'Cómo reportar lo que otra persona dijo en una reunión o correo'
  },
  36: {
    title: 'Preguntas Indirectas y Diplomáticas (Could you tell me...?)',
    subtitle: 'Cómo pedir favores e información con máxima cortesía ejecutiva'
  },
  37: {
    title: 'Question Tags (¿Verdad? / ¿Cierto?)',
    subtitle: 'Confirmar información al final de una frase: Isn\'t it? Don\'t you?'
  },
  38: {
    title: 'Cláusulas Relativas (Who, Which, That, Whose)',
    subtitle: 'Unir dos ideas en una sola oración fluida sin repetir palabras'
  },
  39: {
    title: 'Conectores de Contraste y Causa (Although, However, Despite)',
    subtitle: 'Estructurar argumentos complejos y profesionales'
  },
  40: {
    title: 'Verbos Causativos (Have something done / Make someone do)',
    subtitle: 'Mandar a hacer algo o delegar responsabilidades a terceros'
  },
  41: {
    title: 'Used to vs Be used to vs Get used to',
    subtitle: 'Solía hacer algo vs Estar acostumbrado vs Acostumbrarse'
  },
  42: {
    title: 'Wish y If Only (Deseos Presentes y Pasados)',
    subtitle: 'Ojalá tuviera más tiempo / Ojalá no hubiera dicho eso'
  },
  43: {
    title: 'Adverbios de Frecuencia y Grado (Hardly, Seldom, Quite)',
    subtitle: 'Matizar con precisión la intensidad y regularidad de las acciones'
  },
  44: {
    title: 'Sufijos y Prefijos (Morfología para Multiplicar Vocabulario)',
    subtitle: 'Cómo convertir verbos en adjetivos y sustantivos al instante'
  },
  45: {
    title: 'Colocaciones Esenciales con Make y Do',
    subtitle: 'Cuándo se usa Make y cuándo Do sin caer en la trampa del español'
  },
  46: {
    title: 'Colocaciones con Take, Have y Give',
    subtitle: 'Frases fijas nativas: Take a break, Have a seat, Give a hand'
  },
  47: {
    title: 'Inglés para Negociaciones y Acuerdos',
    subtitle: 'Frases clave para defender tu postura y llegar a consensos de negocio'
  },
  48: {
    title: 'Inglés para Entrevistas de Trabajo Remoto',
    subtitle: 'Cómo hablar de fortalezas, debilidades y proyectos pasados con impacto'
  },
  49: {
    title: 'Presentaciones Profesionales y Pitch de Proyectos',
    subtitle: 'Estructura para abrir, desarrollar y cerrar una charla o demo técnica'
  },
  50: {
    title: 'Redacción de Correos y Mensajes en Slack/Teams',
    subtitle: 'Tono formal e informal para comunicación asíncrona efectiva'
  },
  51: {
    title: 'Expresiones Idiomáticas Cotidianas (Idioms)',
    subtitle: 'Entiende metáforas comunes que no se pueden traducir palabra por palabra'
  },
  52: {
    title: 'Slang y Lenguaje Conversacional de la Costa Este y Oeste',
    subtitle: 'El inglés casual que se escucha en podcasts, series y vida real'
  },
  53: {
    title: 'Pronunciación: Sonidos Vocálicos Críticos (Sheep vs Ship)',
    subtitle: 'Diferenciar pares mínimos para que nunca te malinterpreten'
  },
  54: {
    title: 'Pronunciación: Reducciones y Enlaces Nativos (Connected Speech)',
    subtitle: 'Gonna, wanna, coulda y cómo unir consonantes con vocales'
  },
  55: {
    title: 'Entonación, Énfasis y Ritmo en Inglés',
    subtitle: 'Cómo dar emoción, certeza o sorpresa cambiando el acento en la oración'
  },
  56: {
    title: 'Conversación Espontánea: Cómo Ganar Tiempo para Pensar',
    subtitle: 'Muletillas profesionales y recursos para no quedarte mudo mientras piensas'
  },
  57: {
    title: 'Resolución de Conflictos y Feedback Constructivo',
    subtitle: 'Cómo decir las cosas difíciles sin sonar agresivo ni inseguro'
  },
  58: {
    title: 'Debates y Argumentación Rápida',
    subtitle: 'Cómo defender una postura con datos y contrargumentar con elegancia'
  },
  59: {
    title: 'Inglés para Networking y Charlas Informales (Small Talk)',
    subtitle: 'Romper el hielo y conectar genuinamente en conferencias y eventos'
  },
  60: {
    title: 'Maestría Total: Síntesis de Fluidez y Pensamiento en Inglés',
    subtitle: 'Desconectar la traducción mental definitiva y operar en inglés fluido'
  }
}

/**
 * Retorna un título limpio y representativo para el alumno.
 * Si no se encuentra en el diccionario, limpia paréntesis y prefijos técnicos.
 */
export function getFriendlyTopicName(order?: number | null, rawName?: string | null): string {
  if (order && FRIENDLY_TOPIC_NAMES[order]) {
    return FRIENDLY_TOPIC_NAMES[order].title
  }

  if (!rawName) return 'Clase de Práctica'

  // Limpiar posibles prefijos como "Sesión LDS: " o códigos
  let clean = rawName
    .replace(/^Sesión LDS:\s*/i, '')
    .replace(/^Clase \d+:\s*/i, '')
    .trim()

  // Mapeos de nombres viejos comunes
  const lower = clean.toLowerCase()
  if (lower.includes('universal idea')) {
    return 'Palabras de tiempo / Time Words (Estructura Base)'
  }
  if (lower.includes('time words logic')) {
    return 'Verbos Modales (Can, Must, Should, Might)'
  }
  if (lower.includes('ghost do')) {
    return 'Presente Simple (Rutinas y Regla de la -S)'
  }
  if (lower.includes('ghost did')) {
    return 'Pasado Simple (Acciones Pasadas y Uso de Did)'
  }
  if (lower.includes('negative architecture')) {
    return 'Cómo Negar en Inglés (Don\'t, Doesn\'t, Didn\'t, Won\'t)'
  }
  if (lower.includes('the detective')) {
    return 'Preguntas de Sí o No (Inversión Básica)'
  }

  return clean
}
