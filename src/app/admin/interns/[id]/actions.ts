'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { sendActivated } from '@/lib/email/send'
import { createNotification } from '@/lib/notifications/create'
import {
  ensureMentorInternThread,
  ensureMentorTeamThread,
} from '@/lib/messaging/ensure-thread'

async function getAdminUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) return null
  if (profile.role !== 'admin' && profile.role !== 'super_admin') return null

  return user
}

export async function assignMentor(internId: string, mentorId: string) {
  if (!mentorId) return { error: 'Please select a mentor' }

  const user = await getAdminUser()
  if (!user) return { error: 'Only admins can assign mentors' }

  const admin = createAdminClient()

  const { error } = await admin
    .from('profiles')
    .update({ mentor_id: mentorId })
    .eq('id', internId)
    .eq('role', 'intern')

  if (error) return { error: error.message }

  // ─── Ensure messaging threads exist ──────────────────
  // Runs silently. If it fails, the assignment still succeeded —
  // a thread can be created later when the user opens Messages.
  await Promise.all([
    ensureMentorInternThread(mentorId, internId),
    ensureMentorTeamThread(mentorId),
  ])

  const { data: intern } = await admin
    .from('profiles')
    .select('email, full_name, status')
    .eq('id', internId)
    .single()

  const { data: mentor } = await admin
    .from('profiles')
    .select('full_name, email')
    .eq('id', mentorId)
    .single()

  if (intern?.status === 'active' && intern.email) {
    sendActivated({
      to: intern.email,
      fullName: intern.full_name,
      mentorName: mentor?.full_name ?? mentor?.email ?? null,
    }).then((res) => {
      if (!res.success) {
        console.error('Activation email failed:', res.error)
      }
    })

    createNotification({
      userId: internId,
      type: 'mentor_assigned',
      title: '🎉 Welcome to the team!',
      body: `Your mentor is ${mentor?.full_name ?? mentor?.email ?? 'assigned'}. You can now access your dashboard.`,
      link: '/dashboard',
    }).then((res) => {
      if (!res.success) {
        console.error('Mentor assignment notification failed:', res.error)
      }
    })
  }

  await admin.from('audit_log').insert({
    actor_id: user.id,
    action: 'intern.mentor_assigned',
    entity: 'profiles',
    entity_id: internId,
    metadata: { mentorId },
  })

  revalidatePath('/admin/interns')
  revalidatePath(`/admin/interns/${internId}`)
  return { success: true }
}

export async function unassignMentor(internId: string) {
  const user = await getAdminUser()
  if (!user) return { error: 'Only admins can unassign mentors' }

  const admin = createAdminClient()

  const { error } = await admin
    .from('profiles')
    .update({ mentor_id: null })
    .eq('id', internId)

  if (error) return { error: error.message }

  await admin.from('audit_log').insert({
    actor_id: user.id,
    action: 'intern.mentor_unassigned',
    entity: 'profiles',
    entity_id: internId,
  })

  revalidatePath('/admin/interns')
  revalidatePath(`/admin/interns/${internId}`)
  return { success: true }
}

export async function updateInternDates(
  internId: string,
  startDate: string,
  endDate: string
) {
  const user = await getAdminUser()
  if (!user) return { error: 'Only admins can update intern dates' }

  const admin = createAdminClient()

  const { error } = await admin
    .from('profiles')
    .update({
      start_date: startDate || null,
      end_date: endDate || null,
    })
    .eq('id', internId)

  if (error) return { error: error.message }

  revalidatePath(`/admin/interns/${internId}`)
  return { success: true }
}

/* ─────────────────────── STATUS CHANGE ─────────────────────── */

export type InternStatus =
  | 'onboarding'
  | 'active'
  | 'paused'
  | 'completed'
  | 'withdrawn'

const VALID_STATUSES: InternStatus[] = [
  'onboarding',
  'active',
  'paused',
  'completed',
  'withdrawn',
]

export async function updateInternStatus(
  internId: string,
  newStatus: InternStatus
): Promise<{ success: true } | { error: string }> {
  if (!VALID_STATUSES.includes(newStatus)) {
    return { error: 'Invalid status' }
  }

  const user = await getAdminUser()
  if (!user) return { error: 'Only admins can change intern status' }

  const admin = createAdminClient()

  // Load current intern
  const { data: intern } = await admin
    .from('profiles')
    .select('id, email, full_name, status, mentor_id')
    .eq('id', internId)
    .eq('role', 'intern')
    .single()

  if (!intern) return { error: 'Intern not found' }

  const current = intern.status as InternStatus

  if (current === newStatus) {
    return { error: 'Status is already set to that value' }
  }

  // Guard: cannot move to 'active' from this control.
  // Activation happens via mentor-assignment flow (signed agreement + mentor).
  if (newStatus === 'active' && current === 'onboarding') {
    return {
      error:
        'Activation happens automatically once a mentor is assigned and the agreement is signed. Assign a mentor to activate.',
    }
  }

  // Guard: cannot activate a completed/withdrawn intern without admin reset
  if (
    newStatus === 'active' &&
    (current === 'completed' || current === 'withdrawn')
  ) {
    return {
      error:
        'This internship has already ended. Restore to "onboarding" first if you need to reactivate.',
    }
  }

  // Set end_date when moving to completed/withdrawn
  const patch: Record<string, unknown> = { status: newStatus }

  if (newStatus === 'completed' || newStatus === 'withdrawn') {
    // Only set if not already set
    const { data: fresh } = await admin
      .from('profiles')
      .select('end_date')
      .eq('id', internId)
      .single()
    if (fresh && !fresh.end_date) {
      patch.end_date = new Date().toISOString().slice(0, 10)
    }
  }

  const { error } = await admin
    .from('profiles')
    .update(patch)
    .eq('id', internId)

  if (error) {
    console.error('Status update error:', error)
    return { error: error.message }
  }

  // Audit
  await admin.from('audit_log').insert({
    actor_id: user.id,
    action: 'intern.status_changed',
    entity: 'profiles',
    entity_id: internId,
    metadata: { from: current, to: newStatus },
  })

  // Notify the intern when paused (and no other notification makes sense)
  if (newStatus === 'paused' && intern.email) {
    createNotification({
      userId: internId,
      type: 'mentor_assigned', // closest existing type
      title: '⏸️ Internship paused',
      body: 'Your internship has been paused. Contact your mentor or admin for details.',
      link: '/account-status',
    }).catch((err) => {
      console.error('Pause notification failed:', err)
    })
  }

  revalidatePath('/admin/interns')
  revalidatePath(`/admin/interns/${internId}`)
  revalidatePath(`/mentor/interns/${internId}`)
  revalidatePath('/dashboard')

  return { success: true }
}