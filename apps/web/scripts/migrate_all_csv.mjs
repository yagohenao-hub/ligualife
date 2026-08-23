import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

// También usar explícitamente las credenciales que pasaste en el chat por seguridad
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://swmklobpnrkjpfackboc.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3bWtsb2JwbnJranBmYWNrYm9jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzUwODcwOCwiZXhwIjoyMTAzMDg0NzA4fQ.6Wg17RIckj6OL0dYEqaKiIoS1MZncV-5daO_RnfNoK4';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
  realtime: { transport: ws }
});

const dbPath = path.join(process.cwd(), 'DB');
if (!fs.existsSync(dbPath)) {
  console.error(`La carpeta DB no existe en: ${dbPath}`);
  process.exit(1);
}

// Mapeo manual de nombres de archivo CSV a los nombres de tabla SQL
const tableMappings = {
  'Curriculum Topics': 'curriculum_topics',
  'Curriculums': 'curriculums',
  'Error Patterns': 'error_patterns',
  'Interests': 'interests',
  'Progress Apply Queue': 'progress_apply_queue',
  'Series Requests': 'series_requests',
  'Session Participants': 'session_participants',
  'Sessions': 'sessions',
  'Student Curriculum': 'student_curriculum',
  'Student Topic Progress': 'student_topic_progress',
  'Student-Teacher': 'student_teacher',
  'Students': 'students',
  'Study Groups': 'study_groups',
  'Teacher Availability': 'teacher_availability',
  'Teachers': 'teachers',
  'Verticals': 'verticals',
  'Video Bank': 'video_bank'
};

async function migrate() {
  const files = fs.readdirSync(dbPath).filter(f => f.endsWith('.csv'));
  
  for (const file of files) {
    const rawName = file.replace('-Grid view.csv', '');
    const tableName = tableMappings[rawName];
    
    if (!tableName) {
      console.log(`Saltando ${file}, no hay tabla mapeada.`);
      continue;
    }

    console.log(`\nImportando ${file} -> tabla: ${tableName}...`);
    const fileContent = fs.readFileSync(path.join(dbPath, file), 'utf-8');
    
    // Parsear el CSV (automáticamente detecta headers en la 1ra línea)
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    if (records.length === 0) {
      console.log(`  └ Tabla vacía. Saltando.`);
      continue;
    }

    // Limpiar campos vacíos (convertirlos a null para evitar errores en postgres)
    const cleanedRecords = records.map(record => {
      const clean = {};
      for (const key in record) {
        clean[key] = record[key] === '' ? null : record[key];
      }
      return clean;
    });

    // Supabase tiene un límite de payload por request, mejor hacerlo en chunks de 500
    const chunkSize = 500;
    for (let i = 0; i < cleanedRecords.length; i += chunkSize) {
      const chunk = cleanedRecords.slice(i, i + chunkSize);
      const { error } = await supabase.from(tableName).insert(chunk);
      if (error) {
        console.error(`  └ ERROR insertando chunk en ${tableName}:`, error);
        // Seguimos con el resto a pesar del error
      } else {
        console.log(`  └ Insertados ${chunk.length} registros (Total: ${i + chunk.length}/${cleanedRecords.length})`);
      }
    }
  }
  
  console.log('\n✅ ¡Migración de todos los CSV finalizada!');
}

migrate().catch(console.error);
