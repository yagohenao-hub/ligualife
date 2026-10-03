export interface FlashcardItem {
  id: string
  word: string
  ipa?: string
  definitionEn: string
  translationEs: string
  definitionTranslationEs: string
  imageSrc: string
  hotspotCoordinates?: { x: number; y: number }
  imagePrompt?: string
}

export interface FlashcardPack {
  id: string
  title: string
  subtitle: string
  category: 'Vocabulario General' | 'Lugares' | 'Familias Conceptuales' | 'Verbos Frasales' | string
  level: string
  sceneImageSrc?: string
  cards: FlashcardItem[]
  createdAt?: string
}

/* =========================================================================
   CATEGORÍA 1: VOCABULARIO GENERAL
   ========================================================================= */

// Pack 1: Falsos Cognados & Trampas Latinas
// Estilo: Warm cozy colored-pencil & ink sketch illustration, textured paper, vibrant warm pastel fills
export const FALSE_FRIENDS_PACK: FlashcardPack = {
  id: 'false-friends-pack',
  title: 'Falsos Cognados & Trampas Latinas',
  subtitle: 'Palabras que parecen sonar como algo conocido en español pero tienen un significado completamente distinto. Evita errores graves en conversaciones reales.',
  category: 'Vocabulario General',
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
      imageSrc: '/flashcards/actually.png',
      imagePrompt: 'Cozy colored pencil and ink sketch of a friendly girl sitting at a wooden study desk with a warm coffee cup, pointing with a gentle smile to a speech bubble with a green checkmark, warm pastel tones, textured paper background, charming storybook illustration.'
    },
    {
      id: 'ff-2',
      word: 'Eventually',
      ipa: '/ɪˈven.tʃu.ə.li/',
      definitionEn: 'In the end, especially after a long time, delay, or series of difficulties.',
      translationEs: 'A la larga / Al final / Con el tiempo (¡NO eventualmente!)',
      definitionTranslationEs: 'Al final de cuentas, especialmente después de mucho tiempo, espera o esfuerzo.',
      imageSrc: '/flashcards/eventually.png',
      imagePrompt: 'Cozy hand-drawn colored-pencil and ink illustration of a happy hiker reaching a mountain summit with open arms at sunset, a long winding path visible below, warm golden and terracotta pastel hues, storybook adventure aesthetic.'
    },
    {
      id: 'ff-3',
      word: 'Realize',
      ipa: '/ˈriː.ə.laɪz/',
      definitionEn: 'To suddenly become aware of, understand, or notice a fact or situation.',
      translationEs: 'Darse cuenta / Caer en cuenta (¡NO realizar una tarea!)',
      definitionTranslationEs: 'Entender o hacerse consciente de pronto de un hecho o situación.',
      imageSrc: '/flashcards/realize.png',
      imagePrompt: 'Cozy stylized colored pencil sketch of a student sitting with books having an eureka moment, a glowing warm vintage lightbulb sparkling above their head, soft pastel violet and golden colored-pencil shading on cream paper.'
    },
    {
      id: 'ff-4',
      word: 'Notice',
      ipa: '/ˈnoʊ.tɪs/',
      definitionEn: 'To perceive, see, or become aware of something using your senses.',
      translationEs: 'Notar / Fijarse / Darse cuenta (¡Avisar es "warn" o "let know"!)',
      definitionTranslationEs: 'Percibir o percatarse de algo con la vista u otro sentido.',
      imageSrc: '/flashcards/notice.png',
      imagePrompt: 'Charming low-poly 3D diorama of an explorer character holding a magnifying glass over a tiny glowing golden clover hidden in low-poly grass, cute stylized video game asset, warm ambient morning light, vibrant colors.'
    },
    {
      id: 'ff-5',
      word: 'Attend',
      ipa: '/əˈtend/',
      definitionEn: 'To go to or be present at an event, class, meeting, or conference.',
      translationEs: 'Asistir / Ir a un evento (¡Atender a un cliente es "serve" o "help"!)',
      definitionTranslationEs: 'Hacerse presente físicamente o en línea en una reunión o clase.',
      imageSrc: '/flashcards/attend.png',
      imagePrompt: 'Cozy isometric low-poly 3D diorama of a tech auditorium with cute chunky attendees seated in colorful chairs, one attendee raising a hand, glowing pastel stage, indie video game aesthetic.'
    },
    {
      id: 'ff-6',
      word: 'Support',
      ipa: '/səˈpɔːrt/',
      definitionEn: 'To help, encourage, or give financial, emotional, or technical backing.',
      translationEs: 'Apoyar / Respaldar (¡Aguantar o tolerar a alguien es "stand" o "tolerate"!)',
      definitionTranslationEs: 'Brindar respaldo moral, económico o práctico a una persona o causa.',
      imageSrc: '/flashcards/support.png',
      imagePrompt: 'Warm cozy sketch of two stylized friends helping each other climb a wooden platform, warm colored pencil hatching, joyful expressive gestures, gentle terracotta and sage green palette.'
    },
    {
      id: 'ff-7',
      word: 'Compromise',
      ipa: '/ˈkɑːm.prə.maɪz/',
      definitionEn: 'An agreement reached where both sides give up some demands to meet in the middle.',
      translationEs: 'Llegar a un acuerdo mutuo / Ceder (¡Un compromiso u obligación es "commitment"!)',
      definitionTranslationEs: 'Llegar a un punto medio donde ambas partes ceden para solucionar una diferencia.',
      imageSrc: '/flashcards/compromise.png',
      imagePrompt: 'Cozy techy low-poly 3D diorama of two cute blocky characters shaking hands over a balanced wooden seesaw with glowing crystals at equal level, vibrant pastel purple and mint green lighting, Animal Crossing meets indie puzzle game.'
    },
    {
      id: 'ff-8',
      word: 'Sensible',
      ipa: '/ˈsen.sə.bəl/',
      definitionEn: 'Having or showing good judgment, practical wisdom, and common sense.',
      translationEs: 'Sensato / Prudente / Con juicio (¡Sensible de sentimientos es "sensitive"!)',
      definitionTranslationEs: 'Tener y actuar con sentido común, buen juicio y prudencia.',
      imageSrc: '/flashcards/sensible.png',
      imagePrompt: 'Charming colored pencil and ink illustration of a girl in a yellow raincoat holding a bright polka-dot umbrella while it drizzles gently, smiling with prudent common sense, warm cozy storybook aesthetic.'
    },
    {
      id: 'ff-9',
      word: 'Preservative',
      ipa: '/prɪˈzɜːr.və.tɪv/',
      definitionEn: 'A chemical substance added to food or products to prevent decay and spoiling.',
      translationEs: 'Conservante químico / Aditivo alimentario (¡NO preservativo o condón!)',
      definitionTranslationEs: 'Sustancia química que se añade a los alimentos para evitar que se dañen.',
      imageSrc: '/flashcards/preservative.png',
      imagePrompt: 'Cozy hand-drawn sketch of a cute glass jar of strawberry jam with a hand-lettered label, beside a small cartoon shield icon protecting fruit, textured paper, soft colored pencil tones.'
    },
    {
      id: 'ff-10',
      word: 'Argument',
      ipa: '/ˈɑːrɡ.jə.mənt/',
      definitionEn: 'An exchange of diverging or opposite views, typically a heated debate or quarrel.',
      translationEs: 'Discusión acalorada / Debate (¡El argumento de una película es "plot"!)',
      definitionTranslationEs: 'Discusión fuerte entre personas que no están de acuerdo.',
      imageSrc: '/flashcards/argument.png',
      imagePrompt: 'Stylized low-poly 3D scene of two cute voxel characters having an expressive discussion with animated comic-style thundercloud and lightning speech bubbles, vibrant neon pastel lighting, playful game aesthetic.'
    },
    {
      id: 'ff-11',
      word: 'Disgusted',
      ipa: '/dɪsˈɡʌs.tɪd/',
      definitionEn: 'Feeling strong aversion, revulsion, or profound disapproval toward something foul.',
      translationEs: 'Repugnado / Asqueado (¡Estar molesto o disgustado es "upset" o "annoyed"!)',
      definitionTranslationEs: 'Sentir asco o repugnancia intensa hacia algo desagradable.',
      imageSrc: '/flashcards/disgusted.png',
      imagePrompt: 'Charming cartoon-style sketch of a character making a funny wrinkled-nose expression pushing away a bowl of stinky green soup, hand-drawn ink and pastel marker style, warm comedic vibe.'
    },
    {
      id: 'ff-12',
      word: 'Constipated',
      ipa: '/ˈkɑːn.stə.peɪ.t̬ɪd/',
      definitionEn: 'Unable to empty the bowels easily due to digestive blockage.',
      translationEs: 'Estreñido (¡Estar resfriado o con congestión nasal es "congested" o "have a cold"!)',
      definitionTranslationEs: 'Dificultad estomacal para evacuar los intestinos con normalidad.',
      imageSrc: '/flashcards/constipated.png',
      imagePrompt: 'Cute stylized low-poly 3D miniature hourglass with rounded pastel sand grains stuck halfway at the bottleneck, playful minimalist metaphor, soft warm studio lighting, indie game aesthetic.'
    },
    {
      id: 'ff-13',
      word: 'Fabric',
      ipa: '/ˈfæb.rɪk/',
      definitionEn: 'Cloth or woven material produced by weaving or knitting textile fibers.',
      translationEs: 'Tela / Tejido textil (¡Una fábrica industrial es "factory"!)',
      definitionTranslationEs: 'Material de tela usado para confeccionar ropa y cortinas.',
      imageSrc: '/flashcards/fabric.png',
      imagePrompt: 'Cozy colored pencil sketch of colorful rolled rolls of patterned woven cloth, a sewing needle, and a wooden spool of golden thread on a craft table, warm rustic pastel tones.'
    },
    {
      id: 'ff-14',
      word: 'Library',
      ipa: '/ˈlaɪ.brer.i/',
      definitionEn: 'A building or room containing collections of books and resources for reading.',
      translationEs: 'Biblioteca pública / Sala de lectura (¡Una tienda de libros es "bookstore"!)',
      definitionTranslationEs: 'Lugar donde se prestan y consultan libros de forma gratuita.',
      imageSrc: '/flashcards/library.png',
      imagePrompt: 'Cozy isometric low-poly 3D diorama of a warm library nook with wooden bookshelves, a green banker desk lamp, potted plant, and a comfortable armchair, Monument Valley indie game lighting.'
    },
    {
      id: 'ff-15',
      word: 'Sympathetic',
      ipa: '/ˌsɪm.pəˈθet̬.ɪk/',
      definitionEn: 'Feeling, showing, or expressing compassion and understanding for someone in distress.',
      translationEs: 'Compasivo / Empático (¡Ser una persona agradable o simpática es "nice" o "friendly"!)',
      definitionTranslationEs: 'Mostrar comprensión y apoyo emocional hacia el sufrimiento ajeno.',
      imageSrc: '/flashcards/sympathetic.png',
      imagePrompt: 'Warm cozy colored-pencil illustration of a kind friend offering a steaming mug of tea to someone wrapped in a warm blanket, glowing warm heart icon above, soft textured paper.'
    }
  ]
}

