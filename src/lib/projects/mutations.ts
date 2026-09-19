'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

type ProjectStatus = 'planning' | 'active' | 'review' | 'completed' | 'archived'

type UpdateInput = {
  projectId: string
  title: string
  description: string
  status: ProjectStatus
  startDate: string
  dueDate: string
  isClientProject: boolean
}

/**
 * Verifies the current user can manage this project.
 * Rule (model B):
 *   - admin / super_admin: can manage any project
 *   - mentor: can manage only projects they created (created_by = user.id)
 *   - everyone else: no access
 */
async function verifyProjectManageAccess(projectId: string) {
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

  const { data: project } = await admin
    .from('projects')
    .select('id, title, created_by, status')
    .eq('id', projectId)
    .single()

  if (!project) return null

  // Mentors can only manage their own creations
  if (isMentor && !isAdmin && project.created_by !== user.id) {
    return null
  }

  return { user, actor, project, isAdmin }
}

function revalidateProject(projectId: string) {
  revalidatePath('/admin/projects')
  revalidatePath(`/admin/projects/${projectId}`)
  revalidatePath('/mentor/projects')
}

/* ─────────────────────────── UPDATE ─────────────────────────── */

export async function updateProject(
  input: UpdateInput
): Promise<{ success: true } | { error: string }> {
  if (!input.title?.trim()) return { error: 'Title is required' }

  const VALID: ProjectStatus[] = [
    'planning',
    'active',
    'review',
    'completed',
    'archived',
  ]
  if (!VALID.includes(input.status)) return { error: 'Invalid status' }

  const verified = await verifyProjectManageAccess(input.projectId)
  if (!verified) return { error: 'You do not have permission to edit this project' }

  const { user } = verified
  const admin = createAdminClient()

  const { error } = await admin
    .from('projects')
    .update({
      title: input.title.trim(),
      description: input.description?.trim() || null,
      status: input.status,
      start_date: input.startDate || null,
      due_date: input.dueDate || null,
      is_client_project: input.isClientProject,
    })
    .eq('id', input.projectId)

  if (error) {
    console.error('Project update error:', error)
    return { error: error.message }
  }

  await admin.from('audit_log').insert({
    actor_id: user.id,
    action: 'project.updated',
    entity: 'projects',
    entity_id: input.projectId,
    metadata: { title: input.title, status: input.status },
  })

  revalidateProject(input.projectId)
  return { success: true }
}

/* ─────────────────────── ARCHIVE / UNARCHIVE ─────────────────────── */

export async function archiveProject(
  projectId: string
): Promise<{ success: true } | { error: string }> {
  const verified = await verifyProjectManageAccess(projectId)
  if (!verified) return { error: 'You do not have permission to archive this project' }

  const { user } = verified
  const admin = createAdminClient()

  const { error } = await admin
    .from('projects')
    .update({ status: 'archived' })
    .eq('id', projectId)

  if (error) return { error: error.message }

  await admin.from('audit_log').insert({
    actor_id: user.id,
    action: 'project.archived',
    entity: 'projects',
    entity_id: projectId,
  })

  revalidateProject(projectId)
  return { success: true }
}

export async function unarchiveProject(
  projectId: string
): Promise<{ success: true } | { error: string }> {
  const verified = await verifyProjectManageAccess(projectId)
  if (!verified) return { error: 'You do not have permission to unarchive this project' }

  const { user } = verified
  const admin = createAdminClient()

  const { error } = await admin
    .from('projects')
    .update({ status: 'active' })
    .eq('id', projectId)

  if (error) return { error: error.message }

  await admin.from('audit_log').insert({
    actor_id: user.id,
    action: 'project.unarchived',
    entity: 'projects',
    entity_id: projectId,
  })

  revalidateProject(projectId)
  return { success: true }
}

/* ─────────────────────────── DELETE ─────────────────────────── */

export async function deleteProject(
  projectId: string
): Promise<{ success: true } | { error: string }> {
  const verified = await verifyProjectManageAccess(projectId)
  if (!verified) return { error: 'You do not have permission to delete this project' }

  const { user, project } = verified
  const admin = createAdminClient()

  // Safety: refuse if any tasks attached.
  // tasks.project_id is NOT NULL with ON DELETE CASCADE,
  // so a delete here would silently wipe all the tasks.
  const { count: taskCount } = await admin
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', projectId)

  if ((taskCount ?? 0) > 0) {
    return {
      error: `This project has ${taskCount} task${
        taskCount === 1 ? '' : 's'
      }. Archive it instead, or delete the tasks first.`,
    }
  }

  const { error } = await admin.from('projects').delete().eq('id', projectId)

  if (error) {
    console.error('Project delete error:', error)
    return { error: error.message }
  }

  await admin.from('audit_log').insert({
    actor_id: user.id,
    action: 'project.deleted',
    entity: 'projects',
    entity_id: projectId,
    metadata: { title: project.title },
  })

  revalidateProject(projectId)
  return { success: true }
}