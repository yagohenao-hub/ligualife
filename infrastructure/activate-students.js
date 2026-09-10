try {
  global.WebSocket = require('ws');
} catch (e) {}

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://swmklobpnrkjpfackboc.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3bWtsb2JwbnJranBmYWNrYm9jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzUwODcwOCwiZXhwIjoyMTAzMDg0NzA4fQ.6Wg17RIckj6OL0dYEqaKiIoS1MZncV-5daO_RnfNoK4';

const client = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

async function activateAllStudents(dryRun = false) {
  console.log(`📡 Consultando estudiantes en Supabase (${dryRun ? 'MODO SIMULACIÓN / DRY RUN' : 'MODO ACTIVACIÓN REAL'})...\n`);
  
  const { data: students, error } = await client
    .from('students')
    .select('id, "Full Name", "Phone", "Status", "Pocket Coach Status"');

  if (error) {
    console.error("❌ Error consultando estudiantes:", error.message);
    return;
  }

  // Filtrar estudiantes reales (con teléfono de 10+ dígitos y sin prefijo ficticio de prueba)
  const validStudents = students.filter(s => {
    const raw = (s.Phone || '').replace(/[^0-9]/g, '');
    const isMock = (s['Full Name'] || '').toLowerCase().includes('mock') || (s['Full Name'] || '').toLowerCase().includes('dummy');
    return raw.length >= 10 && !isMock;
  });

  console.log(`Total estudiantes encontrados: ${students.length}`);
  console.log(`Estudiantes válidos con teléfono real: ${validStudents.length}\n`);

  for (const s of validStudents) {
    const name = s['Full Name'] || 'Sin Nombre';
    const phone = s.Phone;
    const currStatus = s.Status;
    const currPC = s['Pocket Coach Status'];

    console.log(`👤 ${name} (${phone}) - Status: [${currStatus}], PocketCoach: [${currPC}]`);

    if (!dryRun) {
      const { error: updErr } = await client
        .from('students')
        .update({
          'Status': 'Active',
          'Pocket Coach Status': 'Active'
        })
        .eq('id', s.id);

      if (updErr) {
        console.error(`   ❌ Error actualizando ${name}:`, updErr.message);
      } else {
        console.log(`   ✅ Activado exitosamente para Pocket Coach.`);
      }
    }
  }

  if (dryRun) {
    console.log(`\n💡 Para aplicar los cambios reales, ejecuta: node infrastructure/activate-students.js --apply`);
  } else {
    console.log(`\n🎉 ¡Todos los ${validStudents.length} estudiantes reales han sido activados con Status = Active y Pocket Coach Status = Active!`);
  }
}

const applyChanges = process.argv.includes('--apply');
activateAllStudents(!applyChanges);