// Pack 2: Conectores Lógicos & Conversational Grease
// Estilo: Cozy techy isometric 3D video game diorama, glowing neon pastel glassmorphism, soft ambient lighting
export const LOGICAL_CONNECTORS_PACK: FlashcardPack = {
  id: 'logical-connectors-pack',
  title: 'Conectores Lógicos & Conversational Grease',
  subtitle: 'Conectores y frases de transición indispensables para enlazar ideas con elegancia, sonar fluido y no parecer un robot en llamadas.',
  category: 'Vocabulario General',
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
      imageSrc: '/flashcards/to_be_fair.png',
      imagePrompt: 'Cozy techy low-poly 3D diorama of a glowing golden brass balance scale weighing two luminous pastel crystal spheres in perfect harmony, soft violet and cyan ambient room glow, indie game asset.'
    },
    {
      id: 'lc-2',
      word: 'At the end of the day...',
      ipa: '/æt ði end əv ðə deɪ/',
      definitionEn: 'Used to summarize the most fundamental, decisive truth after weighing all factors.',
      translationEs: 'A fin de cuentas... / En resumidas cuentas...',
      definitionTranslationEs: 'Destaca lo más determinante o elemental cuando se analiza todo en conjunto.',
      imageSrc: '/flashcards/at_the_end_of_the_day.png',
      imagePrompt: 'Stylized low-poly 3D floating island with a cozy tiny house and a lone tree against a stunning sunset gradient sky of apricot and lavender, peaceful indie game end-of-day moment.'
    },
    {
      id: 'lc-3',
      word: 'It turns out that...',
      ipa: '/ɪt tɜːrnz aʊt ðæt/',
      definitionEn: 'Used when sharing a surprising discovery, fact, or unexpected outcome.',
      translationEs: 'Resulta que... / Al final resultó que...',
      definitionTranslationEs: 'Usado para narrar un desenlace imprevisto o una verdad que salió a la luz.',
      imageSrc: '/flashcards/it_turns_out.png',
      imagePrompt: 'Cozy low-poly video game treasure chest opening on a mossy stone platform with a cute surprise glowing star popping out, playful colorful lighting, Zelda-inspired indie game art.'
    },
    {
      id: 'lc-4',
      word: 'Speaking of which...',
      ipa: '/ˈspiː.kɪŋ əv wɪtʃ/',
      definitionEn: 'Used to smoothly transition to a related topic that was just brought up in conversation.',
      translationEs: 'Hablando de eso... / A propósito de lo que dijiste...',
      definitionTranslationEs: 'Enlaza con naturalidad hacia un asunto relacionado que se acaba de nombrar.',
      imageSrc: '/flashcards/speaking_of_which.png',
      imagePrompt: 'Cozy techy 3D diorama of two glowing pastel speech bubbles forming a curved light bridge between two miniature floating platforms, soft neon violet and coral lighting.'
    },
    {
      id: 'lc-5',
      word: 'Off the top of my head...',
      ipa: '/ɔːf ðə tɑːp əv maɪ hed/',
      definitionEn: 'Said when guessing or recalling from immediate memory without verifying precise figures.',
      translationEs: 'Así de memoria... / Sin mirar los datos exactos...',
      definitionTranslationEs: 'Dicho al hacer una estimación rápida sin consultar registros ni notas.',
      imageSrc: '/flashcards/off_the_top_of_my_head.png',
      imagePrompt: 'Cute stylized sketch of a character tapping their temple with colorful little memory gears and sparkles floating into the air, colored pencil and ink on warm textured paper.'
    },
    {
      id: 'lc-6',
      word: 'As a matter of fact...',
      ipa: '/æz ə ˈmæt̬.ɚ əv fækt/',
      definitionEn: 'Used to reinforce a statement with emphasizing truth or specific factual detail.',
      translationEs: 'De hecho... / Es más...',
      definitionTranslationEs: 'Aporta convicción y precisión sobre lo que se está discutiendo.',
      imageSrc: '/flashcards/as_a_matter_of_fact.png',
      imagePrompt: 'Cozy low-poly 3D rubber stamp with the word "FACT" in emerald green neon, stamped onto a parchment document with glowing verification particles, cute indie game UI.'
    },
    {
      id: 'lc-7',
      word: 'In the meantime...',
      ipa: '/ɪn ðə ˈmiːn.taɪm/',
      definitionEn: 'During the interval between two events or while another process finishes.',
      translationEs: 'Mientras tanto... / Entretanto...',
      definitionTranslationEs: 'Durante el lapso previo a que algo ocurra o mientras se completa otra tarea.',
      imageSrc: '/flashcards/in_the_meantime.png',
      imagePrompt: 'Cozy split-screen stylized illustration: on one side a slow hourglass with glowing sand, on the other side a character sipping tea next to a sleepy cat, warm colored-pencil style.'
    },
    {
      id: 'lc-8',
      word: 'On the other hand...',
      ipa: '/ɑːn ði ˈʌð.ɚ hænd/',
      definitionEn: 'Used to present a contrasting, opposite, or alternative point of view.',
      translationEs: 'Por otro lado... / Por otra parte...',
      definitionTranslationEs: 'Presenta un contrapunto o punto de vista que contrasta con el anterior.',
      imageSrc: '/flashcards/on_the_other_hand.png',
      imagePrompt: 'Cozy techy 3D diorama of an open low-poly palm holding two glowing crystal polyhedrons: one warm sunset orange and one cool cyan blue, contrasting balanced lighting.'
    },
    {
      id: 'lc-9',
      word: 'Needless to say...',
      ipa: '/ˈniːd.ləs tuː seɪ/',
      definitionEn: 'Used to introduce an obvious statement that everyone already knows or expects.',
      translationEs: 'Sobra decir que... / Ni qué decir tiene...',
      definitionTranslationEs: 'Se usa al mencionar algo tan evidente que no requiere mayor explicación.',
      imageSrc: '/flashcards/needless_to_say.png',
      imagePrompt: 'Cozy low-poly 3D diorama of an oversized glowing green neon checkmark hovering above a wooden desk, making words unnecessary, cute minimalist game icon.'
    },
    {
      id: 'lc-10',
      word: 'Having said that...',
      ipa: '/ˈhæv.ɪŋ sed ðæt/',
      definitionEn: 'Used to pivot and present a caveat or limitation after expressing an agreement.',
      translationEs: 'Dicho eso... / Sin embargo...',
      definitionTranslationEs: 'Matiza una afirmación previa introduciendo un aspecto que parece contradecirla.',
      imageSrc: '/flashcards/having_said_that.png',
      imagePrompt: 'Charming low-poly wooden signpost at a scenic trail fork with cute colorful arrows pointing in opposite directions, warm pastel morning sun, indie walking simulator game style.'
    },
    {
      id: 'lc-11',
      word: 'Out of the blue...',
      ipa: '/aʊt əv ðə bluː/',
      definitionEn: 'Completely unexpectedly, without any prior warning or hint.',
      translationEs: 'De la nada / De repente sin avisar...',
      definitionTranslationEs: 'Ocurre de forma sorpresiva e imprevista sin previo aviso.',
      imageSrc: '/flashcards/out_of_the_blue.png',
      imagePrompt: 'Cozy storybook sketch of a tiny playful golden thunderbolt popping out of a clear pastel blue sky onto a calm lake, gentle cartoon ripples, colored pencil and watercolor.'
    },
    {
      id: 'lc-12',
      word: 'In hindsight...',
      ipa: '/ɪn ˈhaɪnd.saɪt/',
      definitionEn: 'Understanding of a situation only after it has happened.',
      translationEs: 'Viéndolo en retrospectiva / Mirando hacia atrás...',
      definitionTranslationEs: 'Comprender algo con claridad únicamente después de que ya ocurrió.',
      imageSrc: '/flashcards/in_hindsight.png',
      imagePrompt: 'Cozy low-poly 3D car interior with a glowing rear-view mirror reflecting a clear sunny landscape while looking back at a stormy foggy road, warm retro synthwave colors.'
    },
    {
      id: 'lc-13',
      word: 'For the time being...',
      ipa: '/fɔːr ðə taɪm ˈbiː.ɪŋ/',
      definitionEn: 'For now; temporarily until a permanent arrangement is made.',
      translationEs: 'Por el momento / Por ahora...',
      definitionTranslationEs: 'De manera provisional hasta que se defina algo permanente.',
      imageSrc: '/flashcards/for_the_time_being.png',
      imagePrompt: 'Cozy techy glowing pastel pause button floating above a cute miniature wooden workbench with unfinished toy blocks, warm ambient lighting, indie game aesthetic.'
    },
    {
      id: 'lc-14',
      word: 'Truth be told...',
      ipa: '/truːθ bi toʊld/',
      definitionEn: 'To speak frankly and disclose an honest, unvarnished opinion.',
      translationEs: 'La verdad sea dicha / A decir verdad...',
      definitionTranslationEs: 'Expresar lo que realmente piensas con sinceridad transparente.',
      imageSrc: '/flashcards/truth_be_told.png',
      imagePrompt: 'Expressive colored pencil sketch of a friendly character gently setting down a wooden masquerade mask to reveal an open honest smiling face, warm ambient candlelight.'
    },
    {
      id: 'lc-15',
      word: 'When all is said and done...',
      ipa: '/wen ɔːl ɪz sed ænd dʌn/',
      definitionEn: 'After all aspects have been considered and the outcome is settled.',
      translationEs: 'Cuando todo está dicho y hecho / Al final de todo...',
      definitionTranslationEs: 'Conclusión final una vez evaluado y terminado todo.',
      imageSrc: '/flashcards/when_all_is_said_and_done.png',
      imagePrompt: 'Cozy hand-drawn sketch of a finished journal with a golden ribbon bookmark closed on a warm oak table next to a steaming cup of herbal tea and a blooming succulent.'
    }
  ]
}

