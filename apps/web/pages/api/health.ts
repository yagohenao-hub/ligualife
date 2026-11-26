import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabaseClient'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const status = {
    env: {
      hasSupabaseUrl: !!(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL),
      hasSupabaseKey: !!(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      hasEvolutionUrl: !!process.env.EVOLUTION_API_URL,
      nodeVersion: process.version,
    },
    supabaseConnection: 'Unknown',
    databaseMode: 'Supabase PostgreSQL',
    error: null as string | null
  }

  try {
    const { data, error } = await supabase
      .from('curriculum_topics')
      .select('id')
      .limit(1)

    if (error) {
      status.supabaseConnection = 'Failed (Supabase query returned error)'
      status.error = error.message
    } else {
      status.supabaseConnection = `Success (Connected to Supabase — ${data?.length ?? 0} sample row)`
    }
  } catch (e: any) {
    status.supabaseConnection = 'Failed (Network/Client error)'
    status.error = e.message
  }

  const isConfiguredCorrectly = status.supabaseConnection.startsWith('Success')

  return res.status(isConfiguredCorrectly ? 200 : 500).json({
    status: isConfiguredCorrectly ? 'GREEN' : 'RED_WARNING',
    ...status
  })
}
