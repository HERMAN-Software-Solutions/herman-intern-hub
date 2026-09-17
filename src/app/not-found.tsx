import Link from 'next/link'

export const metadata = {
  title: 'Page not found — HERMAN Intern Hub',
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl font-bold text-slate-200 mb-4">404</div>
        <h1 className="text-2xl font-bold text-slate-900">
          Page not found
        </h1>
        <p className="text-slate-600 mt-3">
          The page you&apos;re looking for doesn&apos;t exist or has moved.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            Go home
          </Link>
          <Link
            href="/apply"
            className="border border-slate-300 hover:border-slate-500 text-slate-700 font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            Apply for internship
          </Link>
        </div>

        <p className="text-xs text-slate-400 mt-10">
          <Link href="/interns" className="hover:text-slate-600">
            Browse our interns
          </Link>
          {' · '}
          <Link href="/success-stories" className="hover:text-slate-600">
            Success stories
          </Link>
        </p>
      </div>
    </div>
  )
}