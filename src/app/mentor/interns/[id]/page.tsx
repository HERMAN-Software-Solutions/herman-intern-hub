import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ChevronLeft,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  AlertTriangle,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/ui/page-header'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { NewTaskForm } from './new-task-form'

const STATUS_VARIANTS: Record<
  string,
  'default' | 'info' | 'warning' | 'success' | 'neutral'
> = {
  onboarding: 'warning',
  active: 'success',
  paused: 'neutral',
  completed: 'info',
  withdrawn: 'neutral',
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

export default async function MentorInternDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verify this intern is assigned to this mentor
  const { data: intern } = await supabase
    .from('profiles')
    .select(
      `id, full_name, email, avatar_url, status, bio,
       university, course, year_of_study,
       start_date, end_date, mentor_id,
       agreement_signed_at, created_at`
    )
    .eq('id', id)
    .eq('role', 'intern')
    .eq('mentor_id', user.id)
    .maybeSingle()

  if (!intern) notFound()

  // Fetch all active projects (for the task form dropdown)
  const { data: projects } = await supabase
    .from('projects')
    .select('id, title, status, is_client_project')
    .neq('status', 'archived')
    .order('title', { ascending: true })

  // Fetch all tasks for this intern
  const { data: tasks } = await supabase
    .from('tasks')
    .select('id, title, status, due_date, is_highlight')
    .eq('assigned_to', id)
    .order('due_date', { ascending: true, nullsFirst: false })

  // Recent logs
  const { data: logs } = await supabase
    .from('daily_logs')
    .select('id, date, hours_worked, description')
    .eq('intern_id', id)
    .order('date', { ascending: false })
    .limit(5)

  // Recent submissions
  const { data: submissions } = await supabase
    .from('submissions')
    .select(
      `id, content, status, submitted_at,
       task:task_id (title)`
    )
    .eq('intern_id', id)
    .order('submitted_at', { ascending: false })
    .limit(5)

  // Stats
  const totalTasks = tasks?.length ?? 0
  const doneTasks = tasks?.filter((t) => t.status === 'done').length ?? 0
  const totalHours =
    logs?.reduce((sum, l) => sum + Number(l.hours_worked), 0) ?? 0

  const { count: pendingSubCount } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true })
    .eq('intern_id', id)
    .eq('status', 'pending')

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
      <Link
        href="/mentor/interns"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to interns
      </Link>

      <div className="flex flex-col sm:flex-row items-start gap-4 mb-8">
        <Avatar
          name={intern.full_name}
          src={intern.avatar_url}
          size="xl"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {intern.full_name ?? 'Unnamed intern'}
            </h1>
            <Badge variant={STATUS_VARIANTS[intern.status] ?? 'default'}>
              {intern.status}
            </Badge>
          </div>
          <p className="text-slate-500">{intern.email}</p>
          <div className="flex items-center gap-4 mt-2 text-xs text-slate-400 flex-wrap">
            {intern.university && <span>{intern.university}</span>}
            {intern.course && <span>· {intern.course}</span>}
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <KPI
          icon={<CheckCircle2 className="w-4 h-4" />}
          label="Tasks done"
          value={`${doneTasks}/${totalTasks}`}
          accent="green"
        />
        <KPI
          icon={<Clock className="w-4 h-4" />}
          label="Hours logged"
          value={`${totalHours}h`}
          accent="blue"
        />
        <KPI
          icon={<FileText className="w-4 h-4" />}
          label="Pending reviews"
          value={pendingSubCount ?? 0}
          accent={pendingSubCount && pendingSubCount > 0 ? 'amber' : 'default'}
        />
        <KPI
          icon={<Calendar className="w-4 h-4" />}
          label="Since"
          value={
            intern.start_date
              ? new Date(intern.start_date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })
              : '—'
          }
          accent="default"
        />
      </div>

      {intern.bio && (
        <Card className="mb-6">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            About
          </h2>
          <p className="text-sm text-slate-700 whitespace-pre-wrap">
            {intern.bio}
          </p>
        </Card>
      )}

      {/* Tasks section with New Task form */}
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
            Tasks
          </h2>
          <NewTaskForm internId={id} projects={projects ?? []} />
        </div>

        {!tasks || tasks.length === 0 ? (
          <p className="text-sm text-slate-500">
            No tasks assigned to this intern yet. Create one to get started.
          </p>
        ) : (
          <ul className="space-y-2">
            {tasks.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between gap-3 py-2 border-b border-slate-100 last:border-0 text-sm"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {t.is_highlight && (
                    <span className="text-amber-500 flex-shrink-0">★</span>
                  )}
                  <span className="text-slate-700 truncate">{t.title}</span>
                  {t.due_date && (
                    <span className="text-xs text-slate-400 flex-shrink-0 hidden sm:inline">
                      · Due{' '}
                      {new Date(t.due_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  )}
                </div>
                <Badge
                  variant={TASK_STATUS_VARIANTS[t.status] ?? 'default'}
                  size="sm"
                >
                  {t.status.replace('_', ' ')}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Recent logs */}
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
            Recent daily logs
          </h2>
          <span className="text-xs text-slate-400">Last 5 entries</span>
        </div>

        {!logs || logs.length === 0 ? (
          <p className="text-sm text-slate-500">No logs yet.</p>
        ) : (
          <ul className="space-y-3">
            {logs.map((log) => (
              <li key={log.id} className="text-sm">
                <div className="flex items-center justify-between gap-3 mb-1">
                  <span className="font-medium text-slate-900">
                    {new Date(log.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <span className="text-slate-500 text-xs">
                    {log.hours_worked}h
                  </span>
                </div>
                <p className="text-slate-600 text-xs leading-relaxed line-clamp-2">
                  {log.description}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Recent submissions */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
            Recent submissions
          </h2>
          <span className="text-xs text-slate-400">Last 5</span>
        </div>

        {!submissions || submissions.length === 0 ? (
          <p className="text-sm text-slate-500">No submissions yet.</p>
        ) : (
          <ul className="space-y-3">
            {submissions.map((sub: any) => {
              const taskRaw = sub.task
              const task = Array.isArray(taskRaw) ? taskRaw[0] : taskRaw
              return (
                <li key={sub.id} className="text-sm">
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <span className="font-medium text-slate-900 truncate">
                      {task?.title ?? 'Task'}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${
                        sub.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : sub.status === 'needs_revision'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {sub.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs">
                    {new Date(sub.submitted_at).toLocaleDateString()}
                  </p>
                </li>
              )
            })}
          </ul>
        )}
      </Card>
    </div>
  )
}

function KPI({
  icon,
  label,
  value,
  accent = 'default',
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  accent?: 'default' | 'green' | 'blue' | 'amber'
}) {
  const colors = {
    default: 'text-slate-900',
    green: 'text-green-600',
    blue: 'text-blue-600',
    amber: 'text-amber-600',
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <div className="flex items-center gap-1.5 text-slate-400 mb-2">
        {icon}
        <span className="text-[10px] font-medium uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className={`text-xl font-bold ${colors[accent]}`}>{value}</div>
    </div>
  )
}