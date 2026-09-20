'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Returns the total unread message count for the current user across all threads.
 * Used by the sidebar badge.
 */
export async function getUnreadMessageCount(): Promise<number> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return 0

  const admin = createAdminClient()

  // 1. Which threads can this user access?
  const { data: me } = await admin
    .from('profiles')
    .select('id, role, mentor_id')
    .eq('id', user.id)
    .single()

  if (!me) return 0

  let threadIds: string[] = []

  if (me.role === 'intern' && me.mentor_id) {
    const { data: threads } = await admin
      .from('threads')
      .select('id')
      .or(
        `and(type.eq.mentor_intern,intern_id.eq.${me.id},mentor_id.eq.${me.mentor_id}),` +
          `and(type.eq.mentor_team,mentor_id.eq.${me.mentor_id})`
      )
    threadIds = (threads ?? []).map((t) => t.id)
  } else if (me.role === 'mentor') {
    const { data: threads } = await admin
      .from('threads')
      .select('id')
      .eq('mentor_id', me.id)
    threadIds = (threads ?? []).map((t) => t.id)
  } else if (me.role === 'admin' || me.role === 'super_admin') {
    const { data: threads } = await admin.from('threads').select('id')
    threadIds = (threads ?? []).map((t) => t.id)
  } else {
    return 0
  }

  if (threadIds.length === 0) return 0

  // 2. Fetch my read timestamps
  const { data: reads } = await admin
    .from('thread_reads')
    .select('thread_id, last_read_at')
    .eq('user_id', user.id)
    .in('thread_id', threadIds)

  const readByThread = new Map<string, string>()
  for (const r of reads ?? []) {
    readByThread.set(r.thread_id, r.last_read_at)
  }

  // 3. Count messages I haven't read, excluding my own
  const { data: messages } = await admin
    .from('messages')
    .select('thread_id, created_at')
    .in('thread_id', threadIds)
    .neq('sender_id', user.id)
    .is('deleted_at', null)

  let count = 0
  for (const m of messages ?? []) {
    const lastRead = readByThread.get(m.thread_id) ?? '1970-01-01'
    if (m.created_at > lastRead) count++
  }

  return count
}