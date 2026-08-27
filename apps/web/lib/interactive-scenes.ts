export interface Hotspot {
  id: string
  x: number // percentage (0-100)
  y: number // percentage (0-100)
  verb: string
  sentence: string
  translation: string
  level: string
  category: string
}

export interface InteractiveScene {
  id: string
  title: string
  subtitle: string
  imageSrc: string
  totalVerbs: number
  hotspots: Hotspot[]
  createdAt?: string
}

export const INITIAL_OFFICE_SCENE: InteractiveScene = {
  id: 'tech-office-b2',
  title: 'Tech Startup Office — Verbos de Acción B2',
  subtitle: 'Explora la oficina interactiva. Haz clic en los personajes para descubrir cómo describir sus acciones en inglés profesional.',
  imageSrc: '/interactive_office_scene.png',
  totalVerbs: 10,
  createdAt: '2026-08-20',
  hotspots: [
    {
      id: 'h1',
      x: 35,
      y: 25,
      verb: 'Pitching',
      sentence: 'She is pitching the growth strategy to the team.',
      translation: 'Ella está presentando la estrategia de crecimiento al equipo.',
      level: 'B2',
      category: 'Liderazgo & Presentaciones',
    },
    {
      id: 'h2',
      x: 14,
      y: 64,
      verb: 'Sipping',
      sentence: 'She is sipping her hot coffee while taking a quick break.',
      translation: 'Ella está sorbiendo su café caliente mientras toma un descanso rápido.',
      level: 'B1+',
      category: 'Estilo de Vida & Oficina',
    },
    {
      id: 'h3',
      x: 46,
      y: 80,
      verb: 'Analyzing Data',
      sentence: 'He is analyzing the performance dashboards before the executive meeting.',
      translation: 'Él está analizando los tableros de rendimiento antes de la reunión ejecutiva.',
      level: 'B2',
      category: 'Tech & Analítica',
    },
    {
      id: 'h4',
      x: 67,
      y: 77,
      verb: 'Rushing',
      sentence: 'He is rushing to deliver the printed reports to upper management.',
      translation: 'Él va a toda prisa para entregar los reportes impresos a la alta gerencia.',
      level: 'B2',
      category: 'Operaciones',
    },
    {
      id: 'h5',
      x: 87,
      y: 75,
      verb: 'Negotiating',
      sentence: 'He is negotiating a strategic contract in the private booth.',
      translation: 'Él está negociando un contrato estratégico en la cabina privada.',
      level: 'B2+',
      category: 'Negocios & Ventas',
    },
    {
      id: 'h6',
      x: 62,
      y: 53,
      verb: 'Multitasking',
      sentence: 'He is multitasking by coding software while listening to a client briefing.',
      translation: 'Él está haciendo varias tareas: programando código mientras escucha un informe de cliente.',
      level: 'B2',
      category: 'Productividad',
    },
    {
      id: 'h7',
      x: 84,
      y: 38,
      verb: 'Collaborating',
      sentence: 'They are collaborating on the new product launch strategy.',
      translation: 'Ellos están colaborando en la estrategia de lanzamiento del nuevo producto.',
      level: 'B2',
      category: 'Trabajo en Equipo',
    },
    {
      id: 'h8',
      x: 92,
      y: 18,
      verb: 'Brewing Coffee',
      sentence: 'The machine is brewing fresh coffee for the morning team.',
      translation: 'La máquina está colando café fresco para el equipo de la mañana.',
      level: 'A2+',
      category: 'Vocabulario Cotidiano',
    },
    {
      id: 'h9',
      x: 77,
      y: 12,
      verb: 'Debugging',
      sentence: 'He is focusing on debugging a critical backend issue.',
      translation: 'Él se está concentrando en depurar un problema crítico del servidor.',
      level: 'B2',
      category: 'Desarrollo & Tech',
    },
    {
      id: 'h10',
      x: 20,
      y: 40,
      verb: 'Taking Notes',
      sentence: 'He is taking notes during the quarterly strategy presentation.',
      translation: 'Él está tomando notas durante la presentación de estrategia trimestral.',
      level: 'B1+',
      category: 'Reuniones & Notas',
    },
  ]
}

