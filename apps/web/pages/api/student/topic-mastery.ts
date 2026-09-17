import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';

const TIER_NAMES: Record<number, string> = {
  1: 'Bronze',
  2: 'Silver',
  3: 'Gold',
  4: 'Diamond',
  5: 'Platinum'
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { studentId, topicOrder, streak, requestedTier } = req.body as {
    studentId?: string;
    topicOrder?: number;
    streak?: number;
    requestedTier?: number;
  };

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
    let masteryMap: Record<number, { tier: number; tierName?: string; streak?: number; lastTrainedAt: string }> = {};

    const marker = '=== MASTERY_PROGRESS_JSON ===';
    if (notes.includes(marker)) {
      const parts = notes.split(marker);
      try {
        masteryMap = JSON.parse(parts[1].trim());
      } catch (e) {
        masteryMap = {};
      }
    }

    const currentMastery = masteryMap[topicOrder] || { tier: 0, lastTrainedAt: '' };
    const now = new Date();

    // Determine target tier based on streak or explicitly requested tier
    let targetTier = currentMastery.tier;
    if (requestedTier !== undefined) {
      targetTier = Math.max(currentMastery.tier, requestedTier);
    } else if (streak !== undefined) {
      if (streak >= 25) targetTier = Math.max(targetTier, 5); // Platinum
      else if (streak >= 20) targetTier = Math.max(targetTier, 4); // Diamond
      else if (streak >= 15) targetTier = Math.max(targetTier, 3); // Gold
      else if (streak >= 10) targetTier = Math.max(targetTier, 2); // Silver
      else if (streak >= 5) targetTier = Math.max(targetTier, 1); // Bronze
    } else {
      // Incrementar 1 tier si no se especificó streak
      targetTier = Math.min(5, currentMastery.tier + 1);
    }

    const tierName = TIER_NAMES[targetTier] || 'Unranked';

    masteryMap[topicOrder] = {
      tier: targetTier,
      tierName,
      streak: Math.max(streak || 0, currentMastery.streak || 0),
      lastTrainedAt: now.toISOString()
    };

    // 1. Dual-write to students.Notes for backward compatibility
    const baseNotes = notes.includes(marker) ? notes.split(marker)[0].trim() : notes.trim();
    const updatedNotes = baseNotes ? `${baseNotes}\n\n${marker}\n${JSON.stringify(masteryMap)}` : `${marker}\n${JSON.stringify(masteryMap)}`;
    await supabase.from('students').update({ Notes: updatedNotes }).eq('id', studentId);

    // 2. Dual-write to normalized public.student_topic_progress
    const studentTopicKey = `${studentId}_${topicOrder}`;
    const progressPayload = {
      'Student + Topic': studentTopicKey,
      'Student': studentId,
      'Curriculum Topic': String(topicOrder),
      'Status': tierName,
      'Completed At': now.toISOString(),
      'Notes': JSON.stringify({
        tier: targetTier,
        tierName,
        streak: masteryMap[topicOrder].streak,
        lastTrainedAt: now.toISOString()
      })
    };

    // Check if record exists in student_topic_progress
    const { data: existingProgress } = await supabase
      .from('student_topic_progress')
      .select('id')
      .eq('Student + Topic', studentTopicKey)
      .maybeSingle();

    if (existingProgress?.id) {
      await supabase
        .from('student_topic_progress')
        .update(progressPayload)
        .eq('id', existingProgress.id);
    } else {
      await supabase
        .from('student_topic_progress')
        .insert([progressPayload]);
    }

    return res.status(200).json({
      ok: true,
      newTier: targetTier,
      tierName,
      lastTrainedAt: now.toISOString(),
      masteryMap
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Error al actualizar maestría', detail: err.message });
  }
}

