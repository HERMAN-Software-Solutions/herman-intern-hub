import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { StatusBadge } from '../../_components/status-badge'
import { PageHeader } from '@/components/ui/page-header'
import { MentorAssignment } from './mentor-assignment'
import { IssueButton } from './issue-certificate/issue-button'

export default async function InternDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: intern } = await supabase
    .from('profiles')
    .select(
      `id, full_name, email, phone, role, status, bio,
       university, course, year_of_study,
       start_date, end_date, mentor_id,
       agreement_signed_at, mentor_assigned_at,
       approved_at, created_at,
       directory_visible`
    )
    .eq('id', id)
    .eq('role', 'intern')
    .single()

  if (!intern) notFound()

  let currentMentor = null
  if (intern.mentor_id) {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('id', intern.mentor_id)
      .single()
    currentMentor = data
  }

  const { data: mentors } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .in('role', ['mentor', 'admin', 'super_admin'])
    .neq('id', intern.id)
    .order('full_name')

  const canActivate =
    !!intern.full_name &&
    !!intern.university &&
    !!intern.agreement_signed_at &&
    intern.status === 'onboarding'

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
      <Link
        href="/admin/interns"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to interns
      </Link>

      <PageHeader
        title={intern.full_name ?? 'Unnamed intern'}
        description={intern.email}
        action={<StatusBadge status={intern.status} />}
      />

      {intern.phone && (
        <p className="text-sm text-slate-500 -mt-4 mb-6">{intern.phone}</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-8">
        <Card title="Academic">
          <Row label="University" value={intern.university} />
          <Row label="Course" value={intern.course} />
          <Row label="Year" value={intern.year_of_study} />
        </Card>

        <Card title="Internship">
          <Row
            label="Start date"
            value={
              intern.start_date
                ? new Date(intern.start_date).toLocaleDateString()
                : '—'
            }
          />
          <Row
            label="End date"
            value={
              intern.end_date
                ? new Date(intern.end_date).toLocaleDateString()
                : '—'
            }
          />
          <Row
            label="Agreement signed"
            value={
              intern.agreement_signed_at
                ? new Date(intern.agreement_signed_at).toLocaleDateString()
                : 'Not signed'
            }
          />
          <Row
            label="Directory"
            value={intern.directory_visible ? 'Visible' : 'Hidden'}
          />
        </Card>
      </div>

      {intern.bio && (
        <Card title="Bio" className="mt-6">
          <p className="text-sm text-slate-700 whitespace-pre-wrap">
            {intern.bio}
          </p>
        </Card>
      )}

      <div className="mt-6">
        <MentorAssignment
          internId={intern.id}
          currentMentor={currentMentor}
          mentors={mentors ?? []}
          canActivate={canActivate}
        />
      </div>

      <Card title="Performance review" className="mt-6">
        <p className="text-sm text-slate-600 mb-4">
          Complete the performance review before issuing a certificate.
        </p>
        <Link
          href={`/admin/interns/${intern.id}/review`}
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium px-4 py-2.5 rounded-lg transition-colors text-sm"
        >
          Open review form
        </Link>
      </Card>

      {(intern.status === 'completed' || intern.status === 'active') && (
        <Card title="Certificate" className="mt-6">
          <p className="text-sm text-slate-600 mb-4">
            Issue a certificate of internship and experience letter as PDFs.
            Requires a completed performance review.
          </p>
          <IssueButton internId={intern.id} />
        </Card>
      )}

      <Card title="Activation checklist" className="mt-6">
        <ul className="space-y-2 text-sm">
          <Check done={!!intern.full_name} label="Full name set" />
          <Check done={!!intern.university} label="University set" />
          <Check
            done={!!intern.agreement_signed_at}
            label="Agreement signed"
          />
          <Check done={!!intern.mentor_id} label="Mentor assigned" />
          <Check
            done={intern.status === 'active'}
            label="Status: active"
            highlight
          />
        </ul>

        {intern.status !== 'active' && !canActivate && (
          <div className="mt-4 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
            ⚠️ The intern must complete onboarding before activation.
          </div>
        )}
      </Card>
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
      <span className="text-slate-900 text-right">{value || '—'}</span>
    </div>
  )
}

function Check({
  done,
  label,
  highlight,
}: {
  done: boolean
  label: string
  highlight?: boolean
}) {
  return (
    <li className="flex items-center gap-2">
      <span
        className={`w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
          done ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-400'
        }`}
      >
        {done ? '✓' : ''}
      </span>
      <span
        className={
          highlight
            ? done
              ? 'font-medium text-green-700'
              : 'font-medium text-slate-500'
            : done
              ? 'text-slate-700'
              : 'text-slate-500'
        }
      >
        {label}
      </span>
    </li>
  )
}