// Pack 3: Colocaciones & Modismos de Alta Frecuencia
// Estilo: Whimsical cozy storybook sketch meets stylized 3D indie game art, warm vibrant colors
export const COLLOCATIONS_IDIOMS_PACK: FlashcardPack = {
  id: 'collocations-idioms-pack',
  title: 'Colocaciones & Modismos de Alta Frecuencia',
  subtitle: 'Expresiones idiomáticas y colocaciones naturales que te hacen sonar como un hablante nativo con vocabulario sofisticado.',
  category: 'Vocabulario General',
  level: 'B1-C2',
  createdAt: '2026-09-27',
  cards: [
    {
      id: 'col-1',
      word: 'Cut corners',
      ipa: '/kʌt ˈkɔːr.nɚz/',
      definitionEn: 'To do something in the easiest, cheapest, or fastest way, often sacrificing quality or safety.',
      translationEs: 'Tomar atajos / Hacer las cosas a medias',
      definitionTranslationEs: 'Hacer algo de la forma más rápida y barata descuidando la calidad o las normas.',
      imageSrc: '/flashcards/cut_corners.png',
      imagePrompt: 'Cozy low-poly 3D diorama of a cute pair of silver scissors snipping a wooden block corner, revealing funny loose colorful game cables inside, vibrant indie puzzle game style.'
    },
    {
      id: 'col-2',
      word: 'Bite the bullet',
      ipa: '/baɪt ðə ˈbʊl.ɪt/',
      definitionEn: 'To force yourself to face a difficult, unpleasant situation with courage and get it over with.',
      translationEs: 'Hacer de tripas corazón / Afrontar lo inevitable',
      definitionTranslationEs: 'Obligarte a enfrentar una situación incómoda o dolorosa con valentía sin aplazarla más.',
      imageSrc: '/flashcards/bite_the_bullet.png',
      imagePrompt: 'Charming stylized colored pencil sketch of a determined cartoon squirrel taking a brave breath before hopping onto a log across a rushing stream, warm courage theme.'
    },
    {
      id: 'col-3',
      word: 'Hit the nail on the head',
      ipa: '/hɪt ðə neɪl ɑːn ðə hed/',
      definitionEn: 'To describe exactly what is causing a situation or problem; to be spot on.',
      translationEs: 'Dar en el clavo / Acertar con precisión',
      definitionTranslationEs: 'Describir o solucionar con exactitud absoluta la causa de un problema.',
      imageSrc: '/flashcards/hit_the_nail.png',
      imagePrompt: 'Cozy low-poly 3D miniature carpenter bench where a cute toy wooden hammer perfectly taps a shiny golden nail, sending out playful star sparks, Animal Crossing aesthetic.'
    },
    {
      id: 'col-4',
      word: 'See eye to eye',
      ipa: '/siː aɪ tuː aɪ/',
      definitionEn: 'To agree fully with someone on an opinion, principle, or course of action.',
      translationEs: 'Estar completamente de acuerdo / Coincidir',
      definitionTranslationEs: 'Compartir exactamente el mismo punto de vista con otra persona sin discrepancias.',
      imageSrc: '/flashcards/see_eye_to_eye.png',
      imagePrompt: 'Cozy colored pencil illustration of two friends sitting across a cafe table smiling in total agreement, speech bubbles merging into a shared glowing golden heart.'
    },
    {
      id: 'col-5',
      word: 'By the book',
      ipa: '/baɪ ðə bʊk/',
      definitionEn: 'Strictly following all established rules, regulations, and official procedures.',
      translationEs: 'Al pie de la letra / Según las reglas',
      definitionTranslationEs: 'Actuar respetando rigurosamente todas las normas y reglamentos oficiales.',
      imageSrc: '/flashcards/by_the_book.png',
      imagePrompt: 'Cozy low-poly 3D diorama of an open oversized storybook with glowing golden rules and a small wooden owl with spectacles perched beside it, warm fantasy library vibe.'
    },
    {
      id: 'col-6',
      word: 'Play devil\'s advocate',
      ipa: '/pleɪ ˈdev.əlz ˈæd.və.kət/',
      definitionEn: 'To argue against an idea simply to test the strength of the argument and examine all sides.',
      translationEs: 'Hacer de abogado del diablo',
      definitionTranslationEs: 'Defender una postura contraria a propósito para retar y examinar la solidez del debate.',
      imageSrc: '/flashcards/devils_advocate.png',
      imagePrompt: 'Playful low-poly 3D chess diorama with a cute little horned red chess knight questioning a wise wooden king with friendly curiosity, warm ambient lighting.'
    },
    {
      id: 'col-7',
      word: 'Back to the drawing board',
      ipa: '/bæk tuː ðə ˈdrɔː.ɪŋ bɔːrd/',
      definitionEn: 'To start planning something completely over again after a previous plan or attempt failed.',
      translationEs: 'Empezar de cero / Volver al punto de partida',
      definitionTranslationEs: 'Reiniciar un proyecto desde el principio tras comprobar que la idea inicial no funcionó.',
      imageSrc: '/flashcards/drawing_board.png',
      imagePrompt: 'Cozy hand-drawn sketch of an architect\'s desk with a crumpled blueprint playfully tossed in a wicker basket, while a fresh blank paper awaits with colored pencils, hopeful mood.'
    },
    {
      id: 'col-8',
      word: 'Call it a day',
      ipa: '/kɔːl ɪt ə deɪ/',
      definitionEn: 'To stop working on something for the rest of the day because enough progress was made.',
      translationEs: 'Dar el día por terminado / Parar por hoy',
      definitionTranslationEs: 'Detener la jornada laboral o de estudio para descansar hasta el día siguiente.',
      imageSrc: '/flashcards/call_it_a_day.png',
      imagePrompt: 'Cozy low-poly 3D isometric diorama of an indie developer desk at twilight: computer asleep with soft breathing light, cozy desk lamp clicked off, steaming mug, peaceful end.'
    },
    {
      id: 'col-9',
      word: 'A blessing in disguise',
      ipa: '/ə ˈbles.ɪŋ ɪn dɪsˈɡaɪz/',
      definitionEn: 'An apparent misfortune that unexpectedly leads to a surprisingly good outcome.',
      translationEs: 'No hay mal que por bien no venga / Bendición oculta',
      definitionTranslationEs: 'Un suceso que al inicio parecía desafortunado pero que termina trayendo un gran beneficio.',
      imageSrc: '/flashcards/blessing_in_disguise.png',
      imagePrompt: 'Charming storybook watercolor and ink sketch: a flat bicycle tire leads a cheerful cyclist to discover a hidden cozy bakery with freshly baked warm bread, pastel colors.'
    },
    {
      id: 'col-10',
      word: 'Burn the midnight oil',
      ipa: '/bɜːrn ðə ˈmɪd.naɪt ɔɪl/',
      definitionEn: 'To study or work late into the night or early hours of the morning.',
      translationEs: 'Quemarse las pestañas / Trasnochar trabajando',
      definitionTranslationEs: 'Quedarse trabajando o estudiando hasta altas horas de la madrugada.',
      imageSrc: '/flashcards/midnight_oil.png',
      imagePrompt: 'Cozy low-poly 3D bedroom desk scene at midnight with a glowing vintage lantern, open notebooks, a sleepy sleeping cat curled on a chair, deep indigo and warm amber lighting.'
    },
    {
      id: 'col-11',
      word: 'Under the weather',
      ipa: '/ˈʌn.dɚ ðə ˈweð.ɚ/',
      definitionEn: 'Feeling slightly unwell, indisposed, sick, or fatigued.',
      translationEs: 'Sentirse indispuesto / Estar pachucho o enfermo',
      definitionTranslationEs: 'Sentir malestar corporal leve o inicio de un resfriado.',
      imageSrc: '/flashcards/under_the_weather.png',
      imagePrompt: 'Cute colored pencil illustration of a cozy bear wrapped in a knitted blanket with wool socks, drinking lemon honey tea under a tiny friendly cartoon raincloud.'
    },
    {
      id: 'col-12',
      word: 'Miss the boat',
      ipa: '/mɪs ðə boʊt/',
      definitionEn: 'To be too slow to take advantage of an opportunity and lose out completely.',
      translationEs: 'Perder el tren / Dejar pasar la oportunidad',
      definitionTranslationEs: 'Perder una gran oportunidad por tardar demasiado en reaccionar.',
      imageSrc: '/flashcards/miss_the_boat.png',
      imagePrompt: 'Stylized low-poly 3D diorama of a cute traveler arriving at a wooden dock just as a colorful cartoon paddleboat drifts peacefully into the sunset, whimsical indie game art.'
    },
    {
      id: 'col-13',
      word: 'Get out of hand',
      ipa: '/ɡet aʊt əv hænd/',
      definitionEn: 'To become unruly, chaotic, or difficult to control.',
      translationEs: 'Salirse de las manos / Descontrolarse',
      definitionTranslationEs: 'Perderse el control de una situación que se vuelve caótica y desordenada.',
      imageSrc: '/flashcards/out_of_hand.png',
      imagePrompt: 'Playful cartoon sketch of multiple colorful fluffy kittens unrolling yarn balls across a cozy living room rug, funny harmless chaos, warm colored-pencil style.'
    },
    {
      id: 'col-14',
      word: 'Bite off more than you can chew',
      ipa: '/baɪt ɔːf mɔːr ðæn juː kæn tʃuː/',
      definitionEn: 'To commit to take on a task that is too large or demanding for you to handle.',
      translationEs: 'Abarcar más de lo que se puede apretar',
      definitionTranslationEs: 'Asumir más responsabilidades o trabajo del que eres capaz de cumplir.',
      imageSrc: '/flashcards/bite_more.png',
      imagePrompt: 'Cozy storybook sketch of a small chipmunk trying to carry three gigantic golden acorns stacked precariously, funny determined expression, warm autumnal palette.'
    },
    {
      id: 'col-15',
      word: 'Rule of thumb',
      ipa: '/ruːl əv θʌm/',
      definitionEn: 'A practical and approximate rule or guideline based on experience rather than exact theory.',
      translationEs: 'Regla empírica / Norma general práctica',
      definitionTranslationEs: 'Principio práctico o guía general basada en la experiencia cotidiana.',
      imageSrc: '/flashcards/rule_of_thumb.png',
      imagePrompt: 'Cozy low-poly 3D artisan workshop with a wooden hand giving a thumbs-up next to an antique wooden measuring ruler, soft wood shavings, warm golden craftsmanship light.'
    }
  ]
}

