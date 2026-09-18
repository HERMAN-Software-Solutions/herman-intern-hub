import Link from 'next/link'
import { validateInvitation } from './actions'
import { AcceptForm } from './accept-form'
import { StandaloneLayout } from '@/components/layout/standalone-layout'

export const metadata = {
  title: 'Accept invitation — HERMAN Intern Hub',
}

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const result = await validateInvitation(token)

  return (
    <StandaloneLayout showBreadcrumbs={false}>
      <div className="w-full max-w-lg">
        {!result.valid ? (
          <InvitationError reason={result.reason} />
        ) : (
          <>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
              <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl font-bold text-slate-900">
                  Welcome{result.fullName ? `, ${result.fullName}` : ''}
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  You&apos;ve been invited to join HERMAN Software Solutions
                  as an intern. Set a password to activate your account.
                </p>
              </div>

              <AcceptForm
                token={token}
                email={result.email}
                fullName={result.fullName}
              />
            </div>

            <p className="text-center text-xs text-slate-500 mt-6">
              Wrong person? Contact{' '}
              <a
                href="mailto:infohermansoftware@gmail.com"
                className="text-blue-600 hover:underline"
              >
                infohermansoftware@gmail.com
              </a>
            </p>
          </>
        )}
      </div>
    </StandaloneLayout>
  )
}

function InvitationError({ reason }: { reason: string }) {
  const messages: Record<string, { title: string; body: string }> = {
    not_found: {
      title: 'Invitation not found',
      body: 'This invitation link is invalid or has already been used.',
    },
    expired: {
      title: 'Invitation expired',
      body: 'Invitations expire after 7 days. Please contact the admin to request a new one.',
    },
    used: {
      title: 'Invitation already used',
      body: 'This invitation has already been accepted. Try signing in instead.',
    },
    revoked: {
      title: 'Invitation revoked',
      body: 'This invitation was revoked by an administrator.',
    },
  }

  const m = messages[reason] ?? messages.not_found

  return (
    <div className="max-w-md w-full mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 text-center">
      <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <span className="text-2xl">⚠️</span>
      </div>
      <h1 className="text-xl font-bold text-slate-900">{m.title}</h1>
      <p className="text-sm text-slate-600 mt-3">{m.body}</p>
      <div className="mt-6 flex flex-col gap-2">
        <Link
          href="/login"
          className="bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 rounded-lg transition-colors"
        >
          Sign in instead
        </Link>
        <a
          href="mailto:infohermansoftware@gmail.com"
          className="text-sm text-slate-500 hover:text-slate-900"
        >
          Contact admin
        </a>
      </div>
    </div>
  )
}