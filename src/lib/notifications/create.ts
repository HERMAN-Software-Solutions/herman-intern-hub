import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'

export type NotificationType =
  | 'task_assigned'
  | 'submission_received'
  | 'submission_approved'
  | 'revision_requested'
  | 'application_received'
  | 'mentor_assigned'
  | 'certificate_issued'
  | 'weekly_report_ready'
  | 'announcement'

export async function createNotification(input: {
  userId: string
  type: NotificationType
  title: string
  body?: string
  link?: string
  metadata?: Record<string, unknown>
}) {
  try {
    const supabase = createAdminClient()

    const { error } = await supabase.from('notifications').insert({
      user_id: input.userId,
      type: input.type,
      title: input.title,
      body: input.body ?? null,
      link: input.link ?? null,
      metadata: input.metadata ?? {},
    })

    if (error) {
      console.error('Notification insert failed:', error)
      return { success: false, error: error.message }
    }

    // Fire push notification (fire-and-forget) — dynamic import keeps
    // web-push out of the client bundle
    import('@/lib/push/send')
      .then(({ sendPushToUser }) =>
        sendPushToUser(input.userId, {
          title: input.title,
          body: input.body ?? '',
          url: input.link,
          tag: input.type,
        })
      )
      .catch((err) => console.error('Push notification failed:', err))

    return { success: true }
  } catch (err) {
    console.error('Notification error:', err)
    return { success: false, error: 'Unexpected error' }
  }
}

/**
 * Notify all admins + super_admins.
 */
export async function notifyAdmins(input: {
  type: NotificationType
  title: string
  body?: string
  link?: string
  metadata?: Record<string, unknown>
}) {
  const supabase = createAdminClient()

  const { data: admins } = await supabase
    .from('profiles')
    .select('id')
    .in('role', ['admin', 'super_admin'])

  if (!admins || admins.length === 0) return

  const rows = admins.map((a) => ({
    user_id: a.id,
    type: input.type,
    title: input.title,
    body: input.body ?? null,
    link: input.link ?? null,
    metadata: input.metadata ?? {},
  }))

  await supabase.from('notifications').insert(rows)

  // Fire push to each admin (fire-and-forget)
  import('@/lib/push/send')
    .then(({ sendPushToUser }) =>
      Promise.all(
        admins.map((a) =>
          sendPushToUser(a.id, {
            title: input.title,
            body: input.body ?? '',
            url: input.link,
            tag: input.type,
          })
        )
      )
    )
    .catch((err) => console.error('Admin push notification failed:', err))
}