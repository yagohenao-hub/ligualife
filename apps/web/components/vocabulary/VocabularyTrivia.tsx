import React, { useState, useEffect } from 'react';
import { VocabularyWordItem, VocabCategory } from '@/lib/vocabulary';
import styles from '@/styles/Vocabulary.module.css';

interface Props {
  words: VocabularyWordItem[];
  category?: VocabCategory;
}

interface TriviaQuestion {
  targetWord: string;
  contextSentence: string;
  embeddedPassiveWord?: { word: string; meaning: string };
  questionType: 'polysemy_trap' | 'cloze' | 'grammar_function';
  options: { text: string; isCorrect: boolean; explanation?: string }[];
}

const CATEGORY_TRIVIA_BANKS: Record<VocabCategory, TriviaQuestion[]> = {
  time_words: [
    {
      targetWord: 'would',
      contextSentence: 'If we had more time today, I ___ review the last five slides with you.',
      embeddedPassiveWord: { word: 'slides', meaning: 'Diapositivas de la lección' },
      questionType: 'cloze',
      options: [
        { text: 'would (Condicional: revisaría)', isCorrect: true, explanation: '"Would" añade el sentido condicional "-ría" a la acción.' },
        { text: 'will (Futuro certero)', isCorrect: false, explanation: 'En una situación hipotética con "if had", no se usa will directo.' },
        { text: 'must (Obligación estricta)', isCorrect: false, explanation: 'Expresa necesidad obligatoria, no deseo hipotético.' },
        { text: 'can (Habilidad presente)', isCorrect: false, explanation: 'Para oraciones condicionales se requiere would o could.' }
      ]
    },
    {
      targetWord: 'did',
      contextSentence: 'Why ___ you choose this specific topic for our speaking practice?',
      embeddedPassiveWord: { word: 'speaking practice', meaning: 'Práctica de conversación activa' },
      questionType: 'cloze',
      options: [
        { text: 'did (Auxiliar de pasado)', isCorrect: true, explanation: '"Did" absorbe el tiempo pasado en preguntas, dejando choose en forma base.' },
        { text: 'do (Auxiliar de presente)', isCorrect: false, explanation: 'Pregunta por una elección ya realizada en el pasado.' },
        { text: 'chose (Verbo ya en pasado)', isCorrect: false, explanation: 'No se puede usar verbo pasado directamente con inversión interrogativa.' },
        { text: 'have (Haber)', isCorrect: false, explanation: 'Requeriría participio "chosen", no la forma base.' }
      ]
    },
    {
      targetWord: 'should',
      contextSentence: 'You have a headache; you ___ take a short break before the meeting starts.',
      embeddedPassiveWord: { word: 'short break', meaning: 'Pausa breve para descansar' },
      questionType: 'grammar_function',
      options: [
        { text: 'should (Consejo / Recomendación amistosa)', isCorrect: true, explanation: '"Should" es el modal de recomendación y sugerencia.' },
        { text: 'must (Imposición legal u obligatoria)', isCorrect: false, explanation: 'Demasiado severo para un simple dolor de cabeza.' },
        { text: 'shall (Compromiso solemne en primera persona)', isCorrect: false, explanation: 'No se usa con "you" para dar consejos cotidianos.' },
        { text: 'did (Pasado)', isCorrect: false, explanation: 'El consejo es para el presente/futuro inmediato.' }
      ]
    },
    {
      targetWord: 'must',
      contextSentence: 'Look at the heavy traffic on the highway! We ___ be late for our flight if we don\'t leave now.',
      embeddedPassiveWord: { word: 'highway', meaning: 'Autopista principal' },
      questionType: 'cloze',
      options: [
        { text: 'will / might (Cálculo de probabilidad)', isCorrect: false, explanation: 'Revisa la deducción lógica de certeza.' },
        { text: 'must (Deducción lógica certera)', isCorrect: true, explanation: '"Must be" expresa una alta deducción lógica basada en la evidencia.' },
        { text: 'could to (Error de sintaxis con to)', isCorrect: false, explanation: 'Los modales jamás llevan "to".' },
        { text: 'did (Pasado)', isCorrect: false, explanation: 'Habla de un evento inminente.' }
      ]
    }
  ],
  prepositions_in_on_at: [
    {
      targetWord: 'at',
      contextSentence: 'Santiago\'s class begins promptly ___ 11:00 AM on Wednesday.',
      embeddedPassiveWord: { word: 'promptly', meaning: 'Con estricta puntualidad' },
      questionType: 'cloze',
      options: [
        { text: 'at (Horas precisas del reloj)', isCorrect: true, explanation: 'Para las horas del reloj se usa estrictamente "at".' },
        { text: 'in (Espacio amplio o meses)', isCorrect: false, explanation: '"In" no se usa con horas de reloj.' },
        { text: 'on (Días de la semana)', isCorrect: false, explanation: '"On" acompaña a "Wednesday", pero la hora puntual requiere "at".' },
        { text: 'by (Junto a)', isCorrect: false, explanation: 'No marca la hora fija de inicio.' }
      ]
    },
    {
      targetWord: 'on',
      contextSentence: 'All the printed reports are resting ___ the conference table.',
      embeddedPassiveWord: { word: 'conference table', meaning: 'Mesa de reuniones' },
      questionType: 'cloze',
      options: [
        { text: 'on (Superficie con contacto físico)', isCorrect: true, explanation: 'Estar encima de una mesa con contacto se expresa con "on".' },
        { text: 'in (Dentro de un contenedor)', isCorrect: false, explanation: 'Una mesa no es una caja 3D en la que te metes dentro.' },
        { text: 'at (Punto geográfico)', isCorrect: false, explanation: 'La superficie de contacto exige "on".' },
        { text: 'under (Debajo)', isCorrect: false, explanation: 'Significa debajo, contrario a la intención.' }
      ]
    },
    {
      targetWord: 'in',
      contextSentence: 'She moved to live and work ___ Colombia two years ago.',
      embeddedPassiveWord: { word: 'two years ago', meaning: 'Hace dos años' },
      questionType: 'cloze',
      options: [
        { text: 'in (Países y ciudades amplias)', isCorrect: true, explanation: 'Los países y ciudades llevan siempre "in".' },
        { text: 'at (Puntos exactos con número)', isCorrect: false, explanation: 'Un país entero es un territorio amplio, no un punto exacto.' },
        { text: 'on (Superficies)', isCorrect: false, explanation: 'No se usa con países soberanos.' },
        { text: 'to (Dirección en movimiento)', isCorrect: false, explanation: 'Aquí indica residencia/ubicación con live and work.' }
      ]
    },
    {
      targetWord: 'about',
      contextSentence: 'What are you two arguing ___? Keep calm and let\'s review the facts.',
      embeddedPassiveWord: { word: 'arguing', meaning: 'Discutiendo acaloradamente' },
      questionType: 'cloze',
      options: [
        { text: 'about (Preposition Stranding al final)', isCorrect: true, explanation: 'En preguntas naturales la preposición va al final: "What are you arguing about?".' },
        { text: 'for (Para)', isCorrect: false, explanation: 'Argue se combina con "about" para el tema de la discusión.' },
        { text: 'with (Con)', isCorrect: false, explanation: 'with iría si preguntara por la persona ("Who are you arguing with?").' },
        { text: 'in (En)', isCorrect: false, explanation: 'No es la colocación correcta de argue.' }
      ]
    }
  ],
  wh_words: [
    {
      targetWord: 'where',
      contextSentence: 'Excuse me, could you tell me ___ the train station is located?',
      embeddedPassiveWord: { word: 'located', meaning: 'Situada o posicionada geográficamente' },
      questionType: 'cloze',
      options: [
        { text: 'where (Lugar con orden directo sin auxiliar)', isCorrect: true, explanation: 'En preguntas indirectas se conserva el orden afirmativo: "where the station is".' },
        { text: 'where is the (Inversión doble errónea)', isCorrect: false, explanation: 'No se repite la inversión "is" dos veces en la frase.' },
        { text: 'when (Tiempo)', isCorrect: false, explanation: 'La estación es un lugar físico, no una hora.' },
        { text: 'why (Razón)', isCorrect: false, explanation: 'Pregunta por ubicación geográfica.' }
      ]
    },
    {
      targetWord: 'which',
      contextSentence: 'We have two meeting rooms available: ___ one would you prefer?',
      embeddedPassiveWord: { word: 'available', meaning: 'Disponible para ser usada' },
      questionType: 'cloze',
      options: [
        { text: 'which (Elección entre opciones limitadas conocidas)', isCorrect: true, explanation: 'Al haber exactamente dos alternativas delimitadas, se usa "Which".' },
        { text: 'what (Opciones abiertas e infinitas)', isCorrect: false, explanation: '"What" se usa cuando no hay un conjunto cerrado definido.' },
        { text: 'how (Modo)', isCorrect: false, explanation: 'No responde a la selección de una sala.' },
        { text: 'who (Personas)', isCorrect: false, explanation: 'Las salas son objetos inanimados.' }
      ]
    },
    {
      targetWord: 'what',
      contextSentence: 'This summary is exactly ___ we needed to complete the monthly report.',
      embeddedPassiveWord: { word: 'monthly report', meaning: 'Informe mensual de progreso' },
      questionType: 'grammar_function',
      options: [
        { text: 'what (Conector: "lo que / aquello que")', isCorrect: true, explanation: '"What" como conector traduce "aquello que / lo que necesitábamos".' },
        { text: 'that (Que restrictivo)', isCorrect: false, explanation: 'Requeriría un antecedente explícito como "the thing that".' },
        { text: 'which (El cual)', isCorrect: false, explanation: 'No funciona como pronombre nominal en este contexto.' },
        { text: 'how (Cómo)', isCorrect: false, explanation: 'No coincide con el sentido de "lo que necesitábamos".' }
      ]
    }
  ],
  cefr_general: [
    {
      targetWord: 'run',
      contextSentence: 'She had to ___ the marketing agency while her business partner was away on a business trip.',
      embeddedPassiveWord: { word: 'business partner', meaning: 'Socio de negocios / Persona con quien compartes empresa' },
      questionType: 'polysemy_trap',
      options: [
        { text: 'run (Administrar / Gestionar)', isCorrect: true, explanation: 'Aquí "run" significa operar o administrar una entidad, no correr físicamente.' },
        { text: 'run (Desplazarse rápido a pie)', isCorrect: false, explanation: 'Este es el sentido físico de A1, pero no encaja con administrar una agencia.' },
        { text: 'walk (Caminar)', isCorrect: false, explanation: 'No tiene sentido semántico en este contexto corporativo.' },
        { text: 'sprint (Pique corto)', isCorrect: false, explanation: 'Solo se refiere a carreras atléticas cortas.' }
      ]
    },
    {
      targetWord: 'book',
      contextSentence: 'Remember to ___ a quiet meeting room before tomorrow morning so we have a safe space to talk.',
      embeddedPassiveWord: { word: 'safe', meaning: 'Seguro / Protegido de interrupciones' },
      questionType: 'cloze',
      options: [
        { text: 'book (Reservar con anticipación)', isCorrect: true, explanation: '"To book a room" es la colocación estándar en inglés.' },
        { text: 'book (Leer un libro)', isCorrect: false, explanation: 'En este caso actúa como verbo de reservación, no como el sustantivo.' },
        { text: 'cancel (Cancelar)', isCorrect: false, explanation: 'El contexto pide asegurar la sala, no eliminarla.' },
        { text: 'borrow (Pedir prestado)', isCorrect: false, explanation: 'No se usa para salas de reunión corporativas.' }
      ]
    },
    {
      targetWord: 'kind',
      contextSentence: 'What ___ of leadership style does the new manager prefer to practice with the team?',
      embeddedPassiveWord: { word: 'manager', meaning: 'Director / Quien administra y gestiona' },
      questionType: 'polysemy_trap',
      options: [
        { text: 'kind (Tipo / Variedad)', isCorrect: true, explanation: '"What kind of..." pregunta por la clasificación o tipología.' },
        { text: 'kind (Amable / Bondadoso)', isCorrect: false, explanation: 'Aunque es un significado real de A1, aquí no actúa como adjetivo de personalidad.' },
        { text: 'cruel (Despiadado)', isCorrect: false, explanation: 'Antónimo del sentido adjetivo, no encaja sintácticamente.' },
        { text: 'light (Ligero)', isCorrect: false, explanation: 'No corresponde a esta familia de preguntas.' }
      ]
    }
  ]
};

