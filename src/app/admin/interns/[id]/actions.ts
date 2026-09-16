'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { sendActivated } from '@/lib/email/send'

export async function assignMentor(internId: string, mentorId: string) {
  if (!mentorId) return { error: 'Please select a mentor' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const admin = createAdminClient()

  // Update the intern's mentor_id — the trigger fires and flips status
  const { error } = await admin
    .from('profiles')
    .update({ mentor_id: mentorId })
    .eq('id', internId)
    .eq('role', 'intern')

  if (error) return { error: error.message }

    // Fetch intern + mentor for the email
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

  // Only send if the intern just became active
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
  }

  // Audit
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
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

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
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

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