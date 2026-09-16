import 'server-only'
import { BrevoClient } from '@getbrevo/brevo'

export type EmailPayload = {
  to: string
  toName?: string
  subject: string
  htmlContent: string
  textContent?: string
  replyTo?: string
}

export async function sendEmail(
  payload: EmailPayload
): Promise<{ success: true } | { success: false; error: string }> {
  const apiKey = process.env.BREVO_API_KEY
  const senderEmail = process.env.BREVO_SENDER_EMAIL
  const senderName = process.env.BREVO_SENDER_NAME

  if (!apiKey || !senderEmail || !senderName) {
    console.error('Email env vars missing')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const brevo = new BrevoClient({ apiKey })

    await brevo.transactionalEmails.sendTransacEmail({
      subject: payload.subject,
      htmlContent: payload.htmlContent,
      textContent: payload.textContent ?? stripHtml(payload.htmlContent),
      sender: { email: senderEmail, name: senderName },
      to: [{ email: payload.to, name: payload.toName ?? payload.to }],
      ...(payload.replyTo && { replyTo: { email: payload.replyTo } }),
    })

    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Brevo send error:', message)
    return { success: false, error: message }
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>.*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}