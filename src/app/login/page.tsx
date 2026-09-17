import Link from 'next/link'
import { LoginForm } from './login-form'

export const metadata = {
  title: 'Sign in — HERMAN Intern Hub',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top bar — logo + back link */}
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

      {/* Login form */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl font-bold text-slate-900">
                Welcome back
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Sign in to your HERMAN account
              </p>
            </div>
            <LoginForm />
          </div>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don&apos;t have an account?{' '}
            <Link
              href="/apply"
              className="text-blue-600 hover:underline font-medium"
            >
              Apply for an internship
            </Link>
          </p>
        </div>
      </main>

      {/* Small footer */}
      <footer className="py-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} HERMAN Software Solutions Limited
      </footer>
    </div>
  )
}