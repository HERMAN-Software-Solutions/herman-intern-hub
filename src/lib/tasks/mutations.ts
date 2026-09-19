'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { createNotification } from '@/lib/notifications/create'

type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done'

/**
 * Verifies the current user can act on this task.
 * Returns null if not permitted, otherwise the task + actor info.
 *
 * Rule: admin can act on any task; a mentor can act only on tasks
 * whose assigned_to intern has mentor_id = user.id.
 */
async function verifyTaskAccess(taskId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const admin = createAdminClient()

  const { data: actor } = await admin
    .from('profiles')
    .select('id, role')
    .eq('id', user.id)
    .single()

  if (!actor) return null

  const isAdmin = actor.role === 'admin' || actor.role === 'super_admin'
  const isMentor = actor.role === 'mentor'

  if (!isAdmin && !isMentor) return null

  // Fetch the task + its intern's mentor
  const { data: task } = await admin
    .from('tasks')
    .select(
      `id, project_id, assigned_to, title, description, status, due_date, is_highlight,
       intern:assigned_to (id, mentor_id, full_name)`
    )
    .eq('id', taskId)
    .single()

  if (!task) return null

  const internRaw = (task as any).intern
  const intern = Array.isArray(internRaw) ? internRaw[0] : internRaw

  if (!intern) return null

  // Mentors can only act on their own interns' tasks
  if (isMentor && intern.mentor_id !== user.id) {
    return null
  }

  return { user, actor, task, intern, isAdmin }
}

/**
 * Update editable fields of a task.
 * Caller must be admin OR the mentor assigned to the task's intern.
 */
export async function updateTask(input: {
  taskId: string
  title: string
  description: string
  dueDate: string
  status: TaskStatus
  projectId: string
  isHighlight: boolean
}): Promise<{ success: true } | { error: string }> {
  if (!input.title?.trim()) return { error: 'Title is required' }
  if (!input.projectId?.trim()) return { error: 'Project is required' }

  const VALID: TaskStatus[] = ['todo', 'in_progress', 'review', 'done']
  if (!VALID.includes(input.status)) return { error: 'Invalid status' }

  const verified = await verifyTaskAccess(input.taskId)
  if (!verified) return { error: 'You do not have permission to edit this task' }

  const { user, task, intern } = verified
  const admin = createAdminClient()

  // Verify the intern is assigned to the target project (Option A rule)
  const { data: assignment } = await admin
    .from('project_assignments')
    .select('id')
    .eq('project_id', input.projectId)
    .eq('intern_id', intern.id)
    .maybeSingle()

  if (!assignment) {
    return { error: 'This intern is not assigned to that project' }
  }

  const { error } = await admin
    .from('tasks')
    .update({
      title: input.title.trim(),
      description: input.description?.trim() || null,
      due_date: input.dueDate || null,
      status: input.status,
      project_id: input.projectId,
      is_highlight: input.isHighlight,
    })
    .eq('id', input.taskId)

  if (error) {
    console.error('Task update error:', error)
    return { error: error.message }
  }

  // Audit
  await admin.from('audit_log').insert({
    actor_id: user.id,
    action: 'task.updated',
    entity: 'tasks',
    entity_id: input.taskId,
    metadata: {
      changes: {
        title: input.title,
        status: input.status,
        projectId: input.projectId,
        dueDate: input.dueDate,
        isHighlight: input.isHighlight,
      },
    },
  })

  // Notify the intern (only if status changed, to reduce noise)
  if (task.status !== input.status) {
    createNotification({
      userId: intern.id,
      type: 'task_assigned',
      title: '📝 Task updated',
      body: `"${input.title.trim()}" is now ${input.status.replace('_', ' ')}.`,
      link: `/dashboard/tasks/${input.taskId}`,
      metadata: { taskId: input.taskId },
    }).catch((err) => {
      console.error('Task update notification failed:', err)
    })
  }

  // Revalidate both admin and mentor views + dashboard
  revalidatePath(`/admin/projects/${task.project_id}`)
  revalidatePath(`/admin/projects/${input.projectId}`)
  revalidatePath(`/mentor/interns/${intern.id}`)
  revalidatePath('/dashboard/tasks')
  revalidatePath(`/dashboard/tasks/${input.taskId}`)

  return { success: true }
}

/**
 * Hard-delete a task.
 * Caller must be admin OR the mentor assigned to the task's intern.
 */
export async function deleteTask(
  taskId: string
): Promise<{ success: true } | { error: string }> {
  const verified = await verifyTaskAccess(taskId)
  if (!verified) return { error: 'You do not have permission to delete this task' }

  const { user, task, intern } = verified
  const admin = createAdminClient()

  const { error } = await admin.from('tasks').delete().eq('id', taskId)

  if (error) {
    console.error('Task delete error:', error)
    return { error: error.message }
  }

  // Audit — records what was deleted, since the row is gone
  await admin.from('audit_log').insert({
    actor_id: user.id,
    action: 'task.deleted',
    entity: 'tasks',
    entity_id: taskId,
    metadata: {
      title: task.title,
      projectId: task.project_id,
      assignedTo: intern.id,
    },
  })

  revalidatePath(`/admin/projects/${task.project_id}`)
  revalidatePath(`/mentor/interns/${intern.id}`)
  revalidatePath('/dashboard/tasks')

  return { success: true }
}