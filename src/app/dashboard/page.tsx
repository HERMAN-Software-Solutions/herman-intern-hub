import Link from 'next/link'
import { ArrowRight, Calendar, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select(
      `full_name, start_date, end_date, mentor_id,
       mentor:mentor_id (full_name, email)`
    )
    .eq('id', user.id)
    .single()

  const mentorRaw = (profile as any)?.mentor
  const mentor = Array.isArray(mentorRaw) ? mentorRaw[0] : mentorRaw

  const today = new Date().toISOString().slice(0, 10)
  const { data: todayLog } = await supabase
    .from('daily_logs')
    .select('id, hours_worked, description')
    .eq('intern_id', user.id)
    .eq('date', today)
    .maybeSingle()

  const { data: assignments } = await supabase
    .from('project_assignments')
    .select(
      `id, role, compensation_type,
       project:project_id (id, title, status, due_date)`
    )
    .eq('intern_id', user.id)

  const { data: tasks } = await supabase
    .from('tasks')
    .select('id, title, status, due_date, project:project_id (title)')
    .eq('assigned_to', user.id)
    .neq('status', 'done')
    .order('due_date', { ascending: true })
    .limit(5)

  const displayName =
    profile?.full_name?.trim() &&
    profile.full_name.trim().split(' ')[0].toLowerCase() !== 'herman'
      ? profile.full_name.trim().split(' ')[0]
      : null

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          {displayName ? `Welcome back, ${displayName}` : 'Welcome back'}
        </h1>
        <p className="text-slate-500 mt-1 text-sm sm:text-base">
          {profile?.start_date && profile?.end_date
            ? `Internship: ${new Date(profile.start_date).toLocaleDateString()} – ${new Date(profile.end_date).toLocaleDateString()}`
            : "Here's what's on your plate."}
        </p>
      </div>

      {/* Mentor card */}
      {mentor && (
        <Card className="mb-6">
          <div className="flex items-center gap-4">
            <Avatar name={mentor.full_name ?? mentor.email} size="md" />
            <div className="min-w-0">
              <div className="text-xs text-slate-500">Your mentor</div>
              <div className="font-medium text-slate-900 truncate">
                {mentor.full_name ?? mentor.email}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Today's log */}
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            Today&apos;s log
          </h2>
          <Link
            href="/dashboard/logs"
            className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1 transition-colors"
          >
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {todayLog ? (
          <div>
            <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
              ✓ Logged {todayLog.hours_worked}h today
            </div>
            <p className="text-slate-600 mt-3 text-sm line-clamp-2">
              {todayLog.description}
            </p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-slate-500 mb-3">
              You haven&apos;t logged today&apos;s work yet.
            </p>
            <Link
              href="/dashboard/logs"
               className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white text-sm font-medium px-4 py-2.5 rounded-lg shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
            >
              Log today&apos;s work
           </Link>
          </div>
        )}
      </Card>

      {/* Two columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {/* Projects */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Your projects</h2>
            <Link
              href="/dashboard/projects"
              className="text-xs text-blue-600 hover:underline transition-colors"
            >
              View all →
            </Link>
          </div>

          {!assignments || assignments.length === 0 ? (
            <p className="text-sm text-slate-500">
              No projects assigned yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {assignments.slice(0, 3).map((a: any) => (
                <li key={a.id}>
                  <Link
                    href={`/dashboard/projects/${a.project?.id}`}
                    className="block p-3 -m-1 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="font-medium text-slate-900 text-sm truncate">
                      {a.project?.title}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                      <span className="capitalize">{a.role}</span>
                      <span>·</span>
                      <span className="capitalize">{a.project?.status}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Tasks */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Tasks</h2>
            <Link
              href="/dashboard/tasks"
              className="text-xs text-blue-600 hover:underline transition-colors"
            >
              View all →
            </Link>
          </div>

          {!tasks || tasks.length === 0 ? (
            <p className="text-sm text-slate-500">No open tasks.</p>
          ) : (
            <ul className="space-y-3">
              {tasks.map((t: any) => (
                <li key={t.id}>
                  <Link
                    href={`/dashboard/tasks/${t.id}`}
                    className="block p-3 -m-1 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="font-medium text-slate-900 text-sm truncate">
                      {t.title}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {t.project?.title}
                      {t.due_date && (
                        <> · Due {new Date(t.due_date).toLocaleDateString()}</>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}