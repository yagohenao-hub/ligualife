import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchAirtableRecord, patchAirtableRecord } from '@/lib/airtable'
import { supabase } from '@/lib/supabaseClient'

const REVIEW_MARKER = '=== TEACHER_REVIEWS_JSON ==='

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

  const reviewEntry = {
    studentId,
    teacherId,
    rating: numericRating,
    comment: comment || '',
    sessionId: sessionId || null,
    createdAt: new Date().toISOString()
  }

  try {
    // 1. Try dedicated teacher_reviews table if it exists in Postgres
    const { error: insertErr } = await supabase
      .from('teacher_reviews')
      .insert([{
        Student: studentId,
        Teacher: teacherId,
        Rating: numericRating,
        Comment: comment || '',
        Session: sessionId || null,
        'Review Date': reviewEntry.createdAt.split('T')[0]
      }])

    if (!insertErr) {
      return res.status(200).json({ ok: true, message: 'Calificación guardada', storage: 'teacher_reviews' })
    }

    // 2. Clean fallback in student_teacher.Notes (guaranteed column in schema_17_tables.sql)
    const { data: stRows } = await supabase
      .from('student_teacher')
      .select('id, "Notes"')
      .ilike('Student', `%${studentId}%`)
      .ilike('Teacher', `%${teacherId}%`)
      .order('created_at', { ascending: false })
      .limit(1)

    if (stRows && stRows.length > 0) {
      const targetRow = stRows[0]
      const currentNotes = String(targetRow.Notes || '')
      let reviewsList: any[] = []
      let baseText = currentNotes

      if (currentNotes.includes(REVIEW_MARKER)) {
        const parts = currentNotes.split(REVIEW_MARKER)
        baseText = parts[0].trim()
        const jsonPart = parts[1].split('\n=== ')[0].trim()
        try { reviewsList = JSON.parse(jsonPart) } catch { reviewsList = [] }
      }

      if (!Array.isArray(reviewsList)) reviewsList = []
      reviewsList.push(reviewEntry)

      const updatedNotes = baseText
        ? `${baseText}\n\n${REVIEW_MARKER}\n${JSON.stringify(reviewsList)}`
        : `${REVIEW_MARKER}\n${JSON.stringify(reviewsList)}`

      await supabase
        .from('student_teacher')
        .update({ Notes: updatedNotes })
        .eq('id', targetRow.id)

      return res.status(200).json({ ok: true, message: 'Calificación guardada', storage: 'student_teacher' })
    }

    // 3. Secondary fallback in students.Notes without disturbing MASTERY_PROGRESS_JSON
    const student = await fetchAirtableRecord('Students', studentId)
    if (student) {
      const currentNotes = String(student.fields?.['Notes'] || '')
      let reviewsList: any[] = []
      let updatedNotes = currentNotes

      if (currentNotes.includes(REVIEW_MARKER)) {
        const [before, after] = currentNotes.split(REVIEW_MARKER)
        const nextMarkerIdx = after.indexOf('\n=== ')
        const jsonRaw = (nextMarkerIdx >= 0 ? after.slice(0, nextMarkerIdx) : after).trim()
        const tail = nextMarkerIdx >= 0 ? after.slice(nextMarkerIdx) : ''
        try { reviewsList = JSON.parse(jsonRaw) } catch { reviewsList = [] }
        if (!Array.isArray(reviewsList)) reviewsList = []
        reviewsList.push(reviewEntry)
        updatedNotes = `${before.trim()}\n\n${REVIEW_MARKER}\n${JSON.stringify(reviewsList)}${tail}`
      } else {
        reviewsList = [reviewEntry]
        updatedNotes = `${currentNotes.trim()}\n\n${REVIEW_MARKER}\n${JSON.stringify(reviewsList)}`.trim()
      }

      await patchAirtableRecord('Students', studentId, { Notes: updatedNotes })
    }

    return res.status(200).json({ ok: true, message: 'Calificación guardada', storage: 'students' })
  } catch (err: any) {
    console.error('[rate-teacher] Error saving review:', err.message)
    return res.status(500).json({ error: 'No se pudo guardar la calificación', detail: err.message })
  }
}
