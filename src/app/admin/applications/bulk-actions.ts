'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { sendRejection } from '@/lib/email/send'

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

const MAX_BULK = 200

/**
 * Bulk-reject a set of applications.
 * Sends the same rejection email as the single-reject flow, per applicant.
 * Runs sequentially to avoid Brevo rate limits.
 */
export async function bulkRejectApplications(
  applicationIds: string[],
  reason: string
): Promise<
  | { success: true; rejected: number; skipped: number }
  | { error: string }
> {
  if (!Array.isArray(applicationIds) || applicationIds.length === 0) {
    return { error: 'No applications selected' }
  }
  if (applicationIds.length > MAX_BULK) {
    return { error: `You can reject at most ${MAX_BULK} at once` }
  }

  const user = await getAdminUser()
  if (!user) return { error: 'Only admins can reject applications' }

  const admin = createAdminClient()
  const now = new Date().toISOString()
  const trimmedReason = reason?.trim() || ''

  // Fetch only the ones that are not already final
  const { data: apps, error: fetchError } = await admin
    .from('applications')
    .select('id, email, name, status')
    .in('id', applicationIds)

  if (fetchError) return { error: fetchError.message }

  const rejectable = (apps ?? []).filter(
    (a) => a.status !== 'rejected' && a.status !== 'accepted'
  )
  const skipped = (apps ?? []).length - rejectable.length

  if (rejectable.length === 0) {
    return { success: true, rejected: 0, skipped }
  }

  // Update all in one query
  const ids = rejectable.map((a) => a.id)
  const { error: updateError } = await admin
    .from('applications')
    .update({
      status: 'rejected',
      reviewed_by: user.id,
      reviewed_at: now,
      internal_notes: trimmedReason || null,
    })
    .in('id', ids)

  if (updateError) return { error: updateError.message }

  // Audit log — one row per application
  const auditRows = rejectable.map((a) => ({
    actor_id: user.id,
    action: 'application.rejected',
    entity: 'applications',
    entity_id: a.id,
    metadata: {
      reason: trimmedReason,
      bulk: true,
    },
  }))

  await admin.from('audit_log').insert(auditRows)

  // Fire rejection emails — sequentially to be gentle on Brevo's API
  // (not awaiting them all in parallel avoids hammering the rate limit)
  ;(async () => {
    for (const app of rejectable) {
      if (!app.email) continue
      const res = await sendRejection(app.email, app.name)
      if (!res.success) {
        console.error(
          `Rejection email failed for ${app.email}:`,
          res.error
        )
      }
    }
  })()

  revalidatePath('/admin/applications')

  return {
    success: true,
    rejected: rejectable.length,
    skipped,
  }
}