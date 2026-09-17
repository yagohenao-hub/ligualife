# Estándar Maestro de Prompts y Diseño Pedagógico con IA (LinguaLife)

Este documento define la **política obligatoria e innegociable** para la redacción de prompts y generación de contenido pedagógico por IA (Gemini, Claude, GPT) en todos los módulos presentes y futuros de **LinguaLife** (Pocket Coach, Trivia Infinita, Guías de Estudio, Feedback de Clases, Diapositivas y Evaluaciones).

---

## 1. Principio Fundamental: Enfoque Humano vs. Enfoque Matemático

> [!CAUTION]
> **PROHIBICIÓN ESTRICTA DE "LANGUAGE IS MATH" Y LENGUAJE ALGEBRAICO:**
> Queda terminantemente prohibido afirmar que "el idioma es matemática" (*"Language is math, not magic"* o similares) o exponer al estudiante a siglas técnicas internas (`LDS`, `STA`), fórmulas algebraicas (`Sujeto + Palabra de Tiempo + Acción`, `A + B = C`), o términos abstractos.

### ¿Por qué?
La gran mayoría de las personas tienen una aversión o preconcepción negativa hacia las matemáticas. Decirle a un estudiante que el inglés "es matemática" o saturarlo con fórmulas genera rechazo, rigidez y aburrimiento. Los estudiantes de LinguaLife buscan **comunicarse con soltura en la vida real**, no resolver ecuaciones gramaticales.

### La Metáfora Oficial: "Bloques de Construcción (Piezas de LEGO)"
En LinguaLife, las oraciones se explican visualmente como **casillas o bloques de LEGO** que se ensamblan intuitivamente:
1. **Casilla 1 (El Protagonista / Quién):** I, You, The team, It.
2. **Casilla 2 (El Tiempo o Intención / Cuándo):** will, can, should, did.
3. **Casilla 3 (La Acción / Qué sucede):** build, manage, solve.

Esta metáfora es lúdica, visual, accesible para cualquier edad o nivel, y elimina toda sensación de frialdad matemática.

---

## 2. Matriz de Transformación de Redacción

| ❌ Lenguaje Prohibido (Algebraico / Robótico) | ✅ Lenguaje Requerido (Conversacional / Pedagógico) |
| :--- | :--- |
| *"Aplica la fórmula LDS: Sujeto + Tiempo + Acción"* | *"En inglés siempre debemos indicar quién realiza la acción; por eso iniciamos con 'It' para el clima o situaciones impersonales."* |
| *"No cumple con la ecuación sintáctica STA"* | *"En inglés no podemos dejar frases sin sujeto o arrancar directo con el verbo."* |
| *"La palabra de tiempo Does absorbe la energía"* | *"Al usar 'Does' al inicio de la pregunta, el verbo principal ya no lleva '-s', queda en su forma normal."* |
| *"Sujeto (My phone) + Palabra del tiempo (often) + Acción (updates)"* | *"Al hablar de un objeto o tercera persona en presente, el verbo concuerda naturalmente agregando '-s'."* |
| *"Error de transgresión de regla atómica"* | *"Cuidado con traducir palabra por palabra desde el español: en inglés esta frase suena incompleta."* |

---

## 3. Directrices para Generadores de Preguntas y Trivia

1. **Explicación de la Respuesta Correcta (`explanation`):**
   - Debe responder al **¿Por qué?** de forma directa, cálida y en español fluido.
   - Usar ejemplos contrastados de la vida diaria (por ejemplo: *"Con verbos modales como should, could o must, el verbo de acción siempre va en su forma base directa, sin 'to'"*).

2. **Explicación de la Trampa Evitada (`trapExplanation`):**
   - Enfocarse en la **interferencia del español**: *"En español decimos 'Tengo que...' y solemos calcar la frase palabra por palabra, pero en inglés nativo..."*.
   - Tratamiento constructivo del error: normalizar la confusión y enseñar la alternativa inmediata.

3. **Arquetipos de Preguntas:**
   - **Situación Real:** Diálogos cotidianos, laborales o de viajes ajustados a los intereses del estudiante.
   - **Spot the Trap:** Distinguir la opción natural de las 3 opciones con errores hispanohablantes típicos.
   - **Transformación Ágil:** Cambiar una idea entre afirmación, negación o pregunta con agilidad.
   - **Detective:** Preguntas inversas para reforzar la estructura interrogativa.

---

## 4. Cláusula de Inyección para Prompts del Sistema

Todo prompt que instruya a un LLM a redactar explicaciones o contenido para los alumnos de LinguaLife **debe incluir** este bloque de seguridad:

```text
DIRECTRIZ PEDAGÓGICA CRÍTICA DE REDACCIÓN Y TONO:
- PROHIBIDO usar lenguaje matemático, algebraico o fórmulas como "S+T+A", "Sujeto + Palabra de Tiempo + Acción", "Ecuación", o "Fórmula LDS".
- El alumno no conoce siglas internas como "LDS" ni le interesa la lingüística teórica.
- Las explicaciones deben ser NATURALES, CONVERSACIONALES, CLARAS Y CÁLIDAS en español.
- Explica el sentido de la frase y el porqué gramatical de forma práctica, cotidiana y amigable.
- Identifica las trampas comunes de traducción desde el español con empatía y claridad.
```

---

## 5. Elementos Visuales y Microinteracciones

- **Cero Emoticonos Crudos:** No usar emojis sueltos (`🔥`, `🎮`, `🏆`) como sustitutos de componentes de interfaz.
- **Iconografía Minimalista:** Usar exclusivamente iconos vectoriales (Lucide Icons: `<Flame />`, `<Trophy />`, `<Star />`, `<Sparkles />`) con microanimaciones CSS discretas (resplandor, pulso, escala suave).
- **Diseño de Opciones:** Distribución balanceada 2x2 tipo concurso (*"Quién quiere ser millonario"*), optimizada para lectura rápida en desktop y responsive vertical en móviles.