export const INITIAL_GYM_SCENE: InteractiveScene = {
  id: 'modern-gym-b1-b2',
  title: 'Modern Fitness Gym — Verbos & Frases de Gimnasio (A2-B2)',
  subtitle: 'Explora el gimnasio interactivo. Haz clic en las personas para aprender verbos y frases de entrenamiento y salud en contexto.',
  imageSrc: '/interactive_gym_scene.png',
  totalVerbs: 10,
  createdAt: '2026-08-27',
  hotspots: [
    {
      id: 'h-gym-1',
      x: 16,
      y: 28,
      verb: 'Jogging',
      sentence: 'She is jogging on the treadmill to build her endurance.',
      translation: 'Ella está trotando en la cinta para desarrollar su resistencia.',
      level: 'A2+',
      category: 'Cardio & Calentamiento',
    },
    {
      id: 'h-gym-2',
      x: 34,
      y: 47,
      verb: 'Bench Pressing',
      sentence: 'He is bench pressing heavy weight to build chest strength.',
      translation: 'Él está haciendo press de banca con peso pesado para fortalecer el pecho.',
      level: 'B1+',
      category: 'Fuerza & Pesas',
    },
    {
      id: 'h-gym-3',
      x: 29,
      y: 39,
      verb: 'Spotting',
      sentence: 'She is spotting her training partner to ensure safety during the lift.',
      translation: 'Ella está asistiendo a su compañero para garantizar la seguridad durante el levantamiento.',
      level: 'B2',
      category: 'Trabajo en Equipo & Seguridad',
    },
    {
      id: 'h-gym-4',
      x: 22,
      y: 81,
      verb: 'Stretching',
      sentence: 'She is stretching her legs on the mat to prevent muscle soreness.',
      translation: 'Ella está estirando las piernas en la colchoneta para evitar dolores musculares.',
      level: 'A2+',
      category: 'Flexibilidad & Recuperación',
    },
    {
      id: 'h-gym-5',
      x: 54,
      y: 60,
      verb: 'Deadlifting',
      sentence: 'He is deadlifting with proper form to engage his posture muscles.',
      translation: 'Él está haciendo peso muerto con buena postura para activar sus músculos estabilizadores.',
      level: 'B2',
      category: 'Técnica & Fuerza Avanzada',
    },
    {
      id: 'h-gym-6',
      x: 68,
      y: 44,
      verb: 'Hydrating',
      sentence: 'He is hydrating at the water station between workout sets.',
      translation: 'Él se está hidratando en la estación de agua entre series de ejercicio.',
      level: 'A2+',
      category: 'Salud & Hábitos',
    },
    {
      id: 'h-gym-7',
      x: 89,
      y: 56,
      verb: 'Wiping Down Equipment',
      sentence: 'She is wiping down the machine with a towel after finishing her set.',
      translation: 'Ella está limpiando la máquina con una toalla tras terminar su serie.',
      level: 'B1',
      category: 'Higiene & Etiqueta de Gimnasio',
    },
    {
      id: 'h-gym-8',
      x: 74,
      y: 80,
      verb: 'Adjusting Weights',
      sentence: 'He is adjusting the weight plates before starting his squat workout.',
      translation: 'Él está ajustando los discos de peso antes de comenzar su rutina de sentadillas.',
      level: 'B1+',
      category: 'Equipamiento',
    },
    {
      id: 'h-gym-9',
      x: 46,
      y: 24,
      verb: 'Warming Up',
      sentence: 'He is warming up his arms with light dumbbells in front of the mirror.',
      translation: 'Él está calentando los brazos con mancuernas livianas frente al espejo.',
      level: 'B1',
      category: 'Acondicionamiento',
    },
    {
      id: 'h-gym-10',
      x: 87,
      y: 31,
      verb: 'Cooling Down',
      sentence: 'She is cooling down with upper body arm stretches.',
      translation: 'Ella está haciendo ejercicios de enfriamiento con estiramientos de brazos.',
      level: 'B1+',
      category: 'Recuperación',
    },
  ]
}

export const BUILTIN_SCENES: InteractiveScene[] = [INITIAL_OFFICE_SCENE, INITIAL_GYM_SCENE]

const STORAGE_KEY = 'lingualife_custom_scenes_v1'

export function getAllScenes(): InteractiveScene[] {
  if (typeof window === 'undefined') return BUILTIN_SCENES
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return BUILTIN_SCENES
    const customScenes: InteractiveScene[] = JSON.parse(raw)
    
    // Merge initial builtins with custom, allowing overrides
    const map = new Map<string, InteractiveScene>()
    BUILTIN_SCENES.forEach(s => map.set(s.id, s))
    customScenes.forEach(s => map.set(s.id, s))
    return Array.from(map.values())
  } catch {
    return BUILTIN_SCENES
  }
}

export function saveScene(scene: InteractiveScene): InteractiveScene {
  const scenes = getAllScenes()
  const index = scenes.findIndex(s => s.id === scene.id)
  
  if (index >= 0) {
    scenes[index] = scene
  } else {
    scenes.push(scene)
  }

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(scenes))
    } catch {}
  }
  return scene
}

export function deleteScene(sceneId: string): void {
  const scenes = getAllScenes().filter(s => s.id !== sceneId)
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(scenes))
    } catch {}
  }
}

