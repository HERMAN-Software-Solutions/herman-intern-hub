import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

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

  // Today's log
  const today = new Date().toISOString().slice(0, 10)
  const { data: todayLog } = await supabase
    .from('daily_logs')
    .select('id, hours_worked, description')
    .eq('intern_id', user.id)
    .eq('date', today)
    .maybeSingle()

  // Assignments
  const { data: assignments } = await supabase
    .from('project_assignments')
    .select(
      `id, role, compensation_type,
       project:project_id (id, title, status, due_date)`
    )
    .eq('intern_id', user.id)

  // Tasks due this week
  const { data: tasks } = await supabase
    .from('tasks')
    .select('id, title, status, due_date, project:project_id (title)')
    .eq('assigned_to', user.id)
    .neq('status', 'done')
    .order('due_date', { ascending: true })
    .limit(5)

  const firstName = profile?.full_name?.split(' ')[0] ?? 'there'

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-3xl font-bold text-slate-900">
        Welcome, {firstName} 👋
      </h1>
      <p className="text-slate-500 mt-1">
        {profile?.start_date && profile?.end_date
          ? `Internship: ${new Date(profile.start_date).toLocaleDateString()} → ${new Date(profile.end_date).toLocaleDateString()}`
          : 'Here\u2019s what\u2019s on your plate.'}
      </p>

      {/* Mentor card */}
      {profile?.mentor && (
        <div className="mt-6 bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center font-semibold">
            {(profile.mentor.full_name ?? profile.mentor.email)
              .charAt(0)
              .toUpperCase()}
          </div>
          <div>
            <div className="text-sm text-slate-500">Your mentor</div>
            <div className="font-medium text-slate-900">
              {profile.mentor.full_name ?? profile.mentor.email}
            </div>
          </div>
        </div>
      )}

      {/* Today's log */}
      <div className="mt-6 bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-900">Today's log</h2>
          <Link
            href="/dashboard/logs"
            className="text-xs text-blue-600 hover:underline"
          >
            View all →
          </Link>
        </div>

        {todayLog ? (
          <div className="text-sm">
            <div className="text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
              ✅ Logged {todayLog.hours_worked}h today
            </div>
            <p className="text-slate-600 mt-2 line-clamp-2">
              {todayLog.description}
            </p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-slate-500 mb-3">
              You haven't logged today's work yet.
            </p>
            <Link
              href="/dashboard/logs"
              className="inline-block bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Log today's work →
            </Link>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6 mt-6">
        {/* Projects */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Your projects</h2>
            <Link
              href="/dashboard/projects"
              className="text-xs text-blue-600 hover:underline"
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
                <li key={a.id} className="text-sm">
                  <div className="font-medium text-slate-900">
                    {a.project?.title}
                  </div>
                  <div className="text-xs text-slate-500 capitalize">
                    {a.role} · {a.project?.status}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Tasks */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Tasks</h2>
            <Link
              href="/dashboard/tasks"
              className="text-xs text-blue-600 hover:underline"
            >
              View all →
            </Link>
          </div>

          {!tasks || tasks.length === 0 ? (
            <p className="text-sm text-slate-500">No open tasks.</p>
          ) : (
            <ul className="space-y-3">
              {tasks.map((t: any) => (
                <li key={t.id} className="text-sm">
                  <div className="font-medium text-slate-900">{t.title}</div>
                  <div className="text-xs text-slate-500">
                    {t.project?.title}
                    {t.due_date && (
                      <> · Due {new Date(t.due_date).toLocaleDateString()}</>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}