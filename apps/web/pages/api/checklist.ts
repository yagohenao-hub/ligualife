import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabaseClient'

const ROW_ID = 'mvp-launch-v1'
const TABLE_NAME = 'sprint_checklist_state'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('checked_map, notes_map, updated_at')
        .eq('id', ROW_ID)
        .maybeSingle()

      if (error) {
        return res.status(200).json({
          ok: true,
          synced: false,
          checked: {},
          notes: {},
          hint: error.message
        })
      }

      return res.status(200).json({
        ok: true,
        synced: true,
        checked: (data?.checked_map as Record<string, boolean>) || {},
        notes: (data?.notes_map as Record<string, string>) || {},
        updatedAt: data?.updated_at || null
      })
    } catch {
      return res.status(200).json({ ok: true, synced: false, checked: {}, notes: {} })
    }
  }

  if (req.method === 'POST') {
    const { checked = {}, notes = {} } = req.body as {
      checked?: Record<string, boolean>
      notes?: Record<string, string>
    }

    try {
      const now = new Date().toISOString()
      const { error } = await supabase.from(TABLE_NAME).upsert(
        {
          id: ROW_ID,
          checked_map: checked,
          notes_map: notes,
          updated_at: now
        },
        { onConflict: 'id' }
      )

      if (error) {
        return res.status(200).json({
          ok: true,
          synced: false,
          hint: error.message
        })
      }

      return res.status(200).json({
        ok: true,
        synced: true,
        updatedAt: now
      })
    } catch {
      return res.status(200).json({ ok: true, synced: false })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
