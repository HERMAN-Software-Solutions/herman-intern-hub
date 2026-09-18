'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { randomBytes } from 'crypto'
import { sendInvitation, sendRejection } from '@/lib/email/send'

/**
 * Verifies the caller is an admin. Returns the user or null.
 */
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

export async function rejectApplication(
  applicationId: string,
  reason: string
) {
  const user = await getAdminUser()
  if (!user) return { error: 'Only admins can reject applications' }

  const admin = createAdminClient()

  const { error } = await admin
    .from('applications')
    .update({
      status: 'rejected',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      internal_notes: reason,
    })
    .eq('id', applicationId)

  if (error) return { error: error.message }

  const { data: app } = await admin
    .from('applications')
    .select('email, name')
    .eq('id', applicationId)
    .single()

  if (app?.email) {
    sendRejection(app.email, app.name).then((res) => {
      if (!res.success) {
        console.error('Rejection email failed:', res.error)
      }
    })
  }

  await admin.from('audit_log').insert({
    actor_id: user.id,
    action: 'application.rejected',
    entity: 'applications',
    entity_id: applicationId,
    metadata: { reason },
  })

  revalidatePath('/admin/applications')
  revalidatePath(`/admin/applications/${applicationId}`)
  return { success: true }
}

export async function approveApplication(input: {
  applicationId: string
  startDate: string
  endDate: string
  mentorId: string | null
  welcomeMessage: string
}) {
  const user = await getAdminUser()
  if (!user) return { error: 'Only admins can approve applications' }

  const admin = createAdminClient()

  const { data: application, error: fetchError } = await admin
    .from('applications')
    .select('*')
    .eq('id', input.applicationId)
    .single()

  if (fetchError || !application) {
    return { error: 'Application not found' }
  }

  const { data: existingInvite } = await admin
    .from('invitations')
    .select('id, token, status')
    .eq('application_id', input.applicationId)
    .eq('status', 'pending')
    .maybeSingle()

  if (existingInvite) {
    return {
      success: true,
      invitationToken: existingInvite.token,
      invitationId: existingInvite.id,
      alreadyExisted: true,
    }
  }

  const token = randomBytes(32).toString('hex')

  const { data: invitation, error: inviteError } = await admin
    .from('invitations')
    .insert({
      email: application.email,
      token,
      application_id: input.applicationId,
      invited_by: user.id,
      role: 'intern',
      metadata: {
        startDate: input.startDate,
        endDate: input.endDate,
        mentorId: input.mentorId,
        welcomeMessage: input.welcomeMessage,
        fullName: application.name,
        university: application.university,
        course: application.course,
        techStacks: application.tech_stack_interest,
      },
    })
    .select()
    .single()

  if (inviteError || !invitation) {
    return { error: inviteError?.message ?? 'Failed to create invitation' }
  }

  await admin
    .from('applications')
    .update({
      status: 'accepted',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', input.applicationId)

  sendInvitation({
    to: application.email,
    fullName: application.name,
    token,
    role: 'intern',
    startDate: input.startDate,
    welcomeMessage: input.welcomeMessage,
  }).then((res) => {
    if (!res.success) {
      console.error('Invitation email failed:', res.error)
    }
  })

  await admin.from('audit_log').insert({
    actor_id: user.id,
    action: 'application.approved',
    entity: 'applications',
    entity_id: input.applicationId,
    metadata: {
      invitationId: invitation.id,
      email: application.email,
    },
  })

  revalidatePath('/admin/applications')
  revalidatePath(`/admin/applications/${input.applicationId}`)

  return {
    success: true,
    invitationToken: token,
    invitationId: invitation.id,
  }
}

export async function markAsReviewing(applicationId: string) {
  const user = await getAdminUser()
  if (!user) return { error: 'Only admins can review applications' }

  const admin = createAdminClient()

  await admin
    .from('applications')
    .update({ status: 'reviewing', reviewed_by: user.id })
    .eq('id', applicationId)

  await admin.from('audit_log').insert({
    actor_id: user.id,
    action: 'application.reviewing',
    entity: 'applications',
    entity_id: applicationId,
  })

  revalidatePath(`/admin/applications/${applicationId}`)
  return { success: true }
}