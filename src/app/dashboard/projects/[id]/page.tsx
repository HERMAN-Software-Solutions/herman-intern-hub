import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft, Calendar, Briefcase } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/ui/page-header'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'

const TASK_STATUS_VARIANTS: Record<
  string,
  'default' | 'info' | 'warning' | 'success'
> = {
  todo: 'default',
  in_progress: 'info',
  review: 'warning',
  done: 'success',
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: assignment } = await supabase
    .from('project_assignments')
    .select(
      `id, role, compensation_type,
       project:project_id (
         id, title, description, status, start_date, due_date, is_client_project
       )`
    )
    .eq('intern_id', user.id)
    .eq('project_id', id)
    .maybeSingle()

  if (!assignment || !assignment.project) notFound()
  const p: any = assignment.project

  const { data: tasks } = await supabase
    .from('tasks')
    .select('id, title, description, status, due_date')
    .eq('project_id', id)
    .eq('assigned_to', user.id)
    .order('due_date', { ascending: true, nullsFirst: false })

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl">
      <Link
        href="/dashboard/projects"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to projects
      </Link>

      <PageHeader
        title={p.title}
        description={
          <>
            Role: <span className="capitalize">{assignment.role}</span>
            {p.due_date && (
              <> · Due {new Date(p.due_date).toLocaleDateString()}</>
            )}
            {p.start_date && (
              <> · Started {new Date(p.start_date).toLocaleDateString()}</>
            )}
          </>
        }
        action={
          p.is_client_project ? (
            <span className="inline-flex items-center gap-1.5 text-xs bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full font-medium">
              <Briefcase className="w-3 h-3" />
              Client project
            </span>
          ) : undefined
        }
      />

      {p.description && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 mb-6">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Description
          </h2>
          <p className="text-sm text-slate-700 whitespace-pre-wrap">
            {p.description}
          </p>
        </div>
      )}

      <div>
        <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-4">
          Your tasks in this project
        </h2>

        {!tasks || tasks.length === 0 ? (
          <EmptyState
            icon="✅"
            title="No tasks yet"
            description="Your mentor will assign tasks for this project soon."
          />
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <Link
                key={task.id}
                href={`/dashboard/tasks/${task.id}`}
                className="block bg-white border border-slate-200 rounded-lg p-4 hover:border-slate-400 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="font-medium text-slate-900 truncate">
                      {task.title}
                    </div>
                    {task.due_date && (
                      <div className="text-xs text-slate-400 mt-0.5 inline-flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Due {new Date(task.due_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <Badge
                    variant={TASK_STATUS_VARIANTS[task.status] ?? 'default'}
                  >
                    {task.status.replace('_', ' ')}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}