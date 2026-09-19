/**
 * curriculum-summary.ts
 * Catálogo pedagógico curado para la vista resumida única (Single Summary Slide)
 * de los 60 temas oficiales de LinguaLife.
 */

export interface TopicSummaryData {
  order: number
  title: string
  phase: string
  level: string
  concept: string
  correctMethod: string
  structureBlocks: string[]
  examples: { en: string; es: string }[]
  commonMistake: {
    explanation: string
    wrong: string
    correct: string
  }
}

export const CURRICULUM_SUMMARY_CATALOG: Record<number, TopicSummaryData> = {
  "1": {
    "order": 1,
    "title": "The Universal Idea",
    "phase": "Installer",
    "level": "A1 - Beginner",
    "concept": "Aprende la ley fundamental que rige todo el inglés: cómo expresar cualquier idea uniendo quién lo hace, el momento en el tiempo y la acción en su forma más pura.",
    "correctMethod": "Estructura: Actor + Temporalidad + Acción. Por ejemplo con modales directos (Will, Can, Would) donde la acción nunca cambia de forma.",
    "structureBlocks": [
      "Protagonista",
      "Palabra de Tiempo",
      "Acción Base"
    ],
    "examples": [
      {
        "en": "I will finish the report tomorrow.",
        "es": "Terminaré el informe mañana (Protagonista + Tiempo + Acción)."
      },
      {
        "en": "She can help you right now.",
        "es": "Ella puede ayudarte ahora mismo."
      },
      {
        "en": "It is raining a lot outside.",
        "es": "Está lloviendo mucho afuera (el sujeto It siempre es obligatorio)."
      }
    ],
    "commonMistake": {
      "explanation": "Omitir el sujeto en inglés (\"It is raining\", no \"Is raining\"). En español el sujeto puede ser tácito, en inglés siempre es indispensable.",
      "wrong": "Is raining outside",
      "correct": "It is raining outside"
    }
  },
  "2": {
    "order": 2,
    "title": "The Time Words Logic",
    "phase": "Installer",
    "level": "A1 - Beginner",
    "concept": "Domina los modales como palabras de tiempo: expresa consejos, obligaciones y posibilidades manteniendo los verbos en su forma más pura.",
    "correctMethod": "Sujeto + Modal (Should/Must/May/Might/Could) + Verbo Base — El universo de las palabras del tiempo fijas. La acción nunca cambia tras un modal.",
    "structureBlocks": [
      "Sujeto",
      "Modal (Should/Must/May/Might/Could)",
      "Verbo Base"
    ],
    "examples": [
      {
        "en": "You should rest before the long trip.",
        "es": "Deberías descansar antes del viaje largo."
      },
      {
        "en": "We must submit the proposal before 5 PM.",
        "es": "Debemos enviar la propuesta antes de las 5 PM."
      },
      {
        "en": "They might join the video call later.",
        "es": "Ellos podrían unirse a la videollamada más tarde."
      }
    ],
    "commonMistake": {
      "explanation": "Agregar \"to\" después de un modal (\"I can to go\", \"I must to work\").",
      "wrong": "to",
      "correct": "I can to go"
    }
  },
  "3": {
    "order": 3,
    "title": "The Present & The Ghost Do",
    "phase": "Installer",
    "level": "A1 - Beginner",
    "concept": "Descubre la excepción del presente simple y cómo la palabra de tiempo Do se esconde en afirmaciones pero exige la terminación -s con He, She e It.",
    "correctMethod": "Do/Does + Acción Base | He/She/It + Verbo(-s) — La excepción del presente: Por qué Do se oculta en afirmación pero altera la 3ra persona con -s.",
    "structureBlocks": [
      "Do/Does",
      "Acción Base | He/She/It",
      "Verbo(-s)"
    ],
    "examples": [
      {
        "en": "He lives in Medellín and works remotely.",
        "es": "Él vive en Medellín y trabaja de forma remota."
      },
      {
        "en": "Do you have the contract ready?",
        "es": "¿Tienes el contrato listo?"
      },
      {
        "en": "She doesn't drink coffee after 4 PM.",
        "es": "Ella no toma café después de las 4 PM."
      }
    ],
    "commonMistake": {
      "explanation": "Olvidar la -s en 3ra persona o duplicarla en preguntas (\"Does he works?\").",
      "wrong": "Traducir literalmente desde el español",
      "correct": "Usar la estructura nativa en inglés"
    }
  },
  "4": {
    "order": 4,
    "title": "The Past & The Ghost Did",
    "phase": "Installer",
    "level": "A2 - Elementary",
    "concept": "Comprende el pasado sin listas interminables: entiende el rol del Did oculto y cómo libera al verbo en preguntas y respuestas negativas.",
    "correctMethod": "Did + Acción Base | Afirmación: Verbo(-ed/irregular) — La excepción del pasado: Did se oculta en afirmación transformando el verbo, pero reaparece en negación y pregunta.",
    "structureBlocks": [
      "Did",
      "Acción Base | Afirmación: Verbo(-ed/irregular)"
    ],
    "examples": [
      {
        "en": "We launched the new product last week.",
        "es": "Lanzamos el nuevo producto la semana pasada."
      },
      {
        "en": "Did you receive the confirmation email?",
        "es": "¿Recibiste el correo de confirmación?"
      },
      {
        "en": "I didn't see the notification in time.",
        "es": "No vi la notificación a tiempo (verbo en base con Did)."
      }
    ],
    "commonMistake": {
      "explanation": "Doble pasado: conjugar el verbo cuando ya está did (\"I didn't went\", \"Did you saw?\").",
      "wrong": "I didn't went",
      "correct": "Did you saw?"
    }
  },
  "5": {
    "order": 5,
    "title": "Negative Architecture",
    "phase": "Installer",
    "level": "A2 - Elementary",
    "concept": "Aprende la regla universal para negar cualquier idea en inglés uniendo la palabra de tiempo con el operador de negación.",
    "correctMethod": "Sujeto + Palabra de Tiempo + Not + Acción Base — Negación universal: Se niega pegando Not a la Palabra de Tiempo (Don't, Didn't, Won't, Can't, Shouldn't).",
    "structureBlocks": [
      "Sujeto",
      "Palabra de Tiempo",
      "Not",
      "Acción Base"
    ],
    "examples": [
      {
        "en": "I don't agree with that proposal.",
        "es": "No estoy de acuerdo con esa propuesta."
      },
      {
        "en": "She won't come to today's session.",
        "es": "Ella no vendrá a la sesión de hoy."
      },
      {
        "en": "We shouldn't take unnecessary risks.",
        "es": "No deberíamos tomar riesgos innecesarios."
      }
    ],
    "commonMistake": {
      "explanation": "Negar solo con \"no\" antes del verbo (\"I no have car\", \"She no like\").",
      "wrong": "no",
      "correct": "I no have car"
    }
  },
  "6": {
    "order": 6,
    "title": "The Detective (Yes/No Questions)",
    "phase": "Installer",
    "level": "A2 - Elementary",
    "concept": "Activa el modo detective: invierte el orden de la palabra de tiempo para interrogar con precisión y seguridad.",
    "correctMethod": "Palabra de Tiempo + Sujeto + Acción Base? — Inversión interrogativa: Mover la palabra de tiempo al inicio para interrogar.",
    "structureBlocks": [
      "Palabra de Tiempo",
      "Sujeto",
      "Acción Base?"
    ],
    "examples": [
      {
        "en": "Are you ready for the final interview?",
        "es": "¿Estás listo para la entrevista final?"
      },
      {
        "en": "Can you send me the slide deck?",
        "es": "¿Puedes enviarme la presentación?"
      },
      {
        "en": "Did they approve the quarterly budget?",
        "es": "¿Aprobaron ellos el presupuesto trimestral?"
      }
    ],
    "commonMistake": {
      "explanation": "Preguntar con orden afirmativo usando solo entonación española (\"You live here?\").",
      "wrong": "Traducir literalmente desde el español",
      "correct": "Usar la estructura nativa en inglés"
    }
  },
  "7": {
    "order": 7,
    "title": "Wh- Questions (Informativas)",
    "phase": "Installer",
    "level": "A2 - Elementary",
    "concept": "Aprende a formular preguntas profundas combinando las palabras interrogativas Wh- con la estructura universal de tiempo.",
    "correctMethod": "Wh- + Palabra de Tiempo + Sujeto + Acción Base? — Preguntas abiertas para recolectar información: What, Where, When, Why, Who, How.",
    "structureBlocks": [
      "Wh-",
      "Palabra de Tiempo",
      "Sujeto",
      "Acción Base?"
    ],
    "examples": [
      {
        "en": "Where do you see yourself in five years?",
        "es": "¿Dónde te ves dentro de cinco años?"
      },
      {
        "en": "Why did you choose this tech stack?",
        "es": "¿Por qué elegiste esta arquitectura tecnológica?"
      },
      {
        "en": "What will happen after the launch?",
        "es": "¿Qué sucederá después del lanzamiento?"
      }
    ],
    "commonMistake": {
      "explanation": "Omitir la palabra de tiempo o alterar el orden (\"What you do?\", \"Where you go?\").",
      "wrong": "What you do?",
      "correct": "Where you go?"
    }
  },
  "8": {
    "order": 8,
    "title": "Wh- Words Afirmativas (Conectores)",
    "phase": "Installer",
    "level": "A2 - Elementary",
    "concept": "Usa las palabras Wh- como conectores fluidos en oraciones afirmativas sin caer en la trampa de invertir el orden verbal.",
    "correctMethod": "Sujeto + Verbo + [Wh- + Sujeto + Palabra de Tiempo + Acción] — Uso afirmativo de What, Where, When, How como conectores indirectos sin invertir orden.",
    "structureBlocks": [
      "Sujeto",
      "Verbo",
      "[Wh-",
      "Sujeto",
      "Palabra de Tiempo",
      "Acción]"
    ],
    "examples": [
      {
        "en": "I know where you live.",
        "es": "Sé dónde vives (orden directo sin inversión)."
      },
      {
        "en": "Tell me what you think about this plan.",
        "es": "Dime qué piensas sobre este plan."
      },
      {
        "en": "She explained how the algorithm works.",
        "es": "Ella explicó cómo funciona el algoritmo."
      }
    ],
    "commonMistake": {
      "explanation": "Invertir como si fuera pregunta cuando es una afirmación (\"I know where do you live\").",
      "wrong": "Traducir literalmente desde el español",
      "correct": "Usar la estructura nativa en inglés"
    }
  },
  "9": {
    "order": 9,
    "title": "The Imperative Mode",
    "phase": "Installer",
    "level": "A2 - Elementary",
    "concept": "Comunica instrucciones, advertencias y pasos claros de forma directa e inmediata con el modo imperativo.",
    "correctMethod": "Verbo Base + Objeto / Complemento | Negativo: Don't + Verbo Base — Modo Imperativo: Comandos directos, instrucciones, recetas y llamadas a la acción sin sujeto explícito.",
    "structureBlocks": [
      "Verbo Base",
      "Objeto / Complemento | Negativo: Don't",
      "Verbo Base"
    ],
    "examples": [
      {
        "en": "Please close the door quietly.",
        "es": "Por favor cierra la puerta con cuidado."
      },
      {
        "en": "Don't press the emergency button.",
        "es": "No presiones el botón de emergencia."
      },
      {
        "en": "Send me the invoice as soon as possible.",
        "es": "Envíame la factura lo más pronto posible."
      }
    ],
    "commonMistake": {
      "explanation": "Poner \"to\" antes del verbo o usar pronombres forzados (\"To listen me\", \"You take this\").",
      "wrong": "to",
      "correct": "To listen me"
    }
  },
  "10": {
    "order": 10,
    "title": "Continuous Logic (-ing base)",
    "phase": "Installer",
    "level": "A2 - Elementary",
    "concept": "Entiende la lógica del proceso continuo: cómo el verbo To Be sostiene el tiempo mientras la acción fluye en tiempo real con -ing.",
    "correctMethod": "Sujeto + Be (Tiempo) + Acción-ing — El proceso en desarrollo: El verbo Be actúa como la palabra de tiempo y el verbo principal lleva -ing.",
    "structureBlocks": [
      "Sujeto",
      "Be (Tiempo)",
      "Acción-ing"
    ],
    "examples": [
      {
        "en": "I am writing the quarterly review right now.",
        "es": "Estoy escribiendo la revisión trimestral ahora mismo."
      },
      {
        "en": "They are discussing the compensation package.",
        "es": "Están discutiendo el paquete de compensación."
      },
      {
        "en": "What are you working on today?",
        "es": "¿En qué estás trabajando hoy?"
      }
    ],
    "commonMistake": {
      "explanation": "Omitir el verbo to be auxiliar (\"I working in my computer\", \"She looking for you\").",
      "wrong": "I working in my computer",
      "correct": "She looking for you"
    }
  },
  "11": {
    "order": 11,
    "title": "Zero Conditional (Universal Truths)",
    "phase": "Installer",
    "level": "B1 - Intermediate",
    "concept": "Expresa verdades universales y relaciones directas de causa y efecto con el condicional cero.",
    "correctMethod": "If / When + Presente, Presente — Modo Condicional 0: Hechos científicos, reglas fijas y causa-efecto invariable.",
    "structureBlocks": [
      "If / When",
      "Presente, Presente"
    ],
    "examples": [
      {
        "en": "If you heat water to 100°C, it boils.",
        "es": "Si calientas agua a 100°C, hierve (hecho invariable)."
      },
      {
        "en": "When employees get feedback, they improve faster.",
        "es": "Cuando los empleados reciben feedback, mejoran más rápido."
      }
    ],
    "commonMistake": {
      "explanation": "Traducir \"si\" condicional como \"yes\" o mezclar tiempos con futuro.",
      "wrong": "si",
      "correct": "yes"
    }
  },
  "12": {
    "order": 12,
    "title": "First Conditional (Real Predictions)",
    "phase": "Installer",
    "level": "B1 - Intermediate",
    "concept": "Construye acuerdos, promesas y predicciones reales de futuro conectando una condición presente con un resultado cierto.",
    "correctMethod": "If + Presente Simple, Will + Acción Base — Modo Condicional 1: Condiciones reales de futuro, acuerdos y promesas.",
    "structureBlocks": [
      "If",
      "Presente Simple, Will",
      "Acción Base"
    ],
    "examples": [
      {
        "en": "If we close the deal today, we will celebrate tonight.",
        "es": "Si cerramos el trato hoy, celebraremos esta noche."
      },
      {
        "en": "I will call you if I get the results early.",
        "es": "Te llamaré si obtengo los resultados temprano."
      }
    ],
    "commonMistake": {
      "explanation": "Poner \"will\" en la cláusula del If (\"If I will have time, I will call you\").",
      "wrong": "will",
      "correct": "If I will have time, I will call you"
    }
  },
  "13": {
    "order": 13,
    "title": "Second Conditional (Hypothetical Dreams)",
    "phase": "Installer",
    "level": "B1 - Intermediate",
    "concept": "Atrévete a soñar y plantear hipótesis: cómo hablar de situaciones imaginarias y sus consecuencias con el segundo condicional.",
    "correctMethod": "If + Pasado Simple, Would + Acción Base — Modo Condicional 2: Escenarios hipotéticos, imaginarios o de baja probabilidad.",
    "structureBlocks": [
      "If",
      "Pasado Simple, Would",
      "Acción Base"
    ],
    "examples": [
      {
        "en": "If I had more free time, I would learn German.",
        "es": "Si tuviera más tiempo libre, aprendería alemán."
      },
      {
        "en": "What would you do if you won the grant?",
        "es": "¿Qué harías si ganaras la beca?"
      }
    ],
    "commonMistake": {
      "explanation": "Doble condicional o mezclar would en la condición (\"If I would win the lottery...\").",
      "wrong": "Traducir literalmente desde el español",
      "correct": "Usar la estructura nativa en inglés"
    }
  },
  "14": {
    "order": 14,
    "title": "Third Conditional (Forensic Past)",
    "phase": "Installer",
    "level": "B1 - Intermediate",
    "concept": "Realiza análisis retrospectivos del pasado: aprende a lamentar o evaluar lo que habría pasado si las cosas hubiesen sido distintas.",
    "correctMethod": "If + Had + Participio, Would have + Participio — Modo Condicional 3: Análisis forense del pasado. Lo que no sucedió y su resultado ficticio.",
    "structureBlocks": [
      "If",
      "Had",
      "Participio, Would have",
      "Participio"
    ],
    "examples": [
      {
        "en": "If I had known about the traffic, I would have left earlier.",
        "es": "Si hubiera sabido del tráfico, habría salido más temprano."
      },
      {
        "en": "She would have passed the test if she had studied.",
        "es": "Ella habría aprobado el examen si hubiera estudiado."
      }
    ],
    "commonMistake": {
      "explanation": "Traducir literalmente el \"hubiera/habría\" del español generando enredos sintácticos.",
      "wrong": "Traducir literalmente desde el español",
      "correct": "Usar la estructura nativa en inglés"
    }
  },
  "15": {
    "order": 15,
    "title": "Mixed Conditionals",
    "phase": "Installer",
    "level": "B1 - Intermediate",
    "concept": "Conecta el pasado con tu presente: cómo decisiones tomadas ayer moldean tu realidad actual mediante condicionales mixtos.",
    "correctMethod": "If + Had + Participio (Pasado), Would + Acción Base (Hoy) — Condicionales mixtos: Una causa en el pasado que tiene impacto tangible en el presente.",
    "structureBlocks": [
      "If",
      "Had",
      "Participio (Pasado), Would",
      "Acción Base (Hoy)"
    ],
    "examples": [
      {
        "en": "If I had moved to London back then, I would speak fluent English today.",
        "es": "Si me hubiera mudado a Londres en aquel entonces, hoy hablaría inglés fluido."
      }
    ],
    "commonMistake": {
      "explanation": "Rigidez sintáctica creyendo que siempre se debe emparejar pasado con pasado.",
      "wrong": "Traducir literalmente desde el español",
      "correct": "Usar la estructura nativa en inglés"
    }
  },
  "16": {
    "order": 16,
    "title": "The Subjunctive Mode",
    "phase": "Installer",
    "level": "B1 - Intermediate",
    "concept": "Domina el modo subjuntivo en inglés: la estructura elegante para hacer recomendaciones formales e institucionales.",
    "correctMethod": "Suggest / Recommend / Demand that + Sujeto + Verbo Base — Modo Subjuntivo en inglés: Exigencias, recomendaciones formales y mandatos sin -s en tercera persona.",
    "structureBlocks": [
      "Suggest / Recommend / Demand that",
      "Sujeto",
      "Verbo Base"
    ],
    "examples": [
      {
        "en": "I recommend that he be present at the hearing.",
        "es": "Recomiendo que él esté presente en la audiencia."
      },
      {
        "en": "The CEO demanded that the team deliver on time.",
        "es": "El director ejecutivo exigió que el equipo entregara a tiempo."
      }
    ],
    "commonMistake": {
      "explanation": "Conjugar la tercera persona con -s en el subjuntivo (\"I suggest that he goes\").",
      "wrong": "Traducir literalmente desde el español",
      "correct": "Usar la estructura nativa en inglés"
    }
  },
  "17": {
    "order": 17,
    "title": "The 4 Verbal Modes Map (Full Anatomy)",
    "phase": "Installer",
    "level": "B1 - Intermediate",
    "concept": "La gran panorámica: analiza textos reales y comprueba cómo el 90% de las ideas activas se resumen en los 4 modos verbales.",
    "correctMethod": "4 Cuadrantes: Indicativo | Imperativo | Condicional | Subjuntivo — Integración visual y decodificación de textos reales: clasificar cualquier idea en uno de los 4 modos.",
    "structureBlocks": [
      "4 Cuadrantes: Indicativo | Imperativo | Condicional | Subjuntivo"
    ],
    "examples": [
      {
        "en": "Indicativo: I build software. • Condicional: I would build it. • Subjuntivo: I demand that you build it.",
        "es": "Mapa de los 4 modos verbales en acción simultánea."
      }
    ],
    "commonMistake": {
      "explanation": "Creer que cada tiempo verbal es un mundo aislado sin ver el mapa unificado de los 4 modos.",
      "wrong": "Traducir literalmente desde el español",
      "correct": "Usar la estructura nativa en inglés"
    }
  },
  "18": {
    "order": 18,
    "title": "The Actors (Subject vs Object Pronouns)",
    "phase": "Installer",
    "level": "B1 - Intermediate",
    "concept": "Distingue claramente quién ejecuta la acción de quién la recibe para evitar confusiones comunes con los pronombres.",
    "correctMethod": "Sujeto (Actor) + Verbo + Objeto (Receptor: me/him/her/us/them) — Diferencia entre el ejecutor de la acción y el que la recibe. Pronombres preposicionales.",
    "structureBlocks": [
      "Sujeto (Actor)",
      "Verbo",
      "Objeto (Receptor: me/him/her/us/them)"
    ],
    "examples": [
      {
        "en": "She invited him to the conference, but he didn't answer her.",
        "es": "Ella lo invitó a la conferencia, pero él no le respondió."
      },
      {
        "en": "Talk to us whenever you need guidance.",
        "es": "Habla con nosotros cada vez que necesites orientación."
      }
    ],
    "commonMistake": {
      "explanation": "Usar pronombres de sujeto al final de la oración (\"He called she\", \"Talk to I\").",
      "wrong": "He called she",
      "correct": "Talk to I"
    }
  },
  "19": {
    "order": 19,
    "title": "Possession Architecture",
    "phase": "Installer",
    "level": "B1 - Intermediate",
    "concept": "Expresa propiedad y pertenencia con naturalidad sin recurrir a la traducción literal de \"de\" con la preposición of.",
    "correctMethod": "Owner's + Object | Mine / Yours / His / Hers / Ours / Theirs — Lógica de pertenencia: Tener (Have/Has) vs Posesivo anglosajón ('s) vs Pronombres posesivos.",
    "structureBlocks": [
      "Owner's",
      "Object | Mine / Yours / His / Hers / Ours / Theirs"
    ],
    "examples": [
      {
        "en": "This is Carlos's computer; mine is in the office.",
        "es": "Esta es la computadora de Carlos; la mía está en la oficina."
      },
      {
        "en": "Is this notebook yours or theirs?",
        "es": "¿Este cuaderno es tuyo o de ellos?"
      }
    ],
    "commonMistake": {
      "explanation": "Abusar de la preposición \"of\" para pertenencia de personas (\"The car of my brother\").",
      "wrong": "of",
      "correct": "The car of my brother"
    }
  },
  "20": {
    "order": 20,
    "title": "Checkpoint 1: The B2 Core Review",
    "phase": "Installer",
    "level": "B1 - Intermediate",
    "concept": "Consolida tu primer gran salto: evaluación y práctica integral de los 4 modos verbales para asegurar fluidez activa.",
    "correctMethod": "Mapeo libre y activo de los 4 Modos Verbales — Simulacro y consolidación del primer tercio: agilidad mental para saltar entre modos y tiempos.",
    "structureBlocks": [
      "Mapeo libre y activo de los 4 Modos Verbales"
    ],
    "examples": [
      {
        "en": "Comprehensive B2 review: Fluid transitions across all verbal modes.",
        "es": "Repaso de fluidez: transiciones naturales entre modos y tiempos."
      }
    ],
    "commonMistake": {
      "explanation": "Titubeos al alternar rápidamente entre pasado, futuro y condicionales en tiempo real.",
      "wrong": "Traducir literalmente desde el español",
      "correct": "Usar la estructura nativa en inglés"
    }
  },
  "21": {
    "order": 21,
    "title": "The Magic of GET",
    "phase": "Builder",
    "level": "B1 - Intermediate",
    "concept": "Descifra el verbo más versátil del inglés: aprende cómo Get reemplaza a decenas de verbos para expresar cambios, llegadas y entendimiento.",
    "correctMethod": "Get + Adj (cambio) | Get + Lugar (llegar) | Get + Noun (obtener) | Get + Idea (entender) — El verbo camaleón del inglés: Desactivar la necesidad de buscar 5 verbos distintos para estados y cambios.",
    "structureBlocks": [
      "Get",
      "Adj (cambio) | Get",
      "Lugar (llegar) | Get",
      "Noun (obtener) | Get",
      "Idea (entender)"
    ],
    "examples": [
      {
        "en": "I got tired after the workout. • I got home at 8. • I got your email.",
        "es": "Me cansé (cambio). • Llegué a casa (llegar). • Recibí tu correo (obtener)."
      }
    ],
    "commonMistake": {
      "explanation": "Desconocer los múltiples usos de get y abusar de \"become\" o \"arrive\" en contextos informales.",
      "wrong": "become",
      "correct": "arrive"
    }
  },
  "22": {
    "order": 22,
    "title": "The Passive Observer (Passive Voice 1)",
    "phase": "Builder",
    "level": "B1 - Intermediate",
    "concept": "Cambia el foco de tus oraciones: usa la voz pasiva para destacar los resultados y productos por encima de quién los realizó.",
    "correctMethod": "Objeto Relevante + Be (am/is/are/was/were) + Participio Pasado — Voz Pasiva en presente y pasado: Cambiar el foco hacia el resultado cuando el actor es desconocido o irrelevante.",
    "structureBlocks": [
      "Objeto Relevante",
      "Be (am/is/are/was/were)",
      "Participio Pasado"
    ],
    "examples": [
      {
        "en": "The report was written by our senior analyst.",
        "es": "El informe fue escrito por nuestro analista sénior."
      },
      {
        "en": "Millions of messages are processed every second.",
        "es": "Millones de mensajes son procesados cada segundo."
      }
    ],
    "commonMistake": {
      "explanation": "Intentar usar el \"se\" reflexivo del español traduciéndolo como activo (\"It explains alone\").",
      "wrong": "se",
      "correct": "It explains alone"
    }
  },
  "23": {
    "order": 23,
    "title": "Passive Voice 2 (Future & Modals)",
    "phase": "Builder",
    "level": "B1 - Intermediate",
    "concept": "Expresa políticas, expectativas y entregables futuros utilizando la voz pasiva combinada con verbos modales.",
    "correctMethod": "Objeto + Modal (Will/Can/Must/Should) + Be + Participio Pasado — Voz Pasiva extendida a proyectos futuros, normas y regulaciones institucionales.",
    "structureBlocks": [
      "Objeto",
      "Modal (Will/Can/Must/Should)",
      "Be",
      "Participio Pasado"
    ],
    "examples": [
      {
        "en": "The issue will be resolved before tomorrow morning.",
        "es": "El problema será resuelto antes de mañana por la mañana."
      },
      {
        "en": "All passwords must be updated every 90 days.",
        "es": "Todas las contraseñas deben ser actualizadas cada 90 días."
      }
    ],
    "commonMistake": {
      "explanation": "Olvidar el \"be\" intermedio al combinar modales con pasiva (\"It will solved\").",
      "wrong": "be",
      "correct": "It will solved"
    }
  },
  "24": {
    "order": 24,
    "title": "The Causatives (Have/Get something done)",
    "phase": "Builder",
    "level": "B1 - Intermediate",
    "concept": "Aprende a delegar en inglés: la estructura exacta para hablar de servicios profesionales y cosas que otros hacen por ti.",
    "correctMethod": "Sujeto + Have / Get + Objeto + Participio Pasado — Estructuras causativas: Cuando no haces la acción tú mismo sino que pagas o delegas a un tercero.",
    "structureBlocks": [
      "Sujeto",
      "Have / Get",
      "Objeto",
      "Participio Pasado"
    ],
    "examples": [
      {
        "en": "I had my car inspected at the certified shop.",
        "es": "Hice revisar mi carro en el taller certificado (servicio delegado)."
      },
      {
        "en": "We need to get our website redesigned.",
        "es": "Necesitamos mandar a rediseñar nuestro sitio web."
      }
    ],
    "commonMistake": {
      "explanation": "Decir \"I cut my hair\" o \"I repaired my car\" cuando en realidad fue un profesional.",
      "wrong": "I cut my hair",
      "correct": "I repaired my car"
    }
  },
  "25": {
    "order": 25,
    "title": "The -ING Universe (Part 1: Verbo & Sujeto)",
    "phase": "Builder",
    "level": "B1 - Intermediate",
    "concept": "Transforma cualquier verbo en el protagonista de tu oración utilizando el -ing como sustantivo y sujeto.",
    "correctMethod": "V-ing como Sujeto (Reading improves memory) | Like/Love/Hate + V-ing — El gerundio como sustantivo: Actuar como el actor o tema principal de la oración.",
    "structureBlocks": [
      "V-ing como Sujeto (Reading improves memory) | Like/Love/Hate",
      "V-ing"
    ],
    "examples": [
      {
        "en": "Learning English opens global doors.",
        "es": "Aprender inglés abre puertas globales (el verbo como sujeto lleva -ing)."
      },
      {
        "en": "Swimming is one of the best cardiovascular workouts.",
        "es": "Nadar es uno de los mejores entrenamientos cardiovasculares."
      }
    ],
    "commonMistake": {
      "explanation": "Iniciar oraciones con infinitivo traduciendo del español (\"To smoke is bad\", \"To learn English is good\").",
      "wrong": "To smoke is bad",
      "correct": "To learn English is good"
    }
  },
  "26": {
    "order": 26,
    "title": "The -ING Universe (Part 2: Preposiciones & Adjetivos)",
    "phase": "Builder",
    "level": "B1 - Intermediate",
    "concept": "Domina la regla de oro de las preposiciones y evita el clásico error de confundir tus estados de ánimo con adjetivos en -ed y -ing.",
    "correctMethod": "Preposición + V-ing | Adjetivos en -ed (sentimiento) vs -ing (causante) — Regla de oro: Todo verbo tras preposición lleva -ing. Diferencia entre bored y boring.",
    "structureBlocks": [
      "Preposición",
      "V-ing | Adjetivos en -ed (sentimiento) vs -ing (causante)"
    ],
    "examples": [
      {
        "en": "Thank you for listening to my presentation.",
        "es": "Gracias por escuchar mi presentación (tras preposición va -ing)."
      },
      {
        "en": "I am interested in joining your company.",
        "es": "Estoy interesado en unirme a su empresa."
      }
    ],
    "commonMistake": {
      "explanation": "Poner verbo en base tras preposición (\"Before to leave\", \"Interested in learn\") y confundir bored con boring.",
      "wrong": "Before to leave",
      "correct": "Interested in learn"
    }
  },
  "27": {
    "order": 27,
    "title": "Surgical Pronunciation Clinic",
    "phase": "Builder",
    "level": "B1 - Intermediate",
    "concept": "Clínica de pronunciación de alta precisión: desactiva los vicios fonéticos comunes del hispanohablante y gana claridad instantánea.",
    "correctMethod": "Mecánica bucal: Sonidos /θ/ y /ð/ (TH) | S limpia inicial | Linking sounds | -ed final — Entrenamiento fonético práctico diseñado específicamente para corregir los 4 vicios musculares del hispanohablante.",
    "structureBlocks": [
      "Mecánica bucal: Sonidos /θ/ y /ð/ (TH) | S limpia inicial | Linking sounds | -ed final"
    ],
    "examples": [
      {
        "en": "Think /θɪŋk/ vs This /ðɪs/ • Clean S: Speak /spiːk/ without e.",
        "es": "Articulación muscular limpia para una pronunciación natural y clara."
      }
    ],
    "commonMistake": {
      "explanation": "Agregar una \"e\" antes de la s (\"espeak\", \"eschool\") y pronunciar la -ed final como \"ed\" completa.",
      "wrong": "e",
      "correct": "espeak"
    }
  },
  "28": {
    "order": 28,
    "title": "The Logic of Space: In, On, At",
    "phase": "Builder",
    "level": "B1 - Intermediate",
    "concept": "Elimina para siempre la duda con el trío In, On y At mediante la lógica geométrica del espacio.",
    "correctMethod": "In (Volumen 3D / Ciudades) | On (Superficie 2D / Transporte) | At (Punto exacto / Evento) — Geometría espacial de las preposiciones: De lo general y contenido a la superficie y el punto exacto.",
    "structureBlocks": [
      "In (Volumen 3D / Ciudades) | On (Superficie 2D / Transporte) | At (Punto exacto / Evento)"
    ],
    "examples": [
      {
        "en": "In Colombia (país/volumen) • On the bus (transporte/superficie) • At the door (punto exacto).",
        "es": "Lógica geométrica del espacio para In, On y At."
      }
    ],
    "commonMistake": {
      "explanation": "Decir \"I am in the bus\" o \"At Colombia\" traduciendo literalmente el \"en\" español.",
      "wrong": "I am in the bus",
      "correct": "At Colombia"
    }
  },
  "29": {
    "order": 29,
    "title": "The Logic of Time: In, On, At",
    "phase": "Builder",
    "level": "B1 - Intermediate",
    "concept": "Aprende la escala temporal de In, On y At para agendar citas, eventos y fechas con total precisión.",
    "correctMethod": "In (Meses / Años / Siglos) | On (Días específicos / Fechas) | At (Horas exactas / Momentos clave) — Cronología de las preposiciones: De periodos amplios a días calendario y minutos precisos.",
    "structureBlocks": [
      "In (Meses / Años / Siglos) | On (Días específicos / Fechas) | At (Horas exactas / Momentos clave)"
    ],
    "examples": [
      {
        "en": "In July / In 2026 (mes/año) • On Monday (día) • At 3:30 PM (hora exacta).",
        "es": "Lógica cronológica de In, On y At sin confusiones."
      }
    ],
    "commonMistake": {
      "explanation": "Decir \"In Monday\" o \"At the morning\" en lugar de On Monday e In the morning.",
      "wrong": "In Monday",
      "correct": "At the morning"
    }
  },
  "30": {
    "order": 30,
    "title": "The Great Clash: Make vs. Do",
    "phase": "Builder",
    "level": "B1 - Intermediate",
    "concept": "Resuelve el eterno dilema del verbo hacer: aprende qué actividades se construyen con Make y cuáles con Do.",
    "correctMethod": "Make (Crear / Producir / Decisiones) vs Do (Tareas / Obligaciones / Acciones generales) — Desactivar la interferencia del verbo \"hacer\": Clasificación por creación material vs acción ejecutiva.",
    "structureBlocks": [
      "Make (Crear / Producir / Decisiones) vs Do (Tareas / Obligaciones / Acciones generales)"
    ],
    "examples": [
      {
        "en": "I am used to waking up at 5 AM. • I used to play guitar.",
        "es": "Estoy acostumbrado a madrugar (hábito actual) vs Yo solía tocar guitarra (pasado)."
      }
    ],
    "commonMistake": {
      "explanation": "Decir \"Make exercise\", \"Make homework\", \"Do a mistake\", \"Do money\".",
      "wrong": "Make exercise",
      "correct": "Make homework"
    }
  },
  "31": {
    "order": 31,
    "title": "Phrasal Verbs 1: Logic of Movement",
    "phase": "Builder",
    "level": "B1 - Intermediate",
    "concept": "Comprende los phrasal verbs desde su lógica direccional: cómo partículas como Up, Down y Off transforman el significado del verbo.",
    "correctMethod": "Verbo de Acción + Partícula Física (Up, Down, In, Out, Off, Away) — La lógica direccional de las preposiciones: Cómo la partícula modifica el rumbo físico de la acción.",
    "structureBlocks": [
      "Verbo de Acción",
      "Partícula Física (Up, Down, In, Out, Off, Away)"
    ],
    "examples": [
      {
        "en": "Natural phrasing for Phrasal Verbs 1: Logic of Movement.",
        "es": "Expresión natural para comunicar Phrasal Verbs 1: Logic of Movement con confianza."
      },
      {
        "en": "Practice building your own thought using this structure.",
        "es": "Practica creando tu propia oración con esta estructura comunicativa."
      }
    ],
    "commonMistake": {
      "explanation": "Traducir palabra por palabra en lugar de procesar el phrasal verb como un único bloque semántico.",
      "wrong": "Traducir literalmente desde el español",
      "correct": "Usar la estructura nativa en inglés"
    }
  },
  "32": {
    "order": 32,
    "title": "Phrasal Verbs 2: Abstract & Social",
    "phase": "Builder",
    "level": "B1 - Intermediate",
    "concept": "Suena natural y fluido: domina los phrasal verbs más usados en conversaciones sociales y resolución de problemas cotidianos.",
    "correctMethod": "Phrasals metafóricos: Break up, Figure out, Run out of, Look forward to, Put off — Phrasal verbs esenciales para relaciones personales, resolución de problemas y vida social.",
    "structureBlocks": [
      "Phrasals metafóricos: Break up, Figure out, Run out of, Look forward to, Put off"
    ],
    "examples": [
      {
        "en": "Natural phrasing for Phrasal Verbs 2: Abstract & Social.",
        "es": "Expresión natural para comunicar Phrasal Verbs 2: Abstract & Social con confianza."
      },
      {
        "en": "Practice building your own thought using this structure.",
        "es": "Practica creando tu propia oración con esta estructura comunicativa."
      }
    ],
    "commonMistake": {
      "explanation": "Buscar verbos ultra-formales latinos (como \"postpone\" o \"extinguish\") donde los nativos siempre usan phrasals.",
      "wrong": "postpone",
      "correct": "extinguish"
    }
  },
  "33": {
    "order": 33,
    "title": "Connectors of Contrast (El \"pero\" elegante)",
    "phase": "Builder",
    "level": "B1 - Intermediate",
    "concept": "Eleva tu nivel conversacional: aprende a contrastar ideas complejas utilizando conectores formales y elegantes.",
    "correctMethod": "Although / Even though + Cláusula | However, + S+T+A | Despite / In spite of + Noun/-ing — Contrastar ideas con fluidez ejecutiva sin depender exclusivamente del monosílabo \"but\".",
    "structureBlocks": [
      "Although / Even though",
      "Cláusula | However,",
      "S",
      "T",
      "A | Despite / In spite of",
      "Noun/-ing"
    ],
    "examples": [
      {
        "en": "Natural phrasing for Connectors of Contrast (El \"pero\" elegante).",
        "es": "Expresión natural para comunicar Connectors of Contrast (El \"pero\" elegante) con confianza."
      },
      {
        "en": "Practice building your own thought using this structure.",
        "es": "Practica creando tu propia oración con esta estructura comunicativa."
      }
    ],
    "commonMistake": {
      "explanation": "Usar \"However\" en la misma posición de \"but\" o poner sujeto y verbo tras \"despite\" sin el -ing.",
      "wrong": "However",
      "correct": "but"
    }
  },
  "34": {
    "order": 34,
    "title": "Connectors of Purpose & Result",
    "phase": "Builder",
    "level": "B1 - Intermediate",
    "concept": "Explica el propósito y las consecuencias de tus acciones sin caer en la trampa del español al expresar el para qué.",
    "correctMethod": "In order to / To + Verbo Base | So that + S+T+A | Therefore / As a result — Explicar el propósito (\"para qué\") y el resultado de las acciones de manera estructurada.",
    "structureBlocks": [
      "In order to / To",
      "Verbo Base | So that",
      "S",
      "T",
      "A | Therefore / As a result"
    ],
    "examples": [
      {
        "en": "Natural phrasing for Connectors of Purpose & Result.",
        "es": "Expresión natural para comunicar Connectors of Purpose & Result con confianza."
      },
      {
        "en": "Practice building your own thought using this structure.",
        "es": "Practica creando tu propia oración con esta estructura comunicativa."
      }
    ],
    "commonMistake": {
      "explanation": "Decir \"for to\" (\"I come here for to learn English\") traduciendo literalmente el \"para\".",
      "wrong": "for to",
      "correct": "I come here for to learn English"
    }
  },
  "35": {
    "order": 35,
    "title": "The Present Perfect (Life Experience)",
    "phase": "Builder",
    "level": "B1 - Intermediate",
    "concept": "Habla de tus experiencias de vida y logros acumulados conectando el pasado con tu presente con el Present Perfect.",
    "correctMethod": "Sujeto + Have / Has + Participio Pasado (Ever / Never / Already / Yet) — El puente entre pasado y presente: Experiencias acumuladas en la vida sin fecha cerrada.",
    "structureBlocks": [
      "Sujeto",
      "Have / Has",
      "Participio Pasado (Ever / Never / Already / Yet)"
    ],
    "examples": [
      {
        "en": "Natural phrasing for The Present Perfect (Life Experience).",
        "es": "Expresión natural para comunicar The Present Perfect (Life Experience) con confianza."
      },
      {
        "en": "Practice building your own thought using this structure.",
        "es": "Practica creando tu propia oración con esta estructura comunicativa."
      }
    ],
    "commonMistake": {
      "explanation": "Usar pasado simple cuando la experiencia sigue abierta (\"Did you ever eat sushi?\" en vez de \"Have you ever...\").",
      "wrong": "Did you ever eat sushi?",
      "correct": "Have you ever..."
    }
  },
  "36": {
    "order": 36,
    "title": "Present Perfect vs Past Simple",
    "phase": "Builder",
    "level": "B1 - Intermediate",
    "concept": "Define la frontera temporal definitiva: aprende cuándo usar el pasado simple y cuándo mantener el tiempo abierto con Present Perfect.",
    "correctMethod": "Tiempo Abierto (Today/This week: Have done) vs Tiempo Cerrado (Yesterday/In 2020: Did) — La gran línea divisoria temporal: Si la ventana de tiempo ya cerró, el verbo va al pasado simple.",
    "structureBlocks": [
      "Tiempo Abierto (Today/This week: Have done) vs Tiempo Cerrado (Yesterday/In 2020: Did)"
    ],
    "examples": [
      {
        "en": "Natural phrasing for Present Perfect vs Past Simple.",
        "es": "Expresión natural para comunicar Present Perfect vs Past Simple con confianza."
      },
      {
        "en": "Practice building your own thought using this structure.",
        "es": "Practica creando tu propia oración con esta estructura comunicativa."
      }
    ],
    "commonMistake": {
      "explanation": "Decir \"Today I saw him yesterday\" o usar present perfect con adverbios de tiempo ya finalizado.",
      "wrong": "Traducir literalmente desde el español",
      "correct": "Usar la estructura nativa en inglés"
    }
  },
  "37": {
    "order": 37,
    "title": "Used to vs Would",
    "phase": "Builder",
    "level": "B1 - Intermediate",
    "concept": "Evoca el pasado con precisión: descubre cuándo usar Used to para hábitos y estados, y cuándo añadir el toque nostálgico de Would.",
    "correctMethod": "Used to + Verbo Base (estados y hábitos pasados) | Would + Verbo Base (solo acciones nostálgicas) — Hábitos del pasado que ya no son ciertos en el presente. Límites del \"would\" con verbos de estado.",
    "structureBlocks": [
      "Used to",
      "Verbo Base (estados y hábitos pasados) | Would",
      "Verbo Base (solo acciones nostálgicas)"
    ],
    "examples": [
      {
        "en": "Natural phrasing for Used to vs Would.",
        "es": "Expresión natural para comunicar Used to vs Would con confianza."
      },
      {
        "en": "Practice building your own thought using this structure.",
        "es": "Practica creando tu propia oración con esta estructura comunicativa."
      }
    ],
    "commonMistake": {
      "explanation": "Usar \"would\" para estados del pasado (\"When I was a child I would have a dog\").",
      "wrong": "would",
      "correct": "When I was a child I would have a dog"
    }
  },
  "38": {
    "order": 38,
    "title": "Relative Clauses (Defining vs Non-defining)",
    "phase": "Builder",
    "level": "B1 - Intermediate",
    "concept": "Conecta ideas sin frenar el flujo del habla: cómo utilizar las oraciones de relativo para sonar continuo y articulado.",
    "correctMethod": "Who (personas) | Which/That (cosas) | Where (lugares) | Whose (posesión) — Economía del lenguaje: Unir dos ideas en una sola oración sin pausas innecesarias ni repeticiones.",
    "structureBlocks": [
      "Who (personas) | Which/That (cosas) | Where (lugares) | Whose (posesión)"
    ],
    "examples": [
      {
        "en": "Natural phrasing for Relative Clauses (Defining vs Non-defining).",
        "es": "Expresión natural para comunicar Relative Clauses (Defining vs Non-defining) con confianza."
      },
      {
        "en": "Practice building your own thought using this structure.",
        "es": "Practica creando tu propia oración con esta estructura comunicativa."
      }
    ],
    "commonMistake": {
      "explanation": "Usar \"what\" como relativo de personas u objetos (\"The computer what I bought\", \"The man what called\").",
      "wrong": "what",
      "correct": "The computer what I bought"
    }
  },
  "39": {
    "order": 39,
    "title": "Word Formation (Prefixes & Suffixes)",
    "phase": "Builder",
    "level": "B2 - Upper Intermediate",
    "concept": "Multiplica tu vocabulario sin memorizar listas: comprende la ingeniería de prefijos y sufijos para derivar cientos de palabras.",
    "correctMethod": "Raíz + Sufijos (-ment, -tion, -able, -ness) | Prefijos (un-, dis-, mis-, re-) — Ingeniería léxica: Multiplicar tu vocabulario por 4 entendiendo cómo transformar sustantivos, verbos y adjetivos.",
    "structureBlocks": [
      "Raíz",
      "Sufijos (-ment, -tion, -able, -ness) | Prefijos (un-, dis-, mis-, re-)"
    ],
    "examples": [
      {
        "en": "Natural phrasing for Word Formation (Prefixes & Suffixes).",
        "es": "Expresión natural para comunicar Word Formation (Prefixes & Suffixes) con confianza."
      },
      {
        "en": "Practice building your own thought using this structure.",
        "es": "Practica creando tu propia oración con esta estructura comunicativa."
      }
    ],
    "commonMistake": {
      "explanation": "Inventar palabras en inglés traduciendo literalmente del español agregando terminaciones falsas.",
      "wrong": "Traducir literalmente desde el español",
      "correct": "Usar la estructura nativa en inglés"
    }
  },
  "40": {
    "order": 40,
    "title": "Checkpoint 2: The Structural Poppourri",
    "phase": "Builder",
    "level": "B2 - Upper Intermediate",
    "concept": "El gran filtro del B2: simulacro integral donde pones a prueba el dominio del popurrí estructural sin vicios de traducción.",
    "correctMethod": "Integración activa: Get + Pasivas + Causativos + -ING + Preposiciones — Simulacro de medio término: Detección y erradicación de los errores fosilizados del hispanohablante.",
    "structureBlocks": [
      "Integración activa: Get",
      "Pasivas",
      "Causativos",
      "-ING",
      "Preposiciones"
    ],
    "examples": [
      {
        "en": "Natural phrasing for Checkpoint 2: The Structural Poppourri.",
        "es": "Expresión natural para comunicar Checkpoint 2: The Structural Poppourri con confianza."
      },
      {
        "en": "Practice building your own thought using this structure.",
        "es": "Practica creando tu propia oración con esta estructura comunicativa."
      }
    ],
    "commonMistake": {
      "explanation": "Recaer en la traducción mental directa cuando se le exige velocidad conversacional.",
      "wrong": "Traducir literalmente desde el español",
      "correct": "Usar la estructura nativa en inglés"
    }
  },
  "41": {
    "order": 41,
    "title": "Modals of Deduction (Present)",
    "phase": "Negotiator",
    "level": "B2 - Upper Intermediate",
    "concept": "Modula tus opiniones y sospechas: expresa distintos grados de certeza con los modales de deducción en presente.",
    "correctMethod": "Sujeto + Must be (95% certeza) | Might / Could be (50%) | Can't be (0% certeza) — Grados de sospecha y deducción lógica en el presente sobre situaciones inciertas.",
    "structureBlocks": [
      "Sujeto",
      "Must be (95% certeza) | Might / Could be (50%) | Can't be (0% certeza)"
    ],
    "examples": [
      {
        "en": "Natural phrasing for Modals of Deduction (Present).",
        "es": "Expresión natural para comunicar Modals of Deduction (Present) con confianza."
      },
      {
        "en": "Practice building your own thought using this structure.",
        "es": "Practica creando tu propia oración con esta estructura comunicativa."
      }
    ],
    "commonMistake": {
      "explanation": "Usar \"maybe\" para todo en lugar de modular la certeza con los modales correspondientes.",
      "wrong": "Traducir literalmente desde el español",
      "correct": "Usar la estructura nativa en inglés"
    }
  },
  "42": {
    "order": 42,
    "title": "Modals of Deduction (Past)",
    "phase": "Negotiator",
    "level": "B2 - Upper Intermediate",
    "concept": "Lleva tu análisis crítico al pasado: cómo deducir lo que con seguridad ocurrió o no pudo haber sucedido.",
    "correctMethod": "Sujeto + Must have / Could have / Couldn't have + Participio Pasado — Análisis forense de hipótesis pasadas: Deducir lo que debió o no pudo haber ocurrido.",
    "structureBlocks": [
      "Sujeto",
      "Must have / Could have / Couldn't have",
      "Participio Pasado"
    ],
    "examples": [
      {
        "en": "Natural phrasing for Modals of Deduction (Past).",
        "es": "Expresión natural para comunicar Modals of Deduction (Past) con confianza."
      },
      {
        "en": "Practice building your own thought using this structure.",
        "es": "Practica creando tu propia oración con esta estructura comunicativa."
      }
    ],
    "commonMistake": {
      "explanation": "Confundir \"should have\" (arrepentimiento moral) con \"must have\" (deducción lógica).",
      "wrong": "should have",
      "correct": "must have"
    }
  },
  "43": {
    "order": 43,
    "title": "Wish & Regrets",
    "phase": "Negotiator",
    "level": "B2 - Upper Intermediate",
    "concept": "Aprende a expresar arrepentimientos profundos y anhelos constructivos con las distintas estructuras de Wish.",
    "correctMethod": "I wish + Pasado Simple (presente) | I wish + Past Perfect (pasado) | Wish + Would (quejas) — Expresar anhelos, quejas sobre conductas ajenas y arrepentimientos reales de vida.",
    "structureBlocks": [
      "I wish",
      "Pasado Simple (presente) | I wish",
      "Past Perfect (pasado) | Wish",
      "Would (quejas)"
    ],
    "examples": [
      {
        "en": "Natural phrasing for Wish & Regrets.",
        "es": "Expresión natural para comunicar Wish & Regrets con confianza."
      },
      {
        "en": "Practice building your own thought using this structure.",
        "es": "Practica creando tu propia oración con esta estructura comunicativa."
      }
    ],
    "commonMistake": {
      "explanation": "Usar el presente tras wish (\"I wish I have more money\" en vez de \"had\").",
      "wrong": "I wish I have more money",
      "correct": "had"
    }
  },
  "44": {
    "order": 44,
    "title": "Cleft Sentences (The Spotlight)",
    "phase": "Negotiator",
    "level": "B2 - Upper Intermediate",
    "concept": "Enfoca la atención de tu audiencia: utiliza cleft sentences para resaltar el punto exacto que quieres que recuerden.",
    "correctMethod": "What I really need is... | It was [Actor/Causa] that changed everything — Estructuras de hendidura: Poner el foco de atención en el elemento más importante de la idea para sonar contundente.",
    "structureBlocks": [
      "What I really need is... | It was [Actor/Causa] that changed everything"
    ],
    "examples": [
      {
        "en": "Natural phrasing for Cleft Sentences (The Spotlight).",
        "es": "Expresión natural para comunicar Cleft Sentences (The Spotlight) con confianza."
      },
      {
        "en": "Practice building your own thought using this structure.",
        "es": "Practica creando tu propia oración con esta estructura comunicativa."
      }
    ],
    "commonMistake": {
      "explanation": "Mantener un tono monótono y plano sin usar recursos sintácticos de énfasis.",
      "wrong": "Traducir literalmente desde el español",
      "correct": "Usar la estructura nativa en inglés"
    }
  },
  "45": {
    "order": 45,
    "title": "Advanced Future Forms",
    "phase": "Negotiator",
    "level": "B2 - Upper Intermediate",
    "concept": "Proyecta tu futuro con maestría: domina la diferencia entre estar en medio de un proceso o haber alcanzado una meta para una fecha clave.",
    "correctMethod": "Future Continuous (will be doing) vs Future Perfect (will have done by X date) — Diferenciar entre un proceso en marcha en el futuro y un hito que estará 100% terminado para cierta fecha.",
    "structureBlocks": [
      "Future Continuous (will be doing) vs Future Perfect (will have done by X date)"
    ],
    "examples": [
      {
        "en": "Natural phrasing for Advanced Future Forms.",
        "es": "Expresión natural para comunicar Advanced Future Forms con confianza."
      },
      {
        "en": "Practice building your own thought using this structure.",
        "es": "Practica creando tu propia oración con esta estructura comunicativa."
      }
    ],
    "commonMistake": {
      "explanation": "Usar únicamente \"will\" simple para todas las proyecciones a mediano y largo plazo.",
      "wrong": "Traducir literalmente desde el español",
      "correct": "Usar la estructura nativa en inglés"
    }
  },
  "46": {
    "order": 46,
    "title": "Inversion for Dramatic Emphasis",
    "phase": "Negotiator",
    "level": "B2 - Upper Intermediate",
    "concept": "Aprende la elegancia de la inversión sintáctica para agregar dramatismo, fuerza y peso retórico a tus oraciones.",
    "correctMethod": "Seldom / Never / Not only + Auxiliar + Sujeto + Verbo — Inversión negativa formal para estilo oratorio, conferencias y narrativas de alto impacto.",
    "structureBlocks": [
      "Seldom / Never / Not only",
      "Auxiliar",
      "Sujeto",
      "Verbo"
    ],
    "examples": [
      {
        "en": "Natural phrasing for Inversion for Dramatic Emphasis.",
        "es": "Expresión natural para comunicar Inversion for Dramatic Emphasis con confianza."
      },
      {
        "en": "Practice building your own thought using this structure.",
        "es": "Practica creando tu propia oración con esta estructura comunicativa."
      }
    ],
    "commonMistake": {
      "explanation": "No invertir el auxiliar tras adverbios negativos iniciales (\"Never I have seen\").",
      "wrong": "Traducir literalmente desde el español",
      "correct": "Usar la estructura nativa en inglés"
    }
  },
  "47": {
    "order": 47,
    "title": "Participle Clauses (Language Economy)",
    "phase": "Negotiator",
    "level": "B2 - Upper Intermediate",
    "concept": "Ahorra palabras y gana sofisticación: cómo condensar oraciones largas y explicativas usando cláusulas de participio.",
    "correctMethod": "Having + Participio, S+T+A | Verbo-ing al inicio conectando causas inmediatas — Economía del lenguaje: Condensar oraciones subordinadas complejas en frases de participio fluidas.",
    "structureBlocks": [
      "Having",
      "Participio, S",
      "T",
      "A | Verbo-ing al inicio conectando causas inmediatas"
    ],
    "examples": [
      {
        "en": "Natural phrasing for Participle Clauses (Language Economy).",
        "es": "Expresión natural para comunicar Participle Clauses (Language Economy) con confianza."
      },
      {
        "en": "Practice building your own thought using this structure.",
        "es": "Practica creando tu propia oración con esta estructura comunicativa."
      }
    ],
    "commonMistake": {
      "explanation": "Construir párrafos pesados y repetitivos con cadenas infinitas de \"because\" y \"after that\".",
      "wrong": "because",
      "correct": "after that"
    }
  },
  "48": {
    "order": 48,
    "title": "Tag Questions & Social Checking",
    "phase": "Negotiator",
    "level": "B2 - Upper Intermediate",
    "concept": "Domina las tag questions para invitar a tu interlocutor a la conversación y validar acuerdos de manera natural.",
    "correctMethod": "Oración (+) + Auxiliar negativo? | Oración (-) + Auxiliar positivo? — Preguntas de confirmación social: Mantener la puerta abierta en conversaciones ejecutivas y sociales.",
    "structureBlocks": [
      "Oración (",
      ")",
      "Auxiliar negativo? | Oración (-)",
      "Auxiliar positivo?"
    ],
    "examples": [
      {
        "en": "Natural phrasing for Tag Questions & Social Checking.",
        "es": "Expresión natural para comunicar Tag Questions & Social Checking con confianza."
      },
      {
        "en": "Practice building your own thought using this structure.",
        "es": "Practica creando tu propia oración con esta estructura comunicativa."
      }
    ],
    "commonMistake": {
      "explanation": "Usar siempre \"Yes?\", \"No?\" o \"Right?\" al final de cada frase sin variar el auxiliar.",
      "wrong": "Yes?",
      "correct": "No?"
    }
  },
  "49": {
    "order": 49,
    "title": "So vs Such & Intensifiers",
    "phase": "Negotiator",
    "level": "B2 - Upper Intermediate",
    "concept": "Intensifica tus descripciones: aprende a usar So y Such junto a colocaciones avanzadas para evitar el monótono uso de \"very\".",
    "correctMethod": "So + Adjetivo | Such + (a/an) + Sustantivo | Absolutely / Extremely / Highly — Intensificadores emocionales y descriptivos sin caer en la repetición constante de \"very\".",
    "structureBlocks": [
      "So",
      "Adjetivo | Such",
      "(a/an)",
      "Sustantivo | Absolutely / Extremely / Highly"
    ],
    "examples": [
      {
        "en": "Natural phrasing for So vs Such & Intensifiers.",
        "es": "Expresión natural para comunicar So vs Such & Intensifiers con confianza."
      },
      {
        "en": "Practice building your own thought using this structure.",
        "es": "Practica creando tu propia oración con esta estructura comunicativa."
      }
    ],
    "commonMistake": {
      "explanation": "Decir \"So a good movie\" o abusar de \"very very interesting\".",
      "wrong": "So a good movie",
      "correct": "very very interesting"
    }
  },
  "50": {
    "order": 50,
    "title": "Softening & Diplomacy (The Art of Politeness)",
    "phase": "Negotiator",
    "level": "B2 - Upper Intermediate",
    "concept": "El arte de la diplomacia: cómo solicitar favores, corregir a otros y discrepar sin sonar rudo ni impositivo.",
    "correctMethod": "Could you possibly... | Would it be okay if... | I was wondering if you might... — Diplomacia lingüística anglosajona: Suavizar peticiones, desacuerdos y correcciones en entornos profesionales.",
    "structureBlocks": [
      "Could you possibly... | Would it be okay if... | I was wondering if you might..."
    ],
    "examples": [
      {
        "en": "Natural phrasing for Softening & Diplomacy (The Art of Politeness).",
        "es": "Expresión natural para comunicar Softening & Diplomacy (The Art of Politeness) con confianza."
      },
      {
        "en": "Practice building your own thought using this structure.",
        "es": "Practica creando tu propia oración con esta estructura comunicativa."
      }
    ],
    "commonMistake": {
      "explanation": "Traducir el imperativo directo del español sonando autoritario o grosero sin intención (\"Send me the file now\").",
      "wrong": "Traducir literalmente desde el español",
      "correct": "Usar la estructura nativa en inglés"
    }
  },
  "51": {
    "order": 51,
    "title": "The Architecture of Storytelling",
    "phase": "Negotiator",
    "level": "B2 - Upper Intermediate",
    "concept": "Conviértete en un narrador magnético: entrelaza los tres tiempos del pasado para darle profundidad cinematográfica a tus historias.",
    "correctMethod": "Past Continuous (el escenario) + Simple Past (el suceso) + Past Perfect (el antecedente) — Narrativa tridimensional: Construir anécdotas profesionales o personales con riqueza temporal cinematográfica.",
    "structureBlocks": [
      "Past Continuous (el escenario)",
      "Simple Past (el suceso)",
      "Past Perfect (el antecedente)"
    ],
    "examples": [
      {
        "en": "Natural phrasing for The Architecture of Storytelling.",
        "es": "Expresión natural para comunicar The Architecture of Storytelling con confianza."
      },
      {
        "en": "Practice building your own thought using this structure.",
        "es": "Practica creando tu propia oración con esta estructura comunicativa."
      }
    ],
    "commonMistake": {
      "explanation": "Contar anécdotas usando únicamente pasado simple plano sin recrear la atmósfera ni los antecedentes.",
      "wrong": "Traducir literalmente desde el español",
      "correct": "Usar la estructura nativa en inglés"
    }
  },
  "52": {
    "order": 52,
    "title": "Business & Negotiation: The Proformas",
    "phase": "Negotiator",
    "level": "B2 - Upper Intermediate",
    "concept": "Habla el lenguaje de los negocios internacionales: domina las estructuras y proformas estándar para cerrar acuerdos y contratos.",
    "correctMethod": "Proformas: Subject to approval | In accordance with | We propose that + Subjuntivo — Estructuras estándar de ofertas comerciales, cotizaciones, acuerdos de confidencialidad y cláusulas de servicio.",
    "structureBlocks": [
      "Proformas: Subject to approval | In accordance with | We propose that",
      "Subjuntivo"
    ],
    "examples": [
      {
        "en": "Natural phrasing for Business & Negotiation: The Proformas.",
        "es": "Expresión natural para comunicar Business & Negotiation: The Proformas con confianza."
      },
      {
        "en": "Practice building your own thought using this structure.",
        "es": "Practica creando tu propia oración con esta estructura comunicativa."
      }
    ],
    "commonMistake": {
      "explanation": "Usar lenguaje coloquial o excesivamente informal en acuerdos comerciales vinculantes.",
      "wrong": "Traducir literalmente desde el español",
      "correct": "Usar la estructura nativa en inglés"
    }
  },
  "53": {
    "order": 53,
    "title": "Idiomatic Collocations",
    "phase": "Negotiator",
    "level": "B2 - Upper Intermediate",
    "concept": "Aprende las parejas inseparables del inglés: colocaciones naturales que te harán sonar nativo y eliminarán el acento mental.",
    "correctMethod": "Colocaciones fijas: Heavy rain (no strong) | Bitterly disappointed | Make an effort | Deeply concerned — Palabras inseparables: Combinaciones naturales de adjetivos, verbos y sustantivos que los nativos esperan escuchar.",
    "structureBlocks": [
      "Colocaciones fijas: Heavy rain (no strong) | Bitterly disappointed | Make an effort | Deeply concerned"
    ],
    "examples": [
      {
        "en": "Natural phrasing for Idiomatic Collocations.",
        "es": "Expresión natural para comunicar Idiomatic Collocations con confianza."
      },
      {
        "en": "Practice building your own thought using this structure.",
        "es": "Practica creando tu propia oración con esta estructura comunicativa."
      }
    ],
    "commonMistake": {
      "explanation": "Combinar palabras lógicas para el español que suenan artificiales en inglés (\"strong rain\", \"make a shower\").",
      "wrong": "strong rain",
      "correct": "make a shower"
    }
  },
  "54": {
    "order": 54,
    "title": "Persuasion & Debate Architecture",
    "phase": "Negotiator",
    "level": "B2 - Upper Intermediate",
    "concept": "Domina el arte de debatir y persuadir: cómo refutar argumentos con elegancia, conceder puntos y liderar una discusión.",
    "correctMethod": "Concesión + Giro: While I appreciate your perspective, the evidence indicates that... — Técnicas de debate civilizado: Reconocer el punto del oponente antes de refutar con contundencia y datos.",
    "structureBlocks": [
      "Concesión",
      "Giro: While I appreciate your perspective, the evidence indicates that..."
    ],
    "examples": [
      {
        "en": "Natural phrasing for Persuasion & Debate Architecture.",
        "es": "Expresión natural para comunicar Persuasion & Debate Architecture con confianza."
      },
      {
        "en": "Practice building your own thought using this structure.",
        "es": "Practica creando tu propia oración con esta estructura comunicativa."
      }
    ],
    "commonMistake": {
      "explanation": "Interrumpir bruscamente o decir \"You are wrong\" generando fricción en discusiones profesionales.",
      "wrong": "Traducir literalmente desde el español",
      "correct": "Usar la estructura nativa en inglés"
    }
  },
  "55": {
    "order": 55,
    "title": "Nuance: False Friends & Traps",
    "phase": "Negotiator",
    "level": "B2 - Upper Intermediate",
    "concept": "Desactiva los falsos cognados: protégete de las palabras trampa que cambian radicalmente el sentido de tus mensajes.",
    "correctMethod": "Actually vs Currently | Realize vs Make | Compromise vs Agreement | Attend vs Assist — Desactivación de las 20 trampas semánticas que traicionan al hispanohablante avanzado en situaciones críticas.",
    "structureBlocks": [
      "Actually vs Currently | Realize vs Make | Compromise vs Agreement | Attend vs Assist"
    ],
    "examples": [
      {
        "en": "Natural phrasing for Nuance: False Friends & Traps.",
        "es": "Expresión natural para comunicar Nuance: False Friends & Traps con confianza."
      },
      {
        "en": "Practice building your own thought using this structure.",
        "es": "Practica creando tu propia oración con esta estructura comunicativa."
      }
    ],
    "commonMistake": {
      "explanation": "Decir \"actually\" queriendo decir \"actualmente\", o \"compromise\" pensando que es un simple compromiso.",
      "wrong": "actually",
      "correct": "actualmente"
    }
  },
  "56": {
    "order": 56,
    "title": "The Job & Technical Interview",
    "phase": "Negotiator",
    "level": "B2 - Upper Intermediate",
    "concept": "Triunfa en entrevistas internacionales: domina la metodología STAR para responder preguntas complejas con impacto ejecutivo.",
    "correctMethod": "Método STAR: Situation (Pasado) $\rightarrow$ Task (Objetivo) $\rightarrow$ Action (Decisiones) $\rightarrow$ Result (Métricas) — Estructura ejecutiva para responder preguntas conductuales difíciles en entrevistas laborales en inglés.",
    "structureBlocks": [
      "Método STAR: Situation (Pasado) $\rightarrow$ Task (Objetivo) $\rightarrow$ Action (Decisiones) $\rightarrow$ Result (Métricas)"
    ],
    "examples": [
      {
        "en": "Natural phrasing for The Job & Technical Interview.",
        "es": "Expresión natural para comunicar The Job & Technical Interview con confianza."
      },
      {
        "en": "Practice building your own thought using this structure.",
        "es": "Practica creando tu propia oración con esta estructura comunicativa."
      }
    ],
    "commonMistake": {
      "explanation": "Respuestas desordenadas, anecdóticas y sin métricas concretas de impacto.",
      "wrong": "Traducir literalmente desde el español",
      "correct": "Usar la estructura nativa en inglés"
    }
  },
  "57": {
    "order": 57,
    "title": "Abstract Concept Articulation",
    "phase": "Negotiator",
    "level": "B2 - Upper Intermediate",
    "concept": "Articula ideas abstractas y complejas: cómo defender tu visión del mundo con soltura y profundidad intelectual.",
    "correctMethod": "Causa y Efecto + Metáfora + Impacto Social en temas abstractos (Ética, Éxito, Innovación) — Articulación de pensamiento crítico de nivel C1 sobre temas complejos sin simplificar el vocabulario.",
    "structureBlocks": [
      "Causa y Efecto",
      "Metáfora",
      "Impacto Social en temas abstractos (Ética, Éxito, Innovación)"
    ],
    "examples": [
      {
        "en": "Natural phrasing for Abstract Concept Articulation.",
        "es": "Expresión natural para comunicar Abstract Concept Articulation con confianza."
      },
      {
        "en": "Practice building your own thought using this structure.",
        "es": "Practica creando tu propia oración con esta estructura comunicativa."
      }
    ],
    "commonMistake": {
      "explanation": "Quedarse en silencio o recurrir a muletillas por falta de conectores abstractos.",
      "wrong": "Traducir literalmente desde el español",
      "correct": "Usar la estructura nativa en inglés"
    }
  },
  "58": {
    "order": 58,
    "title": "Impromptu Speaking (Speaking on the Spot)",
    "phase": "Negotiator",
    "level": "B2 - Upper Intermediate",
    "concept": "Aprende a hablar sin red de seguridad: la técnica PREP para estructurar intervenciones improvisadas con total soltura.",
    "correctMethod": "Estructura PREP: Point (Tesis) $\rightarrow$ Reason (Por qué) $\rightarrow$ Example (Caso) $\rightarrow$ Point (Conclusión) — Improvisación estructurada: Cómo hablar con seguridad cuando te piden tu opinión sin aviso previo.",
    "structureBlocks": [
      "Estructura PREP: Point (Tesis) $\rightarrow$ Reason (Por qué) $\rightarrow$ Example (Caso) $\rightarrow$ Point (Conclusión)"
    ],
    "examples": [
      {
        "en": "Natural phrasing for Impromptu Speaking (Speaking on the Spot).",
        "es": "Expresión natural para comunicar Impromptu Speaking (Speaking on the Spot) con confianza."
      },
      {
        "en": "Practice building your own thought using this structure.",
        "es": "Practica creando tu propia oración con esta estructura comunicativa."
      }
    ],
    "commonMistake": {
      "explanation": "Rellenar silencios con titubeos en español (\"ehhh\", \"cómo se dice\") en lugar de usar conectores puente.",
      "wrong": "ehhh",
      "correct": "cómo se dice"
    }
  },
  "59": {
    "order": 59,
    "title": "Final Project & Presentation Rehearsal",
    "phase": "Negotiator",
    "level": "B2 - Upper Intermediate",
    "concept": "Ensayo general antes de la graduación: pule cada detalle de tu presentación ejecutiva final con tu profesor.",
    "correctMethod": "Estructura de Presentación Ejecutiva: Hook $\rightarrow$ Problem $\rightarrow$ Solution $\rightarrow$ Call to Action — Ensayo general de la presentación final: Pulido milimétrico de pronunciación, ritmo y lenguaje corporal.",
    "structureBlocks": [
      "Estructura de Presentación Ejecutiva: Hook $\rightarrow$ Problem $\rightarrow$ Solution $\rightarrow$ Call to Action"
    ],
    "examples": [
      {
        "en": "Natural phrasing for Final Project & Presentation Rehearsal.",
        "es": "Expresión natural para comunicar Final Project & Presentation Rehearsal con confianza."
      },
      {
        "en": "Practice building your own thought using this structure.",
        "es": "Practica creando tu propia oración con esta estructura comunicativa."
      }
    ],
    "commonMistake": {
      "explanation": "Leer diapositivas o perder el contacto visual con la audiencia.",
      "wrong": "Traducir literalmente desde el español",
      "correct": "Usar la estructura nativa en inglés"
    }
  },
  "60": {
    "order": 60,
    "title": "The Master Showcase (Graduation)",
    "phase": "Negotiator",
    "level": "B2 - Upper Intermediate",
    "concept": "El gran cierre: demostración integral de fluidez activa, presentación de tu proyecto y graduación oficial de LinguaLife.",
    "correctMethod": "Demostración integral de fluidez activa en los 4 modos y vocabulario B2 — Graduación y showcase final: 90% conversación, debate libre y presentación del proyecto del alumno.",
    "structureBlocks": [
      "Demostración integral de fluidez activa en los 4 modos y vocabulario B2"
    ],
    "examples": [
      {
        "en": "Natural phrasing for The Master Showcase (Graduation).",
        "es": "Expresión natural para comunicar The Master Showcase (Graduation) con confianza."
      },
      {
        "en": "Practice building your own thought using this structure.",
        "es": "Practica creando tu propia oración con esta estructura comunicativa."
      }
    ],
    "commonMistake": {
      "explanation": "N/A (Foco en celebración, fluidez espontánea y autoevaluación de progreso).",
      "wrong": "Traducir literalmente desde el español",
      "correct": "Usar la estructura nativa en inglés"
    }
  }
}

