import Link from 'next/link'
import { Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { EmptyState } from '@/components/ui/empty-state'
import { PageHeader } from '@/components/ui/page-header'
import { Badge } from '@/components/ui/badge'

const STATUS_LABELS: Record<string, string> = {
  todo: 'To do',
  in_progress: 'In progress',
  review: 'In review',
  done: 'Done',
}

const STATUS_VARIANTS: Record<string, 'default' | 'info' | 'warning' | 'success'> = {
  todo: 'default',
  in_progress: 'info',
  review: 'warning',
  done: 'success',
}

const FILTERS = [
  { key: 'open', label: 'Open' },
  { key: 'todo', label: 'To do' },
  { key: 'in_progress', label: 'In progress' },
  { key: 'review', label: 'In review' },
  { key: 'done', label: 'Done' },
  { key: 'all', label: 'All' },
]

export const metadata = { title: 'Tasks — HERMAN Intern Hub' }

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const params = await searchParams
  const activeFilter = params.status ?? 'open'

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  let query = supabase
    .from('tasks')
    .select(
      `id, title, description, status, due_date, is_highlight,
       project:project_id (id, title)`
    )
    .eq('assigned_to', user.id)
    .order('due_date', { ascending: true, nullsFirst: false })

  if (activeFilter === 'open') {
    query = query.neq('status', 'done')
  } else if (activeFilter !== 'all') {
    query = query.eq('status', activeFilter)
  }

  const { data: tasks } = await query

  const { data: allTasks } = await supabase
    .from('tasks')
    .select('status')
    .eq('assigned_to', user.id)

  const counts = {
    all: allTasks?.length ?? 0,
    open: allTasks?.filter((t) => t.status !== 'done').length ?? 0,
    todo: allTasks?.filter((t) => t.status === 'todo').length ?? 0,
    in_progress:
      allTasks?.filter((t) => t.status === 'in_progress').length ?? 0,
    review: allTasks?.filter((t) => t.status === 'review').length ?? 0,
    done: allTasks?.filter((t) => t.status === 'done').length ?? 0,
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl">
      <PageHeader
        title="My Tasks"
        description="All tasks assigned to you across projects."
      />

      {/* Filter tabs */}
      <div className="flex gap-1 mb-6 border-b border-slate-200 overflow-x-auto">
        {FILTERS.map((f) => {
          const active = activeFilter === f.key
          return (
            <Link
              key={f.key}
              href={`/dashboard/tasks?status=${f.key}`}
              className={`px-4 py-2 text-sm border-b-2 whitespace-nowrap transition-colors ${
                active
                  ? 'border-slate-900 text-slate-900 font-medium'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {f.label}
              <span className="ml-2 text-xs text-slate-400">
                {counts[f.key as keyof typeof counts] ?? 0}
              </span>
            </Link>
          )
        })}
      </div>

      {!tasks || tasks.length === 0 ? (
        <EmptyState
          icon="✅"
          title="No tasks here"
          description="Nothing to work on right now. Your mentor will assign tasks soon."
        />
      ) : (
        <div className="space-y-3">
          {tasks.map((task: any) => (
            <Link
              key={task.id}
              href={`/dashboard/tasks/${task.id}`}
              className="block bg-white border border-slate-200 rounded-xl p-4 sm:p-5 hover:border-slate-400 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {task.is_highlight && (
                      <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-medium">
                        <Star className="w-3 h-3 fill-current" />
                        Highlight
                      </span>
                    )}
                    <h3 className="font-medium text-slate-900">
                      {task.title}
                    </h3>
                  </div>
                  {task.description && (
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                      {task.description}
                    </p>
                  )}
                  <div className="text-xs text-slate-400 mt-2">
                    {task.project?.title}
                    {task.due_date && (
                      <>
                        {' '}
                        · Due{' '}
                        {new Date(task.due_date).toLocaleDateString()}
                      </>
                    )}
                  </div>
                </div>

                <Badge variant={STATUS_VARIANTS[task.status] ?? 'default'}>
                  {STATUS_LABELS[task.status] ?? task.status}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}