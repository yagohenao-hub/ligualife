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
  if (row['Error Pattern'] && !fields['Pattern Name']) { fields['Pattern Name'] = row['Error Pattern']; }
  if (row['Tokens de Reposición'] !== undefined && row['Tokens de Reposición'] !== null && row['Tokens de Reposición'] !== '') {
    const parsedTok = parseInt(String(row['Tokens de Reposición']), 10)
    const tokNum = isNaN(parsedTok) ? 0 : parsedTok
    fields['Tokens'] = tokNum
    fields['Tokens de Reposición'] = tokNum
  }
  const rawClasses = row['Classes Remaining'] ?? row['ClassesRemaining']
  if (rawClasses !== undefined && rawClasses !== null && rawClasses !== '') {
    const parsedClasses = parseInt(String(rawClasses), 10)
    if (!isNaN(parsedClasses)) {
      fields['Classes Remaining'] = parsedClasses
      fields['ClassesRemaining'] = parsedClasses
    }
  }
  if (row['Is Holiday'] !== undefined && row['Is Holiday'] !== null) {
    fields['Is Holiday'] = row['Is Holiday'] === true || String(row['Is Holiday']).toLowerCase() === 'true'
  }
  if (row['Order'] !== undefined && row['Order'] !== null && /^\d+$/.test(String(row['Order']).trim())) {
    fields['Order'] = parseInt(String(row['Order']).trim(), 10)
  }

  // Array formatting for relational fields to support frontend assumptions
  if (row['Teacher'] && !Array.isArray(row['Teacher'])) {
    fields['Teacher'] = typeof row['Teacher'] === 'string' && row['Teacher'].includes(',')
      ? row['Teacher'].split(',').map((s: string) => s.trim()).filter(Boolean)
      : [row['Teacher']]
  }
  if (row['Student'] && !Array.isArray(row['Student'])) {
    fields['Student'] = typeof row['Student'] === 'string' && row['Student'].includes(',')
      ? row['Student'].split(',').map((s: string) => s.trim()).filter(Boolean)
      : [row['Student']]
  }
  if (row['Session'] && !Array.isArray(row['Session'])) fields['Session'] = [row['Session']]
  if (row['Curriculum Topic']) {
    let ct = row['Curriculum Topic']
    if (typeof ct === 'string' && (ct.startsWith('["') || ct.startsWith('[\"'))) {
      try { ct = JSON.parse(ct) } catch {}
    }
    fields['Curriculum Topic'] = Array.isArray(ct) ? ct : [ct]
  }

  return {
    id: row.id,
    fields,
    createdTime: row.created_at || new Date().toISOString()
  }
}

function compareNumeric(val: any, op: string, target: number): boolean {
  const num = parseFloat(String(val ?? ''))
  if (isNaN(num)) return false
  if (op === '=') return num === target
  if (op === '!=') return num !== target
  if (op === '>') return num > target
  if (op === '>=') return num >= target
  if (op === '<') return num < target
  if (op === '<=') return num <= target
  return false
}

