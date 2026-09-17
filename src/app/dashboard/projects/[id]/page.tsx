import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const TASK_STATUS_COLORS: Record<string, string> = {
  todo: 'bg-slate-100 text-slate-700',
  in_progress: 'bg-blue-100 text-blue-700',
  review: 'bg-amber-100 text-amber-700',
  done: 'bg-green-100 text-green-700',
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

  // Load the project + verify assignment
  const { data: assignment } = await supabase
    .from('project_assignments')
    .select(
      `id, role, compensation_type,
       project:project_id (
         id, title, description, status, start_date, due_date, is_client_project, created_by
       )`
    )
    .eq('intern_id', user.id)
    .eq('project_id', id)
    .maybeSingle()

  if (!assignment || !assignment.project) notFound()
  const p: any = assignment.project

  // Load tasks for this project assigned to this intern
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
        className="text-sm text-slate-500 hover:text-slate-900"
      >
        ← Back to projects
      </Link>

      <div className="mt-4">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-slate-900">{p.title}</h1>
          {p.is_client_project && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">
              Client project
            </span>
          )}
        </div>
        <p className="text-sm text-slate-500">
          Role: <span className="capitalize">{assignment.role}</span>
          {p.due_date && (
            <> · Due {new Date(p.due_date).toLocaleDateString()}</>
          )}
          {p.start_date && (
            <> · Started {new Date(p.start_date).toLocaleDateString()}</>
          )}
        </p>
      </div>

      {p.description && (
        <div className="mt-6 bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Description
          </h2>
          <p className="text-sm text-slate-700 whitespace-pre-wrap">
            {p.description}
          </p>
        </div>
      )}

      {/* Tasks */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Your tasks in this project
        </h2>

        {!tasks || tasks.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-sm">
            No tasks assigned for you in this project yet.
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <Link
                key={task.id}
                href={`/dashboard/tasks/${task.id}`}
                className="block bg-white border border-slate-200 rounded-lg p-4 hover:border-slate-400 transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="font-medium text-slate-900">
                      {task.title}
                    </div>
                    {task.due_date && (
                      <div className="text-xs text-slate-400 mt-0.5">
                        Due {new Date(task.due_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      TASK_STATUS_COLORS[task.status] ??
                      'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}