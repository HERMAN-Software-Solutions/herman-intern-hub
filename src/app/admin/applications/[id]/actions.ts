'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { randomBytes } from 'crypto'

export async function rejectApplication(
  applicationId: string,
  reason: string
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

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
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const admin = createAdminClient()

  // 1. Fetch the application
  const { data: application, error: fetchError } = await admin
    .from('applications')
    .select('*')
    .eq('id', input.applicationId)
    .single()

  if (fetchError || !application) {
    return { error: 'Application not found' }
  }

  // 2. Check if already invited
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

  // 3. Create the invitation
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

  // 4. Update application status
  await admin
    .from('applications')
    .update({
      status: 'accepted',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', input.applicationId)

  // 5. Audit log
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
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

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