import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { studentId, teacherId, rating, comment } = req.body
  
  // En un entorno de producción, guardaríamos este rating en Airtable
  // (por ej. en la tabla Teacher o una nueva tabla de Reviews).
  // Para MVP devolvemos ok.
  
  if (!studentId || !teacherId) return res.status(400).json({ error: 'Missing data' })

  console.log(`[Review] Teacher: ${teacherId}, Student: ${studentId}, Rating: ${rating}, Comment: ${comment}`)

  return res.status(200).json({ ok: true })
}
