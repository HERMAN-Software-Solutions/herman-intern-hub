import 'server-only'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export type ThreadSummary = {
  id: string
  type: 'mentor_intern' | 'mentor_team' | 'mentor_admin'
  mentor_id: string | null
  intern_id: string | null
  updated_at: string
  title: string
  subtitle: string | null
  lastMessageAt: string | null
  lastMessagePreview: string | null
  unreadCount: number
}

export type Message = {
  id: string
  thread_id: string
  sender_id: string
  body: string
  file_url: string | null
  file_name: string | null
  created_at: string
  deleted_at: string | null
  sender: {
    id: string
    full_name: string | null
    email: string
    avatar_url: string | null
  } | null
}

export async function getMyThreads(): Promise<ThreadSummary[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const admin = createAdminClient()

  const { data: me } = await admin
    .from('profiles')
    .select('id, role, mentor_id')
    .eq('id', user.id)
    .single()

  if (!me) return []

  let threadQuery = admin
    .from('threads')
    .select('id, type, mentor_id, intern_id, updated_at')

  if (me.role === 'intern') {
    if (me.mentor_id) {
      threadQuery = threadQuery.or(
        `and(type.eq.mentor_intern,intern_id.eq.${me.id},mentor_id.eq.${me.mentor_id}),` +
          `and(type.eq.mentor_team,mentor_id.eq.${me.mentor_id})`
      )
    } else {
      return []
    }
  } else if (me.role === 'mentor') {
    threadQuery = threadQuery.eq('mentor_id', me.id)
  } else if (me.role === 'admin' || me.role === 'super_admin') {
    // admins see all
  } else {
    return []
  }

  const { data: threads } = await threadQuery.order('updated_at', {
    ascending: false,
  })

  if (!threads || threads.length === 0) return []

  const threadIds = threads.map((t) => t.id)

  const { data: recentMessages } = await admin
    .from('messages')
    .select('thread_id, body, created_at')
    .in('thread_id', threadIds)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  const lastByThread = new Map<
    string,
    { body: string; created_at: string }
  >()
  for (const m of recentMessages ?? []) {
    if (!lastByThread.has(m.thread_id)) {
      lastByThread.set(m.thread_id, {
        body: m.body,
        created_at: m.created_at,
      })
    }
  }

  const { data: reads } = await admin
    .from('thread_reads')
    .select('thread_id, last_read_at')
    .eq('user_id', me.id)
    .in('thread_id', threadIds)

  const readByThread = new Map<string, string>()
  for (const r of reads ?? []) {
    readByThread.set(r.thread_id, r.last_read_at)
  }

  const unread = new Map<string, number>()
  for (const t of threads) {
    const lastRead = readByThread.get(t.id) ?? '1970-01-01'
    const count = (recentMessages ?? []).filter(
      (m) => m.thread_id === t.id && m.created_at > lastRead
    ).length
    unread.set(t.id, count)
  }

  const profileIds = new Set<string>()
  for (const t of threads) {
    if (t.mentor_id) profileIds.add(t.mentor_id)
    if (t.intern_id) profileIds.add(t.intern_id)
  }

  const { data: profiles } = await admin
    .from('profiles')
    .select('id, full_name, email')
    .in('id', Array.from(profileIds))

  const nameById = new Map<string, string>()
  for (const p of profiles ?? []) {
    nameById.set(p.id, p.full_name ?? p.email)
  }

  return threads.map((t) => {
    const last = lastByThread.get(t.id)
    const mentorName = t.mentor_id ? nameById.get(t.mentor_id) : null
    const internName = t.intern_id ? nameById.get(t.intern_id) : null

    let title: string
    let subtitle: string | null = null

    if (t.type === 'mentor_intern') {
      if (me.role === 'intern') {
        title = mentorName ?? 'Your mentor'
      } else {
        title = internName ?? 'Intern'
      }
    } else if (t.type === 'mentor_team') {
      title = `${mentorName ?? 'Mentor'}'s team`
      subtitle = 'Team chat'
    } else {
      title = 'Mentor room'
      subtitle = 'Mentors + admins'
    }

    return {
      id: t.id,
      type: t.type,
      mentor_id: t.mentor_id,
      intern_id: t.intern_id,
      updated_at: t.updated_at,
      title,
      subtitle,
      lastMessageAt: last?.created_at ?? null,
      lastMessagePreview: last?.body
        ? last.body.length > 80
          ? last.body.slice(0, 80) + '…'
          : last.body
        : null,
      unreadCount: unread.get(t.id) ?? 0,
    }
  })
}

export async function getThreadMessages(
  threadId: string,
  limit = 100
): Promise<Message[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const admin = createAdminClient()

  const { data: membership } = await admin.rpc('is_thread_member_for_user', {
    p_thread_id: threadId,
    p_user_id: user.id,
  })
  if (!membership) return []

  const { data } = await admin
    .from('messages')
    .select(
      `id, thread_id, sender_id, body, file_url, file_name, created_at, deleted_at,
       sender:sender_id (id, full_name, email, avatar_url)`
    )
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true })
    .limit(limit)

  return (data ?? []).map((m: any) => {
    const senderRaw = m.sender
    const sender = Array.isArray(senderRaw) ? senderRaw[0] : senderRaw
    return { ...m, sender }
  }) as Message[]
}

export async function getThreadById(threadId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const admin = createAdminClient()

  const { data: membership } = await admin.rpc('is_thread_member_for_user', {
    p_thread_id: threadId,
    p_user_id: user.id,
  })
  if (!membership) return null

  const { data: thread } = await admin
    .from('threads')
    .select('id, type, mentor_id, intern_id')
    .eq('id', threadId)
    .single()

  if (!thread) return null

  const profileIds = [thread.mentor_id, thread.intern_id].filter(
    Boolean
  ) as string[]

  const { data: profiles } = profileIds.length
    ? await admin
        .from('profiles')
        .select('id, full_name, email')
        .in('id', profileIds)
    : { data: [] }

  const nameById = new Map<string, string>()
  for (const p of profiles ?? []) {
    nameById.set(p.id, p.full_name ?? p.email)
  }

  const mentorName = thread.mentor_id
    ? nameById.get(thread.mentor_id) ?? null
    : null
  const internName = thread.intern_id
    ? nameById.get(thread.intern_id) ?? null
    : null

  let title: string
  if (thread.type === 'mentor_intern') {
    const isIntern = user.id === thread.intern_id
    title = isIntern ? mentorName ?? 'Your mentor' : internName ?? 'Intern'
  } else if (thread.type === 'mentor_team') {
    title = `${mentorName ?? 'Mentor'}'s team`
  } else {
    title = 'Mentor room'
  }

  return { ...thread, title, mentorName, internName }
}