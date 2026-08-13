import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchAirtableRecord, patchAirtableRecord, createAirtableRecord, fetchFromAirtable } from '@/lib/airtable'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { studentId, teacherId, rating, comment, sessionId } = req.body

  if (!studentId || !teacherId || !rating) {
    return res.status(400).json({ error: 'studentId, teacherId y rating son requeridos' })
  }

  const numericRating = Number(rating)
  if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
    return res.status(400).json({ error: 'Rating debe ser un número entre 1 y 5' })
  }

  try {
    // 1. Persist the review in Airtable (table: "Teacher Reviews")
    //    Fields: Student (linked), Teacher (linked), Rating (number), Comment (text), Session (linked), Date
    const reviewFields: Record<string, any> = {
      'Student': [studentId],
      'Teacher': [teacherId],
      'Rating': numericRating,
      'Comment': comment || '',
      'Review Date': new Date().toISOString().split('T')[0],
    }
    if (sessionId) {
      reviewFields['Session'] = [sessionId]
    }

    await createAirtableRecord('Teacher Reviews', reviewFields)

    // 2. Update the rolling average rating on the Teacher record
    const teacherData = await fetchFromAirtable(
      'Teacher Reviews',
      `filterByFormula=${encodeURIComponent(`FIND('${teacherId}', ARRAYJOIN({Teacher}, ',')) > 0`)}&fields[]=Rating`
    )
    const allRatings = (teacherData.records ?? [])
      .map((r: any) => Number(r.fields['Rating']))
      .filter((n: number) => !isNaN(n))

    if (allRatings.length > 0) {
      const avg = allRatings.reduce((a: number, b: number) => a + b, 0) / allRatings.length
      await patchAirtableRecord('Teachers', teacherId, {
        'Average Rating': Math.round(avg * 10) / 10
      })
    }

    console.log(`[Review] Teacher: ${teacherId}, Student: ${studentId}, Rating: ${numericRating}`)
    return res.status(200).json({ ok: true, message: 'Calificación guardada' })
  } catch (err: any) {
    // If the "Teacher Reviews" table doesn't exist yet, log gracefully
    console.error('[rate-teacher] Error saving review:', err.message)
    return res.status(500).json({ error: 'No se pudo guardar la calificación', detail: err.message })
  }
}