/* =========================================================================
   CATEGORÍA 2: LUGARES
   ========================================================================= */

// Pack 4: Vocabulario de Gimnasio & Fitness
// Estilo: Stylized low-poly 3D indie fitness game diorama, cute chunky gym equipment, warm ambient neon lights
export const GYM_FITNESS_PACK: FlashcardPack = {
  id: 'gym-fitness-pack',
  title: 'Vocabulario de Gimnasio & Fitness',
  subtitle: 'Vocabulario práctico, términos y expresiones de entrenamiento para desenvolverte con total confianza en cualquier gimnasio del mundo.',
  category: 'Lugares',
  level: 'A2-B2',
  sceneImageSrc: '/interactive_gym_scene.png',
  createdAt: '2026-09-23',
  cards: [
    {
      id: 'gym-1',
      word: 'Warm up',
      ipa: '/wɔːrm ʌp/',
      definitionEn: 'To prepare the body for physical activity with light cardio and dynamic movement.',
      translationEs: 'Calentamiento antes de entrenar',
      definitionTranslationEs: 'Preparar el cuerpo y articulaciones con movimientos suaves antes del ejercicio intenso.',
      imageSrc: '/flashcards/gym_warmup.png',
      hotspotCoordinates: { x: 22, y: 72 },
      imagePrompt: 'Cozy low-poly 3D diorama of an athletic character stretching on an orange yoga mat with a cute jump rope nearby, warm gym floor, vibrant cheerful colors, indie game aesthetic.'
    },
    {
      id: 'gym-2',
      word: 'Dumbbell',
      ipa: '/ˈdʌm.bel/',
      definitionEn: 'A short bar with a weight at each end, used in pairs for weight training.',
      translationEs: 'Mancuerna',
      definitionTranslationEs: 'Barra corta con peso en los extremos para entrenamiento muscular individual.',
      imageSrc: '/flashcards/gym_dumbbell.png',
      hotspotCoordinates: { x: 42, y: 68 },
      imagePrompt: 'Stylized 3D low-poly pair of chunky colorful hexagonal dumbbells resting on a wooden gym floor, glowing pastel violet backlighting, cute stylized video game asset.'
    },
    {
      id: 'gym-3',
      word: 'Barbell',
      ipa: '/ˈbɑːr.bel/',
      definitionEn: 'A long metal bar to which heavy iron weight plates are attached for bench press or squats.',
      translationEs: 'Barra olímpica de pesas',
      definitionTranslationEs: 'Barra larga de metal donde se colocan discos de peso para sentadillas o press banca.',
      imageSrc: '/flashcards/gym_barbell.png',
      hotspotCoordinates: { x: 60, y: 62 },
      imagePrompt: 'Cozy low-poly 3D diorama of a powerlifting platform with a stylized barbell loaded with colorful bumper plates, small bowl of chalk powder with cute chalk dust particles.'
    },
    {
      id: 'gym-4',
      word: 'Treadmill',
      ipa: '/ˈtred.mɪl/',
      definitionEn: 'An exercise machine with a continuous moving belt for running or walking in place.',
      translationEs: 'Caminadora / Cinta eléctrica',
      definitionTranslationEs: 'Máquina de cardio con banda continua para correr o caminar sin desplazarse.',
      imageSrc: '/flashcards/gym_treadmill.png',
      hotspotCoordinates: { x: 16, y: 48 },
      imagePrompt: 'Cute low-poly 3D treadmill with a glowing turquoise pixelated dashboard screen and a water bottle in the cup holder, cozy corner gym setup, vibrant indie game aesthetic.'
    },
    {
      id: 'gym-5',
      word: 'To spot',
      ipa: '/tuː spɑːt/',
      definitionEn: 'To watch over and assist a lifter during a heavy set to prevent injury if they fail.',
      translationEs: 'Cuidar / Asistir en una serie pesada',
      definitionTranslationEs: 'Estar atento para ayudar a levantar la barra si el compañero no puede completar la repetición.',
      imageSrc: '/flashcards/gym_spot_me.png',
      hotspotCoordinates: { x: 74, y: 52 },
      imagePrompt: 'Cozy stylized colored pencil sketch of two workout buddies: one bench-pressing while the partner attentively spots the bar with encouraging teamwork, warm pastel sketch style.'
    },
    {
      id: 'gym-6',
      word: 'Reps and Sets',
      ipa: '/reps ænd sets/',
      definitionEn: 'Reps are the repetitions of an exercise; sets are the cycles of those repetitions.',
      translationEs: 'Repeticiones y Series',
      definitionTranslationEs: 'Repeticiones de un mismo movimiento agrupadas en ciclos o bloques de trabajo.',
      imageSrc: '/flashcards/gym_reps_sets.png',
      hotspotCoordinates: { x: 50, y: 38 },
      imagePrompt: 'Cozy techy 3D diorama of a gym workout notebook with a chunky wooden pencil and a glowing digital tally display showing "10 Reps × 4 Sets", vibrant neon mint highlights.'
    },
    {
      id: 'gym-7',
      word: 'To work in',
      ipa: '/tuː wɜːrk ɪn/',
      definitionEn: 'To alternate sets on the same piece of equipment with another person during their rest period.',
      translationEs: 'Alternar turnos en una máquina',
      definitionTranslationEs: 'Compartir un aparato de gimnasio haciendo tus repeticiones mientras la otra persona descansa.',
      imageSrc: '/flashcards/gym_work_in.png',
      hotspotCoordinates: { x: 82, y: 64 },
      imagePrompt: 'Charming low-poly 3D diorama of two cute gym characters smiling and sharing a cable pulley machine, taking friendly turns between sets, Animal Crossing community vibe.'
    },
    {
      id: 'gym-8',
      word: 'Muscle Soreness',
      ipa: '/ˈmʌs.əl ˈsɔːr.nəs/',
      definitionEn: 'The dull, aching pain felt in muscles 24 to 48 hours after strenuous unaccustomed exercise.',
      translationEs: 'Dolor muscular post-entreno / Estar adolorido',
      definitionTranslationEs: 'Sensación de fatiga y dolor en las fibras musculares tras un entrenamiento exigente.',
      imageSrc: '/flashcards/gym_soreness.png',
      hotspotCoordinates: { x: 34, y: 32 },
      imagePrompt: 'Cute cartoon sketch of a character happily relaxing on a beanbag chair holding an ice pack with a post-workout cup of protein shake, warm colored pencil and ink.'
    },
    {
      id: 'gym-9',
      word: 'Deadlift',
      ipa: '/ˈded.lɪft/',
      definitionEn: 'A weight training exercise in which a loaded barbell is lifted off the ground to the hips.',
      translationEs: 'Peso muerto',
      definitionTranslationEs: 'Levantamiento de barra cargada desde el suelo hasta la cadera manteniendo la espalda recta.',
      imageSrc: '/flashcards/gym_deadlift.png',
      imagePrompt: 'Stylized low-poly 3D diorama of a lifter in pristine posture lifting a barbell from rubber mats, glowing green posture alignment guide lines, indie fitness game style.'
    },
    {
      id: 'gym-10',
      word: 'Squat Rack',
      ipa: '/skwɑːt ræk/',
      definitionEn: 'A metal cage frame designed to support a barbell at shoulder height for heavy squats.',
      translationEs: 'Jaula de sentadillas / Rack de potencia',
      definitionTranslationEs: 'Estructura metálica con soportes de seguridad para realizar sentadillas pesadas.',
      imageSrc: '/flashcards/gym_squat_rack.png',
      imagePrompt: 'Cozy low-poly 3D steel squat cage in a stylized miniature gym corner, soft warm wood floors, neon cyan safety pins, cute chunky video game furniture.'
    },
    {
      id: 'gym-11',
      word: 'Chafing',
      ipa: '/ˈtʃeɪ.fɪŋ/',
      definitionEn: 'Skin irritation caused by friction from clothing or skin rubbing during repetitive motion.',
      translationEs: 'Rozadura / Irritación por fricción en la piel',
      definitionTranslationEs: 'Irritación en la piel ocasionada por el roce repetitivo durante el ejercicio.',
      imageSrc: '/flashcards/gym_chafing.png',
      imagePrompt: 'Cute storybook sketch of a marathon runner applying anti-friction soothing stick balm with a relieved smile, clean pastel tones, hand-drawn comic style.'
    },
    {
      id: 'gym-12',
      word: 'Core Strength',
      ipa: '/kɔːr streŋkθ/',
      definitionEn: 'The functional strength of abdominal, back, and pelvic muscles that stabilize the spine.',
      translationEs: 'Fuerza en la zona media / Abdomen y lumbar',
      definitionTranslationEs: 'Fuerza funcional del abdomen y zona lumbar que mantiene el equilibrio postural.',
      imageSrc: '/flashcards/gym_core_strength.png',
      imagePrompt: 'Cozy techy 3D diorama of a character doing a steady plank on a mat, surrounded by a glowing golden polygon shield icon indicating core stability, indie game aesthetics.'
    },
    {
      id: 'gym-13',
      word: 'Pre-workout',
      ipa: '/priː ˈwɜːrk.aʊt/',
      definitionEn: 'A dietary supplement taken before exercise to boost energy, stamina, and focus.',
      translationEs: 'Suplemento pre-entrenamiento / Energizante',
      definitionTranslationEs: 'Bebida o suplemento tomado antes de entrenar para elevar el nivel de energía y concentración.',
      imageSrc: '/flashcards/gym_pre_workout.png',
      imagePrompt: 'Stylized 3D low-poly shaker cup filled with glowing electric cyan energy potion with playful spark effects, cute gaming potion bottle vibe.'
    },
    {
      id: 'gym-14',
      word: 'Cool Down',
      ipa: '/kuːl daʊn/',
      definitionEn: 'Easy exercise or stretching done after hard workout to gradually lower heart rate.',
      translationEs: 'Enfriamiento / Estiramiento post-entreno',
      definitionTranslationEs: 'Fase final de estiramiento suave para reducir la frecuencia cardíaca tras entrenar.',
      imageSrc: '/flashcards/gym_cool_down.png',
      imagePrompt: 'Cozy watercolor and ink sketch of an athlete peacefully stretching seated on a mat beside a quiet studio window with gentle breeze and cool blue pastel light.'
    },
    {
      id: 'gym-15',
      word: 'Hydrate',
      ipa: '/ˈhaɪ.dreɪt/',
      definitionEn: 'To drink fluid in order to restore bodily moisture during physical exertion.',
      translationEs: 'Hidratación durante el entrenamiento',
      definitionTranslationEs: 'Consumir líquidos suficientes para mantener los músculos hidratados durante el ejercicio.',
      imageSrc: '/flashcards/gym_hydrate.png',
      imagePrompt: 'Cozy low-poly 3D water bottle with cute water droplets and an ice cube floating inside, soft cyan glow, sitting on a warm wooden bench, indie game asset.'
    }
  ]
}

