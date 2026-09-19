import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft, Calendar, Briefcase, Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/ui/page-header'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { AssignmentPanel } from './assignment-panel'
import { NewTaskForm } from './new-task-form'
import { TaskActionsMenu } from '@/components/tasks/task-actions-menu'
import { ProjectActionsMenu } from '@/components/projects/project-actions-menu'

const STATUS_VARIANTS: Record<
  string,
  'default' | 'info' | 'warning' | 'success' | 'neutral'
> = {
  planning: 'default',
  active: 'info',
  review: 'warning',
  completed: 'success',
  archived: 'neutral',
}

const TASK_STATUS_VARIANTS: Record<
  string,
  'default' | 'info' | 'warning' | 'success'
> = {
  todo: 'default',
  in_progress: 'info',
  review: 'warning',
  done: 'success',
}

export default async function AdminProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (!project) notFound()

  // Assignments
  const { data: assignmentsRaw } = await supabase
    .from('project_assignments')
    .select(
      `id, intern_id, role, compensation_type, assigned_at,
       intern:intern_id (id, full_name, email, avatar_url, status)`
    )
    .eq('project_id', id)

  const assignments = (assignmentsRaw ?? []).map((a: any) => {
    const internRaw = a.intern
    const intern = Array.isArray(internRaw) ? internRaw[0] : internRaw
    return { ...a, intern }
  })

  const assignedIds = assignments.map((a) => a.intern_id)

  // Available interns (not yet on this project)
  const { data: allInterns } = await supabase
    .from('profiles')
    .select('id, full_name, email, avatar_url, status')
    .eq('role', 'intern')
    .eq('status', 'active')
    .order('full_name')

  const availableInterns = (allInterns ?? []).filter(
    (i) => !assignedIds.includes(i.id)
  )

  // Tasks
  const { data: tasksRaw } = await supabase
    .from('tasks')
    .select(
      `id, title, description, status, due_date, is_highlight,
       assigned_to, project_id,
       intern:assigned_to (full_name, email)`
    )
    .eq('project_id', id)
    .order('created_at', { ascending: false })

  const tasks = (tasksRaw ?? []).map((t: any) => {
    const internRaw = t.intern
    const intern = Array.isArray(internRaw) ? internRaw[0] : internRaw
    return { ...t, intern }
  })

  // ─── For the edit modal: projects each task's intern is assigned to ───
  const internIds = [...new Set(tasks.map((t: any) => t.assigned_to))]

  const { data: internProjectAssignments } = internIds.length
    ? await supabase
        .from('project_assignments')
        .select('intern_id, project:project_id (id, title, status)')
        .in('intern_id', internIds)
    : { data: [] as any[] }

  const projectsByIntern = new Map<string, { id: string; title: string }[]>()
  for (const row of (internProjectAssignments ?? []) as any[]) {
    const projRaw = row.project
    const proj = Array.isArray(projRaw) ? projRaw[0] : projRaw
    if (!proj || proj.status === 'archived') continue
    const arr = projectsByIntern.get(row.intern_id) ?? []
    if (!arr.find((p) => p.id === proj.id)) {
      arr.push({ id: proj.id, title: proj.title })
    }
    projectsByIntern.set(row.intern_id, arr)
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl">
      <Link
        href="/admin/projects"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to projects
      </Link>

      <div className="flex items-start justify-between gap-4 mb-6">
        <PageHeader
          title={project.title}
          description={
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant={STATUS_VARIANTS[project.status] ?? 'default'}>
                {project.status}
              </Badge>
              {project.is_client_project && (
                <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-medium">
                  <Briefcase className="w-3 h-3" />
                  Client project
                </span>
              )}
              {project.due_date && (
                <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                  <Calendar className="w-3 h-3" />
                  Due {new Date(project.due_date).toLocaleDateString()}
                </span>
              )}
            </div>
          }
        />
        <div className="flex-shrink-0 mt-1">
          <ProjectActionsMenu
            project={{
              id: project.id,
              title: project.title,
              description: project.description ?? null,
              status: project.status,
              start_date: project.start_date ?? null,
              due_date: project.due_date ?? null,
              is_client_project: project.is_client_project,
            }}
            taskCount={tasks.length}
          />
        </div>
      </div>

      {project.description && (
        <Card className="mb-6">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Description
          </h2>
          <p className="text-sm text-slate-700 whitespace-pre-wrap">
            {project.description}
          </p>
        </Card>
      )}

      {/* Assignment panel */}
      <div className="mb-6">
        <AssignmentPanel
          projectId={id}
          assignments={assignments as any}
          availableInterns={availableInterns ?? []}
        />
      </div>

      {/* Tasks */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-semibold text-slate-900">
          Tasks
        </h2>
        {assignedIds.length > 0 && (
          <NewTaskForm projectId={id} assignedInterns={assignments as any} />
        )}
      </div>

      {tasks.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
          <p className="text-sm text-slate-500">
            {assignedIds.length === 0
              ? 'Assign an intern to start adding tasks.'
              : 'No tasks yet. Create one above.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((t: any) => (
            <Card key={t.id} padding="sm">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {t.is_highlight && (
                      <span className="inline-flex items-center gap-1 text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-medium">
                        <Star className="w-2.5 h-2.5 fill-current" />
                        Highlight
                      </span>
                    )}
                    <span className="font-medium text-slate-900 text-sm">
                      {t.title}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Assigned to{' '}
                    {t.intern?.full_name ?? t.intern?.email ?? 'Unknown'}
                    {t.due_date && (
                      <>
                        {' '}
                        · Due{' '}
                        {new Date(t.due_date).toLocaleDateString()}
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge
                    variant={TASK_STATUS_VARIANTS[t.status] ?? 'default'}
                    size="sm"
                  >
                    {t.status.replace('_', ' ')}
                  </Badge>
                  <TaskActionsMenu
                    task={{
                      id: t.id,
                      title: t.title,
                      description: t.description ?? null,
                      status: t.status,
                      due_date: t.due_date,
                      project_id: t.project_id,
                      is_highlight: t.is_highlight ?? false,
                    }}
                    availableProjects={
                      projectsByIntern.get(t.assigned_to) ?? []
                    }
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}