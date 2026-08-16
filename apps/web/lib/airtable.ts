const BASE_ID = process.env.AIRTABLE_BASE_ID!
const API_KEY = process.env.AIRTABLE_API_KEY!

export async function fetchFromAirtable(table: string, params = ''): Promise<any> {
  const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(table)}?${params}`
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${API_KEY}` },
    })
    if (!res.ok) {
      console.error(`Airtable error (${table}): ${res.status} ${res.statusText}`);
      return null;
    }
    return await res.json()
  } catch (err) {
    console.error(`Airtable network error (${table}):`, err);
    return null;
  }
}

export async function findAirtableRecords(table: string, formula: string): Promise<any[]> {
  const params = `filterByFormula=${encodeURIComponent(formula)}`
  const data = await fetchFromAirtable(table, params)
  return data?.records || []
}

export async function fetchAirtableRecord(table: string, recordId: string): Promise<any> {
  const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(table)}/${recordId}`
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${API_KEY}` },
    })
    if (!res.ok) return null
    return await res.json()
  } catch (err) {
    return null
  }
}

export async function patchAirtableRecord(table: string, recordId: string, fields: Record<string, any>): Promise<any> {
  const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(table)}/${recordId}`
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields }),
  })
  if (!res.ok) throw new Error(`Airtable PATCH error: ${res.status}`)
  return res.json()
}

export async function createAirtableRecord(table: string, fields: Record<string, any>): Promise<any> {
  const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(table)}`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields, typecast: true }),
  })
  if (!res.ok) throw new Error(`Airtable POST error: ${res.status}`)
  return res.json()
}

export async function deleteAirtableRecord(table: string, recordId: string): Promise<any> {
  const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(table)}/${recordId}`
  const res = await fetch(url, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${API_KEY}` },
  })
  if (!res.ok) throw new Error(`Airtable DELETE error: ${res.status}`)
  return res.json()
}

