import Link from 'next/link'
import { Plus, Users, Calendar, ChevronRight, Briefcase } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/ui/page-header'
import { EmptyState } from '@/components/ui/empty-state'
import { Badge } from '@/components/ui/badge'
import { ProjectActionsMenu } from '@/components/projects/project-actions-menu'

export const metadata = { title: 'My Projects — HERMAN Mentor' }

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

export default async function MentorProjectsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Only projects this mentor created
  const { data: projects } = await supabase
    .from('projects')
    .select(
      `id, title, description, status, start_date, due_date,
       is_client_project, created_at, created_by`
    )
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })

  const projectIds = (projects ?? []).map((p) => p.id)
  const assignmentCounts = new Map<string, number>()
  const taskCounts = new Map<string, number>()

  if (projectIds.length > 0) {
    const { data: assignments } = await supabase
      .from('project_assignments')
      .select('project_id')
      .in('project_id', projectIds)

    for (const a of assignments ?? []) {
      assignmentCounts.set(
        a.project_id,
        (assignmentCounts.get(a.project_id) ?? 0) + 1
      )
    }

    const { data: taskRows } = await supabase
      .from('tasks')
      .select('project_id')
      .in('project_id', projectIds)

    for (const t of taskRows ?? []) {
      taskCounts.set(t.project_id, (taskCounts.get(t.project_id) ?? 0) + 1)
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl">
      <PageHeader
        title="My projects"
        description="Projects you created and manage."
      />

      {!projects || projects.length === 0 ? (
        <EmptyState
          icon="📁"
          title="No projects yet"
          description="You can create a project from any of your interns' pages."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {projects.map((p) => {
            const internCount = assignmentCounts.get(p.id) ?? 0
            const taskCount = taskCounts.get(p.id) ?? 0
            return (
              <div
                key={p.id}
                className="group bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-400 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={STATUS_VARIANTS[p.status] ?? 'default'}>
                      {p.status}
                    </Badge>
                    {p.is_client_project && (
                      <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-medium">
                        <Briefcase className="w-3 h-3" />
                        Client
                      </span>
                    )}
                  </div>
                  <ProjectActionsMenu
                    project={{
                      id: p.id,
                      title: p.title,
                      description: p.description ?? null,
                      status: p.status as any,
                      start_date: p.start_date ?? null,
                      due_date: p.due_date ?? null,
                      is_client_project: p.is_client_project,
                    }}
                    taskCount={taskCount}
                  />
                </div>

                <h3 className="font-semibold text-slate-900 text-lg">
                  {p.title}
                </h3>

                {p.description && (
                  <p className="text-sm text-slate-500 mt-2 line-clamp-2">
                    {p.description}
                  </p>
                )}

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 gap-3 flex-wrap">
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="w-3 h-3" />
                    {internCount} {internCount === 1 ? 'intern' : 'interns'}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" />
                    {p.due_date
                      ? `Due ${new Date(p.due_date).toLocaleDateString()}`
                      : 'No due date'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}