// Pack 5: La Oficina & Entorno Corporativo
// Estilo: Cozy techy low-poly isometric office diorama, cute chunky desk setup, warm desk lamps, pastel & teal lighting
export const OFFICE_WORKPLACE_PACK: FlashcardPack = {
  id: 'office-workplace-pack',
  title: 'La Oficina & Entorno Corporativo',
  subtitle: 'Términos físicos, mobiliario, objetos y conceptos clave del entorno de oficina moderna y trabajo presencial.',
  category: 'Lugares',
  level: 'A2-B2',
  createdAt: '2026-09-27',
  cards: [
    {
      id: 'off-1',
      word: 'Cubicle',
      ipa: '/ˈkjuː.bɪ.kəl/',
      definitionEn: 'A small partitioned workspace within an office floor for an individual employee.',
      translationEs: 'Cubículo de trabajo',
      definitionTranslationEs: 'Espacio individual de trabajo separado por paneles en una oficina.',
      imageSrc: '/flashcards/cubicle.png',
      imagePrompt: 'Cozy low-poly isometric 3D office cubicle with a wooden desk, dual monitors with code, cute potted succulent, warm desk lamp, and fabric partition wall, Animal Crossing meets cyberpunk vibe.'
    },
    {
      id: 'off-2',
      word: 'Watercooler',
      ipa: '/ˈwɑː.t̬ɚˌkuː.lɚ/',
      definitionEn: 'A drinking water dispenser that serves as a common informal gathering spot for office chat.',
      translationEs: 'Dispensador de agua / Lugar de charlas informales',
      definitionTranslationEs: 'Dispensador de agua potable donde los colegas se detienen a conversar brevemente.',
      imageSrc: '/flashcards/watercooler.png',
      imagePrompt: 'Cute low-poly 3D water cooler dispenser with a blue water bottle on top and paper cone cups, two friendly blocky colleagues chatting pleasantly, warm office break corner.'
    },
    {
      id: 'off-3',
      word: 'Whiteboard',
      ipa: '/ˈwaɪt.bɔːrd/',
      definitionEn: 'A smooth glossy white dry-erase board used for teaching, brainstorming, and project mapping.',
      translationEs: 'Pizarra acrílica / Tablero borrable',
      definitionTranslationEs: 'Tablero blanco donde se dibujan diagramas y esquemas durante reuniones.',
      imageSrc: '/flashcards/whiteboard.png',
      imagePrompt: 'Cozy stylized sketch of a whiteboard covered in colorful pastel sticky notes, cute doodle flowcharts, and friendly brainstorm ideas, colored pencil and ink style.'
    },
    {
      id: 'off-4',
      word: 'Swivel chair',
      ipa: '/ˈswɪv.əl tʃer/',
      definitionEn: 'An ergonomic office desk chair on wheels with a seat that turns around on a central stem.',
      translationEs: 'Silla giratoria ergonómica',
      definitionTranslationEs: 'Silla con ruedas y base rotatoria diseñada para trabajar frente a un escritorio.',
      imageSrc: '/flashcards/swivel_chair.png',
      imagePrompt: 'Chunky low-poly 3D ergonomic office chair with wheels, mesh backrest, and soft cushion, pastel lilac and charcoal tones, cozy indie game asset style.'
    },
    {
      id: 'off-5',
      word: 'Paper shredder',
      ipa: '/ˈpeɪ.pɚ ˈʃred.ɚ/',
      definitionEn: 'A mechanical electronic device used to cut confidential documents into fine strips.',
      translationEs: 'Destructora de papel',
      definitionTranslationEs: 'Máquina eléctrica que destruye documentos confidenciales en tiras delgadas.',
      imageSrc: '/flashcards/paper_shredder.png',
      imagePrompt: 'Cute low-poly 3D electric paper shredder neatly slicing a paper into colorful confetti strips, cartoon styled office machine, playful indie design.'
    },
    {
      id: 'off-6',
      word: 'Break room',
      ipa: '/ˈbreɪk ruːm/',
      definitionEn: 'An office room set aside for employees to rest, eat meals, and make coffee.',
      translationEs: 'Sala de descanso / Comedor de empleados',
      definitionTranslationEs: 'Espacio común donde los trabajadores comen y descansan durante sus pausas.',
      imageSrc: '/flashcards/break_room.png',
      imagePrompt: 'Cozy isometric 3D diorama of an office break room with an espresso coffee machine, colorful mugs on open shelves, a comfy mustard sofa, and indoor hanging plants.'
    },
    {
      id: 'off-7',
      word: 'Badge / Keycard',
      ipa: '/bædʒ / ˈkiː.kɑːrd/',
      definitionEn: 'An electronic card with a magnetic chip used by staff to unlock office doors and verify identity.',
      translationEs: 'Carnet de acceso / Tarjeta magnética',
      definitionTranslationEs: 'Tarjeta plástica de identificación para ingresar a las instalaciones de la empresa.',
      imageSrc: '/flashcards/keycard.png',
      imagePrompt: 'Cozy low-poly 3D electronic door reader glowing green as a cute card with a lanyard taps it with playful star unlock particles, video game door unlock moment.'
    },
    {
      id: 'off-8',
      word: 'Filing cabinet',
      ipa: '/ˈfaɪ.lɪŋ ˌkæb.ən.ɪt/',
      definitionEn: 'A metal piece of office furniture with deep drawers for storing categorized folders and records.',
      translationEs: 'Archivador metálico de carpetas',
      definitionTranslationEs: 'Mueble con cajones profundos para guardar y clasificar documentos en carpetas colgantes.',
      imageSrc: '/flashcards/filing_cabinet.png',
      imagePrompt: 'Chunky low-poly 3D filing cabinet with one open drawer showing pastel rainbow hanging folder tabs, cute stylized office furniture asset.'
    },
    {
      id: 'off-9',
      word: 'Briefcase',
      ipa: '/ˈbriːf.keɪs/',
      definitionEn: 'A flat, rectangular case with a handle, used by professionals for carrying papers and laptops.',
      translationEs: 'Maletín ejecutivo',
      definitionTranslationEs: 'Maletín rígido o de cuero usado por ejecutivos para transportar documentos y ordenador.',
      imageSrc: '/flashcards/briefcase.png',
      imagePrompt: 'Cozy hand-drawn colored-pencil sketch of a vintage tan leather briefcase with brass buckles, resting next to an artist notebook and an apple, warm rustic tones.'
    },
    {
      id: 'off-10',
      word: 'Desk organizer',
      ipa: '/desk ˈɔːr.ɡən.aɪ.zɚ/',
      definitionEn: 'A partitioned container designed to keep pens, clips, sticky notes, and scissors tidy on a desk.',
      translationEs: 'Organizador de escritorio',
      definitionTranslationEs: 'Soporte con compartimentos para ordenar bolígrafos, notas adhesivas y clips.',
      imageSrc: '/flashcards/desk_organizer.png',
      imagePrompt: 'Cozy low-poly 3D wooden desk caddy holding colorful gel pens, sticky notes, paperclips, and a pair of pastel scissors on clean oak wood, indie aesthetic.'
    },
    {
      id: 'off-11',
      word: 'Meeting room',
      ipa: '/ˈmiː.tɪŋ ruːm/',
      definitionEn: 'A dedicated room equipped with a large table, chairs, and AV screen for group discussions.',
      translationEs: 'Sala de juntas / Sala de reuniones',
      definitionTranslationEs: 'Habitación equipada con mesa principal y pantalla para conferencias de equipo.',
      imageSrc: '/flashcards/meeting_room.png',
      imagePrompt: 'Cozy isometric low-poly 3D conference room with a warm oval wooden table, pastel chairs, a presentation screen, and panoramic windows overlooking a stylized city.'
    },
    {
      id: 'off-12',
      word: 'Conference call',
      ipa: '/ˈkɑːn.fɚ.əns kɔːl/',
      definitionEn: 'A telephone or video call in which several people in different locations participate simultaneously.',
      translationEs: 'Llamada grupal / Videoconferencia',
      definitionTranslationEs: 'Reunión virtual simultánea entre varias personas desde diferentes lugares.',
      imageSrc: '/flashcards/conference_call.png',
      imagePrompt: 'Cozy techy illustration of a laptop screen displaying cute illustrated video grid tiles of smiling colleagues chatting, warm tea mug beside the laptop, soft colored pencil and digital style.'
    },
    {
      id: 'off-13',
      word: 'Dual monitors',
      ipa: '/ˈduː.əl ˈmɑː.nə.t̬ɚz/',
      definitionEn: 'A computer workstation setup utilizing two side-by-side screens to expand productivity.',
      translationEs: 'Monitores dobles / Pantalla doble',
      definitionTranslationEs: 'Configuración de dos pantallas continuas en un escritorio para facilitar la multitarea.',
      imageSrc: '/flashcards/dual_monitors.png',
      imagePrompt: 'Cozy techy low-poly 3D desk setup with two curved glowing monitors displaying game code and colorful charts, ambient purple backlighting, warm aesthetic.'
    },
    {
      id: 'off-14',
      word: 'Deadline',
      ipa: '/ˈded.laɪn/',
      definitionEn: 'The latest time or date by which an assigned task or project must be completed.',
      translationEs: 'Fecha límite de entrega',
      definitionTranslationEs: 'Fecha y hora tope fijada para entregar un trabajo o proyecto.',
      imageSrc: '/flashcards/deadline.png',
      imagePrompt: 'Cute stylized sketch of a desk calendar with a friendly circled date in bright coral red and a cute animated alarm clock cheering you on, warm ink and pastel style.'
    },
    {
      id: 'off-15',
      word: 'Coffee break',
      ipa: '/ˈkɑː.fi breɪk/',
      definitionEn: 'A short rest period during the workday when workers drink coffee and step away from desks.',
      translationEs: 'Pausa para el café / Descanso breve',
      definitionTranslationEs: 'Intervalo corto de 10 a 15 minutos para tomar un café y despejar la mente del trabajo.',
      imageSrc: '/flashcards/coffee_break.png',
      imagePrompt: 'Cozy hand-drawn sketch of a ceramic coffee cup with gentle steam spirals, resting on an outdoor wooden bench next to a potted fern, warm morning sunlight.'
    }
  ]
}

