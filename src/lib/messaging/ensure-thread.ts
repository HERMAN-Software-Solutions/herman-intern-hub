import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Ensures the 1-on-1 thread exists between a mentor and an intern.
 * Idempotent — safe to call multiple times.
 * Returns the thread id.
 */
export async function ensureMentorInternThread(
  mentorId: string,
  internId: string
): Promise<string | null> {
  const admin = createAdminClient()

  // Check if it already exists
  const { data: existing } = await admin
    .from('threads')
    .select('id')
    .eq('type', 'mentor_intern')
    .eq('mentor_id', mentorId)
    .eq('intern_id', internId)
    .maybeSingle()

  if (existing) return existing.id

  const { data: created, error } = await admin
    .from('threads')
    .insert({
      type: 'mentor_intern',
      mentor_id: mentorId,
      intern_id: internId,
    })
    .select('id')
    .single()

  if (error) {
    console.error('ensureMentorInternThread error:', error)
    return null
  }

  return created.id
}

/**
 * Ensures the team thread exists for a mentor.
 * Idempotent — safe to call multiple times.
 * Returns the thread id.
 */
export async function ensureMentorTeamThread(
  mentorId: string
): Promise<string | null> {
  const admin = createAdminClient()

  const { data: existing } = await admin
    .from('threads')
    .select('id')
    .eq('type', 'mentor_team')
    .eq('mentor_id', mentorId)
    .is('intern_id', null)
    .maybeSingle()

  if (existing) return existing.id

  const { data: created, error } = await admin
    .from('threads')
    .insert({
      type: 'mentor_team',
      mentor_id: mentorId,
      intern_id: null,
    })
    .select('id')
    .single()

  if (error) {
    console.error('ensureMentorTeamThread error:', error)
    return null
  }

  return created.id
}

/**
 * Ensures the mentor room (all mentors + admins) thread exists.
 * There should only ever be one.
 * Returns the thread id.
 */
export async function ensureMentorRoomThread(): Promise<string | null> {
  const admin = createAdminClient()

  const { data: existing } = await admin
    .from('threads')
    .select('id')
    .eq('type', 'mentor_admin')
    .is('mentor_id', null)
    .is('intern_id', null)
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
    console.error('ensureMentorRoomThread error:', error)
    return null
  }

  return created.id
}