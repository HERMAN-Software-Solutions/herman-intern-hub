import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { StatusBadge } from '../_components/status-badge'

const ROLE_BADGES: Record<string, string> = {
  onboarding: 'bg-amber-100 text-amber-800',
  active: 'bg-green-100 text-green-800',
  paused: 'bg-slate-100 text-slate-600',
  completed: 'bg-blue-100 text-blue-800',
  withdrawn: 'bg-red-100 text-red-800',
}

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'onboarding', label: 'Onboarding' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
]

export default async function InternsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const params = await searchParams
  const activeFilter = params.status ?? 'all'
  const supabase = await createClient()

  let query = supabase
    .from('profiles')
    .select(
      `id, full_name, email, status, university, course,
       mentor:mentor_id (id, full_name, email),
       start_date, end_date`
    )
    .eq('role', 'intern')
    .order('created_at', { ascending: false })

  if (activeFilter !== 'all') {
    query = query.eq('status', activeFilter)
  }

  const { data: interns } = await query

  // Counts for each tab
  const { data: allForCount } = await supabase
    .from('profiles')
    .select('status')
    .eq('role', 'intern')

  const counts = {
    all: allForCount?.length ?? 0,
    onboarding: allForCount?.filter((i) => i.status === 'onboarding').length ?? 0,
    active: allForCount?.filter((i) => i.status === 'active').length ?? 0,
    completed: allForCount?.filter((i) => i.status === 'completed').length ?? 0,
  }

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Interns</h1>
        <p className="text-slate-500 mt-1">
          Manage interns, assign mentors, and track progress.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-6 border-b border-slate-200">
        {FILTERS.map((f) => {
          const active = activeFilter === f.key
          return (
            <Link
              key={f.key}
              href={`/admin/interns?status=${f.key}`}
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
      {!interns || interns.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <p className="text-slate-500">No interns here yet.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-left text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">University</th>
                <th className="px-4 py-3">Mentor</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Period</th>
              </tr>
            </thead>
            <tbody>
              {interns.map((intern: any) => (
                <tr
                  key={intern.id}
                  className="border-t border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/interns/${intern.id}`}
                      className="font-medium text-slate-900 hover:text-blue-600"
                    >
                      {intern.full_name ?? '—'}
                    </Link>
                    <div className="text-xs text-slate-500">{intern.email}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {intern.university ?? '—'}
                    <div className="text-xs text-slate-400">
                      {intern.course}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {intern.mentor ? (
                      intern.mentor.full_name ?? intern.mentor.email
                    ) : (
                      <span className="text-amber-600 text-xs font-medium">
                        ⚠ Not assigned
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={intern.status} />
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {intern.start_date && intern.end_date
                      ? `${new Date(intern.start_date).toLocaleDateString()} → ${new Date(intern.end_date).toLocaleDateString()}`
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}