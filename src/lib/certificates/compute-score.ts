import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'
import { getRatingBand, type ScoreResult } from './types'

/**
 * Computes the performance score for an intern.
 * See docs/certificate-spec.md §6 for the formula.
 */
export async function computeScore(
  internId: string
): Promise<
  | { success: true; result: ScoreResult }
  | { success: false; error: string }
> {
  const supabase = createAdminClient()

  // 1. Fetch intern profile (for date range)
  const { data: profile } = await supabase
    .from('profiles')
    .select('start_date, end_date')
    .eq('id', internId)
    .single()

  if (!profile) return { success: false, error: 'Intern not found' }

  // 2. Tasks assigned + completed
  const { data: tasks } = await supabase
    .from('tasks')
    .select('id, status')
    .eq('assigned_to', internId)

  const tasksAssigned = tasks?.length ?? 0
  const tasksCompleted = tasks?.filter((t) => t.status === 'done').length ?? 0
  const taskRate = tasksAssigned > 0 ? tasksCompleted / tasksAssigned : 1

  // 3. Submissions — approve on first try
  const { data: submissions } = await supabase
    .from('submissions')
    .select('id, status, task_id')
    .eq('intern_id', internId)

  const subTotal = submissions?.length ?? 0
  // Count tasks where the FIRST (or only) submission was approved
  const byTask = new Map<string, string[]>()
  for (const s of submissions ?? []) {
    const arr = byTask.get(s.task_id) ?? []
    arr.push(s.status)
    byTask.set(s.task_id, arr)
  }
  let firstTryApproved = 0
  for (const statuses of byTask.values()) {
    if (statuses.length === 1 && statuses[0] === 'approved') firstTryApproved++
  }
  // Fall back to overall approval ratio if no submissions
  const qualityRate =
    subTotal > 0
      ? firstTryApproved / Math.max(byTask.size, 1)
      : 1

  // 4. Daily logs consistency
  const start = profile.start_date ? new Date(profile.start_date) : null
  const end = profile.end_date ? new Date(profile.end_date) : new Date()
  const daysTotal = start
    ? Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000))
    : 60
  // Working days = total days minus ~30% for weekends approximation
  const workingDays = Math.max(1, Math.round(daysTotal * 0.7))

  const { count: logCount } = await supabase
    .from('daily_logs')
    .select('*', { count: 'exact', head: true })
    .eq('intern_id', internId)

  const daysLogged = logCount ?? 0
  const logRate = Math.min(1, daysLogged / workingDays)

  // 5. Mentor + peer rating from performance_reviews
  const { data: review } = await supabase
    .from('performance_reviews')
    .select('mentor_rating, peer_rating')
    .eq('intern_id', internId)
    .maybeSingle()

  if (!review || review.mentor_rating == null) {
    return {
      success: false,
      error:
        'Mentor review is required before issuing a certificate. Ask the mentor to complete it first.',
    }
  }

  const mentorRating = Number(review.mentor_rating)
  const peerRating = review.peer_rating != null ? Number(review.peer_rating) : mentorRating

  // 6. Weighted score (0–1)
  const score01 =
    taskRate * 0.3 +
    qualityRate * 0.25 +
    logRate * 0.15 +
    (mentorRating / 5) * 0.2 +
    (peerRating / 5) * 0.1

  const score = Math.round(score01 * 5 * 10) / 10

  return {
    success: true,
    result: {
      score,
      band: getRatingBand(score),
      breakdown: {
        task_completion_rate: Math.round(taskRate * 100),
        submission_quality_rate: Math.round(qualityRate * 100),
        log_consistency_rate: Math.round(logRate * 100),
        mentor_rating: mentorRating,
        peer_rating: review.peer_rating,
        tasks_completed: tasksCompleted,
        tasks_assigned: tasksAssigned,
        submissions_approved_first_try: firstTryApproved,
        submissions_total: subTotal,
        days_logged: daysLogged,
        working_days: workingDays,
      },
    },
  }
}