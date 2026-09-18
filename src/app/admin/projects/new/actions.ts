'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function createProject(input: {
  title: string
  description: string
  status: 'planning' | 'active' | 'review' | 'completed' | 'archived'
  startDate: string
  dueDate: string
  isClientProject: boolean
}) {
  if (!input.title?.trim()) return { error: 'Title is required' }

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
    return { error: 'Only admins can create projects' }
  }

  const admin = createAdminClient()

  const { data: project, error } = await admin
    .from('projects')
    .insert({
      title: input.title.trim(),
      description: input.description?.trim() || null,
      status: input.status,
      start_date: input.startDate || null,
      due_date: input.dueDate || null,
      is_client_project: input.isClientProject,
      created_by: user.id,
    })
    .select()
    .single()

  if (error || !project) {
    console.error('Project creation error:', error)
    return { error: error?.message ?? 'Failed to create project' }
  }

  await admin.from('audit_log').insert({
    actor_id: user.id,
    action: 'project.created',
    entity: 'projects',
    entity_id: project.id,
    metadata: { title: project.title },
  })

  revalidatePath('/admin/projects')

  return { success: true, projectId: project.id }
}