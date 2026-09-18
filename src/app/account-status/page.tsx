import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  CheckCircle2,
  Pause,
  AlertTriangle,
  Download,
  FileText,
  Award,
  Mail,
  ArrowLeft,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { StandaloneLayout } from '@/components/layout/standalone-layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export const metadata = {
  title: 'Account Status — HERMAN Intern Hub',
}

const STATUS_CONFIG: Record<
  string,
  {
    icon: React.ComponentType<{ className?: string }>
    iconBg: string
    iconColor: string
    title: string
    body: string
  }
> = {
  paused: {
    icon: Pause,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    title: 'Your internship is paused',
    body: 'Your account is temporarily inactive. Contact your mentor or admin to resume.',
  },
  completed: {
    icon: CheckCircle2,
    iconBg: 'bg-green-50',
    iconColor: 'text-green-600',
    title: 'Congratulations!',
    body: 'Your internship is complete. You can still access your documents below.',
  },
  withdrawn: {
    icon: AlertTriangle,
    iconBg: 'bg-red-50',
    iconColor: 'text-red-600',
    title: 'Your internship has ended',
    body: 'You withdrew from the program. Contact admin if this is an error.',
  },
}

const DOC_LABELS: Record<string, string> = {
  offer_letter: 'Offer Letter',
  agreement: 'Internship Agreement',
  certificate: 'Certificate of Internship',
  experience_letter: 'Experience Letter',
  other: 'Document',
}

const DOC_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  offer_letter: FileText,
  agreement: FileText,
  certificate: Award,
  experience_letter: Mail,
  other: FileText,
}

export default async function AccountStatusPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, status, role, start_date, end_date')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  // If they're actually active, send them to their dashboard
  if (profile.status === 'active') {
    if (profile.role === 'mentor') redirect('/mentor')
    if (profile.role === 'admin' || profile.role === 'super_admin') {
      redirect('/admin')
    }
    redirect('/dashboard')
  }

  // If they're onboarding, send them to onboarding
  if (profile.status === 'onboarding') {
    redirect('/onboarding')
  }

  const config = STATUS_CONFIG[profile.status] ?? STATUS_CONFIG.paused
  const Icon = config.icon

  // Fetch their documents
  const { data: documents } = await supabase
    .from('documents')
    .select('id, type, title, file_url, issued_date, certificate_id, created_at')
    .eq('intern_id', user.id)
    .order('created_at', { ascending: false })

  // Generate signed URLs for each document
  const documentsWithUrls = await Promise.all(
    (documents ?? []).map(async (doc) => {
      const { data: signed } = await supabase.storage
        .from('documents')
        .createSignedUrl(doc.file_url, 60 * 60 * 24 * 7) // 7 days

      return {
        ...doc,
        signedUrl: signed?.signedUrl ?? null,
      }
    })
  )

  const displayName = profile.full_name?.split(' ')[0] ?? 'there'

  return (
    <StandaloneLayout>
      <div className="w-full max-w-2xl">
        {/* Status Card */}
        <Card padding="lg" className="text-center">
          <div
            className={`w-16 h-16 ${config.iconBg} rounded-full flex items-center justify-center mx-auto mb-5`}
          >
            <Icon className={`w-8 h-8 ${config.iconColor}`} />
          </div>

          <h1 className="text-2xl font-bold text-slate-900">{config.title}</h1>

          <p className="text-sm text-slate-600 mt-3 leading-relaxed max-w-md mx-auto">
            {config.body}
          </p>

          <div className="mt-6 inline-flex">
            <Badge
              variant={
                profile.status === 'completed'
                  ? 'success'
                  : profile.status === 'paused'
                    ? 'warning'
                    : 'danger'
              }
            >
              Status: {profile.status}
            </Badge>
          </div>

          {profile.start_date && profile.end_date && (
            <p className="text-xs text-slate-500 mt-4">
              Internship:{' '}
              {new Date(profile.start_date).toLocaleDateString()} —{' '}
              {new Date(profile.end_date).toLocaleDateString()}
            </p>
          )}
        </Card>

        {/* Documents Section (only for completed interns) */}
        {profile.status === 'completed' && documentsWithUrls.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-1">
              Your documents
            </h2>

            <div className="space-y-3">
              {documentsWithUrls.map((doc) => {
                const DocIcon = DOC_ICONS[doc.type] ?? FileText
                return (
                  <Card key={doc.id} className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <DocIcon className="w-5 h-5 text-slate-600" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-900 text-sm truncate">
                        {DOC_LABELS[doc.type] ?? 'Document'}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Issued{' '}
                        {new Date(doc.issued_date).toLocaleDateString()}
                        {doc.certificate_id && (
                          <>
                            {' '}
                            · ID: <span className="font-mono">{doc.certificate_id}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {doc.signedUrl ? (
                      <a
                        href={doc.signedUrl}
                        download
                        className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400">
                        Unavailable
                      </span>
                    )}
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* If completed but no documents found */}
        {profile.status === 'completed' && documentsWithUrls.length === 0 && (
          <Card className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              Your documents will appear here once they&apos;re issued. Contact
              admin if you believe this is an error.
            </p>
          </Card>
        )}

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-1.5 border border-slate-300 hover:border-slate-400 text-slate-700 font-medium px-4 py-2.5 rounded-lg transition-colors text-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to home
          </Link>

          <a
            href="mailto:infohermansoftware@gmail.com"
            className="inline-flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium px-4 py-2.5 rounded-lg transition-colors text-sm"
          >
            Contact admin
          </a>
        </div>
      </div>
    </StandaloneLayout>
  )
}