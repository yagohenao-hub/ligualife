import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'
import { BUILTIN_SCENES, InteractiveScene } from '@/lib/interactive-scenes'

const TEMP_FILE_PATH = path.join('/tmp', 'lingualife_custom_scenes.json')

function loadStoredScenes(): InteractiveScene[] {
  if (typeof (global as any).__customScenesStore !== 'undefined') {
    return (global as any).__customScenesStore
  }
  try {
    if (fs.existsSync(TEMP_FILE_PATH)) {
      const data = fs.readFileSync(TEMP_FILE_PATH, 'utf-8')
      const parsed = JSON.parse(data)
      if (Array.isArray(parsed)) {
        ;(global as any).__customScenesStore = parsed
        return parsed
      }
    }
  } catch (err) {
    console.warn('[Scenes API] Error reading custom scenes file:', err)
  }
  ;(global as any).__customScenesStore = []
  return []
}

function persistStoredScenes(scenes: InteractiveScene[]) {
  ;(global as any).__customScenesStore = scenes
  try {
    fs.writeFileSync(TEMP_FILE_PATH, JSON.stringify(scenes, null, 2), 'utf-8')
  } catch (err) {
    console.warn('[Scenes API] Error writing custom scenes file:', err)
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const customScenes = loadStoredScenes()

  if (req.method === 'GET') {
    const map = new Map<string, InteractiveScene>()
    BUILTIN_SCENES.forEach(s => map.set(s.id, s))
    customScenes.forEach(s => map.set(s.id, s))
    return res.status(200).json({ scenes: Array.from(map.values()) })
  }

  if (req.method === 'POST') {
    const scene: InteractiveScene = req.body
    if (!scene || !scene.id || !scene.title) {
      return res.status(400).json({ error: 'Datos de escena inválidos' })
    }

    const index = customScenes.findIndex(s => s.id === scene.id)
    if (index >= 0) {
      customScenes[index] = scene
    } else {
      customScenes.push(scene)
    }

    persistStoredScenes(customScenes)

    const map = new Map<string, InteractiveScene>()
    BUILTIN_SCENES.forEach(s => map.set(s.id, s))
    customScenes.forEach(s => map.set(s.id, s))
    return res.status(200).json({ success: true, scenes: Array.from(map.values()), scene })
  }

  if (req.method === 'DELETE') {
    const { id } = req.query
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'ID de escena requerido' })
    }

    const updated = customScenes.filter(s => s.id !== id)
    persistStoredScenes(updated)

    const map = new Map<string, InteractiveScene>()
    BUILTIN_SCENES.forEach(s => map.set(s.id, s))
    updated.forEach(s => map.set(s.id, s))
    return res.status(200).json({ success: true, scenes: Array.from(map.values()) })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
