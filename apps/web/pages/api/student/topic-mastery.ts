import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';

const COOLDOWN_HOURS = 12;
const MAX_TIER = 6;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { studentId, topicOrder } = req.body as { studentId?: string; topicOrder?: number };
  if (!studentId || topicOrder === undefined) {
    return res.status(400).json({ error: 'studentId y topicOrder son requeridos' });
  }

  try {
    const { data: student, error: fetchErr } = await supabase
      .from('students')
      .select('id, Notes')
      .eq('id', studentId)
      .single();

    if (fetchErr || !student) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }

    // Parsear o inicializar registro de maestría dentro de Notes
    let notes = student.Notes || '';
    let masteryMap: Record<number, { tier: number; lastTrainedAt: string }> = {};

    const marker = '=== MASTERY_PROGRESS_JSON ===';
    if (notes.includes(marker)) {
      const parts = notes.split(marker);
      try {
        masteryMap = JSON.parse(parts[1].trim());
      } catch (e) {
        masteryMap = {};
      }
    }

    const currentMastery = masteryMap[topicOrder] || { tier: 1, lastTrainedAt: '' };
    const now = new Date();

    if (currentMastery.lastTrainedAt) {
      const lastDate = new Date(currentMastery.lastTrainedAt);
      const diffHours = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60);

      if (diffHours < COOLDOWN_HOURS) {
        const remainingMs = (COOLDOWN_HOURS * 60 * 60 * 1000) - (now.getTime() - lastDate.getTime());
        const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
        const remainingMinutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

        return res.status(200).json({
          ok: false,
          cooldownActive: true,
          remainingText: `${remainingHours}h ${remainingMinutes}m`,
          currentTier: currentMastery.tier,
          masteryMap
        });
      }
    }

    // Incrementar Rango (máximo 6 = Platino)
    const newTier = Math.min(MAX_TIER, currentMastery.tier + 1);
    masteryMap[topicOrder] = {
      tier: newTier,
      lastTrainedAt: now.toISOString()
    };

    // Actualizar Notes preservando observaciones previas
    const baseNotes = notes.includes(marker) ? notes.split(marker)[0].trim() : notes.trim();
    const updatedNotes = baseNotes ? `${baseNotes}\n\n${marker}\n${JSON.stringify(masteryMap)}` : `${marker}\n${JSON.stringify(masteryMap)}`;

    await supabase.from('students').update({ Notes: updatedNotes }).eq('id', studentId);

    return res.status(200).json({
      ok: true,
      newTier,
      lastTrainedAt: now.toISOString(),
      masteryMap
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Error al actualizar maestría', detail: err.message });
  }
}
