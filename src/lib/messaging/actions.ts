'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { createNotification } from '@/lib/notifications/create'

/**
 * Send a message in a thread.
 * RLS enforces that the sender is a member of the thread.
 */
export async function sendMessage(input: {
  threadId: string
  body: string
  fileUrl?: string | null
  fileName?: string | null
}): Promise<{ success: true; messageId: string } | { error: string }> {
  const body = input.body?.trim()
  if (!body) return { error: 'Message cannot be empty' }
  if (body.length > 5000) return { error: 'Message is too long' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const admin = createAdminClient()

  // Verify access
  const { data: membership } = await admin.rpc('is_thread_member', {
    p_thread_id: input.threadId,
  })
  if (!membership) return { error: 'You do not have access to this thread' }

  const { data: inserted, error } = await supabase
    .from('messages')
    .insert({
      thread_id: input.threadId,
      sender_id: user.id,
      body,
      file_url: input.fileUrl ?? null,
      file_name: input.fileName ?? null,
    })
    .select('id')
    .single()

  if (error || !inserted) {
    console.error('sendMessage error:', error)
    return { error: error?.message ?? 'Failed to send message' }
  }

  // Fetch thread to notify the right people
  const { data: thread } = await admin
    .from('threads')
    .select('id, type, mentor_id, intern_id')
    .eq('id', input.threadId)
    .single()

  if (thread) {
    const { data: sender } = await admin
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single()

    const senderName = sender?.full_name ?? sender?.email ?? 'Someone'
    const preview = body.length > 60 ? body.slice(0, 60) + '…' : body

    if (thread.type === 'mentor_intern') {
      // Notify the other party
      const recipientId =
        user.id === thread.intern_id ? thread.mentor_id : thread.intern_id
      if (recipientId) {
        createNotification({
          userId: recipientId,
          type: 'message' as any, // new type — falls back to generic if not mapped
          title: `💬 ${senderName}`,
          body: preview,
          link: `/dashboard/messages/${thread.id}`,
          metadata: { threadId: thread.id, senderId: user.id },
        }).catch((err) => console.error('Notification failed:', err))
      }
    } else if (thread.type === 'mentor_team') {
      // Notify all interns currently assigned to this mentor
      if (thread.mentor_id) {
        const { data: teamInterns } = await admin
          .from('profiles')
          .select('id')
          .eq('role', 'intern')
          .eq('mentor_id', thread.mentor_id)
          .neq('id', user.id)

        for (const i of teamInterns ?? []) {
          createNotification({
            userId: i.id,
            type: 'message' as any,
            title: `💬 Team · ${senderName}`,
            body: preview,
            link: `/dashboard/messages/${thread.id}`,
            metadata: { threadId: thread.id },
          }).catch((err) => console.error('Notification failed:', err))
        }
      }
    } else if (thread.type === 'mentor_admin') {
      // Notify all mentors + admins except sender
      const { data: staff } = await admin
        .from('profiles')
        .select('id')
        .in('role', ['mentor', 'admin', 'super_admin'])
        .neq('id', user.id)

      for (const s of staff ?? []) {
        createNotification({
          userId: s.id,
          type: 'message' as any,
          title: `💬 Mentor room · ${senderName}`,
          body: preview,
          link: `/mentor/messages/${thread.id}`,
          metadata: { threadId: thread.id },
        }).catch((err) => console.error('Notification failed:', err))
      }
    }
  }

  // Revalidate
  revalidatePath('/dashboard/messages')
  revalidatePath('/mentor/messages')
  revalidatePath(`/dashboard/messages/${input.threadId}`)
  revalidatePath(`/mentor/messages/${input.threadId}`)

  return { success: true, messageId: inserted.id }
}

/**
 * Mark a thread as read for the current user.
 * Updates thread_reads.last_read_at = now().
 */
export async function markThreadRead(
  threadId: string
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const admin = createAdminClient()

  const { data: membership } = await admin.rpc('is_thread_member', {
    p_thread_id: threadId,
  })
  if (!membership) return { error: 'No access' }

  const { error } = await admin.from('thread_reads').upsert(
    {
      thread_id: threadId,
      user_id: user.id,
      last_read_at: new Date().toISOString(),
    },
    { onConflict: 'thread_id,user_id' }
  )

  if (error) {
    console.error('markThreadRead error:', error)
    return { error: error.message }
  }

  return { success: true }
}

/**
 * Delete a message. Only the sender, only within 5 minutes.
 * Soft delete: sets deleted_at, keeps the row for audit.
 */
export async function deleteMessage(
  messageId: string
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const admin = createAdminClient()
  const { data: msg } = await admin
    .from('messages')
    .select('id, thread_id, sender_id, created_at')
    .eq('id', messageId)
    .single()

  if (!msg) return { error: 'Message not found' }
  if (msg.sender_id !== user.id) return { error: 'Not your message' }

  const ageMs = Date.now() - new Date(msg.created_at).getTime()
  if (ageMs > 5 * 60 * 1000) {
    return { error: 'Can only delete messages within 5 minutes' }
  }

  const { error } = await admin
    .from('messages')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', messageId)

  if (error) return { error: error.message }

  revalidatePath(`/dashboard/messages/${msg.thread_id}`)
  revalidatePath(`/mentor/messages/${msg.thread_id}`)

  return { success: true }
}