import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { StatusBadge } from '../_components/status-badge'
import { EmptyState } from '@/components/ui/empty-state'
import { PageHeader } from '@/components/ui/page-header'
import { Card } from '@/components/ui/card'
import { ExportButton } from '@/components/admin/export-button'

const FILTERS = [
  { key: 'pending', label: 'Pending' },
  { key: 'reviewing', label: 'Reviewing' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'all', label: 'All' },
]

export const metadata = { title: 'Applications — HERMAN Admin' }

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const params = await searchParams
  const activeFilter = params.status ?? 'pending'
  const supabase = await createClient()

  let query = supabase
    .from('applications')
    .select(
      'id, name, email, university, course, tech_stack_interest, status, submitted_at'
    )
    .order('submitted_at', { ascending: false })

  if (activeFilter !== 'all') {
    query = query.eq('status', activeFilter)
  }

  const { data: applications } = await query

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl">
      <PageHeader
        title="Applications"
        description="Review and approve incoming applications."
        action={
          <ExportButton
            href={`/api/admin/export/applications?status=${activeFilter}`}
          />
        }
      />

      {/* Filter tabs */}
      <div className="flex gap-1 mb-6 border-b border-slate-200 overflow-x-auto">
        {FILTERS.map((f) => {
          const active = activeFilter === f.key
          return (
            <Link
              key={f.key}
              href={`/admin/applications?status=${f.key}`}
              className={`px-4 py-2 text-sm border-b-2 whitespace-nowrap transition-colors ${
                active
                  ? 'border-slate-900 text-slate-900 font-medium'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {f.label}
            </Link>
          )
        })}
      </div>

      {!applications || applications.length === 0 ? (
        <EmptyState
          icon="📥"
          title="No applications here"
          description="When someone applies via the public form, they'll appear here for review."
        />
      ) : (
        <>
          <div className="sm:hidden space-y-3">
            {applications.map((app) => (
              <Link
                key={app.id}
                href={`/admin/applications/${app.id}`}
                className="block bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-400 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <div className="font-medium text-slate-900 truncate">
                      {app.name}
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      {app.email}
                    </div>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
                <div className="text-xs text-slate-500 mt-2">
                  {app.university}
                  {app.course && ` · ${app.course}`}
                </div>
                <div className="text-[11px] text-slate-400 mt-2">
                  {new Date(app.submitted_at).toLocaleDateString()}
                </div>
              </Link>
            ))}
          </div>

          <Card padding="none" className="hidden sm:block overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-left text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Applicant</th>
                  <th className="px-4 py-3">University</th>
                  <th className="px-4 py-3">Tech interest</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Submitted</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr
                    key={app.id}
                    className="border-t border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/applications/${app.id}`}
                        className="font-medium text-slate-900 hover:text-blue-600 transition-colors"
                      >
                        {app.name}
                      </Link>
                      <div className="text-xs text-slate-500">{app.email}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {app.university}
                      <div className="text-xs text-slate-400">{app.course}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(app.tech_stack_interest ?? [])
                          .slice(0, 3)
                          .map((t: string) => (
                            <span
                              key={t}
                              className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded"
                            >
                              {t}
                            </span>
                          ))}
                        {(app.tech_stack_interest ?? []).length > 3 && (
                          <span className="text-xs text-slate-400">
                            +{app.tech_stack_interest.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {new Date(app.submitted_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      <ChevronRight className="w-4 h-4" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>
  )
}