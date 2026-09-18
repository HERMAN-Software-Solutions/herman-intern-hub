'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { createNotification } from '@/lib/notifications/create'

/**
 * Checks whether the current user can review/modify a submission.
 * Allowed if the user is:
 *  - admin or super_admin, OR
 *  - the mentor assigned to the submission's intern
 */
async function canReviewSubmission(
  userId: string,
  internId: string
): Promise<boolean> {
  const admin = createAdminClient()

  const { data: actor } = await admin
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  if (!actor) return false

  if (actor.role === 'admin' || actor.role === 'super_admin') {
    return true
  }

  if (actor.role === 'mentor') {
    const { data: intern } = await admin
      .from('profiles')
      .select('mentor_id')
      .eq('id', internId)
      .single()

    return intern?.mentor_id === userId
  }

  return false
}

export async function approveSubmission(submissionId: string, feedback: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const admin = createAdminClient()

  // 1. Fetch the submission (with task title for the notification body)
  const { data: submission } = await admin
    .from('submissions')
    .select('id, task_id, intern_id, status, task:task_id (title)')
    .eq('id', submissionId)
    .single()

  if (!submission) return { error: 'Submission not found' }

  // 2. Permission check
  const allowed = await canReviewSubmission(user.id, submission.intern_id)
  if (!allowed) {
    return { error: 'You do not have permission to review this submission' }
  }

  // 3. Mark submission approved
  await admin
    .from('submissions')
    .update({ status: 'approved' })
    .eq('id', submissionId)

  // 4. Mark task done
  await admin
    .from('tasks')
    .update({ status: 'done' })
    .eq('id', submission.task_id)

  // 5. Add feedback if provided
  if (feedback?.trim()) {
    await admin.from('feedback').insert({
      submission_id: submissionId,
      mentor_id: user.id,
      content: feedback.trim(),
    })
  }

  // 6. Notify the intern (fire-and-forget)
  const taskRaw = (submission as any).task
  const task = Array.isArray(taskRaw) ? taskRaw[0] : taskRaw
  const taskTitle = task?.title ?? 'your task'

  createNotification({
    userId: submission.intern_id,
    type: 'submission_approved',
    title: '✅ Submission approved',
    body: `Your work on "${taskTitle}" was approved by your mentor.`,
    link: `/dashboard/tasks/${submission.task_id}`,
    metadata: { taskId: submission.task_id },
  }).catch((err) => {
    console.error('Approval notification failed:', err)
  })

  // 7. Audit
  await admin.from('audit_log').insert({
    actor_id: user.id,
    action: 'submission.approved',
    entity: 'submissions',
    entity_id: submissionId,
    metadata: { taskId: submission.task_id, internId: submission.intern_id },
  })

  revalidatePath('/admin/submissions')
  revalidatePath(`/admin/submissions/${submissionId}`)
  revalidatePath('/mentor/submissions')
  revalidatePath(`/mentor/submissions/${submissionId}`)
  revalidatePath(`/dashboard/tasks/${submission.task_id}`)
  revalidatePath('/dashboard/tasks')
  revalidatePath('/dashboard')

  return { success: true }
}

export async function requestRevision(submissionId: string, feedback: string) {
  if (!feedback?.trim() || feedback.trim().length < 10) {
    return { error: 'Feedback is required (min 10 characters)' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const admin = createAdminClient()

  const { data: submission } = await admin
    .from('submissions')
    .select('id, task_id, intern_id, task:task_id (title)')
    .eq('id', submissionId)
    .single()

  if (!submission) return { error: 'Submission not found' }

  // Permission check
  const allowed = await canReviewSubmission(user.id, submission.intern_id)
  if (!allowed) {
    return { error: 'You do not have permission to review this submission' }
  }

  // 1. Mark submission as needs_revision
  await admin
    .from('submissions')
    .update({ status: 'needs_revision' })
    .eq('id', submissionId)

  // 2. Bump task back to in_progress
  await admin
    .from('tasks')
    .update({ status: 'in_progress' })
    .eq('id', submission.task_id)

  // 3. Add feedback
  await admin.from('feedback').insert({
    submission_id: submissionId,
    mentor_id: user.id,
    content: feedback.trim(),
  })

  // 4. Notify the intern (fire-and-forget)
  const taskRaw = (submission as any).task
  const task = Array.isArray(taskRaw) ? taskRaw[0] : taskRaw
  const taskTitle = task?.title ?? 'your task'

  const trimmedFeedback = feedback.trim()
  const preview =
    trimmedFeedback.length > 120
      ? trimmedFeedback.slice(0, 120) + '…'
      : trimmedFeedback

  createNotification({
    userId: submission.intern_id,
    type: 'revision_requested',
    title: '⚠️ Revision requested',
    body: `${taskTitle}: ${preview}`,
    link: `/dashboard/tasks/${submission.task_id}`,
    metadata: { taskId: submission.task_id },
  }).catch((err) => {
    console.error('Revision notification failed:', err)
  })

  // 5. Audit
  await admin.from('audit_log').insert({
    actor_id: user.id,
    action: 'submission.revision_requested',
    entity: 'submissions',
    entity_id: submissionId,
    metadata: { taskId: submission.task_id, internId: submission.intern_id },
  })

  revalidatePath('/admin/submissions')
  revalidatePath(`/admin/submissions/${submissionId}`)
  revalidatePath('/mentor/submissions')
  revalidatePath(`/mentor/submissions/${submissionId}`)
  revalidatePath(`/dashboard/tasks/${submission.task_id}`)
  revalidatePath('/dashboard/tasks')

  return { success: true }
}

export async function addComment(submissionId: string, comment: string) {
  if (!comment?.trim()) return { error: 'Comment cannot be empty' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const admin = createAdminClient()

  // Fetch submission to check permission
  const { data: submission } = await admin
    .from('submissions')
    .select('id, intern_id')
    .eq('id', submissionId)
    .single()

  if (!submission) return { error: 'Submission not found' }

  const allowed = await canReviewSubmission(user.id, submission.intern_id)
  if (!allowed) {
    return { error: 'You do not have permission to comment on this submission' }
  }

  const { error } = await admin.from('feedback').insert({
    submission_id: submissionId,
    mentor_id: user.id,
    content: comment.trim(),
  })

  if (error) return { error: error.message }

  revalidatePath(`/admin/submissions/${submissionId}`)
  revalidatePath(`/mentor/submissions/${submissionId}`)
  revalidatePath(`/dashboard/tasks/${submissionId}`)
  return { success: true }
}