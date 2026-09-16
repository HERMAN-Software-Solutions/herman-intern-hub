import Link from 'next/link'

export const metadata = {
  title: 'Application received — HERMAN Intern Hub',
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-slate-900">
          Application received
        </h1>
        <p className="text-slate-600 mt-3">
          Thanks for applying to HERMAN Software Solutions. We'll review your
          application within 5 working days.
        </p>

        <p className="text-sm text-slate-500 mt-6">
          You can check your status anytime by entering your email.
        </p>

        <Link
          href="/apply/status"
          className="inline-block mt-6 bg-slate-900 hover:bg-slate-800 text-white font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          Check my status →
        </Link>
      </div>
    </div>
  )
}