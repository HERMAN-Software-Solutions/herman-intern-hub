'use server'

import { createAdminClient } from '@/lib/supabase/admin'

type ValidationResult =
  | { valid: true; email: string; fullName: string | null; role: string }
  | { valid: false; reason: 'not_found' | 'expired' | 'used' | 'revoked' }

/**
 * Validates an invitation token. Returns safe public info if valid.
 */
export async function validateInvitation(
  token: string
): Promise<ValidationResult> {
  if (!token || token.length < 10) {
    return { valid: false, reason: 'not_found' }
  }

  const supabase = createAdminClient()

  const { data: invitation, error } = await supabase
    .from('invitations')
    .select('email, role, status, expires_at, metadata')
    .eq('token', token)
    .maybeSingle()

  if (error || !invitation) {
    return { valid: false, reason: 'not_found' }
  }

  if (invitation.status === 'revoked') {
    return { valid: false, reason: 'revoked' }
  }

  if (invitation.status === 'accepted') {
    return { valid: false, reason: 'used' }
  }

  if (new Date(invitation.expires_at) < new Date()) {
    return { valid: false, reason: 'expired' }
  }

  if (invitation.status !== 'pending') {
    return { valid: false, reason: 'not_found' }
  }

  const meta = invitation.metadata as Record<string, unknown> | null
  const fullName = (meta?.fullName as string | undefined) ?? null

  return {
    valid: true,
    email: invitation.email,
    fullName,
    role: invitation.role,
  }
}

type AcceptResult =
  | { success: true; redirectTo: string }
  | { success: false; error: string }

/**
 * Accepts an invitation: creates the auth user + profile, marks invitation accepted.
 * The user is NOT auto-logged in here — the client will sign in with the password
 * they just set.
 */
export async function acceptInvitation(input: {
  token: string
  password: string
  agreementAccepted: boolean
}): Promise<AcceptResult> {
  // --- Validation ---
  if (!input.token) return { success: false, error: 'Missing invitation token' }

  if (!input.password || input.password.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters' }
  }

  if (!input.agreementAccepted) {
    return { success: false, error: 'You must accept the agreement to continue' }
  }

  const supabase = createAdminClient()

  // --- Fetch + re-validate the invitation ---
  const { data: invitation, error: fetchError } = await supabase
    .from('invitations')
    .select('*')
    .eq('token', input.token)
    .maybeSingle()

  if (fetchError || !invitation) {
    return { success: false, error: 'Invitation not found' }
  }

  if (invitation.status === 'accepted') {
    return { success: false, error: 'This invitation has already been used. Try signing in instead.' }
  }

  if (invitation.status === 'revoked') {
    return { success: false, error: 'This invitation was revoked.' }
  }

  if (new Date(invitation.expires_at) < new Date()) {
    return { success: false, error: 'This invitation has expired. Please contact the admin.' }
  }

  // --- Check if a user with this email already exists ---
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', invitation.email)
    .maybeSingle()

  if (existingProfile) {
    return {
      success: false,
      error: 'An account already exists with this email. Try signing in instead.',
    }
  }

  // --- Create the auth user ---
  const { data: created, error: createError } =
    await supabase.auth.admin.createUser({
      email: invitation.email,
      password: input.password,
      email_confirm: true, // already verified via invitation
      user_metadata: {
        invited_via: invitation.id,
      },
    })

  if (createError || !created.user) {
    console.error('createUser error:', createError)
    return {
      success: false,
      error: createError?.message ?? 'Failed to create account',
    }
  }

  const userId = created.user.id
  const meta = (invitation.metadata as Record<string, any>) ?? {}

  // --- Create the profile row ---
  const { error: profileError } = await supabase.from('profiles').insert({
    id: userId,
    email: invitation.email,
    role: invitation.role,
    status: 'onboarding',
    invited_via: invitation.id,
    approved_by: invitation.invited_by,
    approved_at: invitation.created_at,
    full_name: meta.fullName ?? null,
    university: meta.university ?? null,
    course: meta.course ?? null,
    mentor_id: meta.mentorId ?? null,
    start_date: meta.startDate ?? null,
    end_date: meta.endDate ?? null,
    agreement_signed_at: input.agreementAccepted
      ? new Date().toISOString()
      : null,
    agreement_version: '1.0',
    directory_visible: false, // default off until they opt in
  })

  if (profileError) {
    console.error('profile insert error:', profileError)
    // Roll back the auth user to avoid orphan accounts
    await supabase.auth.admin.deleteUser(userId)
    return { success: false, error: 'Failed to create profile' }
  }

  // --- Attach tech stacks (from application metadata) ---
  if (Array.isArray(meta.techStacks) && meta.techStacks.length > 0) {
    const { data: stacks } = await supabase
      .from('tech_stacks')
      .select('id, name')
      .in('name', meta.techStacks)

    if (stacks && stacks.length > 0) {
      await supabase.from('intern_tech_stacks').insert(
        stacks.map((s) => ({
          intern_id: userId,
          tech_stack_id: s.id,
          proficiency: 'beginner',
        }))
      )
    }
  }

  // --- Mark invitation accepted ---
  await supabase
    .from('invitations')
    .update({
      status: 'accepted',
      accepted_at: new Date().toISOString(),
    })
    .eq('id', invitation.id)

  // --- Audit ---
  await supabase.from('audit_log').insert({
    actor_id: userId,
    action: 'invitation.accepted',
    entity: 'invitations',
    entity_id: invitation.id,
    metadata: { email: invitation.email },
  })

  return { success: true, redirectTo: '/onboarding/welcome' }
}