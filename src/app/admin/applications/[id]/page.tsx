import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { StatusBadge } from '../../_components/status-badge'
import { PageHeader } from '@/components/ui/page-header'
import { ApplicationActions } from './application-actions'

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: app } = await supabase
    .from('applications')
    .select('*')
    .eq('id', id)
    .single()

  if (!app) notFound()

  const { data: mentors } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .in('role', ['mentor', 'admin', 'super_admin'])
    .order('full_name')

  const { data: invitation } = await supabase
    .from('invitations')
    .select('id, token, status, expires_at, created_at')
    .eq('application_id', id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
      <Link
        href="/admin/applications"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to applications
      </Link>

      <PageHeader
        title={app.name}
        description={app.email}
        action={<StatusBadge status={app.status} />}
      />

      {app.phone && (
        <p className="text-sm text-slate-500 -mt-4 mb-6">{app.phone}</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-8">
        <Card title="Academic">
          <Row label="University" value={app.university} />
          <Row label="Course" value={app.course} />
          <Row label="Year" value={app.year_of_study} />
        </Card>

        <Card title="Interests">
          <Row
            label="Tech stack"
            value={(app.tech_stack_interest ?? []).join(', ') || '—'}
          />
          <Row
            label="Portfolio"
            value={
              app.portfolio_url ? (
                <a
                  href={app.portfolio_url}
                  className="text-blue-600 hover:underline break-all"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {app.portfolio_url}
                </a>
              ) : (
                '—'
              )
            }
          />
        </Card>
      </div>

      <Card title="Message" className="mt-6">
        <p className="text-sm text-slate-700 whitespace-pre-wrap">
          {app.message}
        </p>
      </Card>

      {invitation && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-blue-900">
                Invitation {invitation.status}
              </p>
              <p className="text-xs text-blue-700 mt-0.5">
                Created{' '}
                {new Date(invitation.created_at).toLocaleString()} · Expires{' '}
                {new Date(invitation.expires_at).toLocaleString()}
              </p>
            </div>
            <code className="text-xs bg-white border border-blue-200 px-2 py-1 rounded break-all">
              /invite/{invitation.token.slice(0, 12)}…
            </code>
          </div>
        </div>
      )}

      <div className="mt-8">
        <ApplicationActions
          applicationId={app.id}
          applicantName={app.name}
          applicantEmail={app.email}
          currentStatus={app.status}
          mentors={mentors ?? []}
          hasInvitation={!!invitation}
        />
      </div>
    </div>
  )
}

function Card({
  title,
  children,
  className = '',
}: {
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`bg-white border border-slate-200 rounded-xl p-6 ${className}`}>
      <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
        {title}
      </h2>
      {children}
    </div>
  )
}

function Row({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex justify-between py-1.5 border-b border-slate-100 last:border-0 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-900 text-right break-words max-w-[60%]">
        {value || '—'}
      </span>
    </div>
  )
}