/**
 * Obtiene la ficha técnica resumida del tema para la diapositiva única.
 */
export function getTopicSummary(
  topicOrder: number,
  topicName?: string | null,
  cachedSlides?: any[] | null
): TopicSummaryData {
  const fallback = CURRICULUM_SUMMARY_CATALOG[topicOrder]
  if (fallback) {
    return fallback
  }

  // Generación dinámica si es un tema nuevo o no catalogado
  const cleanTitle = (topicName || `Tema ${topicOrder}`).replace(/\s*\([^)]*\)/g, "").trim()
  return {
    order: topicOrder,
    title: cleanTitle,
    phase: "Installer",
    level: "A1 - Beginner",
    concept: `Aprende a estructurar ideas claras sobre ${cleanTitle} sin traducir literalmente del español.`,
    correctMethod: "Protagonista + Palabra de Tiempo + Acción en forma base",
    structureBlocks: ["Protagonista", "Palabra de Tiempo", "Acción Base"],
    examples: [
      { en: `I want to practice ${cleanTitle} today.`, es: `Quiero practicar este tema hoy con naturalidad.` },
      { en: "Practice creates automatic fluency.", es: "La práctica crea fluidez automática y espontánea." }
    ],
    commonMistake: {
      explanation: "Traducción literal del español al inglés olvidando la estructura fija del idioma.",
      wrong: "Traducción palabra por palabra",
      correct: "Estructura directa en inglés"
    }
  }
}
