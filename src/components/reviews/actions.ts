'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function savePerformanceReview(input: {
  internId: string
  mentorRating: number
  peerRating: number | null
  strengths: string
  improvements: string
  comments: string
}) {
  if (input.mentorRating < 1 || input.mentorRating > 5) {
    return { error: 'Mentor rating must be between 1 and 5' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const admin = createAdminClient()

  // Verify permission: user must be the intern's mentor OR an admin
  const { data: intern } = await admin
    .from('profiles')
    .select('mentor_id')
    .eq('id', input.internId)
    .single()

  const { data: actor } = await admin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isMentor = intern?.mentor_id === user.id
  const isAdmin = actor?.role === 'admin' || actor?.role === 'super_admin'

  if (!isMentor && !isAdmin) {
    return { error: 'You do not have permission to review this intern' }
  }

  const { error } = await admin.from('performance_reviews').upsert(
    {
      intern_id: input.internId,
      mentor_id: user.id,
      mentor_rating: input.mentorRating,
      peer_rating: input.peerRating,
      strengths: input.strengths?.trim() || null,
      improvements: input.improvements?.trim() || null,
      comments: input.comments?.trim() || null,
    },
    { onConflict: 'intern_id' }
  )

  if (error) return { error: error.message }

  await admin.from('audit_log').insert({
    actor_id: user.id,
    action: 'performance_review.saved',
    entity: 'performance_reviews',
    entity_id: input.internId,
    metadata: { mentorRating: input.mentorRating },
  })

  revalidatePath('/admin/interns')
  revalidatePath(`/admin/interns/${input.internId}`)
  revalidatePath(`/admin/interns/${input.internId}/review`)
  revalidatePath('/mentor/reviews')
  revalidatePath(`/mentor/reviews/${input.internId}`)

  return { success: true }
}