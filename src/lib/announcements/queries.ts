import 'server-only'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export type AnnouncementListItem = {
  id: string
  subject: string
  body: string
  senderName: string
  created_at: string
  read_at: string | null
}

/**
 * Inbox: all announcements the current user has received.
 */
export async function getMyAnnouncements(): Promise<AnnouncementListItem[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const admin = createAdminClient()

  const { data: rows } = await admin
    .from('announcement_recipients')
    .select(
      `read_at,
       announcement:announcement_id (
         id, subject, body, created_at,
         sender:sender_id (full_name, email)
       )`
    )
    .eq('user_id', user.id)

  if (!rows) return []

  // Sort by announcement created_at desc in JS (nested ordering not supported)
  const items = rows
    .map((r: any) => {
      const aRaw = r.announcement
      const a = Array.isArray(aRaw) ? aRaw[0] : aRaw
      if (!a) return null
      const sRaw = a.sender
      const s = Array.isArray(sRaw) ? sRaw[0] : sRaw
      return {
        id: a.id,
        subject: a.subject,
        body: a.body,
        senderName: s?.full_name ?? s?.email ?? 'HERMAN',
        created_at: a.created_at,
        read_at: r.read_at,
      } as AnnouncementListItem
    })
    .filter(Boolean) as AnnouncementListItem[]

  items.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
  return items
}

/**
 * Unread announcement count (for badge / popup logic).
 */
export async function getUnreadAnnouncementCount(): Promise<number> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return 0

  const admin = createAdminClient()
  const { count } = await admin
    .from('announcement_recipients')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .is('read_at', null)

  return count ?? 0
}

/**
 * Newest unread announcement (for popup).
 * Returns null if nothing unread.
 */
export async function getNewestUnreadAnnouncement(): Promise<AnnouncementListItem | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const admin = createAdminClient()
  const { data: rows } = await admin
    .from('announcement_recipients')
    .select(
      `read_at,
       announcement:announcement_id (
         id, subject, body, created_at,
         sender:sender_id (full_name, email)
       )`
    )
    .eq('user_id', user.id)
    .is('read_at', null)

  if (!rows || rows.length === 0) return null

  const items = rows
    .map((r: any) => {
      const aRaw = r.announcement
      const a = Array.isArray(aRaw) ? aRaw[0] : aRaw
      if (!a) return null
      const sRaw = a.sender
      const s = Array.isArray(sRaw) ? sRaw[0] : sRaw
      return {
        id: a.id,
        subject: a.subject,
        body: a.body,
        senderName: s?.full_name ?? s?.email ?? 'HERMAN',
        created_at: a.created_at,
        read_at: r.read_at,
      } as AnnouncementListItem
    })
    .filter(Boolean) as AnnouncementListItem[]

  items.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
  return items[0] ?? null
}

/**
 * Single announcement (for detail view). Also returns whether it's unread.
 */
export async function getAnnouncement(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const admin = createAdminClient()

  // Confirm the user is a recipient
  const { data: recip } = await admin
    .from('announcement_recipients')
    .select('read_at')
    .eq('announcement_id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!recip) return null

  const { data: ann } = await admin
    .from('announcements')
    .select(
      `id, subject, body, audience, created_at, recipient_count,
       sender:sender_id (full_name, email)`
    )
    .eq('id', id)
    .single()

  if (!ann) return null

  const sRaw = (ann as any).sender
  const sender = Array.isArray(sRaw) ? sRaw[0] : sRaw

  return { ...ann, senderName: sender?.full_name ?? sender?.email ?? 'HERMAN' }
}