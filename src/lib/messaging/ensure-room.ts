import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Ensures the single mentor room thread exists.
 * Idempotent. Returns the thread id.
 *
 * Called on first load of /mentor/messages so the room
 * gets created lazily.
 */
export async function ensureMentorRoom(): Promise<string | null> {
  const admin = createAdminClient()

  const { data: existing } = await admin
    .from('threads')
    .select('id')
    .eq('type', 'mentor_admin')
    .maybeSingle()

  if (existing) return existing.id

  const { data: created, error } = await admin
    .from('threads')
    .insert({
      type: 'mentor_admin',
      mentor_id: null,
      intern_id: null,
    })
    .select('id')
    .single()

  if (error) {
    console.error('ensureMentorRoom error:', error)
    return null
  }

  return created.id
}