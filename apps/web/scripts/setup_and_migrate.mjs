import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { createClient } from '@supabase/supabase-js';

import ws from 'ws';

const SUPABASE_URL = 'https://swmklobpnrkjpfackboc.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3bWtsb2JwbnJranBmYWNrYm9jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzUwODcwOCwiZXhwIjoyMTAzMDg0NzA4fQ.6Wg17RIckj6OL0dYEqaKiIoS1MZncV-5daO_RnfNoK4';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
  realtime: { transport: ws }
});

const DB_DIR = path.join(process.cwd(), '../../DB');

function readCsv(filename) {
  const filePath = path.join(DB_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${filePath}`);
    return [];
  }
  const content = fs.readFileSync(filePath, 'utf8');
  return parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });
}

async function run() {
  console.log('🚀 Iniciando migración limpia de CSVs a Supabase...');

  // 1. Migrar Students
  const rawStudents = readCsv('Students-Grid view.csv');
  console.log(`Leídos ${rawStudents.length} estudiantes raw de Airtable.`);
  
  const validStudents = rawStudents.filter(s => {
    const name = (s['Full Name'] || s['FullName'] || s['Name'] || '').trim();
    if (!name) return false;
    if (name.toLowerCase().includes('test student') || name.toLowerCase().includes('carlos test')) return false;
    return true;
  });

  console.log(`Estudiantes reales a migrar: ${validStudents.length}`);

  const studentRows = validStudents.map((s, index) => {
    const id = `recStudent${index + 1}`;
    const name = s['Full Name'] || s['FullName'] || s['Name'];
    const email = s['Email'] || `${name.toLowerCase().replace(/\s+/g, '.')}@lingualife.co`;
    return {
      id,
      full_name: name,
      email: email,
      phone: s['Phone'] || '',
      timezone: s['Timezone'] || 'America/Bogota',
      pin: s['PIN'] || '123456',
      status: s['Status'] || 'Active',
      age_range: s['Age Range'] || '18-25',
      interests: s['Interests'] ? s['Interests'].split(',').map(i => i.trim()) : [],
      availability: s['Availability'] || '',
      open_to_groups: s['Open to Group Classes'] === 'true' || s['Open to Group Classes'] === '1',
      classes_remaining: parseInt(s['Tokens de Reposición'] || '16', 10),
      tokens: parseInt(s['Tokens de Reposición'] || '0', 10)
    };
  });

  // 2. Migrar Teachers
  const rawTeachers = readCsv('Teachers-Grid view.csv');
  const validTeachers = rawTeachers.filter(t => {
    const name = (t['Name'] || '').trim();
    if (!name) return false;
    return true;
  });

  const teacherRows = validTeachers.map((t, index) => {
    const id = `recTeacher${index + 1}`;
    return {
      id,
      name: t['Name'],
      email: t['Email'] || `${t['Name'].toLowerCase().replace(/\s+/g, '.')}@lingualife.co`,
      phone: t['Phone'] || '',
      timezone: t['Timezone'] || 'America/Bogota',
      pin: t['PIN'] || '1234',
      status: t['Status'] || 'Active',
      meeting_link: t['Meeting Link'] || 'https://meet.google.com/lingualife-test',
      availability: t['Availability'] || ''
    };
  });

  // 3. Migrar Curriculum Topics
  const rawTopics = readCsv('Curriculum Topics-Grid view.csv');
  const topicRows = rawTopics.map((tp, index) => ({
    id: `recTopic${index + 1}`,
    topic_name: tp['Topic Name'] || tp['Title'] || `Tema ${index + 1}`,
    order: parseInt(tp['Order'] || `${index + 1}`, 10),
    lds_formula: tp['LDSFormula'] || tp['LDS Formula'] || ''
  }));

  // 4. Migrar Video Bank
  const rawVideos = readCsv('Video Bank-Grid view.csv');
  const videoRows = rawVideos.map((v, index) => ({
    id: `recVideo${index + 1}`,
    title: v['Title'] || 'Video sin título',
    youtube_url: v['YouTube URL'] || '',
    thumbnail: v['Thumbnail'] || '',
    level: v['Level'] || 'A1 - Beginner',
    vertical: v['Vertical'] || 'General',
    status: v['Status'] || 'Approved'
  }));

  console.log('Insertando datos en Supabase via Upsert...');

  const { error: errStudents } = await supabase.from('students').upsert(studentRows);
  if (errStudents) console.error('Error al insertar students:', errStudents.message);
  else console.log('✅ Students migrados exitosamente.');

  const { error: errTeachers } = await supabase.from('teachers').upsert(teacherRows);
  if (errTeachers) console.error('Error al insertar teachers:', errTeachers.message);
  else console.log('✅ Teachers migrados exitosamente.');

  const { error: errTopics } = await supabase.from('curriculum_topics').upsert(topicRows);
  if (errTopics) console.error('Error al insertar curriculum_topics:', errTopics.message);
  else console.log('✅ Curriculum Topics migrados exitosamente.');

  const { error: errVideos } = await supabase.from('video_bank').upsert(videoRows);
  if (errVideos) console.error('Error al insertar video_bank:', errVideos.message);
  else console.log('✅ Video Bank migrado exitosamente.');

  console.log('🎉 Migración completada.');
}

run().catch(console.error);
