import type { NextApiRequest, NextApiResponse } from 'next';
import {
  VocabCategory,
  CefrLevel,
  loadVocabularyByCategoryAsync
} from '@/lib/vocabulary';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    category = 'time_words',
    level = 'A1'
  } = req.query as {
    category?: VocabCategory;
    level?: CefrLevel;
  };

  try {
    const words = await loadVocabularyByCategoryAsync(category, level);
    return res.status(200).json({
      success: true,
      category,
      level,
      count: words.length,
      words
    });
  } catch (err: any) {
    console.error('[vocabulary API] Error loading vocabulary bank:', err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'Error al cargar el banco de vocabulario'
    });
  }
}
