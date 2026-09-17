import Link from 'next/link'

export const metadata = {
  title: 'Application received — HERMAN Intern Hub',
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 group"
            aria-label="Back to HERMAN Intern Hub home"
          >
            <img
              src="/brand/logo.png"
              alt=""
              className="h-8 w-8 rounded object-contain"
            />
            <span className="text-base font-bold text-slate-900 tracking-tight group-hover:text-slate-700 transition-colors">
              HERMAN Intern Hub
            </span>
          </Link>

          <Link
            href="/"
            className="text-sm text-slate-500 hover:text-slate-900 transition-colors inline-flex items-center gap-1"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span className="hidden sm:inline">Back to home</span>
            <span className="sm:hidden">Back</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
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
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} HERMAN Software Solutions Limited
      </footer>
    </div>
  )
}