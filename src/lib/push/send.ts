import 'server-only'
import webpush from 'web-push'
import { createAdminClient } from '@/lib/supabase/admin'

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ''
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY ?? ''
const VAPID_SUBJECT = process.env.VAPID_SUBJECT ?? 'mailto:infohermansoftware@gmail.com'

let configured = false
function ensureConfigured() {
  if (configured) return true
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
    console.warn('[push] VAPID keys not set — push disabled')
    return false
  }
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE)
  configured = true
  return true
}

/**
 * Send a push notification to every subscription belonging to `userId`.
 * Silently drops invalid subscriptions (404/410 responses).
 */
export async function sendPushToUser(
  userId: string,
  payload: {
    title: string
    body: string
    url?: string
    tag?: string
    priority?: 'normal' | 'high'
  }
): Promise<{ sent: number; failed: number }> {
  if (!ensureConfigured()) return { sent: 0, failed: 0 }

  const admin = createAdminClient()
  const { data: subs } = await admin
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth')
    .eq('user_id', userId)

  if (!subs || subs.length === 0) return { sent: 0, failed: 0 }

  // Determine priority from tag if not explicitly set
  const highPriorityTags = [
    'task_assigned',
    'message',
    'announcement',
    'certificate_issued',
    'mentor_assigned',
  ]
  const priority =
    payload.priority ??
    (payload.tag && highPriorityTags.includes(payload.tag) ? 'high' : 'normal')

  let sent = 0
  let failed = 0

  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        JSON.stringify({
          title: payload.title,
          body: payload.body,
          url: payload.url,
          tag: payload.tag,
          priority,
        }),
        {
          // Web Push priority hints (best-effort)
          TTL: 60 * 60 * 24, // 24 hours
          urgency: priority === 'high' ? 'high' : 'normal',
        }
      )
      sent++
    } catch (err: any) {
      failed++
      const status = err?.statusCode
      if (status === 404 || status === 410) {
        // Dead subscription — remove
        await admin.from('push_subscriptions').delete().eq('id', sub.id)
      } else {
        console.error('[push] send failed:', err?.message ?? err)
      }
    }
  }

  return { sent, failed }
}