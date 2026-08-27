import { supabase } from './supabaseClient'
import fs from 'fs'
import path from 'path'

const MOCK_FILE = path.join(process.cwd(), 'tmp_mock_db.json')

function readMockStore(): Record<string, Record<string, any>> {
  try {
    if (fs.existsSync(MOCK_FILE)) {
      return JSON.parse(fs.readFileSync(MOCK_FILE, 'utf8'))
    }
  } catch {}
  return {}
}

// Map logical table identifiers to Supabase SQL tables
function getTableName(table: string): string {
  const map: Record<string, string> = {
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
  }
  return map[table] || table.toLowerCase().replace(/\s+/g, '_')
}

// Convert Supabase DB Row to compatible Record structure for frontend compatibility
function formatRecord(row: any): any {
  if (!row) return null
  
  const fields: Record<string, any> = { ...row }
  
  // Aliases for frontend compatibility
  if (row['Full Name']) { fields['FullName'] = row['Full Name']; fields['Name'] = row['Full Name']; }
  if (row['Name']) { fields['FullName'] = row['Name']; fields['Full Name'] = row['Name']; }
  if (row['Tokens de Reposición']) { fields['Tokens'] = row['Tokens de Reposición']; }

  // Array formatting for relational fields to support frontend assumptions
  if (row['Teacher'] && !Array.isArray(row['Teacher'])) {
    fields['Teacher'] = typeof row['Teacher'] === 'string' && row['Teacher'].includes(',') ? row['Teacher'].split(',') : [row['Teacher']]
  }
  if (row['Student'] && !Array.isArray(row['Student'])) {
    fields['Student'] = typeof row['Student'] === 'string' && row['Student'].includes(',') ? row['Student'].split(',') : [row['Student']]
  }
  if (row['Session'] && !Array.isArray(row['Session'])) fields['Session'] = [row['Session']]
  if (row['Curriculum Topic'] && !Array.isArray(row['Curriculum Topic'])) fields['Curriculum Topic'] = [row['Curriculum Topic']]

  return {
    id: row.id,
    fields,
    createdTime: row.created_at || new Date().toISOString()
  }
}

export async function fetchFromDB(table: string, params = ''): Promise<any> {
  const dbTable = getTableName(table)
  try {
    let query = supabase.from(dbTable).select('*')

    const decoded = decodeURIComponent(params)

    // Formula parsing for query parameters
    const pinMatch = decoded.match(/\{PIN\}\s*=\s*'([^']*)'/) || decoded.match(/\{PIN\}\s*=\s*"([^"]*)"/)
    if (pinMatch) {
      query = query.eq('PIN', pinMatch[1])
    }

    const emailMatch = decoded.match(/\{Email\}\s*=\s*'([^']*)'/)
    if (emailMatch) {
      query = query.eq('Email', emailMatch[1])
    }

    const findMatch = decoded.match(/FIND\(\s*'([^']+)'/);
    if (findMatch) {
      const targetId = findMatch[1];
      if (dbTable === 'session_participants') {
        query = query.eq('Student', targetId)
      } else if (dbTable === 'student_teacher') {
        query = query.eq('Student', targetId)
      }
    }

    if (decoded.includes('RECORD_ID()')) {
      const ids = Array.from(decoded.matchAll(/RECORD_ID\(\)\s*=\s*'([^']*)'/g)).map(m => m[1])
      if (ids.length > 0) {
        query = query.in('id', ids)
      }
    }

    const { data, error } = await query

    if (error || !data) {
      console.warn(`Supabase fetch error for table ${dbTable}:`, error?.message)
      const store = readMockStore()
      return { records: Object.values(store[table] || {}).map(formatRecord) }
    }

    return { records: data.map(formatRecord) }
  } catch (err) {
    const store = readMockStore()
    return { records: Object.values(store[table] || {}).map(formatRecord) }
  }
}

export async function findDBRecords(table: string, formula: string): Promise<any[]> {
  const res = await fetchFromDB(table, `filterByFormula=${encodeURIComponent(formula)}`)
  return res?.records || []
}

export async function fetchDBRecord(table: string, recordId: string): Promise<any> {
  const dbTable = getTableName(table)
  try {
    const { data, error } = await supabase.from(dbTable).select('*').eq('id', recordId).single()
    if (error || !data) {
      const store = readMockStore()
      return store[table]?.[recordId] || null
    }
    return formatRecord(data)
  } catch {
    const store = readMockStore()
    return store[table]?.[recordId] || null
  }
}

