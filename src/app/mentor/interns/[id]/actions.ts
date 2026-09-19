'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { createNotification } from '@/lib/notifications/create'

/**
 * Verifies the current user is a mentor (or admin) and that the given
 * intern is assigned to them.
 */
async function verifyMentorOwnsIntern(internId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const admin = createAdminClient()

  const { data: actor } = await admin
    .from('profiles')
    .select('role, full_name, email')
    .eq('id', user.id)
    .single()

  if (!actor) return null

  const isAdmin = actor.role === 'admin' || actor.role === 'super_admin'
  const isMentor = actor.role === 'mentor'

  if (!isAdmin && !isMentor) return null

  // Fetch the intern
  const { data: intern } = await admin
    .from('profiles')
    .select('id, full_name, email, mentor_id, status')
    .eq('id', internId)
    .eq('role', 'intern')
    .single()

  if (!intern) return null

  // Mentors can only act on their own interns
  if (isMentor && intern.mentor_id !== user.id) {
    return null
  }

  return { user, actor, intern, isAdmin }
}

/**
 * Returns all active projects (shared across all mentors).
 */
export async function getAvailableProjects() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const admin = createAdminClient()

  const { data: projects } = await admin
    .from('projects')
    .select('id, title, status, is_client_project')
    .neq('status', 'archived')
    .order('title', { ascending: true })

  return projects ?? []
}

/**
 * Creates a project + assigns the given intern to it.
 * Used when a mentor creates a project on the fly.
 */
export async function mentorCreateProject(input: {
  internId: string
  title: string
  description: string
  isClientProject: boolean
}) {
  if (!input.title?.trim()) {
    return { error: 'Project title is required' }
  }

  const verified = await verifyMentorOwnsIntern(input.internId)
  if (!verified) {
    return { error: 'You do not have permission to create projects for this intern' }
  }

  const { user, isAdmin } = verified
  const admin = createAdminClient()

  // 1. Create the project
  const { data: project, error: projectError } = await admin
    .from('projects')
    .insert({
      title: input.title.trim(),
      description: input.description?.trim() || null,
      status: 'active',
      is_client_project: input.isClientProject,
      created_by: user.id,
    })
    .select()
    .single()

  if (projectError || !project) {
    console.error('Project creation error:', projectError)
    return { error: projectError?.message ?? 'Failed to create project' }
  }

  // 2. Assign this intern to the project
  await admin.from('project_assignments').insert({
    project_id: project.id,
    intern_id: input.internId,
    role: 'contributor',
    compensation_type: 'unpaid',
  })

  // 3. Audit
  await admin.from('audit_log').insert({
    actor_id: user.id,
    action: 'project.created',
    entity: 'projects',
    entity_id: project.id,
    metadata: {
      title: project.title,
      createdByRole: isAdmin ? 'admin' : 'mentor',
      internId: input.internId,
    },
  })

  revalidatePath(`/mentor/interns/${input.internId}`)

  return { success: true, project }
}

/**
 * Creates a task for an intern.
 * If a projectId is provided, verifies mentor has permission on that project.
 */
export async function mentorCreateTask(input: {
  internId: string
  projectId: string | null
  title: string
  description: string
  dueDate: string
  isHighlight: boolean
}) {
  if (!input.title?.trim()) {
    return { error: 'Task title is required' }
  }

  const verified = await verifyMentorOwnsIntern(input.internId)
  if (!verified) {
    return { error: 'You do not have permission to create tasks for this intern' }
  }

  const { user, isAdmin } = verified
  const admin = createAdminClient()

  // If a project is provided, verify it exists and the intern is assigned
  let projectId: string | null = input.projectId

  if (projectId) {
    const { data: assignment } = await admin
      .from('project_assignments')
      .select('id')
      .eq('project_id', projectId)
      .eq('intern_id', input.internId)
      .maybeSingle()

    if (!assignment) {
      return {
        error: 'This intern is not assigned to that project. Create a project first.',
      }
    }
  }

  // Create the task
  const { data: task, error: taskError } = await admin
    .from('tasks')
    .insert({
      project_id: projectId,
      assigned_to: input.internId,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      status: 'todo',
      due_date: input.dueDate || null,
      is_highlight: input.isHighlight,
      created_by: user.id,
    })
    .select()
    .single()

  if (taskError || !task) {
    console.error('Task creation error:', taskError)
    return { error: taskError?.message ?? 'Failed to create task' }
  }

  // Notify the intern
  createNotification({
    userId: input.internId,
    type: 'task_assigned',
    title: '📋 New task assigned',
    body: `"${task.title}" is now on your plate.`,
    link: `/dashboard/tasks/${task.id}`,
    metadata: { taskId: task.id },
  }).catch((err) => {
    console.error('Task notification failed:', err)
  })

  // Audit
  await admin.from('audit_log').insert({
    actor_id: user.id,
    action: 'task.created',
    entity: 'tasks',
    entity_id: task.id,
    metadata: {
      projectId,
      internId: input.internId,
      createdByRole: isAdmin ? 'admin' : 'mentor',
    },
  })

  revalidatePath(`/mentor/interns/${input.internId}`)

  return { success: true, task }
}