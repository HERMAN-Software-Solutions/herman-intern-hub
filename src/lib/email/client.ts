import 'server-only'
import * as SibApiV3Sdk from '@getbrevo/brevo'

export type EmailPayload = {
  to: string
  toName?: string
  subject: string
  htmlContent: string
  textContent?: string
  replyTo?: string
}

/**
 * Sends a transactional email via Brevo.
 * Returns { success } or { error } — never throws.
 */
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
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi()
    apiInstance.setApiKey(
      SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
      apiKey
    )

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail()
    sendSmtpEmail.subject = payload.subject
    sendSmtpEmail.htmlContent = payload.htmlContent
    sendSmtpEmail.textContent = payload.textContent ?? stripHtml(payload.htmlContent)
    sendSmtpEmail.sender = { email: senderEmail, name: senderName }
    sendSmtpEmail.to = [
      { email: payload.to, name: payload.toName ?? payload.to },
    ]
    if (payload.replyTo) {
      sendSmtpEmail.replyTo = { email: payload.replyTo }
    }

    await apiInstance.sendTransacEmail(sendSmtpEmail)
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