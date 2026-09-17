import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { StandaloneLayout } from '@/components/layout/standalone-layout'

export const metadata = {
  title: 'Verify Certificate — HERMAN Software Solutions',
}

const BAND_COLORS: Record<string, string> = {
  Excellent: 'text-green-600',
  'Very Good': 'text-blue-600',
  Good: 'text-amber-600',
  Satisfactory: 'text-orange-600',
  'Needs Improvement': 'text-red-600',
}

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ certificateId: string }>
}) {
  const { certificateId } = await params
  const supabase = createAdminClient()

  const { data: doc } = await supabase
    .from('documents')
    .select(
      `id, type, title, certificate_id, performance_score, issued_date,
       intern:intern_id (full_name, email, university, course)`
    )
    .eq('certificate_id', certificateId)
    .eq('type', 'certificate')
    .maybeSingle()

  return (
    <StandaloneLayout>
      <div className="w-full max-w-lg">
        {!doc ? (
          <NotFoundView certificateId={certificateId} />
        ) : (
          <VerifiedView doc={doc} />
        )}
      </div>
    </StandaloneLayout>
  )
}

function VerifiedView({ doc }: { doc: any }) {
  const internRaw = doc.intern
  const intern = Array.isArray(internRaw) ? internRaw[0] : internRaw

  const score = Number(doc.performance_score ?? 0)
  const band =
    score >= 4.5
      ? 'Excellent'
      : score >= 3.5
        ? 'Very Good'
        : score >= 2.5
          ? 'Good'
          : score >= 1.5
            ? 'Satisfactory'
            : 'Needs Improvement'

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">
          Certificate verified
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          This certificate is authentic and was issued by HERMAN Software
          Solutions Limited.
        </p>
      </div>

      <div className="space-y-3 pt-6 border-t border-slate-200">
        <Row
          label="Certificate ID"
          value={doc.certificate_id ?? '—'}
          mono
        />
        <Row
          label="Issued to"
          value={intern?.full_name ?? intern?.email ?? '—'}
        />
        {intern?.university && (
          <Row label="University" value={intern.university} />
        )}
        <Row
          label="Issued on"
          value={new Date(doc.issued_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        />
        <Row
          label="Performance"
          value={
            <span className={`font-semibold ${BAND_COLORS[band] ?? ''}`}>
              {band} ({score.toFixed(1)} / 5.0)
            </span>
          }
        />
      </div>

      <div className="mt-8 pt-6 border-t border-slate-200 text-center text-xs text-slate-500">
        HERMAN Software Solutions Limited
        <br />
        Jinja, Gabula Rd, Uganda
        <br />
        infohermansoftware@gmail.com · +256 772 723 188
      </div>
    </div>
  )
}

function NotFoundView({ certificateId }: { certificateId: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 text-center">
      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <span className="text-3xl">⚠️</span>
      </div>
      <h1 className="text-xl font-bold text-slate-900">
        Certificate not found
      </h1>
      <p className="text-sm text-slate-600 mt-3">
        We couldn&apos;t verify the certificate with ID:
      </p>
      <code className="block mt-3 text-xs bg-slate-50 border border-slate-200 p-3 rounded font-mono break-all">
        {certificateId}
      </code>
      <p className="text-xs text-slate-500 mt-4">
        If you believe this is an error, contact us at{' '}
        <a
          href="mailto:infohermansoftware@gmail.com"
          className="text-blue-600 hover:underline"
        >
          infohermansoftware@gmail.com
        </a>
      </p>
    </div>
  )
}

function Row({
  label,
  value,
  mono,
}: {
  label: string
  value: React.ReactNode
  mono?: boolean
}) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-slate-500">{label}</span>
      <span
        className={`text-slate-900 text-right font-medium ${
          mono ? 'font-mono text-xs' : ''
        }`}
      >
        {value}
      </span>
    </div>
  )
}