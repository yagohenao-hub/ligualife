/**
 * Notification utility — placeholder for WhatsApp + Email integrations.
 * All TODO: INTEGRATION markers indicate where to plug in Twilio / SendGrid / Resend.
 */

export interface NotifyPayload {
  recipientPhone?: string | null
  recipientEmail?: string | null
  recipientName?: string | null
  message: string
}

export async function sendWhatsApp(payload: NotifyPayload) {
  // TODO: INTEGRATION — Twilio WhatsApp API
  // const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN)
  // await client.messages.create({
  //   from: 'whatsapp:+1415xxxxxxx',
  //   to:   `whatsapp:${payload.recipientPhone}`,
  //   body: payload.message,
  // })
  console.log(`[WhatsApp → ${payload.recipientPhone}] ${payload.message}`)
}

export async function sendEmail(payload: NotifyPayload) {
  // TODO: INTEGRATION — SendGrid / Resend
  // await resend.emails.send({
  //   from: 'noreply@lingualife.co',
  //   to:   payload.recipientEmail!,
  //   subject: 'LinguaLife — Notificación de Clase',
  //   text:  payload.message,
  // })
  console.log(`[Email → ${payload.recipientEmail}] ${payload.message}`)
}

export async function notifyReschedule(opts: {
  studentName: string
  teacherName: string | null
  teacherPhone?: string | null
  teacherEmail?: string | null
  sessionDate: string
  canceledBy: 'student' | 'teacher'
}) {
  const { studentName, teacherName, teacherPhone, teacherEmail, sessionDate, canceledBy } = opts

  const msgToTeacher = canceledBy === 'student'
    ? `📅 LinguaLife: ${studentName} ha reagendado su clase del ${sessionDate}. Se le ha asignado un token de reposición para agendar una nueva fecha.`
    : `📅 LinguaLife: Has reagendado tu clase con ${studentName} del ${sessionDate}.`

  if (teacherPhone) await sendWhatsApp({ recipientPhone: teacherPhone, message: msgToTeacher })
  if (teacherEmail) await sendEmail({ recipientEmail: teacherEmail, message: msgToTeacher })
}
