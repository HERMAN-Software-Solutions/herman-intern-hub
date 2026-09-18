'use client'

import { EmptyState } from '@/components/ui/empty-state'

type Doc = {
  id: string
  type: string
  title: string | null
  file_url: string
  issued_date: string
  certificate_id: string | null
  performance_score: number | null
  created_at: string
  signedUrl: string | null
}

const TYPE_LABELS: Record<string, string> = {
  offer_letter: 'Offer Letter',
  agreement: 'Internship Agreement',
  certificate: 'Certificate of Internship',
  experience_letter: 'Experience Letter',
  other: 'Other Document',
}

const TYPE_ICONS: Record<string, string> = {
  offer_letter: '📄',
  agreement: '📝',
  certificate: '🎓',
  experience_letter: '✉️',
  other: '📎',
}

export function DocumentList({ documents }: { documents: Doc[] }) {
  if (documents.length === 0) {
  return (
    <EmptyState
      icon="📁"
      title="No documents yet"
      description="Your offer letter, internship agreement, certificates, and experience letters will appear here as they're issued."
    />
  )
}

  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4"
        >
          <div className="text-3xl flex-shrink-0">
            {TYPE_ICONS[doc.type] ?? '📎'}
          </div>

          <div className="flex-1 min-w-0">
            <div className="font-medium text-slate-900">
              {doc.title ?? TYPE_LABELS[doc.type] ?? doc.type}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {TYPE_LABELS[doc.type] ?? doc.type}
              {' · '}
              Issued {new Date(doc.issued_date).toLocaleDateString()}
              {doc.certificate_id && (
                <> · ID: {doc.certificate_id}</>
              )}
              {doc.performance_score != null && (
                <> · Score: {doc.performance_score}/5.0</>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {doc.signedUrl ? (
              <>
                <a
                  href={doc.signedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-slate-700 hover:text-slate-900 font-medium px-3 py-1.5 border border-slate-300 rounded-lg hover:border-slate-500 transition-colors"
                >
                  View
                </a>
                <a
                  href={doc.signedUrl}
                  download={`${doc.certificate_id ?? doc.id}.pdf`}
                  className="text-sm text-white bg-slate-900 hover:bg-slate-800 font-medium px-3 py-1.5 rounded-lg transition-colors"
                >
                  Download
                </a>
              </>
            ) : (
              <span className="text-xs text-slate-400">
                Link unavailable
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}