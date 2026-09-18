import 'server-only'
import { sendEmail } from './client'
import {
  applicationReceivedEmail,
  invitationEmail,
  activatedEmail,
  rejectionEmail,
  certificateIssuedEmail,
} from './templates'

export async function sendApplicationReceived(
  to: string,
  name: string
): Promise<{ success: boolean; error?: string }> {
  const t = applicationReceivedEmail(name)
  const res = await sendEmail({
    to,
    toName: name,
    subject: t.subject,
    htmlContent: t.html,
    replyTo: process.env.BREVO_SENDER_EMAIL,
  })
  return res.success ? { success: true } : { success: false, error: res.error }
}

export async function sendInvitation(input: {
  to: string
  fullName: string | null
  token: string
  role?: string | null
  startDate?: string | null
  welcomeMessage?: string | null
}): Promise<{ success: boolean; error?: string }> {
  const t = invitationEmail({
    fullName: input.fullName,
    token: input.token,
    role: input.role ?? 'intern',
    startDate: input.startDate,
    welcomeMessage: input.welcomeMessage,
  })
  const res = await sendEmail({
    to: input.to,
    toName: input.fullName ?? undefined,
    subject: t.subject,
    htmlContent: t.html,
    replyTo: process.env.BREVO_SENDER_EMAIL,
  })
  return res.success ? { success: true } : { success: false, error: res.error }
}

export async function sendActivated(input: {
  to: string
  fullName: string | null
  mentorName: string | null
}): Promise<{ success: boolean; error?: string }> {
  const t = activatedEmail(input)
  const res = await sendEmail({
    to: input.to,
    toName: input.fullName ?? undefined,
    subject: t.subject,
    htmlContent: t.html,
    replyTo: process.env.BREVO_SENDER_EMAIL,
  })
  return res.success ? { success: true } : { success: false, error: res.error }
}

export async function sendRejection(
  to: string,
  name: string
): Promise<{ success: boolean; error?: string }> {
  const t = rejectionEmail(name)
  const res = await sendEmail({
    to,
    toName: name,
    subject: t.subject,
    htmlContent: t.html,
    replyTo: process.env.BREVO_SENDER_EMAIL,
  })
  return res.success ? { success: true } : { success: false, error: res.error }
}


export async function sendCertificateIssued(input: {
  to: string
  fullName: string | null
  certificateId: string
  score: number
  verifyUrl: string
}): Promise<{ success: boolean; error?: string }> {
  const t = certificateIssuedEmail(input)
  const res = await sendEmail({
    to: input.to,
    toName: input.fullName ?? undefined,
    subject: t.subject,
    htmlContent: t.html,
    replyTo: process.env.BREVO_SENDER_EMAIL,
  })
  return res.success ? { success: true } : { success: false, error: res.error }
}