export async function fetchFromDB(table: string, params = ''): Promise<any> {
  const dbTable = getTableName(table)
  try {
    let query = supabase.from(dbTable).select('*')

    let formula = ''
    let sortField = ''
    let sortDir: 'asc' | 'desc' = 'asc'
    let maxRecords = 0

    const trimmedParams = (params || '').replace(/^\?/, '')
    if (trimmedParams.includes('filterByFormula=') || trimmedParams.includes('sort[') || trimmedParams.includes('maxRecords=')) {
      const sp = new URLSearchParams(trimmedParams)
      formula = sp.get('filterByFormula') || ''
      sortField = sp.get('sort[0][field]') || ''
      sortDir = (sp.get('sort[0][direction]') || 'asc').toLowerCase() === 'desc' ? 'desc' : 'asc'
      const mr = parseInt(sp.get('maxRecords') || '0', 10)
      if (!isNaN(mr) && mr > 0) maxRecords = mr
    } else {
      formula = decodeURIComponent(trimmedParams)
    }

    // Formula parsing for query parameters
    const statusMatch = formula.match(/\{Status\}\s*=\s*'([^']*)'/) || formula.match(/\{Status\}\s*=\s*"([^"]*)"/)
    if (statusMatch) {
      query = query.eq('Status', statusMatch[1])
    }

    const statusNeqMatch = formula.match(/\{Status\}\s*!=\s*'([^']*)'/) || formula.match(/\{Status\}\s*!=\s*"([^"]*)"/)
    if (statusNeqMatch) {
      query = query.neq('Status', statusNeqMatch[1])
    }

    const pcStatusMatch = formula.match(/\{Pocket Coach Status\}\s*=\s*'([^']*)'/) || formula.match(/\{Pocket Coach Status\}\s*=\s*"([^"]*)"/)
    if (pcStatusMatch) {
      query = query.eq('Pocket Coach Status', pcStatusMatch[1])
    }

    const pinMatch = formula.match(/\{PIN\}\s*=\s*'([^']*)'/) || formula.match(/\{PIN\}\s*=\s*"([^"]*)"/)
    if (pinMatch) {
      query = query.ilike('PIN', pinMatch[1])
    }

    const emailMatch = formula.match(/\{Email\}\s*=\s*'([^']*)'/) || formula.match(/\{Email\}\s*=\s*"([^"]*)"/)
    if (emailMatch) {
      query = query.ilike('Email', emailMatch[1].trim())
    }

    const phoneMatch = formula.match(/\{Phone\}\s*=\s*'([^']*)'/) || formula.match(/\{Phone\}\s*=\s*"([^"]*)"/)
    if (phoneMatch) {
      query = query.eq('Phone', phoneMatch[1])
    }

    for (const eqColMatch of formula.matchAll(/\{(Teacher|Student|Session|Primary Teacher)\}\s*=\s*'([^']+)'/g)) {
      query = query.ilike(eqColMatch[1], `%${eqColMatch[2]}%`)
    }

    const findMatches = Array.from(formula.matchAll(/FIND\(\s*'([^']+)'\s*,\s*(?:ARRAYJOIN\(\s*)?\{([^}]+)\}(?:\s*,\s*'[^']*'\s*\))?\s*\)/g))
    if (findMatches.length > 0) {
      for (const fm of findMatches) {
        const targetVal = fm[1]
        const targetCol = fm[2]
        query = query.ilike(targetCol, `%${targetVal}%`)
      }
    } else {
      const simpleFind = formula.match(/FIND\(\s*'([^']+)'/)
      if (simpleFind) {
        const targetId = simpleFind[1]
        if (dbTable === 'session_participants') {
          query = query.ilike('Student', `%${targetId}%`)
        } else if (dbTable === 'student_teacher') {
          query = query.ilike('Student', `%${targetId}%`)
        } else if (dbTable === 'students') {
          query = query.ilike('Phone', `%${targetId}%`)
        }
      }
    }

    if (formula.includes('RECORD_ID()')) {
      const eqIds = Array.from(formula.matchAll(/(?<!NOT\()RECORD_ID\(\)\s*=\s*'([^']*)'/g)).map(m => m[1])
      if (eqIds.length > 0) {
        query = query.in('id', eqIds)
      }
      const neqIds = Array.from(formula.matchAll(/RECORD_ID\(\)\s*!=\s*'([^']*)'/g)).map(m => m[1])
      for (const nid of neqIds) {
        query = query.neq('id', nid)
      }
    }

    for (const afterMatch of formula.matchAll(/IS_AFTER\(\s*\{([^}]+)\}\s*,\s*'([^']+)'\s*\)/g)) {
      query = query.gt(afterMatch[1], afterMatch[2])
    }
    for (const beforeMatch of formula.matchAll(/IS_BEFORE\(\s*\{([^}]+)\}\s*,\s*'([^']+)'\s*\)/g)) {
      query = query.lt(beforeMatch[1], beforeMatch[2])
    }

    const { data, error } = await query

    if (error || !data) {
      console.warn(`Supabase fetch error for table ${dbTable}:`, error?.message)
      const store = readMockStore()
      return { records: Object.values(store[table] || {}).map(formatRecord) }
    }

    let records = data.map(formatRecord)

    // Numeric post-filters for TEXT columns in Postgres (prevents '9' > '10' lexicographic bugs)
    for (const numMatch of formula.matchAll(/\{(Order|Tokens de Reposición)\}\s*(=|!=|>=|<=|>|<)\s*(\d+)/g)) {
      const col = numMatch[1]
      const op = numMatch[2]
      const target = parseInt(numMatch[3], 10)
      records = records.filter(r => compareNumeric(r.fields?.[col], op, target))
    }

    if (sortField) {
      records.sort((a, b) => {
        const va = a.fields?.[sortField]
        const vb = b.fields?.[sortField]
        if (va === vb) return 0
        if (va === undefined || va === null) return sortDir === 'asc' ? 1 : -1
        if (vb === undefined || vb === null) return sortDir === 'asc' ? -1 : 1
        const na = Number(va)
        const nb = Number(vb)
        let cmp = 0
        if (!isNaN(na) && !isNaN(nb) && va !== '' && vb !== '') {
          cmp = na - nb
        } else {
          cmp = String(va).localeCompare(String(vb))
        }
        return sortDir === 'asc' ? cmp : -cmp
      })
    }

    if (maxRecords > 0) {
      records = records.slice(0, maxRecords)
    }

    return { records }
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
      "Full Name": fields['Full Name'] || fields.FullName || fields.fullName || fields.Name || fields.name || fields['fldbdDNucZwILRMwO'] || null,
      "Email": fields.Email || fields.email || fields['fldxAsAn6aQDHRR9U'] || null,
      "Phone": fields.Phone || fields.phone || fields['fldu8P3X4o9P4V9dn'] || null,
      "Timezone": fields.Timezone || fields.timezone || fields['fldsq1cfz7OnxNfm9'] || 'America/Bogota',
      "PIN": fields.PIN || fields.pin || fields.Pin || fields['fld3C6vGWEA7RR1LM'] || null,
      "Status": fields.Status || fields.status || fields['fldXUKKO28Wr1dN76'] || 'Active',
      "Age Range": fields['Age Range'] || fields.ageRange || fields['fld1Vi2ti4xdraYyo'] || null,
      "Interests": Array.isArray(fields.interests) ? fields.interests.join(',') : (fields.Interests || fields['fldTfNhYtykGeDx1x'] || ''),
      "Availability": typeof fields.availability === 'string' ? fields.availability : (typeof fields['Availability'] === 'string' ? fields['Availability'] : JSON.stringify(fields.availability || [])),
      "Open to Group Classes": fields['Open to Group Classes'] ?? fields.openToGroups ?? fields.openToGroupClasses ?? false,
      "Tokens de Reposición": fields['Tokens de Reposición'] ?? fields.Tokens ?? fields.tokens ?? 0
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
    if (fields['Duration (minutes)'] !== undefined) row['Duration (minutes)'] = String(fields['Duration (minutes)'])
    if (fields['Location/Link'] !== undefined) row['Location/Link'] = fields['Location/Link']
    if (fields['Extraordinary Session (Token)'] !== undefined) row['Extraordinary Session (Token)'] = String(Boolean(fields['Extraordinary Session (Token)']))
    if (fields['Study Group'] !== undefined) row['Study Group'] = Array.isArray(fields['Study Group']) ? fields['Study Group'][0] : fields['Study Group']
    if (fields['Is Holiday'] !== undefined) row['Is Holiday'] = String(Boolean(fields['Is Holiday']))
    if (fields['Notes (internal)'] !== undefined) row['Notes (internal)'] = fields['Notes (internal)']
    if (fields['Rescheduled From'] !== undefined) row['Rescheduled From'] = fields['Rescheduled From']
  } else if (dbTable === 'session_participants') {
    row = {
      "Session": Array.isArray(fields.Session) ? fields.Session[0] : fields.Session,
      "Student": Array.isArray(fields.Student) ? fields.Student[0] : fields.Student
    }
    if (fields['Attendance'] !== undefined) row['Attendance'] = fields['Attendance']
    if (fields['Curriculum Topic'] !== undefined) row['Curriculum Topic'] = Array.isArray(fields['Curriculum Topic']) ? fields['Curriculum Topic'][0] : fields['Curriculum Topic']
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
  } else if (dbTable === 'error_patterns') {
    row = { ...fields }
    if ('Pattern Name' in row) {
      row['Error Pattern'] = row['Pattern Name']
      delete row['Pattern Name']
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
  const updateData: Record<string, any> = { ...fields }

  if ('Current Topic' in updateData) {
    updateData['Current Topic (Bot)'] = Array.isArray(updateData['Current Topic']) ? updateData['Current Topic'][0] : updateData['Current Topic']
    delete updateData['Current Topic']
  }
  if ('Tokens' in updateData) {
    updateData['Tokens de Reposición'] = String(updateData['Tokens'])
    delete updateData['Tokens']
  }
  if ('Tokens de Reposición' in updateData && typeof updateData['Tokens de Reposición'] === 'number') {
    updateData['Tokens de Reposición'] = String(updateData['Tokens de Reposición'])
  }
  if ('ClassesRemaining' in updateData) {
    updateData['Classes Remaining'] = updateData['ClassesRemaining']
    delete updateData['ClassesRemaining']
  }
  if ('Classes Remaining' in updateData && typeof updateData['Classes Remaining'] === 'number') {
    updateData['Classes Remaining'] = String(updateData['Classes Remaining'])
  }
  if ('MeetingLink' in updateData) {
    updateData['Meeting Link'] = updateData['MeetingLink']
    delete updateData['MeetingLink']
  }
  if ('Status' in updateData && updateData['Status'] !== undefined) {
    updateData['Status'] = updateData['Status']
  }
  if ('Pocket Coach Status' in updateData && updateData['Pocket Coach Status'] !== undefined) {
    updateData['Pocket Coach Status'] = updateData['Pocket Coach Status']
  }
  if ('Teacher' in updateData && updateData['Teacher'] !== undefined) {
    updateData['Teacher'] = Array.isArray(updateData.Teacher) ? updateData.Teacher[0] : updateData.Teacher
  }
  if ('Curriculum Topic' in updateData && updateData['Curriculum Topic'] !== undefined) {
    updateData['Curriculum Topic'] = Array.isArray(updateData['Curriculum Topic']) ? updateData['Curriculum Topic'][0] : updateData['Curriculum Topic']
  }
  if ('Is Holiday' in updateData && typeof updateData['Is Holiday'] === 'boolean') {
    updateData['Is Holiday'] = String(updateData['Is Holiday'])
  }

  try {
    let { data, error } = await supabase.from(dbTable).update(updateData).eq('id', recordId).select().single()
    if (error && error.message?.includes('Classes Remaining') && 'Classes Remaining' in updateData) {
      const retryData = { ...updateData }
      delete retryData['Classes Remaining']
      if (Object.keys(retryData).length > 0) {
        const retry = await supabase.from(dbTable).update(retryData).eq('id', recordId).select().single()
        data = retry.data
        error = retry.error
      }
    }
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
