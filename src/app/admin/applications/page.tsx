import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { EmptyState } from '@/components/ui/empty-state'
import { PageHeader } from '@/components/ui/page-header'
import { ExportButton } from '@/components/admin/export-button'
import { ApplicationsClient } from './applications-client'

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
        <ApplicationsClient applications={applications} />
      )}
    </div>
  )
}