const BASE_ID = process.env.AIRTABLE_BASE_ID!
const API_KEY = process.env.AIRTABLE_API_KEY!

export async function fetchFromAirtable(table: string, params = ''): Promise<any> {
  const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(table)}?${params}`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  })
  if (!res.ok) throw new Error(`Airtable error: ${res.status}`)
  return res.json()
}

export async function fetchAirtableRecord(table: string, recordId: string): Promise<any> {
  const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(table)}/${recordId}`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`Airtable error: ${res.status}`)
  return res.json()
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
    body: JSON.stringify({ fields }),
  })
  if (!res.ok) throw new Error(`Airtable POST error: ${res.status}`)
  return res.json()
}