/* =========================================================================
   CATEGORÍA 3: FAMILIAS CONCEPTUALES
   ========================================================================= */

// Pack 6: Familia Conceptual de "DRAW"
// Estilo: Charming hand-drawn colored-pencil sketch with ink outlines, creative doodle elements
export const INITIAL_DRAW_PACK: FlashcardPack = {
  id: 'draw-family-pack',
  title: 'Familia Conceptual de "DRAW"',
  subtitle: 'Explora los múltiples significados, verbos derivados y colocaciones del verbo raíz "Draw" más allá de la traducción 1 a 1.',
  category: 'Familias Conceptuales',
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
      hotspotCoordinates: { x: 62, y: 15 },
      imagePrompt: 'Warm cozy hand-drawn colored-pencil sketch of an artist\'s hand sketching a fluid nature landscape on textured paper, colorful pencil shavings and an ink jar nearby.'
    },
    {
      id: 'draw-2',
      word: 'Drawer',
      ipa: '/drɔːr/',
      definitionEn: 'A wooden box inside a desk or table that you pull out to store things.',
      translationEs: 'Cajón / Gaveta',
      definitionTranslationEs: 'Una caja de madera dentro de un escritorio o mesa que jalas para guardar cosas.',
      imageSrc: '/flashcards/drawer.png',
      hotspotCoordinates: { x: 31, y: 74 },
      imagePrompt: 'Cozy low-poly 3D wooden desk drawer pulled open revealing organized colorful stationery, stickers, and art supplies, charming miniature diorama.'
    },
    {
      id: 'draw-3',
      word: 'Withdraw',
      ipa: '/wɪðˈdrɔː/',
      definitionEn: 'To take money out of a bank account or to leave a place or competition.',
      translationEs: 'Retirar dinero / Salirse de un lugar',
      definitionTranslationEs: 'Sacar dinero de una cuenta bancaria o retirarse de un lugar o competencia.',
      imageSrc: '/flashcards/withdraw.png',
      hotspotCoordinates: { x: 49, y: 38 },
      imagePrompt: 'Cute low-poly 3D ATM machine in a cozy pastel city wall dispensing crisp paper bills with a glowing green confirmation icon, Animal Crossing aesthetic.'
    },
    {
      id: 'draw-4',
      word: 'Drawback',
      ipa: '/ˈdrɔː.bæk/',
      definitionEn: 'A problem, bad feature, or disadvantage of a situation.',
      translationEs: 'Desventaja / Inconveniente',
      definitionTranslationEs: 'Un problema, característica mala o inconveniente de una situación.',
      imageSrc: '/flashcards/drawback.png',
      hotspotCoordinates: { x: 63, y: 64 },
      imagePrompt: 'Playful colored pencil sketch of a shiny new toy robot that runs out of battery with a cute little unplugged cord icon, whimsical storybook metaphor.'
    },
    {
      id: 'draw-5',
      word: 'Draw Attention',
      ipa: '/drɔː əˈten.ʃən/',
      definitionEn: 'To make people notice, look at, or listen to something.',
      translationEs: 'Llamar la atención / Atraer miradas',
      definitionTranslationEs: 'Hacer que las personas se den cuenta, miren o escuchen algo.',
      imageSrc: '/flashcards/draw_attention.png',
      hotspotCoordinates: { x: 88, y: 18 },
      imagePrompt: 'Cozy stylized illustration of a single bright yellow umbrella popping out cheerfully in a rainy crowd of muted grey coats, warm colored pencil and ink art.'
    },
    {
      id: 'draw-6',
      word: 'Draw a Conclusion',
      ipa: '/drɔː ə kənˈkluː.ʒən/',
      definitionEn: 'To make a final decision or opinion after studying facts.',
      translationEs: 'Sacar una conclusión',
      definitionTranslationEs: 'Llegar a una decisión u opinión final después de estudiar los hechos.',
      imageSrc: '/flashcards/draw_conclusion.png',
      hotspotCoordinates: { x: 65, y: 35 },
      imagePrompt: 'Cozy low-poly 3D detective corkboard with cute polaroid photos connected by red strings leading to a glowing golden puzzle piece, indie mystery game style.'
    },
    {
      id: 'draw-7',
      word: 'Redraft',
      ipa: '/ˌriːˈdrɑːft/',
      definitionEn: 'To write or draw a plan again to fix errors and make it better.',
      translationEs: 'Reescribir / Rehacer un borrador',
      definitionTranslationEs: 'Escribir o dibujar un plan otra vez para corregir errores y mejorarlo.',
      imageSrc: '/flashcards/redraft.png',
      hotspotCoordinates: { x: 88, y: 80 },
      imagePrompt: 'Cozy colored pencil sketch of an architect refining a treehouse sketch with a pink eraser and red pencil, layered tracing paper, warm craftsmanship vibe.'
    },
    {
      id: 'draw-8',
      word: 'Draw a Tie',
      ipa: '/drɔː ə taɪ/',
      definitionEn: 'To finish a game or competition with equal points so no one wins.',
      translationEs: 'Empatar el partido / Quedar en empate',
      definitionTranslationEs: 'Terminar un juego o competencia con puntos iguales para que nadie gane.',
      imageSrc: '/flashcards/draw_tie.png',
      hotspotCoordinates: { x: 25, y: 18 },
      imagePrompt: 'Charming low-poly 3D scoreboard showing "2 - 2" at the final whistle with two cute blocky soccer players exchanging jerseys with friendly smiles.'
    },
    {
      id: 'draw-9',
      word: 'Draw a Bath',
      ipa: '/drɔː ə bɑːθ/',
      definitionEn: 'To fill a bathtub with warm water for taking a bath.',
      translationEs: 'Llenar la tina / Preparar un baño de tina',
      definitionTranslationEs: 'Llenar una tina con agua tibia para tomar un baño.',
      imageSrc: '/flashcards/draw_bath.png',
      hotspotCoordinates: { x: 12, y: 45 },
      imagePrompt: 'Cozy low-poly 3D clawfoot bathtub filling with warm steaming water, fluffy soap bubbles, rubber duck floating peacefully, pastel bathroom diorama.'
    },
    {
      id: 'draw-10',
      word: 'Draw Blood',
      ipa: '/drɔː blʌd/',
      definitionEn: 'To make blood come out of the body with a needle or small cut.',
      translationEs: 'Sacar sangre / Extraer muestra de sangre',
      definitionTranslationEs: 'Hacer que salga sangre del cuerpo con una aguja o pequeño corte.',
      imageSrc: '/flashcards/draw_blood.png',
      hotspotCoordinates: { x: 42, y: 82 },
      imagePrompt: 'Cute, gentle pastel storybook sketch of a friendly clinic nurse putting a colorful star band-aid on a brave little patient after a checkup, warm reassuring style.'
    },
    {
      id: 'draw-11',
      word: 'Draw a Blank',
      ipa: '/drɔː ə blæŋk/',
      definitionEn: 'To fail to remember an answer, name, or memory when asked.',
      translationEs: 'Quedarse en blanco / Olvidar la respuesta',
      definitionTranslationEs: 'No poder recordar una respuesta, nombre o recuerdo cuando te preguntan.',
      imageSrc: '/flashcards/draw_blank.png',
      hotspotCoordinates: { x: 80, y: 48 },
      imagePrompt: 'Funny stylized sketch of a student looking at a quiz with a completely blank fluffy cartoon thought bubble above their head, colored pencil and ink doodle.'
    },
    {
      id: 'draw-12',
      word: 'Overdraw',
      ipa: '/ˌoʊ.vɚˈdrɔː/',
      definitionEn: 'To spend more money than you actually have in your bank account.',
      translationEs: 'Sobregirar la cuenta / Girar en descubierto',
      definitionTranslationEs: 'Gastar más dinero del que realmente tienes en tu cuenta bancaria.',
      imageSrc: '/flashcards/overdraw.png',
      imagePrompt: 'Cute low-poly 3D piggy bank peering inside its empty belly with a friendly puzzled expression, a tiny floating "-$20" glowing gently, video game asset style.'
    },
    {
      id: 'draw-13',
      word: 'Draw Out',
      ipa: '/drɔː aʊt/',
      definitionEn: 'To make something last longer than usual or elicit information gradually.',
      translationEs: 'Extender una conversación / Prolongar un tema',
      definitionTranslationEs: 'Hacer que una conversación o proceso dure más tiempo de lo normal.',
      imageSrc: '/flashcards/draw_out.png',
      imagePrompt: 'Playful low-poly 3D clock with elastic rubbery hands stretching like bubblegum, whimsical time dilation concept in a cozy pastel room.'
    },
    {
      id: 'draw-14',
      word: 'Draw Up',
      ipa: '/drɔː ʌp/',
      definitionEn: 'To prepare and write a formal document such as a contract or agreement.',
      translationEs: 'Redactar un contrato / Formular documento oficial',
      definitionTranslationEs: 'Escribir y preparar un documento formal como un contrato o acuerdo.',
      imageSrc: '/flashcards/draw_up.png',
      imagePrompt: 'Cozy colored pencil sketch of a classic wooden desk with a scroll parchment, an elegant fountain pen signing a friendly agreement, warm golden ambient light.'
    },
    {
      id: 'draw-15',
      word: 'Draw a Crowd',
      ipa: '/drɔː ə kraʊd/',
      definitionEn: 'To attract a large group of spectators or interested people.',
      translationEs: 'Atraer una multitud / Convocar gente',
      definitionTranslationEs: 'Conseguir que un grupo numeroso de personas se reúna a mirar un espectáculo o evento.',
      imageSrc: '/flashcards/draw_crowd.png',
      imagePrompt: 'Cozy low-poly 3D diorama of a street musician playing an acoustic guitar under a streetlamp in a cobblestone plaza, surrounded by an eager circle of cute blocky spectators.'
    }
  ]
}

