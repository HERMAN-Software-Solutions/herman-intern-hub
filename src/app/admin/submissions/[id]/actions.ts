'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function approveSubmission(submissionId: string, feedback: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const admin = createAdminClient()

  // 1. Fetch the submission
  const { data: submission } = await admin
    .from('submissions')
    .select('id, task_id, intern_id, status')
    .eq('id', submissionId)
    .single()

  if (!submission) return { error: 'Submission not found' }

  // 2. Mark submission approved
  await admin
    .from('submissions')
    .update({ status: 'approved' })
    .eq('id', submissionId)

  // 3. Mark task done
  await admin
    .from('tasks')
    .update({ status: 'done' })
    .eq('id', submission.task_id)

  // 4. Add feedback if provided
  if (feedback?.trim()) {
    await admin.from('feedback').insert({
      submission_id: submissionId,
      mentor_id: user.id,
      content: feedback.trim(),
    })
  }

  // 5. Audit
  await admin.from('audit_log').insert({
    actor_id: user.id,
    action: 'submission.approved',
    entity: 'submissions',
    entity_id: submissionId,
    metadata: { taskId: submission.task_id, internId: submission.intern_id },
  })

  revalidatePath('/admin/submissions')
  revalidatePath(`/admin/submissions/${submissionId}`)
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
    .select('id, task_id, intern_id')
    .eq('id', submissionId)
    .single()

  if (!submission) return { error: 'Submission not found' }

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

  // 4. Audit
  await admin.from('audit_log').insert({
    actor_id: user.id,
    action: 'submission.revision_requested',
    entity: 'submissions',
    entity_id: submissionId,
    metadata: { taskId: submission.task_id, internId: submission.intern_id },
  })

  revalidatePath('/admin/submissions')
  revalidatePath(`/admin/submissions/${submissionId}`)
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

  const { error } = await admin.from('feedback').insert({
    submission_id: submissionId,
    mentor_id: user.id,
    content: comment.trim(),
  })

  if (error) return { error: error.message }

  revalidatePath(`/admin/submissions/${submissionId}`)
  revalidatePath(`/dashboard/tasks/${submissionId}`)
  return { success: true }
}