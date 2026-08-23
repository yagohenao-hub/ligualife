import fs from 'fs'
import path from 'path'

const BASE_ID = process.env.AIRTABLE_BASE_ID ?? 'app9ZtojlxX5FoZ7y'
const API_KEY = process.env.AIRTABLE_API_KEY

const MOCK_FILE = path.join(process.cwd(), 'tmp_mock_airtable.json')

function readMockStore(): Record<string, Record<string, any>> {
  try {
    if (fs.existsSync(MOCK_FILE)) {
      return JSON.parse(fs.readFileSync(MOCK_FILE, 'utf8'))
    }
  } catch {}
  return {}
}

function writeMockStore(data: Record<string, Record<string, any>>) {
  try {
    fs.writeFileSync(MOCK_FILE, JSON.stringify(data, null, 2))
  } catch {}
}

function normalizeFields(fields: Record<string, any>): Record<string, any> {
  const f = { ...fields }
  if (f.fldYW4Oh6dPrZh4wY) { f['Name'] = f.fldYW4Oh6dPrZh4wY; f['FullName'] = f.fldYW4Oh6dPrZh4wY; f['Full Name'] = f.fldYW4Oh6dPrZh4wY; }
  if (f.fldwHO6pmhgSxhtMU) { f['Email'] = f.fldwHO6pmhgSxhtMU; }
  if (f.fldmvzzWizaHinAMu) { f['Phone'] = f.fldmvzzWizaHinAMu; }
  if (f.fldsCFNKymtmEbVDe) { f['PIN'] = f.fldsCFNKymtmEbVDe; f['Pin'] = f.fldsCFNKymtmEbVDe; }
  if (f.fldSIYNoMW8jWfJPf) { f['Status'] = f.fldSIYNoMW8jWfJPf; }
  if (f.fldt7Uk2WdYmMemW7) { f['MeetingLink'] = f.fldt7Uk2WdYmMemW7; f['Meeting Link'] = f.fldt7Uk2WdYmMemW7; }

  if (f.fldbdDNucZwILRMwO) { f['FullName'] = f.fldbdDNucZwILRMwO; f['Name'] = f.fldbdDNucZwILRMwO; f['Full Name'] = f.fldbdDNucZwILRMwO; }
  if (f.fldxAsAn6aQDHRR9U) { f['Email'] = f.fldxAsAn6aQDHRR9U; }
  if (f.fldu8P3X4o9P4V9dn) { f['Phone'] = f.fldu8P3X4o9P4V9dn; }
  if (f.fld3C6vGWEA7RR1LM) { f['PIN'] = f.fld3C6vGWEA7RR1LM; f['Pin'] = f.fld3C6vGWEA7RR1LM; }
  if (f.fldXUKKO28Wr1dN76) { f['Status'] = f.fldXUKKO28Wr1dN76; }
  if (f.fld9Gd9q1eMuxf9MX !== undefined) { f['ClassesRemaining'] = f.fld9Gd9q1eMuxf9MX; f['Tokens'] = f.fld9Gd9q1eMuxf9MX; }
  return f
}

function getMockRecords(table: string): any[] {
  const store = readMockStore()
  const tableData = store[table] || {}
  return Object.values(tableData)
}

function saveMockRecord(table: string, record: any) {
  const store = readMockStore()
  if (!store[table]) store[table] = {}
  record.fields = normalizeFields(record.fields || {})
  store[table][record.id] = record
  writeMockStore(store)
}

function filterMockRecords(records: any[], formula: string): any[] {
  if (!formula) return records;
  const decoded = decodeURIComponent(formula);

  const eqMatch = decoded.match(/\{([^}]+)\}\s*=\s*'([^']*)'/) || decoded.match(/\{([^}]+)\}\s*=\s*"([^"]*)"/);
  if (eqMatch) {
    const [, field, val] = eqMatch;
    return records.filter(r => {
      const fVal = r.fields[field] ?? r.fields[field.toLowerCase()] ?? r.fields['FullName'] ?? r.fields['Name'] ?? r.fields['Email'] ?? r.fields['PIN'] ?? r.fields['Pin'] ?? r.fields['Phone'];
      return String(fVal || '').toLowerCase() === String(val || '').toLowerCase();
    });
  }

  const idMatch = decoded.match(/RECORD_ID\(\)\s*=\s*'([^']*)'/);
  if (idMatch) {
    return records.filter(r => r.id === idMatch[1]);
  }

  return records;
}

export async function fetchFromAirtable(table: string, params = ''): Promise<any> {
  let formula = '';
  const match = params.match(/filterByFormula=([^&]+)/);
  if (match) formula = match[1];

  if (!API_KEY) {
    const raw = getMockRecords(table);
    return { records: filterMockRecords(raw, formula) };
  }
  const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(table)}?${params}`
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${API_KEY}` },
    })
    if (!res.ok) {
      const raw = getMockRecords(table);
      return { records: filterMockRecords(raw, formula) };
    }
    return await res.json()
  } catch (err) {
    const raw = getMockRecords(table);
    return { records: filterMockRecords(raw, formula) };
  }
}

export async function findAirtableRecords(table: string, formula: string): Promise<any[]> {
  const data = await fetchFromAirtable(table, `filterByFormula=${encodeURIComponent(formula)}`)
  return data?.records || []
}

export async function fetchAirtableRecord(table: string, recordId: string): Promise<any> {
  const store = readMockStore()
  const local = store[table]?.[recordId] || null
  if (!API_KEY) return local

  const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(table)}/${recordId}`
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${API_KEY}` },
    })
    if (!res.ok) return local
    return await res.json()
  } catch (err) {
    return local
  }
}

export async function patchAirtableRecord(table: string, recordId: string, fields: Record<string, any>): Promise<any> {
  const store = readMockStore()
  const existing = store[table]?.[recordId] || { id: recordId, fields: {} }
  existing.fields = { ...existing.fields, ...fields }
  saveMockRecord(table, existing)

  if (!API_KEY) return existing

  const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(table)}/${recordId}`
  try {
    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields }),
    })
    if (!res.ok) return existing
    return res.json()
  } catch (err) {
    return existing
  }
}

export async function createAirtableRecord(table: string, fields: Record<string, any>): Promise<any> {
  const mockId = `recMock${Math.random().toString(36).substr(2, 9)}`
  const recordObj = { id: mockId, fields, createdTime: new Date().toISOString() }
  saveMockRecord(table, recordObj)

  if (!API_KEY) return recordObj

  const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(table)}`
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ records: [{ fields }], typecast: true }),
    })
    if (!res.ok) return recordObj
    const data = await res.json()
    const finalRec = data.records?.[0] || recordObj
    saveMockRecord(table, finalRec)
    return finalRec
  } catch (err) {
    return recordObj
  }
}

function deleteMockRecord(table: string, recordId: string) {
  const store = readMockStore()
  if (store[table]) delete store[table][recordId]
  writeMockStore(store)
}

export async function deleteAirtableRecord(table: string, recordId: string): Promise<any> {
  deleteMockRecord(table, recordId)
  if (!API_KEY) return { id: recordId, deleted: true }
  const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(table)}/${recordId}`
  try {
    const res = await fetch(url, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${API_KEY}` },
    })
    if (!res.ok) return { id: recordId, deleted: true }
    return res.json()
  } catch (err) {
    return { id: recordId, deleted: true }
  }
}

