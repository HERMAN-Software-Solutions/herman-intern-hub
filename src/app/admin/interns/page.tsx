import Link from 'next/link'
import { AlertTriangle, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { StatusBadge } from '../_components/status-badge'
import { EmptyState } from '@/components/ui/empty-state'
import { PageHeader } from '@/components/ui/page-header'
import { Card } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'onboarding', label: 'Onboarding' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
]

export const metadata = { title: 'Interns — HERMAN Admin' }

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
      `id, full_name, email, status, university, course, avatar_url,
       mentor:mentor_id (id, full_name, email),
       start_date, end_date`
    )
    .eq('role', 'intern')
    .eq('is_demo', false)
    .order('created_at', { ascending: false })

  if (activeFilter !== 'all') {
    query = query.eq('status', activeFilter)
  }

  const { data: interns } = await query

  const { data: allForCount } = await supabase
    .from('profiles')
    .select('status')
    .eq('role', 'intern')
    .eq('is_demo', false)

  const counts = {
    all: allForCount?.length ?? 0,
    onboarding:
      allForCount?.filter((i) => i.status === 'onboarding').length ?? 0,
    active: allForCount?.filter((i) => i.status === 'active').length ?? 0,
    completed:
      allForCount?.filter((i) => i.status === 'completed').length ?? 0,
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl">
      <PageHeader
        title="Interns"
        description="Manage interns, assign mentors, and track progress."
      />

      {/* Filter tabs */}
      <div className="flex gap-1 mb-6 border-b border-slate-200 overflow-x-auto">
        {FILTERS.map((f) => {
          const active = activeFilter === f.key
          return (
            <Link
              key={f.key}
              href={`/admin/interns?status=${f.key}`}
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

      {!interns || interns.length === 0 ? (
        <EmptyState
          icon="👥"
          title="No interns here"
          description="Once applications are approved, interns will appear here."
        />
      ) : (
        <>
          {/* Mobile: cards */}
          <div className="sm:hidden space-y-3">
            {interns.map((intern: any) => {
              const mentorRaw = intern.mentor
              const mentor = Array.isArray(mentorRaw)
                ? mentorRaw[0]
                : mentorRaw

              return (
                <Link
                  key={intern.id}
                  href={`/admin/interns/${intern.id}`}
                  className="block bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-400 transition-colors"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <Avatar
                      name={intern.full_name}
                      src={intern.avatar_url}
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-900 truncate">
                        {intern.full_name ?? '—'}
                      </div>
                      <div className="text-xs text-slate-500 truncate">
                        {intern.email}
                      </div>
                    </div>
                    <StatusBadge status={intern.status} />
                  </div>
                  <div className="text-xs text-slate-500 space-y-1">
                    {intern.university && <div>{intern.university}</div>}
                    <div className="flex items-center gap-1.5">
                      {mentor ? (
                        <span>
                          Mentor: {mentor.full_name ?? mentor.email}
                        </span>
                      ) : (
                        <>
                          <AlertTriangle className="w-3 h-3 text-amber-500" />
                          <span className="text-amber-700">
                            No mentor assigned
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>

          {/* Desktop: table */}
          <Card padding="none" className="hidden sm:block overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-left text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">University</th>
                  <th className="px-4 py-3">Mentor</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Period</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {interns.map((intern: any) => {
                  const mentorRaw = intern.mentor
                  const mentor = Array.isArray(mentorRaw)
                    ? mentorRaw[0]
                    : mentorRaw

                  return (
                    <tr
                      key={intern.id}
                      className="border-t border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar
                            name={intern.full_name}
                            src={intern.avatar_url}
                            size="sm"
                          />
                          <div>
                            <Link
                              href={`/admin/interns/${intern.id}`}
                              className="font-medium text-slate-900 hover:text-blue-600 transition-colors"
                            >
                              {intern.full_name ?? '—'}
                            </Link>
                            <div className="text-xs text-slate-500">
                              {intern.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {intern.university ?? '—'}
                        <div className="text-xs text-slate-400">
                          {intern.course}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {mentor ? (
                          mentor.full_name ?? mentor.email
                        ) : (
                          <span className="text-amber-600 text-xs font-medium inline-flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Not assigned
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
                      <td className="px-4 py-3 text-slate-300">
                        <ChevronRight className="w-4 h-4" />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>
  )
}