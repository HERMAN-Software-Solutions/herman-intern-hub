'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { createNotification } from '@/lib/notifications/create'

export async function assignInternToProject(input: {
  projectId: string
  internId: string
  role: 'lead' | 'contributor'
  compensationType: 'unpaid' | 'paid'
}) {
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
    return { error: 'Only admins can assign interns' }
  }

  const admin = createAdminClient()

  // Check if already assigned
  const { data: existing } = await admin
    .from('project_assignments')
    .select('id')
    .eq('project_id', input.projectId)
    .eq('intern_id', input.internId)
    .maybeSingle()

  if (existing) {
    return { error: 'This intern is already assigned to the project' }
  }

  const { error } = await admin.from('project_assignments').insert({
    project_id: input.projectId,
    intern_id: input.internId,
    role: input.role,
    compensation_type: input.compensationType,
  })

  if (error) return { error: error.message }

  // Fetch project title for notification
  const { data: project } = await admin
    .from('projects')
    .select('title')
    .eq('id', input.projectId)
    .single()

  // Notify the intern
  createNotification({
    userId: input.internId,
    type: 'task_assigned', // closest type we have
    title: '🎯 New project assigned',
    body: `You've been assigned to "${project?.title ?? 'a project'}" as ${input.role}.`,
    link: `/dashboard/projects/${input.projectId}`,
  }).catch((err) => {
    console.error('Assignment notification failed:', err)
  })

  await admin.from('audit_log').insert({
    actor_id: user.id,
    action: 'project.intern_assigned',
    entity: 'project_assignments',
    metadata: {
      projectId: input.projectId,
      internId: input.internId,
      role: input.role,
    },
  })

  revalidatePath(`/admin/projects/${input.projectId}`)
  revalidatePath('/admin/projects')

  return { success: true }
}

export async function removeInternFromProject(
  projectId: string,
  internId: string
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const admin = createAdminClient()

  const { error } = await admin
    .from('project_assignments')
    .delete()
    .eq('project_id', projectId)
    .eq('intern_id', internId)

  if (error) return { error: error.message }

  revalidatePath(`/admin/projects/${projectId}`)
  revalidatePath('/admin/projects')

  return { success: true }
}

export async function createTask(input: {
  projectId: string
  assignedTo: string
  title: string
  description: string
  dueDate: string
  isHighlight: boolean
}) {
  if (!input.title?.trim()) return { error: 'Task title is required' }
  if (!input.assignedTo || !input.assignedTo.trim()) {
    return { error: 'Please select an intern to assign this task to' }
  }

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(input.assignedTo)) {
    return { error: 'Invalid intern selection' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

    const admin = createAdminClient()

  // Verify the intern exists and is assigned to this project
  const { data: assignment } = await admin
    .from('project_assignments')
    .select('id')
    .eq('project_id', input.projectId)
    .eq('intern_id', input.assignedTo)
    .maybeSingle()

  if (!assignment) {
    return { error: 'This intern is not assigned to this project' }
  }

  const { data: task, error } = await admin
    .from('tasks')
    .insert({
      project_id: input.projectId,
      assigned_to: input.assignedTo,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      due_date: input.dueDate || null,
      is_highlight: input.isHighlight,
      status: 'todo',
      created_by: user.id,
    })
    .select()
    .single()

  if (error || !task) {
    return { error: error?.message ?? 'Failed to create task' }
  }

  // Notify the intern
  createNotification({
    userId: input.assignedTo,
    type: 'task_assigned',
    title: '📋 New task assigned',
    body: `"${task.title}" is now on your plate.`,
    link: `/dashboard/tasks/${task.id}`,
    metadata: { taskId: task.id },
  }).catch((err) => {
    console.error('Task notification failed:', err)
  })

  await admin.from('audit_log').insert({
    actor_id: user.id,
    action: 'task.created',
    entity: 'tasks',
    entity_id: task.id,
    metadata: { projectId: input.projectId },
  })

  revalidatePath(`/admin/projects/${input.projectId}`)
  revalidatePath('/admin/projects')

  return { success: true, taskId: task.id }
}