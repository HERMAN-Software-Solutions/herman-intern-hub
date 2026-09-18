import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ChevronLeft,
  Download,
  ExternalLink,
  FileText,
  Award,
  Mail,
  FileCheck,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/ui/page-header'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { DocumentActions } from './document-actions'

const TYPE_LABELS: Record<string, string> = {
  offer_letter: 'Offer Letter',
  agreement: 'Internship Agreement',
  certificate: 'Certificate of Internship',
  experience_letter: 'Experience Letter',
  other: 'Document',
}

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  offer_letter: FileText,
  agreement: FileCheck,
  certificate: Award,
  experience_letter: Mail,
  other: FileText,
}

export default async function AdminDocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: docRaw } = await supabase
    .from('documents')
    .select(
      `id, type, title, file_url, issued_date, certificate_id,
       performance_score, verified, created_at,
       intern:intern_id (id, full_name, email, avatar_url, university, course)`
    )
    .eq('id', id)
    .maybeSingle()

  if (!docRaw) notFound()

  const internRaw = docRaw.intern as any
  const intern = Array.isArray(internRaw) ? internRaw[0] : internRaw

  const doc = { ...docRaw, intern }

  // Get a signed URL for the file (valid 1 hour)
  const { data: signed } = await supabase.storage
    .from('documents')
    .createSignedUrl(doc.file_url, 60 * 60)

  const Icon = TYPE_ICONS[doc.type] ?? FileText
  const verifyUrl = doc.certificate_id
    ? `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/verify/${doc.certificate_id}`
    : null

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
      <Link
        href="/admin/documents"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to documents
      </Link>

      <PageHeader
        title={doc.title ?? TYPE_LABELS[doc.type] ?? 'Document'}
        description={
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant={doc.verified === false ? 'danger' : 'success'}>
              {doc.verified === false ? (
                <>
                  <ShieldAlert className="w-3 h-3 mr-1" />
                  Revoked
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  Verified
                </>
              )}
            </Badge>
            <span className="text-xs text-slate-500">
              Issued {new Date(doc.issued_date).toLocaleDateString()}
            </span>
          </div>
        }
      />

      {/* Document info */}
      <Card className="mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon className="w-6 h-6 text-slate-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-slate-500 mb-1">
              {TYPE_LABELS[doc.type] ?? doc.type}
            </div>
            <div className="font-semibold text-slate-900">
              {doc.title ?? 'Untitled document'}
            </div>
            {doc.certificate_id && (
              <div className="text-xs font-mono text-slate-500 mt-1">
                ID: {doc.certificate_id}
              </div>
            )}
            {doc.performance_score != null && (
              <div className="text-xs text-slate-500 mt-1">
                Performance score:{' '}
                <strong>{Number(doc.performance_score).toFixed(1)} / 5.0</strong>
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 pt-5 border-t border-slate-100 flex flex-wrap gap-3">
          {signed?.signedUrl && (
            <>
              <a
                href={signed.signedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                View PDF
              </a>
              <a
                href={signed.signedUrl}
                download={`${doc.certificate_id ?? doc.id}.pdf`}
                className="inline-flex items-center gap-2 border border-slate-300 hover:border-slate-400 text-slate-700 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
              </a>
            </>
          )}
          {verifyUrl && doc.verified !== false && (
            <a
              href={verifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline px-2 py-2.5"
            >
              <ShieldCheck className="w-4 h-4" />
              View public verification
            </a>
          )}
        </div>
      </Card>

      {/* Intern info */}
      {intern && (
        <Card className="mb-6">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
            Issued to
          </h2>
          <div className="flex items-center gap-4">
            <Avatar
              name={intern.full_name}
              src={intern.avatar_url}
              size="lg"
            />
            <div className="min-w-0 flex-1">
              <Link
                href={`/admin/interns/${intern.id}`}
                className="font-medium text-slate-900 hover:text-blue-600 transition-colors"
              >
                {intern.full_name ?? '—'}
              </Link>
              <div className="text-sm text-slate-500">{intern.email}</div>
              {(intern.university || intern.course) && (
                <div className="text-xs text-slate-400 mt-1">
                  {[intern.university, intern.course]
                    .filter(Boolean)
                    .join(' · ')}
                </div>
              )}
            </div>
            <Link
              href={`/admin/interns/${intern.id}`}
              className="text-xs text-blue-600 hover:underline whitespace-nowrap"
            >
              View intern →
            </Link>
          </div>
        </Card>
      )}

      {/* Revoke/restore actions */}
      <DocumentActions
        documentId={doc.id}
        verified={doc.verified !== false}
        type={doc.type}
      />
    </div>
  )
}