// Pack 7: Familia Conceptual de "TAKE"
// Estilo: Cozy stylized 3D low-poly miniature world, warm sunset and twilight palette, charming game assets
export const TAKE_FAMILY_PACK: FlashcardPack = {
  id: 'take-family-pack',
  title: 'Familia Conceptual de "TAKE"',
  subtitle: 'Polisemia, prefijos, sufijos y verbos derivados del núcleo "Take" para dominar decenas de usos y colocaciones nativas.',
  category: 'Familias Conceptuales',
  level: 'B1-B2',
  createdAt: '2026-09-27',
  cards: [
    {
      id: 'take-1',
      word: 'Take',
      ipa: '/teɪk/',
      definitionEn: 'To reach out, grasp, hold, or accept something with your hands or consent.',
      translationEs: 'Tomar / Agarrar / Aceptar',
      definitionTranslationEs: 'Asir algo con la mano o recibirlo voluntariamente.',
      imageSrc: '/flashcards/take.png',
      imagePrompt: 'Cute low-poly 3D character hand reaching out to receive a glowing golden star item, charming Zelda-inspired low-poly item pickup moment.'
    },
    {
      id: 'take-2',
      word: 'Intake',
      ipa: '/ˈɪn.teɪk/',
      definitionEn: 'An amount of food, air, liquid, or people taken in; or an opening where fluid enters.',
      translationEs: 'Consumo / Ingesta / Entrada de aire o fluidos',
      definitionTranslationEs: 'Cantidad de sustancias (alimento, agua o aire) que ingresa al cuerpo o a un motor.',
      imageSrc: '/flashcards/intake.png',
      imagePrompt: 'Cozy colored pencil sketch of a friendly nutritionist review board showing glasses of fresh water, crisp apples, and healthy intake portions, pastel green and orange.'
    },
    {
      id: 'take-3',
      word: 'Mistake',
      ipa: '/mɪˈsteɪk/',
      definitionEn: 'An action, decision, or judgment that is incorrect, misguided, or wrong.',
      translationEs: 'Error / Equivocación',
      definitionTranslationEs: 'Decisión, cálculo o acto que no es correcto o resulta desacertado.',
      imageSrc: '/flashcards/mistake.png',
      imagePrompt: 'Charming low-poly 3D wooden school desk with a cute pink eraser gently dusting away a pencil doodle, playful eraser shavings, warm cozy lighting.'
    },
    {
      id: 'take-4',
      word: 'Overtake',
      ipa: '/ˌoʊ.vɚˈteɪk/',
      definitionEn: 'To catch up with and pass by something moving in the same direction.',
      translationEs: 'Adelantar / Sobrepasar en velocidad',
      definitionTranslationEs: 'Alcanzar y dejar atrás a un vehículo o competidor que avanza en la misma dirección.',
      imageSrc: '/flashcards/overtake.png',
      imagePrompt: 'Cozy low-poly 3D kart racing scene where a cute blue racing kart smoothly overtakes a yellow kart on a winding seaside cliff track, Mario Kart indie style.'
    },
    {
      id: 'take-5',
      word: 'Undertake',
      ipa: '/ˌʌn.dɚˈteɪk/',
      definitionEn: 'To commit oneself to and begin an ambitious project, journey, or formal responsibility.',
      translationEs: 'Emprender / Comprometerse con una tarea compleja',
      definitionTranslationEs: 'Iniciar y hacerse cargo formalmente de un proyecto exigente o expedición.',
      imageSrc: '/flashcards/undertake.png',
      imagePrompt: 'Cozy storybook sketch of a small brave traveler standing at the gates of a whimsical ancient forest with a map in hand, embarking on an epic journey.'
    },
    {
      id: 'take-6',
      word: 'Uptake',
      ipa: '/ˈʌp.teɪk/',
      definitionEn: 'The absorption and assimilation of substances (e.g. by cells); or the rate of adoption/comprehension.',
      translationEs: 'Asimilación / Tasa de absorción o adopción',
      definitionTranslationEs: 'Capacidad o rapidez con la que se absorbe una sustancia o se asimila una tecnología.',
      imageSrc: '/flashcards/uptake.png',
      imagePrompt: 'Cozy low-poly 3D diorama of plant roots in fertile soil absorbing glowing turquoise water droplets, beautiful bioluminescent botanical art.'
    },
    {
      id: 'take-7',
      word: 'Take over',
      ipa: '/teɪk ˈoʊ.vɚ/',
      definitionEn: 'To assume control, management, or ownership of something from someone else.',
      translationEs: 'Asumir el control / Tomar el mando',
      definitionTranslationEs: 'Hacerse cargo de la dirección o propiedad de una empresa o tarea relevando a otro.',
      imageSrc: '/flashcards/take_over.png',
      imagePrompt: 'Cozy low-poly 3D spaceship cockpit where a friendly co-pilot gently grips the glowing neon steering controls, taking over the helm smoothly.'
    },
    {
      id: 'take-8',
      word: 'Take off',
      ipa: '/teɪk ɔːf/',
      definitionEn: 'For an aircraft to leave the ground; or to suddenly become wildly successful and popular.',
      translationEs: 'Despegar / Dispararse en éxito',
      definitionTranslationEs: 'Elevarse un avión en el aire o comenzar a tener éxito vertiginoso un negocio.',
      imageSrc: '/flashcards/take_off.png',
      imagePrompt: 'Cozy low-poly 3D stylized airplane taking off into a warm golden apricot sunset sky above fluffy pastel clouds, cute chunky aircraft model, indie game aesthetic.'
    },
    {
      id: 'take-9',
      word: 'Take after',
      ipa: '/teɪk ˈæf.tɚ/',
      definitionEn: 'To resemble a parent or older relative in appearance, personality, or behavioral traits.',
      translationEs: 'Parecerse a / Salir igual a (un familiar)',
      definitionTranslationEs: 'Heredar rasgos físicos, gustos o gestos de un padre o familiar mayor.',
      imageSrc: '/flashcards/take_after.png',
      imagePrompt: 'Warm colored pencil illustration of a father bear and little bear cub walking side by side, making the exact same funny curious head tilt, cozy family warmth.'
    },
    {
      id: 'take-10',
      word: 'Take for granted',
      ipa: '/teɪk fɔːr ˈɡræn.t̬ɪd/',
      definitionEn: 'To fail to appreciate someone or something because you are overly accustomed to them.',
      translationEs: 'Dar por sentado / No valorar lo que se tiene',
      definitionTranslationEs: 'Asumir que algo o alguien siempre estará ahí sin reconocer su verdadero valor.',
      imageSrc: '/flashcards/take_for_granted.png',
      imagePrompt: 'Cozy storybook sketch of a person looking at a screen while a breathtaking pastel rainbow shines unnoticed just outside their window, gentle reflective mood.'
    },
    {
      id: 'take-11',
      word: 'Take place',
      ipa: '/teɪk pleɪs/',
      definitionEn: 'To happen, occur, or be celebrated at a particular scheduled time and venue.',
      translationEs: 'Llevarse a cabo / Tener lugar',
      definitionTranslationEs: 'Ocurrir o celebrarse un evento en una fecha y lugar determinados.',
      imageSrc: '/flashcards/take_place.png',
      imagePrompt: 'Cozy low-poly 3D diorama of an open-air village festival with hanging string fairy lights, a wooden stage, and confetti, charming celebration atmosphere.'
    },
    {
      id: 'take-12',
      word: 'Take up',
      ipa: '/teɪk ʌp/',
      definitionEn: 'To begin practicing a new hobby, sport, or activity; or to occupy space or time.',
      translationEs: 'Empezar una afición / Ocupar tiempo o espacio',
      definitionTranslationEs: 'Iniciar la práctica de un nuevo pasatiempo o deporte.',
      imageSrc: '/flashcards/take_up.png',
      imagePrompt: 'Cozy hand-drawn colored-pencil sketch of a beginner picking up a wooden acoustic guitar with chord charts and colorful plant pots in a sunlit bedroom.'
    },
    {
      id: 'take-13',
      word: 'Take on',
      ipa: '/teɪk ɑːn/',
      definitionEn: 'To accept a new challenge, responsibility, or competitor.',
      translationEs: 'Asumir un reto / Enfrentarse a una responsabilidad',
      definitionTranslationEs: 'Aceptar una carga de trabajo desafiante o competir contra un rival.',
      imageSrc: '/flashcards/take_on.png',
      imagePrompt: 'Cozy low-poly 3D diorama of a cute small knight character looking up at a giant but friendly mountain dragon, holding a wooden shield, whimsical RPG aesthetic.'
    },
    {
      id: 'take-14',
      word: 'Take out',
      ipa: '/teɪk aʊt/',
      definitionEn: 'To extract something from inside; to invite someone on a date; or to buy prepared food to eat elsewhere.',
      translationEs: 'Sacar algo / Invitar a salir / Comida para llevar',
      definitionTranslationEs: 'Retirar algo de un lugar, invitar a cenar a alguien o pedir comida para llevar.',
      imageSrc: '/flashcards/take_out.png',
      imagePrompt: 'Cozy low-poly 3D diorama of a classic noodle takeout box with chopsticks and steam swirls, sitting on an outdoor wooden park table at dusk.'
    },
    {
      id: 'take-15',
      word: 'Take back',
      ipa: '/teɪk bæk/',
      definitionEn: 'To return something purchased to a store; or to retract a statement you previously made.',
      translationEs: 'Devolver un producto / Retractarse de lo dicho',
      definitionTranslationEs: 'Devolver un artículo a la tienda o retirar unas palabras dichas por error.',
      imageSrc: '/flashcards/take_back.png',
      imagePrompt: 'Charming colored pencil sketch of a customer handing a wrapped gift box back across a friendly wooden shop counter with a receipt, warm village store.'
    }
  ]
}

/* =========================================================================
   CATEGORÍA 4: VERBOS FRASALES
   ========================================================================= */

