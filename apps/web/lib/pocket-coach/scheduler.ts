import { supabase } from '@/lib/supabaseClient';

export interface DispatchScheduleState {
  id?: string;
  queuedAt: string;
  appliedAt?: string | null;
  status: 'scheduled' | 'completed' | 'pending';
  timeCOT: string;
  hourCOT: number;
  minCOT: number;
  dice: number;
  colombiaDate: string;
}

// Ventana horaria definida: 8:30 AM a 6:00 PM (18:00) Hora Colombia (COT / UTC-5)
const MIN_MINUTE_COT = 8 * 60 + 30; // 510 minutos (8:30 AM)
const MAX_MINUTE_COT = 18 * 60;     // 1080 minutos (6:00 PM)
const WINDOW_MINUTES = MAX_MINUTE_COT - MIN_MINUTE_COT; // 570 minutos

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD en zona horaria de Colombia (UTC-5)
 */
export function getColombiaDateString(d = new Date()): string {
  // Colombia es UTC-5
  const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
  const cot = new Date(utc - (5 * 3600000));
  return cot.toISOString().split('T')[0];
}

/**
 * Formatea una hora en formato amigable de 12 horas (ej. 11:25 AM COT)
 */
export function formatTimeCOT(hourCOT: number, minCOT: number): string {
  const period = hourCOT >= 12 ? 'PM' : 'AM';
  const displayHour = hourCOT % 12 === 0 ? 12 : hourCOT % 12;
  const displayMin = minCOT.toString().padStart(2, '0');
  return `${displayHour}:${displayMin} ${period} COT`;
}

/**
 * "Tira un dado" para generar una hora aleatoria dentro de la ventana de 8:30 AM a 6:00 PM COT
 * para la fecha indicada (por defecto: mañana)
 */
export function rollDiceForDate(targetColombiaDate?: string): {
  scheduledDateISO: string;
  colombiaDate: string;
  hourCOT: number;
  minCOT: number;
  timeFormatted: string;
  dice: number;
} {
  const dice = Math.random();
  const randomMinute = MIN_MINUTE_COT + Math.floor(dice * WINDOW_MINUTES);
  const hourCOT = Math.floor(randomMinute / 60);
  const minCOT = randomMinute % 60;

  let targetDateStr = targetColombiaDate;
  if (!targetDateStr) {
    // Mañana en hora Colombia
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const tomorrowCOT = new Date(utc - (5 * 3600000) + (24 * 3600000));
    targetDateStr = tomorrowCOT.toISOString().split('T')[0];
  }

  // Convertir fecha de Colombia + hora COT a ISO UTC
  // COT = UTC - 5h  =>  UTC = COT + 5h
  const [year, month, day] = targetDateStr.split('-').map(Number);
  const scheduledDate = new Date(Date.UTC(year, month - 1, day, hourCOT + 5, minCOT, 0, 0));

  return {
    scheduledDateISO: scheduledDate.toISOString(),
    colombiaDate: targetDateStr,
    hourCOT,
    minCOT,
    timeFormatted: formatTimeCOT(hourCOT, minCOT),
    dice: Math.round(dice * 1000) / 1000
  };
}

/**
 * Consulta o inicializa la programación actual del Pocket Coach en Supabase
 */
export async function getScheduledDispatchState(): Promise<DispatchScheduleState> {
  const QUEUE_ITEM_KEY = 'pocket_coach_daily_dispatch';

  try {
    const { data, error } = await supabase
      .from('progress_apply_queue')
      .select('*')
      .eq('Queue Item', QUEUE_ITEM_KEY)
      .order('created_at', { ascending: false })
      .limit(1);

    if (!error && data && data.length > 0) {
      const row = data[0];
      let meta: any = {};
      try {
        meta = JSON.parse(row.Notes || '{}');
      } catch {}

      return {
        id: row.id,
        queuedAt: row['Queued At'] || new Date().toISOString(),
        appliedAt: row['Applied At'],
        status: (row.Status || 'scheduled') as any,
        timeCOT: meta.timeCOT || '8:30 AM COT',
        hourCOT: meta.hourCOT ?? 8,
        minCOT: meta.minCOT ?? 30,
        dice: meta.dice ?? 0,
        colombiaDate: meta.colombiaDate || getColombiaDateString()
      };
    }
  } catch (err: any) {
    console.warn('[Scheduler] Error consultando tabla en Supabase:', err.message);
  }

  // Si no existe, tiramos el dado para hoy o mañana según la hora actual
  const todayCOT = getColombiaDateString();
  const rolled = rollDiceForDate(todayCOT);

  const initialRecord = {
    'Queue Item': QUEUE_ITEM_KEY,
    'Status': 'scheduled',
    'Queued At': rolled.scheduledDateISO,
    'Notes': JSON.stringify({
      timeCOT: rolled.timeFormatted,
      hourCOT: rolled.hourCOT,
      minCOT: rolled.minCOT,
      dice: rolled.dice,
      colombiaDate: rolled.colombiaDate
    })
  };

  try {
    const { data: inserted } = await supabase
      .from('progress_apply_queue')
      .insert(initialRecord)
      .select();

    if (inserted && inserted.length > 0) {
      return {
        id: inserted[0].id,
        queuedAt: rolled.scheduledDateISO,
        appliedAt: null,
        status: 'scheduled',
        timeCOT: rolled.timeFormatted,
        hourCOT: rolled.hourCOT,
        minCOT: rolled.minCOT,
        dice: rolled.dice,
        colombiaDate: rolled.colombiaDate
      };
    }
  } catch (err: any) {
    console.warn('[Scheduler] Error insertando programación inicial:', err.message);
  }

  return {
    queuedAt: rolled.scheduledDateISO,
    status: 'scheduled',
    timeCOT: rolled.timeFormatted,
    hourCOT: rolled.hourCOT,
    minCOT: rolled.minCOT,
    dice: rolled.dice,
    colombiaDate: rolled.colombiaDate
  };
}