export const VocabularyTrivia: React.FC<Props> = ({ words, category = 'time_words' }) => {
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [tooltipWord, setTooltipWord] = useState<string | null>(null);

  useEffect(() => {
    const list = CATEGORY_TRIVIA_BANKS[category] || CATEGORY_TRIVIA_BANKS.time_words;
    setQuestions(list);
    setCurrentQIndex(0);
    setSelectedOption(null);
    setScore(0);
    setStreak(0);
    setIsFinished(false);
  }, [category, words]);

  if (questions.length === 0) {
    return <div style={{ color: '#a1a1aa', textAlign: 'center', padding: '3rem' }}>Cargando preguntas de trivia...</div>;
  }

  if (isFinished) {
    return (
      <div className={styles.triviaCard} style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏆</div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          ¡Sesión de Trivia Completada!
        </h3>
        <p style={{ color: '#a1a1aa', marginBottom: '1.5rem' }}>
          Puntuación final: <strong style={{ color: '#34d399', fontSize: '1.2rem' }}>{score} de {questions.length}</strong>
        </p>
        <button
          onClick={() => {
            setCurrentQIndex(0);
            setSelectedOption(null);
            setScore(0);
            setStreak(0);
            setIsFinished(false);
          }}
          className={styles.tabBtn}
          style={{ margin: '0 auto' }}
        >
          🔄 Jugar otra ronda
        </button>
      </div>
    );
  }

  const q = questions[currentQIndex];

  function handleSelect(index: number) {
    if (selectedOption !== null) return;
    setSelectedOption(index);

    const isCorrect = q.options[index].isCorrect;
    if (isCorrect) {
      setScore(prev => prev + 1);
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }
  }

  function handleNext() {
    setSelectedOption(null);
    if (currentQIndex + 1 < questions.length) {
      setCurrentQIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
    }
  }

  return (
    <div className={styles.triviaCard}>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <span style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>
          Pregunta {currentQIndex + 1} de {questions.length}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', color: '#fbbf24', fontWeight: 700 }}>
            🔥 Racha: {streak}
          </span>
          <span style={{ fontSize: '0.85rem', color: '#34d399', fontWeight: 700 }}>
            Puntos: {score}
          </span>
        </div>
      </div>

      {/* Target Word Tag */}
      <div style={{ marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#a855f7', background: 'rgba(168, 85, 247, 0.1)', padding: '0.25rem 0.6rem', borderRadius: '6px', fontWeight: 700 }}>
          {q.questionType === 'polysemy_trap' ? 'Trampa Polisémica' : q.questionType === 'grammar_function' ? 'Función Gramatical' : 'Completar Contexto'} • {q.targetWord}
        </span>
      </div>

      {/* Sentence */}
      <div className={styles.contextSentence}>
        {q.contextSentence}
      </div>

      {/* Options */}
      <div className={styles.optionsGrid}>
        {q.options.map((opt, idx) => {
          const isSelected = selectedOption === idx;
          let optClass = styles.optionBtn;

          if (selectedOption !== null) {
            if (opt.isCorrect) optClass += ` ${styles.optionCorrect}`;
            else if (isSelected && !opt.isCorrect) optClass += ` ${styles.optionWrong}`;
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              className={optClass}
              disabled={selectedOption !== null}
            >
              <span>{opt.text}</span>
              {selectedOption !== null && opt.isCorrect && <span>✓</span>}
              {selectedOption !== null && isSelected && !opt.isCorrect && <span>✗</span>}
            </button>
          );
        })}
      </div>

      {/* Feedback & Next Button */}
      {selectedOption !== null && (
        <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#d4d4d8' }}>
            💡 {q.options[selectedOption].explanation || (q.options[selectedOption].isCorrect ? '¡Excelente análisis del significado!' : 'Revisa el contexto específico de esta oración.')}
          </p>
          <button
            onClick={handleNext}
            className={styles.tabBtn}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {currentQIndex + 1 < questions.length ? 'Siguiente Pregunta →' : 'Ver Resultados Finales 🏆'}
          </button>
        </div>
      )}
    </div>
  );
};
