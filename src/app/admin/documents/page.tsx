import Link from 'next/link'
import {
  FileText,
  Award,
  Mail,
  FileCheck,
  ChevronRight,
  Search,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/ui/page-header'
import { EmptyState } from '@/components/ui/empty-state'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'

export const metadata = { title: 'Documents — HERMAN Admin' }

const TYPE_LABELS: Record<string, string> = {
  offer_letter: 'Offer Letter',
  agreement: 'Agreement',
  certificate: 'Certificate',
  experience_letter: 'Experience Letter',
  other: 'Other',
}

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  offer_letter: FileText,
  agreement: FileCheck,
  certificate: Award,
  experience_letter: Mail,
  other: FileText,
}

const TYPE_COLORS: Record<
  string,
  'default' | 'info' | 'success' | 'warning' | 'neutral'
> = {
  offer_letter: 'info',
  agreement: 'neutral',
  certificate: 'success',
  experience_letter: 'warning',
  other: 'default',
}

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'certificate', label: 'Certificates' },
  { key: 'experience_letter', label: 'Experience letters' },
  { key: 'agreement', label: 'Agreements' },
  { key: 'offer_letter', label: 'Offer letters' },
]

export default async function AdminDocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; q?: string }>
}) {
  const params = await searchParams
  const activeFilter = params.type ?? 'all'
  const search = params.q?.trim().toLowerCase() ?? ''

  const supabase = await createClient()

  // First, get all real (non-demo) intern IDs
  const { data: realInterns } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'intern')
    .eq('is_demo', false)

  const realInternIds = (realInterns ?? []).map((i) => i.id)

  // If there are no real interns, show empty state immediately
  if (realInternIds.length === 0) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl">
        <PageHeader
          title="Documents"
          description="All issued certificates, letters, and agreements."
        />

        <EmptyState
          icon="📄"
          title="No documents yet"
          description="Documents will appear here once you approve and onboard real interns, and issue them certificates or letters."
        />
      </div>
    )
  }

  let query = supabase
    .from('documents')
    .select(
      `id, type, title, file_url, issued_date, certificate_id,
       performance_score, verified, created_at,
       intern:intern_id (id, full_name, email, avatar_url)`
    )
    .in('intern_id', realInternIds) // 🔒 Only real interns
    .order('created_at', { ascending: false })

  if (activeFilter !== 'all') {
    query = query.eq('type', activeFilter)
  }

  const { data: documentsRaw } = await query

  const documents = (documentsRaw ?? [])
    .map((d: any) => {
      const internRaw = d.intern
      const intern = Array.isArray(internRaw) ? internRaw[0] : internRaw
      return { ...d, intern }
    })
    .filter((d) => {
      if (!search) return true
      const haystack = [
        d.intern?.full_name,
        d.intern?.email,
        d.certificate_id,
        d.title,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(search)
    })

  // Counts (real interns only)
  const { data: allDocs } = await supabase
    .from('documents')
    .select('type')
    .in('intern_id', realInternIds)

  const counts = {
    all: allDocs?.length ?? 0,
    certificate: allDocs?.filter((d) => d.type === 'certificate').length ?? 0,
    experience_letter:
      allDocs?.filter((d) => d.type === 'experience_letter').length ?? 0,
    agreement: allDocs?.filter((d) => d.type === 'agreement').length ?? 0,
    offer_letter:
      allDocs?.filter((d) => d.type === 'offer_letter').length ?? 0,
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl">
      <PageHeader
        title="Documents"
        description="All issued certificates, letters, and agreements."
      />

      {/* Search + filter */}
      <div className="mb-6 space-y-3">
        <form method="GET" className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="search"
            name="q"
            defaultValue={search}
            placeholder="Search by intern, email, or certificate ID…"
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 rounded-lg bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-colors"
          />
          {activeFilter !== 'all' && (
            <input type="hidden" name="type" value={activeFilter} />
          )}
        </form>

        <div className="flex gap-1 border-b border-slate-200 overflow-x-auto">
          {FILTERS.map((f) => {
            const active = activeFilter === f.key
            return (
              <Link
                key={f.key}
                href={`/admin/documents?type=${f.key}${search ? `&q=${encodeURIComponent(search)}` : ''}`}
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
      </div>

      {documents.length === 0 ? (
        <EmptyState
          icon="📄"
          title={
            search ? 'No documents match your search' : 'No documents here'
          }
          description={
            search
              ? 'Try a different keyword or clear the search.'
              : 'Documents will appear here once certificates and letters are issued to real interns.'
          }
        />
      ) : (
        <>
          {/* Mobile cards */}
          <div className="sm:hidden space-y-3">
            {documents.map((doc) => {
              const Icon = TYPE_ICONS[doc.type] ?? FileText
              return (
                <Link
                  key={doc.id}
                  href={`/admin/documents/${doc.id}`}
                  className="block bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-400 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-slate-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Badge
                          variant={TYPE_COLORS[doc.type] ?? 'default'}
                          size="sm"
                        >
                          {TYPE_LABELS[doc.type] ?? doc.type}
                        </Badge>
                        {doc.verified === false && (
                          <Badge variant="danger" size="sm">
                            Revoked
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm font-medium text-slate-900 truncate">
                        {doc.intern?.full_name ??
                          doc.intern?.email ??
                          'Unknown'}
                      </div>
                      {doc.certificate_id && (
                        <div className="text-xs text-slate-500 mt-0.5 font-mono truncate">
                          {doc.certificate_id}
                        </div>
                      )}
                      <div className="text-[11px] text-slate-400 mt-1">
                        Issued{' '}
                        {new Date(doc.issued_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>

          {/* Desktop table */}
          <Card padding="none" className="hidden sm:block overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-left text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Issued to</th>
                  <th className="px-4 py-3">Certificate ID</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Issued</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => {
                  const Icon = TYPE_ICONS[doc.type] ?? FileText
                  return (
                    <tr
                      key={doc.id}
                      className="border-t border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-slate-400" />
                          <Badge
                            variant={TYPE_COLORS[doc.type] ?? 'default'}
                            size="sm"
                          >
                            {TYPE_LABELS[doc.type] ?? doc.type}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar
                            name={doc.intern?.full_name}
                            src={doc.intern?.avatar_url}
                            size="sm"
                          />
                          <div className="min-w-0">
                            <Link
                              href={`/admin/interns/${doc.intern?.id}`}
                              className="font-medium text-slate-900 hover:text-blue-600 transition-colors truncate"
                            >
                              {doc.intern?.full_name ?? '—'}
                            </Link>
                            <div className="text-xs text-slate-500 truncate">
                              {doc.intern?.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-slate-500">
                        {doc.certificate_id ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {doc.performance_score != null
                          ? `${Number(doc.performance_score).toFixed(1)}/5.0`
                          : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {doc.verified === false ? (
                          <Badge variant="danger" size="sm">
                            <ShieldAlert className="w-3 h-3 mr-1" />
                            Revoked
                          </Badge>
                        ) : (
                          <Badge variant="success" size="sm">
                            <ShieldCheck className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                        {new Date(doc.issued_date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        <Link href={`/admin/documents/${doc.id}`}>
                          <ChevronRight className="w-4 h-4 hover:text-slate-500 transition-colors" />
                        </Link>
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