/**
 * Valida si en el instante actual se debe ejecutar el despacho
 */
export async function checkShouldDispatch(forceImmediate = false): Promise<{
  shouldDispatch: boolean;
  reason: string;
  message: string;
  state: DispatchScheduleState;
}> {
  const state = await getScheduledDispatchState();

  if (forceImmediate) {
    return {
      shouldDispatch: true,
      reason: 'force_immediate',
      message: 'Despacho forzado manualmente por el administrador o prueba inmediata.',
      state
    };
  }

  const todayCOT = getColombiaDateString();

  // 1. Verificar si ya se envió hoy
  if (state.appliedAt) {
    const appliedCOT = getColombiaDateString(new Date(state.appliedAt));
    if (appliedCOT === todayCOT) {
      return {
        shouldDispatch: false,
        reason: 'already_dispatched_today',
        message: `El despacho de hoy (${todayCOT}) ya fue completado a las ${state.timeCOT}. Próximo despacho programado para mañana.`,
        state
      };
    }
  }

  // 2. Verificar si la hora objetivo de hoy ya llegó
  const now = new Date();
  const scheduledTime = new Date(state.queuedAt);

  if (now.getTime() < scheduledTime.getTime()) {
    return {
      shouldDispatch: false,
      reason: 'waiting_for_scheduled_time',
      message: `Aún no es la hora del despacho de hoy. Programado para las ${state.timeCOT} (${state.queuedAt}). Hora actual: ${now.toISOString()}.`,
      state
    };
  }

  return {
    shouldDispatch: true,
    reason: 'scheduled_time_reached',
    message: `¡Hora alcanzada! Programado para ${state.timeCOT}, ejecutando despacho ahora.`,
    state
  };
}

/**
 * Registra que el despacho se ejecutó exitosamente y "tira el dado" para programar el de mañana
 */
export async function recordExecutionAndRollNextDay(sentCount: number): Promise<{
  nextScheduledISO: string;
  nextTimeCOT: string;
  dice: number;
  tomorrowDate: string;
}> {
  const QUEUE_ITEM_KEY = 'pocket_coach_daily_dispatch';
  const now = new Date();

  // 1. "Tirar el dado" para mañana
  const nextRoll = rollDiceForDate(); // Sin parámetro calcula para mañana en COT

  const newNotes = {
    timeCOT: nextRoll.timeFormatted,
    hourCOT: nextRoll.hourCOT,
    minCOT: nextRoll.minCOT,
    dice: nextRoll.dice,
    colombiaDate: nextRoll.colombiaDate,
    previousSentCount: sentCount,
    previousAppliedAt: now.toISOString()
  };

  try {
    // Actualizamos el registro existente o insertamos uno nuevo
    const { data: existing } = await supabase
      .from('progress_apply_queue')
      .select('id')
      .eq('Queue Item', QUEUE_ITEM_KEY)
      .order('created_at', { ascending: false })
      .limit(1);

    if (existing && existing.length > 0) {
      await supabase
        .from('progress_apply_queue')
        .update({
          'Status': 'scheduled',
          'Applied At': now.toISOString(),
          'Queued At': nextRoll.scheduledDateISO,
          'Notes': JSON.stringify(newNotes)
        })
        .eq('id', existing[0].id);
    } else {
      await supabase
        .from('progress_apply_queue')
        .insert({
          'Queue Item': QUEUE_ITEM_KEY,
          'Status': 'scheduled',
          'Applied At': now.toISOString(),
          'Queued At': nextRoll.scheduledDateISO,
          'Notes': JSON.stringify(newNotes)
        });
    }

    console.log(`[Scheduler] 🎲 Dado lanzado: Próximo despacho programado para mañana (${nextRoll.colombiaDate}) a las ${nextRoll.timeFormatted}`);
  } catch (err: any) {
    console.error('[Scheduler] Error guardando próximo despacho en DB:', err.message);
  }

  return {
    nextScheduledISO: nextRoll.scheduledDateISO,
    nextTimeCOT: nextRoll.timeFormatted,
    dice: nextRoll.dice,
    tomorrowDate: nextRoll.colombiaDate
  };
}
