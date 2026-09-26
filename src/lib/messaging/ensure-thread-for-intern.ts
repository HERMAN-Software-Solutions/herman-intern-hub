'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ensureMentorInternThread } from './ensure-thread'

/**
 * Given an intern ID, ensure the mentor_intern thread exists between
 * that intern and their currently assigned mentor. Returns the thread ID.
 *
 * Used by the "Message intern" button on admin/mentor intern detail pages.
 */
export async function ensureThreadForIntern(
  internId: string
): Promise<{ threadId: string } | { error: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const admin = createAdminClient()

  // Fetch the caller's role
  const { data: me } = await admin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!me) return { error: 'Profile not found' }

  const isAdmin = me.role === 'admin' || me.role === 'super_admin'
  const isMentor = me.role === 'mentor'

  if (!isAdmin && !isMentor) {
    return { error: 'Only staff can message interns' }
  }

  // Fetch the intern
  const { data: intern } = await admin
    .from('profiles')
    .select('id, mentor_id')
    .eq('id', internId)
    .eq('role', 'intern')
    .single()

  if (!intern) return { error: 'Intern not found' }

  if (!intern.mentor_id) {
    return { error: 'This intern has no mentor assigned yet' }
  }

  // Mentors can only message their own interns
  if (isMentor && intern.mentor_id !== user.id) {
    return { error: 'This intern is not assigned to you' }
  }

  // Ensure the thread exists
  const threadId = await ensureMentorInternThread(
    intern.mentor_id,
    internId
  )

  if (!threadId) {
    return { error: 'Failed to create thread' }
  }

  return { threadId }
}