export async function createDBRecord(table: string, fields: Record<string, any>): Promise<any> {
  const dbTable = getTableName(table)
  let row: Record<string, any> = {}

  if (dbTable === 'students') {
    row = {
      "Full Name": fields.FullName || fields.Name || fields['Full Name'],
      "Email": fields.Email,
      "Phone": fields.Phone,
      "Timezone": fields.timezone || 'America/Bogota',
      "PIN": fields.PIN || fields.Pin,
      "Status": fields.Status || 'Active',
      "Age Range": fields.ageRange,
      "Interests": Array.isArray(fields.interests) ? fields.interests.join(',') : '',
      "Availability": typeof fields.availability === 'string' ? fields.availability : JSON.stringify(fields.availability || []),
      "Open to Group Classes": fields.openToGroups || false,
      "Tokens de Reposición": fields.Tokens || 0
    }
  } else if (dbTable === 'teachers') {
    row = {
      "Name": fields.Name,
      "Email": fields.Email,
      "Phone": fields.Phone,
      "Timezone": fields.timezone || 'America/Bogota',
      "PIN": fields.PIN || fields.Pin,
      "Status": fields.Status || 'Active',
      "Meeting Link": fields.MeetingLink || fields['Meeting Link'],
      "Availability": typeof fields.availability === 'string' ? fields.availability : JSON.stringify(fields.availability || [])
    }
  } else if (dbTable === 'sessions') {
    row = {
      "Teacher": Array.isArray(fields.Teacher) ? fields.Teacher[0] : fields.Teacher,
      "Scheduled Date/Time": fields['Scheduled Date/Time'] || new Date().toISOString(),
      "Status": fields.Status || 'Scheduled',
      "Session Name": fields['Session Name'],
      "Curriculum Topic": Array.isArray(fields['Curriculum Topic']) ? fields['Curriculum Topic'][0] : fields['Curriculum Topic']
    }
  } else if (dbTable === 'session_participants') {
    row = {
      "Session": Array.isArray(fields.Session) ? fields.Session[0] : fields.Session,
      "Student": Array.isArray(fields.Student) ? fields.Student[0] : fields.Student
    }
  } else if (dbTable === 'student_teacher') {
    row = {
      "Student": Array.isArray(fields.Student) ? fields.Student.join(',') : fields.Student,
      "Teacher": Array.isArray(fields.Teacher) ? fields.Teacher.join(',') : fields.Teacher,
      "Status": fields.Status || 'Active',
      "Start Date": fields['Start Date'] || new Date().toISOString().split('T')[0],
      "Notes": fields.Notes || '',
      "Recurrence Day": Array.isArray(fields['Recurrence Day']) ? fields['Recurrence Day'].join(',') : (fields['Recurrence Day'] || ''),
      "Recurrence Time": fields['Recurrence Time'] || ''
    }
  } else {
    row = { ...fields }
  }

  try {
    const { data, error } = await supabase.from(dbTable).insert([row]).select().single()
    if (error || !data) {
      console.warn(`Supabase insert error for table ${dbTable}:`, error?.message)
      throw new Error(error?.message || 'Insert error')
    }
    return formatRecord(data)
  } catch (err: any) {
    throw err
  }
}

export async function patchDBRecord(table: string, recordId: string, fields: Record<string, any>): Promise<any> {
  const dbTable = getTableName(table)
  let updateData: Record<string, any> = {}
  if (fields['Current Topic']) updateData['Current Topic (Bot)'] = fields['Current Topic'][0]
  if (fields['Tokens']) updateData['Tokens de Reposición'] = fields['Tokens']
  if (fields['Status']) updateData['Status'] = fields['Status']
  if (fields['Teacher']) updateData['Teacher'] = Array.isArray(fields.Teacher) ? fields.Teacher[0] : fields.Teacher

  if (Object.keys(updateData).length === 0) updateData = { ...fields }

  try {
    const { data, error } = await supabase.from(dbTable).update(updateData).eq('id', recordId).select().single()
    if (error || !data) {
      return fetchDBRecord(table, recordId)
    }
    return formatRecord(data)
  } catch {
    return fetchDBRecord(table, recordId)
  }
}

export async function deleteDBRecord(table: string, recordId: string): Promise<any> {
  const dbTable = getTableName(table)
  try {
    await supabase.from(dbTable).delete().eq('id', recordId)
    return { id: recordId, deleted: true }
  } catch {
    return { id: recordId, deleted: true }
  }
}

// Deprecated alias exports for compatibility mapping to Database/Supabase
export {
  fetchFromDB as fetchFromAirtable,
  findDBRecords as findAirtableRecords,
  fetchDBRecord as fetchAirtableRecord,
  createDBRecord as createAirtableRecord,
  patchDBRecord as patchAirtableRecord,
  deleteDBRecord as deleteAirtableRecord
}
