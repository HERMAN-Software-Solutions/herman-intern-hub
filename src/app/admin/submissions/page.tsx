import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

const SUBMISSION_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-green-100 text-green-800',
  needs_revision: 'bg-red-100 text-red-800',
}

const FILTERS = [
  { key: 'pending', label: 'Pending' },
  { key: 'needs_revision', label: 'Needs revision' },
  { key: 'approved', label: 'Approved' },
  { key: 'all', label: 'All' },
]

export const metadata = { title: 'Submissions — HERMAN Admin' }

export default async function SubmissionsPage({
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
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isSuperAdmin = profile?.role === 'super_admin'
  const isAdmin = profile?.role === 'admin'

  let query = supabase
    .from('submissions')
    .select(
      `id, content, file_url, status, submitted_at,
       intern:intern_id (id, full_name, email, mentor_id),
       task:task_id (id, title, project:project_id (title))`
    )
    .order('submitted_at', { ascending: false })

  if (activeFilter !== 'all') {
    query = query.eq('status', activeFilter)
  }

  const { data: submissions } = await query

  // Counts
  const { data: allSubs } = await supabase
    .from('submissions')
    .select('status')

  const counts = {
    all: allSubs?.length ?? 0,
    pending: allSubs?.filter((s) => s.status === 'pending').length ?? 0,
    approved: allSubs?.filter((s) => s.status === 'approved').length ?? 0,
    needs_revision:
      allSubs?.filter((s) => s.status === 'needs_revision').length ?? 0,
  }

  // Filter to mentor's own interns (unless admin)
  const filtered = (submissions ?? []).filter((s: any) => {
    if (isSuperAdmin || isAdmin) return true
    const internRaw = s.intern
    const intern = Array.isArray(internRaw) ? internRaw[0] : internRaw
    return intern?.mentor_id === user.id
  })

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Submissions</h1>
        <p className="text-slate-500 mt-1">
          Review work submitted by your interns.
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-1 mb-6 border-b border-slate-200">
        {FILTERS.map((f) => {
          const active = activeFilter === f.key
          return (
            <Link
              key={f.key}
              href={`/admin/submissions?status=${f.key}`}
              className={`px-4 py-2 text-sm border-b-2 transition-colors ${
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

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <p className="text-slate-500">No submissions here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((sub: any) => {
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
                href={`/admin/submissions/${sub.id}`}
                className="block bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-400 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                          SUBMISSION_COLORS[sub.status] ??
                          'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {sub.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(sub.submitted_at).toLocaleString()}
                      </span>
                    </div>

                    <div className="mt-3">
                      <div className="font-medium text-slate-900">
                        {task?.title ?? 'Untitled task'}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {intern?.full_name ?? intern?.email ?? 'Unknown intern'}
                        {project?.title && <> · {project.title}</>}
                      </div>
                    </div>

                    <p className="text-sm text-slate-600 mt-3 line-clamp-2">
                      {sub.content}
                    </p>

                    {sub.file_url && (
                      <div className="text-xs text-blue-600 mt-2">
                        📎 File attached
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