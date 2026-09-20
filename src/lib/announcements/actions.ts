'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { createNotification } from '@/lib/notifications/create'
import { sendAnnouncementEmail } from '@/lib/email/send'

export type Audience = 'everyone' | 'interns' | 'mentors' | 'specific'

/**
 * Admin-only: send an announcement.
 * Resolves recipients, inserts announcement + recipients,
 * fires in-app notifications, optionally sends emails.
 */
export async function sendAnnouncement(input: {
  subject: string
  body: string
  audience: Audience
  specificUserIds?: string[]
  sendEmail: boolean
}): Promise<
  | { success: true; announcementId: string; recipientCount: number }
  | { error: string }
> {
  const subject = input.subject?.trim()
  const body = input.body?.trim()
  if (!subject) return { error: 'Subject is required' }
  if (!body) return { error: 'Message is required' }
  if (subject.length > 200) return { error: 'Subject is too long' }
  if (body.length > 10000) return { error: 'Message is too long' }

  // Verify admin
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const admin = createAdminClient()

  const { data: me } = await admin
    .from('profiles')
    .select('id, role, full_name, email')
    .eq('id', user.id)
    .single()

  if (!me || (me.role !== 'admin' && me.role !== 'super_admin')) {
    return { error: 'Only admins can send announcements' }
  }

  // Resolve recipients
  let recipientIds: string[] = []

    if (input.audience === 'everyone') {
    const { data } = await admin
      .from('profiles')
      .select('id')
      .in('role', ['intern', 'mentor', 'admin', 'super_admin'])
      .eq('status', 'active')
      .eq('is_demo', false)
    recipientIds = (data ?? []).map((r) => r.id)
  } else if (input.audience === 'interns') {
    const { data } = await admin
      .from('profiles')
      .select('id')
      .eq('role', 'intern')
      .eq('status', 'active')
      .eq('is_demo', false)
    recipientIds = (data ?? []).map((r) => r.id)
  } else if (input.audience === 'mentors') {
    const { data } = await admin
      .from('profiles')
      .select('id')
      .in('role', ['mentor', 'admin', 'super_admin'])
      .eq('status', 'active')
      .eq('is_demo', false)
    recipientIds = (data ?? []).map((r) => r.id)
  } else if (input.audience === 'specific') {
    recipientIds = (input.specificUserIds ?? []).filter(Boolean)
  }

  if (recipientIds.length === 0) {
    return { error: 'No recipients match this audience' }
  }

  // Insert announcement
  const { data: ann, error: annError } = await admin
    .from('announcements')
    .insert({
      sender_id: user.id,
      subject,
      body,
      audience: input.audience,
      sent_via_email: input.sendEmail,
      recipient_count: recipientIds.length,
    })
    .select('id')
    .single()

  if (annError || !ann) {
    console.error('sendAnnouncement insert error:', annError)
    return { error: annError?.message ?? 'Failed to create announcement' }
  }

  // Insert recipients
  const recipientRows = recipientIds.map((id) => ({
    announcement_id: ann.id,
    user_id: id,
  }))
  const { error: recipError } = await admin
    .from('announcement_recipients')
    .insert(recipientRows)

  if (recipError) {
    console.error('sendAnnouncement recipients error:', recipError)
    return { error: recipError.message }
  }

  // In-app notification to each recipient
  for (const rid of recipientIds) {
    createNotification({
      userId: rid,
      type: 'announcement' as any,
      title: `📢 ${subject}`,
      body: body.length > 100 ? body.slice(0, 100) + '…' : body,
      link: `/dashboard/announcements/${ann.id}`, // admin/mentor dashboards redirect appropriately
      metadata: { announcementId: ann.id },
    }).catch((err) => console.error('Announcement notif failed:', err))
  }

  // Email sending (only if requested)
  let emailSent = 0
  if (input.sendEmail) {
    const { data: recipients } = await admin
      .from('profiles')
      .select('id, email, full_name')
      .in('id', recipientIds)

    const senderName = me.full_name ?? me.email
    const senderEmail = me.email

    // Send sequentially to stay within Brevo rate limits
    for (const r of recipients ?? []) {
      if (!r.email) continue
      const res = await sendAnnouncementEmail({
        to: r.email,
        recipientName: r.full_name,
        subject,
        body,
        senderName,
        senderEmail,
      })
      if (res.success) emailSent++
    }

    await admin
      .from('announcements')
      .update({ email_sent_count: emailSent })
      .eq('id', ann.id)
  }

  // Audit
  await admin.from('audit_log').insert({
    actor_id: user.id,
    action: 'announcement.sent',
    entity: 'announcements',
    entity_id: ann.id,
    metadata: {
      audience: input.audience,
      recipientCount: recipientIds.length,
      emailSent,
    },
  })

  revalidatePath('/admin/announcements')
  revalidatePath('/dashboard/announcements')
  revalidatePath('/mentor/announcements')

  return {
    success: true,
    announcementId: ann.id,
    recipientCount: recipientIds.length,
  }
}

/**
 * Mark an announcement as read for the current user.
 */
export async function markAnnouncementRead(
  announcementId: string
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const admin = createAdminClient()

  const { error } = await admin
    .from('announcement_recipients')
    .update({ read_at: new Date().toISOString() })
    .eq('announcement_id', announcementId)
    .eq('user_id', user.id)
    .is('read_at', null)

  if (error) {
    console.error('markAnnouncementRead error:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard/announcements')
  revalidatePath('/mentor/announcements')
  revalidatePath(`/dashboard/announcements/${announcementId}`)

  return { success: true }
}

/**
 * Admin-only: delete an announcement.
 * Only allowed within 1 hour of sending.
 */
export async function deleteAnnouncement(
  announcementId: string
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const admin = createAdminClient()

  const { data: me } = await admin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!me || (me.role !== 'admin' && me.role !== 'super_admin')) {
    return { error: 'Only admins can delete announcements' }
  }

  const { data: ann } = await admin
    .from('announcements')
    .select('id, created_at')
    .eq('id', announcementId)
    .single()

  if (!ann) return { error: 'Announcement not found' }

  const ageMs = Date.now() - new Date(ann.created_at).getTime()
  if (ageMs > 60 * 60 * 1000) {
    return { error: 'Announcements can only be deleted within 1 hour' }
  }

  const { error } = await admin
    .from('announcements')
    .delete()
    .eq('id', announcementId)

  if (error) return { error: error.message }

  revalidatePath('/admin/announcements')
  return { success: true }
}