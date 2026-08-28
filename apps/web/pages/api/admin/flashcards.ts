import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'
import { BUILTIN_FLASHCARD_PACKS, FlashcardPack } from '@/lib/flashcards'

const TEMP_FILE_PATH = path.join('/tmp', 'lingualife_flashcard_packs.json')

function loadStoredPacks(): FlashcardPack[] {
  if (typeof (global as any).__flashcardPacksStore !== 'undefined') {
    return (global as any).__flashcardPacksStore
  }
  try {
    if (fs.existsSync(TEMP_FILE_PATH)) {
      const data = fs.readFileSync(TEMP_FILE_PATH, 'utf-8')
      const parsed = JSON.parse(data)
      if (Array.isArray(parsed)) {
        ;(global as any).__flashcardPacksStore = parsed
        return parsed
      }
    }
  } catch (err) {
    console.warn('[Flashcards API] Error reading file:', err)
  }
  ;(global as any).__flashcardPacksStore = []
  return []
}

function persistStoredPacks(packs: FlashcardPack[]) {
  ;(global as any).__flashcardPacksStore = packs
  try {
    fs.writeFileSync(TEMP_FILE_PATH, JSON.stringify(packs, null, 2), 'utf-8')
  } catch (err) {
    console.warn('[Flashcards API] Error writing file:', err)
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const customPacks = loadStoredPacks()

  if (req.method === 'GET') {
    const map = new Map<string, FlashcardPack>()
    BUILTIN_FLASHCARD_PACKS.forEach(p => map.set(p.id, p))
    customPacks.forEach(p => map.set(p.id, p))
    return res.status(200).json({ packs: Array.from(map.values()) })
  }

  if (req.method === 'POST') {
    const pack: FlashcardPack = req.body
    if (!pack || !pack.id || !pack.title) {
      return res.status(400).json({ error: 'Datos de pack inválidos' })
    }

    const index = customPacks.findIndex(p => p.id === pack.id)
    if (index >= 0) {
      customPacks[index] = pack
    } else {
      customPacks.push(pack)
    }

    persistStoredPacks(customPacks)

    const map = new Map<string, FlashcardPack>()
    BUILTIN_FLASHCARD_PACKS.forEach(p => map.set(p.id, p))
    customPacks.forEach(p => map.set(p.id, p))
    return res.status(200).json({ success: true, packs: Array.from(map.values()), pack })
  }

  if (req.method === 'DELETE') {
    const { id } = req.query
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'ID de pack requerido' })
    }

    const updated = customPacks.filter(p => p.id !== id)
    persistStoredPacks(updated)

    const map = new Map<string, FlashcardPack>()
    BUILTIN_FLASHCARD_PACKS.forEach(p => map.set(p.id, p))
    updated.forEach(p => map.set(p.id, p))
    return res.status(200).json({ success: true, packs: Array.from(map.values()) })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
