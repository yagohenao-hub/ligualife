import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://swmklobpnrkjpfackboc.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3bWtsb2JwbnJranBmYWNrYm9jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzUwODcwOCwiZXhwIjoyMTAzMDg0NzA4fQ.6Wg17RIckj6OL0dYEqaKiIoS1MZncV-5daO_RnfNoK4';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
  realtime: { transport: ws }
});

async function syncCurriculum() {
  const csvPath = path.join(process.cwd(), 'curriculum_60_clases.csv');
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ No se encontró el archivo: ${csvPath}`);
    process.exit(1);
  }

  console.log(`📖 Leyendo currículum desde ${csvPath}...`);
  const content = fs.readFileSync(csvPath, 'utf8');
  const records = parse(content, { columns: true, skip_empty_lines: true, trim: true });

  console.log(`🔍 Total registros leídos: ${records.length}`);

  const rowsToUpsert = records.map((r, index) => {
    const orderNum = parseInt(r['Order'] || `${index + 1}`, 10);
    return {
      id: `recTopic${orderNum}`,
      'Topic Name': r['Topic Name'] || `Tema ${orderNum}`,
      Curriculum: 'General English Course',
      Order: orderNum,
      Fase: r['Fase'] || 'Installer',
      Level: r['Level'] || 'A1 - Beginner',
      LDS_Formula: r['LDS_Formula'] || '',
      AI_Context: r['AI_Context'] || '',
      Description: r['Description'] || '',
      'Slides URL': r['Slides URL'] || ''
    };
  });

  console.log(`🚀 Sincronizando ${rowsToUpsert.length} clases con Supabase (tabla 'curriculum_topics')...`);
  const { error } = await supabase.from('curriculum_topics').upsert(rowsToUpsert, { onConflict: 'id' });

  if (error) {
    console.error('❌ Error al actualizar Supabase:', error.message);
  } else {
    console.log('✅ ¡Currículum actualizado con éxito en Supabase!');
    console.log(`🎉 ${rowsToUpsert.length} clases ahora están sincronizadas y disponibles en toda la plataforma.`);
  }
}

syncCurriculum().catch(console.error);
