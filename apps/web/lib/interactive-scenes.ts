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

const STORAGE_KEY = 'lingualife_custom_scenes_v1'

export function getAllScenes(): InteractiveScene[] {
  if (typeof window === 'undefined') return [INITIAL_OFFICE_SCENE]
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return [INITIAL_OFFICE_SCENE]
    const customScenes: InteractiveScene[] = JSON.parse(raw)
    
    // Merge initial with custom, allowing overrides
    const map = new Map<string, InteractiveScene>()
    map.set(INITIAL_OFFICE_SCENE.id, INITIAL_OFFICE_SCENE)
    customScenes.forEach(s => map.set(s.id, s))
    return Array.from(map.values())
  } catch {
    return [INITIAL_OFFICE_SCENE]
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
