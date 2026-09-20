import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ count: 0 })

  const admin = createAdminClient()

  const { data: me } = await admin
    .from('profiles')
    .select('id, role, mentor_id')
    .eq('id', user.id)
    .single()

  if (!me) return NextResponse.json({ count: 0 })

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
      .or(`mentor_id.eq.${me.id},type.eq.mentor_admin`)
    threadIds = (threads ?? []).map((t) => t.id)
  } else if (me.role === 'admin' || me.role === 'super_admin') {
    const { data: threads } = await admin.from('threads').select('id')
    threadIds = (threads ?? []).map((t) => t.id)
  }

  if (threadIds.length === 0) return NextResponse.json({ count: 0 })

  const { data: reads } = await admin
    .from('thread_reads')
    .select('thread_id, last_read_at')
    .eq('user_id', user.id)
    .in('thread_id', threadIds)

  const readByThread = new Map<string, string>()
  for (const r of reads ?? []) {
    readByThread.set(r.thread_id, r.last_read_at)
  }

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

  return NextResponse.json({ count })
}