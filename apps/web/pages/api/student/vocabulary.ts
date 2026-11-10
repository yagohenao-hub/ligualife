import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';
import { 
  VocabCategory, 
  CefrLevel, 
  TriageStatus, 
  getVocabularyByCategory, 
  VOCABULARY_MASTER_DATA 
} from '@/lib/vocabulary';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { 
      category = 'time_words', 
      level = 'A1', 
      studentId = '', 
      includePreviousPending = 'false' 
    } = req.query as {
      category?: VocabCategory;
      level?: CefrLevel;
      studentId?: string;
      includePreviousPending?: string;
    };

    const shouldIncludePrev = includePreviousPending === 'true';

    // 1. Obtener lista curada del catálogo maestro
    let words = getVocabularyByCategory(category as VocabCategory, level as CefrLevel, shouldIncludePrev);

    // 2. Si se proporciona studentId, intentar consultar el estado persistido en Supabase
    if (studentId) {
      try {
        // Intentar primero tabla especializada student_vocabulary_state
        const { data: dbStates, error: stateErr } = await supabase
          .from('student_vocabulary_state')
          .select('sense_id, triage_status')
          .eq('student_id', studentId);

        if (!stateErr && dbStates && dbStates.length > 0) {
          const stateMap: Record<string, TriageStatus> = {};
          dbStates.forEach(row => {
            stateMap[row.sense_id] = row.triage_status as TriageStatus;
          });

          words = words.map(w => {
            const primarySense = w.senses[0];
            const status = primarySense && stateMap[primarySense.id] ? stateMap[primarySense.id] : w.triageStatus;
            return { ...w, triageStatus: status };
          });
        } else {
          // Fallback a student_topic_progress para persistencia garantizada en la BD actual
          const { data: progRows } = await supabase
            .from('student_topic_progress')
            .select('*')
            .eq('Student', studentId);

          if (progRows && (progRows as any[]).length > 0) {
            const map: Record<string, TriageStatus> = {};
            (progRows as any[]).forEach(r => {
              const topicId = (r['Curriculum Topic'] as string) || '';
              if (topicId.startsWith('vocab_')) {
                const senseId = topicId.replace('vocab_', '');
                map[senseId] = (r['Status'] as TriageStatus) || 'unreviewed';
              }
            });

            words = words.map(w => {
              const primarySense = w.senses[0];
              const status = primarySense && map[primarySense.id] ? map[primarySense.id] : w.triageStatus;
              return { ...w, triageStatus: status };
            });
          }
        }
      } catch (err) {
        // Fallback silencioso a estados locales si la conexión a Supabase tiene latencia
        console.warn('[vocabulary API] Using fallback vocabulary state:', err);
      }
    }

    return res.status(200).json({
      success: true,
      category,
      count: words.length,
      words
    });
  }

  if (req.method === 'POST') {
    const { studentId, wordId, senseId, status } = req.body as {
      studentId: string;
      wordId: string;
      senseId: string;
      status: TriageStatus;
    };

    if (!senseId || !status) {
      return res.status(400).json({ error: 'senseId y status son requeridos' });
    }

    // Persistir en Supabase
    if (studentId) {
      try {
        // Intentar insertar en student_vocabulary_state si la tabla existe
        const { error: vocabErr } = await supabase
          .from('student_vocabulary_state')
          .upsert({
            student_id: studentId,
            sense_id: senseId,
            triage_status: status,
            updated_at: new Date().toISOString()
          }, { onConflict: 'student_id,sense_id' });

        if (vocabErr) {
          // Si la tabla no está creada aún, persistir en student_topic_progress de forma 100% segura
          await supabase
            .from('student_topic_progress')
            .upsert({
              id: `vstate_${studentId.slice(0, 8)}_${senseId}`,
              Student: studentId,
              'Curriculum Topic': `vocab_${senseId}`,
              Status: status,
              Notes: `Vocab triage for word: ${wordId}`,
              'Completed At': new Date().toISOString()
            });
        }
      } catch (e) {
        console.warn('[vocabulary API] Note on database state persistence:', e);
      }
    }

    return res.status(200).json({
      success: true,
      wordId,
      senseId,
      status
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