// Pack 8: Top 15 Verbos Frasales Imprescindibles
// Estilo: Cozy narrative storybook sketch with vibrant watercolor and ink lines, expressive character moments
export const PHRASAL_VERBS_PACK: FlashcardPack = {
  id: 'phrasal-verbs-pack',
  title: 'Top 15 Verbos Frasales Imprescindibles',
  subtitle: 'Los 15 phrasal verbs más frecuentes y utilizados en conversaciones reales en inglés con significados directos y visuales.',
  category: 'Verbos Frasales',
  level: 'A2-B2',
  createdAt: '2026-09-27',
  cards: [
    {
      id: 'pv-1',
      word: 'Look for',
      ipa: '/lʊk fɔːr/',
      definitionEn: 'To attempt to find someone or something that is lost or needed.',
      translationEs: 'Buscar algo o a alguien',
      definitionTranslationEs: 'Intentar localizar un objeto extraviado o una persona.',
      imageSrc: '/flashcards/look_for.png',
      imagePrompt: 'Cozy hand-drawn colored-pencil sketch of a cute character on hands and knees peering under a cozy armchair with a glowing flashlight searching for keys, warm living room.'
    },
    {
      id: 'pv-2',
      word: 'Give up',
      ipa: '/ɡɪv ʌp/',
      definitionEn: 'To cease making an effort; to surrender, quit a habit, or resign.',
      translationEs: 'Rendirse / Abandonar un hábito',
      definitionTranslationEs: 'Dejar de esforzarse o abandonar una meta o costumbre.',
      imageSrc: '/flashcards/give_up.png',
      imagePrompt: 'Stylized low-poly 3D scene of a small white flag planted on a gentle grassy hill at sunrise, with a relieved character resting against a tree letting go of burdens.'
    },
    {
      id: 'pv-3',
      word: 'Figure out',
      ipa: '/ˈfɪɡ.jɚ aʊt/',
      definitionEn: 'To solve, comprehend, or discover the answer to a complex puzzle or problem.',
      translationEs: 'Descifrar / Comprender / Resolver',
      definitionTranslationEs: 'Llegar a entender cómo funciona algo o encontrar la solución a un dilema.',
      imageSrc: '/flashcards/figure_out.png',
      imagePrompt: 'Cozy techy low-poly 3D diorama of a solved Rubik\'s cube with glowing pastel faces aligning, gentle star particle burst, cozy workbench setting.'
    },
    {
      id: 'pv-4',
      word: 'Pick up',
      ipa: '/pɪk ʌp/',
      definitionEn: 'To lift something from a surface; to answer a phone; or to collect someone in a vehicle.',
      translationEs: 'Recoger / Levantar del suelo / Contestar el teléfono',
      definitionTranslationEs: 'Levantar un objeto del suelo, pasar a buscar a alguien o responder una llamada.',
      imageSrc: '/flashcards/pick_up.png',
      imagePrompt: 'Cozy low-poly 3D diorama of a cute pastel yellow car stopping at a sidewalk curb to pick up a friend holding a backpack, cheerful morning city street.'
    },
    {
      id: 'pv-5',
      word: 'Bring up',
      ipa: '/brɪŋ ʌp/',
      definitionEn: 'To mention or introduce a topic into a discussion; or to raise a child.',
      translationEs: 'Mencionar un tema / Sacar a relucir / Criar',
      definitionTranslationEs: 'Introducir un asunto nuevo en una conversación o educar a un hijo.',
      imageSrc: '/flashcards/bring_up.png',
      imagePrompt: 'Warm colored pencil sketch of a friendly group having coffee around a round wooden table, one person raising a hand cheerfully to introduce a new idea.'
    },
    {
      id: 'pv-6',
      word: 'Come across',
      ipa: '/kʌm əˈkrɔːs/',
      definitionEn: 'To find or meet someone or something purely by chance or coincidence.',
      translationEs: 'Toparse con / Encontrar por casualidad',
      definitionTranslationEs: 'Hallar un objeto o coincidir con alguien inesperadamente sin haberlo buscado.',
      imageSrc: '/flashcards/come_across.png',
      imagePrompt: 'Cozy storybook illustration of a woodland hiker discovering a tiny hidden wooden mailbox nestled inside an old hollow tree, sense of sweet unexpected wonder.'
    },
    {
      id: 'pv-7',
      word: 'Run out of',
      ipa: '/rʌn aʊt əv/',
      definitionEn: 'To completely exhaust or deplete the supply of something so that none remains.',
      translationEs: 'Quedarse sin algo / Agotarse las existencias',
      definitionTranslationEs: 'Gastar por completo un recurso (tiempo, dinero, batería o gasolina) hasta que no quede nada.',
      imageSrc: '/flashcards/run_out_of.png',
      imagePrompt: 'Cute cartoon sketch of an empty honey jar with a single last droplet and a friendly bear upside down scraping the bottom, warm storybook style.'
    },
    {
      id: 'pv-8',
      word: 'Turn out',
      ipa: '/tɜːrn aʊt/',
      definitionEn: 'To develop or end up in a particular way; or to result in an unexpected surprise.',
      translationEs: 'Resultar ser / Desenlazarse',
      definitionTranslationEs: 'Tener un resultado final específico que a menudo sorprende respecto a lo esperado.',
      imageSrc: '/flashcards/turn_out.png',
      imagePrompt: 'Cozy hand-drawn sketch of a baker taking a golden, perfectly puffed pastry loaf out of an oven, warm steam rising, triumphant smiling expression.'
    },
    {
      id: 'pv-9',
      word: 'Put off',
      ipa: '/pʊt ɔːf/',
      definitionEn: 'To postpone, delay, or reschedule an event to a later time; to procrastinate.',
      translationEs: 'Postergar / Aplazar / Dejar para después',
      definitionTranslationEs: 'Posponer una cita o tarea para más adelante por desgana o conveniencia.',
      imageSrc: '/flashcards/put_off.png',
      imagePrompt: 'Cozy low-poly 3D desk calendar with a little cartoon sticky note hopping from Monday to Friday with a playful shrug, pastel colors.'
    },
    {
      id: 'pv-10',
      word: 'Call off',
      ipa: '/kɔːl ɔːf/',
      definitionEn: 'To cancel a planned event, match, or operation before it happens.',
      translationEs: 'Cancelar un evento planificado',
      definitionTranslationEs: 'Suspender definitivamente un acto o reunión programada.',
      imageSrc: '/flashcards/call_off.png',
      imagePrompt: 'Charming storybook sketch of an outdoor picnic blanket being packed up as gentle raindrops start falling, a cute red umbrella opening, cozy rain.'
    },
    {
      id: 'pv-11',
      word: 'Set up',
      ipa: '/set ʌp/',
      definitionEn: 'To assemble, install, establish, or configure equipment, a business, or an event.',
      translationEs: 'Configurar / Montar / Instalar / Fundar',
      definitionTranslationEs: 'Ensamblar equipos, preparar un escenario o poner en marcha una empresa.',
      imageSrc: '/flashcards/set_up.png',
      imagePrompt: 'Cozy techy low-poly 3D diorama of someone setting up a podcast studio: microphone on a boom arm, headphones, and a warm desk lamp, indie game workstation.'
    },
    {
      id: 'pv-12',
      word: 'Go on',
      ipa: '/ɡoʊ ɑːn/',
      definitionEn: 'To continue an activity without stopping; or to occur.',
      translationEs: 'Continuar / Seguir adelante / Pasar',
      definitionTranslationEs: 'Proseguir con lo que se estaba haciendo sin detenerse.',
      imageSrc: '/flashcards/go_on.png',
      imagePrompt: 'Cozy low-poly 3D pathway winding through rolling green hills with glowing fairy lanterns along the path, inviting the wanderer to continue onward.'
    },
    {
      id: 'pv-13',
      word: 'Point out',
      ipa: '/pɔɪnt aʊt/',
      definitionEn: 'To draw someone\'s attention to a particular fact, detail, or error.',
      translationEs: 'Señalar / Hacer notar / Indicar un detalle',
      definitionTranslationEs: 'Dirigir la mirada o atención de alguien hacia un dato o detalle relevante.',
      imageSrc: '/flashcards/point_out.png',
      imagePrompt: 'Warm colored pencil sketch of two friends looking at a star map together, one pointing with a telescope at a glowing constellation in the night sky.'
    },
    {
      id: 'pv-14',
      word: 'Find out',
      ipa: '/faɪnd aʊt/',
      definitionEn: 'To discover, learn, or uncover a piece of information, truth, or fact through inquiry.',
      translationEs: 'Enterarse de / Descubrir la verdad',
      definitionTranslationEs: 'Obtener conocimiento de un dato o secreto tras investigar o preguntar.',
      imageSrc: '/flashcards/find_out.png',
      imagePrompt: 'Cozy storybook illustration of a young detective holding an antique magnifying glass over an open secret diary with glowing golden ink on a wooden desk.'
    },
    {
      id: 'pv-15',
      word: 'Hold on',
      ipa: '/hoʊld ɑːn/',
      definitionEn: 'To wait for a short period of time; or to grip tightly for support.',
      translationEs: 'Esperar un momento / Aguantar firme',
      definitionTranslationEs: 'Pausar y aguardar un breve momento, o sostenerse con fuerza.',
      imageSrc: '/flashcards/hold_on.png',
      imagePrompt: 'Cozy retro illustration of a yellow rotary telephone handset with a little animated musical note floating up, signifying a friendly brief hold music pause.'
    }
  ]
}

export const BUILTIN_FLASHCARD_PACKS: FlashcardPack[] = [
  // 1. Vocabulario General
  FALSE_FRIENDS_PACK,
  LOGICAL_CONNECTORS_PACK,
  COLLOCATIONS_IDIOMS_PACK,

  // 2. Lugares
  GYM_FITNESS_PACK,
  OFFICE_WORKPLACE_PACK,

  // 3. Familias Conceptuales
  INITIAL_DRAW_PACK,
  TAKE_FAMILY_PACK,

  // 4. Verbos Frasales
  PHRASAL_VERBS_PACK
]

export const FLASHCARD_CATEGORIES = [
  'Vocabulario General',
  'Lugares',
  'Familias Conceptuales',
  'Verbos Frasales'
] as const

const STORAGE_KEY = 'lingualife_flashcard_packs_v2'

export function getAllFlashcardPacks(): FlashcardPack[] {
  if (typeof window === 'undefined') return BUILTIN_FLASHCARD_PACKS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return BUILTIN_FLASHCARD_PACKS
    const customPacks: FlashcardPack[] = JSON.parse(raw)
    
    const map = new Map<string, FlashcardPack>()
    customPacks.forEach(p => map.set(p.id, p))
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
