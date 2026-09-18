import Link from 'next/link'
import { Users, ChevronRight, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/ui/page-header'
import { Card } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'

export const metadata = { title: 'My Interns — HERMAN Mentor Panel' }

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

export default async function MentorInternsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get assigned interns
  const { data: interns } = await supabase
    .from('profiles')
    .select(
      `id, full_name, email, avatar_url, status, university, course,
       start_date, end_date, created_at`
    )
    .eq('role', 'intern')
    .eq('mentor_id', user.id)
    .order('created_at', { ascending: false })

  // For each intern, count tasks and pending submissions
  const internIds = (interns ?? []).map((i) => i.id)

  const taskCounts = new Map<string, { total: number; done: number }>()
  const pendingSubs = new Map<string, number>()

  if (internIds.length > 0) {
    const { data: tasks } = await supabase
      .from('tasks')
      .select('assigned_to, status')
      .in('assigned_to', internIds)

    for (const t of tasks ?? []) {
      const current = taskCounts.get(t.assigned_to) ?? { total: 0, done: 0 }
      current.total += 1
      if (t.status === 'done') current.done += 1
      taskCounts.set(t.assigned_to, current)
    }

    const { data: subs } = await supabase
      .from('submissions')
      .select('intern_id, status')
      .in('intern_id', internIds)
      .eq('status', 'pending')

    for (const s of subs ?? []) {
      pendingSubs.set(s.intern_id, (pendingSubs.get(s.intern_id) ?? 0) + 1)
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl">
      <PageHeader
        title="My interns"
        description="Interns assigned to you for mentoring."
      />

      {!interns || interns.length === 0 ? (
        <EmptyState
          icon="👥"
          title="No interns assigned yet"
          description="An admin will assign interns to you. You'll get a notification when that happens."
        />
      ) : (
        <div className="space-y-3">
          {interns.map((intern) => {
            const counts = taskCounts.get(intern.id) ?? { total: 0, done: 0 }
            const pending = pendingSubs.get(intern.id) ?? 0
            const completionPct =
              counts.total > 0
                ? Math.round((counts.done / counts.total) * 100)
                : 0

            return (
              <Link
                key={intern.id}
                href={`/mentor/interns/${intern.id}`}
                className="block bg-white border border-slate-200 rounded-xl p-4 sm:p-5 hover:border-slate-400 hover:shadow-sm transition-all"
              >
                <div className="flex items-start gap-4">
                  <Avatar
                    name={intern.full_name}
                    src={intern.avatar_url}
                    size="md"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="min-w-0">
                        <div className="font-medium text-slate-900 truncate">
                          {intern.full_name ?? 'Unnamed intern'}
                        </div>
                        <div className="text-xs text-slate-500 truncate mt-0.5">
                          {intern.university ?? intern.email}
                        </div>
                      </div>
                      <Badge
                        variant={STATUS_VARIANTS[intern.status] ?? 'default'}
                      >
                        {intern.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3 text-xs">
                      <div>
                        <div className="text-slate-500">Tasks</div>
                        <div className="text-slate-900 font-medium mt-0.5">
                          {counts.done}/{counts.total} done
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-500">Progress</div>
                        <div className="text-slate-900 font-medium mt-0.5">
                          {completionPct}%
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-500">Pending reviews</div>
                        <div
                          className={`font-medium mt-0.5 ${
                            pending > 0 ? 'text-amber-600' : 'text-slate-900'
                          }`}
                        >
                          {pending}
                        </div>
                      </div>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0 mt-1" />
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}