/**
 * Dispatch Daemon / Runner para LinguaLife Pocket Coach
 * Consulta el endpoint de dispatch cada minuto.
 * Si es la hora elegida por el "dado", ejecuta el envío a los estudiantes activos.
 * 
 * Uso: node apps/web/scripts/dispatch-daemon.mjs
 */

const targetUrl = process.env.DISPATCH_TARGET_URL || 'http://localhost:3000/api/pocket-coach/dispatch';
const CHECK_INTERVAL_MS = 60 * 1000; // Cada 60 segundos

console.log('🤖 [Pocket Coach Dispatch Daemon] Iniciado.');
console.log(`🎯 Monitoreando: ${targetUrl}`);
console.log('🎲 El despacho se ejecutará automáticamente cuando el reloj coincida con la hora del dado de hoy.');

async function checkDispatch() {
  try {
    const res = await fetch(targetUrl);
    const data = await res.json();
    const nowStr = new Date().toLocaleTimeString('es-CO');

    if (data.dispatched) {
      console.log(`\n🎉 [${nowStr}] ¡Despacho del día EJECUTADO con éxito!`);
      console.log(`📊 Alumnos procesados: ${data.processed?.length || 0}`);
      console.log(`🎲 Próximo despacho (mañana): ${data.nextSchedule?.nextTimeCOT} (${data.nextSchedule?.tomorrowDate})`);
    } else {
      if (data.reason === 'waiting_for_scheduled_time') {
        process.stdout.write(`⏳ [${nowStr}] Esperando la hora programada: ${data.schedule?.timeCOT} (Dado: ${data.schedule?.dice})\r`);
      } else if (data.reason === 'already_dispatched_today') {
        process.stdout.write(`✅ [${nowStr}] Despacho de hoy ya completado. Próximo: ${data.schedule?.timeCOT}\r`);
      } else {
        console.log(`[${nowStr}] Info:`, data.message || data);
      }
    }
  } catch (err) {
    console.error(`❌ [Error de conexión]:`, err.message);
  }
}

// Ejecutar revisión inmediata y luego cada 60s
checkDispatch();
setInterval(checkDispatch, CHECK_INTERVAL_MS);
