import Link from 'next/link'
import { redirect } from 'next/navigation'
import { StandaloneLayout } from '@/components/layout/standalone-layout'

export const metadata = {
  title: 'Application received — HERMAN Intern Hub',
}

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string }>
}) {
  const params = await searchParams

  // Guard: only show this page if user came from the apply form
  if (params.submitted !== '1') {
    redirect('/apply')
  }

  return (
    <StandaloneLayout showBreadcrumbs={false}>
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
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
            Application received
          </h1>
          <p className="text-slate-600 mt-3">
            Thanks for applying to HERMAN Software Solutions. We&apos;ll
            review your application within 5 working days.
          </p>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-sm text-slate-500 mb-4">
              You can check your status anytime by entering your email.
            </p>

            <Link
              href="/apply/status"
              className="inline-block w-full bg-slate-900 hover:bg-slate-800 text-white font-medium px-5 py-2.5 rounded-lg transition-colors"
            >
              Check my status →
            </Link>
          </div>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Follow us at{' '}
          <a
            href="https://herman-software-website.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline font-medium"
          >
            herman-software-website.vercel.app
          </a>
        </p>
      </div>
    </StandaloneLayout>
  )
}