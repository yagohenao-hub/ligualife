import { supabase } from '../lib/supabaseClient'

async function clean() {
  console.log('Fetching participants...')
  const { data: participants, error: pErr } = await supabase.from('session_participants').select('id, Session, Student')
  if (pErr) {
    console.error('Err fetching participants:', pErr)
    return
  }

  const seen = new Set<string>()
  const dupPIds: string[] = []
  for (const p of participants || []) {
    const key = `${p.Session}_${p.Student}`
    if (seen.has(key)) {
      dupPIds.push(p.id)
    } else {
      seen.add(key)
    }
  }

  if (dupPIds.length > 0) {
    console.log(`Borrando ${dupPIds.length} duplicados de session_participants...`)
    await supabase.from('session_participants').delete().in('id', dupPIds)
  }

  console.log('Fetching sessions...')
  const { data: sessions, error: sErr } = await supabase
    .from('sessions')
    .select('id, "Scheduled Date/Time", Teacher, "Session Name"')
  if (sErr) {
    console.error('Err fetching sessions:', sErr)
    return
  }

  const sSeen = new Map<string, string>()
  const dupSIds: string[] = []
  for (const s of sessions || []) {
    const dt = (s as any)['Scheduled Date/Time']
    const teacher = (s as any)['Teacher']
    const name = (s as any)['Session Name']
    const key = `${dt}_${teacher}_${name}`
    if (sSeen.has(key)) {
      dupSIds.push(s.id)
    } else {
      sSeen.set(key, s.id)
    }
  }

  if (dupSIds.length > 0) {
    console.log(`Borrando ${dupSIds.length} sesiones duplicadas...`)
    await supabase.from('session_participants').delete().in('Session', dupSIds)
    await supabase.from('sessions').delete().in('id', dupSIds)
  }

  console.log('Limpieza completada exitosamente.')
}

clean()
