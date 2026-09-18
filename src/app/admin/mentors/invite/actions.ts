'use server'

import { randomBytes } from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { sendInvitation } from '@/lib/email/send'

export async function inviteMentor(input: {
  fullName: string
  email: string
  bio: string
  techStack: string[]
}) {
  // ─── Validate ───────────────────────────────────────
  if (!input.fullName?.trim()) return { error: 'Full name is required' }
  if (!input.email?.trim()) return { error: 'Email is required' }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email))
    return { error: 'Invalid email' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: actor } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!actor || (actor.role !== 'admin' && actor.role !== 'super_admin')) {
    return { error: 'Only admins can invite mentors' }
  }

  const admin = createAdminClient()

  // ─── Check for existing user with this email ────────
  const { data: existingProfile } = await admin
    .from('profiles')
    .select('id, role')
    .eq('email', input.email.toLowerCase().trim())
    .maybeSingle()

  if (existingProfile) {
    return {
      error:
        'A user already exists with this email. They may already be a mentor or intern.',
    }
  }

  // ─── Check for pending invitation ───────────────────
  const { data: existingInvite } = await admin
    .from('invitations')
    .select('id, token, status')
    .eq('email', input.email.toLowerCase().trim())
    .eq('status', 'pending')
    .maybeSingle()

  if (existingInvite) {
    return {
      success: true,
      invitationToken: existingInvite.token,
      alreadyExisted: true,
    }
  }

  // ─── Create the invitation ──────────────────────────
  const token = randomBytes(32).toString('hex')

  const { data: invitation, error: inviteError } = await admin
    .from('invitations')
    .insert({
      email: input.email.toLowerCase().trim(),
      token,
      invited_by: user.id,
      role: 'mentor',
      metadata: {
        fullName: input.fullName.trim(),
        bio: input.bio?.trim() || null,
        techStack: input.techStack ?? [],
      },
    })
    .select()
    .single()

  if (inviteError || !invitation) {
    console.error('Invitation error:', inviteError)
    return { error: inviteError?.message ?? 'Failed to create invitation' }
  }

  // ─── Send invitation email ──────────────────────────
  sendInvitation({
  to: input.email.toLowerCase().trim(),
  fullName: input.fullName.trim(),
  token,
  role: 'mentor',
  welcomeMessage: `Hi ${input.fullName.trim()}, we'd love to have you join HERMAN Software Solutions as a mentor. Your experience and guidance will help shape the next generation of software engineers.`,
})

  // ─── Audit ──────────────────────────────────────────
  await admin.from('audit_log').insert({
    actor_id: user.id,
    action: 'invitation.mentor_created',
    entity: 'invitations',
    entity_id: invitation.id,
    metadata: {
      email: input.email.toLowerCase().trim(),
      fullName: input.fullName.trim(),
    },
  })

  revalidatePath('/admin/mentors')

  return {
    success: true,
    invitationToken: token,
    invitationId: invitation.id,
  }
}