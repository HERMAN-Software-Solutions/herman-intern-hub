import Link from 'next/link'
import { Paperclip } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/ui/page-header'
import { EmptyState } from '@/components/ui/empty-state'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'

export const metadata = { title: 'Review Queue — HERMAN Mentor Panel' }

const SUBMISSION_VARIANTS: Record<
  string,
  'success' | 'warning' | 'danger'
> = {
  pending: 'warning',
  approved: 'success',
  needs_revision: 'danger',
}

const SUBMISSION_LABELS: Record<string, string> = {
  pending: 'Pending',
  approved: 'Approved',
  needs_revision: 'Needs revision',
}

const FILTERS = [
  { key: 'pending', label: 'Pending' },
  { key: 'needs_revision', label: 'Needs revision' },
  { key: 'approved', label: 'Approved' },
  { key: 'all', label: 'All' },
]

export default async function MentorSubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const params = await searchParams
  const activeFilter = params.status ?? 'pending'

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get all interns assigned to this mentor
  const { data: myInterns } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'intern')
    .eq('mentor_id', user.id)

  const internIds = (myInterns ?? []).map((i) => i.id)

  // If no interns, show empty state early
  if (internIds.length === 0) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl">
        <PageHeader
          title="Review queue"
          description="Submissions from your assigned interns."
        />
        <EmptyState
          icon="📥"
          title="No interns assigned yet"
          description="Once an admin assigns interns to you, their submissions will appear here."
        />
      </div>
    )
  }

  // Fetch submissions
  let query = supabase
    .from('submissions')
    .select(
      `id, content, file_url, status, submitted_at,
       intern:intern_id (id, full_name, email, avatar_url),
       task:task_id (id, title, project:project_id (title))`
    )
    .in('intern_id', internIds)
    .order('submitted_at', { ascending: false })

  if (activeFilter !== 'all') {
    query = query.eq('status', activeFilter)
  }

  const { data: submissions } = await query

  // Counts
  const { data: allSubs } = await supabase
    .from('submissions')
    .select('status')
    .in('intern_id', internIds)

  const counts = {
    all: allSubs?.length ?? 0,
    pending: allSubs?.filter((s) => s.status === 'pending').length ?? 0,
    approved: allSubs?.filter((s) => s.status === 'approved').length ?? 0,
    needs_revision:
      allSubs?.filter((s) => s.status === 'needs_revision').length ?? 0,
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl">
      <PageHeader
        title="Review queue"
        description="Submissions from your assigned interns."
      />

      {/* Filter tabs */}
      <div className="flex gap-1 mb-6 border-b border-slate-200 overflow-x-auto">
        {FILTERS.map((f) => {
          const active = activeFilter === f.key
          return (
            <Link
              key={f.key}
              href={`/mentor/submissions?status=${f.key}`}
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

      {!submissions || submissions.length === 0 ? (
        <EmptyState
          icon="✅"
          title="Nothing here"
          description={
            activeFilter === 'pending'
              ? "You're all caught up. No pending submissions to review."
              : 'No submissions match this filter.'
          }
        />
      ) : (
        <div className="space-y-3">
          {submissions.map((sub: any) => {
            const internRaw = sub.intern
            const intern = Array.isArray(internRaw) ? internRaw[0] : internRaw

            const taskRaw = sub.task
            const task = Array.isArray(taskRaw) ? taskRaw[0] : taskRaw

            const projectRaw = task?.project
            const project = Array.isArray(projectRaw)
              ? projectRaw[0]
              : projectRaw

            return (
              <Link
                key={sub.id}
                href={`/mentor/submissions/${sub.id}`}
                className="block bg-white border border-slate-200 rounded-xl p-4 sm:p-5 hover:border-slate-400 hover:shadow-sm transition-all"
              >
                <div className="flex items-start gap-3">
                  <Avatar
                    name={intern?.full_name}
                    src={intern?.avatar_url}
                    size="sm"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Badge
                        variant={SUBMISSION_VARIANTS[sub.status] ?? 'default'}
                      >
                        {SUBMISSION_LABELS[sub.status] ?? sub.status}
                      </Badge>
                      <span className="text-xs text-slate-400">
                        {new Date(sub.submitted_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="font-medium text-slate-900 truncate">
                      {task?.title ?? 'Untitled task'}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 truncate">
                      {intern?.full_name ?? intern?.email ?? 'Unknown intern'}
                      {project?.title && <> · {project.title}</>}
                    </div>

                    <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                      {sub.content}
                    </p>

                    {sub.file_url && (
                      <div className="text-xs text-blue-600 mt-2 inline-flex items-center gap-1">
                        <Paperclip className="w-3 h-3" />
                        File attached
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}